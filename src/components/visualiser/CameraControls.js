import * as THREE from 'three';
import React, { useRef } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });

export default function CameraControls() {

  const {
    camera,
    gl: { domElement },
  } = useThree();

  const controls = useRef();
  useFrame((state) => controls.current.update());
  return (
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
      enableZoom={true}
      enableDamping={true}
      dampingFactor={0.15}
    />
  );
}