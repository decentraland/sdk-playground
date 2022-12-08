import { PackagesData } from '../../utils/bundle/types'
import { compileScene } from '../swc-compile'

export async function getPreviewCode(packageData: PackagesData, code: string) {
  const gameJsTemplate = packageData?.scene.js
  const codeToAddFirst = `
const EngineApi = require('~system/EngineApi');
const communicationsController = require('~system/CommunicationsController');
const EthereumController = require('~system/EthereumController');
const process = {env: {}};
        ${gameJsTemplate}
exports.onUpdate = globalThis.onUpdate
      `
  const codeToCompile = packageData?.scene.types + ';' + code
  const compiledCode = await compileScene(codeToCompile)
  return `
${codeToAddFirst};
eval(${JSON.stringify(compiledCode)})
`
}
