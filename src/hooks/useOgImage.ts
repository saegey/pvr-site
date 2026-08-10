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
      # Only raster files get Sharp processing — SVGs can't be processed and
      # would emit "can't use childImageSharp" warnings.
      raster: allFile(
        filter: { sourceInstanceName: { eq: "images" }, extension: { ne: "svg" } }
      ) {
        nodes {
          relativePath
          publicURL
          childImageSharp {
            gatsbyImageData(width: 1200, height: 630)
          }
        }
      }
      # Every image (incl. SVGs) for publicURL fallback matching.
      all: allFile(filter: { sourceInstanceName: { eq: "images" } }) {
        nodes {
          relativePath
          publicURL
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
  const rasterNodes = data.raster.nodes as Array<{
    relativePath: string;
    publicURL?: string;
    childImageSharp?: { gatsbyImageData?: any };
  }>;
  const allNodes = data.all.nodes as Array<{
    relativePath: string;
    publicURL?: string;
  }>;

  const findIn = <T extends { relativePath: string }>(nodes: T[]) =>
    nodes.find((n) => n.relativePath === normalized) ||
    nodes.find((n) => n.relativePath.endsWith(normalized));

  // Prefer processed raster image for consistent OG dimensions.
  const raster = findIn(rasterNodes);
  if (raster?.childImageSharp?.gatsbyImageData) {
    const src = getSrc(raster.childImageSharp.gatsbyImageData) || fallback;
    return toAbsolute(src);
  }

  // Otherwise fall back to the raw file URL (covers SVGs).
  const any = raster || findIn(allNodes);
  if (any?.publicURL) return toAbsolute(any.publicURL);

  return toAbsolute(fallback);
}
