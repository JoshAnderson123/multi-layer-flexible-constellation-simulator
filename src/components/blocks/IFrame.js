import React from 'react'
import { customStyling, customStyle } from './blockUtil'

export default function Video({ cn, src, alt, oc, title, ...cssProps }) {

  const cnStr = cn ? cn : ''

  function renderVideo() {
    if (!customStyling([Object.keys(cssProps)])) return (
      <iframe
        src={src}
        alt={alt}
        className={cnStr}
        onClick={oc}
        loading='lazy'
        title={title}
      ></iframe>)

    return (
      <iframe
        style={customStyle({ ...cssProps })}
        src={src}
        alt={alt}
        className={cnStr}
        onClick={oc}
        loading='lazy'
        title={title}
      ></iframe>)
  }

  return (
    renderVideo()
  )
}
