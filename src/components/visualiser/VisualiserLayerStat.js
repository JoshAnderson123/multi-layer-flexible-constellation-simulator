import React from 'react'
import { layerColors } from '../../config'
import { hexToRGBA } from '../../utils/utilGeneral'
import { Center, Flex } from '../blocks/blockAPI'

export default function VisualiserLayerStat({ number, details, viewLayers, setViewLayers }) {

  function updateViewLayers() {
    setViewLayers(prev => {
      const next = [...prev]
      next[number] = !prev[number]
      return next
    })
  }

  return (
    <Flex
      f='FS' cn='font-small w100 us-none ptr' mt='5px' p='0px 10px'
      o={viewLayers[number] ? '1' : '0.5'}
      oc={updateViewLayers}
      c='rgba(255,255,255,0.9)' bc={hexToRGBA(layerColors[number], 0.4)}
    >
      <Center cn='rel' t='-1px'>Layer</Center>
      <Center ml='5px' w='16px' h='16px' bc={`#${layerColors[number]}`} br='100%'>
        <Center cn='rel' t='-1px' c='#000'>{number + 1}</Center>
      </Center>
      <Center ml='15px' cn='rel' t='-1px'>{`a: ${details.a}, e: ${details.e}`}</Center>
    </Flex>
  )
}
