import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
// import '../index.css';
import * as THREE from 'three'

import CameraControls from './CameraControls'
import Earth from './Earth'
import Stars from './Stars'
import Lights from './Lights'
import Constellation from './Constellation'
import {generatePolarConstellation2} from '../../utils/ConstellationUtil'

import { RenderContext } from './VisualiserPanel'

export default function Visualiser({ renderCtx, results }) {

  let [SPP, setSPP] = useState(1)

  return (
    <Canvas onCreated={({ gl }) => { gl.toneMapping = THREE.NoToneMapping }} id="canvas" camera={{ position: [0, 0, 20], fov: 50 }} onClick={e => setSPP(SPP + 1)}>
      <Suspense fallback={null}>
        <RenderContext.Provider value={renderCtx} >
          <CameraControls />
          <Earth />
          <Stars renderCtx={renderCtx} /> 
          <Lights renderCtx={renderCtx} />
          {/* <Constellation2 design={generatePolarConstellation2(35, 600, '#ff2222')} /> */}
          <Constellation design={generatePolarConstellation2(results.xTrad[0].e, results.xTrad[0].a, '#00ffff')} />
          {/* {constellation.data.map((subConstellation, idx) => <Constellation design={subConstellation} key={idx} />)} */}
        </RenderContext.Provider >
      </Suspense>
    </Canvas>
  );
} 