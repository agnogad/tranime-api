'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Anime, Episode } from '@/lib/types';
import { formatDate } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { ImagePreview } from '@/components/shared/image-preview';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import {
  Film,
  Edit3,
  Trash2,
  ArrowLeft,
  PlayCircle,
  Star,
  TrendingUp,
  Calendar,
  Clock,
  ListVideo,
  PlusCircle,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchData() {
    setLoading(true);
    try {
      const [animeRes, epRes] = await Promise.all([
        fetch(`/api/anime/${slug}`),
        fetch(`/api/episodes/${slug}`),
      ]);

      if (!animeRes.ok) {
        if (animeRes.status === 404) {
          toast.error('Anime not found');
          router.push('/anime');
          return;
        }
        throw new Error('Failed to fetch anime');
      }

      const animeData = await animeRes.json();
      setAnime(animeData);

      if (epRes.ok) {
        const epData = await epRes.json();
        setEpisodes(epData);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load anime');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!anime) return;
    try {
      const res = await fetch(`/api/anime/${anime.slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success(`"${anime.title}" deleted`);
      router.push('/anime');
    } catch {
      toast.error('Failed to delete anime');
    }
  }

  if (loading) return <LoadingState message="Loading anime..." />;

  if (!anime) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/anime">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{anime.title}</h2>
          <p className="text-muted-foreground text-sm">{anime.titleTr}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/anime/${anime.slug}/edit`}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Banner */}
      {anime.banner && (
        <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden bg-muted">
          <img
            src={anime.banner}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 netflix-gradient" />
        </div>
      )}

      {/* Main Info Grid */}
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Left Column - Images */}
        <div className="space-y-4">
          <ImagePreview
            src={anime.poster || anime.cover}
            alt={anime.title}
            className="w-full h-80 rounded-lg"
          />
          {anime.cover && anime.cover !== anime.poster && (
            <ImagePreview
              src={anime.cover}
              alt="Cover"
              className="w-full h-40 rounded-lg"
            />
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Status & Flags */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={anime.status === 'ongoing' ? 'success' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {anime.status === 'ongoing' ? 'Ongoing' : 'Completed'}
            </Badge>
            {anime.featured && (
              <Badge variant="netflix" className="text-sm px-3 py-1">
                <Star className="w-3.5 h-3.5 mr-1" />
                Featured
              </Badge>
            )}
            {anime.trending && (
              <Badge variant="warning" className="text-sm px-3 py-1">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Trending
              </Badge>
            )}
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {anime.year}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {anime.description || 'No description provided.'}
            </p>
          </div>

          {/* Details Grid */}
          <Card className="border-border/50">
            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {anime.rating?.toFixed(1) || '-'}
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{episodes.length}</p>
                <p className="text-xs text-muted-foreground">Episodes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {anime.categories?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {anime.id?.substring(0, 6)}...
                </p>
                <p className="text-xs text-muted-foreground">ID</p>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          {anime.categories && anime.categories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {anime.categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-sm px-3 py-1">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Created: {formatDate(anime.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Updated: {formatDate(anime.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Episodes Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ListVideo className="w-5 h-5 text-primary" />
              Episodes
            </h3>
            <p className="text-sm text-muted-foreground">
              {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button asChild>
            <Link href={`/anime/${anime.slug}/episodes`}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Manage Episodes
            </Link>
          </Button>
        </div>

        {episodes.length === 0 ? (
          <EmptyState
            title="No episodes yet"
            description="Add episodes to this anime"
            icon={<Film className="w-8 h-8" />}
            action={
              <Button asChild>
                <Link href={`/anime/${anime.slug}/episodes`}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Episodes
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3">
            {episodes.map((ep) => (
              <Card
                key={ep.episode}
                className="border-border/50 hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {ep.episode}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {ep.title || `Episode ${ep.episode}`}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {ep.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {ep.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ep.duration}
                        </span>
                      )}
                      {ep.releaseDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {ep.releaseDate}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        {ep.streams?.length || 0} stream
                        {(ep.streams?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/anime/${anime.slug}/episodes`}>
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="Delete Anime"
        description={`Are you sure you want to delete "${anime.title}"? This will permanently remove all episodes and data.`}
        onConfirm={handleDelete}
        confirmText="Delete Anime"
        variant="destructive"
      />
    </div>
  );
}
