import React from 'react'
import { graphql, Link, PageProps } from 'gatsby'
import { GatsbyImage, getImage, IGatsbyImageData } from 'gatsby-plugin-image'
import SEO from '../components/seo'
import { HOSTS } from '../data/hosts'

type ImageNode = { relativePath: string; childImageSharp?: { gatsbyImageData?: IGatsbyImageData } }

type DataProps = {
  images: { nodes: ImageNode[] }
  shows: { nodes: { frontmatter: { host: string[] | null } }[] }
  site: { siteMetadata: { siteUrl: string } }
}

export default function CollaboratorsPage({ data }: PageProps<DataProps>) {
  const imageByPath = new Map(data.images.nodes.map((n) => [n.relativePath, n]))
  const countByHandle = new Map<string, number>()
  for (const show of data.shows.nodes) {
    for (const handle of show.frontmatter.host ?? []) {
      countByHandle.set(handle, (countByHandle.get(handle) ?? 0) + 1)
    }
  }

  return (
    <>
      <SEO
        title="Collaborators · Public Vinyl Radio"
        description="The selectors behind Public Vinyl Radio — DJs and collaborators, and the sets they've recorded."
        url={`${data.site.siteMetadata.siteUrl}/collaborators`}
      />

      <section className="max-w-[1320px] mx-auto px-4 md:px-12 pt-28 pb-24 md:pt-40">
        <p className="text-xs tracking-[2px] uppercase text-fg/55 mb-5">Public Vinyl Radio</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-fg/12 pb-8">
          <h1 className="text-fg leading-none" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 7vw, 82px)' }}>
            Collaborators
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-fg/55">
            The selectors behind PVR — and everyone who's brought a crate to the decks.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {HOSTS.map((host) => {
            const node = host.image ? imageByPath.get(host.image) : undefined
            const avatar = node ? getImage(node as any) : null
            const count = countByHandle.get(host.handle) ?? 0
            return (
              <Link key={host.slug} to={`/collaborators/${host.slug}`} className="group flex flex-col items-center text-center">
                <div className="w-[120px] h-[120px] rounded-full overflow-hidden grayscale bg-fg/5 group-hover:grayscale-0 transition-all">
                  {avatar ? (
                    <GatsbyImage image={avatar} alt={host.name} style={{ width: '100%', height: '100%' }} imgStyle={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-fg/40" style={{ fontFamily: 'var(--font-display)', fontSize: 40 }}>
                      {/*{host.name.charAt(0)}*/}
                    </div>
                  )}
                </div>
                <p className="mt-4 text-fg group-hover:text-fg" style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}>
                  {host.name}
                </p>
                <p className="mt-1 text-xs tracking-[1px] uppercase text-fg/50">
                  {count} {count === 1 ? 'set' : 'sets'}
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}

export const query = graphql`
  query CollaboratorsIndexQuery {
    site { siteMetadata { siteUrl } }
    images: allFile(filter: { sourceInstanceName: { eq: "images" }, relativePath: { glob: "collaborators/*" } }) {
      nodes {
        relativePath
        childImageSharp {
          gatsbyImageData(width: 240, height: 240, layout: FIXED, formats: [AUTO, WEBP])
        }
      }
    }
    shows: allMdx(
      filter: {
        frontmatter: { isActive: { eq: true } }
        parent: { internal: { description: { regex: "/content/shows/" } } }
      }
    ) {
      nodes { frontmatter { host } }
    }
  }
`
