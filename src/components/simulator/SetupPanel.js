import React, { useState } from 'react'
import { Center, Grid, Flex, Input, Img } from '../blocks/blockAPI'
import { commas, deepCopy, formatTime, parseRange } from '../../utils/utilGeneral'
import { formatParam } from '../../config'
import PanelTopBar from './PanelTopBar'

const feildTC = '2.5fr 4fr 1fr'
const indent = '10px'

export default function SetupPanel({ setPanel, inputs, setInputs }) { //w='1050px' h='900px'

  const [viewArc, setViewArc] = useState(true)
  const [viewSce, setViewSce] = useState(true)
  const [viewStr, setViewStr] = useState(true)

  const canRun = calcCanRun(inputs)

  return (
    <Flex f='FSV' w='100%' h='100%' cn='rel bc2'>
      <PanelTopBar setPanel={setPanel} />
      <Center cn='w100 font-title2 ct1 bc2-2 bor-field rig' h='100px'>Multi-Layer Flexible Constellation Simulator</Center>
      <Flex f='FSV' p='0 20%' cn='ct1 w100 font-grid rel bor-field grow ovy-a'>
        <AttrContainer
          title='Architectures' type='architecture' inputs={inputs} setInputs={setInputs}
          view={viewArc} setView={setViewArc}
        />
        <AttrContainer
          title='Strategies' type='strategy' inputs={inputs} setInputs={setInputs}
          view={viewStr} setView={setViewStr}
        />
        <AttrContainer
          title='Scenarios' type='scenario' inputs={inputs} setInputs={setInputs}
          view={viewSce} setView={setViewSce}
        />
        <ScenarioConfig view={viewSce} inputs={inputs} setInputs={setInputs} />
        <Flex f='FS' cn='w100 font-grid-small ct1' mt='30px'>{`Total Unit Simulations: ${calcTotalUnitSimulations(inputs)}`}</Flex>
      </Flex>
      <Center cn='w100 font-title2 c-d1 bc2-2 rig' h='100px'>
        <Center w='280px' h='60px' cn={`bc1 c-l1 font-btn bshbtn2 us-none ${canRun ? 'ptr hoverGrow' : ''}`} o={canRun ? '1' : '0.5'} oc={() => canRun ? setPanel('running') : null} >
          {`Run Simulation (${estimateTime(inputs)})`}
        </Center>
      </Center>
    </Flex>
  )
}


function AttrContainer({ title, type, inputs, setInputs, view, setView }) { // tt = total text

  function renderTable() {

    if (!view) return null

    if (type === 'scenario') return [
      <Header />,
      ['r', 'rec', 'σ'].map(param =>
        <Record key={param} type={type} param={param} range={inputs[type][param]} setInputs={setInputs} />
      )
    ]

    return [
      <Header />,
      Object.keys(inputs[type]).map(param =>
        <Record key={param} type={type} param={param} range={inputs[type][param]} setInputs={setInputs} />
      )
    ]
  }

  return (
    <>
      <Flex f='FB' h='40px' mt='20px' cn='font-title w100 bor-field ptr' oc={() => setView(prev => !prev)}>

        <Center>
          <Flex f='FS'>
            {title}
          </Flex>
          <Center ml='15px' cn='font-grid-small rel c-d2' t='2px'>
            {`(${formatTotals(inputs, type)})`}
          </Center>
        </Center>

        <Img src={`arrow_${view ? 'up' : 'down'}.svg`} w='20px' h='20px' />
      </Flex>
      {renderTable()}
    </>
  )
}

function Header() {
  return (
    <Grid gtc={feildTC} cn='w100 bor-field bc2-2' h='30px'>
      <Flex f='FS' pl={indent}>Param</Flex>
      <Flex f='FS' pl={indent}>Range</Flex>
      <Flex f='FS' pl={indent}>Entries</Flex>
    </Grid>
  )
}

function Record({ type, param, range, setInputs }) {

  const entries = calcEntries(range)

  function updateRange(e) {
    setInputs(prevInputs => {
      const newInputs = deepCopy(prevInputs)
      newInputs[type][param] = e.target.value
      return newInputs
    })
  }

  return (
    <Grid gtc={feildTC} cn='w100 bor-field' h='25px'>
      <Flex f='FS' cn='bc2-2' pl={indent}>{formatParam[param]}</Flex>
      <Input value={range} cn='font-grid b-none bc2-4' pl={indent} onChange={e => updateRange(e)} />
      <Flex f='FS' cn='bc2-2' pl={indent}>{entries}</Flex>
    </Grid>
  )
}

function ScenarioConfig({ view, inputs, setInputs }) {
  if (view) return (
    <>
      <Center cn='w100 bc2-3' h='1px' mt='10px'></Center>
      <Flex f='FB' cn='w100' pt='10px'>
        <ScenarioConfigItem setInputs={setInputs} param='S' value={inputs.scenario['S']} />
        <ScenarioConfigItem setInputs={setInputs} param='start' value={inputs.scenario['start']} />
        <ScenarioConfigItem setInputs={setInputs} param='μ' value={inputs.scenario['μ']} />
        <ScenarioConfigItem setInputs={setInputs} param='capMax' value={inputs.scenario['capMax']} />
      </Flex>
    </>
  )

  return null
}

function ScenarioConfigItem({ param, value, setInputs, ...props }) {

  function updateValue(e) {
    setInputs(prevInputs => {
      const newInputs = deepCopy(prevInputs)
      newInputs.scenario[param] = e.target.value
      return newInputs
    })
  }

  return (
    <Flex f='FB' h='28px' cn='rel' {...props} >
      <Flex f='FS' pl='10px' w='160px' cn='bc2-2 h100'>{formatParam[param]}</Flex>
      <Input value={value} cn='font-grid b-none bc2-4 h100' w='120px' pl={indent} onChange={e => updateValue(e)} />
    </Flex>
  )
}

function calcEntries(range) {
  const result = parseRange(range)
  if (!result) return '-'
  const d = result.data
  if (result.isContinuous) return Math.round(((d.end - d.start) / d.inc) + 1)
  return d.length
}

function formatTotals(inputs, type) {
  const res = calcTotals(inputs, type)
  if (type === 'architecture') {
    if (!res?.tot) return '-'
    return `${commas(res.fams)} families, ${commas(res.cfgs)} configs, ${commas(res.tot)} total`
  }
  if (type === 'scenario') {
    if (!res) return '-'
    const S = inputs.scenario.S
    return `${commas(res / S)} types, ${commas(S)} stochastic scenarios each`
  }
  if (type === 'strategy') {
    if (!res) return '-'
    return commas(res)
  }

  return 'X'
}

function calcTotals(inputs, type) {
  if (type === 'architecture') {
    const a = inputs.architecture
    const fams = calcEntries(a.D) * calcEntries(a.P) * calcEntries(a.f) * calcEntries(a.I)
    const cfgs = calcEntries(a.a) * calcEntries(a.e)
    if (isNaN(fams) || isNaN(cfgs)) return null
    return { fams, cfgs, tot: fams * cfgs }
  }
  if (type === 'scenario') {
    const s = inputs.scenario
    const eR = calcEntries(s.r)
    const eRec = calcEntries(s.rec)
    const eσ = calcEntries(s.σ)
    if (isNaN(eR) || isNaN(eRec) || isNaN(eσ) || isNaN(s.S)) return null
    return eR * eRec * eσ * s.S
  }
  if (type === 'strategy') {
    const s = inputs.strategy
    const eJ = calcEntries(s.J)
    const eLm = calcEntries(s.Lm)
    if (isNaN(eJ) || isNaN(eLm)) return null
    return eJ * eLm
  }
  return null
}

function calcTotalUnitSimulations(inputs) {
  const arcs = calcTotals(inputs, 'architecture')?.tot
  const scen = calcTotals(inputs, 'scenario') / inputs.scenario.S
  const straM = calcTotals(inputs, 'strategy')
  const straS = calcEntries(inputs.strategy.J)
  if (!arcs || !scen || !straM) return '-'
  return commas(arcs * scen * (straS + straM))
}

function estimateTime(inputs) {
  // Benchmarked with arcs=18000, scen=100, straM=36, straS=4
  const arcs = calcTotals(inputs, 'architecture')?.tot
  const scen = calcTotals(inputs, 'scenario')
  const straM = calcTotals(inputs, 'strategy')
  const straS = calcEntries(inputs.strategy.J)
  if (!arcs || !scen || !straM) return '-'
  const unitTime = 2.0835e-4 //1.389e-4
  const ms = unitTime * (9000 + 0.5 * arcs) * scen * (straS + straM)
  return formatTime(ms)
}

function calcCanRun(inputs) {
  return estimateTime(inputs) !== '-'
}