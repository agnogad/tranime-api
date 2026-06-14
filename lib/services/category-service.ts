import fs from 'fs/promises';
import { Category } from '@/lib/types';
import { DATA_DIR, CATEGORIES_JSON } from '@/lib/constants';

// ==========================================
// Category File System Service
// ==========================================

async function ensureDirectories(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    await ensureDirectories();
    const data = await fs.readFile(CATEGORIES_JSON, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Create a new category
export async function createCategory(category: Category): Promise<Category> {
  await ensureDirectories();
  const categories = await getCategories();

  // Check for duplicate slug
  if (categories.some((c) => c.slug === category.slug)) {
    throw new Error(`Category with slug "${category.slug}" already exists`);
  }

  categories.push(category);
  await fs.writeFile(CATEGORIES_JSON, JSON.stringify(categories, null, 2));
  return category;
}

// Update an existing category
export async function updateCategory(oldSlug: string, updates: Partial<Category>): Promise<Category | null> {
  const categories = await getCategories();
  const index = categories.findIndex((c) => c.slug === oldSlug);
  if (index === -1) return null;

  const updated: Category = {
    ...categories[index],
    ...updates,
  };

  categories[index] = updated;
  await fs.writeFile(CATEGORIES_JSON, JSON.stringify(categories, null, 2));
  return updated;
}

// Delete a category
export async function deleteCategory(slug: string): Promise<boolean> {
  const categories = await getCategories();
  const filtered = categories.filter((c) => c.slug !== slug);
  if (filtered.length === categories.length) return false;

  await fs.writeFile(CATEGORIES_JSON, JSON.stringify(filtered, null, 2));
  return true;
}
