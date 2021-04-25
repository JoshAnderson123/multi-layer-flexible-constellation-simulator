import React from 'react'
import { Center, Flex } from '../blocks/blockAPI'

export default function VisualiserStatsPanelBottom({ visuResults }) {

  const approach = (() => {
    if (!visuResults.strat) return 'Traditional'
    if (visuResults.strat.Lm === 1) return 'Single-Layer Flexibe'
    return 'Multi-Layer Flexible'
  })()

  const statOp = '0.8' // Stat Opacity

  function calcDeploymentStrategy() {

    const info = []    

    info.push(<Center o={statOp}>{`Approach: ${approach}`}</Center>)
    if (approach !== 'Traditional') info.push(<Center o={statOp} >{`Capacity Jump: ${visuResults.strat.J}`}</Center>)
    if (approach === 'Multi-Layer Flexible') info.push(<Center o={statOp}>{`Max Layers: ${visuResults.strat.Lm}`}</Center>)

    return (
      <Flex f='FSVS' cn='font-stat-small c-ls'>
        {info}
      </Flex>
    )
  }

  function calcSatelliteDesign() {

    const info = []    

    info.push(<Center o={statOp}>{`Antenna Diameter: ${visuResults.family.D}m`}</Center>)
    info.push(<Center o={statOp}>{`Transmitter Power: ${visuResults.family.P}W`}</Center>)
    info.push(<Center o={statOp}>{`Downlink Frequency: ${visuResults.family.f}GHz`}</Center>)
    info.push(<Center o={statOp}>{`Inter-Satellite Links: ${visuResults.family.I}`}</Center>)
    if (approach !== 'Traditional') info.push(<Center o={statOp}>{`Max Reconfigurations: ${visuResults.maxReconsPerSat}`}</Center>)

    return (
      <Flex f='FSVS' cn='font-stat-small c-ls'>
        {info}
      </Flex>
    )
  }

  return (
    <Flex f='FSVS' cn='ct1 abs' l='25px' b='20px'>
      <Center cn='font-stat-title'>Deployment Strategy</Center>
      {calcDeploymentStrategy()}
      <Center cn='font-stat-title' mt='25px'>Satellite Design</Center>
      {calcSatelliteDesign()}
    </Flex>
  )
}
