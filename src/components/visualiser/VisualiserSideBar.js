import React, { useEffect, useRef, useState } from 'react'
import { generateArchitectures } from '../../utils/architectures'
import { createSimulation } from '../../utils/simulation'
import { calcResultParamRanges } from '../../utils/tradespace'
import { caseStr, findFlex, findxFlex, findxTrad, formatArcsPF, minMax, parseConst, simulationInputs } from '../../utils/utilGeneral'
import { Center, Flex, Grid, Img } from '../blocks/blockAPI'
import { DropdownConst } from '../simulator/Dropdown'
import { VisGraph } from '../../config'
import { drawVisualisationGraph } from '../../utils/draw'
import { filterParetoOptimal } from '../../utils/optimise'
import SetupPanel from '../simulator/SetupPanel'

export default function VisualiserSideBar({ inputs, results, visuResults, updateVisuResults, playing, setPlaying, currentStep, updateStep, setPlayspeed, keyboardListener, setPanel }) {

  const simulation = useRef()
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const canavsContainer = document.querySelector('#canvas-container')
    setCanvasSize({ w: canavsContainer.clientWidth, h: canavsContainer.clientHeight })
    if (!visuResults) generateScenario()

    keyboardListener.current.addEvent({
      conditions: ['KeyQ', 'ArrowRight'],
      action: () => alterDropdown('#c-r', 'increment')
    })
    keyboardListener.current.addEvent({
      conditions: ['KeyQ', 'ArrowLeft'],
      action: () => alterDropdown('#c-r', 'decrement')
    })
    keyboardListener.current.addEvent({
      conditions: ['KeyA', 'ArrowRight'],
      action: () => alterDropdown('#c-rec', 'increment')
    })
    keyboardListener.current.addEvent({
      conditions: ['KeyA', 'ArrowLeft'],
      action: () => alterDropdown('#c-rec', 'decrement')
    })
    keyboardListener.current.addEvent({
      conditions: ['KeyZ', 'ArrowRight'],
      action: () => alterDropdown('#c-v', 'increment')
    })
    keyboardListener.current.addEvent({
      conditions: ['KeyZ', 'ArrowLeft'],
      action: () => alterDropdown('#c-v', 'decrement')
    })
    keyboardListener.current.addEvent({
      conditions: ['ArrowUp'],
      action: () => alterDropdown('#c-type', 'decrement')
    })
    keyboardListener.current.addEvent({
      conditions: ['ArrowDown'],
      action: () => alterDropdown('#c-type', 'increment')
    })
    keyboardListener.current.addEvent({
      conditions: ['KeyS'],
      action: generateScenario
    })
    keyboardListener.current.addEvent({
      conditions: ['KeyR'],
      action: () => setPanel('results')
    })

  }, [])

  function alterDropdown(str, mode) {
    const dropdown = document.querySelector(str)
    if (mode === 'increment') {
      if (dropdown.selectedIndex === dropdown.options.length - 1) dropdown.selectedIndex = 0
      else dropdown.selectedIndex++
    } else {
      if (dropdown.selectedIndex === 0) dropdown.selectedIndex = dropdown.options.length - 1
      else dropdown.selectedIndex--
    }
    generateScenario()
  }

  const paramRanges = calcResultParamRanges(inputs)

  if (visuResults) drawVisualisationGraph(visuResults, simulation.current, currentStep, canvasSize)

  function getCaseParams() {
    return {
      r: parseConst('#c-r'),
      rec: parseConst('#c-rec'),
      ??: parseConst('#c-v'),
      ??: parseFloat(inputs.scenario.??),
      start: parseFloat(inputs.scenario.start),
      capMax: parseFloat(inputs.scenario.capMax),
      S: 100,
    }
  }

  function generateScenario() {

    const cseParams = getCaseParams()
    simulation.current = createSimulation(simulationInputs(cseParams))
    runScenario()
  }

  function runScenario() {

    if (!simulation.current) return

    const cseParams = getCaseParams()
    const cse = caseStr({r: cseParams.r, rec: cseParams.rec, ??: cseParams.??})
    const stratType = parseConst('#c-type', 'string')
    const optimum = parseConst('#c-opt', 'string')

    if (stratType === 'xTrad') {
      const xTrad = findxTrad(cse, results)
      const fixedParams = { D: xTrad.D.toString(), P: xTrad.P.toString(), f: xTrad.f.toString(), I: xTrad.I.toString() }
      const flexParams = { e: xTrad.e.toString(), a: xTrad.a.toString() }
      const family = generateArchitectures(fixedParams, flexParams)[0]
      updateVisuResults(simulation.current.runTradVisual({ ...family.cfgs[0], ...fixedParams }))
    }
    if (stratType === 'flexS' || stratType === 'flexM') {

      let strat = {
        J: parseConst('#c-J'),
        Lm: stratType === 'flexS' ? 1 : parseConst('#c-Lm')
      }

      const flexParams = { e: inputs.architecture.e, a: inputs.architecture.a }

      function runScen(flex) {
        const fixedParams = { D: flex.D.toString(), P: flex.P.toString(), f: flex.f.toString(), I: flex.I.toString() }
        const family = generateArchitectures(fixedParams, flexParams)//[0]
        const arcsTrad = simulation.current.runTrad(family)
        const arcsParetoFam = filterParetoOptimal(arcsTrad)[0]
        updateVisuResults(simulation.current.runFlexVisual(arcsParetoFam, { J: flex.J, Lm: flex.Lm }))
      }

      if (stratType === 'flexS') {
        const flexS = (optimum === 'true') ? findxFlex(cse, results, 'single') : findFlex(cse, strat, results, 'single')
        runScen(flexS)
      }

      if (stratType === 'flexM') {
        const flexM = (optimum === 'true') ? findxFlex(cse, results, 'multi') : findFlex(cse, strat, results, 'multi')
        runScen(flexM)
      }
    }

  }

  function updatePlayspeed(e) {
    const selectedSpeed = e.target.value
    const playspeedConfig = {
      'slow': 1,
      'medium': 2,
      'fast': 3
    }
    setPlayspeed(playspeedConfig[selectedSpeed])
  }

  function calcDisabled(dropDownType) {
    const type = parseConst('#c-type', 'string')
    const opt = parseConst('#c-opt', 'string')
    if (dropDownType === 'opt') return type === 'xTrad'
    if (dropDownType === 'strat') return type === 'xTrad' || opt === 'true'
    if (dropDownType === 'stratM') return type === 'xTrad' || type === 'flexS' || opt === 'true'
  }

  function selectTimeFromGraph(e) {
    if (!simulation.current) return
    const rect = e.target.getBoundingClientRect();
    const V_GRAPH_WIDTH = canvasSize.w - VisGraph.LEFT - VisGraph.RIGHT
    const x = e.clientX - rect.x - VisGraph.LEFT
    const proportion = minMax(0, x / V_GRAPH_WIDTH, 1)
    const selectedStep = Math.round(proportion * simulation.current.inputs.steps)
    updateStep(() => selectedStep)
  }

  return (
    <Flex f='FSVS' w='600px' cn='h100 rig bc2 ct1' p='20px 0 0 0'>

      <Flex f='FSVS rel w100' p='0 30px'>
        <Flex f='FS' cn='font-title'>Inputs</Flex>

        <Center cn='w100 bc2-3' h='1px' m='10px 0' />

        <Flex f='FBS' cn='w100'>

          <Flex f='FSV' w='140px'>
            <Center cn='font-title3'>Case</Center>
            <Flex f='FSV' cn='rel' l='-18px' mt='10px'>
              <DropdownConst id='c-r' name='r' options={paramRanges.r} onChange={generateScenario} />
              <DropdownConst id='c-rec' name='rec' options={paramRanges.rec} onChange={generateScenario} />
              <DropdownConst id='c-v' name='??' options={paramRanges.??} onChange={generateScenario} />
            </Flex>
          </Flex>

          <Flex f='FSV' pr='20px'>
            <Center cn='font-title3' ml='30px'>Strategy</Center>
            <Grid gtc='1fr 1.1fr' cn='w100' mt='10px'>
              <Flex f='FSV' cn='rel' l='0px'>
                <DropdownConst id='c-type' name='Type' options={['xTrad', 'flexS', 'flexM']} onChange={runScenario} />
                <DropdownConst id='c-opt' name='Optimal' options={['true', 'false']} onChange={runScenario} disabled={calcDisabled('opt')} />
              </Flex>
              <Flex f='FSV' cn='rel' l='0px'>
                <DropdownConst id='c-J' name='J' options={paramRanges.J} onChange={runScenario} disabled={calcDisabled('strat')} />
                <DropdownConst id='c-Lm' name='Lm' options={paramRanges.Lm} onChange={runScenario} disabled={calcDisabled('stratM')} />
              </Flex>
            </Grid>
          </Flex>

          <Flex f='FSV'>
            <Center cn='font-title3 rig'>Generate</Center>
            <Flex
              w='90px' f='FCV' mt='15px' h='90px'
              cn={`c-l1 font-small us-none bc1 ptr grow hoverGrow`}
              oc={generateScenario}
            >
              <Img src='generateScenario2.svg' w='80%' h='80%' cn='of-cont' />
            </Flex>
          </Flex>
        </Flex>
      </Flex>


      <Flex f='FSVS rel grow w100' p='0' mt='35px'>

        <Flex f='FSVS' cn='w100 rel' p='0 30px'>
          <Flex f='FS' cn='font-title'>Simulation</Flex>
          <Center cn='w100 bc2-3' h='1px' m='13px 0' />
          <Flex f='FB' cn='w100 rel' t='-5px'>
            <DropdownConst id='simu-speed' name='Speed' options={['slow', 'medium', 'fast']} lw='43px' w='130px' onChange={e => updatePlayspeed(e)} />
            <Flex f='FS'>
              <SimulationBtn src={playing ? 'pause' : 'play'} w='80px' ml='105px' visuResults={visuResults}
                updateFunc={() => {
                  if (currentStep === simulation.current.inputs.steps - 1) updateStep(() => 0)
                  setPlaying(prev => !prev)
                }}
              />
              <SimulationBtn src='start' w='40px' ml='10px' visuResults={visuResults}
                updateFunc={() => {
                  updateStep(() => 0)
                  setPlaying(false)
                }}
              />
              <SimulationBtn src='backward' w='40px' ml='10px' visuResults={visuResults}
                updateFunc={() => {
                  if (currentStep > 0) updateStep(prev => prev - 1)
                  setPlaying(false)
                }}
              />
              <SimulationBtn src='forward' w='40px' ml='10px' visuResults={visuResults}
                updateFunc={() => {
                  if (currentStep < simulation.current.inputs.steps - 1) updateStep(prev => prev + 1)
                  setPlaying(false)
                }}
              />
              <SimulationBtn src='end' w='40px' ml='10px' visuResults={visuResults}
                updateFunc={() => {
                  updateStep(() => simulation.current.inputs.steps - 1)
                  setPlaying(false)
                }}
              />
            </Flex>
          </Flex>
        </Flex>

        <Center id='canvas-container' bc='#fff' mt='20px' cn={`rel w100 grow ${simulation.current ? 'ptr' : ''}`} oc={e => selectTimeFromGraph(e)}>
          <canvas id='visu-canvas' width={canvasSize.w} height={canvasSize.h} style={{ 'width': `${canvasSize.w}px`, 'height': `${canvasSize.h}px` }}></canvas>
        </Center>

      </Flex>

    </Flex >
  )
}

function SimulationBtn({ updateFunc, src, visuResults, ...cssProps }) {

  return (
    <Center
      {...cssProps}
      h='25px' mt='5px'
      cn={`c-l1 font-small us-none bc1 ${visuResults ? 'ptr hoverGrow' : ''}`}
      o={visuResults ? '1' : '0.5'}
      oc={visuResults ? updateFunc : () => { }}
    >
      <Img src={`${src}.svg`} cn='of-cont' w='60%' h='60%' />
    </Center>
  )
}