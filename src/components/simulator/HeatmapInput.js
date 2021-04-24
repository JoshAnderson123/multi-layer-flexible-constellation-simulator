import React from 'react'
import { Center, Flex, Grid } from '../blocks/blockAPI'
import { DropdownConst, DropdownOpt, DropdownVar } from './Dropdown'
import HeatmapGenerateBtn from './HeatmapGenerateBtn'
import { outputOptions, invertParam, inputOptions } from '../../config'

export default function HeatmapInput({ inputOptions, varParams, updateVarParams, paramRanges, results, setHMResults }) {

  function checkDisabled(p) {
    return varParams.v1 === p || varParams.v2 === p
  }

  return (
    <Flex f='FSVS' cn='bor-field-r h100' w='400px' p='40px'>

        <Flex f='FSVS'>
          <Flex f='FS' cn='font-title'>Variables</Flex>
          <DropdownVar id='v1' name='v1' sel='Capacity Jump' options={inputOptions} onChange={() => updateVarParams('v1')} />
          <DropdownVar id='v2' name='v2' options={inputOptions} onChange={() => updateVarParams('v2')} />
        </Flex>

        <Flex f='FSVS' mt='50px'>
          <Flex f='FS' cn='font-title'>Contants</Flex>
          <Grid gtc='1fr 1fr 1fr' gg='0 15px' cn='rel' l='-20px'>
            <DropdownConst id='c-r' name='r' options={paramRanges.r} disabled={checkDisabled('r')} />
            <DropdownConst id='c-rec' name='rec' options={paramRanges.rec} disabled={checkDisabled('rec')} />
            <DropdownConst id='c-v' name='σ' options={paramRanges.σ} disabled={checkDisabled('σ')} />
            <DropdownConst id='c-J' name='J' options={paramRanges.J} disabled={checkDisabled('J')} />
            <DropdownConst id='c-Lm' name='Lm' options={paramRanges.Lm} disabled={checkDisabled('Lm')} />
          </Grid>
        </Flex>

        <Flex f='FSVS' mt='50px'>
          <Flex f='FS' cn='font-title'>Output</Flex>
          <DropdownOpt id='opt' name='Output' options={outputOptions} />
          <HeatmapGenerateBtn results={results} varParams={varParams} paramRanges={paramRanges} setHMResults={setHMResults} />
        </Flex>

    </Flex>
  )
}
