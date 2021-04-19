import React, { useEffect, useState } from 'react'
import { calcResultParamRanges } from '../../utils/tradespace'
import { calcResultFormatted, findxFlex, findxTrad, parseConst } from '../../utils/utilGeneral'
import { Center, Flex, Grid } from '../blocks/blockAPI'
import { DropdownConst } from './Dropdown'
import PanelTopBar from './PanelTopBar'
import ResultBtn from './ResultBtn'

export default function ResultsPanel({ setPanel, inputs, results }) { //w='1050px' h='800px

  const [params, setParams] = useState()
  const paramRanges = calcResultParamRanges(inputs)

  useEffect(() => {
    updateParams()
  }, [])

  function updateParams() {
    const r = parseConst('#c-r')
    const rec = parseConst('#c-rec')
    const σ = parseConst('#c-v')
    setParams({ r, rec, σ })
  }

  function displayResults() {
    if (!params || !results.xTrad) return null
    const xTrad = findxTrad(params, results)
    const xFlexS = findxFlex(params, results, 'single')
    const xFlexM = findxFlex(params, results, 'multi')

    return (
      <Center cn='h100 grow' bc='#fff'>
        <Flex f='FSVS' cn='font-result-data ws-pre' ml='-30px' >
          <Flex f='FS'>{`              xTrad.LCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'xTrad.LCC')}`}</Flex>
          <Flex f='FS' mt='3px'>{`             flexS.ELCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'flexS.ELCC')}`}</Flex>
          <Flex f='FS' mt='3px'>{`             flexM.ELCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'flexM.ELCC')}`}</Flex>
          <Flex f='FS' mt='3px'>{` flexS.ELCC / xTrad.LCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'flexS.ELCC / xTrad.LCC')}`}</Flex>
          <Flex f='FS' mt='3px'>{` flexM.ELCC / xTrad.LCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'flexM.ELCC / xTrad.LCC')}`}</Flex>
          <Flex f='FS' mt='3px'>{`flexM.ELCC / flexS.ELCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'flexM.ELCC / flexS.ELCC')}`}</Flex>
        </Flex>
      </Center>
    )
  }

  function displayResultButtons() {

    if (!results.xTrad) return <Center cn='w100 grow font-small'>No results collected</Center>

    return (
      <Center cn='w100' mt='30px'>
        <ResultBtn imgSrc='Heatmap.svg' text='Heatmap' func={() => setPanel('heatmap')} />
        <ResultBtn imgSrc='ArcTS.svg' text='Arc TS' func={() => setPanel('arcts')} ml='20px' />
        <ResultBtn imgSrc='3D.svg' text='3D Visualiser' func={() => setPanel('visualise')} ml='20px' />
        {/* <Center w='300px' h='300px' cn='bc1 c-l1 font-title ptr hoverGrow' oc={() => setPanel('heatmap')}>Heatmap</Center>
        <Center w='300px' h='300px' ml='20px' cn='bc1 c-l1 font-title ptr hoverGrow'>Arc TS</Center>
        <Center w='300px' h='300px' ml='20px' cn='bc1 c-l1 font-title ptr hoverGrow'>3D Visualiser</Center> */}
      </Center>
    )
  }

  return (
    <Flex f='FSV' w='100%' h='100%' bc='#ddd' cn='rel bsh3 c-d1'>
      <PanelTopBar setPanel={setPanel} />
      <Center cn='w100 font-title2 c-d1 bor-field rig' h='100px'>Results</Center>
      <Flex f='FCV' cn='w100 grow'>

        <Flex f='FB' w='940px' h='200px' cn={`bor-field-f bc-l2 ${results.xTrad ? '' : 'none'}`}>
          <Flex f='FSV' cn='bor-field-r rig rel h100' w='200px' p='20px' z='100'>
            <Grid gtr='1fr 1fr 1fr' gg='0px' mt='-5px' cn='rel'>
              <DropdownConst id='c-r' name='r' options={paramRanges.r} />
              <DropdownConst id='c-rec' name='rec' options={paramRanges.rec} />
              <DropdownConst id='c-v' name='σ' options={paramRanges.σ} />
            </Grid>
            <Center
              p='7px' mt='10px'
              cn={`c-l1 font-small us-none bc1 ptr hoverGrow ta-center`}
              oc={() => updateParams()}
            >
              View Results
          </Center>
          </Flex>
          {displayResults()}
        </Flex>
        

        {displayResultButtons()}
      </Flex>
    </Flex>
  )
}
