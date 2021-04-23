import React, { useState } from 'react'
import { Center, Grid, Img } from '../blocks/blockAPI'
import Flex from '../blocks/Flex'
import ViewBtn from './ViewBtn'

export default function VisualiserOptions({ renderCtx, setRenderCtx }) {

  const [viewOptions, setViewOptions] = useState(false)

  return (
    <Flex f='FSVE' cn='abs' t='20px' r='20px'>
      <Center w='30px' h='30px' cn='ptr' o={viewOptions ? '1' : '0.5'} oc={() => setViewOptions(prev => !prev)}>
        <Img src='eye.svg' w='100%' h='100%' />
      </Center>
      {
        viewOptions ?
          <Grid gtc='1fr' gg='1px' cn="rel" w='150px' mt='10px'>
            <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='orbits' title='Orbits' />
            <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='satellites' title='Satellites' />
            <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='footprints' title='Footprints' />
            <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='cones' title='Cones' />
            <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='lighting' title='Lighting' />
            <ViewBtn renderCtx={renderCtx} setRenderCtx={setRenderCtx} id='stars' title='Stars' />
          </Grid>
          : null
      }
    </Flex>
  )
}
