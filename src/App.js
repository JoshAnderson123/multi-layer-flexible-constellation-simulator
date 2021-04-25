import './css/App.css';
import { useEffect, useState } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, defaultInputs } from './config'
import { Center } from './components/blocks/blockAPI'
import RestartBtn from './components/simulator/RestartBtn';
import PanelContainer from './components/simulator/PanelContainer';

//// DISABLE THIS WHENEVER POSSIBLE
console.warn = console.error = () => { };

function App() {

  const [panel, setPanel] = useState('setup')
  const [inputs, setInputs] = useState(defaultInputs)
  const [results, setResults] = useState({})

  function updateResults(res, ipt) { // Error - the inputs get loaded after the results, causing default inputs to be used
    setResults(res)
    if (ipt) setInputs(ipt)
    setPanel('results')
  }

  return (
    <Center cn='fvwh ov-h'>
      {panel ? <PanelContainer panel={panel} setPanel={setPanel} inputs={inputs} setInputs={setInputs} results={results} updateResults={updateResults} /> : null}
      {!panel ? <RestartBtn setPanel={setPanel} /> : null}
    </Center>
  )
}

export default App;
