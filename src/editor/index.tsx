import { useState, useEffect, useCallback } from 'react'
import Editor, { OnChange, OnMount, OnValidate } from '@monaco-editor/react'

import Preview from '../preview'
import { defaultValue } from './codePlaceholder'

import { Buffer } from 'buffer'

import './editor.css'
import { getEcsTypes, getGameJsTemplate } from '../ecs'
import { transformCode } from '../preview/execute-code'

function debounce<F extends (...params: any[]) => void>(fn: F, delay: number) {
  let timeoutID: NodeJS.Timeout | null = null
  return function (this: any, ...args: any[]) {
    timeoutID && clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn.apply(this, args), delay)
  } as F
}

function EditorComponent() {
  const [previewJsCode, setPreviewJsCode] = useState('')
  const [error, setError] = useState(false)
  const [code, setCode] = useState<string>('')

  const handleEditorDidMount: OnMount = async (editor, monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement'
    })

    // Get the code copied
    const base64Code = new URLSearchParams(document.location.search).get('code') || ''
    const code = base64Code ? Buffer.from(base64Code, 'base64').toString('utf8') : defaultValue

    // Clean the URL
    // const newURL = document.location.href.split('?')[0]
    // window.history.pushState('object', document.title, newURL)

    editor.setModel(monaco.editor.createModel(code, 'typescript', monaco.Uri.parse('file:///game.ts')))
    const ecsType = await getEcsTypes()
    monaco.editor.createModel(ecsType, 'typescript', monaco.Uri.parse('file:///index.d.ts'))
    setCode(editor.getValue())
  }

  const handleChange: OnChange = async (value) => {
    if (value) setCode(value)
  }

  const onValidate: OnValidate = async (markers) => {
    const error = !!markers.filter((marker) => marker.severity > 1).length
    setError(error)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderPreview = useCallback(
    debounce(async (code, error) => {
      if (error) {
        return console.log('error transpiling')
      }
      const compiledCode = await transformCode(code)
      const gameJsTemplate = await getGameJsTemplate()
      setPreviewJsCode(gameJsTemplate + (';' + compiledCode))
    }, 500),
    []
  )

  useEffect(() => {
    void renderPreview(code, error)
  }, [error, code, renderPreview])

  async function handleCopyURL() {
    const url = new URL(document.location.href)
    const encodedCode = Buffer.from(code!, 'utf8').toString('base64')
    url.searchParams.set('code', encodedCode)
    await navigator.clipboard.writeText(url.toString())
  }

  function handleClickRun() {
    setPreviewJsCode(previewJsCode + ' ')
  }

  return (
    <div className="Editor">
      <div className="editor-wrapper">
        <div className="editor-buttons">
          <button onClick={handleCopyURL}>Copy URL</button>
          <button onClick={handleClickRun}>Run</button>
        </div>
        <div>
          <Editor
            defaultLanguage="typescript"
            theme="vs-dark"
            onMount={handleEditorDidMount}
            onChange={handleChange}
            onValidate={onValidate}
          />
        </div>
      </div>

      <Preview compiledCode={previewJsCode} />
    </div>
  )
}

export default EditorComponent
