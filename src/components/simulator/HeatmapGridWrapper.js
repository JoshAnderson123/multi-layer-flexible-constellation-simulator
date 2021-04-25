import React from 'react'
import { Grid, Center, Flex } from '../blocks/blockAPI'
import HeatmapGrid from './HeatmapGrid'

export default function HeatmapGridWrapper({ HMResults, viewValues, viewHover }) {

  const gridW = 850
  const gridH = 650
  const tickLen = 30
  const axisTitleLen = 50
  const totalW = gridW + tickLen + axisTitleLen
  const totalH = gridH + tickLen + axisTitleLen

  return (
    <Center w={`${totalW}px`} h={`${totalH}px`} cn='rel bsh3 bc2-3' >
      {
        HMResults.data?.length > 0 ? <HeatmapGrid HMResults={HMResults} gridW={gridW} gridH={gridH} tickLen={tickLen} axisTitleLen={axisTitleLen} viewValues={viewValues} viewHover={viewHover} /> : null
      }
    </Center>
  )
}

