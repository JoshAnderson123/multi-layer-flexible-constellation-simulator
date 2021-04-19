import { calculatePathDistance } from '../satGeo'

function dB(A) { return 10 * Math.log10(A) }  // Converts number to dB
function toRatio(A) { return 10 ** (A / 10) } // Converts dB to number

/**
 * Calculates the data rate of a constellation
 * @param {number} D Antenna diameter (m)
 * @param {number} f Transmitter frequency (GHz)
 * @param {number} P Transmitter Power (W)
 * @param {number} e Minimum Elevation Angle (deg)
 * @param {number} a Altitude (km)
 * @return {object} Data rate (Mbps)
 */
export function calcDataRate(D, f, P, e, a) {

  const C = 2000                                       // Number of Simultaneous Carriers per satellite (Benchmarked using Starlink)
  const k = -228.6                                     // Boltzmann Constant

  const ηTx = 0.6                                      // Tx Antenna Efficiency
  const GTx = 20.4 + 2 * dB(f) + 2 * dB(D) + dB(ηTx)   // Tx Antenna Gain (dBi)
  const LlTx = 5                                       // Tx Backoff and Line Loss (dB)
  const EIRPs = dB(P) + GTx - LlTx                     // EIRP, Satellite (dBW)
  const EIRPc = EIRPs - dB(C)                          // EIRP per carrier

  const dist = calculatePathDistance(e, a) / 1000      // Propagation Range (km)
  const Ls = 92.45 + 2 * dB(dist) + 2 * dB(f)          // Space Loss (dB)
  const La = 1.5                                       // Atmospheric Loss (dB)
  const Lp = Ls + La                                   // Net path Loss (dB)

  const DRx = 2                                        // Receiver Diameter (m)

  const ηRx = 0.55                                     // Rx Antenna Efficiency
  const GRx = 20.4 + 2 * dB(f) + 2 * dB(DRx) + dB(ηRx) // Rx Antenna Gain (dBi)
  const LlRx = 2                                       // Rx Line Loss (dB)

  const T = 27.3                                       // System Noise Temperature (dB-K)
  const G_T = GRx - T                                  // Rx Antenna Gain-to-noise temperature (dB/K)

  const L = Lp + LlRx                                  // Total Loss (dB)
  const Eb_N0 = 12.3                                   // Required Nb/N0

  return toRatio(EIRPc + G_T - L - k - Eb_N0) / 1e6    // Mbps
}


/**
 * Calculates the data rate of a constellation
 * @param {object} arch Architecture design
 * @return {object} Capacity (Number of simultaneous channels)
 */
export function calcCapacity(arch, numSats) {

  const { D, f, P, e, a, I } = arch

  const Rd = calcDataRate(D, f, P, e, a)

  const Z = 928     // From Xia 2019
  const K = 5       // From Portillio 2018
  const Bsat = 2000 // MHz - from Portillio 2018
  const BT = 250    // MHz - From Portillo 2018
  const Bg = 0      // MHz - (Not mentioned anywhere)
  const Tf = 90     // ms - From Chang 2003
  const F = 864     // bits - From Chang 2003
  const n = 432     // From Chang 2003
  const Tg = 0.36   // ms - From Chang 2003

  const Chs = (Z / (2 * K)) * (Bsat / (BT + Bg)) * (((Rd * Tf) - F) / (n + (Rd * Tg)))

  const bodgeFactor = 1e-1
  const maxChs = (Chs * numSats) * bodgeFactor

  const Us = {
    'None': 0.1,
    'Ring': 0.7,
    'Mesh': 0.9
  }

  return Math.max(0, maxChs * Us[I])
}