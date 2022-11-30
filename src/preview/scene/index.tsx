import { Loader } from 'decentraland-ui'
import { useEffect, useRef, useState } from 'react'
import { getBranchFromQueryParams, getBundle } from '../../utils/bundle'
import { getGenesisPlazaContent } from '../../utils/content'
import { compileScene } from '../swc-compile'

interface PropTypes {
  code: string
  show: boolean
}

function Preview({ code, show }: PropTypes) {
  const isMounted = useRef(false)
  const [startFrame, setStartFrame] = useState<boolean>(false)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState<boolean>(true)

  function getWindow() {
    return frameRef.current?.contentWindow as any
  }

  function checkEngine() {
    const window = getWindow()
    const isReady = window?.globalStore?.getState()?.realm?.realmAdapter

    if (isReady) {
      setLoading(false)
      window.postMessage('sdk-playground-update')
      return
    }

    setTimeout(checkEngine, 1000)
  }

  useEffect(() => {
    isMounted.current = true
    checkEngine()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isMounted.current || !show) return
    setStartFrame(true)
  }, [show])

  async function getPreviewCode() {
    const { scene } = await getBundle(getBranchFromQueryParams())
    const gameJsTemplate = scene.js
    const codeToAddFirst = `
      const EngineApi = require('~system/EngineApi');
      const process = {env: {}};
      ${gameJsTemplate}
      exports.onUpdate = self.onUpdate
    `
    const codeToCompile = scene.types + ';' + code
    const compiledCode = await compileScene(codeToCompile)
    return `${codeToAddFirst};${compiledCode}`
  }

  useEffect(() => {
    async function compileCode() {
      if (code && show) {
        const genesisPlazaContent = await getGenesisPlazaContent()
        const previewCode = await getPreviewCode()
        const window = getWindow()
        if (window) {
          window.PlaygroundCode = previewCode
          if (genesisPlazaContent) {
            window.PlaygroundBaseUrl = genesisPlazaContent.baseUrl
            window.PlaygroundContentMapping = genesisPlazaContent.content
          }

          window.postMessage('sdk-playground-update')
        }
      }
    }
    compileCode().catch((e) => {
      console.log(e)
    })
  }, [code, show])

  const frameElement = document.getElementById('previewFrame')
  const tmpFrameWindow = (frameElement as any)?.contentWindow
  if (tmpFrameWindow?.startKernel && !tmpFrameWindow.kernelStarted) {
    tmpFrameWindow.kernelStarted = true
    tmpFrameWindow.startKernel()
  }

  let iframeUrl = ''
  try {
    const urlPath = `preview/index.html`
    // Workaround so it's work in production with root path and non-root ones
    if (document.location.pathname === '/') {
      const baseUrl = document.location.protocol + '//' + document.location.host + document.location.pathname
      const url = new URL(urlPath, baseUrl)
      url.search = document.location.search
      iframeUrl = url.toString()
    } else {
      iframeUrl = `${urlPath}?${document.location.search}`
    }
  } catch (err) {
    console.log(err)
  }

  if (!startFrame) return null

  const showDisplay = show && !loading ? {} : { display: 'none' }

  return (
    <>
      <Loader active={loading} size="massive" style={!show ? { display: 'none' } : {}} />
      <div style={{ width: '100%', ...showDisplay }}>
        <iframe
          style={{ width: '100%' }}
          id="previewFrame"
          ref={frameRef}
          title="Decentraland Renderer"
          src={iframeUrl}
          width="100%"
          height="100%"
        />
      </div>
    </>
  )
}

export default Preview
