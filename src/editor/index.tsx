import { Button, Dropdown, HeaderMenu } from 'decentraland-ui'
import { Buffer } from 'buffer'
import { useState, useEffect, useCallback, useRef } from 'react'
import MonacoEditor, { OnChange, OnMount, OnValidate } from '@monaco-editor/react'

import PreviewScene from '../preview/scene'
import PreviewUi from '../preview/ui'
import Samples from '../samples'
import { getBranchFromQueryParams, getBundle, getSnippetFile } from '../utils/bundle'
import getDefaultCode, { saveCurrentCode } from '../utils/default-code'
import { PackagesData, SnippetInfo } from '../utils/bundle/types'
import { IMonaco, Tab } from './types'
import { getFilesUri, updateUrl, debounce, monacoConfig } from './utils'

import './editor.css'
import { getGenesisPlazaContent } from '../utils/content'

function EditorComponent() {
  const isMounted = useRef(false)
  const [code, setCode] = useState<string>('')
  const [showExamples, setShowExamples] = useState<boolean>(false)
  const [tab, setTab] = useState<Tab>('scene')
  const [previewTsCode, setPreviewTsCode] = useState('')
  const [error, setError] = useState(false)
  const [monaco, setMonaco] = useState<IMonaco>()
  const [bundle, setBundle] = useState<PackagesData>()

  const handleEditorDidMount: OnMount = async (editor, monaco) => {
    // TODO: getBranchFromQueryParams should be selected by the user with some UI
    const bundle = await getBundle(getBranchFromQueryParams())
    const genesisPlazaContent = await getGenesisPlazaContent()
    const typesContentExposed = genesisPlazaContent?.contentDeclaration || ''
    const code = getDefaultCode(tab)
    const fileUris = getFilesUri(monaco)

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(monacoConfig(monaco))
    editor.setModel(monaco.editor.createModel(code, 'typescript', fileUris.ts))
    monaco.editor.createModel(bundle.scene.types + bundle.ui.types + typesContentExposed, 'typescript', fileUris.types)
    isMounted.current = true
    setMonaco(monaco)
    setCode(code)
    setBundle(bundle)
  }

  async function handleChangeTab(nextTab: Tab) {
    if (tab === nextTab) return
    updateEditor(nextTab)
  }

  function updateEditor(tab: Tab, sample?: string) {
    if (!monaco || !isMounted.current || !bundle) return

    updateUrl(new URL(document.location.href))
    const fileUris = getFilesUri(monaco)

    const code = sample || getDefaultCode(tab)
    monaco.editor.getModel(fileUris.ts)?.setValue(code)

    setCode(code)
    setPreviewTsCode('')
    setShowExamples(false)
    setTab(tab)
  }

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
    setPreviewTsCode(previewTsCode + ' ')
  }

  async function handleClickSnippet(snippet: SnippetInfo) {
    const snippetCode = await getSnippetFile(snippet.path)
    if (!monaco || !bundle) return
    updateEditor('scene', snippetCode)
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
      setPreviewTsCode(code)
      saveCurrentCode(tab, code)
    }, 1000),
    []
  )

  useEffect(() => {
    void renderPreview(code, error)
  }, [error, code, renderPreview])

  function __donotmerge__hack_code() {
    if (tab === 'ui') {
      return previewTsCode
    }

    const from = previewTsCode.indexOf('export const uiComponent')
    const to = previewTsCode.indexOf('renderUi(')
    return previewTsCode.slice(from, to) + '\n export default uiComponent'
  }

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
              <div className="ui-dropdown examples">
                <Dropdown
                  selectOnBlur={false}
                  closeOnBlur={false}
                  text="Examples"
                  open={showExamples}
                  onOpen={() => setShowExamples(true)}
                  onClose={() => setShowExamples(false)}
                />
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
        {showExamples && bundle && <Samples snippets={bundle!.snippetInfo} onClick={handleClickSnippet} />}
        <div className={`ui-monaco-editor ${showExamples ? 'hide' : ''}`}>
          <MonacoEditor
            defaultLanguage="typescript"
            theme="vs-dark"
            onMount={handleEditorDidMount}
            onChange={handleChange}
            onValidate={onValidate}
            options={{ minimap: { enabled: false } }}
          />
        </div>
      </div>
      <div className="preview">
        <PreviewScene code={previewTsCode} show={tab === 'scene'} />
        <PreviewUi code={__donotmerge__hack_code()} />
      </div>
    </div>
  )
}

export default EditorComponent
