import React from 'react'
import ArcTSPanel from './ArcTSPanel'
import { Center } from '../blocks/blockAPI'
import HeatmapPanel from './HeatmapPanel'
import ResultsPanel from './ResultsPanel'
import RunningPanel from './RunningPanel'
import SetupPanel from './SetupPanel'
import VisualiserPanel from '../visualiser/VisualiserPanel'

export default function PanelContainer({ panel, setPanel, inputs, setInputs, results, updateResults }) {

  function hidePopup(e) {
    if (e.target !== e.currentTarget) return
    setPanel(false)
  }

  return (
    <Center cn='f abs ov-h bc2' oc={e => hidePopup(e)} >
      {panel === 'setup' ? <SetupPanel setPanel={setPanel} inputs={inputs} setInputs={setInputs} /> : null}
      {panel === 'running' ? <RunningPanel inputs={inputs} setPanel={setPanel} updateResults={updateResults} /> : null}
      {panel === 'results' ? <ResultsPanel setPanel={setPanel} inputs={inputs} results={results} updateResults={updateResults} /> : null}
      {panel === 'heatmap' ? <HeatmapPanel setPanel={setPanel} inputs={inputs} results={results} /> : null}
      {panel === 'arcts' ? <ArcTSPanel setPanel={setPanel} inputs={inputs} results={results} /> : null}
      {panel === 'visualise' ? <VisualiserPanel inputs={inputs} setPanel={setPanel} results={results} /> : null}
    </Center>
  )
}