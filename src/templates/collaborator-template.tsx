import React from "react";
import { graphql, Link, PageProps, HeadProps } from "gatsby";
import { GatsbyImage, getImage, IGatsbyImageData } from "gatsby-plugin-image";
import SEO from "../components/seo";
import { formatDate } from "../utils/date";
import { youTubeHQThumb } from "../utils/youtube";
import { hostBySlug } from "../data/hosts";

type Show = {
  id: string;
  frontmatter: {
    title: string;
    description: string;
    slug: string;
    date: string;
    tags: string[];
    host: string[];
    youtubeId?: string;
    coverImage?: { childImageSharp?: { gatsbyImageData?: IGatsbyImageData } };
  };
};

type DataProps = {
  shows: { nodes: Show[] };
  hostImage: {
    childImageSharp?: { gatsbyImageData?: IGatsbyImageData };
  } | null;
  site: { siteMetadata: { siteUrl: string } };
};

type Ctx = { slug: string; handle: string; image: string | null };

export default function CollaboratorPage({
  data,
  pageContext,
}: PageProps<DataProps, Ctx>) {
  const host = hostBySlug(pageContext.slug);
  const name = host?.name ?? pageContext.handle;
  const shows = data.shows.nodes;
  const avatar = data.hostImage && data.hostImage.childImageSharp ? getImage(data.hostImage as any) : null;

  const socials = [
    host?.website && { label: "Website", url: host.website },
    host?.instagram && { label: "Instagram", url: host.instagram },
    host?.youtube && { label: "YouTube", url: host.youtube },
    host?.soundcloud && { label: "SoundCloud", url: host.soundcloud },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <>

      <section className="max-w-[1320px] mx-auto px-4 md:px-12 pt-28 pb-20 md:pt-40">
        <Link
          to="/collaborators"
          className="text-xs tracking-[2px] uppercase text-fg/55 hover:text-fg transition-colors"
        >
          ← Collaborators
        </Link>

        <div className="mt-6 flex flex-col md:flex-row md:items-end gap-8 border-b border-fg/12 pb-10">
          {avatar && (
            <div className="w-[140px] h-[140px] rounded-full overflow-hidden grayscale bg-fg/5 shrink-0">
              <GatsbyImage
                image={avatar}
                alt={name}
                style={{ width: "100%", height: "100%" }}
                imgStyle={{ objectFit: "cover" }}
              />
            </div>
          )}

          <div>
            <h1
              className="text-fg leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 6vw, 72px)",
              }}
            >
              {name}
            </h1>
            {host?.bio && (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg/55">
                {host.bio}
              </p>
            )}
            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs tracking-[1px] uppercase text-fg/55 hover:text-fg transition-colors"
                  >
                    {s.label} →
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 border-b border-fg/12 py-4 flex justify-between text-xs tracking-[1px] text-fg/55">
          <span className="uppercase">Sets</span>
          <span>{shows.length}</span>
        </div>

        {shows.map((show, index) => {
          const cover = show.frontmatter.coverImage
            ? getImage(show.frontmatter.coverImage as any)
            : null;
          return (
            <Link
              key={show.id}
              to={`/shows/${show.frontmatter.slug}`}
              className="group grid md:grid-cols-[40px_220px_1fr] gap-4 md:gap-8 py-6 border-b border-fg/12 hover:bg-fg/[0.03] transition-colors -mx-4 px-4"
            >
              <span className="hidden md:block text-xs tabular-nums text-fg/55 pt-1">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="aspect-video bg-fg/5 overflow-hidden">
                {show.frontmatter.youtubeId ? (
                  <img
                    src={youTubeHQThumb(show.frontmatter.youtubeId)}
                    alt={show.frontmatter.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const image = e.currentTarget;
                      image.onerror = null;
                      image.src = `https://img.youtube.com/vi/${show.frontmatter.youtubeId}/mqdefault.jpg`;
                    }}
                  />
                ) : cover ? (
                  <GatsbyImage
                    image={cover}
                    alt={show.frontmatter.title}
                    className="w-full h-full"
                    imgStyle={{ objectFit: "cover" }}
                  />
                ) : null}
              </div>
              <div>
                <p className="text-xs tracking-[2px] uppercase text-fg/55">
                  {formatDate(show.frontmatter.date)}
                </p>
                <h2
                  className="mt-3 text-fg leading-snug"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(20px, 3vw, 30px)",
                  }}
                >
                  {show.frontmatter.title}
                </h2>
                {show.frontmatter.host?.length > 0 && (
                  <p className="mt-1 text-sm text-fg/55">
                    with {show.frontmatter.host.join(", ")}
                  </p>
                )}
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg/50 line-clamp-3">
                  {show.frontmatter.description}
                </p>
              </div>
            </Link>
          );
        })}

        {shows.length === 0 && (
          <p className="py-12 text-sm text-fg/50">No published sets yet.</p>
        )}
      </section>
    </>
  );
}

export const Head = ({ data, pageContext }: HeadProps<DataProps, Ctx>) => {
  const host = hostBySlug(pageContext.slug);
  const name = host?.name ?? pageContext.handle;
  return (
    <SEO
      title={`${name} · Public Vinyl Radio`}
      description={host?.bio || `Vinyl sets by ${name} on Public Vinyl Radio.`}
      url={`${data.site.siteMetadata.siteUrl}/collaborators/${pageContext.slug}`}
    />
  );
};

export const query = graphql`
  query CollaboratorPageQuery($handle: String!, $image: String) {
    site {
      siteMetadata {
        siteUrl
      }
    }
    shows: allMdx(
      sort: { frontmatter: { date: DESC } }
      filter: {
        frontmatter: { isActive: { eq: true }, host: { in: [$handle] } }
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
          coverImage {
            childImageSharp {
              gatsbyImageData(
                width: 500
                layout: CONSTRAINED
                formats: [AUTO, WEBP]
              )
            }
          }
        }
      }
    }
    hostImage: file(
      relativePath: { eq: $image }
      sourceInstanceName: { eq: "images" }
    ) {
      childImageSharp {
        gatsbyImageData(
          width: 280
          height: 280
          layout: FIXED
          formats: [AUTO, WEBP]
        )
      }
    }
  }
`;
