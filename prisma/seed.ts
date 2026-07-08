import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with single client data (Phase 3)...');

  // Clean existing data
  await prisma.invoice.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.brandMemory.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  // 1. Create Agency
  const agency = await prisma.agency.create({
    data: {
      name: 'AgencyOS Digital',
    },
  });

  // 2. Create Users
  const aarav = await prisma.user.create({
    data: {
      name: 'Aarav Patel',
      email: 'aarav@agencyos.ai',
      role: 'OWNER',
      agencyId: agency.id,
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@agencyos.ai',
      role: 'MANAGER',
      agencyId: agency.id,
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      name: 'Meera (Bloom Cafe)',
      email: 'client@bloomcafe.com',
      role: 'CLIENT',
      agencyId: agency.id,
    },
  });

  console.log('Created users:', { aarav: aarav.name, priya: priya.name, clientUser: clientUser.name });

  // 3. Create Single Client: Bloom Café
  const bloomCafe = await prisma.client.create({
    data: {
      name: 'Bloom Café',
      status: 'HEALTHY',
      healthScore: 92,
      email: 'hello@bloomcafe.com',
      phone: '+91 98765 43210',
      agencyId: agency.id,
    },
  });

  console.log('Created single client: Bloom Café');

  // 4. Create Brand Memory for Bloom Café (Phase 3 Expanded)
  await prisma.brandMemory.create({
    data: {
      clientId: bloomCafe.id,
      toneOfVoice: 'Warm, inviting, artisanal, community-focused',
      bannedWords: 'cheap, discount, generic, fast-food',
      colors: '#4F3824,#EEDC82,#E0C39E',
      logoUrl: '/images/bloom-logo.png',
      guidelines: 'Focus on fresh local ingredients, cozy workspace vibes, and premium specialty coffee.',
      industry: 'Specialty Coffee Roastery & Café',
      targetAudience: 'Local coffee connoisseurs, remote freelancers, brunch seekers, and community members.',
      marketingPlan: `# Bloom Café - Growth Strategy\n\n1. **Core Concept**: Cultivating an artisanal neighborhood hub with a focus on single-origin pour-overs.\n2. **Key Marketing Channels**:\n   - **Instagram Reels**: Cozy morning ambiance, micro-roasting walkthroughs.\n   - **WhatsApp Broadcast**: VIP weekend brunch announcements.\n   - **SEO Local**: Dominate local search queries for "best study cafe near me".\n3. **Content Themes**: 'Craftsmanship', 'Cozy sanctuary', 'Community connection'.`,
      socialCalendar: JSON.stringify([
        {
          id: 'bloom-post-1',
          content: 'Cozy up this monsoon morning with our signature single-origin pour-over. Your table is waiting. ☕️🌧️',
          date: '2026-07-05',
          time: '09:00 AM',
          channels: ['instagram', 'facebook'],
          status: 'SCHEDULED',
        },
        {
          id: 'bloom-post-2',
          content: 'Roasting in small batches ensures every flavor note is preserved. Taste the craftsmanship behind the bean. 🌱🔥',
          date: '2026-07-08',
          time: '04:00 PM',
          channels: ['instagram', 'linkedin'],
          status: 'SCHEDULED',
        }
      ]),
    },
  });

  console.log('Created brand memory.');

  // 5. Create Bloom Café Project
  const bloomProj = await prisma.project.create({
    data: {
      name: 'Bloom Cafe Website Redesign',
      status: 'IN_PROGRESS',
      budget: 85000,
      spent: 41000,
      clientId: bloomCafe.id,
    },
  });

  // 6. Create Tasks for Project
  await prisma.task.createMany({
    data: [
      {
        title: 'Wireframe homepage',
        status: 'DONE',
        priority: 'MEDIUM',
        projectId: bloomProj.id,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        title: 'Content copy pass',
        status: 'DONE',
        priority: 'LOW',
        projectId: bloomProj.id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        title: 'Hero section design',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: bloomProj.id,
        assigneeId: priya.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
      },
      {
        title: 'Menu page design',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: bloomProj.id,
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // in 6 days
      },
      {
        title: 'Logo refresh',
        status: 'DONE',
        priority: 'LOW',
        projectId: bloomProj.id,
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
    ],
  });

  console.log('Created project and tasks.');

  // 7. Create Approvals for Bloom Café
  await prisma.approval.create({
    data: {
      title: 'Monsoon Social Post Banner',
      type: 'IMAGE',
      contentUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
      textBody: '### Social Media Post Details\n- **Visual Element**: Warm cup of espresso on a rain-drenched window ledge.\n- **Copywrite Caption**:\n  "When the monsoon outside gets cold, seek shelter inside our warm, aromatic roasting house. Try the new batch of single-origin beans roasted this morning. ☕🌧️"\n- **Scheduled Channels**: Instagram, Facebook.',
      status: 'PENDING',
      clientId: bloomCafe.id,
    },
  });

  await prisma.approval.create({
    data: {
      title: 'Website Redesign Home Layout',
      type: 'LINK',
      contentUrl: '/mockups/website_v1.png',
      textBody: '### Bloom Café Homepage Redesign\n- **Typography**: Playfair Display (Headings) & Outfit (Body text).\n- **Color Palette**: Vintage Cream background (`#FDFBF7`), Dark Espresso Coffee text (`#4F3824`), and Warm Marigold accents (`#EEDC82`).\n- **Section Structure**:\n  1. Hero section with cozy atmosphere background image and local study cafe reservation CTA.\n  2. Interactive Coffee Menu with origin details, taste notes, and live pricing.\n  3. Artisanal Coffee Story & Micro-roastery batch details.',
      status: 'PENDING',
      clientId: bloomCafe.id,
    },
  });

  await prisma.approval.create({
    data: {
      title: 'Instagram Reel — July Promo',
      type: 'VIDEO',
      textBody: '### Instagram Reel - Rainy Solace\n- **Vibe check**: Cozy rainy morning, steaming filter coffee, warm ambient lighting.\n- **Caption**:\n  "Your table is waiting. Find your rainy-day solace at Bloom. ☕️🌧️"\n- **Music Track**: Acoustic Lo-Fi Jazz Coffee Mix.',
      status: 'PENDING',
      clientId: bloomCafe.id,
    },
  });

  console.log('Created approvals.');

  // 7.5 Create Meetings for Bloom Café
  await prisma.meeting.createMany({
    data: [
      {
        title: 'Kickoff Meeting: Monsoon Strategy',
        date: new Date('2026-07-06T10:00:00Z'),
        time: '10:00 AM',
        clientId: bloomCafe.id,
      },
      {
        title: 'Weekly Deliverables Review',
        date: new Date('2026-07-10T14:30:00Z'),
        time: '02:30 PM',
        clientId: bloomCafe.id,
      },
      {
        title: 'Website Layout Approval Sync',
        date: new Date('2026-07-15T11:00:00Z'),
        time: '11:00 AM',
        clientId: bloomCafe.id,
      },
    ],
  });

  console.log('Created meetings.');

  // 8. Create Invoices for Bloom Café
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      amount: 85000,
      status: 'PAID',
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      clientId: bloomCafe.id,
    },
  });

  console.log('Created invoices.');

  // 9. Conversations and Messages for Bloom Café
  const bloomConv = await prisma.conversation.create({
    data: {
      channel: 'WHATSAPP',
      clientId: bloomCafe.id,
    },
  });

  await prisma.message.create({
    data: {
      content: "Hi! Can we push Friday's post to Saturday?",
      sender: 'CLIENT',
      senderName: 'Meera (Bloom Cafe)',
      conversationId: bloomConv.id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  await prisma.message.create({
    data: {
      content: "Sure, I'll update the calendar and confirm.",
      sender: 'AGENCY_USER',
      senderName: 'Priya Sharma',
      conversationId: bloomConv.id,
      createdAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000), // 1.8 hours ago
    },
  });

  await prisma.message.create({
    data: {
      content: "Done! Moved to Saturday 10 AM — you'll see it reflected in your content calendar.",
      sender: 'AI',
      senderName: 'AI Team (Suggested reply)',
      isAI: true,
      conversationId: bloomConv.id,
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
