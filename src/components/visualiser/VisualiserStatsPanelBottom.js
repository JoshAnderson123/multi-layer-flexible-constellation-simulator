import React from 'react'
import { Center, Flex } from '../blocks/blockAPI'

export default function VisualiserStatsPanelBottom({ visuResults }) {

  function calcDeploymentStrategy() {

    const info = []

    function calcApproach() {
      if (!visuResults.strat) return 'Traditional'
      if (visuResults.strat.Lm === 1) return 'Single-Layer Flexibe'
      return 'Multi-Layer Flexible'
    }

    const approach = calcApproach()

    info.push(<Center>{`Approach: ${approach}`}</Center>)
    if (approach !== 'Traditional') info.push(<Center>{`Capacity Jump: ${visuResults.strat.J}`}</Center>)
    if (approach === 'Multi-Layer Flexible') info.push(<Center>{`Max Layers: ${visuResults.strat.Lm}`}</Center>)

    return (
      <Flex f='FSVS' cn='font-stat-small c-ls'>
        {info}
      </Flex>
    )
  }

  return (
    <Flex f='FSVS' cn='c-l1 abs' l='25px' b='20px'>
      <Center cn='font-stat-title'>Deployment Strategy</Center>
      {calcDeploymentStrategy()}
      <Center cn='font-stat-title' mt='25px'>Satellite Design</Center>
      <Flex f='FSVS' cn='font-stat-small c-ls'>
        <Center>{`Antenna Diameter: ${visuResults.family.D}m`}</Center>
        <Center>{`Transmitter Power: ${visuResults.family.P}W`}</Center>
        <Center>{`Downlink Frequency: ${visuResults.family.f}GHz`}</Center>
        <Center>{`Inter-Satellite Links: ${visuResults.family.I}`}</Center>
      </Flex>
    </Flex>
  )
}
