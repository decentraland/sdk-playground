import React from 'react'
import Yoga from 'yoga-layout-prebuilt'

import { compile } from '../execute-code'
import * as YogaJsx from './yoga'
import { YogaTypings } from './yoga/types'

export async function transformCode(codeString: string, dependencies?: Record<string, unknown>) {
  const mergedDependencies: Record<string, unknown> = {
    ...(dependencies || {}),
    'yoga-jsx': YogaJsx,
    'yoga-layout-prebuilt': Yoga,
    react: React
  }
  const codeReactString = codeString
    .substring(codeString.indexOf('\n') + 1)
    .replace('function App()', 'export default function App()')
  const ecsUI =
    YogaTypings +
    `
  import { YogaJsx } from 'yoga-jsx'
  import Yoga from 'yoga-layout-prebuilt'
  import React, { Children } from 'react'

  function UiEntity(props) {
    return <YogaJsx {...props} />
  }

  // TODO: define here extra components.
  function Container(props) {
    return <YogaJsx  />
  }

  `
  const codeWithUi = ecsUI + codeReactString
  const transformedCode = await compile(codeWithUi)
  const exports: Record<string, unknown> = {}
  const require = (path: string) => {
    if (mergedDependencies[path]) {
      return mergedDependencies[path]
    }
    throw Error(`Module not found: ${path}.`)
  }

  // eslint-disable-next-line no-new-func
  const result = new Function('exports', 'require', transformedCode)
  result(exports, require)

  return exports.default
}
