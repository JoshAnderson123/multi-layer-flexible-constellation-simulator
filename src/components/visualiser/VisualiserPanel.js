import Visualiser from './Visualiser'
import VisualiserOptions from './VisualiserOptions'
import React, { useEffect, useRef, useState } from 'react'
import { defaultSim, render } from '../../config'
import { Center, Flex } from '../blocks/blockAPI'
import PanelTopBar from '../simulator/PanelTopBar'
import VisualiserSideBar from './VisualiserSideBar'

export const RenderContext = React.createContext()

export default function VisualiserPanel({ setPanel, inputs, results }) {

  let [renderCtx, setRenderCtx] = useState(render)
  let [constellation, setConstellation] = useState([])
  let [playing, setPlaying] = useState()
  let [playspeed, setPlayspeed] = useState(1)
  let [currentStep, setCurrentStep] = useState(0)
  let [visuResults, setVisuResults] = useState()
  let prevStep = useRef(0)

  function updateStep(func) {
    setCurrentStep(prev => {
      prevStep.current = prev
      return func(prev)
    })
  }

  function incrementStep() {
    if (currentStep === defaultSim.steps - playspeed) return
    updateStep(prev => Math.min(prev + playspeed, defaultSim.steps - 1))
  }

  useEffect(() => {

    if (playing) setTimeout(incrementStep(), 30)


    if (visuResults && JSON.stringify(visuResults.layers[currentStep]) !== JSON.stringify(visuResults.layers[prevStep.current])) {
      setConstellation(visuResults.layers[currentStep])
    }

  }, [currentStep, playing, visuResults])


  return (
    <div className="page-container">
      <Flex f='FSV' w='100%' h='100%' bc='#ddd' cn='rel bsh3 c-d1'>
        <PanelTopBar setPanel={setPanel} />
        <Flex f='FB' cn='w100 grow rel'>
          <VisualiserSideBar
            inputs={inputs} results={results} visuResults={visuResults} setVisuResults={setVisuResults}
            playing={playing} setPlaying={setPlaying} currentStep={currentStep} updateStep={updateStep}
            playspeed={playspeed} setPlayspeed={setPlayspeed}
          />
          <Center cn='h100 grow rel'>
            <Visualiser renderCtx={renderCtx} constellation={constellation} />
            <VisualiserOptions renderCtx={renderCtx} setRenderCtx={setRenderCtx} />
          </Center>
        </Flex>
      </Flex>
      {/* <div className="top-bar"></div> */}
      <div className="simulation-container">

      </div>
    </div>
  );
}