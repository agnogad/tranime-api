'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store/use-store';
import {
  Film,
  LayoutDashboard,
  FolderTree,
  Menu,
  X,
  PlusCircle,
  List,
  TrendingUp,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    section: 'Main',
    items: [
      {
        label: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    section: 'Content',
    items: [
      {
        label: 'All Anime',
        href: '/anime',
        icon: Film,
      },
      {
        label: 'Add Anime',
        href: '/anime/new',
        icon: PlusCircle,
      },
      {
        label: 'Categories',
        href: '/categories',
        icon: FolderTree,
      },
    ],
  },
  {
    section: 'Quick Filters',
    items: [
      {
        label: 'Featured',
        href: '/anime?sort=updated',
        icon: Star,
      },
      {
        label: 'Trending',
        href: '/anime?sort=rating-desc',
        icon: TrendingUp,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Film className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-primary">Tranime</span>
              <span className="text-muted-foreground">CMS</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
          {navItems.map((section) => (
            <div key={section.section}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                {section.section}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 1024) toggleSidebar();
                        }}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        )}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
