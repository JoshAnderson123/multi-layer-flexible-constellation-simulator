import * as THREE from 'three'
import React, { useRef } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { EARTH_RADIUS, SCALE_FACTOR, EARTH_ROTATION_SPEED } from '../../config'
import { Yaxis } from '../../utils/constellationGeo';
import earthMap from '../media2/world_map2.jpg'

export default function Earth(props) {

  const mesh = useRef()
  const texture = useLoader(THREE.TextureLoader, earthMap)

  useFrame(() => { mesh.current.rotateOnWorldAxis(Yaxis, EARTH_ROTATION_SPEED) })

  return (
    <mesh {...props} ref={mesh}>
      <sphereBufferGeometry attach="geometry" args={[EARTH_RADIUS / SCALE_FACTOR, 80, 80]} />
      {/* <meshBasicMaterial attach="material" color={"#00ff00"} /> */}
      <meshStandardMaterial attach="material" map={texture} color={0xffffff} roughness={0.8} metalness={0.5} />
    </mesh>
  )
}