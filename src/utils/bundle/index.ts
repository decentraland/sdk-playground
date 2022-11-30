import { PackagesData, ListOfURL, SnippetInfo } from './types'

const cache: Map<string, PackagesData> = new Map()

function parseReactTypes(types: string) {
  // Strip export { } to be parsed as a module
  const fixedTypes = types.replace('export { }', '').replace(/declare /g, '')
  return `declare module '@dcl/react-ecs' {
    ${fixedTypes}
  }`
}

// version can be
// - a branch: 'feat/new-feature', 'fix/something', 'main' maps to 'refs/heads/main'
// - @next: maps to branch 'refs/heads/main'
// - a clean tagged version: 7.0.3, 7.2.0
// - a commit version: '7.0.0-commit-bad7ffadbfe7e'

function getS3OrUnpacked(version: string) {
  // TODO: After the first release, remove the 'latest' in this first condition
  if (version === 'main' || version === 'next' || version === 'latest') {
    return { s3: 'refs/heads/main' }
  } else if (version.includes('.') || version === 'latest') {
    return { unpacked: version }
  } else {
    return { s3: version }
  }
}

export async function getSnippetFile(snippetFilename: string) {
  const version = getBranchFromQueryParams()
  const source = getS3OrUnpacked(version)
  const url = source.s3
    ? `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${source.s3}/playground-assets/playground/snippets/${snippetFilename}`
    : `https://unpkg.com/@dcl/playground-assets@${version}/dist/playground/snippets/${snippetFilename}`

  const snippetContent = await (await fetch(url)).text()

  // TODO: delete the import replace when imports work
  // Remove the unnecesary 'export {}' and the imports
  return snippetContent.replace('export {}', '').replaceAll(/import(.|\n)* from '(.*)'/g, '')
}

function getUrls(version: string): ListOfURL {
  const debug = false
  if (debug) {
    // run `http-server . --cors` in `js-sdk-toolchain` repo folder and debug locally
    const jsSdkToolchainBaseUrl = 'http://127.0.0.1:5669/'
    return {
      sdk7IndexJsUrl: `${jsSdkToolchainBaseUrl}packages/%40dcl/playground-assets/dist/index.js`,
      sdk7IndexDTsUrl: `${jsSdkToolchainBaseUrl}packages/%40dcl/playground-assets/dist/index.bundled.d.ts`,
      apisDTsUrl: `${jsSdkToolchainBaseUrl}packages/%40dcl/playground-assets/dist/playground/sdk/apis.d.ts`,
      snippetsInfoJsonUrl: `${jsSdkToolchainBaseUrl}packages/%40dcl/playground-assets/dist/playground/snippets/info.json`,
      snippetsBaseUrl: `${jsSdkToolchainBaseUrl}packages/%40dcl/playground-assets/dist/playground/snippets/`,
      reactEcs7IndexJsUrl: `https://unpkg.com/@dcl/react-ecs@${version}/dist/index.min.js`,
      reactEcs7IndexDTsUrl: `https://unpkg.com/@dcl/react-ecs@${version}/dist/index.d.ts`
    }
  }

  const source = getS3OrUnpacked(version)
  if (source.s3) {
    const baseUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${source.s3}/playground-assets`
    return {
      sdk7IndexJsUrl: `${baseUrl}/index.js`,
      sdk7IndexDTsUrl: `${baseUrl}/index.bundled.d.ts`,
      apisDTsUrl: `${baseUrl}/playground/sdk/apis.d.ts`,
      snippetsInfoJsonUrl: `${baseUrl}/playground/snippets/info.json`,
      snippetsBaseUrl: `${baseUrl}/playground/snippets/`,
      reactEcs7IndexJsUrl: `${baseUrl}/sdk/react-ecs.index.min.js`,
      reactEcs7IndexDTsUrl: `${baseUrl}/sdk/react-ecs.index.d.ts`
    }
  } else {
    // unpkg.com/:package@:version/:file
    return {
      sdk7IndexJsUrl: `https://unpkg.com/@dcl/playground-assets@${version}/dist/index.min.js`,
      sdk7IndexDTsUrl: `https://unpkg.com/@dcl/playground-assets@${version}/dist/index.bundled.d.ts`,
      apisDTsUrl: `https://unpkg.com/@dcl/sdk@${version}/dist/playground/sdk/apis.d.ts`,
      snippetsInfoJsonUrl: `https://unpkg.com/@dcl/playground-assets@${version}/dist/playground/snippets/info.json`,
      snippetsBaseUrl: `https://unpkg.com/@dcl/playground-assets@${version}/dist/playground/snippets/`,
      reactEcs7IndexJsUrl: `https://unpkg.com/@dcl/react-ecs@${version}/dist/index.min.js`,
      reactEcs7IndexDTsUrl: `https://unpkg.com/@dcl/react-ecs@${version}/dist/index.d.ts`
    }
  }
}
/**
 * Fetch all data from published packages neccesary to develop in the playground
 * @param version
 * @returns
 */
async function getPackagesData(version: string): Promise<PackagesData> {
  if (cache.get(version)) {
    return cache.get(version)!
  }

  const urls = getUrls(version)
  try {
    const [sdk7IndexJsUrl, sdk7IndexDTsUrl, apisDTsUrl, snippetsInfoJson, _reactEcs7IndexJs, _reactEcs7IndexDTs] =
      await Promise.all([
        fetch(urls.sdk7IndexJsUrl).then((res) => res.text()),
        fetch(urls.sdk7IndexDTsUrl).then((res) => res.text()),
        fetch(urls.apisDTsUrl).then((res) => res.text()),
        fetch(urls.snippetsInfoJsonUrl).then((res) => res.json()),
        fetch(urls.reactEcs7IndexJsUrl).then((res) => res.text()),
        fetch(urls.reactEcs7IndexDTsUrl)
          .then((res) => res.text())
          .then(parseReactTypes)
      ])

    const sceneTypes =
      sdk7IndexDTsUrl
        .replaceAll('import', '// import')
        .replaceAll('export { ReactEcs }', '')
        .replaceAll('export default ReactEcs', '')
        .replaceAll('export', '') + apisDTsUrl

    const ret: PackagesData = {
      scene: {
        js: sdk7IndexJsUrl + ';\n',
        types: sceneTypes + ';\n'
      },
      // TODO: bundle react-ecs to be able loading the files
      ui: {
        js: '',
        types: ''
      },
      snippetInfo: snippetsInfoJson as SnippetInfo[],
      urls
    }

    cache.set(version, ret)
  } catch (err) {
    console.error(err)

    // Fallback every wrong version to latest
    if (version !== 'latest') {
      return getPackagesData('latest')
    }

    throw new Error(
      `Fatal error, package data fetching fails and it couldn't be possible to fallback to latest version.`
    )
  }

  return cache.get(version)!
}

/**
 * Get the bundle(js and types) depending on the type of editor.
 * @returns return the js code and its types
 */
export async function getBundle(version: string = 'latest'): Promise<PackagesData> {
  return getPackagesData(version)
}

export function getBranchFromQueryParams() {
  const params = new URLSearchParams(document.location.search)
  return params.get('sdk-branch') || 'main'
}

getPackagesData(getBranchFromQueryParams()).catch(console.error)
