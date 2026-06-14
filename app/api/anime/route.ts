import { NextRequest, NextResponse } from 'next/server';
import { getAllAnime, createAnime } from '@/lib/services/anime-service';
import { animeSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const animes = await getAllAnime();
    return NextResponse.json(animes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch anime' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = animeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const anime = await createAnime(validation.data);
    return NextResponse.json(anime, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create anime';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
