import React from 'react'
import { Center } from '../blocks/blockAPI'
import { invertParam } from '../../config'
import { calcResult, caseStr, findFamilyFromFlex, findFlex, findxFlex, findxTrad, matchConstantsFlex, matchConstantsTrad, parseConst } from '../../utils/utilGeneral'

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

      const cse = caseStr({
        r: config.con.r,
        rec: config.con.rec,
        σ: config.con.σ,
        [v1param]: v1range[i1],
        [v2param]: v2range[i2]
      })

      const strat = {
        J: config.con.J,
        Lm: config.con.Lm,
        [v1param]: v1range[i1],
        [v2param]: v2range[i2]
      }

      function getFlexStrat(type) {
        if (config.con.optimal === 'true') {
          return findxFlex(cse, results, type)
        }
        return findFlex(cse, strat, results, type)
      }

      const flexS = getFlexStrat('single')
      const flexM = getFlexStrat('multi')
      const xTrad = findxTrad(cse, results)

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
