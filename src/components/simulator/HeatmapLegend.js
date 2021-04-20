import React from 'react'
import { cBad, cGood } from '../../config'
import { copyHeatmapToClipboard, formatHMItem } from '../../utils/utilGeneral'
import { Center, Flex } from '../blocks/blockAPI'

export default function HeatmapLegend({ HMResults, viewValues, setViewValues }) {

  const bounds = { min: Math.min(...HMResults.data), max: Math.max(...HMResults.data) }

  return (
    <>{
      HMResults.data?.length > 0 ?

        <Flex f='FSV' w='250px' h='430px' bc='#fff' cn='bsh3 rel' ml='40px'>

          <Center cn='w100 font-grid-small c-d1' h='40px' mt='20px' >{HMResults.config.output}</Center>

          <Center cn='w100 rel' mt='35px'>

            <Flex f='FSVS' p='10px'>
              <Center w='50px' h='1px' bc='#999' />
              <Center w='30px' h='150px' bc='#f00' bac={`linear-gradient(to bottom, ${cBad} 0%, ${cGood} 100%`} />
              <Center w='50px' h='1px' bc='#999' />
            </Flex>

            <Flex f='FBVS' cn='font-grid-small c-d1 h100'>
              <Center>{formatHMItem(HMResults.config.output, bounds.max)}</Center>
              <Center>{formatHMItem(HMResults.config.output, bounds.min)}</Center>
            </Flex>

          </Center>

          <Center mt='50px' w='140px' h='30px' bc='#bbb' cn='c-l1 font-small ptr hoverGrow' oc={() => setViewValues(p => !p)} o={viewValues ? '1' : '0.5'} >{`View Values: ${viewValues ? 'on' : 'off'}`}</Center>
          <Center mt='10px' w='140px' h='30px' bc='#bbb' cn='c-l1 font-small ptr hoverGrow' oc={() => copyHeatmapToClipboard(HMResults)} >Copy to clipboard</Center>

        </Flex>

        : null
    }</>
  )
}
