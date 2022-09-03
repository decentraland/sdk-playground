import future, { IFuture } from 'fp-future'

type ECSData = {
  gameJsTemplate: null | string
  ecsTypes: null | string
}

const ecsData: ECSData = {
  gameJsTemplate: null,
  ecsTypes: null
}

const gameJsPromises: IFuture<string>[] = []
const ecsTypesPromises: IFuture<string>[] = []

async function refreshEcsContent() {
  const params = new URLSearchParams(document.location.search)

  const jsSdkToolchainBranch = params.get('sdk-branch') || 'refs/heads/main'
  const amdJsUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${jsSdkToolchainBranch}/playground/amd.min.js`
  const ecs7IndexJsUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${jsSdkToolchainBranch}/playground/index.min.js`
  const ecs7IndexDTsUrl = `https://sdk-team-cdn.decentraland.org/@dcl/js-sdk-toolchain/branch/${jsSdkToolchainBranch}/playground/index.d.ts`

  const amdJs = await (await fetch(amdJsUrl)).text()
  const ecs7IndexJs = await (await fetch(ecs7IndexJsUrl)).text()

  ecsData.gameJsTemplate = amdJs + ';\n' + ecs7IndexJs + ';\n'
  ecsData.ecsTypes = await (await fetch(ecs7IndexDTsUrl)).text()

  for (const prom of gameJsPromises) {
    prom.resolve(ecsData.gameJsTemplate)
  }
  for (const prom of ecsTypesPromises) {
    prom.resolve(ecsData.ecsTypes)
  }
}

export async function getGameJsTemplate() {
  if (ecsData.gameJsTemplate !== null) {
    return ecsData.gameJsTemplate
  }
  const promise = future<string>()
  gameJsPromises.push(promise)
  return promise
}

export async function getEcsTypes() {
  if (ecsData.ecsTypes !== null) {
    return ecsData.ecsTypes
  }
  const promise = future<string>()
  ecsTypesPromises.push(promise)
  return promise
}

refreshEcsContent().then(console.log).catch(console.error)
