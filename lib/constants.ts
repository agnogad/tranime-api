export const PROVIDERS = [
  'StreamWish',
  'FileMoon',
  'VidHide',
  'DoodStream',
  'Fembed',
  'Gogoanime',
  'MyCloud',
  'Mp4Upload',
] as const;

export const QUALITIES = [
  '360p',
  '480p',
  '720p',
  '1080p',
  '2160p (4K)',
] as const;

export const ANIME_STATUS = [
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
] as const;

export const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Title A-Z', value: 'title-asc' },
  { label: 'Title Z-A', value: 'title-desc' },
  { label: 'Rating High-Low', value: 'rating-desc' },
  { label: 'Rating Low-High', value: 'rating-asc' },
  { label: 'Recently Updated', value: 'updated' },
] as const;

export const ITEMS_PER_PAGE = 12;

export const DATA_DIR = 'data';
export const ANIME_DIR = `${DATA_DIR}/anime`;
export const ANIMES_JSON = `${DATA_DIR}/animes.json`;
export const CATEGORIES_JSON = `${DATA_DIR}/categories.json`;

export const DEFAULT_COVER = '/placeholder-cover.jpg';
export const DEFAULT_POSTER = '/placeholder-poster.jpg';
