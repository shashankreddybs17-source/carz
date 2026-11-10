function CameraGuide() {
  return (
    <aside
      aria-label="Camera controls"
      className="grid gap-5 rounded-sm border border-white/10 bg-[#101721]/80 p-5 sm:grid-cols-3 sm:gap-6 sm:p-6"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94b7a8]">
          Rotate
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Drag with your mouse, or swipe across the car.
        </p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94b7a8]">
          Zoom
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Scroll or use a touchpad; pinch on touchscreens.
        </p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94b7a8]">
          Reset view
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Select the button over the viewer to return to the original angle.
        </p>
      </div>
    </aside>
  )
}

export default CameraGuide
