import { PackagesData } from '../../utils/bundle/types'
import { compileScene } from '../swc-compile'

export async function getPreviewCode(packageData: PackagesData, editorCode: string) {
  const codeToCompile = packageData?.scene.types + ';' + editorCode
  const compiledCode = await compileScene(codeToCompile)
  return `
  'use strict';
${packageData?.scene.js};
for (const key in exports) {
  this.globalThis[key] = exports[key]
}
eval(${JSON.stringify(compiledCode)})
  `
}
