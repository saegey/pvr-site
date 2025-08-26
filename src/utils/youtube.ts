export const youTubeMaxResThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

export const youTubeHQThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export const getYouTubeThumbFallback = (id: string) => youTubeHQThumb(id);
