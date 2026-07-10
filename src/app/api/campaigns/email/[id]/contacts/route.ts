import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns/email/[id]/contacts — fetch all contacts for a campaign
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contacts = await prisma.emailContact.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ contacts });
}

// POST /api/campaigns/email/[id]/contacts — bulk-insert parsed contacts
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { contacts } = body as { contacts: { name: string; email: string }[] };

  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: 'contacts array required' }, { status: 400 });
  }

  // Deduplicate by email
  const seen = new Set<string>();
  const unique = contacts.filter((c) => {
    const key = c.email.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Delete existing PENDING contacts before re-import
  await prisma.emailContact.deleteMany({
    where: { campaignId: id, status: 'PENDING' },
  });

  await prisma.emailContact.createMany({
    data: unique.map((c) => ({
      campaignId: id,
      name: c.name || c.email.split('@')[0],
      email: c.email.toLowerCase().trim(),
      status: 'PENDING',
    })),
  });

  return NextResponse.json({ imported: unique.length }, { status: 201 });
}
