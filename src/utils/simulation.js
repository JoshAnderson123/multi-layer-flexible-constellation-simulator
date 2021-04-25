import { stochasticScenarios, deterministicScenario } from './models/demandModel'
import { calcLaunchCost } from './models/costModel'
import { maxMinDemand } from './models/demandModel'
import { calcFirstArc, ceil, count, deepCopy, formatxFlex, ln, max, round } from './utilGeneral'
import { b } from './models/costModel'


/**
 * Creates a simulation object which can run different scenarios
 * @param {object} inputs Input parameters
 * @return {object} Simulation object
 */
export function createSimulation(inputs, arcs) {

  const { T, μ, steps, start, r, capMax } = inputs
  const numScenarios = inputs.σ === 0 ? 1 : inputs.numScenarios
  const σ = scaleTheta(inputs.σ)

  const simulation = {}
  const [detScenario, detFinal] = deterministicScenario(T, μ, start, steps)
  const scenarios = stochasticScenarios(T, μ, σ, start, steps, numScenarios, detFinal)
  let testScenario = pickTestScenario()
  const dt = T / steps
  const discountArr = Array(steps + 1).fill().map((_, i) => 1 / (1 + r) ** (dt * i))
  let L = {}
  if (arcs) L = createLearningFactorDict(arcs)

  simulation.inputs = inputs
  simulation.deterministicScenario = detScenario
  simulation.stochasticScenarios = scenarios
  simulation.runTrad = tradespace => runTrad(tradespace)
  simulation.runTradVisual = xTrad => runTradVisual(xTrad)
  simulation.runFlex = (tradespace, flexStratInputs) => runFlex(tradespace, flexStratInputs)
  simulation.runFlex2 = (tradespace, flexStratInputs) => runFlex2(tradespace, flexStratInputs)
  simulation.runFlexVisual = (family, flexStratInputs) => runFlexVisual(family, flexStratInputs)
  simulation.runFlexVisual2 = (family, flexStratInputs) => runFlexVisual2(family, flexStratInputs)
  simulation.maxMinDemand = () => maxMinDemand(scenarios)
  simulation.expectedDemand = () => detFinal
  simulation.L = L

  return simulation

  // LOCAL FUNCTIONS

  /**
 * Runs the fixed strategy for each architecture and calculates LCC
 * @param {object} tradespace Tradespace of architectures
 * @param {object} inputs Simulation input parameters
 * @return {object} Tradespace with LCC for each architecture 
 */
  function runTrad(ts) {
    const tsf = deepCopy(ts)
    const dt = T / steps // # Steps / year

    for (let family of tsf) {   // For each fam in the ts
      for (let config of family.cfgs) {   // For each configuration in the fam
        let LCCarr = [config.costs.IDC + config.costs.PC + config.costs.LC] // Initial costs
        for (let t = 1; t < steps + 1; t++) LCCarr.push(config.costs.OC * dt) // Each step
        config.LCC = calcLCC(LCCarr, discountArr) // NPV
      }
      family.cfgs.sort((a, b) => a.LCC - b.LCC)
    }
    return tsf
  }



  function runTradVisual(xTrad) {

    const dt = T / steps // # Steps / year
    const cap = xTrad.cap

    const results = {
      demand: testScenario,
      capacity: new Array(steps).fill(cap),
      cost: [],
      evolutions: new Array(steps).fill({}),
      layers: new Array(steps).fill([{ e: xTrad.e, a: xTrad.a }]),
      family: xTrad
    }

    let LCCarr = [xTrad.costs.IDC + xTrad.costs.PC + xTrad.costs.LC] // Initial costs
    for (let t = 1; t < steps + 1; t++) LCCarr.push(xTrad.costs.OC * dt) // Each step
    results.cost = discountLCCArr(LCCarr, discountArr) // NPV

    return results
  }


  /**
 * Runs a reconfiguration-only (single layer) flexible strategy for each architecture and calculates LCC
 * @param {object} tradespace Tradespace of architectures
 * @param {object} scenarios Stochastic demand scenarios
 * @param {object} inputs Simulation input parameters
 * @return {object} tradespace with expected LCC for each architecture 
 */
  function runFlex(tradespace, flexStratInputs) {

    const { J, Lm } = flexStratInputs // Extract flexible strategy inputs
    const tsFlexMulti = [] // Initialsie tradespace of families using the multi-layered flexible strategy
    const dt = T / steps // Calculate Time step (years)

    for (let family of tradespace) { // For each family in the tradespace

      if (maxCapacityOf(family) < capMax) continue // Discard a family if it never reaches capMax

      const OC = {} // Initialise Ongoing & Mantenance cost cache
      function combinedOC(layers) { // Setup optimised combined OC function for this family
        const n = calcTotalN(layers, family)
        if (n in OC) { return OC[n] }
        if (n in L) { OC[n] = family.recCosts['LOOS'] * L[n] * dt; return OC[n] }
        L[n] = n ** b
        OC[n] = family.recCosts['LOOS'] * L[n] * dt
        return OC[n]
      }

      const maxReconsPerSat = calcMaxExpReconsSat(J, Lm, family) // Calculate the expected number of reconfigurations for a single satellite

      let ELCC = 0 // Initialise expected LCC
      let avgR = 0 // Initialise average number of reconfigurations
      let avgN = 0 // Initialise average number of newLayers

      for (let demand of scenarios) { // Run through every demand scenario

        let layers = [calcFirstArc(start, family.cfgs).id] // Initialise list of current architecture IDs to ID of the starting arch (the architecture with the smallest capacity that is greater than the starting demand)
        let LCCarr = [startCosts(family, layers, maxReconsPerSat)] // Initialise the LCC array
        let recs = [] // Initialise the log of reconfigurations

        for (let t = 1; t < demand.length; t++) { // Run through the scenario

          let LCCstep = 0 // Initialise LCC for this step
          const totalCap = calcTotalCap(layers, family) // Calculate the total capacity of all layers

          if (totalCap < capMax && demand[t] > totalCap) { // If constellation should evolve

            // If a new layer should be added (NL evolution)
            if (numberOf(layers) < Lm) {
              const nl = chooseEvolutionNewLayer(family, layers, totalCap, J) // Calculate the best architecture to add
              layers.push(nl) // Add new layer to the constellation
              LCCstep += evolutionNLCosts(family, layers, maxReconsPerSat) // Add NL evolution cost to LCC
              avgN++
            }
            // If an existing layer should be reconfigured (Recon evolution)
            else {
              const bestRecon = chooseEvolutionReconMulti(family, layers, totalCap, J, recs, maxReconsPerSat) // Choose ID of best architecture to reconfigure to
              LCCstep += evolutionReconMultiCosts(family, layers[bestRecon.a], bestRecon.b, layers, maxReconsPerSat) // Add recon evolution cost to LCC    maxReconsPerSat - curR
              layers[bestRecon.a] = bestRecon.b // Reconfigure the chosen layer in the constellation
              avgR++
              recs.push(bestRecon.a)
            }
          }

          LCCstep += combinedOC(layers)
          LCCarr.push(LCCstep) // Add the costs of this step to the LCC array
        }
        ELCC += calcLCC(LCCarr, discountArr) // Discount the LCCs at every step, then sum them together, and add to the ELCC counter
      }

      ELCC /= scenarios.length // Divide by number of scenarios to get the expected LCC
      avgR = round(avgR / (scenarios.length * Lm), 4) // Divide by number of scenarios to get the average number of reconfigurations per scenario
      avgN = round(avgN / scenarios.length, 4)
      tsFlexMulti.push({ ...family, cfgs: family.cfgs, ELCC, avgR, avgN, Lm, J }) // Add this family and its ELCC to the final list
    }

    const xFlex = tsFlexMulti.reduce((lowest, fam) => fam.ELCC < lowest.ELCC ? fam : lowest, { ELCC: Infinity })
    return formatxFlex(xFlex)
  }


  function runFlex2(tradespace, flexStratInputs) {

    const { J, Lm } = flexStratInputs // Extract flexible strategy inputs
    const tsFlexMulti = [] // Initialsie tradespace of families using the multi-layered flexible strategy
    const dt = T / steps // Calculate Time step (years)

    for (let family of tradespace) { // For each family in the tradespace

      if (maxCapacityOf(family) < capMax) continue // Discard a family if it never reaches capMax

      const OC = {} // Initialise Ongoing & Mantenance cost cache
      function combinedOC(layers) { // Setup optimised combined OC function for this family
        const n = calcTotalN(layers, family)
        if (n in OC) { return OC[n] }
        if (n in L) { OC[n] = family.recCosts['LOOS'] * L[n] * dt; return OC[n] }
        L[n] = n ** b
        OC[n] = family.recCosts['LOOS'] * L[n] * dt
        return OC[n]
      }

      const evolutions = calcEvolutions(J, family, Lm)
      const maxReconsPerSat = calcMaxRecons(evolutions, Lm)
      let curEvl = 0 // Current evolution

      let ELCC = 0 // Initialise expected LCC
      let avgR = 0 // Initialise average number of reconfigurations
      let avgN = 0 // Initialise average number of newLayers

      for (let demand of scenarios) { // Run through every demand scenario

        let layers = [evolutions[0].id] // Initialise list of current architecture IDs to ID of the starting arch (the architecture with the smallest capacity that is greater than the starting demand)
        let LCCarr = [startCosts(family, layers, maxReconsPerSat)] // Initialise the LCC array

        console.log('------------')

        for (let t = 1; t < demand.length; t++) { // Run through the scenario

          let LCCstep = 0 // Initialise LCC for this step
          const totalCap = calcTotalCap(layers, family) // Calculate the total capacity of all layers

          if (totalCap < capMax && testScenario[t] > totalCap) { // If constellation should evolve
            curEvl++
            // if (curEvl > evolutions.length - 1) console.log('woops', evolutions, family, flexStratInputs)
            const evl = evolutions[curEvl]
            if (evl) {
              if (evl.type === 'NL') {
                LCCstep += evolutionNLCosts2(family, evl.id, layers, maxReconsPerSat)
                layers.push(evl.id)
                console.log('NL', layers)
                avgN++
              } else {
                LCCstep += evolutionReconMultiCosts(family, evl.from, evl.to, layers, maxReconsPerSat)
                layers[evl.layer] = evl.to
                console.log('recon', layers)
                avgR++
              }
            } else {
              if (curEvl === evolutions.length) console.log(Lm, totalCap, layers, evolutions, family.cfgs)
            }
          }

          LCCstep += combinedOC(layers)
          LCCarr.push(LCCstep) // Add the costs of this step to the LCC array
        }
        ELCC += calcLCC(LCCarr, discountArr) // Discount the LCCs at every step, then sum them together, and add to the ELCC counter
      }

      ELCC /= scenarios.length // Divide by number of scenarios to get the expected LCC
      avgR = round(avgR / (scenarios.length * Lm), 4) // Divide by number of scenarios to get the average number of reconfigurations per scenario
      avgN = round(avgN / scenarios.length, 4)
      tsFlexMulti.push({ ...family, cfgs: family.cfgs, ELCC, avgR, avgN, Lm, J }) // Add this family and its ELCC to the final list
    }

    const xFlex = tsFlexMulti.reduce((lowest, fam) => fam.ELCC < lowest.ELCC ? fam : lowest, { ELCC: Infinity })
    return formatxFlex(xFlex)
  }


  function runFlexVisual(family, flexStratInputs) {

    const { J, Lm } = flexStratInputs // Extract flexible strategy inputs
    const dt = T / steps // Calculate Time step (years)

    const maxReconsPerSat = calcMaxExpReconsSat(J, Lm, family) // Calculate the expected number of reconfigurations for a single satellite

    const results = {
      demand: testScenario,
      capacity: [],
      cost: [],
      evolutions: [],
      layers: [],
      family,
      strat: { J, Lm },
      maxReconsPerSat
    }

    const OC = {} // Initialise Ongoing & Mantenance cost cache
    function combinedOC(layers) { // Setup optimised combined OC function for this family
      const n = calcTotalN(layers, family)
      if (n in OC) { return OC[n] }
      if (n in L) { OC[n] = family.recCosts['LOOS'] * L[n] * dt; return OC[n] }
      L[n] = n ** b
      OC[n] = family.recCosts['LOOS'] * L[n] * dt
      return OC[n]
    }

    let layers = [calcFirstArc(start, family.cfgs).id] // Initialise list of current architecture IDs to ID of the starting arch (the architecture with the smallest capacity that is greater than the starting demand)
    let LCCarr = [startCosts(family, layers, maxReconsPerSat)] // Initialise the LCC array
    let recs = [] // Initialise the log of reconfigurations

    for (let t = 1; t < testScenario.length; t++) { // Run through the scenario

      let LCCstep = 0 // Initialise LCC for this step
      const totalCap = calcTotalCap(layers, family) // Calculate the total capacity of all layers
      results.capacity.push(totalCap)
      results.layers.push(layers.map(layer => ({ e: family.cfgs[layer].e, a: family.cfgs[layer].a })))

      if (totalCap < capMax && testScenario[t] > totalCap) { // If constellation should evolve

        // If a new layer should be added (NL evolution)
        if (numberOf(layers) < Lm) {
          const nl = chooseEvolutionNewLayer(family, layers, totalCap, J) // Calculate the best architecture to add
          layers.push(nl) // Add new layer to the constellation
          LCCstep += evolutionNLCosts(family, layers, maxReconsPerSat) // Add NL evolution cost to LCC
          results.evolutions.push({ evolution: 'NL', layer: layers.length - 1 })
          console.log(nl)
        }
        // If an existing layer should be reconfigured (Recon evolution)
        else {
          const bestRecon = chooseEvolutionReconMulti(family, layers, totalCap, J, recs, maxReconsPerSat) // Choose ID of best architecture to reconfigure to
          LCCstep += evolutionReconMultiCosts(family, layers[bestRecon.a], bestRecon.b, layers, maxReconsPerSat) // Add recon evolution cost to LCC
          layers[bestRecon.a] = bestRecon.b // Reconfigure the chosen layer in the constellation
          results.evolutions.push({ evolution: 'recon', layer: bestRecon.a })
          recs.push(bestRecon.a)
          console.log(bestRecon.b)
        }
      } else {
        results.evolutions.push({})
      }

      LCCstep += combinedOC(layers)
      LCCarr.push(LCCstep) // Add the costs of this step to the LCC array
    }

    results.cost = discountLCCArr(LCCarr, discountArr)

    return results
  }


  function runFlexVisual2(family, flexStratInputs) {

    const { J, Lm } = flexStratInputs // Extract flexible strategy inputs
    const dt = T / steps // Calculate Time step (years)

    const evolutions = calcEvolutions(J, family, Lm)
    const maxReconsPerSat = calcMaxRecons(evolutions, Lm)
    let curEvl = 0 // Current evolution
    // const maxReconsPerSat = calcMaxExpReconsSat(J, Lm, family) // Calculate the expected number of reconfigurations for a single satellite

    const results = {
      demand: testScenario,
      capacity: [],
      cost: [],
      evolutions: [],
      layers: [],
      family,
      strat: { J, Lm },
      maxReconsPerSat
    }

    const OC = {} // Initialise Ongoing & Mantenance cost cache
    function combinedOC(layers) { // Setup optimised combined OC function for this family
      const n = calcTotalN(layers, family)
      if (n in OC) { return OC[n] }
      if (n in L) { OC[n] = family.recCosts['LOOS'] * L[n] * dt; return OC[n] }
      L[n] = n ** b
      OC[n] = family.recCosts['LOOS'] * L[n] * dt
      return OC[n]
    }

    let layers = [evolutions[0].id] // Initialise list of current architecture IDs to ID of the starting arch (the architecture with the smallest capacity that is greater than the starting demand)
    let LCCarr = [startCosts(family, layers, maxReconsPerSat)] // Initialise the LCC array

    for (let t = 1; t < testScenario.length; t++) { // Run through the scenario

      let LCCstep = 0 // Initialise LCC for this step
      const totalCap = calcTotalCap(layers, family) // Calculate the total capacity of all layers
      results.capacity.push(totalCap) // Add current capacity to capacity array
      results.layers.push(layers.map(layer => ({ e: family.cfgs[layer].e, a: family.cfgs[layer].a }))) // Add current constellation (layers) configuration to layers array

      if (totalCap < capMax && testScenario[t] > totalCap) { // If constellation should evolve
        curEvl++
        const evl = evolutions[curEvl]
        if (evl.type === 'NL') {
          LCCstep += evolutionNLCosts2(family, evl.id, layers, maxReconsPerSat)
          layers.push(evl.id)
        } else {
          LCCstep += evolutionReconMultiCosts(family, evl.from, evl.to, layers, maxReconsPerSat)
          layers[evl.layer] = evl.to
        }
        results.evolutions.push(evl)
      } else {
        results.evolutions.push({})
      }

      LCCstep += combinedOC(layers)
      LCCarr.push(LCCstep) // Add the costs of this step to the LCC array
    }

    results.cost = discountLCCArr(LCCarr, discountArr)

    return results
  }


  function maxCapacityOf(family) {
    return family.cfgs[family.cfgs.length - 1].cap
  }


  function numberOf(layers) {
    return layers.length
  }


  function newestLayer(arcs) {
    return arcs[arcs.length - 1]
  }


  function calcExpTotalRecons(J, family, Lm) { // Calculate the maximum expected reconfigurations in a demand scenario
    const f = calcFirstArc(start, family.cfgs)

    let count = 0
    for (let a = f.id + 1, cap = f.cap; a < family.cfgs.length - 1; a++) {
      if (cap * J > capMax) { count++; break; }
      if (family.cfgs[a].cap >= cap * J) { count++; cap = family.cfgs[a].cap; }
    }



    return count

    // let count = 0, a = firstArc.id
    // while (family.cfgs[a].cap < capMax) {
    //   for (let b = a + 1; b < family.cfgs.length; b++) {
    //     // console.log(`J = ${J}:`, a, b, family.cfgs[b].cap / family.cfgs[a].cap)
    //     if (family.cfgs[b].cap > family.cfgs[a].cap * J) { count++; a = b; break; }
    //   }
    //   // break; // If there isn't an architecture that is J bigger than current (The final reconfig has been reached)
    // }
    // return count

    // const maxRecons = family.cfgs.length - (firstArc.id + 1)
    // if (J === 1) return maxRecons // If J = 1, ln(J) will return an error. Return the max number of reconfigs (the number of configs in a family)
    // const expTemp = ln(capMax / firstArc.cap) / ln(J) // Calculate expected recons based on maxCap (Derivation based on exponential growth model) 
    // return Math.min(expTemp, maxRecons)  // Don't allow for more reconfigs then there are configurations available in a family
  }


  function calcEvolutions(J, fam, Lm) { // Calculate the maximum expected reconfigurations in a demand scenario

    const f = calcFirstArc(start, fam.cfgs)
    const layers = [f.id]
    const evolutions = [{ type: 'init', layer: 0, id: f.id }]
    let totalCap = calcTC()
    let maxRecons = null

    function evolve() {
      if (layers.length < Lm) addNewLayer()
      else reconfigure()
      totalCap = calcTC()
    }

    function addNewLayer() {
      const reqJ = calcRequiredCap(totalCap, J) // The required jump in capacity for the next evolution. E.g. 30,000 more channels are required to satisfy capJump
      let nl = 0
      for (let i = nl; i < fam.cfgs.length; i++) {
        nl = i
        if (sameAltitude(fam.cfgs, layers, nl)) continue
        if (fam.cfgs[nl].cap > reqJ) break
      }
      layers.push(nl)
      evolutions.push({ type: 'NL', layer: layers.length - 1, id: nl })
    }

    function reconfigure() {
      const reqJ = calcRequiredCap(totalCap, J)
      let optRecon = { cap: Infinity }
      for (let lid = 0; lid < layers.length; lid++) {

        let aid = layers[lid], bid = layers[lid] + 1
        for (let i = bid; i < fam.cfgs.length; i++) {
          bid = i
          if (sameAltitude(fam.cfgs, layers, i) || tooManyRecons(lid)) continue
          if (fam.cfgs[bid].cap - fam.cfgs[aid].cap > reqJ) break
        }
        optRecon = fam.cfgs[bid].cap < optRecon.cap ? { l: lid, a: aid, b: bid, cap: fam.cfgs[bid].cap } : optRecon
      }
      layers[optRecon.l] = optRecon.b
      evolutions.push({ type: 'recon', layer: optRecon.l, from: optRecon.a, to: optRecon.b })
    }

    function calcTC() {
      return layers.reduce((tc, layer) => tc + fam.cfgs[layer].cap, 0)
    }

    function tooManyRecons(lid) {
      maxRecons = maxRecons !== null ? maxRecons : calcMaxRecons()
      return reconsIn(lid) === maxRecons
    }

    function reconsIn(lid) {
      return evolutions.reduce((recs, evl) => evl.layer === lid ? recs + 1 : recs, 0)
    }

    function calcMaxRecons() {
      const maxTotalRecons = ln(capMax / totalCap) / ln(J)
      maxRecons = ceil(maxTotalRecons / Lm)
    }

    while (totalCap < capMax) {
      evolve()
    }

    return evolutions
  }


  function calcMaxExpReconsSat(J, Lm, family) {
    // Calculate the expected total number of reconfigurations for a demand scenario, using flexS
    const expTotalReconsSingle = calcExpTotalRecons(J, family)
    // Calculate the expected total number of reconfigurations for a demand scenario, using flexM at depLayers=0
    const expTotalReconsMulti = max(expTotalReconsSingle - (Lm - 1), 0)
    const expTotalReconsPerSat = expTotalReconsMulti / Lm
    // Calculate the maximum expected reconfiguration cost for a given satellite
    // Account for depLayers (E.g. if depLayers = 1 then it is the same as if it was a single layer for the entire simulation)
    return ceil(expTotalReconsPerSat)
  }


  function calcRequiredCap(totalCap, J) {
    if (totalCap * J > capMax) return capMax - totalCap
    return totalCap * (J - 1)
  }


  /**
 * Chooses the next architecture in a family to evolve to 
 * @param {object} family Family of architectures
 * @param {object} a Curent architecture ID
 * @param {object} inputs Simulation input parameters
 * @return {object} The ID for the next architecture to evolve to
 */
  function chooseEvolutionReconMulti(family, layers, totalCap, J, recs, maxReconsPerSat) { // Return a new constellation ID that fits the capacity jump criteria

    const reqCapJump = calcRequiredCap(totalCap, J) // The required jump in capacity for the next evolution. E.g. 30,000 more channels are required to satisfy capJump
    const testCapJump = (b, aID) => family.cfgs[b].cap - family.cfgs[layers[aID]].cap // The tested jump in capacity from arch a to b

    let bestRecon = { a: 0, b: 0, jump: Infinity }

    for (let aID = 0; aID < layers.length; aID++) { // a = index of architecture in layers

      if (count(recs, aID) === maxReconsPerSat) continue

      let b = layers[aID] + 1 // Start with the next evolution from layers[aID]

      while (betterEvolution(family, b, testCapJump(b, aID) < reqCapJump)) b++

      if (testCapJump(b, aID) < bestRecon.jump) bestRecon = { a: aID, b, jump: testCapJump(b, aID) }  // Update the best reconfiguration

    }

    return bestRecon
  }

  /**
* Chooses the next architecture in a family to evolve to 
* @param {object} family Family of architectures
* @param {object} a Curent architecture ID
* @param {object} inputs Simulation input parameters
* @return {object} The ID for the next architecture to evolve to
*/
  function chooseEvolutionNewLayer(family, layers, totalCap, J) { // Return a new constellation ID that fits the capacity jump criteria

    const reqCapJump = calcRequiredCap(totalCap, J) // The required jump in capacity for the next evolution. E.g. 30,000 more channels are required to satisfy capJump
    let nl = 0
    while (betterEvolution(family, nl, family.cfgs[nl].cap < reqCapJump || sameAltitude(family.cfgs, layers, nl))) nl++
    return nl
  }


  function calcTotalCap(layers, family) {
    if (layers.length === 1) return family.cfgs[layers[0]].cap
    return layers.reduce((cap, layerID) => cap + family.cfgs[layerID].cap, 0)
  }


  function calcTotalN(layers, family) {
    if (layers.length === 1) return family.cfgs[layers[0]].n
    return layers.reduce((n, arc) => n + family.cfgs[arc].n, 0)
  }


  function betterEvolution(family, b, criteria) {
    return (
      b < family.cfgs.length - 1 && // While the last architecture hasn't been reached
      family.cfgs[b].cap < capMax && // While the next arch hasn't reached capMax
      criteria // While reqCapJump criteria is not met (Next arch.cap - current arc.cap < reqCapJump)
    )
  }


  function startCosts(family, arcs, maxReconsPerSat) {
    const IDC = family.cfgs[arcs[0]].costs.IDC
    const PC = family.cfgs[arcs[0]].costs.PC
    const LC = family.cfgs[arcs[0]].costs.LC
    const RC = maxReconsPerSat * PC * inputs.reconCost
    return IDC + PC + LC + RC
  }


  /**
   * Calculates the cost to evolve between two architectures 
   * @param {object} family Family of architectures
   * @param {object} a Curent architecture ID
   * @param {object} b ID of next arhitecture to evolve to
   * @return {number} Cost ($M)
   */
  function evolutionNLCosts(family, arcs, maxReconsPerSat) {
    const newArch = family.cfgs[newestLayer(arcs)]
    const newSats = newArch.n
    const newTotalN = calcTotalN(arcs, family) // Total number of satellites after new layer

    const PC = (prodCostMulti(newTotalN, family) / newTotalN) * newSats
    const LC = calcLaunchCost(family.m.totalMass, newSats)
    const RC = maxReconsPerSat * PC * inputs.reconCost

    return PC + LC + RC
  }


  /**
 * Calculates the cost to evolve between two architectures 
 * @param {object} family Family of architectures
 * @param {object} a Curent architecture ID
 * @param {object} b ID of next arhitecture to evolve to
 * @return {number} Cost ($M)
 */
  function evolutionNLCosts2(family, id, layers, maxReconsPerSat) {
    const newArch = family.cfgs[id]
    const newSats = newArch.n
    const newTotalN = calcTotalN([...layers, id], family) // Total number of satellites after new layer

    const PC = (prodCostMulti(newTotalN, family) / newTotalN) * newSats
    const LC = calcLaunchCost(family.m.totalMass, newSats)
    const RC = maxReconsPerSat * PC * inputs.reconCost

    return PC + LC + RC
  }


  /**
* Calculates the cost to evolve between two architectures 
* @param {object} family Family of architectures
* @param {object} a Curent architecture ID
* @param {object} b ID of next arhitecture to evolve to
* @return {number} Cost ($M)
*/
  function evolutionReconMultiCosts(family, a, b, arcs, maxReconsPerSat) {

    const currArch = family.cfgs[a]
    const nextArch = family.cfgs[b]
    const newSats = nextArch.n - currArch.n
    const newTotalN = calcTotalN(arcs, family) + newSats // Total number of satellites after reconfiguration

    const PC = (prodCostMulti(newTotalN, family) / newTotalN) * newSats
    const LC = calcLaunchCost(family.m.totalMass, newSats)
    const RC = maxReconsPerSat * PC * inputs.reconCost

    return PC + LC + RC
  }


  /**
   * Calculates the total discounted LCC by discounting each element in the LCC array, then summing the discounted array
   * @param {number} LCCarr LCC Array
   * @param {number} discountArr Discount Array
   * @return {number} Total discounted LCC
   */
  function calcLCC(LCCarr, discountArr) {
    return round(LCCarr.reduce((LCC, _, step) => LCC + (LCCarr[step] * discountArr[step]), 0))
  }


  function discountLCCArr(LCCarr, discountArr) {
    return LCCarr.map((_, step) => round((LCCarr[step] * discountArr[step])))
  }


  function createLearningFactorDict(arcs) {
    const l = {}
    for (let family of arcs) {
      for (let cfg of family.cfgs) {
        if (l[cfg.n] === undefined) {
          l[cfg.n] = cfg.n ** b
        }
      }
    }
    return l
  }

  // Calculate Production Cost Component for Multi-Layer Strategy
  function prodCostMulti(n, family) {
    if (!(n in L)) L[n] = n ** b
    return family.prodCostSrc * L[n]
  }

  function pickTestScenario() {
    return scenarios[Math.floor(Math.random() * scenarios.length)]
  }

  function scaleTheta(σ) {
    // The demand model is deterministic when σ = 0.1
    // It is logically expected that determiniscity is achieved at σ = 0
    // This function scales theta to make the model deterministic at σ = 0
    if (σ < 0) return 0.1
    if (σ < 0.2) return (σ / 2) + 0.1
    return σ
  }

  function sameAltitude(cfgs, layers, nl) {
    for (let layer of layers) {
      if (cfgs[layer].a === cfgs[nl].a) return true
    }
    return false
  }

  function calcMaxRecons(evolutions, Lm) {
    const recons = evolutions.reduce((recs, evl) => {
      if (evl.type === 'recon') recs[evl.layer] += 1
      return recs
    }, new Array(Lm).fill(0))

    return max(...recons)
  }
}