'use client';

import { Suspense } from 'react';
import { LoadingState } from '@/components/shared/loading-state';
import { AnimeListContent } from './anime-list-content';

export default function AnimeListPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading anime list..." />}>
      <AnimeListContent />
    </Suspense>
  );
}
