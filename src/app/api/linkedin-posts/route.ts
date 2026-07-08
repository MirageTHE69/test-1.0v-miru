import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchLinkedInPosts } from '@/lib/linkedin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const brandMemory = await prisma.brandMemory.findUnique({
      where: { clientId },
    });

    const accessToken = brandMemory?.linkedinAccessToken;
    const personId = brandMemory?.linkedinPersonId;

    if (!accessToken) {
      // If no credentials, return empty list or mock posts for preview
      return NextResponse.json({
        success: true,
        posts: [
          {
            id: 'mock-1',
            content: '🚀 Supercharge your workspace setup! Read-only and Write integrations are live in digital agency command consoles starting today.',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            lifecycleState: 'PUBLISHED',
          },
          {
            id: 'mock-2',
            content: '📈 Scaling client outcomes starts with clean omnichannel content calendars. Excited to announce our system upgrades!',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            lifecycleState: 'PUBLISHED',
          },
        ],
        isSimulated: true,
      });
    }

    try {
      const posts = await fetchLinkedInPosts(accessToken, personId || undefined);
      return NextResponse.json({ success: true, posts, isSimulated: false });
    } catch (apiErr: any) {
      console.error('LinkedIn API fetch error:', apiErr);
      return NextResponse.json({
        success: false,
        error: `LinkedIn API error: ${apiErr.message}`,
        posts: [],
      });
    }
  } catch (error: any) {
    console.error('LinkedIn GET posts route error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
