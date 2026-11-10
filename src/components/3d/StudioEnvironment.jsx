import { Component, Suspense } from 'react'
import { ContactShadows, Environment } from '@react-three/drei'

class EnvironmentErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error(
      'Unable to load the studio reflection environment; continuing with studio lights.',
      error,
    )
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function StudioEnvironment({ floorY, floorSize, shadowSize, shadowFar }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#dcecff', '#171d29', 0.7]} />
      <directionalLight
        color="#fff4e8"
        intensity={2.2}
        position={[4, 8, 5]}
      />
      <directionalLight
        color="#8fb9e8"
        intensity={1.15}
        position={[-5, 4, -4]}
      />
      <directionalLight
        color="#ffffff"
        intensity={0.65}
        position={[0, 3, -7]}
      />

      <EnvironmentErrorBoundary>
        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.7} />
        </Suspense>
      </EnvironmentErrorBoundary>

      <mesh
        position={[0, floorY - 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[floorSize, floorSize]} />
        <meshStandardMaterial
          color="#080c12"
          metalness={0.05}
          roughness={0.85}
          envMapIntensity={0.05}
        />
      </mesh>

      <ContactShadows
        color="#050910"
        far={shadowFar}
        frames={1}
        opacity={0.52}
        position={[0, floorY + 0.002, 0]}
        resolution={256}
        scale={shadowSize}
        blur={2.4}
        smooth
      />
    </>
  )
}

export default StudioEnvironment
