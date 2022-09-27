import { useEffect, useRef, useState } from 'react'
import { getBranchFromQueryParams, getBundle } from '../../utils/bundle'
import { compile } from '../execute-code'
import { patchPreviewWindow } from './monkeyPatch'

interface PropTypes {
  code: string
  show: boolean
}

function Preview({ code, show }: PropTypes) {
  const isMounted = useRef(false)
  const [startFrame, setStartFrame] = useState<boolean>(false)

  useEffect(() => {
    isMounted.current = true
  }, [])

  useEffect(() => {
    if (!isMounted.current || !show) return
    setStartFrame(true)
  }, [show])

  useEffect(() => {
    async function compileCode() {
      if (code && show) {
        const compiledCode = await compile(code)
        const gameJsTemplate = (await getBundle(getBranchFromQueryParams())).scene.js
        const previewCode = gameJsTemplate + (';' + compiledCode)
        const frameElement = document.getElementById('previewFrame')
        const tmpFrameWindow = (frameElement as any)?.contentWindow
        if (tmpFrameWindow) {
          tmpFrameWindow.PlaygroundCode = previewCode
          setTimeout(() => {
            tmpFrameWindow.postMessage('sdk-playground-update')
          }, 10)
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

  const showDisplay = show ? {} : { display: 'none' }

  return (
    <div style={{ width: '100%', ...showDisplay }}>
      <iframe title="Decentraland Renderer" id="previewFrame" src={iframeUrl} width="100%" height="100%" />
    </div>
  )
}

export default Preview
