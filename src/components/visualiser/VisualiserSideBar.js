import React from 'react'
import { calcResultParamRanges } from '../../utils/tradespace'
import { Center, Flex, Grid } from '../blocks/blockAPI'
import { DropdownConst } from '../simulator/Dropdown'

export default function VisualiserSideBar({ inputs }) {

  const paramRanges = calcResultParamRanges(inputs)

  return (
    <Flex w='600px' cn='h100 rig bc-l2' p='20px 0'>

      <Flex f='FSVS rel' p='0 20px'>
        <Flex f='FS' cn='font-title'>Inputs</Flex>

        <Center cn='w100 bc-d3' h='1px' m='10px 0' />

        <Grid gtc='1fr 1.5fr' cn='w100'>
          <Flex f='FSV'>
            <Center cn='font-title3'>Scenario</Center>
            <DropdownConst id='c-r' name='r' options={paramRanges.r} />
            <DropdownConst id='c-rec' name='rec' options={paramRanges.rec} />
            <DropdownConst id='c-v' name='σ' options={paramRanges.σ} />
          </Flex>
          <Flex f='FSV'>
            <Center cn='font-title3'>Strategy</Center>
            <DropdownConst id='c-J' name='J' options={paramRanges.J} />
            <DropdownConst id='c-Lm' name='Lm' options={paramRanges.Lm} />
            <DropdownConst id='c-Ld' name='Ld' options={paramRanges.Ld} />
          </Flex>
        </Grid>

        <Center cn='w100 bc-d3' h='1px' m='20px 0 10px 0' />

        <Center cn='w100'>
          <Center
            w='230px' h='30px'
            cn={`c-l1 font-small us-none bc1 ptr hoverGrow`}
          >
            Generate scenario
          </Center>
        </Center>

      </Flex>
      
      <Center cn='w100 bc-d3' h='1px' m='20px 0' />

      <Flex f='FSVS rel' p='0 20px'>
        <Flex f='FS' cn='font-title'>Simulation</Flex>

        <Center cn='w100 bc-d3' h='1px' m='10px 0' />


      </Flex>

    </Flex>
  )
}
