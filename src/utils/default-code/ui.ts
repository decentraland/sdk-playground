export const ui = `import ReactEcs, { UiEntity } from '@dcl/react-ecs'

function App() {
  return <UiEntity uiTransform={{ width: 100, height: 100 }}>
    <UiEntity
      uiTransform={{ width: 50, height: 50, border: { top: 10, right: 10, bottom: 10, left: 10 } } }
      uiText={{ value: 'Boedo' }}
      uiStyles={{ backgroundColor: { r: 255, g: 45, b: 85, a: 1 } }}
    />
  </UiEntity>
}

`

export default ui
