import React, { useState } from 'react'
import { graphql, Link, PageProps } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import SEO from '../components/seo'
import { formatDate } from '../utils/date'
import { youTubeHQThumb, youTubeMaxResThumb } from '../utils/youtube'

const PAGE_SIZE = 12

type Show = {
  id: string
  frontmatter: {
    title: string
    description: string
    slug: string
    date: string
    tags: string[]
    host: string[]
    youtubeId?: string
    coverImage?: { childImageSharp?: { gatsbyImageData?: IGatsbyImageData } }
  }
}

type DataProps = {
  allMdx: { nodes: Show[] }
  site: { siteMetadata: { siteUrl: string } }
}

export default function ShowsArchivePage({ data }: PageProps<DataProps>) {
  const [visible, setVisible] = useState(PAGE_SIZE)
  const shows = data.allMdx.nodes
  const visibleShows = shows.slice(0, visible)

  return (
    <>
      <SEO title="Show Archive" url={`${data.site.siteMetadata.siteUrl}/shows`} />
      <section className="max-w-[1320px] mx-auto px-4 md:px-12 pt-28 pb-20 md:pt-40">
        <p className="text-xs tracking-[2px] uppercase text-fg/45 mb-5">Public Vinyl Radio</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-fg/12 pb-8">
          <h1 className="text-fg leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 7vw, 82px)' }}>Show archive</h1>
          <p className="max-w-sm text-sm leading-relaxed text-fg/55">Recorded vinyl sets, track-by-track journeys, and live selections from PVR.</p>
        </div>

        <div className="mt-4 border-t border-b border-fg/12 py-4 flex justify-between text-xs tracking-[1px] text-fg/40">
          <span className="uppercase">All shows</span>
          <span>{Math.min(visible, shows.length)} of {shows.length}</span>
        </div>

        {visibleShows.map((show, index) => {
          const coverImageData = show.frontmatter.coverImage ? getImage(show.frontmatter.coverImage as any) : null
          return (
            <Link key={show.id} to={`/shows/${show.frontmatter.slug}`} className="group grid md:grid-cols-[40px_220px_1fr] gap-4 md:gap-8 py-6 border-b border-fg/12 hover:bg-fg/[0.03] transition-colors -mx-4 px-4">
              <span className="hidden md:block text-xs tabular-nums text-fg/30 pt-1">{String(index + 1).padStart(2, '0')}</span>
              <div className="aspect-video bg-fg/5 overflow-hidden">
                {show.frontmatter.youtubeId ? (
                  <img src={youTubeMaxResThumb(show.frontmatter.youtubeId)} alt={show.frontmatter.title} className="w-full h-full object-cover" loading="lazy" onError={(e) => { const image = e.currentTarget; image.onerror = null; image.src = youTubeHQThumb(show.frontmatter.youtubeId!) }} />
                ) : coverImageData ? (
                  <GatsbyImage image={coverImageData} alt={show.frontmatter.title} className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
                ) : null}
              </div>
              <div>
                <p className="text-xs tracking-[2px] uppercase text-fg/40">{formatDate(show.frontmatter.date)}</p>
                <h2 className="mt-3 text-fg leading-snug" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 34px)' }}>{show.frontmatter.title}</h2>
                {show.frontmatter.host?.length > 0 && <p className="mt-1 text-sm text-fg/55">with {show.frontmatter.host.join(', ')}</p>}
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg/50">{show.frontmatter.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(show.frontmatter.tags || []).map((tag) => <span key={tag} className="text-[11px] tracking-[1px] uppercase px-2 py-1 border border-fg/20 text-fg/55">{tag}</span>)}
                </div>
              </div>
            </Link>
          )
        })}

        {visible < shows.length && (
          <div className="flex justify-center mt-12">
            <button onClick={() => setVisible((count) => count + PAGE_SIZE)} className="text-xs tracking-[2px] uppercase px-8 py-4 border border-fg/20 text-fg/65 hover:border-fg/50 hover:text-fg transition-colors">Load more shows</button>
          </div>
        )}
      </section>
    </>
  )
}

export const query = graphql`
  query ShowsArchivePageQuery {
    site { siteMetadata { siteUrl } }
    allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: {
        frontmatter: { isActive: { eq: true } }
        parent: { internal: { description: { regex: "/content/shows/" } } }
      }
    ) {
      nodes {
        id
        frontmatter {
          title
          description
          slug
          date
          tags
          host
          youtubeId
          coverImage { childImageSharp { gatsbyImageData(width: 500, layout: CONSTRAINED, formats: [AUTO, WEBP]) } }
        }
      }
    }
  }
`
