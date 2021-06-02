import './css/App.css';
import { useState } from 'react';
import { defaultInputs } from './config'
import {clumpResults} from './utils/utilGeneral'
import { Center } from './components/blocks/blockAPI'
import RestartBtn from './components/simulator/RestartBtn';
import PanelContainer from './components/simulator/PanelContainer';

function App() {

  const [panel, setPanel] = useState('setup')
  const [data, setData] = useState({inputs: defaultInputs, results: {}})

  function updateResults(res, ipt, gotoResults) { // Error - the inputs get loaded after the results, causing default inputs to be used
    setData(prevData => {
      const newData = {inputs: prevData.inputs, results: prevData.results}
      if (ipt) newData.inputs = ipt
      if (res) newData.results = clumpResults(res)
      return newData
    })
    if(gotoResults) setPanel('results')
  }

  return (
    <Center cn='fvwh ov-h bc2'>
      {panel ? <PanelContainer panel={panel} setPanel={setPanel} inputs={data.inputs} results={data.results} updateResults={updateResults} /> : null}
      {!panel ? <RestartBtn setPanel={setPanel} /> : null}
    </Center>
  )
}

export default App;
