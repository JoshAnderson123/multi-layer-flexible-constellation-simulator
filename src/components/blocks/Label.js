import React from 'react'
import { customStyling, customStyle } from './blockUtil'

export default function Label({ cn, htmlFor, children, ...cssProps }) {

  const cnStr = cn ? cn : ''

  function renderLabel() {
    if (!customStyling([Object.keys(cssProps)])) return (
      <label className={cnStr} htmlFor={htmlFor}>
        {children}
      </label>
    )

    return (
      <label className={cnStr} htmlFor={htmlFor} style={customStyle({ ...cssProps })}>
        {children}
      </label>
    )
  }

  return (
    renderLabel()
  )
}
