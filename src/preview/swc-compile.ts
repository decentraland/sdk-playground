import { transformSync } from '@swc/wasm-web'
// import { getBranchFromQueryParams, getBundle } from '../utils/bundle'

let swc: { transformSync: typeof transformSync }

async function compile(code: string, opts: any) {
  if (!swc) {
    const module = await import('@swc/wasm-web')
    await module.default()
    swc = module
  }

  return swc.transformSync(code, {
    filename: 'index.tsx',
    sourceMaps: true,
    ...opts
  }).code
}

export async function compileScene(code: string) {
  return compile(code, {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true
      },
      transform: {
        react: {
          pragma: 'ReactEcs.createElement'
        }
      }
    },
    module: {
      type: 'commonjs'
    }
  })
}

export async function compileUi(code: string) {
  return compile(code, {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true
      }
    },
    module: {
      type: 'commonjs'
    }
  })
}
