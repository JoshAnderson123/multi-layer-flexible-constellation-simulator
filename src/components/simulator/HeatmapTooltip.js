import React from 'react'
import { Center } from '../blocks/blockAPI'

export default function HeatmapTooltip({ selectedVal }) {

  const x = selectedVal.rect.x + selectedVal.rect.width - 15
  const y = selectedVal.rect.y + (selectedVal.rect.height / 2) - 10

  return (
    <Center p='5px' cn='fixed c-d1 bc-l1 font-small pe-none' l={`${x}px`} t={`${y}px`}>{selectedVal.val}</Center>
  )
}
