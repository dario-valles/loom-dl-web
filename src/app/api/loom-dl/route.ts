// app/api/loom-dl/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // Extract the Loom video ID from the URL
    const id = url.split('/').pop()?.split('?')[0];

    // Fetch the transcoded URL from Loom API
    const response = await fetch(`https://www.loom.com/api/campaigns/sessions/${id}/transcoded-url`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch the video URL from Loom.');
    }

    const data = await response.json();
    const videoUrl = data.url;

    return NextResponse.json({ videoUrl });
  } catch (error: any) {
    console.error('Error in /api/loom-dl:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
