function ShowroomFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080d18]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <a
          className="font-semibold uppercase tracking-[0.18em] text-slate-200"
          href="#top"
        >
          Apex Showroom
        </a>
        <nav aria-label="Footer navigation" className="flex gap-6">
          <a className="transition-colors hover:text-white" href="#story">
            Explore
          </a>
          <a
            className="transition-colors hover:text-white"
            href="#specifications"
          >
            Specifications
          </a>
        </nav>
        <a
          className="max-w-md leading-5 transition-colors hover:text-slate-200"
          href="https://sketchfab.com/3d-models/aston-martin-formula-1-car-8db1dd4a65e8416c828a99b05be16c45"
          rel="noreferrer"
          target="_blank"
        >
          3D model by annabellecomstock · CC BY 4.0
        </a>
      </div>
    </footer>
  )
}

export default ShowroomFooter
