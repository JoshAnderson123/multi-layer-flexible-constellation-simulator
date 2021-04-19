import React from 'react'
import Block from './Block'

export default function Grid({ cn, children, ...cssProps }) {

  const cnStr = cn ? `grid ${cn}` : 'grid'

  return (
    <Block cnStr={cnStr} {...cssProps} >
      {children}
    </Block>
  )
}
