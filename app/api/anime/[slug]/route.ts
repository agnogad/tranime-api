import { NextRequest, NextResponse } from 'next/server';
import { getAnime, updateAnime, deleteAnime } from '@/lib/services/anime-service';
import { animeSchema } from '@/lib/schemas';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const anime = await getAnime(slug);
    if (!anime) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }
    return NextResponse.json(anime);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch anime' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await request.json();
    const validation = animeSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const anime = await updateAnime(slug, validation.data);
    if (!anime) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }
    return NextResponse.json(anime);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update anime';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const deleted = await deleteAnime(slug);
    if (!deleted) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete anime' },
      { status: 500 }
    );
  }
}
