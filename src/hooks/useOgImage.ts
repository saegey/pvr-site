import { graphql, useStaticQuery } from "gatsby";
import { getSrc } from "gatsby-plugin-image";

// type Options = {
//   width?: number;
//   height?: number;
// };

export function useOgImageFromPath(path?: string) {
  // Static query: fetch all images so we can pick by prop (GraphQL can't take props)
  const data = useStaticQuery(graphql`
    query UseOgImage_AllImages {
      allFile(filter: { sourceInstanceName: { eq: "images" } }) {
        nodes {
          relativePath
          publicURL
          childImageSharp {
            gatsbyImageData(width: 1200, height: 630)
          }
        }
      }
      site {
        siteMetadata {
          siteUrl
          image
        }
      }
    }
  `);

  const siteUrl: string = (data.site.siteMetadata.siteUrl || "").replace(
    /\/$/,
    ""
  );
  const fallback: string = data.site.siteMetadata.image || "/default-og.png";

  // Helper to absolutize a URL path
  const toAbsolute = (src: string) =>
    src.startsWith("http")
      ? src
      : `${siteUrl}${src.startsWith("/") ? "" : "/"}${src}`;

  // If no path requested, return site fallback
  if (!path) return toAbsolute(fallback);

  // Normalize requested path: drop any leading directories like "images/" and leading slashes
  const normalized = path.replace(/^\/*/, "").replace(/^images\//, "");

  // Find by exact match, else by suffix (helps if caller included directories)
  const nodes = data.allFile.nodes as Array<{
    relativePath: string;
    publicURL?: string;
    childImageSharp?: { gatsbyImageData?: any };
  }>;
  const match =
    nodes.find((n) => n.relativePath === normalized) ||
    nodes.find((n) => n.relativePath.endsWith(normalized));

  if (!match) return toAbsolute(fallback);

  // Prefer processed image for consistent OG dimensions, else fall back to publicURL
  if (match.childImageSharp?.gatsbyImageData) {
    const src = getSrc(match.childImageSharp.gatsbyImageData) || fallback;
    return toAbsolute(src);
  }

  if (match.publicURL) return toAbsolute(match.publicURL);

  return toAbsolute(fallback);
}
