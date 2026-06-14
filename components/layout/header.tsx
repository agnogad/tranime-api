'use client';

import { useUIStore } from '@/lib/store/use-store';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function Header() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Manage your anime collection
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground hidden md:block">
          Local CMS • JSON Storage
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">A</span>
        </div>
      </div>
    </header>
  );
}
