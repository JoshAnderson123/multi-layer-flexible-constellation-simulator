import React from 'react'
import { formatHMItem } from '../../utils/utilGeneral'
import { Center } from '../blocks/blockAPI'

export default function HeatmapItem({ HMResults, viewValues, viewHover, i, scale, setSelectedVal }) {

  function updateSelectedVal(e) {
    const rect = e.target.getBoundingClientRect()
    setSelectedVal({ id: i, val: formatHMItem(HMResults.config.output, HMResults.data[i]), rect })
  }

  return (
    <Center
      bc={scale(HMResults.data[i]).hex()}
      cn={`ov-h ${viewHover ? 'heatmap-item' : ''}`}
      ome={e => updateSelectedVal(e)}
    >
      { viewValues ? formatHMItem(HMResults.config.output, HMResults.data[i]) : null}
    </Center>
  )
}
