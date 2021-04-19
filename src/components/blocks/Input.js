import React from 'react'
import { customStyling, customStyle } from './blockUtil'

export default function Input({ cn, type, id, value, checked, children, onChange, name, ...cssProps }) {

  const cnStr = cn ? cn : ''

  function renderInput() {
    if (!customStyling([Object.keys(cssProps)])) return (
      <input className={cnStr} type={type} id={id} checked={checked} onChange={onChange} value={value} name={name} >
        {children}
      </input>
    )

    return (
      <input className={cnStr} type={type} id={id} style={customStyle({ ...cssProps })} checked={checked} onChange={onChange} value={value} name={name}>
        {children}
      </input>
    )
  }

  return (
    renderInput()
  )
}
