import { Buffer } from 'buffer'

import scene from './scene'
import ui from './ui'

export default function getDefaultCode(tab: 'ui' | 'scene') {
  const base64Code = new URLSearchParams(document.location.search).get('code') || ''
  const code = base64Code ? Buffer.from(base64Code, 'base64').toString('utf8') : placeholder(tab)
  return code
}

function placeholder(type: 'ui' | 'scene') {
  if (type === 'scene') {
    return scene
  }
  if (type === 'ui') {
    return ui
  }
  return ''
}
