import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all conversations or messages for a specific conversation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(messages);
    }

    // Get all conversations with client details
    const conversations = await prisma.conversation.findMany({
      include: {
        client: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Inbox GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST to save new message (simulating agency reply or client send)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, content, sender, senderName, isAI } = body;

    if (!conversationId || !content || !sender || !senderName) {
      return NextResponse.json({ error: 'Missing required message parameters' }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        content,
        sender,
        senderName,
        isAI: isAI || false,
      },
    });

    // Touch the conversation to update its updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Inbox POST error:', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
