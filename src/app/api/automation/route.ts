import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const flows = await prisma.automationFlow.findMany({
      where: { clientId },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 15,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(flows);
  } catch (error: any) {
    console.error('Automation GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch automation flows' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, triggerType, formFields, actions, isActive, clientId } = body;

    if (!clientId || !name || !triggerType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Generate unique webhookPath if new
    const webhookPath = id ? undefined : `flow-${Math.random().toString(36).substring(2, 11)}-${Date.now().toString(36)}`;

    const flow = await prisma.automationFlow.upsert({
      where: { id: id || 'new-flow-placeholder-uuid' },
      update: {
        name,
        triggerType,
        formFields: JSON.stringify(formFields || []),
        actions: JSON.stringify(actions || []),
        isActive: isActive !== undefined ? isActive : true,
      },
      create: {
        name,
        triggerType,
        formFields: JSON.stringify(formFields || []),
        actions: JSON.stringify(actions || []),
        isActive: isActive !== undefined ? isActive : true,
        webhookPath: webhookPath!,
        clientId,
      },
      include: {
        logs: true,
      },
    });

    return NextResponse.json({ success: true, flow });
  } catch (error: any) {
    console.error('Automation POST error:', error);
    return NextResponse.json({ error: 'Failed to save automation flow' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.automationFlow.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Automation DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete automation flow' }, { status: 500 });
  }
}
