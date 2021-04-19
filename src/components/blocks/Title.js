import React from 'react'
import Block from './Block'

export default function Title({ cn, children, ...cssProps }) {

  const cnStr = cn ? `font-title2 ${cn}` : 'font-title2'

  return (
    <Block cnStr={cnStr} {...cssProps} >
      {children}
    </Block>
  )
}