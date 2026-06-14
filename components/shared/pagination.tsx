'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => {
          if (totalPages <= 7) return true;
          if (page === 1 || page === totalPages) return true;
          if (page >= currentPage - 1 && page <= currentPage + 1) return true;
          return false;
        })
        .map((page, index, arr) => {
          const showEllipsis =
            index > 0 && page - arr[index - 1] > 1;
          return (
            <span key={page} className="flex items-center">
              {showEllipsis && (
                <span className="px-2 text-muted-foreground">...</span>
              )}
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                className="w-9"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            </span>
          );
        })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
