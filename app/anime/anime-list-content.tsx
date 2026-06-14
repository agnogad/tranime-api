'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Anime, Category, FilterState } from '@/lib/types';
import { ITEMS_PER_PAGE, SORT_OPTIONS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchInput } from '@/components/shared/search-input';
import { Pagination } from '@/components/shared/pagination';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import {
  Film,
  PlusCircle,
  Edit3,
  Trash2,
  Star,
  TrendingUp,
  Eye,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export function AnimeListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterState>({
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as 'ongoing' | 'completed' | 'all') || 'all',
    category: searchParams.get('category') || 'all',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: ITEMS_PER_PAGE,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<Anime | null>(null);

  const fetchAnime = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/anime');
      if (res.ok) {
        const data = await res.json();
        setAnimes(data);
      }
    } catch {
      toast.error('Failed to fetch anime');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnime();
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, [fetchAnime]);

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.search) params.set('search', filter.search);
    if (filter.status !== 'all') params.set('status', filter.status);
    if (filter.category !== 'all') params.set('category', filter.category);
    if (filter.sort !== 'newest') params.set('sort', filter.sort);
    if (filter.page > 1) params.set('page', filter.page.toString());
    const qs = params.toString();
    router.replace(`/anime${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [filter, router]);

  // Apply filters
  const filtered = animes
    .filter((a) => {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (
          !a.title.toLowerCase().includes(q) &&
          !a.titleTr?.toLowerCase().includes(q)
        )
          return false;
      }
      if (filter.status !== 'all' && a.status !== filter.status) return false;
      if (filter.category !== 'all' && !a.categories.includes(filter.category))
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (filter.sort) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'rating-asc':
          return (a.rating || 0) - (b.rating || 0);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const totalPages = Math.ceil(filtered.length / filter.limit);
  const paginated = filtered.slice(
    (filter.page - 1) * filter.limit,
    filter.page * filter.limit
  );

  async function handleDelete(anime: Anime) {
    try {
      const res = await fetch(`/api/anime/${anime.slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success(`"${anime.title}" deleted`);
      setDeleteConfirm(null);
      fetchAnime();
    } catch {
      toast.error('Failed to delete anime');
    }
  }

  if (loading) return <LoadingState message="Loading anime list..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">All Anime</h2>
          <p className="text-muted-foreground text-sm">
            {filtered.length} anime found
          </p>
        </div>
        <Button asChild>
          <Link href="/anime/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Anime
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <SearchInput
              value={filter.search}
              onChange={(value) =>
                setFilter((f) => ({ ...f, search: value, page: 1 }))
              }
              placeholder="Search anime..."
              className="w-full md:w-64"
            />
            <Select
              value={filter.status}
              onValueChange={(value) =>
                setFilter((f) => ({
                  ...f,
                  status: value as 'ongoing' | 'completed' | 'all',
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filter.category}
              onValueChange={(value) =>
                setFilter((f) => ({ ...f, category: value, page: 1 }))
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filter.sort}
              onValueChange={(value) =>
                setFilter((f) => ({ ...f, sort: value, page: 1 }))
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Anime Grid */}
      {paginated.length === 0 ? (
        <EmptyState
          title="No anime found"
          description={
            filter.search
              ? 'Try a different search term'
              : 'Start by adding your first anime'
          }
          icon={<Film className="w-8 h-8" />}
          action={
            !filter.search && (
              <Button asChild>
                <Link href="/anime/new">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add First Anime
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((anime) => (
            <Card
              key={anime.slug}
              className="border-border/50 overflow-hidden group hover:border-primary/30 transition-all duration-300"
            >
              {/* Cover Image */}
              <Link href={`/anime/${anime.slug}`}>
                <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                  {anime.cover ? (
                    <img
                      src={anime.cover}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Film className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                  {/* Overlay badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {anime.featured && (
                      <Badge variant="netflix" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {anime.trending && (
                      <Badge variant="warning" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={anime.status === 'ongoing' ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {anime.status}
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* Info */}
              <CardContent className="p-4">
                <Link href={`/anime/${anime.slug}`}>
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                    {anime.title}
                  </h3>
                </Link>
                {anime.titleTr && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {anime.titleTr}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{anime.year}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {anime.categories?.length || 0} cat
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(anime.updatedAt)}
                  </span>
                </div>

                {/* Categories */}
                {anime.categories && anime.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {anime.categories.slice(0, 3).map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                    {anime.categories.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{anime.categories.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="flex-1" asChild>
                    <Link href={`/anime/${anime.slug}`}>
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1" asChild>
                    <Link href={`/anime/${anime.slug}/edit`}>
                      <Edit3 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirm(anime)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={filter.page}
        totalPages={totalPages}
        onPageChange={(page) => setFilter((f) => ({ ...f, page }))}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Anime"
        description={`Are you sure you want to delete "${deleteConfirm?.title}"? This will permanently remove all episodes and data.`}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        confirmText="Delete Anime"
        variant="destructive"
      />
    </div>
  );
}
