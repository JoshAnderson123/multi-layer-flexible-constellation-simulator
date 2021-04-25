import React, { useEffect, useRef, useState } from 'react'
import { calcBoundaries, generateArchitectures } from '../../utils/architectures'
import { drawArchTradespace } from '../../utils/draw'
import { filterParetoOptimal, optimiseFlexM, optimiseFlexS, optimiseTrad } from '../../utils/optimise'
import { createSimulation } from '../../utils/simulation'
import { generateTradespace } from '../../utils/tradespace'
import { dollars, formatArcsPF, formatTime, generateTSB, logBig, logNS, simulationInputs, scenarioData } from '../../utils/utilGeneral'
import { Center, Flex } from '../blocks/blockAPI'

export default function RunningPanel({ inputs, updateResults }) {

  const [cur, setCur] = useState({ strat: 0, scen: -1 }) // Current strategy / scenario

  const tsb = useRef()
  const architectures = useRef()
  const simulation = useRef()
  const resultsTemp = useRef({ flex: [], xTrad: [] })
  const arcsParetoFam = useRef()
  const strats = useRef([])
  const scenarios = useRef([])
  const startTime = useRef(new Date())

  useEffect(() => {

    if (cur.scen === -1) { // Initialise

      tsb.current = generateTSB(inputs)
      architectures.current = generateArchitectures(tsb.current.arcsFixed, tsb.current.arcsFlex)
      scenarios.current = generateTradespace(tsb.current.scenarios)

      simulation.current = createSimulation(simulationInputs(scenarios.current[0]))

      const arcsTrad = simulation.current.runTrad(architectures.current)
      arcsParetoFam.current = filterParetoOptimal(arcsTrad)
      resultsTemp.current.tradespace = formatArcsPF(arcsParetoFam.current)

      const stratsSingle = generateTradespace(tsb.current.stratSingle)
      const stratsMulti = generateTradespace(tsb.current.stratMulti)
      strats.current = [...stratsSingle, ...stratsMulti]

      setCur({ strat: 0, scen: 0 })
    }

    else if (cur.scen < scenarios.current.length) { // Run Simulation

      // Create a new scenario if all strats for previous scenario have been completed
      if (cur.strat === 0) {
        simulation.current = createSimulation(simulationInputs(scenarios.current[cur.scen]), architectures.current)
        const arcsTrad = simulation.current.runTrad(architectures.current)
        const xTrad = optimiseTrad(arcsTrad, simulation.current.inputs.capMax)
        resultsTemp.current.xTrad.push({ ...xTrad, ...scenarioData(scenarios.current[cur.scen]) })
      }

      // Run simulation
      const result = simulation.current.runFlex(arcsParetoFam.current, strats.current[cur.strat])
      resultsTemp.current.flex.push({ ...result, ...scenarioData(scenarios.current[cur.scen]) }) // Append scenario info to the result

      // Update the strategy and scenario counter
      if (cur.strat < strats.current.length - 1) {
        setCur(prev => ({ strat: prev.strat + 1, scen: prev.scen }))
      } else {
        setCur(prev => ({ strat: 0, scen: prev.scen + 1 }))
      }

    }

    else if (cur.scen === scenarios.current.length) { // Print results

      // console.clear()
      logNS('========================')
      logBig('Simultion Results')
      logNS('========================')
      logNS(`Elapsed Time: ${formatTime(calcElapsedTime())}`)
      logNS('---------------')
      logNS(resultsTemp.current)

      updateResults(resultsTemp.current)
    }

  }, [cur])

  function calcfractionComplete() {
    const currentSims = (cur.scen * strats.current.length) + cur.strat
    const totalSims = strats.current.length * scenarios.current.length
    return currentSims / totalSims
  }

  function loadingbarLength() {
    if (strats.current.length === 0) return '0px'
    const fractionComplete = calcfractionComplete()
    return `${Math.round(fractionComplete * 100 * 1e3) / 1e3}%`
  }

  function printCurrentSim() {

    if (scenarios.current.length === 0 || strats.current.length === 0) return '-'

    const scenStr = `${cur.scen + 1}/${scenarios.current.length}`
    const stratStr = `${Math.min(strats.current.length, cur.strat + 1)}/${strats.current.length}`

    return `Scenario: ${scenStr}, Strategy: ${stratStr}`
  }

  function calcElapsedTime() {
    const currentTime = new Date()
    return currentTime - startTime.current
  }

  function calcTimeRemaining() {
    const timeElapsed = calcElapsedTime()
    const completed = calcfractionComplete()
    const totalTime = timeElapsed / completed
    const timeRemaining = totalTime - timeElapsed

    return `Time elapsed: ${formatTime(timeElapsed)}, Time remaining: ${formatTime(timeRemaining)}`
  }

  return (
    <Center f='FSV' w='100%' h='100%' cn='rel ct1 bc2'>
      <Flex f='FSV'>
        <Center cn='font-title2'>
          Running Experiment
        </Center>
        <Flex f='FS' mt='20px' w='300px' h='20px' cn='rel bc2-2 bsh3'>
          <Center cn='abs h100 bc1' w={loadingbarLength()} />
        </Flex>
        <Center cn='font-sim-preview ct1' mt='20px' h='30px'>
          {printCurrentSim()}
        </Center>
        <Center cn='font-sim-preview ct1' mt='10px' h='30px'>
          {calcTimeRemaining()}
        </Center>
      </Flex>
    </Center>
  )
}
