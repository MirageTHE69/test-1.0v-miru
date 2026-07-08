import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all leads
export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error('CRM GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST to update lead, convert to client (WON), or create new lead
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId, status, proposalText, aiDraftReady } = body;

    if (!leadId) {
      const { name, contactName, email, phone, value, status: initialStatus } = body;
      if (!name || !email) {
        return NextResponse.json({ error: 'leadId or name/email is required' }, { status: 400 });
      }

      const agency = await prisma.agency.findFirst();
      if (!agency) {
        return NextResponse.json({ error: 'No agency found' }, { status: 500 });
      }

      const newLead = await prisma.lead.create({
        data: {
          name,
          contactName: contactName || '',
          email,
          phone: phone || '',
          status: initialStatus || 'LEAD',
          value: parseFloat(value) || 0,
          agencyId: agency.id,
        },
      });

      return NextResponse.json({ success: true, lead: newLead });
    }

    // If updating proposal text or ai status
    if (proposalText !== undefined || aiDraftReady !== undefined) {
      const updatedLead = await prisma.lead.update({
        where: { id: leadId },
        data: {
          ...(proposalText !== undefined && { proposalText }),
          ...(aiDraftReady !== undefined && { aiDraftReady }),
        },
      });
      return NextResponse.json({ success: true, lead: updatedLead });
    }

    // Fetch original lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Update status
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    // If converted to WON, create Client and Project
    if (status === 'WON') {
      // Check if client already exists by name or email
      let client = await prisma.client.findFirst({
        where: {
          OR: [
            { name: lead.name },
            { email: lead.email },
          ],
        },
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: 'HEALTHY',
            healthScore: 100,
            agencyId: lead.agencyId,
          },
        });

        // Initialize empty Brand Memory
        await prisma.brandMemory.create({
          data: {
            clientId: client.id,
            toneOfVoice: 'Professional, direct, clear',
            bannedWords: '',
            colors: '#4F46E5',
            guidelines: 'Initial Brand guidelines set up during Lead conversion.',
          },
        });
      }

      // Create initial Project
      const existingProject = await prisma.project.findFirst({
        where: {
          clientId: client.id,
          name: `${lead.name} Retainer`,
        },
      });

      if (!existingProject) {
        await prisma.project.create({
          data: {
            name: `${lead.name} Retainer`,
            status: 'BACKLOG',
            budget: lead.value,
            spent: 0,
            clientId: client.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error('CRM POST error:', error);
    return NextResponse.json({ error: 'Failed to process lead request' }, { status: 500 });
  }
}
