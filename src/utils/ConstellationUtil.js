import * as THREE from 'three';
import BufferGeometryUtils from '../utils/BufferGeometryUtils'
import { render, ORBIT_RESOLUTION, FOOTPRINT_RESOLUTION, FOOTPRINT_SCALE_FACTOR, SCALE_FACTOR, EARTH_RADIUS_SCALED, OVERLAPPING_FOOTPRINT_FACTOR } from '../config'


export function degToRad(deg) { return (deg * Math.PI) / 180 }


///// SATELLITES /////

export function generateSatellitesGeometry(satellitesPerPlane, h) { // Mesh
  const sat = new THREE.SphereBufferGeometry(render.satelliteSize, 4, 4).translate(h, 0, 0) // 3x2 is smallest geometry
  const satGeoms = []
  const angleSpacing = (Math.PI * 2) / satellitesPerPlane
  for (let i = 0; i < satellitesPerPlane; i++) {
    satGeoms.push(sat.clone().rotateY(i * angleSpacing))
  }
  return BufferGeometryUtils.mergeBufferGeometries(satGeoms)
}


///// CONES /////

export function generateConesGeometry(z, r, h, satellitesPerPlane) {

  const coneGeo = new THREE.ConeBufferGeometry(r, h, 32).rotateZ(-Math.PI / 2).translate((z + (h / 2)) * 1.001, 0, 0)
  const conesGeom = []
  const angleSpacing = (Math.PI * 2) / satellitesPerPlane
  for (let i = 0; i < satellitesPerPlane; i++) {
    conesGeom.push(coneGeo.clone().rotateY(i * angleSpacing))
  }
  return BufferGeometryUtils.mergeBufferGeometries(conesGeom)
}


///// ORBITS /////

export function generateOrbitGeometry(h) {

  const points = [];
  const res = ORBIT_RESOLUTION
  for (let i = 0; i < res; i++) {
    let theta = ((2 * Math.PI) / res) * i
    points.push(new THREE.Vector3(h * Math.cos(theta), 0, h * Math.sin(theta)));
  }

  return new THREE.BufferGeometry().setFromPoints(points);
}


export function generateOrbitsGeometry2(h, inc, planes, lonRange) {

  const orbitGeo = generateOrbitGeometry(h)

  const positions = []
  const indices = []
  for (let p = 0; p < planes; p++) {
    const lon = degToRad(p * (lonRange / planes))

    // Update Positions
    positions.push(...orbitGeo.clone().rotateZ(inc).rotateY(lon).getAttribute("position").array)

    // Update Indices
    for (let i = 0; i < ORBIT_RESOLUTION; i++) {
      const por = p * ORBIT_RESOLUTION
      indices.push(por + i)
      indices.push(i === ORBIT_RESOLUTION - 1 ? por : por + i + 1)
    }
  }

  // Create New Geometry
  const orbitsGeom = new THREE.BufferGeometry()
  orbitsGeom.setIndex(indices)
  orbitsGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  return orbitsGeom
}


///// FOOTPRINTS /////

export function calculateFootprint(MEA, altitude, radius) {
  // MEA = minimum elevetion angle
  // Altitude = altitude of satellite above earths surface
  // Radius = radius of earth

  const h = radius + altitude // Height of satellite above earth
  const angle = Math.asin((radius * Math.sin(degToRad(MEA) + (Math.PI / 2))) / h) // Satellite half angle
  const stretch = Math.tan(angle) // Ratio of altitude to footprint radius
  const offset = -(h * stretch) // Offset of satellite (h) in cone equation

  // Quadratic formula - used to find radii of circles where cone intersects sphere
  const A = stretch ** 2 + 1
  const B = 2 * stretch * offset
  const C = offset ** 2 - radius ** 2
  const desc = B ** 2 - (4 * A * C)

  if (desc < 0) return null

  const z = (-B + Math.sqrt(desc)) / (2 * A) // Distance from footprint to center of earth. Closest intersection is always the positive quadrtic solution
  const r = Math.sqrt((radius ** 2) - (z ** 2)) // Radius of footprint

  return { z, r }
}


export function generateFootprintGeometry(z, r) {

  const points = [];
  const res = FOOTPRINT_RESOLUTION
  for (let i = 0; i < res; i++) {
    const theta = ((2 * Math.PI) / res) * i
    points.push(new THREE.Vector3(
      0,
      r * Math.cos(theta) * FOOTPRINT_SCALE_FACTOR,
      r * Math.sin(theta) * FOOTPRINT_SCALE_FACTOR
    ));
  }
  return new THREE.BufferGeometry().setFromPoints(points).translate(z, 0, 0)
}


export function generateFootprintsGeometry(z, r, satellitesPerPlane) {

  const footprintGeom = generateFootprintGeometry(z, r)

  const positions = []
  const indices = []
  const angleSpacing = (Math.PI * 2) / satellitesPerPlane
  for (let f = 0; f < satellitesPerPlane; f++) {
    // Update Positions
    positions.push(...footprintGeom.clone().rotateY(f * angleSpacing).getAttribute("position").array)

    // Update Indices
    for (let i = 0; i < FOOTPRINT_RESOLUTION; i++) {
      const por = f * FOOTPRINT_RESOLUTION
      indices.push(por + i)
      indices.push(i === FOOTPRINT_RESOLUTION - 1 ? por : por + i + 1)
    }
  }

  // Create New Geometry
  const footprintsGeom = new THREE.BufferGeometry()
  footprintsGeom.setIndex(indices)
  footprintsGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  return footprintsGeom
}


///// MISC /////

export function calcOffsetAngle(type, p, planes, satellitesPerPlane) {
  const satelliteSpacingAngle = (Math.PI * 2) / satellitesPerPlane
  if (type === null | type === "drift") return (satelliteSpacingAngle / planes) * p
  if (type === "cross") return p % 2 === 0 ? satelliteSpacingAngle / 2 : 0
  if (type === "none") return 0
  return 0
}


export function generatePolarConstellation(MEA, altitude) {

  const alt = altitude / SCALE_FACTOR
  const { z, r } = calculateFootprint(MEA, alt, EARTH_RADIUS_SCALED) // Cone angle = minimum elevation angle
  // console.log("z", z.toFixed(3), "r", r.toFixed(3), "R", EARTH_RADIUS_SCALED.toFixed(3))

  const ro = r / OVERLAPPING_FOOTPRINT_FACTOR // Overlapping footprint radius
  const ds = (3 ** 0.5) * ro // Distance between adjacent sattelites
  const dp = 1.5 * ro // Distance between adjacent planes
  const as = 2 * Math.atan(ds / z) // Angle between adjacent satellites
  const ap = 2 * Math.atan(dp / z) // Angle between adjacent planes
  const S = Math.ceil((2 * Math.PI) / as) // Satellites Per Plane
  const P = Math.ceil((2 * Math.PI) / ap) // Number of Planes

  return { planes: P, satellitesPerPlane: S, MEA, altitude, inclination: 85, color: '#ff00ff', halfRotation: true, spacingType: 'cross' }
}

export function generatePolarConstellation2(MEA, altitude, color) {

  const alt = altitude / SCALE_FACTOR
  const { r } = calculateFootprint(MEA, alt, EARTH_RADIUS_SCALED) // Cone angle = minimum elevation angle
  // console.log("z", z.toFixed(3), "r", r.toFixed(3), "R", EARTH_RADIUS_SCALED.toFixed(3))

  const ro = r / OVERLAPPING_FOOTPRINT_FACTOR // Overlapping footprint radius
  //const mp = (3*ro)/(2*(3**0.5)) // Midpoint distance between adjacent planes
  const mp = (3 ** 0.5) * ro // Midpoint distance between adjacent planes
  const as = 2 * Math.asin(ro / EARTH_RADIUS_SCALED) // Angle between adjacent satellites
  const ap = 2 * Math.atan(mp / EARTH_RADIUS_SCALED) // Angle between adjacent planes
  const S = Math.ceil((2 * Math.PI) / as) // Satellites Per Plane
  const P = Math.ceil((2 * Math.PI) / ap) // Number of Planes

  return { planes: P, satellitesPerPlane: S, MEA, altitude, inclination: 85, color, halfRotation: true, spacingType: 'cross' }
}