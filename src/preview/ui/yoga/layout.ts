import Yoga from 'yoga-layout-prebuilt'

export type PositionTypes = 'position' | 'margin' | 'padding' | 'border'

export type Position = {
  top: number | string
  right: number | string
  bottom: number | string
  left: number | string
}

export interface YogaProps {
  display: Yoga.YogaDisplay
  overflow: Yoga.YogaOverflow
  justifyContent: Yoga.YogaJustifyContent
  positionType: Yoga.YogaPositionType
  alignItems: Yoga.YogaAlign
  alignSelf: Yoga.YogaAlign
  alignContent: Yoga.YogaAlign
  flexDirection: Yoga.YogaFlexDirection
  position: Position
  padding: Position
  margin: Position
  border: Position
  direction: Yoga.YogaDirection
  width: number | string
  height: number | string
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
  flexWrap: Yoga.YogaFlexWrap
  flexBasis: string | number
  flexGrow: number
  flexShrink: number
  aspectRatio: number | undefined
}

export const defaultPosition = (pos?: Position) => ({
  top: pos?.top ?? 0,
  right: pos?.right ?? 0,
  bottom: pos?.bottom ?? 0,
  left: pos?.left ?? 0
})

export const defaultPositionLayout = (): Pick<YogaProps, 'position' | 'padding' | 'margin' | 'border'> => ({
  position: defaultPosition({
    left: NaN,
    top: NaN,
    right: NaN,
    bottom: NaN
  }),
  padding: defaultPosition(),
  margin: defaultPosition(),
  border: defaultPosition()
})

export const defaultLayout = (): Omit<YogaProps, 'direction' | 'position' | 'padding' | 'margin' | 'border'> => ({
  display: Yoga.DISPLAY_FLEX,
  overflow: Yoga.OVERFLOW_VISIBLE,
  flexBasis: NaN,
  width: NaN,
  height: NaN,
  minWidth: NaN,
  minHeight: NaN,
  maxWidth: NaN,
  maxHeight: NaN,
  justifyContent: Yoga.JUSTIFY_FLEX_START,
  alignItems: Yoga.ALIGN_STRETCH,
  alignSelf: Yoga.ALIGN_AUTO,
  alignContent: Yoga.ALIGN_STRETCH,
  flexDirection: Yoga.FLEX_DIRECTION_ROW,
  positionType: Yoga.POSITION_TYPE_RELATIVE,
  flexWrap: Yoga.WRAP_NO_WRAP,
  flexGrow: 0,
  flexShrink: 1,
  aspectRatio: undefined
})

export default defaultLayout
