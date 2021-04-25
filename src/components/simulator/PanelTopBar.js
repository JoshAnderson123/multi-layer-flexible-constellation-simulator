import React from 'react'
import { Center, Grid } from '../blocks/blockAPI'

export default function PanelTopBar({ setPanel }) {
  return (
    <Grid gtc='1fr 1fr' gg='1px' cn='w100 font-grid-small ct1 bc2 bor-topbar' h='40px'>
      <Center cn='grow ptr' oc={() => setPanel('setup')}>Setup</Center>
      <Center cn='grow ptr' oc={() => setPanel('results')}>Results</Center>
    </Grid>
  )
}