import React from 'react'
import { Center, Flex, Grid } from '../blocks/blockAPI'
import { DropdownConst, DropdownOpt, DropdownVar } from './Dropdown'
import HeatmapGenerateBtn from './HeatmapGenerateBtn'
import { outputOptions, invertParam, inputOptions } from '../../config'
import { parseConst } from '../../utils/utilGeneral'

export default function HeatmapInput({ inputOptions, params, updateParams, paramRanges, results, setHMResults }) {

  function checkDisabled(p) {
    if (p === 'optimal') return ['Lm','J'].includes(params.var.v1) || ['Lm','J'].includes(params.var.v2)
    if (['Lm','J'].includes(p) && params.con.optimal === 'true') return true
    return params.var.v1 === p || params.var.v2 === p
  }

  return (
    <Flex f='FSVS' cn='bor-field-r h100' w='400px' p='40px'>

        <Flex f='FSVS'>
          <Flex f='FS' cn='font-title'>Variables</Flex>
          <DropdownVar id='v1' name='v1' sel='Capacity Jump' options={inputOptions} onChange={() => updateParams('v1')} />
          <DropdownVar id='v2' name='v2' options={inputOptions} onChange={() => updateParams('v2')} />
        </Flex>

        <Flex f='FSVS' mt='50px'>
          <Flex f='FS' cn='font-title'>Contants</Flex>
          <Grid gtc='1fr 1fr 1fr' gg='0 15px' cn='rel' l='-20px'>
            <DropdownConst id='c-r' name='r' options={paramRanges.r} sel={params.con.r} disabled={checkDisabled('r')} onChange={() => updateParams('r')} />
            <DropdownConst id='c-rec' name='rec' options={paramRanges.rec} sel={params.con.rec} disabled={checkDisabled('rec')} onChange={() => updateParams('rec')} />
            <DropdownConst id='c-v' name='σ' options={paramRanges.σ} sel={params.con.σ} disabled={checkDisabled('σ')} onChange={() => updateParams('σ')} />
            <DropdownConst id='c-optimal' name='Optimal' options={['false', 'true']} sel={params.con.optimal} disabled={checkDisabled('optimal')} onChange={() => updateParams('optimal')} />
            <DropdownConst id='c-J' name='J' options={paramRanges.J} sel={params.con.J} disabled={checkDisabled('J')} onChange={() => updateParams('J')} />
            <DropdownConst id='c-Lm' name='Lm' options={paramRanges.Lm} sel={params.con.Lm} disabled={checkDisabled('Lm')} onChange={() => updateParams('Lm')} />
          </Grid>
        </Flex>

        <Flex f='FSVS' mt='50px'>
          <Flex f='FS' cn='font-title'>Output</Flex>
          <DropdownOpt id='opt' name='Output' options={outputOptions} />
          <HeatmapGenerateBtn results={results} params={params} paramRanges={paramRanges} setHMResults={setHMResults} />
        </Flex>

    </Flex>
  )
}
