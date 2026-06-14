'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface ImagePreviewProps {
  src?: string;
  alt?: string;
  className?: string;
}

export function ImagePreview({ src, alt = 'Preview', className }: ImagePreviewProps) {
  const [error, setError] = useState(false);

  if (!src) {
    return (
      <div
        className={cn(
          'w-full h-32 rounded-md bg-muted flex items-center justify-center text-muted-foreground',
          className
        )}
      >
        <div className="text-center">
          <ImageOff className="w-6 h-6 mx-auto mb-1" />
          <span className="text-xs">No image</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'w-full h-32 rounded-md bg-muted flex items-center justify-center text-destructive',
          className
        )}
      >
        <div className="text-center">
          <ImageOff className="w-6 h-6 mx-auto mb-1" />
          <span className="text-xs">Failed to load</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-32 rounded-md overflow-hidden bg-muted', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
