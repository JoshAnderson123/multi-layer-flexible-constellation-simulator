import React from 'react'
import { customStyling, customStyle } from './blockUtil'

export default function Video({ cn, src, alt, oc, loop, muted, controls, autoplay, ...cssProps }) {

  const cnStr = cn ? cn : ''

  function renderVideo() {
    if (!customStyling([Object.keys(cssProps)])) return (
      <video
        src={`/media/${src}`}
        alt={alt}
        className={cnStr}
        onClick={oc}
        loading='lazy'
        loop={loop}
        muted={muted}
        controls={controls}
        autoplay={autoplay}
      />)

    return (
      <video
        style={customStyle({ ...cssProps })}
        src={`/media/${src}`}
        alt={alt}
        className={cnStr}
        onClick={oc}
        loading='lazy'
        loop={loop}
        muted={muted}
        controls={controls}
        autoplay={autoplay}
      />)
  }

  return (
    renderVideo()
  )
}
