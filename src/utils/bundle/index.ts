import { PackagesData, ListOfURL, SnippetInfo, DependenciesVersion } from './types'

const cache: Map<string, PackagesData> = new Map()

// version can be
// - a branch: 'feat/new-feature', 'fix/something', 'main' maps to 'refs/heads/main'
// - @next: maps to branch 'refs/heads/main'
// - a clean tagged version: 7.0.3, 7.2.0
// - a commit version: '7.0.0-commit-bad7ffadbfe7e'

function getS3OrUnpacked(version: string) {
  if (version === 'main' || version === 'next') {
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
      sdk7PackageJsonUrl: `${jsSdkToolchainBaseUrl}packages/%40dcl/playground-assets/dist/playground/sdk/dcl-sdk.package.json`,
      apisDTsUrl: `${jsSdkToolchainBaseUrl}packages/%40dcl/playground-assets/dist/playground/sdk/apis.d.ts`,
      snippetsInfoJsonUrl: `${jsSdkToolchainBaseUrl}packages/%40dcl/playground-assets/dist/playground/snippets/info.json`,
      snippetsBaseUrl: `${jsSdkToolchainBaseUrl}packages/%40dcl/playground-assets/dist/playground/snippets/`
    }
  }

  const source = getS3OrUnpacked(version)
  if (source.s3) {
    const baseUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${source.s3}/playground-assets`
    return {
      sdk7IndexJsUrl: `${baseUrl}/index.js`,
      sdk7IndexDTsUrl: `${baseUrl}/index.bundled.d.ts`,
      sdk7PackageJsonUrl: `${baseUrl}/playground/sdk/dcl-sdk.package.json`,
      apisDTsUrl: `${baseUrl}/playground/sdk/apis.d.ts`,
      snippetsInfoJsonUrl: `${baseUrl}/playground/snippets/info.json`,
      snippetsBaseUrl: `${baseUrl}/playground/snippets/`
    }
  } else {
    // unpkg.com/:package@:version/:file
    return {
      sdk7IndexJsUrl: `https://unpkg.com/@dcl/playground-assets@${version}/dist/index.js`,
      sdk7IndexDTsUrl: `https://unpkg.com/@dcl/playground-assets@${version}/dist/index.bundled.d.ts`,
      sdk7PackageJsonUrl: `https://unpkg.com/@dcl/playground-assets@${version}/dist/playground/sdk/dcl-sdk.package.json`,
      apisDTsUrl: `https://unpkg.com/@dcl/playground-assets@${version}/dist/playground/sdk/apis.d.ts`,
      snippetsInfoJsonUrl: `https://unpkg.com/@dcl/playground-assets@${version}/dist/playground/snippets/info.json`,
      snippetsBaseUrl: `https://unpkg.com/@dcl/playground-assets@${version}/dist/playground/snippets/`
    }
  }
}

/**
 * Get the bundle(js and types) depending on the type of editor.
 * @returns return the js code and its types
 */
export async function getBundle(version: string): Promise<PackagesData> {
  return getPackagesData(version)
}

export function getBranchFromQueryParams() {
  const params = new URLSearchParams(document.location.search)
  return params.get('sdk-branch') || params.get('sdk-version') || 'latest'
}

function getExplorerBaseUrl(defaultUrl?: string): string {
  const qs = new URLSearchParams(document.location.search)

  if (qs.has('explorer')) {
    return qs.get('explorer')!
  }

  if (qs.has('explorer-branch')) {
    return `https://renderer-artifacts.decentraland.org/branch/${qs.get('explorer-branch')}`
  }

  if (qs.has('explorer-version')) {
    return `https://cdn.decentraland.org/@dcl/explorer/${qs.get('explorer-version')}`
  }

  return defaultUrl || `https://renderer-artifacts.decentraland.org/branch/dev`
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

  console.log(`Getting package data from version ${version}`)

  const urls = getUrls(version)
  try {
    const [sdk7PackageJson, sdk7IndexJsUrl, sdk7IndexDTsUrl, apisDTsUrl, snippetsInfoJson] = await Promise.all([
      fetch(urls.sdk7PackageJsonUrl).then((res) => res.json()),
      fetch(urls.sdk7IndexJsUrl).then((res) => res.text()),
      fetch(urls.sdk7IndexDTsUrl).then((res) => res.text()),
      fetch(urls.apisDTsUrl).then((res) => res.text()),
      fetch(urls.snippetsInfoJsonUrl).then((res) => res.json())
    ])

    let dependencies: DependenciesVersion
    const explorerVersion = sdk7PackageJson.dependencies['@dcl/explorer']
    if (explorerVersion) {
      dependencies = {
        kernelUrl: getExplorerBaseUrl(`https://cdn.decentraland.org/@dcl/explorer/` + explorerVersion),
        rendererUrl: getExplorerBaseUrl(`https://cdn.decentraland.org/@dcl/explorer/` + explorerVersion)
      }
    } else {
      dependencies = {
        kernelUrl: getExplorerBaseUrl(
          `https://cdn.decentraland.org/@dcl/kernel/` + sdk7PackageJson.dependencies['@dcl/kernel']
        ),
        rendererUrl: getExplorerBaseUrl(
          `https://cdn.decentraland.org/@dcl/unity-renderer/` + sdk7PackageJson.dependencies['@dcl/unity-renderer']
        )
      }
    }

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
      urls,
      dependencies
    }

    cache.set(version, ret)
  } catch (err) {
    console.error(err)
    throw new Error(`Fatal error, package data fetching fails ${version}.`)
  }

  return cache.get(version)!
}
