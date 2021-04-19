import React from 'react'
import Block from './Block'

export default function Aspect({ w, cn, ar, js, mt, as, pos, t, r, b, l, children, ...cssProps }) {

  const cnStr = cn ? cn : ''

  return (
    <Block w={w} pos='relative' js={js} as={as} mt={mt} t={t} r={r} b={b} l={l}> 
      <Block pt={`${(1 / ar) * 100}%`}>
        <Block cnStr={cnStr} pos='absolute' t='0' l='0' w='100%' h='100%' {...cssProps}>
          {children}
        </Block>
      </Block>
    </Block>
  )
}

// Layer 1 - Container that sets the width
// Layer 2 - Container that sets the height (via padding-top)
// Layer 3 - Contents