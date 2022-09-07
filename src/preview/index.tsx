import { useEffect } from 'react'
import { patchPreviewWindow } from './monkeyPatch'

interface PropTypes {
  compiledCode: string
}

function Preview({ compiledCode }: PropTypes) {
  useEffect(() => {
    if (compiledCode) {
      const frameElement = document.getElementById('previewFrame')
      const tmpFrameWindow = (frameElement as any)?.contentWindow
      if (tmpFrameWindow) {
        tmpFrameWindow.PlaygroundCode = compiledCode
        setTimeout(() => {
          tmpFrameWindow.postMessage('sdk-playground-update')
        }, 10)
      }
    }
  }, [compiledCode])

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

  console.log({ iframeUrl })
  return (
    <div style={{ width: '100%' }}>
      <iframe title={'Decentraland Renderer'} id={'previewFrame'} src={iframeUrl} width="100%" height="100%"></iframe>
    </div>
  )
}

export default Preview
