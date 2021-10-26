import Visualiser from './Visualiser'
import VisualiserOptions from './VisualiserOptions'
import React, { useEffect, useRef, useState } from 'react'
import { defaultSim, render } from '../../config'
import { Center, Flex } from '../blocks/blockAPI'
import PanelTopBar from '../simulator/PanelTopBar'
import VisualiserSideBar2 from './VisualiserSideBar2'
import VisualiserStatsPanelTop from './VisualiserStatsPanelTop'
import VisualiserStatsPanelBottom from './VisualiserStatsPanelBottom'

export const RenderContext = React.createContext()

export default function VisualiserPanel2({ setPanel, inputs, results, keyboardListener }) {

  let [renderCtx, setRenderCtx] = useState(render)
  let [constellation, setConstellation] = useState([])
  let [playing, setPlaying] = useState()
  let [playspeed, setPlayspeed] = useState(1)
  let [currentStep, setCurrentStep] = useState(defaultSim.steps - 1)
  let [visuResults, setVisuResults] = useState()
  let [viewLayers, setViewLayers] = useState([true, true, true, true, true])
  let [viewSidebar, setViewSidebar] = useState(true)
  let prevConstellation = useRef(0)

  useEffect(() => {
    keyboardListener.current.addEvent({
      conditions: ['Space'],
      action: () => setViewSidebar(prev => !prev)
    })
  }, [])

  useEffect(() => {

    if (playing) setTimeout(incrementStep, 100)

    if (visuResults && constellationChange()) {
      setConstellation(visuResults.layers[currentStep])
    }

  }, [currentStep, playing, visuResults])

  useEffect(() => {
    setViewLayers([true, true, true, true, true])
  }, [visuResults])

  function updateStep(func) {
    setCurrentStep(prev => {
      prevConstellation.current = visuResults.layers[prev]
      return func(prev)
    })
  }

  function updateVisuResults(val) {
    setVisuResults(_ => {
      prevConstellation.current = visuResults?.layers[currentStep]
      return val
    })
  }

  function incrementStep() {
    if (currentStep === defaultSim.steps - playspeed) {
      setPlaying(false)
      return
    }
    updateStep(prev => Math.min(prev + playspeed, defaultSim.steps - 1))
  }

  function constellationChange() {
    return JSON.stringify(visuResults.layers[currentStep]) !== JSON.stringify(prevConstellation.current)
  }

  return (
    <div className="page-container">
      <Flex f='FSV' w='100%' h='100%' bc='#ddd' cn='rel bsh3 c-d1'>
        {/* <PanelTopBar setPanel={setPanel} /> */}
        <Flex f='FB' cn='w100 grow rel'>
          <Center cn='f abs'>
            <Visualiser renderCtx={renderCtx} constellation={constellation} viewLayers={viewLayers} viewSidebar={viewSidebar} />
            {/* {visuResults ? <VisualiserStatsPanelTop visuResults={visuResults} currentStep={currentStep} viewLayers={viewLayers} setViewLayers={setViewLayers} /> : null} */}
            {/* {visuResults ? <VisualiserStatsPanelBottom visuResults={visuResults} /> : null} */}
            <VisualiserOptions renderCtx={renderCtx} setRenderCtx={setRenderCtx} />
          </Center>
          <VisualiserSideBar2
            inputs={inputs} results={results} visuResults={visuResults} updateVisuResults={updateVisuResults}
            playing={playing} setPlaying={setPlaying} currentStep={currentStep} updateStep={updateStep}
            playspeed={playspeed} setPlayspeed={setPlayspeed} setPanel={setPanel} viewSidebar={viewSidebar}
            keyboardListener={keyboardListener}
          />
        </Flex>
      </Flex>
      {/* <div className="top-bar"></div> */}
      <div className="simulation-container">

      </div>
    </div>
  );
}