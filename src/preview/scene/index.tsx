import { Loader } from 'decentraland-ui'
import { useEffect, useRef, useState } from 'react'
import { getBranchFromQueryParams, getBundle } from '../../utils/bundle'
import { getGenesisPlazaContent } from '../../utils/content'
import { compileScene } from '../swc-compile'
import { patchPreviewWindow } from './monkeyPatch'

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
    const isReady = window?.globalStore?.getState()?.renderer?.engineReady

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

  useEffect(() => {
    async function compileCode() {
      if (code && show) {
        const { scene } = await getBundle(getBranchFromQueryParams())
        const genesisPlazaContent = await getGenesisPlazaContent()
        const compiledCode = await compileScene(scene.types + code)
        const gameJsTemplate = scene.js
        const previewCode = `${gameJsTemplate};${compiledCode}`
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
    patchPreviewWindow(tmpFrameWindow)
      .then(() => {
        tmpFrameWindow.startKernel()
      })
      .catch((err) => {
        console.error(err)
      })
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
