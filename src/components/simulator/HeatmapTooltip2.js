import React from 'react'
import { HG_OFF } from '../../config'
import { floor, formatHMItem } from '../../utils/utilGeneral'
import { Center } from '../blocks/blockAPI'

export default function HeatmapTooltip2({ selectedCell, HMResults, rows, cols }) {

  const rect = document.querySelector('#heatmap-canvas').getBoundingClientRect()
  const G_WIDTH = rect.width - HG_OFF.l - HG_OFF.r
  const G_HEIGHT = rect.height - HG_OFF.t - HG_OFF.b
  const rowLen = G_HEIGHT / rows
  const colLen = G_WIDTH / cols
  const x = HG_OFF.l + selectedCell.c * colLen
  const y = HG_OFF.t + selectedCell.r * rowLen

  return selectedCell.r >= 0 && (
    <>
      <Center
        bc='rgba(0,0,0,0.2)'
        cn='abs pe-none'
        l={`${HG_OFF.l}px`} t={`${y}px`} w={`${selectedCell.c*colLen}px`} h={`${rowLen+1}px`}
      >
      </Center>
      <Center
        bc='rgba(0,0,0,0.2)'
        cn='abs pe-none'
        l={`${x}px`} t={`${HG_OFF.t}px`} w={`${colLen+1}px`} h={`${selectedCell.r*rowLen}px`}
      >
      </Center>
      <Center
        bor='3px solid #000'
        cn='abs pe-none'
        l={`${x}px`} t={`${y}px`} w={`${colLen+1}px`} h={`${rowLen+1}px`}
      >
      </Center>
      <Center
        l={`${x+colLen}px`} t={`${y+rowLen}px`} p='5px'
        cn='abs c-d1 bc-l1 font-small pe-none' z='1000'
      >
        {formatHMItem(HMResults.config.output, HMResults.data[selectedCell.r*cols + selectedCell.c])}
      </Center>
    </>
  )
}
