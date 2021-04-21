import { stochasticScenarios, deterministicScenario } from './models/demandModel'
import { calcLaunchCost } from './models/costModel'
import { maxMinDemand } from './models/demandModel'
import { ceil, deepCopy, formatxFlex, ln, max, round } from './utilGeneral'
import { b } from './models/costModel'


/**
 * Creates a simulation object which can run different scenarios
 * @param {object} inputs Input parameters
 * @return {object} Simulation object
 */
export function createSimulation(inputs, arcs) {

  const { T, μ, σ, steps, start, numScenarios, r, capMax } = inputs
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
  simulation.runFlexVisual = (family, flexStratInputs) => runFlexVisual(family, flexStratInputs)
  simulation.maxMinDemand = () => maxMinDemand(scenarios)
  simulation.expectedDemand = () => detFinal
  simulation.pickTestScenario = () => { testScenario = pickTestScenario() }
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

    const { J, Lm, Ld } = flexStratInputs // Extract flexible strategy inputs
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

      const maxExpReconSat = calcMaxExpReconsSat(J, Lm, Ld, family) // Calculate the expected number of reconfigurations for a single satellite

      let ELCC = 0 // Initialise expected LCC
      let avgR = 0 // Initialise average number of reconfigurations
      let avgN = 0

      for (let demand of scenarios) { // Run through every demand scenario

        let layers = [startingArc(family)] // Initialise list of current architecture IDs to ID of the starting arch (the architecture with the smallest capacity that is greater than the starting demand)
        let LCCarr = [startCosts(family, layers, maxExpReconSat)] // Initialise the LCC array
        let curR = 0 // Initialise the current number of reconfigurations

        for (let t = 1; t < demand.length; t++) { // Run through the scenario

          let LCCstep = 0 // Initialise LCC for this step
          const totalCap = calcTotalCap(layers, family) // Calculate the total capacity of all layers

          if (totalCap < capMax && demand[t] > totalCap) { // If constellation should evolve

            // If a new layer should be added (NL evolution)
            if (numberOf(layers) < Lm && (t / steps) > Ld) {
              const nl = chooseEvolutionNewLayer(family, totalCap, J) // Calculate the best architecture to add
              layers.push(nl) // Add new layer to the constellation
              LCCstep += evolutionNLCosts(family, layers) // Add NL evolution cost to LCC
              avgN++
            }
            // If an existing layer should be reconfigured (Recon evolution)
            else {
              const bestRecon = chooseEvolutionReconMulti(family, layers, totalCap, J) // Choose ID of best architecture to reconfigure to
              LCCstep += evolutionReconMultiCosts(family, layers[bestRecon.a], bestRecon.b, layers, maxExpReconSat - curR) // Add recon evolution cost to LCC
              layers[bestRecon.a] = bestRecon.b // Reconfigure the chosen layer in the constellation
              avgR++
              curR++
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
      tsFlexMulti.push({ ...family, cfgs: family.cfgs, ELCC, avgR, avgN, Lm, Ld, J }) // Add this family and its ELCC to the final list
    }

    const xFlex = tsFlexMulti.reduce((lowest, fam) => fam.ELCC < lowest.ELCC ? fam : lowest, { ELCC: Infinity })
    return formatxFlex(xFlex)
  }



  function runFlexVisual(family, flexStratInputs) {

    const { J, Lm, Ld } = flexStratInputs // Extract flexible strategy inputs
    const dt = T / steps // Calculate Time step (years)

    const results = {
      demand: testScenario,
      capacity: [],
      cost: [],
      evolutions: [],
      layers: [],
      family,
      strat: {J, Lm, Ld}
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

    const maxExpReconSat = calcMaxExpReconsSat(J, Lm, Ld, family) // Calculate the expected number of reconfigurations for a single satellite

    let layers = [startingArc(family)] // Initialise list of current architecture IDs to ID of the starting arch (the architecture with the smallest capacity that is greater than the starting demand)
    let LCCarr = [startCosts(family, layers, maxExpReconSat)] // Initialise the LCC array
    let curR = 0 // Initialise the current number of reconfigurations

    for (let t = 1; t < testScenario.length; t++) { // Run through the scenario

      let LCCstep = 0 // Initialise LCC for this step
      const totalCap = calcTotalCap(layers, family) // Calculate the total capacity of all layers
      results.capacity.push(totalCap)
      results.layers.push(layers.map(layer => ({ e: family.cfgs[layer].e, a: family.cfgs[layer].a })))

      if (totalCap < capMax && testScenario[t] > totalCap) { // If constellation should evolve

        // If a new layer should be added (NL evolution)
        if (numberOf(layers) < Lm && (t / steps) > Ld) {
          const nl = chooseEvolutionNewLayer(family, totalCap, J) // Calculate the best architecture to add
          layers.push(nl) // Add new layer to the constellation
          LCCstep += evolutionNLCosts(family, layers) // Add NL evolution cost to LCC
          results.evolutions.push({ evolution: 'NL', layer: layers.length - 1 })
        }
        // If an existing layer should be reconfigured (Recon evolution)
        else {
          const bestRecon = chooseEvolutionReconMulti(family, layers, totalCap, J) // Choose ID of best architecture to reconfigure to
          LCCstep += evolutionReconMultiCosts(family, layers[bestRecon.a], bestRecon.b, layers, maxExpReconSat - curR) // Add recon evolution cost to LCC
          layers[bestRecon.a] = bestRecon.b // Reconfigure the chosen layer in the constellation
          results.evolutions.push({ evolution: 'recon', layer: bestRecon.a })
          curR++
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


  function maxCapacityOf(family) {
    return family.cfgs[family.cfgs.length - 1].cap
  }


  function numberOf(layers) {
    return layers.length
  }


  function startCosts(family, arcs, expectedRecons) {
    const IDC = family.cfgs[arcs[0]].costs.IDC
    const PC = family.cfgs[arcs[0]].costs.PC
    const LC = family.cfgs[arcs[0]].costs.LC
    const RC = (PC * inputs.reconCost) * expectedRecons
    return IDC + PC + LC + RC
  }


  function startingArc(family) {
    let a = 0
    while (family.cfgs[a].cap < start) a++
    return a
  }


  function newestLayer(arcs) {
    return arcs[arcs.length - 1]
  }


  function calcExpTotalRecons(J, family) { // Calculate the maximum expected reconfigurations in a demand scenario
    if (J === 1) return family.cfgs.length // If J = 1, ln(J) will return an error. Return the max number of reconfigs (the number of configs in a family)
    const expTemp = ln(capMax / start) / ln(J) // Calculate expected recons based on maxCap (Derivation based on exponential growth model) 
    return Math.min(expTemp, family.cfgs.length)  // Don't allow for more reconfigs then there are configurations available in a family
  }


  function calcMaxExpReconsSat(J, Lm, Ld, family) {
    // Calculate the expected total number of reconfigurations for a demand scenario, using flexS
    const expTotalReconsSingle = calcExpTotalRecons(J, family)
    // Calculate the expected total number of reconfigurations for a demand scenario, using flexM at depLayers=0
    const expTotalReconsMulti = expTotalReconsSingle / Lm
    // Calculate the maximum expected reconfiguration cost for a given satellite
    // Account for depLayers (E.g. if depLayers = 1 then it is the same as if it was a single layer for the entire simulation)
    const maxExpReconSat = ceil((expTotalReconsMulti * (1 - Ld)) + (expTotalReconsSingle * Ld))

    return maxExpReconSat
  }

  /**
 * Chooses the next architecture in a family to evolve to 
 * @param {object} family Family of architectures
 * @param {object} a Curent architecture ID
 * @param {object} inputs Simulation input parameters
 * @return {object} The ID for the next architecture to evolve to
 */
  function chooseEvolutionReconMulti(family, arcs, totalCap, J) { // Return a new constellation ID that fits the capacity jump criteria

    const reqCapJump = totalCap * (J - 1) // The required jump in capacity for the next evolution. E.g. 30,000 more channels are required to satisfy capJump
    const testCapJump = (b, aID) => family.cfgs[b].cap - family.cfgs[arcs[aID]].cap // The tested jump in capacity from arch a to b

    let bestRecon = { a: 0, b: 0, jump: Infinity }

    for (let aID = 0; aID < arcs.length; aID++) { // a = index in arcs

      let b = arcs[aID] + 1 // Start with the next evolution from arcs[aID]

      while (betterEvolution(family, b, testCapJump(b, aID) < reqCapJump)) b++

      if (testCapJump(b, aID) < bestRecon.jump) bestRecon = { // Update the best reconfiguration
        a: aID, b, jump: testCapJump(b, aID)
      }

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
  function chooseEvolutionNewLayer(family, totalCap, J) { // Return a new constellation ID that fits the capacity jump criteria

    const reqCapJump = totalCap * (J - 1) // The required jump in capacity for the next evolution. E.g. 30,000 more channels are required to satisfy capJump

    let nl = 0
    while (betterEvolution(family, nl, family.cfgs[nl].cap < reqCapJump)) nl++
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


  /**
   * Calculates the cost to evolve between two architectures 
   * @param {object} family Family of architectures
   * @param {object} a Curent architecture ID
   * @param {object} b ID of next arhitecture to evolve to
   * @return {number} Cost ($M)
   */
  function evolutionNLCosts(family, arcs) {
    const newArch = family.cfgs[newestLayer(arcs)]
    const newSats = newArch.n
    const newTotalN = calcTotalN(arcs, family) // Total number of satellites after new layer

    const PC = (prodCostMulti(newTotalN, family) / newTotalN) * newSats
    const LC = calcLaunchCost(family.m.totalMass, newSats)

    return PC + LC
  }


  /**
* Calculates the cost to evolve between two architectures 
* @param {object} family Family of architectures
* @param {object} a Curent architecture ID
* @param {object} b ID of next arhitecture to evolve to
* @return {number} Cost ($M)
*/
  function evolutionReconMultiCosts(family, a, b, arcs, recsLeft) {

    const currArch = family.cfgs[a]
    const nextArch = family.cfgs[b]
    const newSats = nextArch.n - currArch.n
    const newTotalN = calcTotalN(arcs, family) + newSats // Total number of satellites after reconfiguration

    const PC = (prodCostMulti(newTotalN, family) / newTotalN) * newSats
    const LC = calcLaunchCost(family.m.totalMass, newSats)
    // const RC = currArch.costs.RC
    const RC = max(1, recsLeft) * (inputs.reconCost * PC)

    return PC + LC + RC
  }


  /**
   * Calculates the total discounted LCC by discounting each element in the LCC array, then summing the discounted array
   * @param {number} LCCarr LCC Array
   * @param {number} discountArr Discount Array
   * @return {number} Total discounted LCC
   */
  function calcLCC(LCCarr, discountArr) {
    return LCCarr.reduce((LCC, _, step) => LCC + (LCCarr[step] * discountArr[step]), 0)
  }


  function discountLCCArr(LCCarr, discountArr) {
    return LCCarr.map((_, step) => (LCCarr[step] * discountArr[step]))
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
}