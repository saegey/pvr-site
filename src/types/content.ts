// Shared content types for MDX nodes

export interface FrontmatterCoverImage {
  publicURL?: string;
  childImageSharp?: {
    gatsbyImageData?: any;
  };
}

export interface TrackItem {
  title?: string;
  artist?: string;
  year?: number;
}

export interface Frontmatter {
  template: string;
  title: string;
  description?: string;
  episode?: number;
  date?: string;
  tags?: string[];
  iframeSrc?: string;
  youtubeId?: string;
  appleMusicUrl?: string;
  spotifyId?: string;
  slug: string;
  coverImage?: FrontmatterCoverImage;
  tracklist?: TrackItem[];
  host?: string[];
  isActive?: boolean;
}

export interface MdxNode {
  id: string;
  frontmatter: Frontmatter;
  body: string;
  internal: {
    contentFilePath: string;
  };
}
