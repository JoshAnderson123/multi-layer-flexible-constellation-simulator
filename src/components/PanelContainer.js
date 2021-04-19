import React from 'react'
import ArcTSPanel from './ArcTSPanel'
import { Center } from './blocks/blockAPI'
import HeatmapPanel from './HeatmapPanel'
import ResultsPanel from './ResultsPanel'
import RunningPanel from './RunningPanel'
import SetupPanel from './SetupPanel'

export default function PanelContainer({ panel, setPanel, inputs, setInputs, results, updateResults }) {

  function hidePopup(e) {
    if (e.target !== e.currentTarget) return
    setPanel(false)
  }

  return (
    <Center cn='f abs ov-h' bc='rgba(0,0,0,0.6)' oc={e => hidePopup(e)} >
      {panel === 'setup' ? <SetupPanel setPanel={setPanel} inputs={inputs} setInputs={setInputs} /> : null}
      {panel === 'running' ? <RunningPanel inputs={inputs} setPanel={setPanel} updateResults={updateResults} /> : null}
      {panel === 'results' ? <ResultsPanel setPanel={setPanel} inputs={inputs} results={results} /> : null}
      {panel === 'heatmap' ? <HeatmapPanel setPanel={setPanel} inputs={inputs} results={results} /> : null}
      {panel === 'arcts' ? <ArcTSPanel setPanel={setPanel} inputs={inputs} results={results} /> : null}
    </Center>
  )
}