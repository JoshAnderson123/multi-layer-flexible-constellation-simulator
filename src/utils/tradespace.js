/*
  NOMENCLATURE

  t: [[values]]: array of values for each parameter in tradespace
  i: [info]: information for each parameter in tradespace
  b: {parameter: {units, lb, ub, step}}: Tradespace upper/lower bounds and step
  a: list of parameter values for a given architecture
  arch: architecture
  archs: architectures
  ts: [arch]: tradespace - collection of all architectures

*/

import { parseRange } from "./utilGeneral"

export function calcInputParamRanges(inputs) {
  return {
    r: addParamArray(inputs.scenario.r),
    rec: addParamArray(inputs.scenario.rec),
    σ: addParamArray(inputs.scenario.σ),
    J: addParamArray(inputs.strategy.J),
    Lm: [...addParamArray(inputs.strategy.Lm), 1],
    D: addParamArray(inputs.architecture.D),
    P: addParamArray(inputs.architecture.P),
    f: addParamArray(inputs.architecture.f),
    I: addParamArray(inputs.architecture.I),
    a: addParamArray(inputs.architecture.a),
    e: addParamArray(inputs.architecture.e),
  }
}

export function calcResultParamRanges(inputs) {
  return {
    r: addParamArray(inputs.scenario.r),
    rec: addParamArray(inputs.scenario.rec),
    σ: addParamArray(inputs.scenario.σ),
    J: addParamArray(inputs.strategy.J),
    Lm: addParamArray(inputs.strategy.Lm)
  }
}

export function addParamArray(paramRange) {

  const result = parseRange(paramRange)
  const d = result.data
  if (result.isContinuous) {
    const ti = [d.start]
    let currentVal = d.start
    while (currentVal < d.end) {
      currentVal += d.inc
      ti.push(Math.round(currentVal * 1e6) / 1e6)
    }
    return ti
  } else { // If discrete
    const ti = d.some(x => isNaN(x)) ? d : d.map(x => parseFloat(x))
    return ti
  }
}

export function generateParamArrays(tsb) {

  const t = [] // Array of values for every parameter
  const i = [] // Information for each paramter

  for (let b of Object.keys(tsb)) {
    const result = parseRange(tsb[b])
    const d = result.data
    if (result.isContinuous) {
      const ti = [d.start]
      let currentVal = d.start
      while (currentVal < d.end) {
        currentVal += d.inc
        ti.push(Math.round(currentVal * 1e6) / 1e6)
      }
      t.push(ti)
      i.push(b)
    } else { // If discrete
      const ti = d.some(x => isNaN(x)) ? d : d.map(x => parseFloat(x))
      t.push(ti)
      i.push(b)
    }
  }

  return { t, i }
}


/**
 * Formats an individual architecture as an object
 * @param {array} i list of parameter names / information
 * @param {array} a list of parameter values for a given architecture
 * @return {object} formatted architecture object
 */
function formatVector(i, a) {

  return i.reduce((arch, param, idx) => ({
    ...arch,
    [param]: a[idx]
  }), {})
}


/**
 * Generates collection of all possible architectures from the specified boundaries
 * @param {object} b upper/lower boundaries and interval
 * @return {object} architectures
 */
export function generateTradespace(b) {

  const { t, i } = generateParamArrays(b)
  const tradespace = []

  function generateSubTS(t, i, a) {
    if (a.length === t.length) return tradespace.push(formatVector(i, a)) // Base case
    for (let v of t[a.length]) generateSubTS(t, i, [...a, v]) // Recursive step
  }

  generateSubTS(t, i, [])

  return tradespace
}