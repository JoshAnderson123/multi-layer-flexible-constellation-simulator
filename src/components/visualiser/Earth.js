import * as THREE from 'three'
import React, { Suspense, useRef } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { EARTH_RADIUS, SCALE_FACTOR, EARTH_ROTATION_SPEED } from '../../config'
import { Yaxis } from '../../utils/constellationGeo';
import earthMap from '../media2/world_map2.jpg'
// import earthMap from '../media2/test.png'

// export default function Earth(props) {

//   return (
//     <Suspense fallback={<EarthLoading {...props} />}>
//       <EarthRender {...props} />
//     </Suspense>
//   )
// }


export function Earth({...props}) {

  const texture = useLoader(THREE.TextureLoader, earthMap)
  const mesh = useRef()
  useFrame(() => { mesh.current?.rotateOnWorldAxis(Yaxis, EARTH_ROTATION_SPEED) })

  return (
    <mesh {...props} ref={mesh}>
      <sphereBufferGeometry attach="geometry" args={[EARTH_RADIUS / SCALE_FACTOR, 80, 80]} />
      <meshStandardMaterial attach="material" map={texture} color={0xffffff} roughness={0.8} metalness={0.5} />
    </mesh>
  )
}

export function EarthLoading({...props}) {

  console.log('Earth loading')

  return (
    <mesh {...props}>
      <sphereBufferGeometry attach="geometry" args={[EARTH_RADIUS / SCALE_FACTOR, 80, 80]} />
      <meshBasicMaterial attach="material" color={"#2c3043"} />
    </mesh>
  )
}