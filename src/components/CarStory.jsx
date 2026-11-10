import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CameraGuide from './CameraGuide.jsx'
import ModelViewer from './3d/ModelViewer.jsx'

gsap.registerPlugin(ScrollTrigger)

const STORY_STAGES = [
  {
    label: '01 / The complete form',
    title: 'A presence built for the grid.',
    description:
      'Begin with the complete car, framed in the studio from a three-quarter view.',
  },
  {
    label: '02 / Aerodynamics',
    title: 'Sculpted by the air.',
    description:
      'A side profile reveals the low silhouette and the front- and rear-wing forms represented in the model.',
  },
  {
    label: '03 / Engineering',
    title: 'Details at the leading edge.',
    description:
      'Move closer to the front-wing geometry and the layered surfaces of the supplied model.',
  },
  {
    label: '04 / Rear design',
    title: 'A different point of view.',
    description:
      'Turn around the chassis to explore the rear three-quarter shape and its aerodynamic elements.',
  },
  {
    label: '05 / Final showcase',
    title: 'The whole machine, again.',
    description:
      'Return to the full-car studio composition and continue exploring at your own pace.',
  },
]

function getReducedMotionPreference() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function CarStory() {
  const storyRef = useRef(null)
  const pinRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const frameRef = useRef(null)
  const panelRefs = useRef([])
  const progressRefs = useRef([])
  const [mode, setMode] = useState('story')
  const [sceneReady, setSceneReady] = useState(false)
  const [cameraFrameRevision, setCameraFrameRevision] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(getReducedMotionPreference)
  const [selectedStage, setSelectedStage] = useState(0)

  const handleCameraReady = useCallback((camera, controls) => {
    cameraRef.current = camera
    controlsRef.current = controls
    setSceneReady(Boolean(camera && controls))
  }, [])

  const handleFrameChange = useCallback((frame) => {
    frameRef.current = frame
    setCameraFrameRevision((revision) => revision + 1)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = (event) => setReducedMotion(event.matches)

    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useLayoutEffect(() => {
    if (
      !sceneReady ||
      mode !== 'story' ||
      reducedMotion ||
      !pinRef.current ||
      !cameraRef.current ||
      !controlsRef.current ||
      !frameRef.current
    ) {
      return undefined
    }

    const camera = cameraRef.current
    const controls = controlsRef.current
    const views = frameRef.current.storyViews
    if (!views?.length || views.length !== STORY_STAGES.length) return undefined

    let refreshFrame
    let resizeObserver
    let observedSize = ''
    const refresh = () => {
      cancelAnimationFrame(refreshFrame)
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh())
    }

    const context = gsap.context(() => {
      const panels = panelRefs.current.filter(Boolean)
      const progressBars = progressRefs.current.filter(Boolean)
      gsap.set(panels, { autoAlpha: 0, y: 18 })
      gsap.set(panels[0], { autoAlpha: 1, y: 0 })
      gsap.set(progressBars, { scaleX: 0.35, transformOrigin: 'left center' })
      gsap.set(progressBars[0], { scaleX: 1 })
      panels.forEach((panel, index) => {
        panel.setAttribute('aria-hidden', index === 0 ? 'false' : 'true')
      })

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'aston-martin-car-story',
          trigger: pinRef.current,
          pin: pinRef.current,
          start: 'top top+=72',
          end: () => `+=${window.innerHeight * (STORY_STAGES.length - 1)}`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      timeline.set(camera.position, {
        x: views[0].position[0],
        y: views[0].position[1],
        z: views[0].position[2],
      })
      timeline.set(controls.target, {
        x: views[0].target[0],
        y: views[0].target[1],
        z: views[0].target[2],
      })

      const updateCamera = () => camera.lookAt(controls.target)

      for (let index = 1; index < views.length; index += 1) {
        const view = views[index]
        const segmentStart = index - 1
        const previousPanel = panels[index - 1]
        const nextPanel = panels[index]

        timeline.to(
          camera.position,
          {
            x: view.position[0],
            y: view.position[1],
            z: view.position[2],
            duration: 1,
            onUpdate: updateCamera,
          },
          segmentStart,
        )
        timeline.to(
          controls.target,
          {
            x: view.target[0],
            y: view.target[1],
            z: view.target[2],
            duration: 1,
            onUpdate: updateCamera,
          },
          segmentStart,
        )
        timeline.to(
          previousPanel,
          {
            autoAlpha: 0,
            y: -12,
            duration: 0.18,
          },
          segmentStart,
        )
        timeline.to(
          progressBars[index - 1],
          {
            scaleX: 1,
            duration: 0.7,
          },
          segmentStart,
        )
        timeline.to(
          progressBars[index],
          {
            autoAlpha: 1,
            duration: 0.15,
          },
          segmentStart + 0.1,
        )
        timeline.fromTo(
          nextPanel,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.24,
            onStart: () => {
              panels.forEach((panel, panelIndex) => {
                panel.setAttribute(
                  'aria-hidden',
                  panelIndex === index ? 'false' : 'true',
                )
              })
            },
            onReverseComplete: () => {
              panels.forEach((panel, panelIndex) => {
                panel.setAttribute(
                  'aria-hidden',
                  panelIndex === index - 1 ? 'false' : 'true',
                )
              })
            },
          },
          segmentStart + 0.12,
        )
      }

      refresh()

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(([entry]) => {
          const { width, height } = entry.contentRect
          const nextSize = `${width}:${height}`
          if (nextSize === observedSize) return

          observedSize = nextSize
          refresh()
        })
        resizeObserver.observe(pinRef.current)
      }
    }, storyRef)

    return () => {
      cancelAnimationFrame(refreshFrame)
      resizeObserver?.disconnect()
      const currentPosition = camera.position.clone()
      const currentTarget = controls.target.clone()
      context.revert()
      if (cameraRef.current && controlsRef.current && frameRef.current) {
        cameraRef.current.position.copy(currentPosition)
        controlsRef.current.target.copy(currentTarget)
        cameraRef.current.lookAt(controlsRef.current.target)
        controlsRef.current.update()
      }
    }
  }, [cameraFrameRevision, mode, reducedMotion, sceneReady])

  useEffect(() => {
    if (!reducedMotion || mode !== 'story' || !sceneReady) return
    controlsRef.current.enabled = true
  }, [mode, reducedMotion, sceneReady])

  const selectReducedMotionStage = (index) => {
    const view = frameRef.current?.storyViews[index]
    if (!view || !cameraRef.current || !controlsRef.current) return

    setSelectedStage(index)
    cameraRef.current.position.set(...view.position)
    controlsRef.current.target.set(...view.target)
    cameraRef.current.lookAt(controlsRef.current.target)
    controlsRef.current.update()
  }

  return (
    <section
      aria-label="Five-stage interactive car story"
      className={`car-story-section scroll-mt-[4.5rem] ${
        mode === 'explore' && !reducedMotion ? 'car-story-section-explore' : ''
      }`}
      id="story"
      ref={storyRef}
    >
      <div className="car-story-pin relative isolate" ref={pinRef}>
        <ModelViewer
          cameraRef={cameraRef}
          className="car-story-canvas absolute inset-0 z-0"
          controlsRef={controlsRef}
          mode={mode === 'explore' || reducedMotion ? 'explore' : 'story'}
          onCameraReady={handleCameraReady}
          onFrameChange={handleFrameChange}
        />
        <div className="car-story-vignette pointer-events-none absolute inset-0" />

        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#a3c6b6] sm:text-[10px]">
              Aston Martin · Formula 1
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">
              {mode === 'story' ? 'Scroll-driven story' : 'Manual explore'}
            </p>
          </div>
          <button
            aria-label={
              mode === 'story' ? 'Switch to Explore mode' : 'Return to Story mode'
            }
            aria-pressed={mode === 'explore'}
            className="rounded-sm bg-[#17634d] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#237a60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9bc6b6] sm:px-5 sm:py-3 sm:text-[10px]"
            onClick={() =>
              setMode((currentMode) =>
                currentMode === 'story' ? 'explore' : 'story',
              )
            }
            type="button"
          >
            {mode === 'story' ? 'Explore mode' : 'Return to story'}
          </button>
        </div>

        {!reducedMotion && mode === 'story' && (
          <div
            aria-label="Story chapters"
            className="pointer-events-none absolute bottom-6 left-5 z-10 flex gap-2 sm:bottom-8 sm:left-8 lg:left-12"
          >
            {STORY_STAGES.map((stage, index) => (
              <span
                aria-hidden="true"
                className="h-1 w-6 rounded-full bg-[#9bc6b6] opacity-40 sm:w-10"
                key={stage.label}
                ref={(element) => {
                  if (element) progressRefs.current[index] = element
                }}
              />
            ))}
          </div>
        )}

        <div
          className={`car-story-copy pointer-events-none absolute z-10 ${
            reducedMotion ? 'bottom-20 left-5 right-5 sm:left-8 sm:right-auto' : 'bottom-16 left-5 right-5 sm:bottom-20 sm:left-8 sm:right-auto lg:left-12'
          }`}
        >
          {STORY_STAGES.map((stage, index) => (
            <article
              aria-hidden={
                !reducedMotion && (mode === 'explore' || index !== 0)
              }
              className={`car-story-panel max-w-xl ${
                mode === 'explore' ||
                reducedMotion && selectedStage !== index ? 'hidden' : ''
              }`}
              key={stage.label}
              ref={(element) => {
                if (element) panelRefs.current[index] = element
              }}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a3c6b6] sm:text-[10px]">
                {stage.label}
              </p>
              <h2 className="font-display mt-3 text-3xl leading-tight tracking-[-0.035em] text-[#f4f2e9] sm:text-5xl">
                {stage.title}
              </h2>
              <p className="mt-3 max-w-lg text-xs leading-6 text-slate-300 sm:text-sm sm:leading-7">
                {stage.description}
              </p>
            </article>
          ))}
        </div>

        {reducedMotion && mode === 'story' && (
          <nav
            aria-label="Story stage selector"
            className="absolute bottom-5 right-5 z-20 flex max-w-[48%] flex-wrap justify-end gap-2 sm:right-8 lg:right-12"
          >
            {STORY_STAGES.map((stage, index) => (
              <button
                aria-label={`Show ${stage.label}`}
                aria-pressed={selectedStage === index}
                className="rounded-sm bg-[#17634d] px-2.5 py-2 text-[9px] font-semibold text-white transition-colors hover:bg-[#237a60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9bc6b6] sm:px-3"
                key={stage.label}
                onClick={() => selectReducedMotionStage(index)}
                type="button"
              >
                {String(index + 1).padStart(2, '0')}
              </button>
            ))}
          </nav>
        )}

        {mode === 'explore' && (
          <div className="pointer-events-none absolute bottom-5 left-5 z-10 max-w-56 rounded-sm border border-white/10 bg-[#080d18]/80 px-3 py-2 text-[10px] leading-5 text-slate-300 sm:bottom-8 sm:left-8 sm:max-w-xs sm:px-4">
            Drag or swipe to orbit · Scroll or pinch to zoom
          </div>
        )}
      </div>

      {mode === 'explore' && !reducedMotion && (
        <div className="explore-chapters">
          {STORY_STAGES.map((stage) => (
            <article
              className="explore-chapter mx-auto flex w-full max-w-7xl flex-col justify-center px-5 py-12 sm:px-8 lg:px-12"
              key={stage.label}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a3c6b6]">
                {stage.label}
              </p>
              <h2 className="font-display mt-4 max-w-2xl text-3xl tracking-[-0.035em] text-[#f4f2e9] sm:text-5xl">
                {stage.title}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                {stage.description}
              </p>
            </article>
          ))}
          <div className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 lg:px-12">
            <CameraGuide />
          </div>
        </div>
      )}

      {reducedMotion && mode === 'story' && (
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <CameraGuide />
        </div>
      )}
    </section>
  )
}

export default CarStory
