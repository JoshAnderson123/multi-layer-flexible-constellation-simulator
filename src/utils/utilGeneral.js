import { defaultSim, replaceStrs } from "../config";
import { optimiseFlexM, optimiseFlexS } from "./optimise";
import { calcInputParamRanges } from "./tradespace";

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


export function shortNumber(x) {
  if (x > 1e9) return `${(x / 1e9).toFixed(2)}B`
  if (x > 1e6) return `${(x / 1e6).toFixed(2)}M`
  if (x > 1e3) return `${(x / 1e3).toFixed(2)}K`
  return `${x.toFixed(2)}`
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
    J: x.J, Lm: x.Lm, 
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
export function max(...x) { return Math.max(...x) }
export function ceil(x) { return Math.ceil(x) }
export function floor(x) { return Math.floor(x) }


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
    },
    stratMulti: {
      J: inputs.strategy.J,
      Lm: inputs.strategy.Lm
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
    'flexM.avgR + flexM.avgN': round(flexM?.avgR + flexM?.avgN, 4),
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

  return r && rec && σ && J && Lm
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


export function parseConst(id, str = false) {
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
  copyToClipboard(compressResultFile(inputs, results))
  // copyToClipboard(JSON.stringify({inputs, results: compressResults(inputs, results)}))
  // const data = { inputs, results }
  // copyToClipboard(JSON.stringify(data))
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

export function compressResultFile(inputs, results) {

  const IPR = calcInputParamRanges(inputs) // IPR = input param ranges

  function compressStr(str) {
    let newStr = str.slice()
    for (let rep of replaceStrs) {
      const reg = new RegExp(`(?<=(,|\\[))(${rep},){3,}`, 'g')
      newStr = newStr.replace(reg, match => `<${rep}~${match.length / (rep.length + 1)}>`)
    }
    return newStr
  }

  function compressTradespace(ts) {
    return ts.map(fam => {
      const cfgsCompressed = {
        e: fam.cfgs.map(cfg => IPR.e.indexOf(cfg.e)),
        a: fam.cfgs.map(cfg => IPR.a.indexOf(cfg.a)),
        LCC: fam.cfgs.map(cfg => cfg.LCC),
        cap: fam.cfgs.map(cfg => cfg.cap)
      }
      return { D: fam.D, P: fam.P, I: fam.I, f: fam.f, cfgs: cfgsCompressed }
    })
  }

  function compressFlex(flex) {
    return {
      D: flex.map(x => IPR.D.indexOf(x.D)),
      ELCC: flex.map(x => x.ELCC),
      I: flex.map(x => IPR.I.indexOf(x.I)),
      J: flex.map(x => IPR.J.indexOf(x.J)),
      Lm: flex.map(x => IPR.Lm.indexOf(x.Lm)),
      P: flex.map(x => IPR.P.indexOf(x.P)),
      avgN: flex.map(x => x.avgN),
      avgR: flex.map(x => x.avgR),
      f: flex.map(x => IPR.f.indexOf(x.f)),
      r: flex.map(x => IPR.r.indexOf(x.r)),
      rec: flex.map(x => IPR.rec.indexOf(x.rec)),
      σ: flex.map(x => IPR.σ.indexOf(x.σ)),
    }
  }

  function compressxTrad(xTrad) {
    return {
      LCC: xTrad.map(x => x.LCC),
      cap: xTrad.map(x => x.cap),
      D: xTrad.map(x => IPR.D.indexOf(x.D)),
      P: xTrad.map(x => IPR.P.indexOf(x.P)),
      f: xTrad.map(x => IPR.f.indexOf(x.f)),
      I: xTrad.map(x => IPR.I.indexOf(x.I)),
      a: xTrad.map(x => IPR.a.indexOf(x.a)),
      e: xTrad.map(x => IPR.e.indexOf(x.e)),
      n: xTrad.map(x => x.n),
      r: xTrad.map(x => IPR.r.indexOf(x.r)),
      rec: xTrad.map(x => IPR.rec.indexOf(x.rec)),
      σ: xTrad.map(x => IPR.σ.indexOf(x.σ)),
    }
  }

  const compressResultsTemp = { inputs, results: { flex: compressFlex(results.flex), xTrad: compressxTrad(results.xTrad), tradespace: compressTradespace(results.tradespace) } }
  const compressResultsTempStr = JSON.stringify(compressResultsTemp)
  const compressedResults = compressStr(compressResultsTempStr)

  return compressedResults
  // return ({ flex: compressFlex(results.flex), xTrad: compressxTrad(results.xTrad), tradespace: compressTradespace(results.tradespace) })
}

export function decompressResults(resultFile) { // inputs, results

  function decompressStr(str) {
    let newStr = str.slice()
    newStr = newStr.replace(/<(\d|\w|~)+>/g, match => {
      const parsedMatch = match.slice(1, -1).split('~')
      return `${parsedMatch[0]},`.repeat(parsedMatch[1])
    })
    return newStr
  }

  function deCompressTradespace(tsc) {
    return tsc.map(fam => {
      const cfgsDecompressed = []
      for (let i = 0; i < fam.cfgs.e.length; i++) {
        cfgsDecompressed.push({
          e: IPR.e[fam.cfgs.e[i]],
          a: IPR.a[fam.cfgs.a[i]],
          LCC: fam.cfgs.LCC[i],
          cap: fam.cfgs.cap[i]
        })
      }
      return { D: fam.D, P: fam.P, I: fam.I, f: fam.f, cfgs: cfgsDecompressed }
    })
  }

  function decompressFlex(flex) {
    const flexDecompressed = []
    for (let i = 0; i < flex.D.length; i++) {
      flexDecompressed.push({
        D: IPR.D[flex.D[i]],
        ELCC: flex.ELCC[i],
        I: IPR.I[flex.I[i]],
        J: IPR.J[flex.J[i]],
        Lm: IPR.Lm[flex.Lm[i]],
        P: IPR.P[flex.P[i]],
        avgN: flex.avgN[i],
        avgR: flex.avgR[i],
        f: IPR.f[flex.f[i]],
        r: IPR.r[flex.r[i]],
        rec: IPR.rec[flex.rec[i]],
        σ: IPR.σ[flex.σ[i]],
      })
    }
    return flexDecompressed

  }

  function decompressxTrad(xTrad) {
    const flexDecompressed = []
    for (let i = 0; i < xTrad.D.length; i++) {
      flexDecompressed.push({
        LCC: xTrad.LCC[i],
        cap: xTrad.cap[i],
        D: IPR.D[xTrad.D[i]],
        P: IPR.P[xTrad.P[i]],
        f: IPR.f[xTrad.f[i]],
        I: IPR.I[xTrad.I[i]],
        a: IPR.a[xTrad.a[i]],
        e: IPR.e[xTrad.e[i]],
        n: xTrad.n[i],
        r: IPR.r[xTrad.r[i]],
        rec: IPR.rec[xTrad.rec[i]],
        σ: IPR.σ[xTrad.σ[i]],
      })
    }
    return flexDecompressed

  }

  //JSON.parse(e.target.result)

  const decompressedStr = decompressStr(resultFile)
  const decompressedFileTemp = JSON.parse(decompressedStr)
  const inputs = decompressedFileTemp.inputs
  const results = decompressedFileTemp.results

  const IPR = calcInputParamRanges(inputs)

  return ({ inputs, results: { flex: decompressFlex(results.flex), xTrad: decompressxTrad(results.xTrad), tradespace: deCompressTradespace(results.tradespace) } })
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
  return results.flex.find(x => x.r === p.r && x.rec === p.rec && x.σ === p.σ && x.J === strat.J && x.Lm === strat.Lm)
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
      // let resultFile = JSON.parse(e.target.result)
      const { inputs, results } = decompressResults(e.target.result)

      updateResults(results, inputs)

      // console.log(decompressResults(json.inputs, json.results))
      // updateResults(decompressResults(json.inputs, json.results), json.inputs)
      // updateResults(json.results, json.inputs)
    } catch (err) {
      console.log(err)
    }
  };

  return reader.readAsText(file);
}


export function minMax(l, x, u) {
  if (x < l) return l
  if (x > u) return u
  return x
}

export function formatCap(cap) {
  if (cap === 0) return '0'
  return `${round(cap / 1e6, 2)}M`
}

export function drawRotatedText(ctx, x, y, text, rad) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rad);
  ctx.fillText(text, 0, 0);
  ctx.restore()
}


export function calculateDate(currentStep, totalSteps, T) {

  const startDate = 2021
  const stepsPerYear = totalSteps / T
  const year = Math.floor(currentStep / stepsPerYear) + startDate
  const stepsPerMonth = stepsPerYear / 12
  const month = Math.floor((currentStep % stepsPerYear) / stepsPerMonth)
  // const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return `${months[month]} ${year}`
}

export function hexToRGBA(hex, opacity) {
  const r = parseInt(`0x${hex.substring(0, 2)}`)
  const g = parseInt(`0x${hex.substring(2, 4)}`)
  const b = parseInt(`0x${hex.substring(4)}`)
  return `rgba(${r},${g},${b},${opacity})`
}

export function arrRange(len) {
  return [...Array(len).keys()]
}

export function count(arr, v) {
  return arr.reduce((t, c) => c === v ? t + 1 : t, 0)
}

export function calcFirstArc(start, cfgs) {
  for (let i = 0; i < cfgs.length; i++) {
    if (cfgs[i].cap > start) return { id: i, cap: cfgs[i].cap }
  }
  return { id: cfgs.length - 1, cap: cfgs[cfgs.length - 1].cap }
}