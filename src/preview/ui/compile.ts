import React from 'react'
import Yoga from 'yoga-layout-prebuilt'

import { compileUi } from '../swc-compile'
import * as YogaJsx from './yoga'
import { YogaTypings } from './yoga/types'

export default async function transformCode(codeString: string, dependencies?: Record<string, unknown>) {
  const mergedDependencies: Record<string, unknown> = {
    ...(dependencies || {}),
    'yoga-jsx': YogaJsx,
    'yoga-layout-prebuilt': Yoga,
    react: React
  }

  const removeReactEcsDependency = (code: string): string => {
    const reactEcs = codeString.indexOf('@dcl/react-ecs')
    if (reactEcs === -1) {
      return code
    }
    return code.substring(reactEcs + '@dcl/react-ecs'.length + 1)
  }
  const codeReactString = removeReactEcsDependency(codeString)
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
  const transformedCode = await compileUi(codeWithUi)

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
