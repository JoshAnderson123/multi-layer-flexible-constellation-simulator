import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
// import '../index.css';
import * as THREE from 'three'

import CameraControls from './CameraControls'
import { Earth, EarthLoading } from './Earth'
import { Stars, StarsLoading } from './Stars'
import Lights from './Lights'
import Constellation from './Constellation'
import { generatePolarConstellation2 } from '../../utils/constellationUtil'
import { layerColors } from '../../config'
import { RenderContext } from './VisualiserPanel'

export default function Visualiser({ renderCtx, constellation, viewLayers, viewSidebar }) {

  let [SPP, setSPP] = useState(1)
  let [canvasWidth, setCanvasWidth] = useState(0)
  // TODO: Auto Adjust width and height (Explicitally write w & h in Canvas element)

  function configGL(gl) {
    gl.toneMapping = THREE.NoToneMapping
    gl.gammaInput = true
    gl.gammaOutput = true
    gl.gammaFactor = 2.2
  }

  useEffect(() => {
    const canavsContainer = document.querySelector('#canvas')
    console.log(canavsContainer)
    setCanvasWidth(canavsContainer.clientWidth)
  }, [viewSidebar])

  return (
    <Canvas
      onCreated={({ gl }) => configGL(gl)}
      id="canvas"
      camera={{ position: [0, 0, 20], fov: 50 }}
      onClick={e => setSPP(SPP + 1)}
      width={`${canvasWidth}px`}
      // style={{ width: `${canvasWidth}px` }}
    >
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