'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/shared/loading-state';
import { Anime, Category, DashboardStats } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Film,
  FolderTree,
  PlayCircle,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      setLoading(true);
      const [animesRes, categoriesRes] = await Promise.all([
        fetch('/api/anime'),
        fetch('/api/categories'),
      ]);

      if (!animesRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const animes: Anime[] = await animesRes.json();
      const categories: Category[] = await categoriesRes.json();

      // Calculate total episodes
      let totalEpisodes = 0;
      for (const anime of animes) {
        try {
          const epRes = await fetch(`/api/episodes/${anime.slug}`);
          if (epRes.ok) {
            const episodes = await epRes.json();
            totalEpisodes += Array.isArray(episodes) ? episodes.length : 0;
          }
        } catch {
          // Skip
        }
      }

      const sortedByCreated = [...animes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const sortedByUpdated = [...animes].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setStats({
        totalAnime: animes.length,
        totalEpisodes,
        totalCategories: categories.length,
        recentAnime: sortedByCreated.slice(0, 5),
        recentUpdates: sortedByUpdated.slice(0, 5),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState message="Loading dashboard..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchDashboardStats}
          className="text-primary hover:underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Anime',
      value: stats?.totalAnime ?? 0,
      icon: Film,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Total Episodes',
      value: stats?.totalEpisodes ?? 0,
      icon: PlayCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Categories',
      value: stats?.totalCategories ?? 0,
      icon: FolderTree,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Recently Updated',
      value: stats?.recentUpdates.length ?? 0,
      icon: Clock,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Overview of your anime collection
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Anime */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recently Added */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-primary" />
              Recently Added
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentAnime && stats.recentAnime.length > 0 ? (
              <ul className="space-y-3">
                {stats.recentAnime.map((anime) => (
                  <li key={anime.slug}>
                    <Link
                      href={`/anime/${anime.slug}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                        {anime.cover ? (
                          <img
                            src={anime.cover}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Film className="w-5 h-5 m-auto text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {anime.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatDate(anime.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {anime.status}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No anime yet. Start by adding your first anime!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recently Updated */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recently Updated
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentUpdates && stats.recentUpdates.length > 0 ? (
              <ul className="space-y-3">
                {stats.recentUpdates.map((anime) => (
                  <li key={anime.slug}>
                    <Link
                      href={`/anime/${anime.slug}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                        {anime.cover ? (
                          <img
                            src={anime.cover}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Film className="w-5 h-5 m-auto text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {anime.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatDate(anime.updatedAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {anime.status}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No updates yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
