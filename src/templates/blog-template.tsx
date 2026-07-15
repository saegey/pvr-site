import React, { useState, useEffect } from 'react'
import SEO from '../components/seo'
import { MDXProvider } from '@mdx-js/react'
import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { format } from 'date-fns'
import { StaticImage } from 'gatsby-plugin-image'

const formatDate = (dateString: string) => format(new Date(dateString), 'MMMM d, yyyy')

const components = {
  StaticImage,
  Flex: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div style={{ display: 'flex' }} {...props}>{children}</div>
  ),
}

const BlogPostTemplate = ({ pageContext }: { pageContext: any }) => {
  const { title, date, content } = pageContext
  const [MDXComponent, setMDXComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    const doCompile = async () => {
      try {
        const compiled = await compile(content, {
          outputFormat: 'function-body',
          useDynamicImport: true,
          baseUrl: '/',
        })
        const result = await run(compiled, runtime as any)
        setMDXComponent(() => result.default)
      } catch (error) {
        console.error(error)
      }
    }
    doCompile()
  }, [content])

  return (
    <>
      <SEO title={`${title} | Public Vinyl Radio`} />
      <div className="max-w-[860px] mx-auto px-4 md:px-12 pt-16 pb-24">
        <p className="text-xs tracking-[1px] uppercase text-fg/35 mb-4">{formatDate(date)}</p>
        <h1
          className="text-fg leading-tight mb-10"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.5px' }}
        >
          {title}
        </h1>
        <div className="prose text-fg/75 text-sm leading-[1.8]">
          {MDXComponent ? (
            <MDXProvider components={components}>
              <MDXComponent />
            </MDXProvider>
          ) : (
            <p className="text-fg/35">Loading…</p>
          )}
        </div>
      </div>
    </>
  )
}

export default BlogPostTemplate
