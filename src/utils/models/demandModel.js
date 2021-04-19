const e = Math.E
const r = Math.random
const min = Math.min


/**
 * Generates the deterministic demand scenario from simulation parameters
 * @param {number} T Simulation timeline (years)
 * @param {number} μ Expected rate of return per year
 * @param {number} start Starting demand value (number of simultaneous channels)
 * @param {number} steps Number of time steps in simulation
 * @return {array} Deterministic demand scenario, and the final demand value
 */
export function deterministicScenario(T, μ, start, steps) {

  const Δt = T / steps // Time step
  const μΔt = ((1 + μ) ** Δt) - 1 // Expected rate of return per time step

  const scenario = [start]
  for (let s = 0; s < steps; s++) {
    const S = scenario[scenario.length - 1]
    scenario.push(S * (1 + μΔt))
  }
  return [scenario, scenario[scenario.length - 1]]
}


/**
 * Generates stochastic demand scenarios from simulation parameters
 * @param {number} T Simulation timeline (years)
 * @param {number} μ Expected rate of return per year
 * @param {number} σ Volatility
 * @param {number} start Starting demand value (number of simultaneous channels)
 * @param {number} steps Number of time steps in simulation
 * @param {number} numScenarios Number of scenarios to generate
 * @param {number} detFinal Final demand value from deterministic scenario
 * @return {array} Stochastic demand scenarios
 */
export function stochasticScenarios(T, μ, σ, start, steps, numScenarios, detFinal) {

  const Δt = T / steps // Time step

  const u = e ** (σ * (Δt ** 0.5))
  const d = 1 / u
  const p = min(((e ** (μ * Δt)) - d) / (u - d), 1)

  const scenarios = []
  const ends = []
  for (let i = 0; i < numScenarios; i++) {
    const scenario = [start]
    for (let s = 0; s < steps; s++) {
      const S = scenario[scenario.length - 1]
      const rand = r()
      scenario.push(rand <= p ? S * u : S * d)
    }
    scenarios.push(scenario)
    ends.push(scenario[scenario.length - 1])
  }

  const stoExpFinal = ends.reduce((acc, val) => acc + val, 0) / ends.length
  const shiftScenarios = shiftedScenarios(scenarios, stoExpFinal / detFinal, steps)

  return shiftScenarios
}


/**
 * Shifts the stochastic demand scenarios so that the expected values match the deterministic scenario
 * @param {array} scenarios Stochastic demand scenarios
 * @param {number} shift the required shift (stoExpFinal / detFinal)
 * @param {number} steps Number of steps in a demand scenario
 * @return {array} Shifted stochastic demand scenarios
 */
export function shiftedScenarios(scenarios, shift, steps) {

  const sft = shift-1

  const shiftedScenarios = []
  for(let s of scenarios) {
    shiftedScenarios.push(s.map((val, idx) => val / (1+(sft*(idx/steps)))))
  }
  return shiftedScenarios
}


/**
 * Calculates the maximum and minimum demand values in all the stochastic demand scenarios
 * @param {array} scenarios Stochastic demand scenarios
 * @return {array} Minimum and maximum value
 */
export function maxMinDemand(scenarios) {

  let minVal = 1e12
  let maxVal = 0

  for(let s of scenarios) {
    minVal = Math.min(minVal, s[s.length-1])
    maxVal = Math.max(maxVal, s[s.length-1])
  }
  return {min: minVal, max: maxVal}
}