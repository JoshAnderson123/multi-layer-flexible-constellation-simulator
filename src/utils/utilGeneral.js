import { defaultSim } from "../config";
import { optimiseFlexM, optimiseFlexS } from "./optimise";

export function commas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}


export function deepCopy(json) {
  return JSON.parse(JSON.stringify(json))
}


export function dollars(x) {
  if (x > 1e6) return `$${(x / 1e6).toFixed(2)}B`
  if (x > 1e3) return `$${(x / 1e3).toFixed(2)}M`
  return `$${x.toFixed(2)}`
}


export function round(x, d = 0) {
  return Math.round(x * (10 ** d)) / (10 ** d)
}


export function formatxTrad(x) {
  return {
    LCC: round(x.LCC, 2), cap: x.cap,
    D: x.D, P: x.P, f: x.f, I: x.I, a: x.a, e: x.e,
    n: x.n
  }
}


export function formatxFlex(x) {
  return {
    ELCC: round(x.ELCC, 2),
    D: x.D, P: x.P, f: x.f, I: x.I,
    J: x.J, Lm: x.Lm, Ld: x.Ld,
    avgN: x.avgN, avgR: x.avgR
  }
}

export function formatFlex(x) {
  x.ELCC = round(x.ELCC, 2)
  delete x.cfgs
  return x
}


export function downloadJson(jsonObj, exportName) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonObj, null, 2))
  const downloadAnchorNode = document.createElement('a')
  downloadAnchorNode.setAttribute('href', dataStr)
  downloadAnchorNode.setAttribute('download', exportName + '.json')
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click()
  downloadAnchorNode.remove()
}


export function ln(x) { return Math.log(x) }
export function max(x) { return Math.max(x) }
export function ceil(x) { return Math.ceil(x) }


//// Console.log functions without directory tag on the side (Cleaner) ////
export function logBig(str) {
  setTimeout(console.log.bind(console, `%c${str}`, 'font-size: 1rem'), 10);
}


export function logSmall(str) {
  setTimeout(console.log.bind(console, `%c${str}`, 'font-size: 0.8rem'), 10);
}


export function logNS(...params) {
  setTimeout(console.log.bind(console, ...params), 10);
}


export function logT(timeStr) {
  setTimeout(console.timeEnd.bind(console, timeStr), 10);
}

export function parseRange(range) {

  if (range.includes('|')) { // If range is continuous

    const valueStrArr = range.split('|')
    if (valueStrArr.length < 3 || valueStrArr.includes('')) return null
    if (valueStrArr.some(x => isNaN(x))) return null

    const values = valueStrArr.map(x => parseFloat(x))
    const start = values[0]
    const inc = values[1]
    const end = values[2]

    if (inc === 0) return null
    if (end < start) return null

    return { isContinuous: true, data: { start, inc, end } }

  } else { // If range is discrete

    const valueStrArr = range.split(',')
    if (valueStrArr.includes('')) return null
    return { isContinuous: false, data: valueStrArr }
  }
}

export function generateTSB(inputs) {
  return {
    arcsFixed: {
      D: inputs.architecture.D,
      P: inputs.architecture.P,
      f: inputs.architecture.f,
      I: inputs.architecture.I
    },
    arcsFlex: {
      a: inputs.architecture.a,
      e: inputs.architecture.e
    },
    stratSingle: {
      J: inputs.strategy.J,
      Lm: '1',
      Ld: '1'
    },
    stratMulti: {
      J: inputs.strategy.J,
      Lm: inputs.strategy.Lm,
      Ld: inputs.strategy.Ld
    },
    scenarios: {
      r: inputs.scenario.r,
      rec: inputs.scenario.rec,
      σ: inputs.scenario.σ,
      S: inputs.scenario.S
    }
  }
}

export function simulationInputs(scen) {

  return { ...defaultSim, r: scen.r, reconCost: scen.rec, σ: scen.σ, numScenarios: scen.S }
}

export function formatTime(ms) {

  if (isNaN(ms)) return '-'
  if (ms === Infinity) return '-'

  const msInSec = 1000
  const msInMin = msInSec * 60
  const msInHour = msInMin * 60

  const hours = Math.floor(ms / msInHour)
  const mins = Math.floor((ms % msInHour) / msInMin)
  const secs = Math.floor((ms % msInMin) / msInSec)

  const hoursStr = hours.toString().padStart(2, '0')
  const minsStr = mins.toString().padStart(2, '0')
  const secsStr = secs.toString().padStart(2, '0')

  if (hours > 0) return `${hoursStr}:${minsStr}:${secsStr}`
  if (mins > 0) return `${minsStr}:${secsStr}`
  return `00:${secsStr}`
}

export function flattenInputs(inputs) {
  return {
    r: inputs.scenario.r,
    rec: inputs.scenario.rec,
    σ: inputs.scenario.σ,
    S: inputs.scenario.S,
    J: inputs.strategy.J,
    Lm: inputs.strategy.Lm,
    Ld: inputs.strategy.Ld,
    D: inputs.architecture.D,
    P: inputs.architecture.P,
    f: inputs.architecture.f,
    I: inputs.architecture.I,
    a: inputs.architecture.a,
    e: inputs.architecture.e
  }
}

export function calcResult(xTrad, flexS, flexM, opt) {
  const result = {
    'xTrad.LCC': xTrad?.LCC,
    'flexS.ELCC': flexS?.ELCC,
    'flexS.avgR': flexS?.avgR,
    'flexM.ELCC': flexM?.ELCC,
    'flexM.avgN': flexM?.avgN,
    'flexM.avgR': flexM?.avgR,
    'flexM.avgR + flexM.avgN': flexM?.avgR + flexM?.avgN,
    'flexS.ELCC / xTrad.LCC': round(flexS?.ELCC / xTrad?.LCC, 4),
    'flexM.ELCC / xTrad.LCC': round(flexM?.ELCC / xTrad?.LCC, 4),
    'flexM.ELCC / flexS.ELCC': round(flexM?.ELCC / flexS?.ELCC, 4),
    'flexM.avgR / flexS.avgR': round(flexM?.avgR / flexS?.avgR, 4)
  }

  return result[opt]
}


export function formatHMItem(opt, item) {
  const result = {
    'xTrad.LCC': dollars(item),
    'flexS.ELCC': dollars(item),
    'flexS.avgR': item.toFixed(2),
    'flexM.ELCC': dollars(item),
    'flexM.avgN': item.toFixed(2),
    'flexM.avgR': item.toFixed(2),
    'flexM.avgR + flexM.avgN': item,
    'flexS.ELCC / xTrad.LCC': `${(item * 100).toFixed(2)}%`,
    'flexM.ELCC / xTrad.LCC': `${(item * 100).toFixed(2)}%`,
    'flexM.ELCC / flexS.ELCC': `${(item * 100).toFixed(2)}%`,
    'flexM.avgR / flexS.avgR': `${(item * 100).toFixed(2)}%`
  }

  return result[opt]
}


export function calcResultFormatted(xTrad, flexS, flexM, opt) {
  const result = calcResult(xTrad, flexS, flexM, opt)
  const formatted = formatHMItem(opt, result)
  return formatted
}



export function matchConstantsFlex(x, varParams, constParams, flex) {

  function isAVarParam(c) {
    return c === varParams.v1 || c === varParams.v2
  }

  // If parameter is a variable, accept all values, however if it is a constant, only accept the specified value
  const r = isAVarParam('r') ? true : x.r === constParams.r
  const rec = isAVarParam('rec') ? true : x.rec === constParams.rec
  const σ = isAVarParam('σ') ? true : x.σ === constParams.σ

  const J = isAVarParam('J') ? true : x.J === constParams.J

  let Lm = false
  if (flex === 'single') Lm = x.Lm === 1
  if (flex === 'multi') Lm = isAVarParam('Lm') ? true : x.Lm === constParams.Lm

  let Ld = false
  if (flex === 'single') Ld = x.Ld === 1
  if (flex === 'multi') Ld = isAVarParam('Ld') ? true : x.Ld === constParams.Ld

  return r && rec && σ && J && Lm && Ld
}


export function matchConstantsTrad(x, varParams, constParams) {

  function isAVarParam(c) {
    return c === varParams.v1 || c === varParams.v2
  }

  // If parameter is a variable, accept all values, however if it is a constant, only accept the specified value
  const r = isAVarParam('r') ? true : x.r === constParams.r
  const rec = isAVarParam('rec') ? true : x.rec === constParams.rec
  const σ = isAVarParam('σ') ? true : x.σ === constParams.σ

  return r && rec && σ
}


export function parseConst(id, str=false) {
  if (!document.querySelector(id)) return null
  if (str) return document.querySelector(id).value
  return round(parseFloat(document.querySelector(id).value), 6)
}

export function copyHeatmapToClipboard(HMResults) {

  const rows = HMResults.config.varParams.v2.range.length
  const cols = HMResults.config.varParams.v1.range.length

  let tableStr = '<table>'

  tableStr += '<tr><td></td>'
  for (let c = 0; c < cols; c++) tableStr += `<td>${HMResults.config.varParams.v1.range[c]}</td>`
  tableStr += '</tr>'

  for (let r = 0; r < rows; r++) {
    tableStr += `<tr><td>${HMResults.config.varParams.v2.range[r]}</td>`
    for (let c = 0; c < cols; c++) tableStr += `<td>${HMResults.data[r * cols + c]}</td>`
    tableStr += '</tr>'
  }

  tableStr += '</table>'

  copyToClipboard(tableStr)
}


export function copyResultsToClipboard(inputs, results) {
  const data = {inputs, results}
  copyToClipboard(JSON.stringify(data))
}


export function copyToClipboard(value) {

  navigator.clipboard.writeText(value)

  // const elem = document.createElement('textarea');
  // elem.value = value
  // document.body.appendChild(elem);
  // elem.select();
  // document.execCommand('copy');
  // document.body.removeChild(elem);
}


export function formatArcsPF(apf) { // Apf = arcs pareto-optimal families
  return apf.map(fam => ({
    D: fam.D, P: fam.P, I: fam.I, f: fam.f,
    cfgs: fam.cfgs.map(c => ({ e: c.e, a: c.a, LCC: c.LCC, cap: c.cap }))
  }))
}


export function findxTrad(p, results) {
  return results.xTrad.find(x => x.r === p.r && x.rec === p.rec && x.σ === p.σ)
}

export function findxFlex(p, results, type) {
  const filteredResults = results.flex.filter(x => x.r === p.r && x.rec === p.rec && x.σ === p.σ)
  if (type === 'single') return optimiseFlexS(filteredResults)
  return optimiseFlexM(filteredResults)
}

export function findFlex(p, strat, results, type) {
  if (type === 'single') return results.flex.find(x => x.r === p.r && x.rec === p.rec && x.σ === p.σ && x.J === strat.J && x.Lm === 1)
  return results.flex.find(x => x.r === p.r && x.rec === p.rec && x.σ === p.σ && x.J === strat.J && x.Lm === strat.Lm && x.Ld === strat.Ld)
}

export function findFamilyFromFlex(flex, tradespace) {
  return tradespace.find(x => x.D === flex.D && x.P === flex.P && x.f === flex.f && x.I === flex.I)
}

// Returns relevant scenario data for the results (removes S - number of scenarios)
export function scenarioData(s) {
  return { r: s.r, rec: s.rec, σ: s.σ }
}


export function openResultsFile(evt, updateResults) {

  let file = evt.target.files[0];
  let reader = new FileReader();

  reader.onload = function (e) {
    try {
      let json = JSON.parse(e.target.result)
      updateResults(json.results, json.inputs)
    } catch (err) {
      console.log(err)
    }
  };

  return reader.readAsText(file);
}