import { Buffer } from 'buffer'
import { Tab } from '../../editor/types'

import scene from './scene'
import ui from './ui'

export function getSavedCodeKey(tab: Tab) {
  return `previousCode-${tab}`
}

export function saveCurrentCode(tab: Tab, code: string) {
  localStorage.setItem(getSavedCodeKey(tab), code)
}

export default function getDefaultCode(tab: Tab) {
  const base64Code = new URLSearchParams(document.location.search).get('code') || ''
  const savedCode = (typeof localStorage !== 'undefined' && localStorage.getItem(getSavedCodeKey(tab))) || ''

  if (savedCode) return savedCode
  if (base64Code) return Buffer.from(base64Code, 'base64').toString('utf8')

  return placeholder(tab)
}

function placeholder(type: Tab) {
  if (type === 'scene') {
    return scene
  }
  if (type === 'ui') {
    return ui
  }
  return ''
}
