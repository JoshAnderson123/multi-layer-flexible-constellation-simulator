import React, { useState } from 'react'
import { Grid, Center, Flex } from '../blocks/blockAPI'
import chroma from 'chroma-js'
import { formatHMItem } from '../../utils/utilGeneral'
import { cBad, cGood, formatParam } from '../../config'
import HeatmapItem from './HeatmapItem'
import HeatmapTooltip from './HeatmapTooltip'

export default function HeatmapGrid({ HMResults, gridW, gridH, tickLen, axisTitleLen, viewValues, viewHover }) {

  const [selectedVal, setSelectedVal] = useState({ id: -1 })

  const cols = HMResults.config.var.v1.range.length // swaped from rows
  const rows = HMResults.config.var.v2.range.length // Swaped from cols
  const testArr = [...Array(rows * cols).keys()]
  const bounds = { min: Math.min(...HMResults.data), max: Math.max(...HMResults.data) }

  const scale = chroma.scale([cGood, cBad]).domain([bounds.min, bounds.max]);

  return (
    <Center>

      <Flex f='FSV' w={`${gridW}px`} h={`${tickLen + axisTitleLen}px`} b='0' r='0' cn='abs ct1' >
        <Grid
          gtc={`repeat(${cols}, 1fr)`} gg='1px'
          w={`${gridW}px`} h={`${tickLen}px`}
          cn='font-heatmap bc2-3'
        >
          {[...Array(cols).keys()].map(x =>
            <Center key={x} cn='rig ov-h'>
              <Center cn={`abs ${cols > 15 ? 'flip90' : ''}`} w={`${tickLen}px`}>
                {HMResults.config.var.v1.range[x]}
              </Center>
            </Center>)}
        </Grid>
        <Center w={`${gridW}px`} cn='h100'>
          <Center cn='abs font-grid-small'>
            {formatParam[HMResults.config.var.v1.param]}
          </Center>
        </Center>
      </Flex>

      <Flex f='FB' w={`${tickLen + axisTitleLen}px`} h={`${gridH}px`} t='0' l='0' cn='abs ct1' >
        <Center w={`${axisTitleLen}px`} cn='h100'>
          <Center cn={`abs flip90 font-grid-small`} w={`${gridW}px`}>
            {formatParam[HMResults.config.var.v2.param]}
          </Center>
        </Center>
        <Grid
          gtr={`repeat(${rows}, 1fr)`} gg='1px'
          w={`${tickLen}px`} h={`${gridH}px`}
          cn='font-heatmap bc2-3'
        >
          {[...Array(rows).keys()].map(x => <Center key={x} cn='rig'>{HMResults.config.var.v2.range[x]}</Center>)}
        </Grid>
      </Flex>

      <Grid
        gtr={`repeat(${rows}, 1fr)`} gtc={`repeat(${cols}, 1fr)`}
        w={`${gridW}px`} h={`${gridH}px`} t='0' r='0'
        cn='font-heatmap abs'
        oml={() => setSelectedVal({ id: -1 })}
      >
        {testArr.map(i => <HeatmapItem key={i} i={i} HMResults={HMResults} viewValues={viewValues} viewHover={viewHover} scale={scale} setSelectedVal={setSelectedVal} />)}
      </Grid>

      {selectedVal.id >= 0 && viewHover ? <HeatmapTooltip selectedVal={selectedVal} /> : null}
    </Center>
  )
}