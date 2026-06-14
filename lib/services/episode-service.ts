import fs from 'fs/promises';
import path from 'path';
import { Episode } from '@/lib/types';
import { ANIME_DIR } from '@/lib/constants';

// ==========================================
// Episode File System Service
// ==========================================

function getEpisodesPath(slug: string): string {
  return path.join(ANIME_DIR, slug, 'episodes.json');
}

function getInfoPath(slug: string): string {
  return path.join(ANIME_DIR, slug, 'info.json');
}

// Get all episodes for an anime
export async function getEpisodes(slug: string): Promise<Episode[]> {
  try {
    const data = await fs.readFile(getEpisodesPath(slug), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Create a new episode
export async function createEpisode(slug: string, episode: Episode): Promise<Episode> {
  const episodes = await getEpisodes(slug);

  // Check for duplicate episode number
  if (episodes.some((e) => e.episode === episode.episode)) {
    throw new Error(`Episode ${episode.episode} already exists for "${slug}"`);
  }

  episodes.push(episode);
  episodes.sort((a, b) => a.episode - b.episode);

  await fs.writeFile(getEpisodesPath(slug), JSON.stringify(episodes, null, 2));

  // Update anime's updatedAt
  await touchAnime(slug);

  return episode;
}

// Update an existing episode
export async function updateEpisode(
  slug: string,
  episodeNumber: number,
  updates: Partial<Episode>
): Promise<Episode | null> {
  const episodes = await getEpisodes(slug);
  const index = episodes.findIndex((e) => e.episode === episodeNumber);
  if (index === -1) return null;

  const updated: Episode = {
    ...episodes[index],
    ...updates,
    episode: updates.episode ?? episodeNumber,
  };

  episodes[index] = updated;
  episodes.sort((a, b) => a.episode - b.episode);

  await fs.writeFile(getEpisodesPath(slug), JSON.stringify(episodes, null, 2));

  // Update anime's updatedAt
  await touchAnime(slug);

  return updated;
}

// Delete an episode
export async function deleteEpisode(slug: string, episodeNumber: number): Promise<boolean> {
  const episodes = await getEpisodes(slug);
  const filtered = episodes.filter((e) => e.episode !== episodeNumber);
  if (filtered.length === episodes.length) return false;

  await fs.writeFile(getEpisodesPath(slug), JSON.stringify(filtered, null, 2));

  // Update anime's updatedAt
  await touchAnime(slug);

  return true;
}

// Reorder episodes (replace all episodes)
export async function reorderEpisodes(slug: string, episodes: Episode[]): Promise<Episode[]> {
  const sorted = [...episodes].sort((a, b) => a.episode - b.episode);
  await fs.writeFile(getEpisodesPath(slug), JSON.stringify(sorted, null, 2));
  await touchAnime(slug);
  return sorted;
}

// Touch anime to update updatedAt
async function touchAnime(slug: string): Promise<void> {
  try {
    const data = await fs.readFile(getInfoPath(slug), 'utf-8');
    const anime = JSON.parse(data);
    anime.updatedAt = new Date().toISOString();
    await fs.writeFile(getInfoPath(slug), JSON.stringify(anime, null, 2));
  } catch {
    // Ignore if anime doesn't exist
  }
}

// Get total episode count across all anime
export async function getTotalEpisodeCount(): Promise<number> {
  try {
    const dirs = await fs.readdir(ANIME_DIR);
    let total = 0;
    for (const dir of dirs) {
      try {
        const data = await fs.readFile(getEpisodesPath(dir), 'utf-8');
        const episodes = JSON.parse(data);
        total += Array.isArray(episodes) ? episodes.length : 0;
      } catch {
        // Skip
      }
    }
    return total;
  } catch {
    return 0;
  }
}
