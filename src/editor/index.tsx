import { Button, Dropdown, HeaderMenu } from 'decentraland-ui'
import { Buffer } from 'buffer'
import { useState, useEffect, useCallback } from 'react'
import * as monacoType from 'monaco-editor/esm/vs/editor/editor.api'
import MonacoEditor, { OnChange, OnMount, OnValidate } from '@monaco-editor/react'

import { getEcsTypes } from '../utils/bundle'
import PreviewScene from '../preview/scene'
import PreviewUi from '../preview/ui'
import defaultValue from '../utils/placeholder'

import './editor.css'

type MonacoType = monacoType.editor.IStandaloneCodeEditor

function debounce<F extends (...params: any[]) => void>(fn: F, delay: number) {
  let timeoutID: NodeJS.Timeout | null = null
  return function (this: any, ...args: any[]) {
    timeoutID && clearTimeout(timeoutID)
    timeoutID = setTimeout(() => fn.apply(this, args), delay)
  } as F
}

type Tab = 'ui' | 'scene'

function EditorComponent() {
  const [tab, setTab] = useState<Tab>('ui')
  const [previewJsCode, setPreviewJsCode] = useState('')
  const [error, setError] = useState(false)
  const [code, setCode] = useState<string>('')
  const [editor, setEditor] = useState<MonacoType>()
  const [monaco, setMonaco] = useState<typeof monacoType>()

  const handleEditorDidMount: OnMount = async (editor, monaco) => {
    setEditor(editor)
    setMonaco(monaco)
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ['node_modules/@types'],
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'ReactEcs.createElement'
    })

    // Get the code copied
    const base64Code = new URLSearchParams(document.location.search).get('code') || ''
    const code = base64Code ? Buffer.from(base64Code, 'base64').toString('utf8') : defaultValue(tab)

    editor.setModel(monaco.editor.createModel(code, 'typescript', monaco.Uri.parse('file:///game.ts')))
    const ecsType = await getEcsTypes()
    monaco.editor.createModel(ecsType, 'typescript', monaco.Uri.parse('file:///index.d.ts'))
    setCode(editor.getValue())
  }

  function handleChangeTab(tab: Tab) {
    if (!editor || !monaco) return
    setTab(tab)
    const code = defaultValue(tab)
    editor.setModel(monaco.editor.createModel(code, 'typescript', monaco.Uri.parse('file:///game.ts')))
  }

  const handleChange: OnChange = async (value) => {
    if (value) setCode(value)
  }

  const onValidate: OnValidate = async (markers) => {
    const error = !!markers.filter((marker) => marker.severity > 1).length
    setError(error)
  }

  async function handleCopyURL() {
    const url = new URL(document.location.href)
    const encodedCode = Buffer.from(code!, 'utf8').toString('base64')
    url.searchParams.set('code', encodedCode)
    await navigator.clipboard.writeText(url.toString())
  }

  function handleClickRun() {
    setPreviewJsCode(previewJsCode + ' ')
  }

  // Handle code changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderPreview = useCallback(
    debounce(async (code, error) => {
      if (error) {
        return console.log('error transpiling')
      }
      setPreviewJsCode(code)
    }, 500),
    []
  )
  useEffect(() => {
    void renderPreview(code, error)
  }, [error, code, renderPreview])

  return (
    <div className="editor">
      <div className="editor-wrapper">
        <div className="editor-buttons">
          <HeaderMenu>
            <HeaderMenu.Left>
              <div className="ui-dropdown">
                <Dropdown text={tab} direction="right">
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleChangeTab('scene')} text="Scene" value="scene" />
                    <Dropdown.Item onClick={() => handleChangeTab('ui')} text="UI" value="ui" />
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </HeaderMenu.Left>
            <HeaderMenu.Right>
              <div>
                <Button size="small" inverted primary onClick={handleCopyURL}>
                  Share
                </Button>
              </div>
              <div>
                <Button size="small" inverted primary onClick={handleClickRun}>
                  Run
                </Button>
              </div>
            </HeaderMenu.Right>
          </HeaderMenu>
        </div>
        <MonacoEditor
          defaultLanguage="typescript"
          theme="vs-dark"
          onMount={handleEditorDidMount}
          onChange={handleChange}
          onValidate={onValidate}
          options={{ minimap: { enabled: false } }}
        />
      </div>
      <div className="preview">
        {tab === 'scene' && <PreviewScene code={previewJsCode} />}
        {tab === 'ui' && <PreviewUi code={previewJsCode} />}
      </div>
    </div>
  )
}

export default EditorComponent
