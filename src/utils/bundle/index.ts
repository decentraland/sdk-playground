type Bundle = {
  js: string
  types: string
}

type Cache = {
  scene: Partial<Bundle>
  ui: Partial<Bundle>
}

const bundle: Cache = {
  scene: {},
  ui: {}
}

export function getBranch() {
  const params = new URLSearchParams(document.location.search)
  return params.get('sdk-branch') || 'refs/heads/main'
}

async function refreshEcsContent() {
  await Promise.all([getEcsTypes(), getGameJsTemplate(), getReactEcs()])
  return bundle
}

export async function getGameJsTemplate() {
  if (bundle.scene.js) {
    return bundle.scene.js
  }

  const jsSdkToolchainBranch = getBranch()
  const amdJsUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${jsSdkToolchainBranch}/playground/amd.min.js`
  const ecs7IndexJsUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${jsSdkToolchainBranch}/playground/index.min.js`

  const amdJs = await (await fetch(amdJsUrl)).text()
  const ecs7IndexJs = await (await fetch(ecs7IndexJsUrl)).text()

  bundle.scene.js = amdJs + ';\n' + ecs7IndexJs + ';\n'
  return bundle.scene.js
}

export async function getEcsTypes() {
  if (bundle.scene.types) {
    return bundle.scene.types
  }
  const jsSdkToolchainBranch = getBranch()
  const ecs7IndexDTsUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${jsSdkToolchainBranch}/playground/index.d.ts`

  bundle.scene.types = await (await fetch(ecs7IndexDTsUrl)).text()
  return bundle.scene.types
}

export async function getReactEcs(): Promise<Bundle> {
  const ecs7IndexDTsUrl = `http://localhost:3000/test/index.d.ts`
  const ecs7IndexJsUrl = `http://localhost:3000/test/index.min.js`

  const js = bundle.ui.js || (await (await fetch(ecs7IndexJsUrl)).text())
  const types = bundle.ui.types || (await (await fetch(ecs7IndexDTsUrl)).text())

  bundle.ui = { types, js }
  return { types, js }
}

export async function getSdk(): Promise<Bundle> {
  const js = bundle.scene.js || (await getGameJsTemplate())
  const types = bundle.scene.types || (await getEcsTypes())

  bundle.scene = { types, js }
  return { types, js }
}

export async function getBundle(type: 'ui' | 'scene'): Promise<Bundle> {
  if (type === 'ui') {
    return getReactEcs()
  }

  return getSdk()
}

refreshEcsContent().then(console.log).catch(console.error)
