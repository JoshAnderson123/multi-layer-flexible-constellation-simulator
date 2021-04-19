import { generateTradespace } from './tradespace'
import { deepCopy, formatxFlex, formatxTrad } from './utilGeneral'

/**
 * Calculates the optimal fixed strategy: minimised LCC, subject to cap > capMax
 * @param {number} archsTrad Tradespace of architectures, each with LCC from the fixed (traditional) strategy 
 * @param {number} capMax Maximum expected capacity 
 * @return {object} Optimum architecture in the fixed strategy
 */
export function optimiseTrad(archsTrad, capMax) {

  let xTrad = { LCC: Infinity }

  for (let family of archsTrad) { // For each family in the tradespace
    for (let cfg of family.cfgs) {      // For each configuration in the family
      if (cfg.cap < capMax) continue
      if (cfg.LCC < xTrad.LCC) xTrad = { ...cfg, D: family.D, P: family.P, I: family.I, f: family.f, m: family.m }
    }
  }

  return formatxTrad(xTrad)
}


/**
 * Calculates the optimal fixed strategy: minimised LCC, subject to cap > capMax
 * @param {number} flexMultiResults Array of architectures, each with ELCC from the greedy strategy 
 * @return {object} Optimum architecture in the flexible strategy
 */
export function optimiseFlex(simulation, archsParetoFam, TSB_Multi, label) {

  const multiStrats = generateTradespace(TSB_Multi)
  let xFlexM = { ELCC: Infinity }

  console.log(`${label} - Total simulations:`, multiStrats.length)

  for (let s = 0; s < multiStrats.length; s++) {
    const flexMultiResults = simulation.runFlex(archsParetoFam, multiStrats[s])
    const xFlexMStrat = flexMultiResults.reduce((lowest, fam) => fam.ELCC < lowest.ELCC ? fam : lowest, { ELCC: Infinity })

    if (xFlexMStrat.ELCC < xFlexM.ELCC) xFlexM = deepCopy(xFlexMStrat)
    console.log(`(${label}) ${s + 1}/${multiStrats.length}`)

  }

  return formatxFlex(xFlexM)
}

export function optimiseFlexS(results) {
  const resultsS = results.filter(strat => strat.Lm === 1)
  return resultsS.reduce((S, strat) => strat.ELCC < S.ELCC ? strat : S , {ELCC: Infinity})
}

export function optimiseFlexM(results) {
  const resultsM = results.filter(strat => strat.Lm !== 1)
  return resultsM.reduce((S, strat) => strat.ELCC < S.ELCC ? strat : S , {ELCC: Infinity})
}


/**
 * Removes all architectures in the tradespace that are not pareto-optimal in their families
 * @param {number} tradespaceFixed Tradespace of architectures, each with LCC from the fixed (traditional) strategy 
 * @return {object} Tradespace of architectures, with all non-family-pareto-optimal architectures removed
 */
export function filterParetoOptimal(arcsTrad) {

  const arcsPareto = []

  for (let fam of arcsTrad) { // For each family in the tradespace

    const compFam1 = compFamily(fam.cfgs)
    const compFam2 = compFamily(fam.cfgs) // Comparison Family
    const poFamilyCfgs = [] // Pareto Optimal Family Configurations

    main: for (let c1 in compFam1) { // c1 = key for config 1

      for (let c2 in compFam2) { // c2 = key for config 2
        if (compFam2[c2].LCC <= compFam1[c1].LCC && compFam2[c2].cap > compFam1[c1].cap) { // If c2 dominates c1
          delete compFam2[c1] // Remove c1 from compFam2 (object used instead of array so deleting doesn't require shuffling indices)
          continue main
        }
      }
      poFamilyCfgs.push(compFam1[c1])
    }
    poFamilyCfgs.sort((a, b) => a.LCC - b.LCC)
    const poFamily = { ...fam, cfgs: poFamilyCfgs }
    arcsPareto.push(poFamily)
  }

  return arcsPareto
}


/**
 * Make a 'comparison family': an object where each key is an identifier for a configuration
 * @param {number} cfgs Array of configurations in a family
 * @return {object} Object of configurations in a family
 */
function compFamily(cfgs) {
  const compFam = {}
  for (let i = 0; i < cfgs.length; i++) compFam[i] = cfgs[i]
  return compFam
}