// TODO: this is workaround until all routes are correctly mapped from catalyst/preview/kernel base url
const DEBUG_PATCH = false
export async function patchPreviewWindow(previewWin: any) {
  const previewServerUrl = 'https://ecs7-template.herokuapp.com'

  const originalFetch = fetch
  async function wrappedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let modifiedInput = input
    if (input instanceof URL || typeof input === 'string') {
      const urlStr = input.toString()
      const preview = urlStr.indexOf('preview/index.html/')
      if (preview > 0) {
        modifiedInput = previewServerUrl + urlStr.substring(preview + 'preview/index.html/'.length)
      }
    }
    if (DEBUG_PATCH) console.log(`Fetch wrapped `, { input, modifiedInput, init })
    return originalFetch(modifiedInput, init)
  }
  previewWin.fetch = wrappedFetch
  ;(function (xhr) {
    const open = xhr.open
    ;(xhr as any).open = function (...args: any[]) {
      if (typeof args[1] === 'string') {
        const urlStr = args[1].toString()
        const preview = urlStr.indexOf('preview/index.html/')
        if (preview > 0) {
          args[1] = previewServerUrl + urlStr.substring(preview + 'preview/index.html/'.length)
        }
      }
      if (DEBUG_PATCH) console.log(`XHR wrapped `, { args })
      return (open as any).apply(this, args)
    }
  })(previewWin.XMLHttpRequest.prototype)

  const originalWs = previewWin.WebSocket
  previewWin.WebSocket = function (url: any, protocols: any) {
    const urlStr = url.toString()
    const preview = urlStr.indexOf('preview/index.html')

    let newUrl: string = ''
    if (preview > 0) {
      newUrl =
        previewServerUrl.replace('http', 'ws') +
        url.substring(urlStr.indexOf('preview/index.html') + 'preview/index.html'.length)
    } else {
      newUrl = urlStr.replaceAll(document.location.origin.replace('http', 'ws'), previewServerUrl.replace('http', 'ws'))
    }

    if (DEBUG_PATCH) console.log(`ws wrapped `, { url, newUrl })

    const that = protocols ? new originalWs(newUrl, protocols) : new originalWs(newUrl)
    return that
  }
}
