import { createSimulation } from './simulation'
// eslint-disable-next-line
import { generateArchitectures, calcBoundaries } from './architectures'
// eslint-disable-next-line
import { drawArchTradespace, drawDemandScenarios } from './draw'
// eslint-disable-next-line
import { optimiseTrad, filterParetoOptimal, optimiseFlex } from './optimise';
// eslint-disable-next-line
import { dollars, logBig, logNS, logT } from './utilGeneral'

// Inputs for the simulation
const simulationInputs = {
  T: 10,             // Simulation time (Years)
  μ: 0.77,           // Annual expected rate of return 
  σ: 0.2,            // Volatility 
  steps: 480,        // Steps in each scenario (480 in 10 years = 1 step/week (approx))
  start: 50000,      // Start demand
  numScenarios: 100,// Number of scenarios
  r: 0.55,           // Discount rate
  capMax: 15e6,      // Maximum capacity
  reconCost: 0.20    // Reconfiguration cost (% of production cost (per reconfiguration))
}

export function fullExperiment(title, inputs, setPopup) {

  const TSB_Arcs_Fixed = {
    D: inputs.architecture.D,
    P: inputs.architecture.P,
    f: inputs.architecture.f,
    ISL: inputs.architecture.I
  }
  const TSB_Arcs_Flex = {
    a: inputs.architecture.a,
    e: inputs.architecture.e
  }
  const TSB_Single = {
    capJump: inputs.strategy.J,
    maxLayers: '1',
    depLayers: '1'
  }
  const TSB_Multi = {
    capJump: inputs.strategy.J,
    maxLayers: inputs.strategy.Lm,
    depLayers: inputs.strategy.Ld
  }

  console.clear()
  console.time('simulation time')
  //// Generate Architectural Tradespace
  const architectures = generateArchitectures(TSB_Arcs_Fixed, TSB_Arcs_Flex)

  //// Create Simulation
  const simulation = createSimulation(simulationInputs, architectures)

  //// Generate Architectural Tradespace for the Traditional Strategy
  const archsTrad = simulation.runTrad(architectures)

  //// Find the best traditional strategy (xTrad): minimise LCC, subject to: cap > capMax
  const xTrad = optimiseTrad(archsTrad, simulation.inputs.capMax)

  //// Filter each family to only include pareto optimal architectures
  const archsParetoFam = filterParetoOptimal(archsTrad)

  //// Optimise Flex Single and Flex Multi
  const xFlexS = optimiseFlex(simulation, archsParetoFam, TSB_Single, 'flexS')
  const xFlexM = optimiseFlex(simulation, archsParetoFam, TSB_Multi, 'flexM')

  logNS('========================')
  logBig(title)
  logNS('========================')
  logT('simulation time')

  //// Generate Boundaries - used for drawing
  const boundaries = calcBoundaries(archsParetoFam)

  //// Log results
  logNS('---------------')
  logNS(`xTrad ELCC: ${dollars(xTrad.LCC)}`)
  logNS(`xFlexS ELCC: ${dollars(xFlexS.ELCC)}`)
  logNS(`xFlexM ELCC: ${dollars(xFlexM.ELCC)}`)
  logNS(`xFlexM/xFlexS: ${((xFlexM.ELCC / xFlexS.ELCC) * 100).toFixed(2)}%`)
  // logBig(`Cost Reduction: ${(100 - ((xFlexS.ELCC / xTrad.LCC) * 100)).toFixed(2)}%`)
  logNS('---------------')
  logNS('xTrad', xTrad)
  logNS('xFlexS', xFlexS)
  logNS('xFlexM', xFlexM)
  // logNS('xTrad', JSON.stringify(xTrad, null, 2))
  // logNS('xFlexS', JSON.stringify(xFlexS, null, 2))
  // logNS('xFlexM', JSON.stringify(xFlexM, null, 2))

  //// Display Results
  drawArchTradespace(archsParetoFam, boundaries, xTrad, simulation.inputs.capMax, xFlexS, xFlexM)

  setPopup(false)
}

// export function runSmallExperiment(setSimulationMode) {
//   fullExperiment('Small Experiment', setSimulationMode, TSB_Arcs2_FixedN, TSB_Arcs2_FlexN, TSB_Single3N, TSB_Multi3N)
// }

// export function runMediumExperiment(setSimulationMode) {
//   fullExperiment('Medium Experiment', setSimulationMode, TSB_Arcs1_FixedN, TSB_Arcs1_FlexN, TSB_Single2N, TSB_Multi2N)
// }

// export function runFullExperiment(setSimulationMode) {
//   fullExperiment('Full Experiment', setSimulationMode, TSB_Arcs1_FixedN, TSB_Arcs1_FlexN, TSB_Single1N, TSB_Multi1N)
// }

export function runDemand(setSimulationMode) {

  console.clear()

  logNS('testing')

  //// Create Simulation
  const simulation = createSimulation(simulationInputs)


  logNS('========================')
  logBig('Demand Scenarios')
  logNS('========================')
  logNS(simulationInputs)

  //// Display Results
  drawDemandScenarios(simulation)

  setSimulationMode('complete')
}