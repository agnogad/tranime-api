import { NextRequest, NextResponse } from 'next/server';
import { getEpisodes, createEpisode, reorderEpisodes } from '@/lib/services/episode-service';
import { episodeSchema } from '@/lib/schemas';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const episodes = await getEpisodes(slug);
    return NextResponse.json(episodes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await request.json();

    // Support both single episode and reorder (array)
    if (Array.isArray(body)) {
      const episodes = await reorderEpisodes(slug, body);
      return NextResponse.json(episodes);
    }

    const validation = episodeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const episode = await createEpisode(slug, validation.data);
    return NextResponse.json(episode, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create episode';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
