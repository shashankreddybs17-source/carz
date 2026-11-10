function ShowroomNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080d18]/90 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-8 lg:px-12"
      >
        <a
          aria-label="Apex Showroom home"
          className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f2e9] sm:text-base sm:tracking-[0.2em]"
          href="#top"
        >
          Apex<span className="text-[#82a99a]">.</span>
          <span className="ml-2 hidden text-[10px] font-medium tracking-[0.22em] text-slate-400 sm:inline">
            MOTORSPORT
          </span>
        </a>

        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-300 sm:gap-8 sm:text-sm">
          <a
            className="transition-colors hover:text-white"
            href="#story"
          >
            Explore
          </a>
          <a
            className="transition-colors hover:text-white"
            href="#specifications"
          >
            Specifications
          </a>
        </div>

        <a
          className="shrink-0 rounded-sm bg-[#17634d] px-2.5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#237a60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9bc6b6] sm:px-5 sm:text-xs sm:tracking-[0.12em]"
          href="#story"
        >
          Enter showroom
        </a>
      </nav>
    </header>
  )
}

export default ShowroomNavbar
