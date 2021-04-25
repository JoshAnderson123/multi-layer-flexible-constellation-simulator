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

  const [params, setParams] = useState((() => {
    const p = calcResultParamRanges(inputs)
    return {
      var: { v1: 'J', v2: 'r' },
      con: { r: p.r[0], rec: p.rec[0], σ: p.σ[0], J: p.J[0], Lm: p.Lm[0], optimal: 'false' }
    }
  })())
  const [HMResults, setHMResults] = useState({ data: [] })
  const [viewValues, setViewValues] = useState(false)
  const [viewHover, setViewHover] = useState(false)
  
  const paramRanges = calcResultParamRanges(inputs)

  function updateParams(p) {

    setParams(prev => {

      const newParams = { ...prev }

      if (['v1','v2'].includes(p)) {
        const vP = invertParam[document.querySelector(`#${p}`).value]
        newParams.var[p] = vP
        if (['J', 'Lm'].includes(vP)) newParams.con.optimal = 'false'
      }

      if (['r','rec','σ','J','Lm','optimal'].includes(p)) {
        if (p === 'σ') newParams.con[p] = document.querySelector(`#c-v`).value
        else newParams.con[p] = document.querySelector(`#c-${p}`).value
      }

      return newParams
    })
  }

  return (
    <Flex f='FSV' w='100%' h='100%' bc='#ddd' cn='rel bsh c-d1'>

      <PanelTopBar setPanel={setPanel} />

      <Center cn='w100 font-title2 ct1 bc2-2 bor-field rig' h='100px'>Heatmap</Center>

      <Flex f='FB' cn='grow w100 bc2'>

        <HeatmapInput
          inputOptions={inputOptions}
          params={params} updateParams={updateParams} paramRanges={paramRanges}
          results={results} setHMResults={setHMResults}
        />

        <Center cn='grow h100'>
          <HeatmapGridWrapper inputParams={paramRanges} HMResults={HMResults} viewValues={viewValues} viewHover={viewHover} />
          <HeatmapLegend HMResults={HMResults} viewValues={viewValues} setViewValues={setViewValues} viewHover={viewHover} setViewHover={setViewHover} />
        </Center>

      </Flex>



    </Flex>
  )
}
