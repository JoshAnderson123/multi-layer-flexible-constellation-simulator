import { calcCapacity } from './models/capacityModel'
import { calcLCCComponents, calcMasses, calcImInfCosts, calcRecCosts } from './models/costModel'
import { calcNumSats } from './constellationGeo'
import { generateTradespace } from './tradespace'


/**
 * Generates tradespace of architectures, each containing their cost and capacity components
 * @param {object} fixed fixed parameters in the design vector
 * @param {object} flex flexible parameters in the design vector
 * @return {object} tradespace where each architecture contains its cost and capacity component
 */
export function generateArchitectures(fixed, flex) {

  const arcOutlines = generateArchitectureOutlines(fixed, flex)
  const architectures = []

  for (let family of arcOutlines) {

    const masses = calcMasses(family)
    const imInfCosts = calcImInfCosts(masses)
    const recCosts = calcRecCosts(imInfCosts)
    const prodCostSrc = ['bus', 'str', 'thml', 'ADCS', 'TTC', 'CDH', 'pay', 'IAT', 'PL'].reduce((acc, key) => acc + recCosts[key], 0)

    const fixedParams = { D: family.D, P: family.P, I: family.I, f: family.f, m: masses }

    const cfgs = []
    for (let flexParams of family.flex) {

      const n = calcNumSats(flexParams)
      const costs = calcLCCComponents(imInfCosts, masses, n)

      cfgs.push({
        ...flexParams,
        cap: Math.round(calcCapacity({ ...fixedParams, ...flexParams }, n)),
        costs,
        n
      })

    }
    cfgs.sort((a, b) => a.cap - b.cap)
    architectures.push({ ...fixedParams, imInfCosts, recCosts, prodCostSrc, cfgs })
  }

  return architectures
}


/**
 * Generates collection of all possible architecture outlines from the input boundaries
 * @param {object} fixed fixed parameters in the design vector
 * @param {object} flex flexible parameters in the design vector
 * @return {object} architecture outlines, organised into families
 */
 export function generateArchitectureOutlines(fixed, flex) {

  //// Organise into families
  const archsFixed = generateTradespace(fixed)
  const archsFamilies = []
  for (let a of archsFixed) {
    archsFamilies.push({ ...a, flex: generateTradespace(flex) })
  }

  return archsFamilies
}


/**
 * Returns the max/min cost and capacities in the collection of architectures
 * @param {object} architectures collection of architectures with their associated costs/capacities
 * @return {object} max/min cost and capacity
 */
export function calcBoundaries(architectures) {
  return {
    maxCap: architectures.reduce((maxCap, fam) => {
      const maxCapInFam = fam.cfgs.reduce((maxCapInFam, arch) => (maxCapInFam > arch.cap) ? maxCapInFam : arch.cap, 0)
      return maxCap > maxCapInFam ? maxCap : maxCapInFam
    }, 0),
    maxCost: architectures.reduce((maxCost, fam) => {
      const maxCostInFam = fam.cfgs.reduce((maxCostInFam, arch) => (maxCostInFam > arch.LCC) ? maxCostInFam : arch.LCC, 0)
      return maxCost > maxCostInFam ? maxCost : maxCostInFam
    }, 0),
    minCap: architectures.reduce((minCap, fam) => {
      const minCapInFam = fam.cfgs.reduce((minCapInFam, arch) => (minCapInFam < arch.cap) ? minCapInFam : arch.cap, Infinity)
      return minCap < minCapInFam ? minCap : minCapInFam
    }, Infinity),
    minCost: architectures.reduce((minCost, fam) => {
      const minCostInFam = fam.cfgs.reduce((minCostInFam, arch) => (minCostInFam < arch.LCC) ? minCostInFam : arch.LCC, Infinity)
      return minCost < minCostInFam ? minCost : minCostInFam
    }, Infinity)
  }
}


/**
 * Returns an architecture based on selected family ID and configuration ID
 * @param {object} arcs tradespace - collection of architectures with their associated costs/capacities
 * @param {number} familyID ID of the requested family
 * @param {number} configID ID of the requested configuration
 * @return {object} architecture
 */
export function getArch(arcs, familyID, configID) {

  const family = {
    D: arcs[familyID].D,
    P: arcs[familyID].P,
    I: arcs[familyID].I,
  }

  const config = {
    e: arcs[familyID][configID].e,
    a: arcs[familyID][configID].a
  }

  const cap = arcs[familyID][configID].cap
  const costs = arcs[familyID][configID].costs

  return {
    family,
    config,
    cap,
    costs
  }
}


/**
 * Counts the number of architectures in the tradespace
 * @param {object} arcs tradespace - collection of architectures with their associated costs/capacities
 * @return {number} number of architectures
 */
export function countArchs(arcs) {
  return arcs.reduce((numArchs, family) => numArchs + family.cfgs.length, 0)
}