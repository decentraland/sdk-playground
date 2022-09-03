export const defaultValue = `
function createCube(x: number, y: number, z: number, spawner = true): Entity {
  const entity = engine.addEntity()

  Transform.create(entity, {
    position: { x, y, z },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  })

  BoxShape.create(entity, {
    withCollisions: true,
    isPointerBlocker: true,
    visible: true,
    uvs: []
  })

  if (spawner) {
    OnPointerDown.create(entity, {
      button: 1,
      hoverText: 'Press E to spawn',
      maxDistance: 100,
      showFeedback: true
    })
  }
  return entity
}

function circularSystem(dt: number) {
  const entitiesWithBoxShapes = engine.getEntitiesWith(BoxShape, Transform)
  for (const [entity, _boxShape, _transform] of entitiesWithBoxShapes) {
    const mutableTransform = Transform.getMutable(entity)

    mutableTransform.rotation = Quaternion.multiply(
      mutableTransform.rotation,
      Quaternion.angleAxis(dt * 10, Vector3.Up())
    )
  }
}

function spawnerSystem() {
  const clickedCubes = engine.getEntitiesWith(OnPointerDownResult)
  for (const [_entity, _cube] of clickedCubes) {
    createCube(Math.random() * 8 + 1, Math.random() * 8, Math.random() * 8 + 1, false)
  }
}


const mainCube = createCube(8, 1, 8)
engine.addSystem(circularSystem)
engine.addSystem(spawnerSystem)
`
