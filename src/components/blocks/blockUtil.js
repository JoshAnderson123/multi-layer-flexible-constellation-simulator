const styleAbr = {
  'anDu': 'animationDuration',
  'anDe': 'animationDelay',
  'anDi': 'animationDirection',
  'w': 'width',
  'h': 'height',
  'bac': 'background',
  'bor': 'border',
  'bc': 'backgroundColor',
  'br': 'borderRadius',
  'c': 'color',
  'gtc': 'gridTemplateColumns',
  'gtr': 'gridTemplateRows',
  'gg': 'gridGap',
  'o': 'opacity',
  'pt': 'paddingTop',
  'pr': 'paddingRight',
  'pb': 'paddingBottom',
  'pl': 'paddingLeft',
  'p': 'padding',
  'ps': 'placeSelf',
  'mt': 'marginTop',
  'mr': 'marginRight',
  'mb': 'marginBottom',
  'ml': 'marginLeft',
  'm': 'margin',
  'js': 'justifySelf',
  'as': 'alignSelf',
  'pos': 'position',
  't': 'top',
  'l': 'left',
  'b': 'bottom',
  'r': 'right',
  'z': 'zIndex'
}

export function customStyle(styles) {
  const styleObj = {}
  for (const [key, value] of Object.entries(styles)) {
    styleObj[styleAbr[key]] = value
  }
  return styleObj
}

export function customStyling(...vals) {
  return vals.some(x => x)
}