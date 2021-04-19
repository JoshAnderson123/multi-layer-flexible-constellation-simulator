import React from 'react'
import { Center, Grid } from './blocks/blockAPI'

export default function PanelTopBar({ setPanel }) {
  return (
    <Grid gtc='1fr 1fr' gg='1px' cn='w100 font-grid-small c-d1 bor-field' bc='rgba(0, 0, 0, 0.3)' h='30px'>
      <Center cn='grow bc-l2 ptr' oc={() => setPanel('setup')}>Setup</Center>
      <Center cn='grow bc-l2 ptr' oc={() => setPanel('results')}>Results</Center>
    </Grid>
  )
}
