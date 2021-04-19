import React, { useContext } from 'react';
import { RenderContext } from './VisualiserPanel';

export default function Orbit2({ orbitCtx }) {
  
  const render = useContext(RenderContext)
  return render.orbits ? <lineSegments geometry={orbitCtx.orbitGeo} material={orbitCtx.orbitMat} /> : null
}
