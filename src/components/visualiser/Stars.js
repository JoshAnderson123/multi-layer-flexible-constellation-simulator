import * as THREE from 'three'
import React from 'react'
import { useLoader } from '@react-three/fiber'
import starTexture from '../media2/starsBackground3_4.jpg'
// import starTexture from '../media2/test.png'


export function Stars({ renderCtx }) {
  const texture = useLoader(THREE.TextureLoader, starTexture)

  if (renderCtx.stars) return (
    <mesh>
      <sphereBufferGeometry attach="geometry" args={[200, 6, 6]} />
      <meshBasicMaterial attach="material" map={texture} side={THREE.BackSide} />
    </mesh>
  )

  return null
}

export function StarsLoading() {
  console.log('Stars loading')
  return (
    <mesh >
      <sphereBufferGeometry attach="geometry" args={[200, 6, 6]} />
      <meshBasicMaterial attach="material" color={"#000000"} />
    </mesh>
  )
}