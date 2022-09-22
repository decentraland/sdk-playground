import React, { useState } from 'react'
import { Font, TextAlign, EntityPropTypes } from '@dcl/react-ecs'
import Yoga, { DIRECTION_INHERIT } from 'yoga-layout-prebuilt'

import { defaultLayout, PositionTypes, defaultPositionLayout } from './layout'
import { toColor3, toColor4 } from './utils'

type ComputedLayout = {
  left: number
  top: number
  width: number
  height: number
  children: Array<ComputedLayout>
  node: Yoga.YogaNode
}

type Color4 = {
  r: 0
  g: 0
  b: 0
  a: 0
}

type StyleProps = {
  backgroundColor: Color4
}

interface PropTypes extends EntityPropTypes {
  children: React.ReactNode
  uiStyles?: StyleProps
  isRootNode?: boolean
  computedLayout?: ComputedLayout
}

function toYogaSetProp(value: string): keyof Yoga.YogaNode {
  return `set${value[0].toUpperCase()}${value.slice(1, value.length)}` as keyof Yoga.YogaNode
}

export const YogaJsx: React.FC<Partial<PropTypes>> = (props) => {
  const [rootNode, setNode] = useState<Yoga.YogaNode>()
  const [computedLayout, setLayout] = useState<ComputedLayout>()

  if (!props) return null

  function createYogaNodes(nextProps: Partial<PropTypes>): Yoga.YogaNode {
    const node = Yoga.Node.create()
    if (!nextProps.uiTransform) return node
    const layout = defaultLayout()
    for (const key in layout) {
      try {
        const propKey = (nextProps.uiTransform as any)[key]
        const value = propKey ?? (layout as any)[key]
        ;(node as any)[toYogaSetProp(key)](value)
      } catch (e) {
        console.log(e, key, { uiTransform: nextProps.uiTransform })
      }
    }

    const defaultPosition = defaultPositionLayout()
    for (const key in defaultPosition) {
      const typedKey: PositionTypes = key as PositionTypes
      const value = nextProps.uiTransform[typedKey]

      if (!value) continue

      for (const pos in value) {
        const direction = `EDGE_${pos.toUpperCase()}` as keyof typeof Yoga
        const yogaDirection = Yoga[direction] as Yoga.YogaEdge

        if (pos === 'left' || pos === 'top' || pos === 'right' || pos === 'bottom') {
          try {
            ;(node[toYogaSetProp(key)] as typeof node.setPosition)(yogaDirection, value[pos])
          } catch (e) {
            console.log(e, typedKey, value)
          }
        }
      }
    }

    node.setDisplay(Yoga.DISPLAY_FLEX)
    const children = React.Children.toArray(nextProps.children)
    children
      .map((children) => createYogaNodes((children as any).props))
      .forEach((children, index) => node.insertChild(children, index))
    return node
  }

  function getComputedLayout(node: Yoga.YogaNode): ComputedLayout {
    return {
      ...node.getComputedLayout(),
      node,
      children: Array.from({ length: node.getChildCount() }, (_, i) => getComputedLayout(node.getChild(i)))
    }
  }

  function calculateLayout(): ComputedLayout | undefined {
    if (props.computedLayout) return undefined
    const root = createYogaNodes(props)
    setNode(root)
    root.calculateLayout(props.uiTransform?.width as number, props.uiTransform?.height as number, DIRECTION_INHERIT)
    const layout = getComputedLayout(root)
    setLayout(layout)
  }

  function getChildProps(index: number) {
    const children = React.Children.toArray(props.children)
    return (children[index] as any).props as Partial<PropTypes>
  }

  function prepareUiStyles() {
    if (!props.uiStyles) return {}
    const { backgroundColor } = props.uiStyles
    const styles = {
      backgroundColor: backgroundColor && toColor4(backgroundColor)
    }
    return styles
  }

  function prepareTextStyles() {
    if (!props.uiText) return {}
    const { value, font, color, fontSize, textAlign, ...extraProps } = props.uiText
    const styles = {
      ...extraProps,
      font: font && Font[font],
      color: color && toColor3(color),
      fontSize: fontSize,
      textAlign: textAlign !== undefined && TextAlign[textAlign]
    }
    return styles
  }

  const layout = props.computedLayout || computedLayout || calculateLayout()!

  if (!layout) return null

  const { width, height, top, left, children } = layout
  const divStyle = rootNode
    ? { width, height, position: 'static' as const }
    : { width, height, top, left, position: 'absolute' as const }
  return (
    <div style={{ ...divStyle, ...prepareUiStyles(), ...prepareTextStyles() }}>
      {props.uiText?.value || ''}
      {(children || []).map((children, index) => (
        <YogaJsx key={index} computedLayout={children} {...getChildProps(index)} />
      ))}
    </div>
  )
}

export default YogaJsx
