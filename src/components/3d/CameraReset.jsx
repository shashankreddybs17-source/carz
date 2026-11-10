import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

const RESET_DURATION = 0.8
const RESET_TARGET = new Vector3(0, 0, 0)

function CameraReset({ resetVersion, initialPosition, controlsRef }) {
  const { camera } = useThree()
  const transitionRef = useRef(null)

  useEffect(() => {
    if (resetVersion === 0 || !initialPosition || !controlsRef.current) return

    const controls = controlsRef.current
    controls.enabled = false
    const dampingEnabled = controls.enableDamping
    controls.enableDamping = false
    controls.update()
    transitionRef.current = {
      controls,
      dampingEnabled,
      elapsed: 0,
      startPosition: camera.position.clone(),
      startTarget: controls.target.clone(),
      endPosition: new Vector3(...initialPosition),
    }

    return () => {
      transitionRef.current = null
      controls.enabled = true
      controls.enableDamping = dampingEnabled
    }
  }, [camera, controlsRef, initialPosition, resetVersion])

  useFrame((_, delta) => {
    const transition = transitionRef.current
    if (!transition) return

    transition.elapsed += delta
    const progress = Math.min(transition.elapsed / RESET_DURATION, 1)
    const eased = progress * progress * (3 - 2 * progress)

    camera.position.lerpVectors(
      transition.startPosition,
      transition.endPosition,
      eased,
    )
    transition.controls.target.lerpVectors(
      transition.startTarget,
      RESET_TARGET,
      eased,
    )
    camera.lookAt(transition.controls.target)

    if (progress === 1) {
      transition.controls.enabled = true
      transition.controls.enableDamping = transition.dampingEnabled
      transitionRef.current = null
    }
  })

  return null
}

export default CameraReset
