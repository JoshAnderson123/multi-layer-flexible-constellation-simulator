import React, { useRef } from 'react'
import { generateArchitectures } from '../../utils/architectures'
import { createSimulation } from '../../utils/simulation'
import { calcResultParamRanges } from '../../utils/tradespace'
import { findFlex, findxFlex, findxTrad, parseConst, simulationInputs } from '../../utils/utilGeneral'
import { Center, Flex, Grid, Img } from '../blocks/blockAPI'
import { DropdownConst } from '../simulator/Dropdown'
import { V_CANVAS_WIDTH, V_CANVAS_HEIGHT } from '../../config'
import { drawVisualisationGraph } from '../../utils/draw'

export default function VisualiserSideBar({ inputs, results, visuResults, setVisuResults, playing, setPlaying, currentStep, updateStep, playspeed, setPlayspeed }) {

  const simulation = useRef()
  const paramRanges = calcResultParamRanges(inputs)

  if (visuResults) drawVisualisationGraph(visuResults, simulation.current, playing, currentStep)

  function generateScenario() {

    const stratType = parseConst('#c-type', 'string')
    const optimum = parseConst('#c-opt', 'string')

    const scen = {
      r: parseConst('#c-r'),
      rec: parseConst('#c-rec'),
      σ: parseConst('#c-v'),
      S: 100,
    }

    simulation.current = createSimulation(simulationInputs(scen))

    if (stratType === 'xTrad') {
      const xTrad = findxTrad(scen, results)
      const fixedParams = { D: xTrad.D.toString(), P: xTrad.P.toString(), f: xTrad.f.toString(), I: xTrad.I.toString() }
      const flexParams = { e: xTrad.e.toString(), a: xTrad.a.toString() }
      const family = generateArchitectures(fixedParams, flexParams)[0]
      setVisuResults(simulation.current.runTradVisual(family.cfgs[0]))
    }
    if (stratType === 'flexS' || stratType === 'flexM') {

      let strat = {
        J: parseConst('#c-J'),
        Lm: stratType === 'flexS' ? 1 : parseConst('#c-Lm'),
        Ld: parseConst('#c-Ld'),
      }

      if (stratType === 'flexS') {
        const flexS = (optimum === 'true') ? findxFlex(scen, results, 'single') : findFlex(scen, strat, results, 'single')
        const fixedParams = { D: flexS.D.toString(), P: flexS.P.toString(), f: flexS.f.toString(), I: flexS.I.toString() }
        const flexParams = { e: inputs.architecture.e, a: inputs.architecture.a }
        const family = generateArchitectures(fixedParams, flexParams)[0]

        setVisuResults(simulation.current.runFlexVisual(family, { J: flexS.J, Lm: flexS.Lm, Ld: flexS.Ld }))
      }

      if (stratType === 'flexM') {
        const flexM = (optimum === 'true') ? findxFlex(scen, results, 'multi') : findFlex(scen, strat, results, 'multi')
        const fixedParams = { D: flexM.D.toString(), P: flexM.P.toString(), f: flexM.f.toString(), I: flexM.I.toString() }
        const flexParams = { e: inputs.architecture.e, a: inputs.architecture.a }
        const family = generateArchitectures(fixedParams, flexParams)[0]
        setVisuResults(simulation.current.runFlexVisual(family, { J: flexM.J, Lm: flexM.Lm, Ld: flexM.Ld }))
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
    const x = e.clientX
    const rect = e.target.getBoundingClientRect();
    const proportion = (x - rect.x) / rect.width
    const selectedStep = Math.round(proportion * simulation.current.inputs.steps)
    updateStep(() => selectedStep)
  }

  return (
    <Flex w='600px' cn='h100 rig bc-l2' p='20px 0'>

      <Flex f='FSVS rel' p='0 20px'>
        <Flex f='FS' cn='font-title'>Inputs</Flex>

        <Center cn='w100 bc-d3' h='1px' m='10px 0' />

        <Grid gtc='1fr 1.5fr' cn='w100'>
          <Flex f='FSV'>
            <Center cn='font-title3'>Scenario</Center>
            <Flex f='FSV' cn='rel' l='-10px'>
              <DropdownConst id='c-r' name='r' options={paramRanges.r} />
              <DropdownConst id='c-rec' name='rec' options={paramRanges.rec} />
              <DropdownConst id='c-v' name='σ' options={paramRanges.σ} />
            </Flex>
          </Flex>
          <Flex f='FSV'>
            <Center cn='font-title3'>Strategy</Center>
            <Grid gtc='1fr 1fr' cn='w100'>
              <Flex f='FSV' cn='rel' l='10px'>
                <DropdownConst id='c-type' name='Type' options={['xTrad', 'flexS', 'flexM']} onChange={generateScenario} />
                <DropdownConst id='c-opt' name='Optimum' options={['true', 'false']} onChange={generateScenario} disabled={calcDisabled('opt')} />
              </Flex>
              <Flex f='FSV' cn='rel' l='-40px'>
                <DropdownConst id='c-J' name='J' options={paramRanges.J} onChange={generateScenario} disabled={calcDisabled('strat')} />
                <DropdownConst id='c-Lm' name='Lm' options={paramRanges.Lm} onChange={generateScenario} disabled={calcDisabled('stratM')} />
                <DropdownConst id='c-Ld' name='Ld' options={paramRanges.Ld} onChange={generateScenario} disabled={calcDisabled('stratM')} />
              </Flex>
            </Grid>

          </Flex>
        </Grid>

        <Center cn='w100 bc-d3' h='1px' m='20px 0 10px 0' />

        <Center cn='w100'>
          <Center
            w='230px' h='30px'
            cn={`c-l1 font-small us-none bc1 ptr hoverGrow`}
            oc={generateScenario}
          >
            Generate scenario
          </Center>
        </Center>

      </Flex>

      <Center cn='w100 bc-d3' h='1px' m='20px 0' />

      <Flex f='FSVS rel' p='0 20px'>
        <Flex f='FS' cn='font-title'>Simulation</Flex>

        <Center cn='w100 bc-d3' h='1px' m='10px 0' />

        <Flex f='FS' cn='w100 rel' t='-5px' l='20px'>
          <DropdownConst id='simu-speed' name='Speed' options={['slow', 'medium', 'fast']} w='120px' onChange={e => updatePlayspeed(e)} />

          <Center
            w='40px' h='30px' mt='10px' ml='20px'
            cn={`c-l1 font-small us-none bc1 ptr hoverGrow`}
            oc={() => setPlaying(prev => !prev)}
          >
            <Img src={`${playing ? 'pause' : 'play'}.svg`} cn='of-cont' w='60%' h='60%' />
          </Center>

          <Center
            w='20px' h='30px' mt='10px' ml='20px'
            cn={`c-l1 font-small us-none bc1 ptr hoverGrow`}
            oc={() => {
              if (currentStep > 0) updateStep(prev => prev - 1)
              setPlaying(false)
            }}
          >
            <Img src='backward.svg' cn='of-cont' w='60%' h='60%' />
          </Center>

          <Center
            w='20px' h='30px' mt='10px' ml='1px'
            cn={`c-l1 font-small us-none bc1 ptr hoverGrow`}
            oc={() => {
              if (currentStep < simulation.current.inputs.steps - 1) updateStep(prev => prev + 1)
              setPlaying(false)
            }}
          >
            <Img src='forward.svg' cn='of-cont' w='60%' h='60%' />
          </Center>

          <Center
            w='40px' h='30px' mt='10px' ml='20px'
            cn={`c-l1 font-small us-none bc1 ptr hoverGrow`}
            oc={() => {
              updateStep(0)
              setPlaying(false)
            }}
          >
            <Img src='reset.svg' cn='of-cont' w='60%' h='60%' />
          </Center>

        </Flex>

        <Center w={`${V_CANVAS_WIDTH}px`} h={`${V_CANVAS_HEIGHT}px`} bc='#fff' mt='10px' cn={`rel ${simulation.current ? 'ptr' : ''}`} oc={e => selectTimeFromGraph(e)}>
          <canvas id='visu-canvas' width={V_CANVAS_WIDTH} height={V_CANVAS_HEIGHT} style={{ 'width': `${V_CANVAS_WIDTH}px`, 'height': `${V_CANVAS_HEIGHT}px` }}></canvas>
        </Center>

      </Flex>

    </Flex >
  )
}
