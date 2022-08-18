import { transformSync } from '@swc/wasm-web'

let swc: { transformSync: typeof transformSync }

export async function transformCode(codeString: string) {
  if (!swc) {
    const module = await import('@swc/wasm-web')
    await module.default()
    swc = module
  }
  return swc.transformSync(codeString, {
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
