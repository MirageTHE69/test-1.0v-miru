import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET brand memory for a specific client
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const brandMemory = await prisma.brandMemory.findUnique({ where: { clientId } });

    return NextResponse.json(brandMemory || {
      toneOfVoice: 'Professional, direct, corporate',
      bannedWords: 'cheap, fast',
      colors: '#0F172A',
      guidelines: 'No guidelines set yet.',
      industry: 'Services',
      targetAudience: 'General Public',
      marketingPlan: null,
      socialCalendar: '[]',
      telegramToken: null,
      telegramChatId: null,
      slackWebhookUrl: null,
      discordWebhookUrl: null,
      customWebhookUrl: null,
      xConsumerKey: null,
      xConsumerSecret: null,
      xAccessToken: null,
      xAccessTokenSecret: null,
      linkedinAccessToken: null,
      linkedinPersonId: null,
    });
  } catch (error) {
    console.error('Marketing GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch brand memory' }, { status: 500 });
  }
}

// POST/PUT to save or update brand memory details
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientId,
      toneOfVoice,
      bannedWords,
      colors,
      guidelines,
      industry,
      targetAudience,
      marketingPlan,
      socialCalendar,
      telegramToken,
      telegramChatId,
      slackWebhookUrl,
      discordWebhookUrl,
      customWebhookUrl,
      xConsumerKey,
      xConsumerSecret,
      xAccessToken,
      xAccessTokenSecret,
      linkedinAccessToken,
      linkedinPersonId,
    } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const updatedMemory = await prisma.brandMemory.upsert({
      where: { clientId },
      update: {
        ...(toneOfVoice !== undefined && { toneOfVoice }),
        ...(bannedWords !== undefined && { bannedWords }),
        ...(colors !== undefined && { colors }),
        ...(guidelines !== undefined && { guidelines }),
        ...(industry !== undefined && { industry }),
        ...(targetAudience !== undefined && { targetAudience }),
        ...(marketingPlan !== undefined && { marketingPlan }),
        ...(socialCalendar !== undefined && { socialCalendar }),
        ...(telegramToken !== undefined && { telegramToken }),
        ...(telegramChatId !== undefined && { telegramChatId }),
        ...(slackWebhookUrl !== undefined && { slackWebhookUrl }),
        ...(discordWebhookUrl !== undefined && { discordWebhookUrl }),
        ...(customWebhookUrl !== undefined && { customWebhookUrl }),
        ...(xConsumerKey !== undefined && { xConsumerKey }),
        ...(xConsumerSecret !== undefined && { xConsumerSecret }),
        ...(xAccessToken !== undefined && { xAccessToken }),
        ...(xAccessTokenSecret !== undefined && { xAccessTokenSecret }),
        ...(linkedinAccessToken !== undefined && { linkedinAccessToken }),
        ...(linkedinPersonId !== undefined && { linkedinPersonId }),
      },
      create: {
        clientId,
        toneOfVoice: toneOfVoice || 'Professional, direct, corporate',
        bannedWords: bannedWords || 'cheap, fast',
        colors: colors || '#0F172A',
        guidelines: guidelines || 'No guidelines set yet.',
        industry: industry || 'Services',
        targetAudience: targetAudience || 'General Public',
        marketingPlan: marketingPlan || null,
        socialCalendar: socialCalendar || '[]',
        telegramToken: telegramToken || null,
        telegramChatId: telegramChatId || null,
        slackWebhookUrl: slackWebhookUrl || null,
        discordWebhookUrl: discordWebhookUrl || null,
        customWebhookUrl: customWebhookUrl || null,
        xConsumerKey: xConsumerKey || null,
        xConsumerSecret: xConsumerSecret || null,
        xAccessToken: xAccessToken || null,
        xAccessTokenSecret: xAccessTokenSecret || null,
        linkedinAccessToken: linkedinAccessToken || null,
        linkedinPersonId: linkedinPersonId || null,
      },
    });

    return NextResponse.json({ success: true, brandMemory: updatedMemory });
  } catch (error) {
    console.error('Marketing POST error:', error);
    return NextResponse.json({ error: 'Failed to save brand memory details' }, { status: 500 });
  }
}
