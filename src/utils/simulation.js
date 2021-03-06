/*
--- Simulation.js ---
Created: 12th April 2021
Description: Holds the code for
*/

import { stochasticScenarios, deterministicScenario } from './models/demandModel'
import { calcLaunchCost } from './models/costModel'
import { calcFirstArc, ceil, copyConfig, copyFam, formatxFlex, ln, max, min, round } from './utilGeneral'
import { b } from './models/costModel'

/**
 * Creates a simulation object which can run different scenarios
 * @param {object} inputs Input parameters
 * @return {object} Simulation object
 */
export function createSimulation(inputs, arcs) {

  const { T, μ, steps, start, r, capMax } = inputs
  const numScenarios = inputs.σ === 0 ? 1 : inputs.numScenarios
  const σ = scaleTheta(inputs.σ, μ)

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
  simulation.findXFull = (family) => findXFull(family)
  simulation.expectedDemand = () => detFinal
  simulation.calcEvolutions = (J, fam, Lm) => calcEvolutions(J, fam, Lm)
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

    const tsf = []
    const dt = T / steps // # Steps / year

    for (let family of ts) {   // For each fam in the ts
      const newCfgs = []
      for (let config of family.cfgs) {   // For each configuration in the fam
        let LCC = config.costs.IDC + config.costs.PC + config.costs.LC // Initial costs
        const OC = config.costs.OC * dt
        for (let i = 1; i < steps + 1; i++) LCC += OC * discountArr[i]
        newCfgs.push(copyConfig(config, LCC))
      }
      newCfgs.sort((a, b) => a.LCC - b.LCC)
      tsf.push(copyFam(family, newCfgs))
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


  function runFlex(tradespace, flexStratInputs) {

    const { J, Lm } = flexStratInputs // Extract flexible strategy inputs
    const dt = T / steps // Calculate Time step (years)
    let xFlex = { ELCC: Infinity }

    for (let family of tradespace) { // For each family in the tradespace

      if (maxCapacityOf(family) < capMax) continue // Discard a family if it never reaches capMax

      const OC = {} // Initialise Ongoing & Mantenance cost cache
      function combinedOC(n) { // Setup optimised combined OC function for this family
        if (n in OC) { return OC[n] }
        if (n in L) { OC[n] = family.recCosts['LOOS'] * L[n] * dt; return OC[n] }
        L[n] = n ** b
        OC[n] = family.recCosts['LOOS'] * L[n] * dt
        return OC[n]
      }

      const evolutions = calcEvolutions(J, family, Lm)
      const maxReconsPerSat = calcMaxRecons(evolutions, Lm)

      let ELCC = 0 // Initialise expected LCC
      let avgR = 0 // Initialise average number of reconfigurations
      let avgN = 0 // Initialise average number of newLayers

      for (let demand of scenarios) { // Run through every demand scenario

        let curEvl = 0 // Current evolution
        let layers = [evolutions[0].id] // Initialise list of current architecture IDs to ID of the starting arch (the architecture with the smallest capacity that is greater than the starting demand)
        let LCC = startCosts(family, layers, maxReconsPerSat) // Initialise the LCC array
        let totalN = calcTotalN(layers, family)
        let prevEvlT = 1
        let totalCap = calcTotalCap(layers, family) // Calculate the total capacity of all layers

        for (let t = 1; t < demand.length; t++) { // Run through the scenario

          if (demand[t] > totalCap && totalCap < capMax) { // If constellation should evolve

            const OC = combinedOC(totalN)
            for (let i = prevEvlT; i < t; i++) LCC += OC * discountArr[i]

            curEvl++
            const evl = evolutions[curEvl]
            let evlCost
            if (evl.type === 'NL') {
              evlCost = evolutionNLCosts2(family, evl.id, layers, maxReconsPerSat)
              layers.push(evl.id)
              avgN++
            } else {
              evlCost = evolutionReconMultiCosts(family, evl.from, evl.to, layers, maxReconsPerSat)
              layers[evl.layer] = evl.to
              avgR++
            }
            LCC += (evlCost + OC) * discountArr[t]

            totalCap = calcTotalCap(layers, family)
            totalN = calcTotalN(layers, family)
            prevEvlT = t + 1
          }
        }

        const OC = combinedOC(totalN)
        for (let i = prevEvlT; i < steps + 1; i++) LCC += OC * discountArr[i]
        ELCC += LCC
      }

      ELCC /= scenarios.length // Divide by number of scenarios to get the expected LCC

      avgR = round(avgR / (scenarios.length * Lm), 4) // Divide by number of scenarios to get the average number of reconfigurations per scenario
      avgN = round(avgN / scenarios.length, 4)
      if (ELCC < xFlex.ELCC) xFlex = { ...family, cfgs: family.cfgs, ELCC, avgR, avgN, Lm, J }
    }

    return formatxFlex(xFlex)
  }


  function runFlexVisual(family, flexStratInputs) {

    const { J, Lm } = flexStratInputs // Extract flexible strategy inputs
    const dt = T / steps // Calculate Time step (years)

    const evolutions = calcEvolutions(J, family, Lm)
    const maxReconsPerSat = calcMaxRecons(evolutions, Lm)

    let curEvl = 0 // Current evolution

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


  function runFullFact(family, evolutions) {


    const maxReconsPerSat = calcMaxRecons(evolutions, 1)

    const OC = {} // Initialise Ongoing & Mantenance cost cache
    function combinedOC(n) { // Setup optimised combined OC function for this family
      if (n in OC) { return OC[n] }
      if (n in L) { OC[n] = family.recCosts['LOOS'] * L[n] * dt; return OC[n] }
      L[n] = n ** b
      OC[n] = family.recCosts['LOOS'] * L[n] * dt
      return OC[n]
    }

    let ELCC = 0 // Initialise expected LCC

    for (let demand of scenarios) { // Run through every demand scenario

      let curEvl = 0 // Current evolution
      let layers = [evolutions[0].id] // Initialise list of current architecture IDs to ID of the starting arch (the architecture with the smallest capacity that is greater than the starting demand)
      let LCC = startCosts(family, layers, maxReconsPerSat) // Initialise the LCC array
      let totalN = calcTotalN(layers, family)
      let prevEvlT = 1
      let totalCap = calcTotalCap(layers, family) // Calculate the total capacity of all layers

      for (let t = 1; t < demand.length; t++) { // Run through the scenario

        if (demand[t] > totalCap && totalCap < capMax) { // If constellation should evolve

          const OC = combinedOC(totalN)
          for (let i = prevEvlT; i < t; i++) LCC += OC * discountArr[i]

          curEvl++
          
          const evl = evolutions[curEvl]
          let evlCost
          if (evl.type === 'NL') {
            evlCost = evolutionNLCosts2(family, evl.id, layers, maxReconsPerSat)
            layers.push(evl.id)
          } else {
            evlCost = evolutionReconMultiCosts(family, evl.from, evl.to, layers, maxReconsPerSat)
            layers[evl.layer] = evl.to
          }
          LCC += (evlCost + OC) * discountArr[t]

          totalCap = calcTotalCap(layers, family)
          totalN = calcTotalN(layers, family)
          prevEvlT = t + 1
        }
      }

      const OC = combinedOC(totalN)
      for (let i = prevEvlT; i < steps + 1; i++) LCC += OC * discountArr[i]
      ELCC += LCC
    }

    ELCC /= scenarios.length // Divide by number of scenarios to get the expected LCC

    return ELCC
  }


  function maxCapacityOf(family) {
    return family.cfgs[family.cfgs.length - 1].cap
  }


  function calcEvolutions(J, fam, Lm) { // Calculate the maximum expected reconfigurations in a demand scenario

    const f = calcFirstArc(start, fam.cfgs, J)
    // const f = calcFirstArc(fam.cfgs[0].cap, fam.cfgs, J)
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
        if (tooManyRecons(lid)) continue
        let aid = layers[lid], bid = layers[lid] + 1
        for (let i = bid; i < fam.cfgs.length; i++) {
          bid = i
          if (sameAltitude(fam.cfgs, layers, i)) continue
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


  function findXFull(family) {

    const { id: fId } = calcFirstArc(start, family.cfgs)
    const { id: mId } = calcFirstArc(capMax, family.cfgs)
    const cfgLen = family.cfgs.length
    const smLen = mId - fId
    const bgLen = cfgLen - mId
    let count = 0

    let xFull = { ELCC: Infinity, arcs: null }

    for (let j = 1; j < 2 ** bgLen; j++) { // i = combination of configurations < capMax
      for (let i = 0; i < 2 ** smLen; i++) { // j = combination of configurations >= capMax
        count++
        const comboSm = i.toString(2).padStart(smLen, '0')
        const comboBg = j.toString(2).padStart(bgLen, '0')
        const combo = (comboSm + comboBg).padStart(cfgLen, '0')
        const path = []
        for (let s = 0; s < combo.length; s++) {
          if (combo[s] === '1') {
            if (path.length === 0) {
              path.push({ type: 'init', layer: 0, id: s })
            } else {
              path.push({ type: 'recon', layer: 0, id: s, from: path[path.length - 1].id, to: s })
            }
          }
        }
        const ELCC = runFullFact(family, path)
        if (ELCC < xFull.ELCC) xFull = { ELCC, path }
      }
    }

    console.log('count', count)

    return xFull
  }


  function calcRequiredCap(totalCap, J) {
    if (totalCap * J > capMax) return capMax - totalCap
    return totalCap * (J - 1)
  }


  function calcTotalCap(layers, family) {
    if (layers.length === 1) return family.cfgs[layers[0]].cap
    return layers.reduce((cap, layerID) => cap + family.cfgs[layerID].cap, 0)
  }


  function calcTotalN(layers, family) {
    if (layers.length === 1) return family.cfgs[layers[0]].n
    return layers.reduce((n, arc) => n + family.cfgs[arc].n, 0)
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
  function evolutionNLCosts2(family, newArcID, layers, maxReconsPerSat) {

    const newArc = family.cfgs[newArcID]
    const newSats = newArc.n

    return calcEvolutionCosts(layers, family, newSats, maxReconsPerSat)
  }


  /**
  * Calculates the cost to evolve between two architectures 
  * @param {object} family Family of architectures
  * @param {object} a Curent architecture ID
  * @param {object} b ID of next arhitecture to evolve to
  * @return {number} Cost ($M)
  */
  function evolutionReconMultiCosts(family, a, b, layers, maxReconsPerSat) {

    const currArch = family.cfgs[a]
    const nextArch = family.cfgs[b]
    const newSats = nextArch.n - currArch.n

    return calcEvolutionCosts(layers, family, newSats, maxReconsPerSat)
  }

  function calcEvolutionCosts(layers, family, newSats, maxReconsPerSat) {

    const oldTotalN = calcTotalN(layers, family) // Current total number of satellites
    const newTotalN = oldTotalN + newSats // Total number of satellites after new layer
    const PC = prodCostMulti(newTotalN, family) - prodCostMulti(oldTotalN, family)
    const LC = calcLaunchCost(family.m.totalMass, newSats)
    const RC = maxReconsPerSat * PC * inputs.reconCost

    return PC + LC + RC
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

  function scaleTheta(σ, μ) {
    // The demand model is deterministic when σ = 0.1
    // It is logically expected that determiniscity is achieved at σ = 0
    // This function scales theta to make the model deterministic at σ = 0

    const relμ = μ / 0.77119
    const ratio = 2
    const floor = 0.1 * relμ
    const thresh = 0.1 * ratio * relμ

    if (σ < 0) return floor
    if (σ < thresh) return (σ / ratio) + floor
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