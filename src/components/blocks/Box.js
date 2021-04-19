import React from 'react'
import Block from './Block'

export default function Box({ cn, children, ...cssProps }) {

  const cnStr = cn ? cn : ''

  return (
    <Block cnStr={cnStr} {...cssProps} >
      {children}
    </Block>
  )
}