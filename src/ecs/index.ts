type ECSData = {
  gameJsTemplate: null | string
  ecsTypes: null | string
  reactEcs: null | string
}

const ecsData: ECSData = {
  gameJsTemplate: null,
  ecsTypes: null,
  reactEcs: null
}

export function getBranch() {
  const params = new URLSearchParams(document.location.search)
  return params.get('sdk-branch') || 'refs/heads/main'
}

async function refreshEcsContent() {
  await Promise.all([getEcsTypes(), getGameJsTemplate()])
  return ecsData
}

export async function getGameJsTemplate() {
  if (ecsData.gameJsTemplate) {
    return ecsData.gameJsTemplate
  }
  const jsSdkToolchainBranch = getBranch()
  const amdJsUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${jsSdkToolchainBranch}/playground/amd.min.js`
  const ecs7IndexJsUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${jsSdkToolchainBranch}/playground/index.min.js`

  const amdJs = await (await fetch(amdJsUrl)).text()
  const ecs7IndexJs = await (await fetch(ecs7IndexJsUrl)).text()

  ecsData.gameJsTemplate = amdJs + ';\n' + ecs7IndexJs + ';\n'
  return ecsData.gameJsTemplate
}

export async function getEcsTypes() {
  if (ecsData.ecsTypes) {
    return ecsData.ecsTypes
  }
  const jsSdkToolchainBranch = getBranch()
  const ecs7IndexDTsUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${jsSdkToolchainBranch}/playground/index.d.ts`

  ecsData.ecsTypes = await (await fetch(ecs7IndexDTsUrl)).text()
  return ecsData.ecsTypes
}

export async function getReactEcs() {
  if (ecsData.reactEcs) {
    return ecsData.reactEcs
  }

  const jsSdkToolchainBranch = getBranch()
  const ecs7IndexDTsUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${jsSdkToolchainBranch}/playground/index.d.ts`

  ecsData.ecsTypes = await (await fetch(ecs7IndexDTsUrl)).text()
}

refreshEcsContent().then(console.log).catch(console.error)
