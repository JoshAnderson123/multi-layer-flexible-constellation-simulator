import React from 'react'
import Block from './Block'

export default function Center({ cn, children, ...cssProps }) {

  const cnStr = cn ? `FC ${cn}` : 'FC'

  return (
    <Block cnStr={cnStr} {...cssProps} >
      {children}
    </Block>
  )
}