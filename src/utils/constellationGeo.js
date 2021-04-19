import {calculateFootprint} from './satGeo'
import {SCALE_FACTOR, EARTH_RADIUS_SCALED, OVERLAPPING_FOOTPRINT_FACTOR} from '../config'
import * as THREE from 'three';

/**
 * Calculates the polar configuration of an architecture
 * @param {number} MEA Minimum elevation angle of receiver from horizon to satellite
 * @param {number} altitude Altitude of satellites above Earth
 * @return {object} Polar configuration {planes, satellitesPerPlane}
 */
export function getPolarConfiguration(MEA, altitude) {

  const alt = altitude / SCALE_FACTOR
  const { r } = calculateFootprint(MEA, alt, EARTH_RADIUS_SCALED) // Cone angle = minimum elevation angle

  const ro = r / OVERLAPPING_FOOTPRINT_FACTOR        // Overlapping footprint radius
  const mp = (3 ** 0.5) * ro                         // Midpoint distance between adjacent planes
  const as = 2 * Math.asin(ro / EARTH_RADIUS_SCALED) // Angle between adjacent satellites
  const ap = 2 * Math.atan(mp / EARTH_RADIUS_SCALED) // Angle between adjacent planes
  const S = Math.ceil((2 * Math.PI) / as)            // Satellites Per Plane
  const P = Math.ceil((2 * Math.PI) / ap)            // Number of Planes

  return { planes: P, satellitesPerPlane: S }
}


/**
 * Calculates the number of satellites in an architecture (Polar configuration)
 * @param {number} arch Architecture design
 * @return {object} Number of satellites in architecture
 */
export function calcNumSats(arch) {
  const { planes, satellitesPerPlane } = getPolarConfiguration(arch.e, arch.a)
  return planes * satellitesPerPlane
}

export const Xaxis = new THREE.Vector3(1, 0, 0)
export const Yaxis = new THREE.Vector3(0, 1, 0)
export const Zaxis = new THREE.Vector3(0, 0, 1)