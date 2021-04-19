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


/**
 * Generates an array of possible values for each input parameter in the design vector
 * @param {object} tsb tradespace upper/lower bounds and interval
 * @return {object} array of possible values for each parameter
 */
function generateParamArrays(tsb) {

  const t = [] // Array of values for every parameter
  const i = [] // Information for each paramter

  for (const [name, p] of Object.entries(tsb)) {

    const tarr = [] // Array of values for the current parameter
    let iarr

    if (![null, undefined].includes(p.lb)) { // If parameter has a lower bound i.e. if it is a range
      for (let v = p.lb; v <= p.ub; v += p.step) tarr.push(Math.round(v * 1e8) / 1e8)
      iarr = { name, units: p.units }
    } else { // If parameter is a discrete set
      tarr.push(...p)
      iarr = { name }
    }
    t.push(tarr)
    i.push(iarr)
  }
  return { t, i }
}

export function calcResultParamRanges(inputs) {
  return {
    r: addParamArray(inputs.scenario.r),
    rec: addParamArray(inputs.scenario.rec),
    σ: addParamArray(inputs.scenario.σ),
    J: addParamArray(inputs.strategy.J),
    Lm: addParamArray(inputs.strategy.Lm),
    Ld: addParamArray(inputs.strategy.Ld)
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

export function generateParamArrays2(tsb) {

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
    [param.name]: a[idx]
  }), {})
}

/**
 * Formats an individual architecture as an object
 * @param {array} i list of parameter names / information
 * @param {array} a list of parameter values for a given architecture
 * @return {object} formatted architecture object
 */
function formatVector2(i, a) {

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

  const { t, i } = generateParamArrays2(b)
  const tradespace = []

  function generateSubTS(t, i, a) {
    if (a.length === t.length) return tradespace.push(formatVector2(i, a)) // Base case
    for (let v of t[a.length]) generateSubTS(t, i, [...a, v]) // Recursive step
  }

  generateSubTS(t, i, [])

  return tradespace
}