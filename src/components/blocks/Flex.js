import React from 'react'
import Block from './Block'

export default function Flex({ cn, f, children, ...cssProps }) {

  const cnStr = `${f ? f : ''}${cn ? ' ' + cn : ''}`

  return (
    <Block cnStr={cnStr} {...cssProps} >
      {children}
    </Block>
  )
}
