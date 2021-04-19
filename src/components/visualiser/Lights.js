import React from 'react'

export default function Lights({ renderCtx }) {

  function renderLights() {
    if (renderCtx.lighting) {
      return (
        <>
          <ambientLight args={[0xffffff, 0.5]} />
          <pointLight args={[0xffffff, 3.5]} position={[0, 43.48, 100]} />
        </>
      )
    }
    return <ambientLight args={[0xffffff, 1]} />
  }

  return renderLights()
}
