declare type Children = any

declare interface Color3 {
  r: number
  g: number
  b: number
}

declare type CommonProps = {
  key: Key
  children: Children
}

declare function Container({ width, height, children }: ContainerPropTypes): ReactEcs.JSX.Element

declare type ContainerPropTypes = Partial<CommonProps> & EntityPropTypes['uiTransform']

declare type EcsElements = {
  entity: Partial<EntityComponents & CommonProps>
}

declare type EntityComponents = {
  uiTransform: PBUiTransform
  uiText: PBUiText
}

/**
 * @public
 */
declare type EntityPropTypes = {
  uiTransform?: UiTransformProps
  uiText?: UiTextProps
}

declare enum Font {
  LiberationSans = 0,
  SansSerif = 1,
  UNRECOGNIZED = -1
}

declare namespace JSX {
  interface Element {}
  type IntrinsicElements = EcsElements
  interface Component {}
}

declare type Key = number | string

declare interface PBUiText {
  value: string
  /** default=(1.0,1.0,1.0) */
  color?: Color3 | undefined
  /** default='center' */
  textAlign?: TextAlign | undefined
  /** default=0 */
  font?: Font | undefined
  /** default=10 */
  fontSize?: number | undefined
}

declare interface PBUiTransform {
  parent: number
  rightOf: number
  positionType: YGPositionType
  alignContent: YGAlign
  alignItems: YGAlign
  alignSelf: YGAlign
  flexDirection: YGFlexDirection
  flexWrap: YGWrap
  justifyContent: YGJustify
  overflow: YGOverflow
  display: YGDisplay
  direction: YGDirection
  flex: number
  flexBasisUnit: YGUnit
  flexBasis: number
  flexGrow: number
  flexShrink: number
  widthUnit: YGUnit
  width: number
  heightUnit: YGUnit
  height: number
  minWidthUnit: YGUnit
  minWidth: number
  minHeightUnit: YGUnit
  minHeight: number
  maxWidthUnit: YGUnit
  maxWidth: number
  maxHeightUnit: YGUnit
  maxHeight: number
  positionLeftUnit: YGUnit
  positionLeft: number
  positionTopUnit: YGUnit
  positionTop: number
  positionRightUnit: YGUnit
  positionRight: number
  positionBottomUnit: YGUnit
  positionBottom: number
  /** margin */
  marginLeftUnit: YGUnit
  marginLeft: number
  marginTopUnit: YGUnit
  marginTop: number
  marginRightUnit: YGUnit
  marginRight: number
  marginBottomUnit: YGUnit
  marginBottom: number
  paddingLeftUnit: YGUnit
  paddingLeft: number
  paddingTopUnit: YGUnit
  paddingTop: number
  paddingRightUnit: YGUnit
  paddingRight: number
  paddingBottomUnit: YGUnit
  paddingBottom: number
  borderLeft: number
  borderTop: number
  borderRight: number
  borderBottom: number
}

/**
 * @public
 */
declare type Position = {
  top: number | string
  right: number | string
  bottom: number | string
  left: number | string
}

declare namespace ReactEcs {
  namespace JSX {
    interface Element {}
    type IntrinsicElements = EcsElements
    interface Component {}
  }
  const createElement: any
}
export { ReactEcs }
export default ReactEcs

declare function removeUi(index: number): void

declare function renderUi(ui: UiComponent): number

declare enum TextAlign {
  Center = 0,
  Left = 1,
  Right = 2,
  UNRECOGNIZED = -1
}

declare type UiComponent = () => JSX.Element

/**
 * @public
 */
declare function UiEntity(props: EntityPropTypes & Partial<CommonProps>): ReactEcs.JSX.Element

declare type UiTextProps = PBUiText

/**
 * @public
 */
declare interface UiTransformProps {
  display?: YGDisplay
  flex?: number
  justifyContent?: YGJustify
  positionType?: YGPositionType
  alignItems?: YGAlign
  alignSelf?: YGAlign
  alignContent?: YGAlign
  flexDirection?: YGFlexDirection
  position?: Position
  padding?: Position
  margin?: Position
  border?: Position
  direction?: YGDirection
  width?: number
  height?: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  flexWrap?: YGWrap
  flexBasis?: number
  flexGrow?: number
  flexShrink?: number
  overflow?: YGOverflow
}

declare enum YGAlign {
  YGAlignAuto = 0,
  YGAlignFlexStart = 1,
  YGAlignCenter = 2,
  YGAlignFlexEnd = 3,
  YGAlignStretch = 4,
  YGAlignBaseline = 5,
  YGAlignSpaceBetween = 6,
  YGAlignSpaceAround = 7,
  UNRECOGNIZED = -1
}

declare enum YGDirection {
  YGDirectionInherit = 0,
  YGDirectionLTR = 1,
  YGDirectionRTL = 2,
  UNRECOGNIZED = -1
}

declare enum YGDisplay {
  YGDisplayFlex = 0,
  YGDisplayNone = 1,
  UNRECOGNIZED = -1
}

declare enum YGFlexDirection {
  YGFlexDirectionColumn = 0,
  YGFlexDirectionColumnReverse = 1,
  YGFlexDirectionRow = 2,
  YGFlexDirectionRowReverse = 3,
  UNRECOGNIZED = -1
}

declare enum YGJustify {
  YGJustifyFlexStart = 0,
  YGJustifyCenter = 1,
  YGJustifyFlexEnd = 2,
  YGJustifySpaceBetween = 3,
  YGJustifySpaceAround = 4,
  YGJustifySpaceEvenly = 5,
  UNRECOGNIZED = -1
}

declare enum YGOverflow {
  YGOverflowVisible = 0,
  YGOverflowHidden = 1,
  YGOverflowScroll = 2,
  UNRECOGNIZED = -1
}

declare enum YGPositionType {
  YGPositionTypeStatic = 0,
  YGPositionTypeRelative = 1,
  YGPositionTypeAbsolute = 2,
  UNRECOGNIZED = -1
}

declare enum YGUnit {
  YGUnitUndefined = 0,
  YGUnitPoint = 1,
  YGUnitPercent = 2,
  YGUnitAuto = 3,
  UNRECOGNIZED = -1
}

declare enum YGWrap {
  YGWrapNoWrap = 0,
  YGWrapWrap = 1,
  YGWrapWrapReverse = 2,
  UNRECOGNIZED = -1
}