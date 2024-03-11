import { Color3 } from '@dcl/ecs-math'

type Color4 = {
  r: 0
  g: 0
  b: 0
  a: 0
}

export function toColor3(color: Color3) {
  return `rgb(${color.r}, ${color.g}, ${color.b})`
}

export function toColor4(color: Color4) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}
