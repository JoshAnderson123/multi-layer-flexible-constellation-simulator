import React from 'react'

export default function ConstellationUI({ design, idx }) {

  function toRGBA(hex, opacity) {
    if (typeof hex !== "string") return `rgba(255,255,255,${opacity})`
    const r = parseInt(`0x${hex.substring(1,3)}`)
    const g = parseInt(`0x${hex.substring(3,5)}`)
    const b = parseInt(`0x${hex.substring(5,7)}`)
    return `rgba(${r},${g},${b},${opacity})`
  }

  function generateConstellationColor() {
    return {
      backgroundColor: toRGBA(design.color, 0.3),
      border: `1px solid ${toRGBA(design.color, 0.5)}`
    }
  }

  function calculateConfiguration() {
    const i = design.inclination
    const t = design.planes * design.satellitesPerPlane
    const p = design.planes
    let f = 1
    if (design.spacingType === "cross" ) f = 2
    if (design.spacingType === "drift" ) f = design.satellitesPerPlane
    return `${i}°: ${t}/${p}/${f}`
  }

  return (
    <div className="constellation-container" style={generateConstellationColor()}>
      {/* {idx !== -1 ? <div className="constellation-info">{`Sub-Constellation  ${idx+1}`}</div> : null} */}
      <div className="constellation-info">{`Configuration:  ${calculateConfiguration()}`}</div>
      {/* <div className="constellation-info">{`Planes:  ${design.planes}`}</div> */}
      {/* <div className="constellation-info">{`Satellites per plane:  ${design.satellitesPerPlane}`}</div> */}
      <div className="constellation-info">{`Minimum Elevation:  ${design.MEA}°`}</div>
      <div className="constellation-info">{`Altitude:  ${design.altitude}km`}</div>
      {/* <div className="constellation-info">{`inclination:  ${design.inclination}°`}</div> */}
      {/* <div className="constellation-info">{`Color:  ${(design.color)}`}</div> */}
    </div>
  )
}
