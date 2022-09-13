import scene from './scene'
import ui from './ui'

export default function placeholder(type: 'ui' | 'scene') {
  if (type === 'scene') {
    return scene
  }
  if (type === 'ui') {
    return ui
  }
  return ''
}
