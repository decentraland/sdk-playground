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
  const amdJs = await (await fetch('sdk/amd.min.js')).text()
  const ecs7IndexJs = await (await fetch('sdk/index.min.js')).text()

  ecsData.gameJsTemplate = amdJs + ';\n' + ecs7IndexJs + ';\n'
  ecsData.ecsTypes = await (await fetch('sdk/index.d.ts')).text()

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
