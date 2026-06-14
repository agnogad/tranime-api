import { z } from 'zod';

// ==========================================
// Zod Schemas
// ==========================================

export const streamingProviderSchema = z.object({
  provider: z.string().min(1, 'Provider name is required'),
  embedUrl: z.string().url('Must be a valid URL'),
  quality: z.string().min(1, 'Quality is required'),
  default: z.boolean(),
});

export const episodeSchema = z.object({
  episode: z.coerce.number().int().positive('Episode number must be positive'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  duration: z.string().default(''),
  releaseDate: z.string().default(''),
  thumbnail: z.string().default(''),
  streams: z.array(streamingProviderSchema).default([]),
});

export const categorySchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  name: z.string().min(1, 'Name is required'),
});

export const animeSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  title: z.string().min(1, 'Title is required'),
  titleTr: z.string().min(1, 'Turkish title is required'),
  description: z.string().default(''),
  year: z.coerce
    .number()
    .int()
    .min(1900, 'Year must be 1900 or later')
    .max(2100, 'Year must be 2100 or earlier'),
  status: z.enum(['ongoing', 'completed']),
  categories: z.array(z.string()).default([]),
  cover: z.string().default(''),
  banner: z.string().default(''),
  poster: z.string().default(''),
  rating: z.coerce.number().min(0).max(10).default(0),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
});

export type EpisodeFormData = z.infer<typeof episodeSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type AnimeFormData = z.infer<typeof animeSchema>;
export type StreamingProviderFormData = z.infer<typeof streamingProviderSchema>;
