import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns/email?clientId=xxx — fetch all campaigns for client
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId');
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 });

  const campaigns = await prisma.emailCampaign.findMany({
    where: { clientId },
    include: {
      contacts: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const enriched = campaigns.map((c) => ({
    ...c,
    totalContacts: c.contacts.length,
    sentCount: c.contacts.filter((x) => x.status === 'SENT').length,
    failedCount: c.contacts.filter((x) => x.status === 'FAILED').length,
    pendingCount: c.contacts.filter((x) => x.status === 'PENDING').length,
    contacts: undefined,
  }));

  return NextResponse.json({ campaigns: enriched });
}

// POST /api/campaigns/email — create a new email campaign
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, name, subject, fromName, replyTo, fromAddress, htmlBody, resendApiKey } = body;

  if (!clientId || !name || !subject || !fromName || !fromAddress || !htmlBody) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const campaign = await prisma.emailCampaign.create({
    data: {
      clientId,
      name,
      subject,
      fromName,
      replyTo: replyTo || null,
      fromAddress,
      htmlBody,
      resendApiKey: resendApiKey || null,
      status: 'DRAFT',
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
