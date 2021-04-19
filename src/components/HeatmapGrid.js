import React from 'react'
import { Grid, Center, Flex } from './blocks/blockAPI'
import chroma from 'chroma-js'
import { formatHMItem } from '../utils/utilGeneral'
import { cBad, cGood, formatParam } from '../config'

export default function HeatmapGrid({ HMResults, gridW, gridH, tickLen, axisTitleLen, viewValues }) {

  const cols = HMResults.config.varParams.v1.range.length // swaped from rows
  const rows = HMResults.config.varParams.v2.range.length // Swaped from cols
  const testArr = [...Array(rows * cols).keys()]
  const bounds = { min: Math.min(...HMResults.data), max: Math.max(...HMResults.data) }

  const scale = chroma.scale([cGood, cBad]).domain([bounds.min, bounds.max]);

  function datapoint(i) {
    return (
      <Center key={i} bc={scale(HMResults.data[i]).hex()} cn='ov-h'>
        { viewValues ? formatHMItem(HMResults.config.output, HMResults.data[i]) : null}
      </Center>
    )
  }

  return (
    <>
      <Flex f='FSV' w={`${gridW}px`} h={`${tickLen + axisTitleLen}px`} b='0' r='0' cn='abs' >
        <Grid
          gtc={`repeat(${cols}, 1fr)`} gg='1px'
          w={`${gridW}px`} h={`${tickLen}px`}
          cn='font-heatmap hm-text-color'
          bc='#ddd'
        >
          {[...Array(cols).keys()].map(x =>
            <Center key={x} cn='bc-l1 rig ov-h'>
              <Center cn={`abs ${cols > 15 ? 'flip90' : ''}`} w={`${tickLen}px`}>
                {HMResults.config.varParams.v1.range[x]}
              </Center>
            </Center>)}
        </Grid>
        <Center w={`${gridW}px`} cn='bc-l1 h100'>
          <Center cn='abs font-grid-small c-d1'>
            {formatParam[HMResults.config.varParams.v1.param]}
          </Center>
        </Center>
      </Flex>

      <Flex f='FB' w={`${tickLen + axisTitleLen}px`} h={`${gridH}px`} t='0' l='0' cn='abs' >
        <Center w={`${axisTitleLen}px`} cn='bc-l1 h100'>
          <Center cn={`abs flip90 font-grid-small c-d1`} w={`${gridW}px`}>
            {formatParam[HMResults.config.varParams.v2.param]}
          </Center>
        </Center>
        <Grid
          gtr={`repeat(${rows}, 1fr)`} gg='1px'
          w={`${tickLen}px`} h={`${gridH}px`}
          cn='font-heatmap hm-text-color'
          bc='#ddd'
        >
          {[...Array(rows).keys()].map(x => <Center key={x} cn='bc-l1 rig'>{HMResults.config.varParams.v2.range[x]}</Center>)}
        </Grid>
      </Flex>

      <Grid
        gtr={`repeat(${rows}, 1fr)`} gtc={`repeat(${cols}, 1fr)`}
        w={`${gridW}px`} h={`${gridH}px`} t='0' r='0'
        cn='font-heatmap hm-text-color abs'
      >
        {testArr.map(i => datapoint(i))}
      </Grid>
    </>
  )
}