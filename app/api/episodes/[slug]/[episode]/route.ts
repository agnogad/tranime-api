import { NextRequest, NextResponse } from 'next/server';
import { updateEpisode, deleteEpisode } from '@/lib/services/episode-service';
import { episodeSchema } from '@/lib/schemas';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; episode: string }> }
) {
  const { slug, episode } = await params;
  const episodeNumber = parseInt(episode, 10);

  if (isNaN(episodeNumber)) {
    return NextResponse.json({ error: 'Invalid episode number' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validation = episodeSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await updateEpisode(slug, episodeNumber, validation.data);
    if (!updated) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update episode';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; episode: string }> }
) {
  const { slug, episode } = await params;
  const episodeNumber = parseInt(episode, 10);

  if (isNaN(episodeNumber)) {
    return NextResponse.json({ error: 'Invalid episode number' }, { status: 400 });
  }

  try {
    const deleted = await deleteEpisode(slug, episodeNumber);
    if (!deleted) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete episode' },
      { status: 500 }
    );
  }
}
