import * as THREE from 'three'
import React from 'react'
import { useLoader } from '@react-three/fiber'
import starTexture from '../media2/starsBackground3.jpg'
//import { useFrame } from '@react-three/fiber'

export default function Stars({ renderCtx }) {

  const texture = useLoader(THREE.TextureLoader, starTexture)

  function renderStars() {
    if (renderCtx.stars) {
      return (
        <mesh>
          <sphereBufferGeometry attach="geometry" args={[200, 6, 6]} />
          <meshBasicMaterial attach="material" map={texture} side={THREE.BackSide} />
        </mesh>
      )
    }
    return null
  }

  return renderStars()
}