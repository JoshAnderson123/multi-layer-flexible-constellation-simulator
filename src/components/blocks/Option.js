import React from 'react'
import { customStyling, customStyle } from './blockUtil'

export default function Option({ cn, id, value, selected, children, ...cssProps }) {

  const cnStr = cn ? cn : ''

  function renderInput() {
    if (!customStyling([Object.keys(cssProps)])) return (
      <option className={cnStr} id={id} value={value} selected={selected} >
        {children}
      </option>
    )

    return (
      <option className={cnStr} id={id} selected={selected} style={customStyle({ ...cssProps })} value={value}>
        {children}
      </option>
    )
  }

  return (
    renderInput()
  )
}
