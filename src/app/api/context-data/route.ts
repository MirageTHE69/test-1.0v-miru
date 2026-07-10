import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [clients, users] = await Promise.all([
      prisma.client.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.user.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({ clients, users });
  } catch (error) {
    console.error('API Context Fetch Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch context data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, botName } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields (name, email, role)' }, { status: 400 });
    }

    const agency = await prisma.agency.findFirst();
    if (!agency) {
      return NextResponse.json({ error: 'No active agency found for registration context' }, { status: 500 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email address already registered' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role.toUpperCase(),
        botName: botName || 'Copilot',
        agencyId: agency.id,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('API Context POST registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user account' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { clientId, telegramToken, telegramChatId } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId parameter' }, { status: 400 });
    }

    const updated = await prisma.brandMemory.update({
      where: { clientId },
      data: {
        telegramToken: telegramToken || null,
        telegramChatId: telegramChatId || null,
      },
    });

    return NextResponse.json({ success: true, brandMemory: updated });
  } catch (error: any) {
    console.error('API Context PUT error:', error);
    return NextResponse.json({ error: 'Failed to update brand memory configuration' }, { status: 500 });
  }
}
