import * as React from 'react'
import { Link, HeadFC } from 'gatsby'

const NotFoundPage = () => (
  <main className="relative min-h-screen overflow-hidden bg-bg text-fg">
    <div
      className="absolute inset-0 opacity-[0.10] bg-cover bg-center grayscale"
      style={{ backgroundImage: 'url(/images/hero-bg.png)' }}
    />
    <div
      className="absolute inset-0 grain-overlay pointer-events-none opacity-[0.07]"
      style={{ backgroundImage: 'url(/images/grain.png)', backgroundRepeat: 'repeat', backgroundSize: '256px 256px' }}
    />

    <section className="relative z-10 min-h-screen max-w-[1320px] mx-auto px-5 md:px-12 py-10 md:py-14 flex flex-col">
      <Link to="/" className="self-start">
        <img src="/images/pvr-logo-white.svg" alt="Public Vinyl Radio" width={160} height={50} />
      </Link>

      <div className="flex-1 grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-12 py-16 md:py-24">
        <div>
          <p className="text-xs tracking-[2px] uppercase text-fg/50 mb-6">Signal lost · 404</p>
          <h1 className="leading-[0.85] text-fg" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(76px, 15vw, 190px)', letterSpacing: '-0.06em' }}>
            OUT OF<br />THE GROOVE
          </h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-fg/60">
            This frequency has drifted off the dial. Try another side of Public Vinyl Radio.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/" className="text-xs tracking-[1px] uppercase px-5 py-3 bg-fg text-bg hover:bg-fg/80 transition-colors">Back home</Link>
            <Link to="/shows" className="text-xs tracking-[1px] uppercase px-5 py-3 border border-fg/30 text-fg/75 hover:border-fg hover:text-fg transition-colors">Browse shows</Link>
            <Link to="/events" className="text-xs tracking-[1px] uppercase px-5 py-3 border border-fg/30 text-fg/75 hover:border-fg hover:text-fg transition-colors">Find an event</Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[430px] aspect-square flex items-center justify-center" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border border-fg/15" />
          <div className="absolute inset-[6%] rounded-full border border-fg/10" />
          <div className="absolute inset-[12%] rounded-full border border-fg/10" />
          <div className="absolute inset-[19%] rounded-full border border-fg/10" />
          <div className="absolute inset-[27%] rounded-full border border-fg/10" />
          <div className="absolute inset-[35%] rounded-full bg-fg text-bg flex items-center justify-center">
            <span className="text-xs tracking-[2px] uppercase">Side 404</span>
          </div>
          <div className="absolute -right-2 md:-right-8 top-[12%] w-[45%] h-px bg-fg/60 rotate-[28deg] origin-right" />
          <div className="absolute -right-2 md:-right-8 top-[12%] w-3 h-3 rounded-full bg-fg" />
        </div>
      </div>

      <p className="text-xs tracking-[1px] uppercase text-fg/35">Public Vinyl Radio · Seattle, WA</p>
    </section>
  </main>
)

export default NotFoundPage

export const Head: HeadFC = () => <title>Signal lost · Public Vinyl Radio</title>
