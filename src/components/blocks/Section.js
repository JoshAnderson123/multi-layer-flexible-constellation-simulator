import React from 'react'
import Block from './Block'

export default function Section({ cn, children, ...cssProps }) {

  const cnStr = cn ? `section ${cn}` : 'section'

  return (
    <Block cnStr={cnStr} {...cssProps} >
      {children}
    </Block>
  )
}