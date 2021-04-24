import React from 'react'
import { Center } from '../blocks/blockAPI'
import { invertParam } from '../../config'
import { calcResult, matchConstantsFlex, matchConstantsTrad, parseConst } from '../../utils/utilGeneral'

export default function HeatmapGenerateBtn({ results, varParams, paramRanges, setHMResults }) {

  function sameParams() { return (varParams.v1 === varParams.v2) }

  function generateResultMatrix() {

    if (sameParams()) return

    const config = {
      varParams: {
        v1: {
          param: invertParam[document.querySelector('#v1').value],
          range: paramRanges[invertParam[document.querySelector('#v1').value]]
        },
        v2: {
          param: invertParam[document.querySelector('#v2').value],
          range: paramRanges[invertParam[document.querySelector('#v2').value]]
        },
      },
      constParams: {
        r: parseConst('#c-r'),
        rec: parseConst('#c-rec'),
        σ: parseConst('#c-v'),
        J: parseConst('#c-J'),
        Lm: parseConst('#c-Lm')
      },
      output: document.querySelector('#opt').value
    }

    const v1range = config.varParams.v1.range
    const v2range = config.varParams.v2.range

    function getStrats(i1, i2) {

      const flexS = results.flex.find(x =>
        x[varParams.v1] === v1range[i1] &&
        x[varParams.v2] === v2range[i2] &&
        matchConstantsFlex(x, varParams, config.constParams, 'single')
        // x.Lm === 1
      )

      const flexM = results.flex.find(x =>
        x[varParams.v1] === v1range[i1] &&
        x[varParams.v2] === v2range[i2] &&
        matchConstantsFlex(x, varParams, config.constParams, 'multi')
        // x.Lm > 1
      )

      const xTrad = results.xTrad.find(x =>
        matchConstantsTrad(x, varParams, config.constParams)
      )

      return { flexS, flexM, xTrad }
    }

    let data = []

    for (let i2 = 0; i2 < v2range.length; i2++) {
      // const row = []
      for (let i1 = 0; i1 < v1range.length; i1++) {
        const { flexS, flexM, xTrad } = getStrats(i1, i2)
        const result = calcResult(xTrad, flexS, flexM, config.output)
        data.push(result)
      }
    }
    setHMResults({ config, data })
  }

  return (
    <Center
      w='230px' h='30px' mt='10px'
      cn={`c-l1 font-small us-none ${sameParams() ? 'bc-w' : 'bc1 ptr hoverGrow'}`}
      o={sameParams() ? '0.5' : '1'}
      oc={() => generateResultMatrix()}
    >
      Generate heatmap
    </Center>
  )
}
