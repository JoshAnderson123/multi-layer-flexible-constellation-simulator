import React from 'react'
import { customStyling, customStyle } from './blockUtil'

export default function Button({ cn, type, disabled, children, ...cssProps }) {

  let cnStr = cn ? cn : ''
  if (!disabled) cnStr = `ptr ${cnStr}`

  function renderButton() {
    if (!customStyling([Object.keys(cssProps)])) return (
      <button className={cnStr} type={type} disabled={disabled}>
        {children}
      </button>
    )

    return (
      <button className={cnStr} type={type} disabled={disabled} style={customStyle({ ...cssProps })}>
        {children}
      </button>
    )
  }

  return (
    renderButton()
  )
}
