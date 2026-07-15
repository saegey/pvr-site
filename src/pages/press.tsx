import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import SEO from '../components/seo'
import { useOgImageFromPath } from '../hooks/useOgImage'

const PressPage = () => {
  const ogImage = useOgImageFromPath('DSC_0955.png')

  const data = useStaticQuery(graphql`
    query PressKitQuery {
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
          childImageSharp {
            gatsbyImageData(width: 400, height: 300, layout: CONSTRAINED, formats: [AUTO, WEBP])
          }
        }
      }
    }
  `)

  const pressFiles = data.allFile.nodes

  return (
    <>
      <SEO
        title="Press Kit · Public Vinyl Radio"
        description="Download high-resolution logos and press materials for Public Vinyl Radio"
        url="https://publicvinylradio.com/press"
        image={ogImage}
      />

      <div className="max-w-[1320px] mx-auto px-4 md:px-12 pt-16 pb-24">
        <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-6">Press</p>
        <h1
          className="text-fg leading-tight mb-4"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 52px)', letterSpacing: '-0.5px' }}
        >
          Press Kit
        </h1>
        <p className="text-sm text-fg/55 leading-[1.7] mb-14 max-w-[560px]">
          Download high-resolution logos and press materials for Public Vinyl Radio.
          All assets are available for press and promotional use.
        </p>

        <div className="border-t border-fg/12 pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pressFiles.map((file: any) => {
            const image = getImage(file.childImageSharp)
            const isImage = ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(file.extension.toLowerCase())

            return (
              <div key={file.id} className="border border-fg/12 p-5 flex flex-col gap-4">
                {isImage && image && (
                  <div className="overflow-hidden bg-fg/5">
                    <GatsbyImage image={image} alt={`${file.name} preview`} className="w-full" />
                  </div>
                )}
                {isImage && !image && file.extension === 'svg' && (
                  <div className="h-40 flex items-center justify-center bg-fg/5">
                    <img src={file.publicURL} alt={`${file.name} preview`} className="max-w-full max-h-full object-contain" />
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 mt-auto">
                  <span className="text-xs tracking-[1px] uppercase text-fg/55 truncate">
                    {file.name}.{file.extension}
                  </span>
                  <a
                    href={file.publicURL}
                    download
                    className="text-xs tracking-[2px] uppercase px-4 py-2 border border-fg/30 text-fg/70 hover:border-fg/60 hover:text-fg transition-colors shrink-0"
                  >
                    Download
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-fg/12 mt-16 pt-8">
          <p className="text-xs text-fg/40">
            For additional press materials or questions, contact{' '}
            <a href="mailto:adam.saegebarth@gmail.com" className="text-fg/60 hover:text-fg transition-colors">
              adam.saegebarth@gmail.com
            </a>
          </p>
        </div>
      </div>
    </>
  )
}

export default PressPage
