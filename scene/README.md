# ECS7 Test scene

This scene is built with the ECS7 in alpha state.

To run this scene, you must use the following commands instead of the typical `dcl start`:

1. Run `npm i`
2. Run `npm start`


# ECS 7

## Entities

An Entity is just an ID. It is an abstract concept not represented by any data structure. There is no "class Entity". Just a number that is used as a reference to group different components.

```ts
const myEntity = engine.addEntity()
console.log(myEntity) // 100

// Remove Entity
engine.removeEntity(myEntity)
```

> Note: Note that it's no longer necessary to separately create an entity and then add it to the engine, this is all done in a single act.

## Components

The component is just a data container, WITHOUT any functions.

To add a component to an entity, the entry point is now the component type, not the entity.

```ts
Transform.create(myEntity, <params>)
```

This is different from how the syntax was in SDK6:

```ts
// OLD Syntax
myEntity.addComponent(Transform)
```




### Base Components

Base components already come packed as part of the SDK. Most of them interact directly with the renderer in some way. This is the full list of currently supported base components:

- Animator
- AudioSource
- AvatarAttach
- BoxShape
- CylinderShape
- GLTFShape
- NFTShape
- OnPointerDown
- OnPointerDownResult
- OnPointerUp
- OnPointerUpResult
- PlaneShape
- SphereShape
- TextShape
- Transform

> Note: Both `OnPointerDownResult` and `OnPointerUpResult` are not meant to be explicitly added to an entity in code. They are added by the engine as a result of a player's interaction.


```ts
const { Transform, GLFTShape } = engine.baseComponents
const entity = engine.addEntity()
Transfrom.create(entity, {
  position: { x: 12, y: 1, z: 12 },
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0, w: 1 }
})
GLTFShape.create(zombie, {
  withCollisions: true,
  isPointerBlocker: true,
  visible: true,
  src: 'models/zombie.glb'
})
```


### Custom Components

Each component must have a unique number ID. If a number is repeated, the engine or another player receiving updates might apply changes to the wrong component. Note that numbers 1-1000 are reserved for the base components.

When creating a custom component you declare the structure of the data to be stored in it. Every field in a component MUST belong to one of the built-in special types provided as part of the SDK. These special types include extra functionality that allows them to be serialized/deserialized.

Currently, the names of these special types are:

- Int32
- ECSString
- ECSBoolean

Below are some examples of how these types can be declared.

```ts
const object = MapType({ x: Int32 }) // { x: 1 }

const array = ArrayType(Int32) // [1,2,3,4]

const objectArray = ArrayType(
  MapType({ x: Int32 })
) // [{ x: 1 }, { x: 2 }]

const BasicTypes = MapType({
  x: Int32,
  y: Float32,
  text: String,
  flag: Boolean
  }) // { x: 1, y: 1.412, text: 'ecs 7 text', flag: true }
  
const VelocityType = MapType({
  x: Float32,
  y: Float32,
  z: Float32
})
```

To then create a custom component using one of these types, use the following syntax:

```ts
export const myCustomComponent = engine.defineComponent(ComponentID, MyDataType)
```



For contrast, below is an example of how components were constructed prior to SDK 7.

```ts
/**
 * OLD SDK
 */

// Define Coponent
@Component("velocity")
export class Velocity extends Vector3 {
  constructor(x: number, y: number, z: number) {
    super(x, y, z)
  }
}
// Create entity
const wheel = new Entity()

// Create instance of component with default values
wheel.addComponent(new WheelSpin())

/**
 * ECS 7
 */
// Define Component
const VelocityType = MapType({
  x: Float32,
  y: Float32,
  z: Float32
})
const COMPONENT_ID = 2008
const VelocityComponent = engine.deficneComponent(COMPONENT_ID, Velocity)
// Create Entity
const entity = engine.addEntity()

// Create instance of component
VelocityComponent.create(entity, { x: 1, y: 2.3, z: 8 })

// Remove instance of a component
VelocityComponenty.deleteFrom(entity)
```



## Systems

Systems are pure & simple functions.
All your logic comes here.
A system might hold data which is relevant to the system itself, but no data about the entities it processes.

To add a system, all you need to do is define a function and add it to the engine. The function may optionally include a `dt` parameter with the delay since last frame, just like in prior versions of the SDK.

```ts
// Basic system
function mySystem() {
  log("my system is running")
}

engine.addSystem(mySystem)

// System with dt
function mySystemDT(dt: number) {
  log("time since last frame:  ", dt)
 }
 
engine.addSystem(mySystemDT)
```


### Query components

The way to group/query the components inside systems is using the method groupOf.
`engine.groupOf(...components)`.


```ts
function physicsSystem(dt: number) {
  const [entity, transform, velocity] = engine.groupOf(Transform, Velociy)
  // transform & velocity are read only components.
  if (transform.position.x === 10) {
    // To update a component, you need to call the `.mutable` method
    const mutableVelocity = VelocityComponent.mutable(entity)
    mutableVelocity.x += 1
  }
}

// Add system to the engine
engine.addSystem(physicsSystem)

// Remove system
engine.removeSystem(physicsSystem)
```

## Mutability

Mutability is now an important distinction. We can choose to deal with mutable or with immutable versions of a component. We should use `mutable` only when we plan to make changes to a component. Dealing with immutable versions of components results in a huge gain in performance.

The `.getFrom()` function in a component returns an immutable version of the component. You can only read its values, but can't change any of the properties on it.

```ts
const immutableTransform = baseComponents.Transform.getFrom(myEntity)
```

To fetch the mutable version of a component, call it via `ComopnentType.mutable()`. For example:

```ts
const mutableTransform = baseComponents.Transform.mutable(myEntity)
```


## Known Issues

- Collisions don’t work with any shape
- Entities with a TextShape might not correctly appear in the position indicated by the Transform
- Sometimes GLTF entities aren’t rendered by the engine
