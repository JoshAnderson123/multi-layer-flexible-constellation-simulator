import {ln} from '../utilGeneral'

// Ratio of Recurring to Non-Recurring Costs
const recurranceRatios = {
  'bus': 0.4,
  'str': 0.3,
  'thml': 0.5,
  'ADCS': 0.63,
  'EPS': 0.38,
  'prop': 0.5,
  'TTC': 0.29,
  'CDH': 0.29,
  'pay': 0.4,
  'IAT': 1,
  'PL': 0.5,
  'LOOS': 1,
  'GSE': 0
}

const s = 0.85 // Assumed Learning Curve Slope
export const b = 1 - (ln(1 / s) / ln(2))

/**
 * Calculates mass components for an architecture
 * @param {object} arch Architecture design
 * @return {object} Mass components for the architecture
 */
export function calcMasses(arch) {

  const { D, P, I } = arch

  // Calculate Dry Mass
  const ISLMasses = { 'None': 1, 'Ring': 1.05, 'Mesh': 1.2 } // TODO: ISL not currently factored into the cost model
  const Pd = 2089     // Default Power, W
  const Dd = 3.5      // Default Antenna Diameter, m
  const md = 260      // Default Dry Mass, kg
  const dw = 0.95     // Proportion of total mass that is dry mass
  const mp_i = 0.45   // Proportion of dry mass thats Dry Instrument Mass, %
  const mp_b = 0.7    // Proportion of dry mass thats Dry Buss Mass, %
  const misl = ISLMasses[I] // Increase in mass from ISL, %
  const m = md * ((1 - mp_i) + (mp_i * (P / Pd))) * ((D / Dd) ** 2) * misl // Dry Mass
  const tm = m / dw   // Total mass
  const mb = m * mp_b // Bus Dry Mass

  // Calcualte Component Masses 
  const m_str = m * 0.2
  const m_thml = m * 0.04
  const m_ADCS = m * 0.1
  const m_EPS = m * 0.15
  const m_TTC = m * 0.01
  const m_CDH = m * 0.05

  return {
    totalMass: tm,
    dryMass: m,
    cm: {
      bus: mb,
      str: m_str,
      thml: m_thml,
      ADCS: m_ADCS,
      EPS: m_EPS,
      TTC: m_TTC,
      CDH: m_CDH,
    }
  }
}


/**
 * Calculates cost components for an architecture, using SSCM
 * @param {object} masses Masses for a given architcture
 * @param {number} numSats Number of satellites in constellation
 * @return {object} Cost components for the architecture
 */
export function calcSSCMCosts(imInfCosts, numSats) {

  // Calculate Learning Curve Multiplication Factor for Recurring Costs
  const L = numSats ** b

  // Compile Recurring and Non-Recurring Costs
  const costs_r_nr = Object.entries(imInfCosts).reduce((acc, [key, val]) => ({
    ...acc,
    [key]: {
      'r': val * recurranceRatios[key] * L,
      'nr': val * (1 - recurranceRatios[key])
    }
  }), {});

  return costs_r_nr
}


// Calculate Intermediate Cost Values using CERs
function calcImCosts(cm) {
  return {
    'bus': 1064 + 35.5 * ((cm.bus) ** 1.261),    // Spacecraft Bus
    'str': 407 + ((19.3 * cm.str) * ln(cm.str)), // Spacecraft Structure
    'thml': 335 + (5.7 * (cm.thml ** 2)),        // Thermal Control 
    'ADCS': 1850 + (11.7 * (cm.ADCS ** 2)),      // Altitude Determination and Control
    'EPS': 1261 + (539 * (cm.EPS ** 0.72)),      // Electrical Power Supply
    'prop': 89 + (3 * (cm.bus ** 1.261)),        // Propulsion
    'TTC': 486 + (55.5 * (cm.TTC ** 1.35)),      // Telemetry, Tracking & Command
    'CDH': 658 + (75 * (cm.CDH ** 1.35)),        // Command & Data Handling
    'pay': 0.4 * cm.bus,                         // Payload
    'IAT': 0.139 * cm.bus,                       // Integration, Test & Assembly
    'PL': 0.229 * cm.bus,                        // Program Level
    'LOOS': 0.061 * cm.bus,                      // Launch & Orbital Operations Support
    'GSE': 0.066 * cm.bus                        // Ground Support Equipment
  }
}


export function calcImInfCosts(masses) {

  // Calculate Intermediate Cost Values using CERs
  const im = calcImCosts(masses.cm)

  // Adjust for inflation
  const ir2010_2021 = 1.231 // Inflation rate from 2010 to 2021
  const imInf = Object.keys(im).reduce((acc, key) => {
    acc[key] = im[key] * ir2010_2021
    return acc
  }, {})

  return imInf
}


export function calcRecCosts(imInf) {

  return Object.keys(imInf).reduce((acc, key) => {
    acc[key] = imInf[key] * recurranceRatios[key]
    return acc
  }, {})

}


/**
 * Calculates Lifecycle Cost components for a given architecture
 * @param {object} masses Masses for a given architcture
 * @param {number} numSats Number of satellites in constellation
 * @return {object} Lifecycle Cost components
 */
export function calcLCCComponents(imInfCosts, masses, n) {

  const SSCMCosts = calcSSCMCosts(imInfCosts, n)

  const LC = calcLaunchCost(masses.totalMass, n) // Launch Costs
  const PC = calcProdCost(SSCMCosts)             // Production Costs
  const IDC = calcIDCost(SSCMCosts)              // Initial Development Costs - TODO
  const OC = calcOMCost(SSCMCosts)               // Operations & Maintainence Costs
  const RC = calcReconfigCost(SSCMCosts)         // Reconfiguration Costs

  return { LC, PC, IDC, OC, RC }
}


export function combinedOMCosts(n, family) {
  const L = n ** b
  const OC = family.recCosts['LOOS'] * L
  return OC
}


//// Lifecycle Cost Components ////

// Calculate Launch Cost Component
export function calcLaunchCost(mass, n) {
  const falcon9Capacity = 15600      // kg
  const falcon9LaunchCost = 28e3     // $K
  const constellationMass = mass * n // kg
  return Math.ceil(constellationMass / falcon9Capacity) * falcon9LaunchCost
}


// Calculate Production Cost Component
export function calcProdCost(SSCMCosts) {
  const prodCostSrc = ['bus', 'str', 'thml', 'ADCS', 'TTC', 'CDH', 'pay', 'IAT', 'PL']
  return prodCostSrc.reduce((acc, key) => acc + SSCMCosts[key].r, 0)
}


// Calculate Ongoing Maintenance Cost Component
export function calcOMCost(SSCMCosts) {
  return SSCMCosts['LOOS'].r
}


// Calculate Reconfiguration Cost Component
export function calcReconfigCost(SSCMCosts) {
  return SSCMCosts['prop'].r * 10 // / 5
}


// Calculate Initial Development Cost Component
export function calcIDCost(SSCMCosts) {
  return Object.keys(SSCMCosts).reduce((acc, key) => acc + SSCMCosts[key].nr, 0)
}