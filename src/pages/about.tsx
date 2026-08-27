import React from 'react'
import { graphql } from 'gatsby'
import { StaticImage } from 'gatsby-plugin-image'
import SEO from '../components/seo'
import { useOgImageFromPath } from '../hooks/useOgImage'

type Person = {
  name: string
  role: string
  bio?: string
  website: string | null
  image: React.ReactNode
}

const CORE: Person[] = [
  {
    name: 'Adam',
    role: 'Founder · Vinyl Selector · Editor',
    website: 'http://saegey.com',
    image: (
      <StaticImage
        src="../images/DSC_0851.jpeg"
        alt="Adam Saegebarth"
        placeholder="blurred"
        formats={['auto', 'webp']}
        width={60}
        height={60}
        style={{ borderRadius: '50%', display: 'block' }}
        imgStyle={{ objectFit: 'cover', borderRadius: '50%' }}
      />
    ),
  },
  {
    name: 'Scarlett',
    role: 'Photography · Social',
    website: null,
    image: (
      <StaticImage
        src="../images/DSC00586.jpeg"
        alt="Scarlett Saegebarth"
        placeholder="blurred"
        formats={['auto', 'webp']}
        width={60}
        height={60}
        style={{ borderRadius: '50%', display: 'block' }}
        imgStyle={{ objectFit: 'cover', borderRadius: '50%' }}
      />
    ),
  },
]

const COLLABORATORS: Person[] = [
  {
    name: 'Ben',
    role: 'Collaborator · Vinyl Selector',
    website: 'https://www.benschauland.com',
    image: (
      <StaticImage
        src="../images/DSC00661.jpeg"
        alt="Ben Schauland"
        placeholder="blurred"
        formats={['auto', 'webp']}
        width={60}
        height={60}
        style={{ borderRadius: '50%', display: 'block' }}
        imgStyle={{ objectFit: 'cover', borderRadius: '50%' }}
      />
    ),
  },
]

const PersonRow = ({ person }: { person: Person }) => (
  <div className="py-8 border-b border-fg/12">
    {/* Mobile: photo + name/role inline, bio below */}
    <div className="flex items-start gap-4 mb-4 md:hidden">
      <div className="w-[48px] h-[48px] rounded-full overflow-hidden shrink-0 grayscale">
        {person.image}
      </div>
      <div className="pt-1 min-w-0">
        <p
          className="text-fg leading-snug"
          style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}
        >
          {person.name}
        </p>
        <p className="text-xs tracking-[1px] uppercase text-fg/55 mt-1">{person.role}</p>
      </div>
    </div>
    {person.bio && (
      <p className="font-text text-[15px] text-fg/65 leading-[1.7] mb-3 md:hidden">{person.bio}</p>
    )}
    {person.website && (
      <a
        href={person.website}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs tracking-[1px] uppercase text-fg/55 hover:text-fg transition-colors md:hidden"
      >
        Website →
      </a>
    )}

    {/* Desktop: photo · name/role (+ optional bio) · website */}
    <div
      className="hidden md:grid items-center gap-6"
      style={{ gridTemplateColumns: '60px 1fr auto' }}
    >
      <div className="w-[60px] h-[60px] rounded-full overflow-hidden shrink-0 grayscale">
        {person.image}
      </div>
      <div>
        <p
          className="text-fg leading-snug"
          style={{ fontFamily: 'var(--font-display)', fontSize: '20px' }}
        >
          {person.name}
        </p>
        <p className="text-xs tracking-[1px] uppercase text-fg/55 mt-1">{person.role}</p>
        {person.bio && (
          <p className="font-text text-[15px] text-fg/65 leading-[1.7] mt-2 max-w-[520px]">{person.bio}</p>
        )}
      </div>
      {person.website && (
        <a
          href={person.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs tracking-[1px] uppercase text-fg/55 hover:text-fg transition-colors whitespace-nowrap"
        >
          Website →
        </a>
      )}
    </div>
  </div>
)

const AboutPage = () => {
  return (
    <>

      {/* ── Header band ── */}
      <div className="relative overflow-hidden">
        {/* Grunge texture background — tiled, theme-aware */}
        <div className="hero-grunge absolute inset-0 pointer-events-none" style={{ opacity: 0.55 }} aria-hidden="true" />

        <div className="relative max-w-[1320px] mx-auto px-4 md:px-12 pt-16 pb-12">
        <div className="flex flex-col-reverse md:grid md:gap-12" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)' }}>
          {/* Left: eyebrow pinned top, headline pinned bottom (frames the photo) */}
          <div className="flex flex-col justify-between mt-8 md:mt-0">
            <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-6 md:mb-0">About</p>
            <h1
              className="text-fg leading-[1.05]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 5.5vw, 78px)',
                letterSpacing: '-0.5px',
              }}
            >
              The future is analog.
            </h1>
          </div>

          {/* Right: framed photo — the mat + border separate it from the grunge bg */}
          <div className="bg-bg border border-fg/25 p-2 md:p-3 shadow-md">
            <div className="overflow-hidden grayscale w-full" style={{ aspectRatio: '4/3' }}>
              <StaticImage
                src="../images/DSC00847.jpg"
                alt="Public Vinyl Radio"
                placeholder="blurred"
                formats={['auto', 'webp']}
                style={{ width: '100%', height: '100%' }}
                imgStyle={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Full-bleed rule under the hero */}
      <div className="border-t border-fg/12" aria-hidden="true" />

      {/* ── Intro ── */}
      <div className="max-w-[820px] mx-auto px-4 md:px-12 py-12">
        <p className="font-text text-lg text-fg/80 leading-[1.8]">
          100% vinyl, start to finish. We dig for the records, build the systems that play
          them, and put on the music that moves us — global rhythms, deep grooves, no filler.
        </p>
      </div>

      {/* ── The Sound ── */}
      <div className="border-t border-fg/12" aria-hidden="true" />
      <div className="max-w-[820px] mx-auto px-4 md:px-12 py-12">
        <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-4">The Sound</p>
        <p className="font-text text-[15px] text-fg/70 leading-[1.8]">
          We play records because they're alive — the pops, the hiss, the imperfections that
          make a set breathe. Everything runs through custom-built speakers and a rotary mixer,
          tuned for feel, not for volume. Hi-fi warmth over a predictable PA stack.
        </p>
      </div>

      {/* ── DIY to the Core ── */}
      <div className="border-t border-fg/12" aria-hidden="true" />
      <div className="max-w-[820px] mx-auto px-4 md:px-12 py-12">
        <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-4">DIY to the Core</p>
        <p className="font-text text-[15px] text-fg/70 leading-[1.8]">
          Public Vinyl Radio is a vinyl collective, DIY to the bone. We build our own speakers,
          cut our own merch, print our own flyers, make our own art. The door's open to selectors
          who dig the same.
        </p>
      </div>

      {/* ── The People Behind It ── */}
      <div className="border-t border-fg/12" aria-hidden="true" />
      <div className="max-w-[820px] mx-auto px-4 md:px-12 pt-6 mb-24">
        <div className="mb-2">
          <p className="text-xs tracking-[2px] uppercase text-fg/55">The People Behind It</p>
        </div>

        {CORE.map((person) => (
          <PersonRow key={person.name} person={person} />
        ))}

        {/* ── Collaborators ── */}
        <div className="pt-10 mb-2">
          <p className="text-xs tracking-[2px] uppercase text-fg/55">Collaborators</p>
        </div>

        {COLLABORATORS.map((person) => (
          <PersonRow key={person.name} person={person} />
        ))}
      </div>

      {/* ── Collaborate CTA ── */}
      <div className="max-w-[820px] mx-auto px-4 md:px-12 mb-24">
        <div className="border border-fg/16 p-8 md:p-12">
          <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-4">Collaborate</p>
          <h2
            className="text-fg mb-4 leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 3vw, 36px)',
              letterSpacing: '-0.5px',
            }}
          >
            Play With Us
          </h2>
          <p className="font-text text-[15px] text-fg/65 leading-[1.7] mb-8 max-w-[480px]">
            Vinyl selector with a crate worth hearing? We're building a home for analog sound
            and global rhythms. Bring a set.
          </p>
          <a
            href="mailto:adam.saegebarth@gmail.com?subject=PVR%20Collab"
            className="inline-block text-xs tracking-[2px] uppercase px-8 py-4 border border-fg/30 text-fg/70 hover:border-fg/60 hover:text-fg transition-colors duration-150"
          >
            Send a Set
          </a>
        </div>
      </div>
    </>
  )
}

export default AboutPage

export const Head = () => {
  const ogImage = useOgImageFromPath('Scan167279.jpeg')
  return (
    <SEO
      title="About · Public Vinyl Radio"
      description="Public Vinyl Radio — a DIY vinyl collective. 100% analog sets, custom sound systems, global rhythms. The future is analog."
      url="https://publicvinylradio.com/about"
      image={ogImage}
    />
  )
}

export const query = graphql`
  query AboutPageQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
