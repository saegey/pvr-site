import React from 'react'
import { graphql, Link } from 'gatsby'
import { format } from 'date-fns'
import SEO from '../components/seo'

interface BlogData {
  allMdx: {
    nodes: {
      id: string
      frontmatter: {
        title: string
        description: string
        slug: string
        date: string
      }
    }[]
  }
}

const BlogPage = ({ data }: { data: BlogData }) => {
  const posts = [...data.allMdx.nodes].sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  )

  return (
    <>
      <SEO
        title="Blog · Public Vinyl Radio"
        description="Behind the music — stories and notes from Public Vinyl Radio."
        url="https://publicvinylradio.com/blog"
      />
      <div className="max-w-[860px] mx-auto px-4 md:px-12 pt-16 pb-24">
        <p className="text-xs tracking-[2px] uppercase text-fg/40 mb-6">Blog</p>
        <h1
          className="text-fg leading-tight mb-14"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4vw, 52px)', letterSpacing: '-0.5px' }}
        >
          Behind the Music
        </h1>

        <div className="border-t border-fg/12">
          {posts.length === 0 && (
            <p className="text-sm text-fg/35 py-12">No posts yet.</p>
          )}
          {posts.map(node => (
            <div key={node.id} className="py-8 border-b border-fg/12">
              <p className="text-xs tracking-[1px] uppercase text-fg/35 mb-3">
                {format(new Date(node.frontmatter.date), 'MMMM d, yyyy')}
              </p>
              <h2
                className="text-fg leading-snug mb-2"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 3vw, 26px)' }}
              >
                {node.frontmatter.title}
              </h2>
              {node.frontmatter.description && (
                <p className="text-sm text-fg/55 leading-[1.7] mb-4 max-w-[560px]">
                  {node.frontmatter.description}
                </p>
              )}
              <Link
                to={`/blog/${node.frontmatter.slug}`}
                className="text-xs tracking-[1px] uppercase text-fg/50 hover:text-fg transition-colors"
              >
                Read More →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default BlogPage

export const query = graphql`
  query BlogPageQuery {
    allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { template: { eq: "blog" } } }
    ) {
      nodes {
        id
        frontmatter {
          title
          description
          slug
          date
        }
      }
    }
  }
`
