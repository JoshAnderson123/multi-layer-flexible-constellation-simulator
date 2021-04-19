import React, { useRef, useLayoutEffect, useContext } from 'react';
import { calcOffsetAngle } from '../../utils/ConstellationUtil'
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Zaxis, Yaxis } from '../../utils/constellationGeo';
import { RenderContext } from './VisualiserPanel';

// This will now contain all the satellites for a single orbital plane
export default function Satellite2({ satCtx, constCtx, lon, inc, p }) {

  const render = useContext(RenderContext)
  const localAxis = new THREE.Vector3(0, 1, 0).applyAxisAngle(Zaxis, inc).applyAxisAngle(Yaxis, lon)
  const plane = useRef()

  useLayoutEffect(() => {
    plane.current.rotation.x = 0
    plane.current.rotation.y = 0
    plane.current.rotation.z = 0
    plane.current.rotateOnWorldAxis(Zaxis, inc)
    plane.current.rotateOnWorldAxis(Yaxis, lon)
    plane.current.rotateOnWorldAxis(localAxis, calcOffsetAngle(constCtx.spacingType, p, constCtx.planes, constCtx.satellitesPerPlane))
  }, [inc, lon])

  useFrame(() => {
    if (plane.current === null) return
    plane.current.rotateOnWorldAxis(localAxis, satCtx.velocity)
  })

  return (
    <group ref={plane}>
      {render.satellites ? <mesh geometry={satCtx.objGeo} material={satCtx.objMat} /> : null}
      {render.footprints ? <lineSegments geometry={satCtx.footGeo} material={satCtx.footMat} /> : null}
      {render.cones ? <mesh geometry={satCtx.coneGeo} material={satCtx.coneMat} /> : null}
    </group>
  )
}
