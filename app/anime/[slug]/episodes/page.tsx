'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Episode } from '@/lib/types';
import { EpisodeFormData } from '@/lib/schemas';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/shared/loading-state';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { EpisodeForm } from '@/components/episodes/episode-form';
import {
  ArrowLeft,
  PlusCircle,
  Edit3,
  Trash2,
  Film,
  Globe,
  ChevronUp,
  ChevronDown,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EpisodesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [animeTitle, setAnimeTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Episode | null>(null);

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
        toast.error('Anime not found');
        router.push('/anime');
        return;
      }

      const animeData = await animeRes.json();
      setAnimeTitle(animeData.title);

      if (epRes.ok) {
        const epData = await epRes.json();
        setEpisodes(epData);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(data: EpisodeFormData) {
    const res = await fetch(`/api/episodes/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create episode');
    }

    toast.success(`Episode ${data.episode} created`);
    setShowForm(false);
    fetchData();
  }

  async function handleUpdate(data: EpisodeFormData) {
    if (!editingEpisode) return;

    const res = await fetch(`/api/episodes/${slug}/${editingEpisode.episode}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update episode');
    }

    toast.success(`Episode ${data.episode} updated`);
    setEditingEpisode(null);
    fetchData();
  }

  async function handleDelete() {
    if (!deleteConfirm) return;

    try {
      const res = await fetch(
        `/api/episodes/${slug}/${deleteConfirm.episode}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error('Failed to delete episode');

      toast.success(`Episode ${deleteConfirm.episode} deleted`);
      setDeleteConfirm(null);
      fetchData();
    } catch {
      toast.error('Failed to delete episode');
    }
  }

  async function moveEpisode(index: number, direction: 'up' | 'down') {
    const newEpisodes = [...episodes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newEpisodes.length) return;

    // Swap episode numbers
    const temp = newEpisodes[index].episode;
    newEpisodes[index] = {
      ...newEpisodes[index],
      episode: newEpisodes[targetIndex].episode,
    };
    newEpisodes[targetIndex] = {
      ...newEpisodes[targetIndex],
      episode: temp,
    };

    // Sort by episode number
    newEpisodes.sort((a, b) => a.episode - b.episode);

    try {
      const res = await fetch(`/api/episodes/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEpisodes),
      });

      if (!res.ok) throw new Error('Failed to reorder');

      toast.success('Episodes reordered');
      fetchData();
    } catch {
      toast.error('Failed to reorder episodes');
    }
  }

  if (loading) return <LoadingState message="Loading episodes..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/anime/${slug}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">Manage Episodes</h2>
          <p className="text-muted-foreground text-sm">{animeTitle}</p>
        </div>
        <Button onClick={() => { setEditingEpisode(null); setShowForm(true); }}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Episode
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showForm || editingEpisode) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>
              {editingEpisode
                ? `Edit Episode ${editingEpisode.episode}`
                : 'Add New Episode'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EpisodeForm
              initialData={editingEpisode || undefined}
              onSubmit={editingEpisode ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingEpisode(null);
              }}
              submitLabel={editingEpisode ? 'Update Episode' : 'Create Episode'}
            />
          </CardContent>
        </Card>
      )}

      {/* Episode List */}
      {episodes.length === 0 ? (
        <EmptyState
          title="No episodes yet"
          description="Add your first episode to get started"
          icon={<Film className="w-8 h-8" />}
          action={
            <Button onClick={() => { setEditingEpisode(null); setShowForm(true); }}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add First Episode
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {episodes.map((ep, index) => (
            <Card
              key={ep.episode}
              className="border-border/50 hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveEpisode(index, 'up')}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveEpisode(index, 'down')}
                      disabled={index === episodes.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Episode number */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {ep.episode}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {ep.title || `Episode ${ep.episode}`}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {ep.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {ep.duration && <span>Duration: {ep.duration}</span>}
                      {ep.releaseDate && <span>Release: {ep.releaseDate}</span>}
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {ep.streams?.length || 0} provider
                        {(ep.streams?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Stream providers badges */}
                    {ep.streams && ep.streams.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ep.streams.map((stream, si) => (
                          <Badge
                            key={si}
                            variant={stream.default ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {stream.provider}
                            {stream.default ? ' ★' : ''}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingEpisode(ep);
                        setShowForm(false);
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirm(ep)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Episode"
        description={`Are you sure you want to delete Episode ${deleteConfirm?.episode}?`}
        onConfirm={handleDelete}
        confirmText="Delete Episode"
        variant="destructive"
      />
    </div>
  );
}
