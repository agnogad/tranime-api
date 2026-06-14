'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimeForm } from '@/components/anime/anime-form';
import { LoadingState } from '@/components/shared/loading-state';
import { AnimeFormData } from '@/lib/schemas';
import { toast } from 'sonner';

export default function EditAnimePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [initialData, setInitialData] = useState<AnimeFormData & { slug: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnime();
  }, [slug]);

  async function fetchAnime() {
    try {
      const res = await fetch(`/api/anime/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Anime not found');
          router.push('/anime');
          return;
        }
        throw new Error('Failed to fetch anime');
      }
      const data = await res.json();
      setInitialData(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load anime');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState message="Loading anime..." />;

  if (!initialData) return null;

  return <AnimeForm initialData={initialData} mode="edit" />;
}
