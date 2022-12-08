import { Loader } from 'decentraland-ui'
import { useEffect, useRef, useState } from 'react'
import { getBranchFromQueryParams, getBundle } from '../../utils/bundle'
import { PackagesData } from '../../utils/bundle/types'
import { ContentData, getGenesisPlazaContent } from '../../utils/content'
import { getPreviewCode } from './scene-code'

interface PropTypes {
  code: string
  show: boolean
}

function getIframeUrl(packageData: PackagesData) {
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

    const finalUrl = new URL(iframeUrl)
    finalUrl.searchParams.delete('renderer')
    finalUrl.searchParams.delete('renderer-branch')
    finalUrl.searchParams.delete('renderer-version')
    finalUrl.searchParams.delete('kernel')
    finalUrl.searchParams.delete('kernel-branch')
    finalUrl.searchParams.delete('kernel-version')

    finalUrl.searchParams.set('renderer', packageData.dependencies.rendererUrl)
    finalUrl.searchParams.set('kernel', packageData.dependencies.kernelUrl)
    iframeUrl = finalUrl.toString()
  } catch (err) {
    console.log(err)
  }

  return iframeUrl
}

function Preview({ code, show }: PropTypes) {
  const isMounted = useRef(false)
  const [startFrame, setStartFrame] = useState<boolean>(false)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [packageData, setPackagesData] = useState<PackagesData | null>(null)
  const [genesisPlaza, setGenesisPlaza] = useState<ContentData | undefined | null>(null)

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

    getBundle(getBranchFromQueryParams())
      .then(setPackagesData)
      .catch((err) => {
        console.error('The package data fetch has failed.', err)
      })

    getGenesisPlazaContent()
      .then(setGenesisPlaza)
      .catch((err) => {
        console.error('Fail while retrieving the genesis content data', err)
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isMounted.current || !show) return
    setStartFrame(true)
  }, [show])

  useEffect(() => {
    if (code && show && packageData && genesisPlaza !== null) {
      getPreviewCode(packageData, code)
        .then((previewCode) => {
          const window = getWindow()
          if (window) {
            window.PlaygroundCode = previewCode
            if (genesisPlaza) {
              window.PlaygroundBaseUrl = genesisPlaza.baseUrl
              window.PlaygroundContentMapping = genesisPlaza.content
            }

            window.postMessage('sdk-playground-update')
          }
        })
        .catch((err) => {
          console.error('Compile and send preview has failed.', err)
        })
    }
  }, [code, show, packageData, genesisPlaza])

  if (packageData === null) {
    return <Loader active={loading} size="massive" />
  }

  const frameElement = document.getElementById('previewFrame')
  const tmpFrameWindow = (frameElement as any)?.contentWindow
  if (tmpFrameWindow?.startKernel && !tmpFrameWindow.kernelStarted) {
    tmpFrameWindow.kernelStarted = true
    tmpFrameWindow.startKernel()
  }

  const iframeUrl = getIframeUrl(packageData)
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
