import React from 'react'
import { EARTH_RADIUS_SCALED, SCALE_FACTOR, GRAVITY_CONSTANT, render } from '../../config'
import {
  degToRad, calculateFootprint, generateOrbitsGeometry2, generateSatellitesGeometry, generateFootprintsGeometry, generateConesGeometry, newBasicMat
} from '../../utils/constellationUtil.js'
import Satellite2 from './Satellite';
import Orbit2 from './Orbit';
import { arrRange } from '../../utils/utilGeneral'



export default function Constellation({ design }) {

  const { planes, satellitesPerPlane, MEA, altitude, inclination, color, halfRotation, spacingType } = design

  const alt = altitude / SCALE_FACTOR
  const h = alt + EARTH_RADIUS_SCALED // Height of satllite above earths center
  const { z, r } = calculateFootprint(MEA, alt, EARTH_RADIUS_SCALED) // Cone angle = minimum elevation angle
  const lonRange = halfRotation === true ? 190 : 360

  const constCtx = {
    planes, satellitesPerPlane, MEA, altitude: alt, inclination, color, halfRotation, spacingType
  }
  const orbitCtx = {
    orbitGeo: generateOrbitsGeometry2(h, degToRad(inclination), planes, lonRange),
    orbitMat: newBasicMat({ transparent: true, opacity: render.orbitOpacity, depthWrite: false }, color)
  }
  const satCtx = {
    objGeo: generateSatellitesGeometry(satellitesPerPlane, h),
    objMat: newBasicMat({}, color),
    footGeo: generateFootprintsGeometry(z, r, satellitesPerPlane),
    footMat: newBasicMat({ transparent: true, opacity: 0.4, depthWrite: false }, color),
    coneGeo: generateConesGeometry(z, r, h - z, satellitesPerPlane),
    coneMat: newBasicMat({ transparent: true, opacity: 0.15, depthWrite: false }, color),
    velocity: 1 / (2 * Math.PI * Math.sqrt(((h * SCALE_FACTOR) ** 3) / GRAVITY_CONSTANT))
  }

  return (
    <>
      <Orbit2 orbitCtx={orbitCtx} />
      {arrRange(planes).map(p =>
        <Satellite2 p={p} key={p} satCtx={satCtx} constCtx={constCtx}
          lon={degToRad(p * (lonRange / constCtx.planes))}
          inc={degToRad(constCtx.inclination)}
        />
      )}
    </>
  )
}

