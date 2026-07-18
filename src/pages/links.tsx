import React from 'react'
import { graphql } from 'gatsby'
import { Link as GatsbyLink } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import InstagramIcon from '../icons/instagram.svg'
import YouTubeIcon from '../icons/youtube.svg'
import WebsiteIcon from '../icons/website.svg'
import MixcloudIcon from '../icons/mixcloud.svg'
import ShopIcon from '../icons/shop.svg'
import PVRLogo from '../icons/heads.svg'
import { format } from 'date-fns'
import { trackLinkClickDeduped } from '../utils/analytics'
import { youTubeMaxResThumb, youTubeHQThumb } from '../utils/youtube'

type LinkItem = {
  title: string
  url: string
  subtitle?: string
  svgIcon?: string
}

type Show = {
  id: string
  frontmatter: {
    slug: string
    title: string
    date: string
    host: string[]
    youtubeId?: string
    coverImage?: { childImageSharp?: { gatsbyImageData?: IGatsbyImageData } }
  }
}

type DataProps = {
  allDataYaml: { nodes: Array<{ links: LinkItem[] }> }
  shows: { nodes: Show[] }
  site: { siteMetadata: { description?: string } }
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  InstagramIcon,
  YouTubeIcon,
  WebsiteIcon,
  MixcloudIcon,
  ShopIcon,
}

export default function LinksPage({ data }: { data: DataProps }) {
  const items = data.allDataYaml.nodes?.[0]?.links ?? []
  const latest = (data.shows.nodes || []).slice(0, 6)
  const bio = data.site?.siteMetadata?.description || ''

  return (
    <div
      className="min-h-screen font-mono"
      style={{
        backgroundColor: 'rgb(11 11 10)',
        color: 'rgb(236 236 230)',
      }}
    >
      <div className="max-w-[480px] mx-auto px-5 pt-12 pb-20">

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <div style={{ background: 'rgb(236 236 230)', padding: '12px', display: 'inline-flex' }}>
            <PVRLogo width={56} height={56} aria-label="Public Vinyl Radio" style={{ color: 'rgb(11 11 10)' }} />
          </div>
        </div>

        {/* Wordmark */}
        <h1
          className="text-center leading-tight mb-3"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            letterSpacing: '2px',
            color: 'rgb(236 236 230)',
          }}
        >
          PUBLIC VINYL RADIO
        </h1>

        {/* Bio */}
        {bio && (
          <p
            className="text-center mb-8 leading-[1.7]"
            style={{ fontSize: '13px', color: 'rgb(236 236 230 / 0.55)' }}
          >
            {bio}
          </p>
        )}

        {/* Link buttons */}
        <nav className="flex flex-col gap-2 mb-10">
          {items.map((link, i) => {
            const SvgIcon = link.svgIcon ? iconMap[link.svgIcon] : null
            const isExternal = link.url.startsWith('http')
            return (
              <a
                key={i}
                href={link.url}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-center gap-2.5 py-3.5 px-4 border transition-colors duration-150"
                style={{
                  borderColor: 'rgb(236 236 230 / 0.2)',
                  color: 'rgb(236 236 230 / 0.75)',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgb(236 236 230 / 0.6)'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgb(236 236 230)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgb(236 236 230 / 0.2)'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgb(236 236 230 / 0.75)'
                }}
                onMouseDown={() =>
                  trackLinkClickDeduped({
                    linkText: link.title,
                    linkUrl: link.url,
                    linkType: isExternal ? 'external' : 'internal',
                    location: 'links_buttons',
                  })
                }
              >
                {SvgIcon && (
                  <SvgIcon
                    width={16}
                    height={16}
                    aria-hidden
                    style={{ color: 'rgb(236 236 230 / 0.5)' }}
                  />
                )}
                {link.title}
              </a>
            )
          })}
        </nav>

        {/* Latest Shows */}
        {latest.length > 0 && (
          <div>
            {/* Section header */}
            <div
              className="flex items-baseline justify-between pb-3 mb-0"
              style={{ borderBottom: '1px solid rgb(236 236 230 / 0.12)' }}
            >
              <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgb(236 236 230 / 0.4)' }}>
                Latest Shows
              </span>
            </div>

            {latest.map((show, i) => {
              const coverImageData = show.frontmatter.coverImage
                ? getImage(show.frontmatter.coverImage as any)
                : null

              return (
                <GatsbyLink
                  key={show.id}
                  to={`/shows/${show.frontmatter.slug}`}
                  className="flex gap-3 py-4 -mx-1 px-1 transition-colors duration-150"
                  style={{ borderBottom: '1px solid rgb(236 236 230 / 0.08)' }}
                  onMouseDown={() =>
                    trackLinkClickDeduped({
                      linkText: show.frontmatter.title,
                      linkUrl: `/shows/${show.frontmatter.slug}`,
                      linkType: 'internal',
                      location: 'latest_shows',
                    })
                  }
                >
                  {/* Index */}
                  <span
                    className="shrink-0 tabular-nums pt-0.5"
                    style={{ fontSize: '11px', color: 'rgb(236 236 230 / 0.25)', width: '18px' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Thumbnail */}
                  <div
                    className="shrink-0 overflow-hidden grayscale"
                    style={{ width: '72px', aspectRatio: '16/9', background: 'rgb(236 236 230 / 0.05)' }}
                  >
                    {show.frontmatter.youtubeId ? (
                      <img
                        src={youTubeMaxResThumb(show.frontmatter.youtubeId)}
                        alt={show.frontmatter.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={e => {
                          const t = e.currentTarget as HTMLImageElement
                          t.onerror = null
                          t.src = youTubeHQThumb(show.frontmatter.youtubeId!)
                        }}
                      />
                    ) : coverImageData ? (
                      <GatsbyImage
                        image={coverImageData}
                        alt={show.frontmatter.title}
                        className="w-full h-full"
                        imgStyle={{ objectFit: 'cover' }}
                      />
                    ) : null}
                  </div>

                  {/* Meta */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      className="leading-snug truncate"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        color: 'rgb(236 236 230)',
                      }}
                    >
                      {show.frontmatter.title}
                    </p>
                    <p
                      className="mt-0.5 truncate"
                      style={{ fontSize: '11px', color: 'rgb(236 236 230 / 0.4)' }}
                    >
                      {format(new Date(show.frontmatter.date), 'MMM d, yyyy')}
                      {show.frontmatter.host?.length > 0 && (
                        <> · {show.frontmatter.host.join(', ')}</>
                      )}
                    </p>
                  </div>
                </GatsbyLink>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export const query = graphql`
  query LinksLinktreePageQuery {
    site {
      siteMetadata {
        description
      }
    }
    allDataYaml {
      nodes {
        links {
          title
          url
          subtitle
          svgIcon
        }
      }
    }
    shows: allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: {
        frontmatter: { isActive: { eq: true } }
        parent: { internal: { description: { regex: "/content/shows/" } } }
      }
      limit: 6
    ) {
      nodes {
        id
        frontmatter {
          slug
          title
          date
          host
          youtubeId
          isActive
          coverImage {
            childImageSharp {
              gatsbyImageData(width: 300, layout: CONSTRAINED, formats: [AUTO, WEBP])
            }
          }
        }
      }
    }
  }
`
