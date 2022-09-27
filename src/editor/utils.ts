import { IMonaco } from './types'

export function updateUrl(url: string | URL) {
  window.history.replaceState(null, '', url)
}

export function getFilesUri(monaco: IMonaco) {
  return {
    ts: monaco.Uri.parse('file:///game.tsx'),
    types: monaco.Uri.parse('file:///index.d.ts')
  }
}

export function debounce<F extends (...params: any[]) => void>(fn: F, delay: number) {
  let timeoutID: NodeJS.Timeout | null = null
  return function (this: any, ...args: any[]) {
    timeoutID && clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn.apply(this, args), delay)
  } as F
}

export const monacoConfig = (monaco: IMonaco) => ({
  target: monaco.languages.typescript.ScriptTarget.ES2016,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  typeRoots: ['node_modules/@types'],
  jsx: monaco.languages.typescript.JsxEmit.Preserve,
  jsxFactory: 'ReactEcs.createElement'
})
