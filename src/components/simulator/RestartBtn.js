import React from 'react'
import { Center, Img } from '../blocks/blockAPI'

export default function RestartBtn({ setPanel }) {

  return (
    <Center cn='abs bc1 ptr hoverGrow' br='10px' w='40px' h='40px' t='10px' l='10px' oc={() => setPanel('setup')}>
      <Img src='arrow_back.svg' cn='abs of-cont' w='80%' h='80%' />
    </Center>
  )
}
