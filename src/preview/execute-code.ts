import { transformSync } from '@swc/wasm-web'
import { getEcsTypes } from '../ecs'

let swc: { transformSync: typeof transformSync }

export async function transformCode(codeString: string) {
  if (!swc) {
    const module = await import('@swc/wasm-web')
    await module.default()
    swc = module
  }

  const code = (await getEcsTypes()) + codeString
  return swc.transformSync(code, {
    filename: 'index.tsx',
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true
      }
    },
    module: {
      type: 'commonjs'
    },
    sourceMaps: true
  }).code
}
