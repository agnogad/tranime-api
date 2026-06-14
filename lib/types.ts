// ==========================================
// Core Types for Anime CMS
// ==========================================

export interface StreamingProvider {
  provider: string;
  embedUrl: string;
  quality: string;
  default: boolean;
}

export interface Episode {
  episode: number;
  title: string;
  description: string;
  duration: string;
  releaseDate: string;
  thumbnail: string;
  streams: StreamingProvider[];
}

export interface Category {
  slug: string;
  name: string;
}

export type AnimeStatus = 'ongoing' | 'completed';

export interface Anime {
  id: string;
  slug: string;
  title: string;
  titleTr: string;
  description: string;
  year: number;
  status: AnimeStatus;
  categories: string[];
  cover: string;
  banner: string;
  poster: string;
  rating: number;
  featured: boolean;
  trending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnimeIndex extends Omit<Anime, 'description' | 'titleTr' | 'banner' | 'poster' | 'rating' | 'createdAt' | 'updatedAt'> {
  episodeCount: number;
}

export interface DashboardStats {
  totalAnime: number;
  totalEpisodes: number;
  totalCategories: number;
  recentAnime: Anime[];
  recentUpdates: Anime[];
}

export interface SortOption {
  label: string;
  value: string;
}

export interface FilterState {
  search: string;
  status: AnimeStatus | 'all';
  category: string;
  sort: string;
  page: number;
  limit: number;
}
