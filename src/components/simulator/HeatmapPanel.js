import React, { useState } from 'react'
import { outputOptions, invertParam, inputOptions } from '../../config'
import { calcResultParamRanges } from '../../utils/tradespace'
import { Center, Flex, Grid } from '../blocks/blockAPI'
import { DropdownVar, DropdownConst, DropdownOpt } from './Dropdown'
import HeatmapGenerateBtn from './HeatmapGenerateBtn'
import HeatmapGridWrapper from './HeatmapGridWrapper'
import HeatmapInput from './HeatmapInput'
import HeatmapLegend from './HeatmapLegend'
import PanelTopBar from './PanelTopBar'

export default function HeatmapPanel({ inputs, results, setPanel }) { // w='1150px' h='900px'

  const [varParams, setVarParams] = useState({ v1: 'J', v2: 'r' })
  const [HMResults, setHMResults] = useState({ data: [] })
  const [viewValues, setViewValues] = useState(false)
  const paramRanges = calcResultParamRanges(inputs)

  function updateVarParams(vParam) {
    const vNew = invertParam[document.querySelector(`#${vParam}`).value]
    setVarParams(prev => ({ ...prev, [vParam]: vNew }))
  }



  return (
    <Flex f='FSV' w='100%' h='100%' bc='#ddd' cn='rel bsh c-d1'>

      <PanelTopBar setPanel={setPanel} />

      <Center cn='w100 font-title2 c-d1 bor-field rig' h='100px'>Heatmap</Center>

      <Flex f='FB' cn='grow w100'>

        <HeatmapInput
          inputOptions={inputOptions}
          varParams={varParams} updateVarParams={updateVarParams} paramRanges={paramRanges}
          results={results} setHMResults={setHMResults}
        />

        <Center cn='grow h100'>
          <HeatmapGridWrapper inputParams={paramRanges} HMResults={HMResults} viewValues={viewValues} />
          <HeatmapLegend HMResults={HMResults} viewValues={viewValues} setViewValues={setViewValues} />
        </Center>

      </Flex>



    </Flex>
  )
}
