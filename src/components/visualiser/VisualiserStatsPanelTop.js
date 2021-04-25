import React from 'react'
import { defaultSim } from '../../config'
import { calculateDate, dollars, shortNumber } from '../../utils/utilGeneral'
import { Center, Flex } from '../blocks/blockAPI'
import VisualiserLayerStat from './VisualiserLayerStat'

export default function VisualiserStatsPanelTop({ currentStep, visuResults, viewLayers, setViewLayers }) {

  function calcLCC() {
    let LCC = 0
    for (let i = 0; i < currentStep; i++) LCC += visuResults.cost[i]
    return LCC
  }

  return (
    <Flex f='FSVS' cn='ct1 abs' l='25px' t='20px'>
      <Center cn='font-stat-title-big'>{calculateDate(currentStep, defaultSim.steps, defaultSim.T)}</Center>
      <Flex f='FSVS' cn='font-stat-medium c-ls'>
        <Center>{`Demand: ${shortNumber(visuResults.demand[currentStep])}`}</Center>
        <Center>{`Capacity: ${shortNumber(visuResults.capacity[currentStep])}`}</Center>
        <Center>{`LCC: ${dollars(calcLCC())}`}</Center>
      </Flex>

      <Flex f='FSVS' mt='10px'>
        {visuResults.layers[currentStep].map((v, i) => <VisualiserLayerStat number={i} details={v} viewLayers={viewLayers} setViewLayers={setViewLayers} />)}
      </Flex>

    </Flex>
  )
}
