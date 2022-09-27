import { transformSync } from '@swc/wasm-web'
import { getBranchFromQueryParams, getBundle } from '../utils/bundle'

let swc: { transformSync: typeof transformSync }

export async function compile(codeString: string) {
  if (!swc) {
    const module = await import('@swc/wasm-web')
    await module.default()
    swc = module
  }

  const code = (await getBundle(getBranchFromQueryParams())).scene.types + codeString
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
