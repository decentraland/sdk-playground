import { useEffect } from 'react'
import { getGameJsTemplate } from '../ecs'
import { transformCode } from './execute-code'
import { patchPreviewWindow } from './monkeyPatch'

interface PropTypes {
  value: string
}

function Preview({ value }: PropTypes) {
  useEffect(() => {
    if (value) {
      transformCode(value)
        .then(async (data: string) => {
          const frameElement = document.getElementById('previewFrame')
          const tmpFrameWindow = (frameElement as any)?.contentWindow
          if (tmpFrameWindow) {
            const gameJsTemplate = await getGameJsTemplate()
            tmpFrameWindow.PlaygroundCode = gameJsTemplate + (';' + data)
            setTimeout(() => {
              tmpFrameWindow.postMessage('{}')
            }, 10)
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }, [value])

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

  // Workaround so it's work in production with root path and non-root ones
  const baseUrl = document.location.protocol + '//' + document.location.host + document.location.pathname
  const iframeUrl =
    document.location.pathname === '/' ? 'preview/index.html' : new URL('preview/index.html', baseUrl).toString()

  return (
    <div style={{ width: '100%' }}>
      <iframe title={'Decentraland Renderer'} id={'previewFrame'} src={iframeUrl} width="100%" height="100%"></iframe>
    </div>
  )
}

export default Preview
