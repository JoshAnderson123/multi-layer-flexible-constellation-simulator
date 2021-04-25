import React from 'react'
import { Center } from '../blocks/blockAPI'
import { invertParam } from '../../config'
import { calcResult, findxFlex, matchConstantsFlex, matchConstantsTrad, parseConst } from '../../utils/utilGeneral'

export default function HeatmapGenerateBtn({ results, params, paramRanges, setHMResults }) {

  function sameParams() { return (params.var.v1 === params.var.v2) }

  function generateResultMatrix() {

    if (sameParams()) return

    const config = {
      var: {
        v1: {
          param: invertParam[document.querySelector('#v1').value],
          range: paramRanges[invertParam[document.querySelector('#v1').value]]
        },
        v2: {
          param: invertParam[document.querySelector('#v2').value],
          range: paramRanges[invertParam[document.querySelector('#v2').value]]
        },
      },
      con: {
        r: parseConst('#c-r'),
        rec: parseConst('#c-rec'),
        σ: parseConst('#c-v'),
        J: parseConst('#c-J'),
        Lm: parseConst('#c-Lm'),
        optimal: parseConst('#c-optimal', true)
      },
      output: document.querySelector('#opt').value
    }

    const v1range = config.var.v1.range
    const v2range = config.var.v2.range
    const v1param = config.var.v1.param
    const v2param = config.var.v2.param

    function getStrats(i1, i2) {

      function getFlexStrat(type) {
        if (config.con.optimal === 'true') {
          const scen = {r: params.con.r, rec: params.con.rec, σ: params.con.σ, [v1param]: v1range[i1], [v2param]: v2range[i2] }
          return findxFlex(scen, results, type)
        }
        return results.flex.find(x =>
          x[v1param] === v1range[i1] &&
          x[v2param] === v2range[i2] &&
          matchConstantsFlex(x, params.var, config.con, type)
        )
      }

      const flexS = getFlexStrat('single')

      const flexM = getFlexStrat('multi')

      const xTrad = results.xTrad.find(x =>
        matchConstantsTrad(x, params.var, config.con)
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
      w='230px' h='50px' mt='20px'
      cn={`c-l1 font-small us-none ${sameParams() ? 'bc-w' : 'bc1 ptr hoverGrow'}`}
      o={sameParams() ? '0.5' : '1'}
      oc={() => generateResultMatrix()}
    >
      Generate heatmap
    </Center>
  )
}
