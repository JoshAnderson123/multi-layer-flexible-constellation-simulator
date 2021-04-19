import React from 'react'
import Satellite from './Satellite'
import { degToRad } from '../test'

import Orbit from './Orbit'

function calcOffsetAngle(type, p, satelliteSpacingAngle, planes) {
  if (type === null | type === "drift") return (satelliteSpacingAngle / planes) * p
  if (type === "cross") return p%2 === 0 ? satelliteSpacingAngle / 2 : 0
  if (type === "none") return 0
  return -1
}

export default function Plane({ constCtx, orbitCtx, satCtx, p }) {

  function createSatellites() {
    const satelliteSpacingAngle = 360 / constCtx.satellitesPerPlane

    const lonRef = constCtx.halfRotation === true ? 190 : 360
    const lon = degToRad(p * (lonRef / constCtx.planes))
    const inc = degToRad(constCtx.inclination)

    const satArr = [<Orbit orbitCtx={orbitCtx} lon={lon} inc={inc}  />]

    // for (let s = 0; s < constCtx.satellitesPerPlane; s++) {
    //   const offsetAngle = calcOffsetAngle(constCtx.spacingType, p, satelliteSpacingAngle, constCtx.planes)
    //   const deg = degToRad((s * satelliteSpacingAngle) + offsetAngle)

    //   satArr.push(<Satellite satCtx={satCtx} lon={lon} inc={inc} deg={deg} key={s} />)
    // }
    return satArr // TODO - Add a group ref here so you can rotate all at the same time
  }

  return createSatellites()
}
