import Simulator from './Visualiser'
import VisualiserOptions from './VisualiserOptions'
import React, { useState } from 'react'
import { render, constellationInventory } from '../../config'
import { Center, Flex } from '../blocks/blockAPI'
import PanelTopBar from '../simulator/PanelTopBar'
import VisualiserSideBar from './VisualiserSideBar'

export const RenderContext = React.createContext()

export default function VisualiserPanel({ setPanel, inputs, results }) {

  let [renderCtx, setRenderCtx] = useState(render)

  return (
    <div className="page-container">
      <Flex f='FSV' w='100%' h='100%' bc='#ddd' cn='rel bsh3 c-d1'>
        <PanelTopBar setPanel={setPanel} />
        <Flex f='FB' cn='w100 grow rel'>
          <VisualiserSideBar inputs={inputs} />
          <Center cn='h100 grow rel'>
            <Simulator  renderCtx={renderCtx} results={results} />
            <VisualiserOptions renderCtx={renderCtx} setRenderCtx={setRenderCtx} />
          </Center>
        </Flex>
      </Flex>
      {/* <div className="top-bar"></div> */}
      <div className="simulation-container">

      </div>
    </div>
  );
}