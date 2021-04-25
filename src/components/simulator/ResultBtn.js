import React from 'react'
import { Center, Flex, Img } from '../blocks/blockAPI'

export default function ResultBtn({ func = () => {}, imgSrc, text, ...cssProps }) {
  return (
    <Flex f='FSV' w='300px' h='300px' cn='bc1 font-title ptr hoverGrow bshbtn2' oc={func} {...cssProps}>
      <Img src={imgSrc} w='200px' h='200px' mt='20px' cn='of-cont' />
      <Center cn='c-l1 font-title'>
        {text}
      </Center>
    </Flex>
  )
}
