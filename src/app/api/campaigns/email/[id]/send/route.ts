import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const BATCH_SIZE = 10; // Send in batches to avoid rate limiting

// POST /api/campaigns/email/[id]/send — initiate bulk send via Resend
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Load campaign with all pending contacts
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id },
    include: {
      contacts: { where: { status: 'PENDING' } },
    },
  });

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  if (campaign.contacts.length === 0) {
    return NextResponse.json({ error: 'No pending contacts to send to' }, { status: 400 });
  }

  // Resolve Resend API key: campaign-level override OR env variable
  const apiKey = campaign.resendApiKey || process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'No Resend API key found. Add it in campaign settings or set RESEND_API_KEY in .env' },
      { status: 400 }
    );
  }

  const resend = new Resend(apiKey);

  // Mark campaign as SENDING
  await prisma.emailCampaign.update({ where: { id }, data: { status: 'SENDING' } });

  const results: { contactId: string; email: string; success: boolean; error?: string }[] = [];

  // Process in batches
  for (let i = 0; i < campaign.contacts.length; i += BATCH_SIZE) {
    const batch = campaign.contacts.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (contact) => {
        // Personalise the HTML body — replace {{name}} tokens
        const personalised = campaign.htmlBody
          .replace(/\{\{name\}\}/gi, contact.name)
          .replace(/\{\{email\}\}/gi, contact.email);

        try {
          const result = await resend.emails.send({
            from: `${campaign.fromName} <${campaign.fromAddress}>`,
            to: contact.email,
            replyTo: campaign.replyTo || undefined,
            subject: campaign.subject,
            html: personalised,
          });

          // Resend SDK returns { data, error } — check for API-level errors
          if ((result as any).error) {
            const apiError = (result as any).error;
            const msg = apiError?.message || JSON.stringify(apiError);
            throw new Error(msg);
          }

          await prisma.emailContact.update({
            where: { id: contact.id },
            data: { status: 'SENT', sentAt: new Date() },
          });

          results.push({ contactId: contact.id, email: contact.email, success: true });
        } catch (err: any) {
          const errorMsg = err?.message || 'Unknown send error';
          await prisma.emailContact.update({
            where: { id: contact.id },
            data: { status: 'FAILED', errorMsg },
          });
          results.push({ contactId: contact.id, email: contact.email, success: false, error: errorMsg });
        }
      })
    );

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < campaign.contacts.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const sentCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;

  // Update campaign final status
  await prisma.emailCampaign.update({
    where: { id },
    data: {
      status: failedCount === results.length ? 'FAILED' : 'SENT',
      sentAt: new Date(),
    },
  });

  return NextResponse.json({
    sent: sentCount,
    failed: failedCount,
    total: results.length,
    results,
  });
}
