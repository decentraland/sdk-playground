import { Buffer } from 'buffer'
import { Tab } from '../../editor/types'
import { getBranchFromQueryParams, getBundle, getSnippetFile } from '../bundle'

import ui from './ui'

export function getSavedCodeKey(tab: Tab) {
  return `previousCode-${tab}`
}

export function saveCurrentCode(tab: Tab, code: string) {
  localStorage.setItem(getSavedCodeKey(tab), code)
}

export default async function getDefaultCode(tab: Tab) {
  const base64Code = new URLSearchParams(document.location.search).get('code') || ''
  const savedCode = (typeof localStorage !== 'undefined' && localStorage.getItem(getSavedCodeKey(tab))) || ''

  if (base64Code) return Buffer.from(base64Code, 'base64').toString('utf8')
  if (savedCode) return savedCode
  return placeholder(tab)
}

async function placeholder(type: Tab) {
  const bundle = await getBundle(getBranchFromQueryParams())

  if (type === 'scene') {
    const cubeSnippet = bundle.snippetInfo.find((snippet) => snippet.name.toLowerCase().includes('cube'))
    const snippet = cubeSnippet || bundle.snippetInfo[0]
    const snippetCode = await getSnippetFile(snippet.path)

    return snippetCode
  }

  if (type === 'ui') {
    return ui
  }
  return ''
}
