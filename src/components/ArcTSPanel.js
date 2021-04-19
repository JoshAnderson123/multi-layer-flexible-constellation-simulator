import React, { useEffect, useState } from 'react'
import { drawArchTradespace } from '../utils/draw'
import { Center, Flex } from './blocks/blockAPI'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config'
import PanelTopBar from './PanelTopBar'
import Grid from './blocks/Grid'
import { DropdownConst } from './Dropdown'
import { calcResultParamRanges } from '../utils/tradespace'
import { parseConst, simulationInputs } from '../utils/utilGeneral'

export default function ArcTSPanel({ inputs, results, setPanel }) {

  const [params, setParams] = useState()
  const paramRanges = calcResultParamRanges(inputs)

  useEffect(() => {
    if (params) {
      drawArchTradespace(
        simulationInputs(inputs.scenario),
        results,
        params
      )
    }
  }, [params])

  function updateParams() {
    const r = parseConst('#c-r')
    const rec = parseConst('#c-rec')
    const σ = parseConst('#c-v')
    setParams({ r, rec, σ })
  }

  return (
    <Flex f='FSV' w='100%' h='100%' bc='#ddd' cn='rel bsh3'>
      <PanelTopBar setPanel={setPanel} />
      <Flex f='FB' cn='grow w100'>

        <Flex f='FSV' cn='bor-field-r rig rel h100' w='200px' p='20px' z='100'>
          <Center f='FS' cn='font-title c-d1 w100'>Contants</Center>
          <Grid gtr='1fr 1fr 1fr' gg='0px' mt='20px' ml='20px' cn='rel w100'>
            <DropdownConst id='c-r' name='r' options={paramRanges.r} />
            <DropdownConst id='c-rec' name='rec' options={paramRanges.rec} />
            <DropdownConst id='c-v' name='σ' options={paramRanges.σ} />
          </Grid>

          <Center
            p='7px' mt='40px'
            cn={`c-l1 font-small us-none bc1 ptr hoverGrow ta-center`}
            oc={() => updateParams()}
          >
            View Tradespace
          </Center>

        </Flex>

        <Center cn='grow h100 rel' >
          <canvas id="main-canvas"
            width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
            style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}
          >
          </canvas>
        </Center>

      </Flex>
    </Flex>
  )
}
