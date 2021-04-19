import React from 'react'
import { Center, Grid } from '../blocks/blockAPI'
import ViewBtn from './ViewBtn'

export default function VisualiserOptions({ renderCtx, setRenderCtx }) {


  return (
    <Grid gtc='1fr' gg='1px' p='5px' cn="abs" t='20px' r='20px' w='150px'>
      <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='orbits' title='Orbits' />
      <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='satellites' title='Satellites' />
      <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='footprints' title='Footprints' />
      <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='cones' title='Cones' />
      <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='lighting' title='Lighting' />
      <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='stars' title='Stars' />
    </Grid>
  )
}
