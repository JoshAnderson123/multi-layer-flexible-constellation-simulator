import * as THREE from 'three';
import React from 'react'
import { EARTH_RADIUS_SCALED, SCALE_FACTOR, GRAVITY_CONSTANT, render } from '../../config'
import {
  degToRad, calculateFootprint, generateOrbitsGeometry2, generateSatellitesGeometry, generateFootprintsGeometry, generateConesGeometry
} from '../../utils/ConstellationUtil.js'
import Satellite2 from './Satellite';
import Orbit2 from './Orbit';



export default function Constellation({ design }) {

  const { planes, satellitesPerPlane, MEA, altitude, inclination, color, halfRotation, spacingType } = design

  const alt = altitude / SCALE_FACTOR
  const h = alt + EARTH_RADIUS_SCALED // Height of satllite above earths center
  const { z, r } = calculateFootprint(MEA, alt, EARTH_RADIUS_SCALED) // Cone angle = minimum elevation angle
  const lonRange = halfRotation === true ? 190 : 360

  const constCtx = { planes, satellitesPerPlane, MEA, altitude: alt, inclination, color, halfRotation, spacingType }
  const orbitCtx = {
    // orbitGeo: generateOrbitGeometry(h),
    orbitGeo: generateOrbitsGeometry2(h, degToRad(inclination), planes, lonRange),
    orbitMat: new THREE.LineBasicMaterial({ color, transparent: true, opacity: render.orbitOpacity, depthWrite: false })
  }
  const satCtx = {
    objGeo: generateSatellitesGeometry(satellitesPerPlane, h),
    objMat: new THREE.MeshBasicMaterial({ color }),
    // footGeo: generateFootprintGeometry(z, r),
    footGeo: generateFootprintsGeometry(z, r, satellitesPerPlane),
    footMat: new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4, depthWrite: false }),
    coneGeo: generateConesGeometry(z, r, h - z, satellitesPerPlane),
    coneMat: new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, depthWrite: false }),
    velocity: 1 / (2 * Math.PI * Math.sqrt(((h * SCALE_FACTOR) ** 3) / GRAVITY_CONSTANT))
  }

  function createConstellation() {

    const planeArr = []
    
    planeArr.push(<Orbit2 orbitCtx={orbitCtx} key={-1} />)
    for (let p = 0; p < planes; p++) {
      const lon = degToRad(p * (lonRange / constCtx.planes))
      const inc = degToRad(constCtx.inclination)
      planeArr.push(<Satellite2 satCtx={satCtx} constCtx={constCtx} lon={lon} inc={inc} p={p} key={p} />)
    }
    return planeArr
  }

  return createConstellation()
}

