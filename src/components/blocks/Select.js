import React from 'react'
import { customStyling, customStyle } from './blockUtil'

export default function Select({ cn, type, id, checked, disabled=false, children, onChange, name, ...cssProps }) {

  const cnStr = cn ? cn : ''

  function renderSelect() {
    if (!customStyling([Object.keys(cssProps)])) return (
      <select className={cnStr} type={type} id={id} checked={checked} onChange={onChange} name={name} disabled={disabled} >
        {children}
      </select>
    )

    return (
      <select className={cnStr} type={type} id={id} style={customStyle({ ...cssProps })} checked={checked} onChange={onChange} name={name} disabled={disabled}>
        {children}
      </select>
    )
  }

  return (
    renderSelect()
  )
}
