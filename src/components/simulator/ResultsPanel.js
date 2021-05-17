import React, { useEffect, useState } from 'react'
import { calcResultParamRanges } from '../../utils/tradespace'
import { calcResultFormatted, caseStr, copyResultsToClipboard, findxFlex, findxTrad, isEmpty, openResultsFile, parseConst } from '../../utils/utilGeneral'
import { Center, File, Flex, Grid, Img, Input } from '../blocks/blockAPI'
import { DropdownConst } from './Dropdown'
import PanelTopBar from './PanelTopBar'
import ResultBtn from './ResultBtn'

export default function ResultsPanel({ setPanel, inputs, results, updateResults }) { //w='1050px' h='800px

  const [cse, setCse] = useState()
  const paramRanges = calcResultParamRanges(inputs)

  useEffect(() => {
    updateParams()
  }, [inputs])

  function updateParams() {
    const r = parseConst('#c-r')
    const rec = parseConst('#c-rec')
    const σ = parseConst('#c-v')
    setCse({ r, rec, σ })
  }

  function displayResults() {
    if (!cse || isEmpty(results)) return null
    if(!paramRanges.r.includes(cse?.r) || !paramRanges.rec.includes(cse?.rec) || !paramRanges.σ.includes(cse?.σ)) return null

    const xTrad = findxTrad(caseStr(cse), results)
    const xFlexS = findxFlex(caseStr(cse), results, 'single')
    const xFlexM = findxFlex(caseStr(cse), results, 'multi')

    return (
      <Center cn='h100 grow bc2-2 ct1'>
        <Flex f='FSVS' cn='font-result-data ws-pre' ml='-30px' >
          <Flex f='FS'>{`              xTrad.LCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'xTrad.LCC')}`}</Flex>
          <Flex f='FS' mt='3px'>{`              xFlexS.ELCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'flexS.ELCC')}`}</Flex>
          <Flex f='FS' mt='3px'>{`              xFlexM.ELCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'flexM.ELCC')}`}</Flex>
          <Flex f='FS' mt='3px'>{`  xFlexS.ELCC / xTrad.LCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'flexS.ELCC / xTrad.LCC')}`}</Flex>
          <Flex f='FS' mt='3px'>{`  xFlexM.ELCC / xTrad.LCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'flexM.ELCC / xTrad.LCC')}`}</Flex>
          <Flex f='FS' mt='3px'>{`xFlexM.ELCC / xFlexS.ELCC: ${calcResultFormatted(xTrad, xFlexS, xFlexM, 'flexM.ELCC / flexS.ELCC')}`}</Flex>
        </Flex>
      </Center>
    )
  }

  function displayResultButtons() {

    if (isEmpty(results)) return (
      <Flex f='FSV'>
        <Center cn='w100 grow font-title ct1'>No results collected</Center>
        <File id='upload-json' mt='10px' cn='bc1 c-l1 font-small ptr hoverGrow' p='10px' onChange={e => openResultsFile(e, updateResults)}>Upload JSON</File>
      </Flex>
    )

    return (
      <>
        <Center cn='w100' mt='30px'>
          <ResultBtn imgSrc='Heatmap.svg' text='Heatmap' func={() => setPanel('heatmap')} />
          <ResultBtn imgSrc='ArcTS.svg' text='Arc TS' func={() => setPanel('arcts')} ml='20px' />
          <ResultBtn imgSrc='3D.svg' text='3D Visualiser' func={() => setPanel('visualise')} ml='20px' />
        </Center>
        <Center mt='20px'>
          <Center h='40px' p='0 10px' cn='bc1 c-l1 ptr hoverGrow rel' oc={() => copyResultsToClipboard(inputs, results)} >
            <Img src='download.svg' h='60%' cn='of-cont' />
            <Center cn='c-l1 font-small' ml='10px' >Download</Center>
          </Center>
          <File id='upload-json2' ml='10px' h='40px' p='0 10px'  cn='bc1 c-l1 ptr hoverGrow rel FC' onChange={e => openResultsFile(e, updateResults)}>
            <Img src='upload.svg' h='60%' cn='of-cont' />
            <Center cn='c-l1 font-small' ml='10px' >Upload</Center>
          </File>
        </Center>

      </>
    )
  }

  return (
    <Flex f='FSV' w='100%' h='100%' cn='rel bc2'>
      <PanelTopBar setPanel={setPanel} />
      <Center cn='w100 font-title2 ct1 bc2-2 bor-field rig' h='100px'>Results</Center>
      <Flex f='FCV' cn='w100 grow'>
        <Flex f='FB' w='940px' h='200px' cn={`bor-field-f bc2 ${!isEmpty(results) ? '' : 'none'}`}> {/* Display: none is used rather than return null because the fields need to be in the DOM even if there are no results yet. Could be changed in future */}
          <Flex f='FCV' cn='bor-field-r rig rel ct1 h100' w='200px' p='20px' z='100'>
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
