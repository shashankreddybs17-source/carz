import CarStory from '../components/CarStory.jsx'
import ShowroomFooter from '../components/ShowroomFooter.jsx'
import ShowroomNavbar from '../components/ShowroomNavbar.jsx'

function HomePage() {
  return (
    <div className="showroom-shell min-h-screen text-[#f4f2e9]" id="top">
      <ShowroomNavbar />

      <main>
        <CarStory />
        <section
          aria-labelledby="specifications-title"
          className="scroll-mt-20 border-t border-white/10 bg-[#0b111a]"
          id="specifications"
        >
          <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9bc6b6] sm:text-xs">
                Model notes
              </p>
              <h2
                className="font-display mt-4 text-3xl font-medium tracking-[-0.035em] text-[#f4f2e9] sm:text-5xl"
                id="specifications-title"
              >
                Form, without the guesswork.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                These notes describe only what is verifiable in the supplied
                3D asset. It does not include engineering or performance data.
              </p>
            </div>

            <dl className="mt-10 grid border-t border-white/10 sm:grid-cols-2 lg:mt-14">
              <div className="border-b border-white/10 py-6 sm:pr-8 lg:py-8">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94b7a8]">
                  Powertrain
                </dt>
                <dd className="mt-3 text-sm leading-6 text-slate-300">
                  Not specified in the supplied 3D model.
                </dd>
              </div>
              <div className="border-b border-white/10 py-6 sm:pl-8 lg:py-8">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94b7a8]">
                  Aerodynamics
                </dt>
                <dd className="mt-3 text-sm leading-6 text-slate-300">
                  Front- and rear-wing forms are represented in the model
                  geometry.
                </dd>
              </div>
              <div className="border-b border-white/10 py-6 sm:pr-8 lg:py-8">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94b7a8]">
                  Chassis
                </dt>
                <dd className="mt-3 text-sm leading-6 text-slate-300">
                  The asset includes a chassis mesh with supplied base-color
                  and metallic-roughness textures.
                </dd>
              </div>
              <div className="border-b border-white/10 py-6 sm:pl-8 lg:py-8">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94b7a8]">
                  Livery &amp; finish
                </dt>
                <dd className="mt-3 text-sm leading-6 text-slate-300">
                  Sponsor graphics are included in the body base-color
                  texture; independent paint selection would require separating
                  them in the source model.
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>

      <ShowroomFooter />
    </div>
  )
}

export default HomePage
