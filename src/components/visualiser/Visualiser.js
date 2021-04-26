import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
// import '../index.css';
import * as THREE from 'three'

import CameraControls from './CameraControls'
import { Earth, EarthLoading } from './Earth'
import {Stars, StarsLoading} from './Stars'
import Lights from './Lights'
import Constellation from './Constellation'
import { generatePolarConstellation2 } from '../../utils/constellationUtil'
import { layerColors } from '../../config'
import { RenderContext } from './VisualiserPanel'

export default function Visualiser({ renderCtx, constellation, viewLayers }) {

  let [SPP, setSPP] = useState(1)

  function configGL(gl) {
    gl.toneMapping = THREE.NoToneMapping
    gl.gammaInput = true
    gl.gammaOutput = true
    gl.gammaFactor = 2.2
  }

  return (
    <Canvas onCreated={({ gl }) => configGL(gl)} id="canvas" camera={{ position: [0, 0, 20], fov: 50 }} onClick={e => setSPP(SPP + 1)}>
      <RenderContext.Provider value={renderCtx} >
        <CameraControls />
        <Suspense fallback={<EarthLoading />}>
          <Earth />
        </Suspense>
        <Suspense fallback={<StarsLoading />}>
          <Stars renderCtx={renderCtx} />
        </Suspense>
        <Lights renderCtx={renderCtx} />
        {constellation ? constellation.map((c, i) => {
          if (viewLayers[i]) return <Constellation key={i} design={generatePolarConstellation2(c.e, c.a, layerColors[i])} />
          return null
        }) : null}
      </RenderContext.Provider >
    </Canvas>
  );
}