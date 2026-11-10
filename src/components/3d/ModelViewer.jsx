import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  memo,
  useRef,
  useState,
} from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useProgress } from '@react-three/drei'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import CarModel from './CarModel.jsx'
import CameraReset from './CameraReset.jsx'
import StudioEnvironment from './StudioEnvironment.jsx'

class ModelErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Unable to load the showroom car model.', error)
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function LoadingOverlay() {
  const { progress } = useProgress()
  const percentage = Math.round(progress)

  return (
    <div
      aria-live="polite"
      className="model-overlay"
      role="status"
    >
      <div className="model-loading-card">
        <p className="model-brand">Apex.MOTORSPORT</p>
        <div className="model-loading-label">
          <span>Preparing the showroom</span>
          <span>{percentage}%</span>
        </div>
        <div
          aria-label="Aston Martin model loading progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percentage}
          className="model-progress"
          role="progressbar"
        >
          <span style={{ width: `${percentage}%` }} />
        </div>
        <span className="model-loading-detail">
          Loading model geometry and materials
        </span>
      </div>
    </div>
  )
}

function CameraBridge({ enabled, cameraRef, controlsRef, onCameraReady }) {
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    if (!enabled) return undefined

    cameraRef.current = camera
    onCameraReady?.(camera, controlsRef.current)

    return () => {
      if (cameraRef.current === camera) cameraRef.current = null
      onCameraReady?.(null, null)
    }
  }, [camera, cameraRef, controlsRef, enabled, onCameraReady])

  return null
}

function ModelViewer({
  mode = 'explore',
  cameraRef: externalCameraRef,
  controlsRef: externalControlsRef,
  onCameraReady,
  onFrameChange: externalFrameChange,
  className = 'showroom-canvas-stage relative w-full overflow-hidden rounded-sm border border-white/10 bg-[#080d18]',
}) {
  const [status, setStatus] = useState('loading')
  const [cameraFrame, setCameraFrame] = useState(null)
  const [resetVersion, setResetVersion] = useState(0)
  const internalCameraRef = useRef(null)
  const internalControlsRef = useRef(null)
  const cameraRef = externalCameraRef ?? internalCameraRef
  const controlsRef = externalControlsRef ?? internalControlsRef
  const handleLoaded = useCallback(() => setStatus('loaded'), [])
  const handleError = useCallback(() => setStatus('error'), [])
  const handleFrameChange = useCallback(
    (frame) => {
      setCameraFrame(frame)
      externalFrameChange?.(frame)
    },
    [externalFrameChange],
  )
  const handleCanvasCreated = useCallback(({ gl }) => {
    gl.toneMapping = ACESFilmicToneMapping
    gl.toneMappingExposure = 1
    gl.outputColorSpace = SRGBColorSpace
  }, [])

  return (
    <section
      aria-label="Aston Martin Formula 1 car model"
      className={className}
    >
      <Canvas
        camera={{ position: [4, 3.2, 5], fov: 42, near: 0.01, far: 1000 }}
        dpr={[1, 1.35]}
        gl={{ alpha: false, antialias: true, powerPreference: 'high-performance' }}
        onCreated={handleCanvasCreated}
      >
        <color attach="background" args={['#080d18']} />
        {cameraFrame && (
          <StudioEnvironment
            floorY={cameraFrame.groundY}
            floorSize={cameraFrame.floorSize}
            shadowSize={cameraFrame.shadowSize}
            shadowFar={cameraFrame.shadowFar}
          />
        )}
        <Suspense fallback={null}>
          <ModelErrorBoundary onError={handleError}>
            <CarModel
              onFrameChange={handleFrameChange}
              onLoaded={handleLoaded}
            />
          </ModelErrorBoundary>
        </Suspense>
        {cameraFrame && (
          <>
            <OrbitControls
              ref={controlsRef}
              makeDefault
              target={cameraFrame.target}
              enableDamping
              dampingFactor={0.08}
              enableZoom
              zoomSpeed={0.8}
              enablePan={false}
              rotateSpeed={0.65}
              enabled={mode === 'explore'}
              minDistance={cameraFrame.minDistance}
              maxDistance={cameraFrame.maxDistance}
              minPolarAngle={Math.PI / 10}
              maxPolarAngle={Math.PI / 2 - 0.04}
            />
            {mode === 'explore' && (
              <CameraReset
                resetVersion={resetVersion}
                initialPosition={cameraFrame.position}
                controlsRef={controlsRef}
              />
            )}
            <CameraBridge
              enabled={Boolean(cameraFrame)}
              cameraRef={cameraRef}
              controlsRef={controlsRef}
              onCameraReady={onCameraReady}
            />
          </>
        )}
      </Canvas>

      {status === 'loading' && <LoadingOverlay />}
      {status === 'error' && (
        <div
          aria-describedby="model-error-description"
          aria-labelledby="model-error-title"
          className="model-overlay model-error"
          role="alert"
        >
          <div className="model-error-card">
            <p className="model-brand">Apex.MOTORSPORT</p>
            <h2 id="model-error-title">Model unavailable</h2>
            <p id="model-error-description">
              The car model or its textures could not be loaded. Check your
              connection, then try again.
            </p>
            <button
              className="model-retry-button"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload showroom
            </button>
          </div>
        </div>
      )}
      {status === 'loaded' && mode === 'explore' && (
        <button
          className="absolute bottom-4 right-4 z-10 rounded-sm bg-[#17634d] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white shadow-lg transition-colors hover:bg-[#237a60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9bc6b6] sm:bottom-6 sm:right-6 sm:px-5 sm:text-xs"
          onClick={() => setResetVersion((version) => version + 1)}
          type="button"
        >
          Reset View
        </button>
      )}
    </section>
  )
}

export default memo(ModelViewer)
