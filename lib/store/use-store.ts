'use client';

import { create } from 'zustand';
import { Anime, Category, Episode, FilterState, DashboardStats, AnimeIndex } from '@/lib/types';

// ==========================================
// Anime Store
// ==========================================
interface AnimeStore {
  animes: Anime[];
  loading: boolean;
  error: string | null;
  setAnimes: (animes: Anime[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAnimeStore = create<AnimeStore>((set) => ({
  animes: [],
  loading: false,
  error: null,
  setAnimes: (animes) => set({ animes, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// ==========================================
// Category Store
// ==========================================
interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,
  error: null,
  setCategories: (categories) => set({ categories, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// ==========================================
// Episode Store
// ==========================================
interface EpisodeStore {
  episodes: Episode[];
  loading: boolean;
  error: string | null;
  setEpisodes: (episodes: Episode[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEpisodeStore = create<EpisodeStore>((set) => ({
  episodes: [],
  loading: false,
  error: null,
  setEpisodes: (episodes) => set({ episodes, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// ==========================================
// UI Store
// ==========================================
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
