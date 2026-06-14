'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { animeSchema, AnimeFormData } from '@/lib/schemas';
import { Category } from '@/lib/types';
import { generateId, slugify } from '@/lib/utils';
import { ANIME_STATUS } from '@/lib/constants';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ImagePreview } from '@/components/shared/image-preview';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AnimeFormProps {
  initialData?: AnimeFormData & { slug?: string };
  mode: 'create' | 'edit';
}

export function AnimeForm({ initialData, mode }: AnimeFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<AnimeFormData>({
    resolver: zodResolver(animeSchema),
    defaultValues: initialData || {
      id: generateId(),
      slug: '',
      title: '',
      titleTr: '',
      description: '',
      year: new Date().getFullYear(),
      status: 'ongoing',
      categories: [],
      cover: '',
      banner: '',
      poster: '',
      rating: 0,
      featured: false,
      trending: false,
      createdAt: '',
      updatedAt: '',
    },
  });

  const watchSlug = watch('slug');
  const watchTitle = watch('title');
  const watchCover = watch('cover');
  const watchBanner = watch('banner');
  const watchPoster = watch('poster');
  const watchCategories = watch('categories');

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'create' && watchTitle && !watchSlug) {
      setValue('slug', slugify(watchTitle));
    }
  }, [watchTitle, watchSlug, mode, setValue]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      // Silently fail
    }
  }

  async function onSubmit(data: AnimeFormData) {
    setSubmitting(true);
    try {
      const url =
        mode === 'create'
          ? '/api/anime'
          : `/api/anime/${initialData?.slug}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Something went wrong');
      }

      const result = await res.json();
      toast.success(
        mode === 'create' ? 'Anime created successfully' : 'Anime updated successfully'
      );
      router.push(`/anime/${result.slug}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save anime');
    } finally {
      setSubmitting(false);
    }
  }

  function toggleCategory(slug: string) {
    const current = watchCategories || [];
    if (current.includes(slug)) {
      setValue(
        'categories',
        current.filter((c) => c !== slug)
      );
    } else {
      setValue('categories', [...current, slug]);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/anime">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === 'create' ? 'Add New Anime' : 'Edit Anime'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {mode === 'create'
              ? 'Create a new anime entry'
              : `Editing: ${initialData?.title}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Original Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter original title"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleTr">Turkish Title *</Label>
                <Input
                  id="titleTr"
                  placeholder="Enter Turkish title"
                  {...register('titleTr')}
                />
                {errors.titleTr && (
                  <p className="text-sm text-destructive">{errors.titleTr.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="anime-slug"
                  {...register('slug')}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Release Year *</Label>
                <Input
                  id="year"
                  type="number"
                  {...register('year')}
                />
                {errors.year && (
                  <p className="text-sm text-destructive">{errors.year.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue={watch('status')}
                  onValueChange={(value) =>
                    setValue('status', value as 'ongoing' | 'completed')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANIME_STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter anime description..."
                className="min-h-[120px]"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories available.{' '}
                <Link href="/categories" className="text-primary hover:underline">
                  Create categories first
                </Link>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => toggleCategory(cat.slug)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      (watchCategories || []).includes(cat.slug)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-secondary-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
            {errors.categories && (
              <p className="text-sm text-destructive mt-2">
                {errors.categories.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <Label htmlFor="cover">Cover Image URL</Label>
                <Input
                  id="cover"
                  placeholder="https://example.com/cover.jpg"
                  {...register('cover')}
                />
                <ImagePreview src={watchCover} alt="Cover preview" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="banner">Banner Image URL</Label>
                <Input
                  id="banner"
                  placeholder="https://example.com/banner.jpg"
                  {...register('banner')}
                />
                <ImagePreview src={watchBanner} alt="Banner preview" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="poster">Poster Image URL</Label>
                <Input
                  id="poster"
                  placeholder="https://example.com/poster.jpg"
                  {...register('poster')}
                />
                <ImagePreview src={watchPoster} alt="Poster preview" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating & Flags */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Rating & Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (0-10)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  {...register('rating')}
                />
                {errors.rating && (
                  <p className="text-sm text-destructive">{errors.rating.message}</p>
                )}
              </div>
              <div className="flex items-center gap-3 pt-8">
                <Switch
                  id="featured"
                  checked={watch('featured')}
                  onCheckedChange={(checked) => setValue('featured', checked)}
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
              <div className="flex items-center gap-3 pt-8">
                <Switch
                  id="trending"
                  checked={watch('trending')}
                  onCheckedChange={(checked) => setValue('trending', checked)}
                />
                <Label htmlFor="trending">Trending</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-4 pb-8">
          <Button type="submit" disabled={submitting} size="lg" className="min-w-[200px]">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create Anime' : 'Save Changes'}
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/anime">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
