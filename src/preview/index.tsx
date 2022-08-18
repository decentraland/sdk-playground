import { useEffect } from 'react'
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
            const gameJs = await (await fetch('template.js')).text()
            tmpFrameWindow.PlaygroundCode = gameJs + (';' + data)
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

  const iframeUrl = new URL(
    'preview/index.html',
    document.location.protocol + '//' + document.location.host + document.location.pathname
  ).toString()

  return (
    <div style={{ width: '100%' }}>
      <iframe title={'Decentraland Renderer'} id={'previewFrame'} src={iframeUrl} width="100%" height="100%"></iframe>
    </div>
  )
}

export default Preview
