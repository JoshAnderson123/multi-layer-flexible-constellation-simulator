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

  const orbitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: render.orbitOpacity, depthWrite: false })
  orbitMat.color.setHex(`0x${color}`).convertSRGBToLinear()

  const constCtx = { planes, satellitesPerPlane, MEA, altitude: alt, inclination, color, halfRotation, spacingType }
  const orbitCtx = {
    orbitGeo: generateOrbitsGeometry2(h, degToRad(inclination), planes, lonRange), orbitMat
  }

  const objMat = new THREE.MeshBasicMaterial()
  objMat.color.setHex(`0x${color}`).convertSRGBToLinear()
  const footMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.4, depthWrite: false })
  footMat.color.setHex(`0x${color}`).convertSRGBToLinear()
  const coneMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.15, depthWrite: false })
  coneMat.color.setHex(`0x${color}`).convertSRGBToLinear()


  const satCtx = {
    objGeo: generateSatellitesGeometry(satellitesPerPlane, h), objMat,
    footGeo: generateFootprintsGeometry(z, r, satellitesPerPlane), footMat,
    coneGeo: generateConesGeometry(z, r, h - z, satellitesPerPlane), coneMat,
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

