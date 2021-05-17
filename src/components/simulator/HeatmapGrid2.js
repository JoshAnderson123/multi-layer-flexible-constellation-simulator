import React, { useEffect, useState } from 'react'
import { Center } from '../blocks/blockAPI'
import chroma from 'chroma-js'
import { cBad, cGood, HG_OFF } from '../../config'
import HeatmapTooltip2 from './HeatmapTooltip2'
import { drawHeatmap } from '../../utils/draw'
import { floor } from '../../utils/utilGeneral'

export default function HeatmapGrid2({ HMResults, viewHover }) {

  const [selectedCell, setSelectedCell] = useState({ r: -1, c: -1 })
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })

  const cols = HMResults.config.var.v1.range.length // swaped from rows
  const rows = HMResults.config.var.v2.range.length // Swaped from cols

  const bounds = { min: Math.min(...HMResults.data), max: Math.max(...HMResults.data) }
  const scale = chroma.scale([cGood, cBad]).domain([bounds.min, bounds.max]);

  useEffect(() => {
    const heatmapWrapper = document.querySelector('#heatmap-wrapper')
    setCanvasSize({ w: heatmapWrapper.clientWidth, h: heatmapWrapper.clientHeight })
  }, [])

  useEffect(() => {
    drawHeatmap(rows, cols, HMResults, scale)
  })


  return (
    <Center id='heatmap-wrapper' cn='f abs'>
      <canvas
        id='heatmap-canvas'
        style={{
          width: `${canvasSize.w}px`,
          height: `${canvasSize.h}px`,
          top: '0',
          right: '0',
          position: 'absolute',
          overflow: 'hidden'
        }}
        width={`${canvasSize.w}px`}
        height={`${canvasSize.h}px`}
        onMouseMove={e => checkHoverVal(e, rows, cols, selectedCell, setSelectedCell)}
      >
      </canvas>

      {viewHover ? <HeatmapTooltip2 selectedCell={selectedCell} HMResults={HMResults} rows={rows} cols={cols} /> : null}
    </Center>
  )
}

function checkHoverVal(e, rows, cols, selectedCell, setSelectedCell) {
  const rect = document.querySelector('#heatmap-canvas').getBoundingClientRect()
  const x = e.clientX - rect.x
  const y = e.clientY - rect.y
  if (x < HG_OFF.l || x > rect.width - HG_OFF.r || y < HG_OFF.t || y > rect.height - HG_OFF.b) {
    setSelectedCell({r: -1, c: -1})
    return
  }
  const G_WIDTH = rect.width - HG_OFF.l - HG_OFF.r
  const G_HEIGHT = rect.height - HG_OFF.t - HG_OFF.b
  const rowLen = G_HEIGHT / rows
  const colLen = G_WIDTH / cols
  const r = floor((y-HG_OFF.t) / rowLen)
  const c = floor((x-HG_OFF.l) / colLen)
  if(r !== selectedCell.r || c !== selectedCell.c) setSelectedCell({r,c})
}