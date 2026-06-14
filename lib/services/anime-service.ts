import fs from 'fs/promises';
import path from 'path';
import { Anime, AnimeIndex } from '@/lib/types';
import { DATA_DIR, ANIME_DIR, ANIMES_JSON } from '@/lib/constants';

// ==========================================
// Anime File System Service
// ==========================================

function getAnimeDir(slug: string): string {
  return path.join(ANIME_DIR, slug);
}

function getInfoPath(slug: string): string {
  return path.join(getAnimeDir(slug), 'info.json');
}

function getEpisodesPath(slug: string): string {
  return path.join(getAnimeDir(slug), 'episodes.json');
}

// Ensure data directories exist
async function ensureDirectories(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(ANIME_DIR, { recursive: true });
}

// Get all anime from animes.json index
export async function getAllAnime(): Promise<Anime[]> {
  try {
    await ensureDirectories();
    const data = await fs.readFile(ANIMES_JSON, 'utf-8');
    const index: AnimeIndex[] = JSON.parse(data);
    // Load full info for each anime
    const animes: Anime[] = [];
    for (const item of index) {
      try {
        const infoData = await fs.readFile(getInfoPath(item.slug), 'utf-8');
        animes.push(JSON.parse(infoData));
      } catch {
        // Skip if info file missing
      }
    }
    return animes;
  } catch {
    return [];
  }
}

// Get single anime by slug
export async function getAnime(slug: string): Promise<Anime | null> {
  try {
    const data = await fs.readFile(getInfoPath(slug), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Create new anime
export async function createAnime(anime: Anime): Promise<Anime> {
  await ensureDirectories();

  const animeDir = getAnimeDir(anime.slug);
  await fs.mkdir(animeDir, { recursive: true });

  const now = new Date().toISOString();
  const newAnime: Anime = {
    ...anime,
    id: anime.id || anime.slug,
    createdAt: now,
    updatedAt: now,
  };

  // Write info.json
  await fs.writeFile(getInfoPath(anime.slug), JSON.stringify(newAnime, null, 2));

  // Write empty episodes.json
  await fs.writeFile(getEpisodesPath(anime.slug), JSON.stringify([], null, 2));

  // Rebuild index
  await rebuildAnimeIndex();

  return newAnime;
}

// Update existing anime
export async function updateAnime(slug: string, updates: Partial<Anime>): Promise<Anime | null> {
  const existing = await getAnime(slug);
  if (!existing) return null;

  const oldSlug = slug;
  const newSlug = updates.slug || oldSlug;

  const updated: Anime = {
    ...existing,
    ...updates,
    slug: newSlug,
    updatedAt: new Date().toISOString(),
  };

  // If slug changed, move directory
  if (oldSlug !== newSlug) {
    const oldDir = getAnimeDir(oldSlug);
    const newDir = getAnimeDir(newSlug);
    await fs.mkdir(newDir, { recursive: true });

    // Move episodes.json
    try {
      await fs.rename(getEpisodesPath(oldSlug), getEpisodesPath(newSlug));
    } catch {
      await fs.writeFile(getEpisodesPath(newSlug), JSON.stringify([], null, 2));
    }

    // Write new info.json
    await fs.writeFile(getInfoPath(newSlug), JSON.stringify(updated, null, 2));

    // Remove old directory
    try {
      await fs.rm(oldDir, { recursive: true, force: true });
    } catch {
      // Ignore if already removed
    }
  } else {
    await fs.writeFile(getInfoPath(slug), JSON.stringify(updated, null, 2));
  }

  await rebuildAnimeIndex();
  return updated;
}

// Delete anime
export async function deleteAnime(slug: string): Promise<boolean> {
  const animeDir = getAnimeDir(slug);
  try {
    await fs.rm(animeDir, { recursive: true, force: true });
    await rebuildAnimeIndex();
    return true;
  } catch {
    return false;
  }
}

// Rebuild anime index from all anime directories
export async function rebuildAnimeIndex(): Promise<void> {
  await ensureDirectories();

  let entries: AnimeIndex[] = [];

  try {
    const dirs = await fs.readdir(ANIME_DIR);

    for (const dir of dirs) {
      const infoPath = path.join(ANIME_DIR, dir, 'info.json');
      const episodesPath = path.join(ANIME_DIR, dir, 'episodes.json');

      try {
        const infoData = await fs.readFile(infoPath, 'utf-8');
        const anime: Anime = JSON.parse(infoData);

        let episodeCount = 0;
        try {
          const episodesData = await fs.readFile(episodesPath, 'utf-8');
          const episodes = JSON.parse(episodesData);
          episodeCount = Array.isArray(episodes) ? episodes.length : 0;
        } catch {
          episodeCount = 0;
        }

        entries.push({
          id: anime.id,
          slug: anime.slug,
          title: anime.title,
          cover: anime.cover,
          status: anime.status,
          categories: anime.categories,
          episodeCount,
          featured: anime.featured,
          trending: anime.trending,
          createdAt: anime.createdAt,
          updatedAt: anime.updatedAt,
        });
      } catch {
        // Skip invalid entries
      }
    }
  } catch {
    // Directory might not exist yet
  }

  // Sort by updatedAt descending
  entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  await fs.writeFile(ANIMES_JSON, JSON.stringify(entries, null, 2));
}
