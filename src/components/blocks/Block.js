import React from 'react'
import { customStyling, customStyle } from './blockUtil'

export default function Block({ cnStr, AOS, id, onAnimationEnd, oc, children, ...cssProps }) {

  function renderBlock() {
    if (!customStyling([Object.keys(cssProps)])) return (
      <div className={cnStr} data-aos={AOS} onClick={oc} onAnimationEnd={onAnimationEnd} id={id}>
        {children}
      </div>
    )
    return (
      <div style={customStyle({ ...cssProps })} className={cnStr} data-aos={AOS}  onClick={oc} onAnimationEnd={onAnimationEnd} id={id}>
        {children}
      </div>
    )
  }

  return (
    renderBlock()
  )
}
