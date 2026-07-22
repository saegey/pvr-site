import React from 'react'
import { graphql } from 'gatsby'
import SEO from '../components/seo'

type AssetFile = {
  id: string
  name: string
  extension: string
  publicURL: string
}

// Group files by matching basename, pair PNG+SVG together
const groupByBasename = (files: AssetFile[]) => {
  const map = new Map<string, { name: string; files: AssetFile[] }>()
  for (const f of files) {
    const existing = map.get(f.name)
    if (existing) {
      existing.files.push(f)
    } else {
      map.set(f.name, { name: f.name, files: [f] })
    }
  }
  return Array.from(map.values())
}

const isBlackLogo = (name: string) =>
  name.toLowerCase().includes('blk') || name.toLowerCase().includes('black')

const friendlyName = (name: string) => {
  if (name === 'PVR LOGO') return 'Logo — White'
  if (name === 'PVR LOGO WHITE') return 'Logo — White (Alt)'
  if (name === 'PVR LOGO_BLK') return 'Logo — Black'
  if (name === 'PVR-Logo-Landcape') return 'Landscape Logo — White'
  if (name === 'PVR-Logo-Landcape-BLK') return 'Landscape Logo — Black'
  if (name === 'PVR-Logo-Landcape-short') return 'Compact Landscape — White'
  if (name === 'PVR-landscape-short-BLK') return 'Compact Landscape — Black'
  return name
}

const SECTIONS = [
  {
    label: 'Icon Logo',
    names: ['PVR LOGO', 'PVR LOGO WHITE', 'PVR LOGO_BLK'],
  },
  {
    label: 'Landscape Logo',
    names: ['PVR-Logo-Landcape', 'PVR-Logo-Landcape-BLK'],
  },
  {
    label: 'Compact Landscape Logo',
    names: ['PVR-Logo-Landcape-short', 'PVR-landscape-short-BLK'],
  },
]

const AssetRow = ({ group }: { group: { name: string; files: AssetFile[] } }) => {
  const isDark = !isBlackLogo(group.name)
  const previewFile =
    group.files.find(f => f.extension === 'svg') ||
    group.files.find(f => f.extension === 'png') ||
    group.files[0]

  // Sort: SVG first, then PNG
  const sortedFiles = [...group.files].sort((a, b) => {
    const order = ['svg', 'png', 'jpg']
    return order.indexOf(a.extension) - order.indexOf(b.extension)
  })

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-6 border-b border-fg/10">
      {/* Preview */}
      <div
        className="w-full sm:w-[180px] sm:shrink-0 flex items-center justify-center"
        style={{
          height: '120px',
          backgroundColor: isDark ? 'rgb(11 11 10)' : 'rgb(225 222 215)',
          border: isDark ? '1px solid rgba(236,236,230,0.12)' : '1px solid rgba(11,11,10,0.12)',
          padding: '20px',
        }}
      >
        <img
          src={previewFile.publicURL}
          alt={friendlyName(group.name)}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Info + Downloads */}
      <div className="flex flex-col justify-center gap-3 flex-1">
        <p className="text-sm text-fg/90" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
          {friendlyName(group.name)}
        </p>
        <div className="flex gap-2">
          {sortedFiles.map(f => (
            <a
              key={f.id}
              href={f.publicURL}
              download
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 border border-fg/20 hover:border-fg/50 transition-colors text-fg/60 hover:text-fg"
            >
              <span className="text-[10px] tracking-[1.5px] uppercase font-medium">
                {f.extension.toUpperCase()}
              </span>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="opacity-50">
                <path d="M6 1v7M3 6l3 3 3-3M1 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

const PressPage = ({ data }: { data: { allFile: { nodes: AssetFile[] } } }) => {

  const files: AssetFile[] = data.allFile.nodes
  const groups = groupByBasename(files)

  const getGroupsBySection = (names: string[]) =>
    names
      .map(n => groups.find(g => g.name === n))
      .filter((g): g is NonNullable<typeof g> => !!g)

  return (
    <>
      <SEO
        title="Press Kit · Public Vinyl Radio"
        description="Download logos and press assets for Public Vinyl Radio."
        url="https://publicvinylradio.com/press"
      />

      <div className="max-w-[860px] mx-auto px-4 md:px-12 pt-16 pb-24">
        {/* Header */}
        <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-6">Press</p>
        <h1
          className="text-fg leading-tight mb-3"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.5px' }}
        >
          Press Kit
        </h1>
        <p className="text-sm text-fg/50 leading-[1.7] mb-2 max-w-[520px]">
          Logos available in SVG and PNG formats. Use on light or dark backgrounds as indicated.
          For additional assets or enquiries contact{' '}
          <a href="mailto:publicvinylradio@gmail.com" className="text-fg/70 hover:text-fg transition-colors underline underline-offset-2">
            publicvinylradio@gmail.com
          </a>
        </p>

        {/* Sections */}
        {SECTIONS.map(section => {
          const sectionGroups = getGroupsBySection(section.names)
          if (sectionGroups.length === 0) return null
          return (
            <div key={section.label} className="mt-12">
              <p className="text-xs tracking-[2px] uppercase text-fg/35 mb-1 pb-3 border-b border-fg/12">
                {section.label}
              </p>
              {sectionGroups.map(group => (
                <AssetRow key={group.name} group={group} />
              ))}
            </div>
          )
        })}

        {/* Any ungrouped files */}
        {(() => {
          const allSectionNames = SECTIONS.flatMap(s => s.names)
          const ungrouped = groups.filter(g => !allSectionNames.includes(g.name))
          if (ungrouped.length === 0) return null
          return (
            <div className="mt-12">
              <p className="text-xs tracking-[2px] uppercase text-fg/35 mb-1 pb-3 border-b border-fg/12">
                Other Assets
              </p>
              {ungrouped.map(group => (
                <AssetRow key={group.name} group={group} />
              ))}
            </div>
          )
        })()}
      </div>
    </>
  )
}

export default PressPage

export const query = graphql`
  query PressPageQuery {
    allFile(
      filter: {
        sourceInstanceName: { eq: "images" }
        relativeDirectory: { eq: "press" }
      }
      sort: { name: ASC }
    ) {
      nodes {
        id
        name
        extension
        publicURL
      }
    }
  }
`
