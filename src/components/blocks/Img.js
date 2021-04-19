import React from 'react'
import { customStyling, customStyle } from './blockUtil'

export default function Image({ cn, src, alt, oc, onAnimationEnd, ...cssProps }) {

  const cnStr = cn ? cn : ''

  function renderImage() {
    if (!customStyling([Object.keys(cssProps)])) return (
      <img
        src={`/media/${src}`}
        alt={alt}
        className={cnStr}
        onClick={oc}
        loading='lazy'
        onAnimationEnd={onAnimationEnd}
      />)

    return (
      <img
        style={customStyle({ ...cssProps })}
        src={`/media/${src}`}
        alt={alt}
        className={cnStr}
        onClick={oc}
        loading='lazy'
        onAnimationEnd={onAnimationEnd}
      />)
  }

  return (
    renderImage()
  )
}
