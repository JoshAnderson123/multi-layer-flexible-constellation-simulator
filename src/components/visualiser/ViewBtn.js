import React from 'react'
import { Center } from '../blocks/blockAPI'

export default function ViewBtn({renderCtx, setRenderCtx, id, title}) {

  const displayColor = renderParam => renderParam ? "on" : ""
  const changeRenderCtx = renderParam => {
    console.log('eh?')
    setRenderCtx(prevRenderCtx => Object.assign({}, prevRenderCtx, {[renderParam]: !prevRenderCtx[renderParam]}))
  }

  return (
    <Center cn={`toggle ${displayColor(renderCtx[id])}`} oc={() => changeRenderCtx(id)}>{title}</Center>
  )
}
