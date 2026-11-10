import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3, Vector3 } from 'three'

const MODEL_URL = '/models/ashton-martin-optimized-2048/scene.gltf'
const TARGET_SIZE = 8
const CAMERA_AZIMUTH = Math.PI / 4
const CAMERA_ELEVATION = Math.PI / 12

function CarModel({ onFrameChange, onLoaded }) {
  const { scene } = useGLTF(MODEL_URL)
  const { camera, size } = useThree()

  const modelBounds = useMemo(() => {
    const bounds = new Box3().setFromObject(scene)
    const dimensions = bounds.getSize(new Vector3())
    const center = bounds.getCenter(new Vector3())
    const scale = TARGET_SIZE / Math.max(dimensions.x, dimensions.y, dimensions.z)
    const radius = (dimensions.length() * scale) / 2
    const longitudinalAxis = dimensions.z >= dimensions.x ? 'z' : 'x'
    let frontWingCenter = null
    let frontWingDistance = -Infinity

    scene.traverse((object) => {
      if (!object.isMesh || !/wingalt|wingust/i.test(object.name)) return

      const wingBounds = new Box3().setFromObject(object)
      const wingCenter = wingBounds.getCenter(new Vector3())
      const axisDistance = wingCenter[longitudinalAxis] - center[longitudinalAxis]

      if (Math.abs(axisDistance) > frontWingDistance) {
        frontWingCenter = wingCenter
        frontWingDistance = Math.abs(axisDistance)
      }
    })

    return {
      center,
      dimensions,
      frontWingCenter,
      longitudinalAxis,
      radius,
      scale,
      frontWingDirection: Math.sign(
        (frontWingCenter?.[longitudinalAxis] ?? center[longitudinalAxis]) -
          center[longitudinalAxis],
      ),
    }
  }, [scene])

  useEffect(() => {
    onLoaded()
  }, [onLoaded])

  const cameraFrame = useMemo(() => {
    if (!camera.isPerspectiveCamera || !size.width || !size.height) return null
    const verticalFov = (camera.fov * Math.PI) / 180
    const aspect = size.width / size.height
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect)
    const { dimensions, scale } = modelBounds
    const width = dimensions.x * scale
    const height = dimensions.y * scale
    const depth = dimensions.z * scale
    const sinAzimuth = Math.sin(CAMERA_AZIMUTH)
    const cosAzimuth = Math.cos(CAMERA_AZIMUTH)
    const sinElevation = Math.sin(CAMERA_ELEVATION)
    const cosElevation = Math.cos(CAMERA_ELEVATION)
    const halfWidth =
      (Math.abs(cosAzimuth) * width + Math.abs(sinAzimuth) * depth) / 2
    const halfHeight =
      (Math.abs(sinElevation * sinAzimuth) * width +
        Math.abs(cosElevation) * height +
        Math.abs(sinElevation * cosAzimuth) * depth) /
      2
    const halfDepth =
      (Math.abs(cosElevation * sinAzimuth) * width +
        Math.abs(sinElevation) * height +
        Math.abs(cosElevation * cosAzimuth) * depth) /
      2
    const distance =
      halfDepth +
      Math.max(
        halfWidth / Math.tan(horizontalFov / 2),
        halfHeight / Math.tan(verticalFov / 2),
      ) *
        1.12
    const { frontWingCenter, frontWingDirection, longitudinalAxis, radius } =
      modelBounds
    const sideAxis = longitudinalAxis === 'z' ? 'x' : 'z'
    const sideDirection = [0, 0, 0]
    sideDirection[sideAxis === 'x' ? 0 : 2] = 1
    const forwardDirection = [0, 0, 0]
    forwardDirection[longitudinalAxis === 'x' ? 0 : 2] =
      frontWingDirection || 1
    forwardDirection[sideAxis === 'x' ? 0 : 2] = 0.32
    const rearDirection = forwardDirection.map((value) => -value)
    const frontWingTarget = frontWingCenter
      ? [
          (frontWingCenter.x - modelBounds.center.x) * scale,
          (frontWingCenter.y - modelBounds.center.y) * scale,
          (frontWingCenter.z - modelBounds.center.z) * scale,
        ]
      : [0, 0, 0]
    const cameraPosition = (direction, target, viewDistance) => [
      target[0] + direction[0] * viewDistance,
      target[1] + direction[1] * viewDistance + viewDistance * 0.12,
      target[2] + direction[2] * viewDistance,
    ]
    const fullPosition = [
      distance * cosElevation * sinAzimuth,
      distance * sinElevation,
      distance * cosElevation * cosAzimuth,
    ]
    const sideDistance = distance * 1.08
    const detailDistance = Math.max(radius * 1.08, distance * 0.34)
    const rearDistance = distance * 0.98

    return {
      position: fullPosition,
      target: [0, 0, 0],
      storyViews: [
        {
          position: fullPosition,
          target: [0, 0, 0],
        },
        {
          position: cameraPosition(sideDirection, [0, 0, 0], sideDistance),
          target: [0, 0, 0],
        },
        {
          position: cameraPosition(
            forwardDirection,
            frontWingTarget,
            detailDistance,
          ),
          target: frontWingTarget,
        },
        {
          position: cameraPosition(rearDirection, [0, 0, 0], rearDistance),
          target: [0, 0, 0],
        },
        {
          position: fullPosition,
          target: [0, 0, 0],
        },
      ],
      distance,
      minDistance: Math.max(modelBounds.radius * 0.65, distance * 0.55),
      maxDistance: distance * 4,
      groundY: -(dimensions.y * scale) / 2,
      floorSize: Math.max(width, depth) * 4,
      shadowSize: [Math.max(width * 1.35, 1), Math.max(depth * 1.35, 1)],
      shadowFar: Math.max(height * 2, 2),
    }
  }, [camera, modelBounds, size.height, size.width])

  useEffect(() => {
    if (!cameraFrame || !camera.isPerspectiveCamera) return

    camera.position.set(...cameraFrame.position)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    onFrameChange(cameraFrame)
  }, [camera, cameraFrame, onFrameChange])

  const { center, scale } = modelBounds

  return (
    <group
      position={[-center.x * scale, -center.y * scale, -center.z * scale]}
      scale={scale}
    >
      <primitive object={scene} />
    </group>
  )
}

export default CarModel
