import { useEffect } from 'react'
import { getBranchFromQueryParams, getPackagesData } from '../../utils/bundle'
import { compile } from '../execute-code'
import { patchPreviewWindow } from './monkeyPatch'

interface PropTypes {
  code: string
}

function Preview({ code }: PropTypes) {
  useEffect(() => {
    async function compileCode() {
      if (code) {
        const compiledCode = await compile(code)
        const gameJsTemplate = (await getPackagesData(getBranchFromQueryParams())).scene.js
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
  }, [code])

  const frameElement = document.getElementById('previewFrame')
  const tmpFrameWindow = (frameElement as any)?.contentWindow
  if (tmpFrameWindow) {
    if (tmpFrameWindow.startKernel) {
      if (tmpFrameWindow.kernelStarted) {
      } else {
        tmpFrameWindow.kernelStarted = true
        patchPreviewWindow(tmpFrameWindow)
          .then(() => {
            tmpFrameWindow.startKernel()
          })
          .catch((err) => {
            console.error(err)
          })
      }
    }
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
  } catch (err) {}

  return (
    <div style={{ width: '100%' }}>
      <iframe title={'Decentraland Renderer'} id={'previewFrame'} src={iframeUrl} width="100%" height="100%"></iframe>
    </div>
  )
}

export default Preview
