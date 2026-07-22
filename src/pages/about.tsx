import React from 'react'
import { graphql } from 'gatsby'
import { StaticImage } from 'gatsby-plugin-image'
import SEO from '../components/seo'
import { useOgImageFromPath } from '../hooks/useOgImage'

const TEAM = [
  {
    name: 'Adam Saegebarth',
    role: 'Founder · DJ · Editor',
    bio: 'Curates and mixes every PVR set with a global ear. Software engineer by trade, vinyl lifer by heart. Precision, flow, and feel.',
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
    name: 'Ben Schauland',
    role: 'DJ · Editor · Visual Collab',
    bio: "Designer and selector. Records and edits his own sets and helps shape the visual identity that matches PVR's eclectic energy.",
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
  {
    name: 'Scarlett Saegebarth',
    role: 'Photography · Social',
    bio: 'Captures the vibe behind the lens and carries it across platforms so the images resonate as strongly as the music.',
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

const AboutPage = () => {
  const ogImage = useOgImageFromPath('Scan167279.jpeg')

  return (
    <>
      <SEO
        title="About · Public Vinyl Radio"
        description="About Public Vinyl Radio — an all-vinyl platform for deep, unfiltered sounds. Meet the people behind PVR."
        url="https://publicvinylradio.com/about"
        image={ogImage}
      />

      {/* ── Header band ── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-12 pt-16 pb-12">
        <div className="flex flex-col-reverse md:grid md:gap-12" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)' }}>
          {/* Left: eyebrow + h1 */}
          <div className="flex flex-col justify-end mt-8 md:mt-0">
            <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-6">About</p>
            <h1
              className="text-fg leading-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(30px, 4.5vw, 60px)',
                letterSpacing: '-0.5px',
              }}
            >
              An analog platform in a digital world.
            </h1>
          </div>

          {/* Right: photo — full width on mobile, constrained on desktop */}
          <div className="overflow-hidden grayscale w-full" style={{ aspectRatio: '4/3' }}>
            <StaticImage
              src="../images/DSC00847.png"
              alt="Public Vinyl Radio"
              placeholder="blurred"
              formats={['auto', 'webp']}
              style={{ width: '100%', height: '100%' }}
              imgStyle={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* ── Mission ── */}
      <div className="max-w-[820px] mx-auto px-4 md:px-12 py-12 border-t border-fg/12">
        <p className="text-base text-fg/75 leading-[1.8]">
          100% vinyl DJ sets, recorded and edited by the people who spin them.
          We collect, we curate, we share our favorite music with the world.
        </p>
      </div>

      {/* ── Why Vinyl / What PVR Is ── */}
      <div className="max-w-[820px] mx-auto px-4 md:px-12">
        <div className="border-t border-fg/12 py-12">
          <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-4">Why Vinyl?</p>
          <p className="text-sm text-fg/65 leading-[1.8]">
            Vinyl isn't just a format — it's a philosophy. The ritual of selecting, cueing, and
            mixing records creates a tactile connection to the music. Every set has its own
            fingerprints: warm, raw, and human.
          </p>
        </div>

        <div className="border-t border-fg/12 py-12">
          <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-4">What PVR Is</p>
          <p className="text-sm text-fg/65 leading-[1.8]">
            Public Vinyl Radio is a channel for vinyl selectors. Adam and Ben both record and edit
            their own sets, and the platform exists to collaborate with other crate diggers and
            storytellers who share the love of analog sound.
          </p>
        </div>
      </div>

      {/* ── The People Behind It ── */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-12 mt-4 mb-24">
        <div className="border-t border-fg/12 pt-6 mb-2">
          <p className="text-xs tracking-[2px] uppercase text-fg/40">The People Behind It</p>
        </div>

        {TEAM.map((person) => (
          <div
            key={person.name}
            className="py-8 border-b border-fg/12"
          >
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
                <p className="text-xs tracking-[1px] uppercase text-fg/40 mt-1">{person.role}</p>
              </div>
            </div>
            <p className="text-sm text-fg/60 leading-[1.7] mb-3 md:hidden">{person.bio}</p>
            {person.website && (
              <a
                href={person.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-[1px] uppercase text-fg/40 hover:text-fg transition-colors md:hidden"
              >
                Website →
              </a>
            )}

            {/* Desktop: 4-column grid */}
            <div
              className="hidden md:grid items-start gap-8"
              style={{ gridTemplateColumns: '60px 1fr 2fr 100px' }}
            >
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden shrink-0 grayscale">
                {person.image}
              </div>
              <div className="pt-1">
                <p
                  className="text-fg leading-snug"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '20px' }}
                >
                  {person.name}
                </p>
                <p className="text-xs tracking-[1px] uppercase text-fg/40 mt-1">{person.role}</p>
              </div>
              <p className="text-sm text-fg/60 leading-[1.7] pt-1">{person.bio}</p>
              <div className="pt-1">
                {person.website ? (
                  <a
                    href={person.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs tracking-[1px] uppercase text-fg/40 hover:text-fg transition-colors whitespace-nowrap"
                  >
                    Website →
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Collaborate CTA ── */}
      <div className="max-w-[820px] mx-auto px-4 md:px-12 mb-24">
        <div className="border border-fg/16 p-8 md:p-12">
          <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-4">Collaborate</p>
          <h2
            className="text-fg mb-4 leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 3vw, 36px)',
              letterSpacing: '-0.5px',
            }}
          >
            Collaborate with Public Vinyl Radio
          </h2>
          <p className="text-sm text-fg/60 leading-[1.7] mb-8 max-w-[480px]">
            Are you a vinyl selector with a story to tell? We're building a home for analog mixes
            and global sounds.
          </p>
          <a
            href="mailto:adam.saegebarth@gmail.com?subject=PVR%20Collab"
            className="inline-block text-xs tracking-[2px] uppercase px-8 py-4 border border-fg/30 text-fg/70 hover:border-fg/60 hover:text-fg transition-colors duration-150"
          >
            Pitch Your Set
          </a>
        </div>
      </div>
    </>
  )
}

export default AboutPage

export const query = graphql`
  query AboutPageQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
