import { EARTH_RADIUS } from '../config'
import { asin, sin, cos, PI } from '../utils/utilGeneral'

export function degToRad(deg) { return (deg * Math.PI) / 180 }


/**
 * Calculates a satellites footprint angle based on MEA, altitude and Earths radius 
 * @param {number} e Minimum elevation angle of receiver from horizon to satellite (deg)
 * @param {number} a Altitude of constellation above Earths surface (km)
 * @param {number} R Radius of Earth (km)
 * @return {object} Satellite footprint: {r: radius of footprint, z: ditance from footprint to center of earth}
 */
export function calculateFootprint(e, a, R) {
  const η = asin((R / (R + a)) * cos(degToRad(e))) // Satellite half angle / Nadir angle
  const γ = PI / 2 - degToRad(e) - η                         // Earth Central Angle
  return { r: R * sin(γ), z: R * cos(γ) }
}


/**
 * Calculates the ratio of a satellites beam radius to its footprint radius
 * @param {number} beamAngle Angle of beam (deg)
 * @param {number} footprintAngle Angle of footprint (deg)
 * @return {number} Ratio of beam radius to footprint radius
 */
export function calculateBeamToFootprintRatio(beamAngle, footprintAngle) {
  return Math.tan(degToRad(beamAngle)) / Math.tan(degToRad(footprintAngle))
}


/**
 * Calculates the distance from a satellite to the edge of its footprint
 * @param {number} MEA Minimum elevation angle of receiver from horizon to satellite (deg)
 * @param {number} altitude Altitude of constellation above Earths surface (km)
 * @return {number} Distance from a satellite to the edge of its footprint (km)
 */
export function calculatePathDistance(MEA, altitude) {

  const { z, r } = calculateFootprint(MEA, altitude, EARTH_RADIUS)
  return (((altitude + EARTH_RADIUS - z) ** 2 + r ** 2) ** 0.5) * 1000
}