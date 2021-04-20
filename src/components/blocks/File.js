import React from 'react'
import { customStyling, customStyle } from './blockUtil'

export default function File({ cn, id, value, children, onChange, name, ...cssProps }) {

  const cnStr = cn ? cn : ''

  function renderFile() {
    
    if (!customStyling([Object.keys(cssProps)])) return (
      <>
        <label for={id} className={cnStr}>{children}</label>
        <input type='file' id={id} onChange={onChange} value={value} name={name} style={{'display': 'none'}}></input>
      </>
    )

    return (
      <>
        <label for={id} className={cnStr} style={customStyle({ ...cssProps })}>{children}</label>
        <input type='file' id={id} onChange={onChange} value={value} name={name} style={{'display': 'none'}}></input>
      </>
    )
  }

  return (
    renderFile()
  )
}
