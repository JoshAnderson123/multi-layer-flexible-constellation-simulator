import { EARTH_RADIUS } from '../config'

export function degToRad(deg) { return (deg * Math.PI) / 180 }


/**
 * Calculates a satellites half angle based on MEA, altitude and Earths radius 
 * @param {number} MEA Minimum elevation angle of receiver from horizon to satellite (deg)
 * @param {number} altitude Altitude of constellation above Earths surface (km)
 * @param {number} radius Radius of Earth (km)
 * @return {object} Satellite half angle (rad)
 */
export function calculateHalfAngle(MEA, altitude, radius) {
  const h = radius + altitude
  return Math.asin((radius * Math.sin(degToRad(MEA) + (Math.PI / 2))) / h)
}


/**
 * Calculates a satellites footprint angle based on MEA, altitude and Earths radius 
 * @param {number} MEA Minimum elevation angle of receiver from horizon to satellite (deg)
 * @param {number} altitude Altitude of constellation above Earths surface (km)
 * @param {number} radius Radius of Earth (km)
 * @return {object} Satellite footprint: {z: ditance from footprint to center of earth, r: radius of footprint}
 */
export function calculateFootprint(MEA, altitude, radius) {

  const h = radius + altitude                             // Height of satellite above earth
  const angle = calculateHalfAngle(MEA, altitude, radius) // Half angle of satellite to receiver
  const stretch = Math.tan(angle)                         // Ratio of altitude to footprint radius
  const offset = -(h * stretch)                           // Offset of satellite (h) in cone equation

  // Quadratic formula - used to find radii of circles where cone intersects sphere
  const A = stretch ** 2 + 1
  const B = 2 * stretch * offset
  const C = offset ** 2 - radius ** 2
  const desc = B ** 2 - (4 * A * C)

  if (desc < 0) return null // If there is no intersection, return null

  const z = (-B + Math.sqrt(desc)) / (2 * A)    // Distance from footprint to center of earth. Closest intersection is always the positive quadrtic solution
  const r = Math.sqrt((radius ** 2) - (z ** 2)) // Radius of footprint

  return { z, r }
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