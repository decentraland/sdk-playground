import { Button, Dropdown, HeaderMenu } from 'decentraland-ui'
import { Buffer } from 'buffer'
import { useState, useEffect, useCallback, useRef } from 'react'
import MonacoEditor, { OnChange, OnMount, OnValidate } from '@monaco-editor/react'

import { getBranchFromQueryParams, getBundle } from '../utils/bundle'
import getDefaultCode from '../utils/default-code'
import PreviewScene from '../preview/scene'
import PreviewUi from '../preview/ui'
import { IMonaco, Tab } from './types'

import './editor.css'
import { getFilesUri, updateUrl, debounce, monacoConfig } from './utils'

function EditorComponent() {
  const isMounted = useRef(false)
  const [code, setCode] = useState<string>('')
  const [tab, setTab] = useState<Tab>('ui')
  const [previewJsCode, setPreviewJsCode] = useState('')
  const [error, setError] = useState(false)
  const [monaco, setMonaco] = useState<IMonaco>()

  const handleEditorDidMount: OnMount = async (editor, monaco) => {
    setMonaco(monaco)

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(monacoConfig(monaco))

    // TODO: getBranchFromQueryParams should be selected by the user with some UI
    const bundle = await getBundle(tab, getBranchFromQueryParams())
    const code = getDefaultCode(tab)
    const fileUris = getFilesUri(monaco)

    editor.setModel(monaco.editor.createModel(code, 'typescript', fileUris.ts))
    monaco.editor.createModel(bundle.types, 'typescript', fileUris.types)
    isMounted.current = true
    setCode(code)
  }

  async function handleChangeTab(nextTab: Tab) {
    if (tab === nextTab) return
    setTab(nextTab)
  }

  useEffect(() => {
    async function updateEditor() {
      if (!monaco || !isMounted.current) return
      updateUrl(new URL(document.location.href))
      const fileUris = getFilesUri(monaco)

      const bundle = await getBundle(tab, getBranchFromQueryParams())
      const code = getDefaultCode(tab)
      monaco.editor.getModel(fileUris.ts)?.setValue(code)
      monaco.editor.getModel(fileUris.types)?.setValue(bundle.types)
    }
    void updateEditor()
  }, [tab, monaco])

  async function handleCopyURL() {
    if (!monaco) return
    const url = new URL(document.location.href)
    const fileUris = getFilesUri(monaco)
    const code = monaco.editor.getModel(fileUris.ts)?.getValue() || ''
    const encodedCode = Buffer.from(code, 'utf8').toString('base64')

    url.searchParams.set('code', encodedCode)
    updateUrl(url)
    await navigator.clipboard.writeText(url.toString())
  }

  function handleClickRun() {
    if (error) return
    setPreviewJsCode(previewJsCode + ' ')
  }

  const handleChange: OnChange = async (value) => {
    setCode(value || '')
  }

  const onValidate: OnValidate = async (markers) => {
    const error = !!markers.filter((marker) => marker.severity > 1).length
    setError(error)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderPreview = useCallback(
    debounce(async (code, error) => {
      if (error) {
        return console.log('error')
      }

      setPreviewJsCode(code)
    }, 1000),
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
