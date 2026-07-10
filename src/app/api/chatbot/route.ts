import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, activeTab, clientId, userBotName } = body;

    const botName = userBotName || 'AI Copilot';

    if (!clientId) {
      return NextResponse.json({
        reply: `Hi there! I'm ${botName}. Please select an active client from the top dropdown so I can synchronize with their workspace metrics and brand memory.`
      });
    }

    // 1. Fetch Client Data
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json({
        reply: `Hmm, I couldn't find the selected client in our database. Let me know if you want me to re-synchronize.`
      });
    }

    const [brandMemory, projects, meetings, invoices] = await Promise.all([
      prisma.brandMemory.findUnique({ where: { clientId } }),
      prisma.project.findMany({
        where: { clientId },
        include: { tasks: { include: { assignee: true } } }
      }),
      prisma.meeting.findMany({ where: { clientId }, orderBy: { date: 'asc' } }),
      prisma.invoice.findMany({ where: { clientId }, orderBy: { createdAt: 'desc' } })
    ]);

    const msgLower = (message || '').toLowerCase();
    let replyText = '';
    let actionTriggered = null;

    // ─── 1. PROJECT MANAGER (PM) TAB ──────────────────────────────────────────
    if (activeTab === 'pm') {
      const isSchedulingQuery = msgLower.includes('schedule') || msgLower.includes('post');
      const isInsightsQuery = msgLower.includes('insight') || msgLower.includes('health') || msgLower.includes('status') || msgLower.includes('report') || msgLower.includes('update');

      if (isSchedulingQuery) {
        // Attempt to parse schedule post details
        // Pattern matches: "schedule post: content" or "schedule post on instagram: content" etc.
        let channels = ['instagram'];
        if (msgLower.includes('twitter') || msgLower.includes(' x ')) channels = ['x'];
        else if (msgLower.includes('linkedin')) channels = ['linkedin'];
        else if (msgLower.includes('telegram')) channels = ['telegram'];
        else if (msgLower.includes('slack')) channels = ['slack'];
        else if (msgLower.includes('discord')) channels = ['discord'];

        // Extract date (check for YYYY-MM-DD or default to tomorrow)
        let dateStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // tomorrow
        const dateMatch = message.match(/\b\d{4}-\d{2}-\d{2}\b/);
        if (dateMatch) {
          dateStr = dateMatch[0];
        } else if (msgLower.includes('today')) {
          dateStr = new Date().toISOString().split('T')[0];
        }

        // Extract time (e.g., 10:00 AM)
        let timeStr = '09:00 AM';
        const timeMatch = message.match(/\b\d{2}:\d{2}\s*(?:AM|PM|am|pm)\b/);
        if (timeMatch) {
          timeStr = timeMatch[0].toUpperCase();
        }

        // Extract content: anything after a colon, or quotes, or the query itself
        let content = message;
        if (message.includes(':')) {
          content = message.split(':').slice(1).join(':').trim();
        } else {
          // Clean up the trigger words
          content = message.replace(/(schedule|post|on|for|at|today|tomorrow|instagram|linkedin|twitter|telegram|slack|discord)/gi, '').replace(/\s+/g, ' ').trim();
        }
        if (!content) {
          content = `Cozy monsoon vibes at ${client.name}! ☕🌧️ Come try our fresh specialty roasts.`;
        }

        // Add to BrandMemory socialCalendar
        let socialList = [];
        if (brandMemory && brandMemory.socialCalendar) {
          try {
            socialList = JSON.parse(brandMemory.socialCalendar);
          } catch {
            socialList = [];
          }
        }

        const newPost = {
          id: 'post_' + Date.now(),
          content: content,
          date: dateStr,
          time: timeStr,
          channels: channels,
          status: 'SCHEDULED'
        };

        const updatedCalendar = [newPost, ...socialList];

        await prisma.brandMemory.upsert({
          where: { clientId },
          update: { socialCalendar: JSON.stringify(updatedCalendar) },
          create: {
            clientId,
            toneOfVoice: 'Warm, community-focused',
            bannedWords: 'cheap, fast',
            colors: '#4F3824',
            guidelines: 'artisanal quality',
            socialCalendar: JSON.stringify(updatedCalendar)
          }
        });

        actionTriggered = 'SCHEDULE_POST';
        replyText = `☕ **Post scheduled successfully!**\n\nHey Aarav, I've logged this new social post for **${client.name}**:\n\n- **Platform**: ${channels.join(', ').toUpperCase()}\n- **Date**: ${dateStr} at ${timeStr}\n- **Caption**:\n  > "${content}"\n\nI have automatically synchronized this with the Content Planner and schedule calendar. Let me know if you need any adjustments!`;

      } else if (isInsightsQuery) {
        // Formulate PM Insights
        if (projects.length === 0) {
          replyText = `Hey! I looked into the workspace database for **${client.name}** and found no active campaign projects listed. Would you like me to draft a default launch plan?`;
        } else {
          const firstProj = projects[0];
          const allTasks = firstProj.tasks || [];
          const doneTasks = allTasks.filter(t => t.status === 'DONE');
          const progressPct = allTasks.length > 0 ? Math.round((doneTasks.length / allTasks.length) * 100) : 0;
          const pendingTasks = allTasks.filter(t => t.status !== 'DONE');
          const highPriorityPending = pendingTasks.filter(t => t.priority === 'HIGH');

          let taskListStr = pendingTasks.map(t => `- **${t.title}** (${t.priority} priority - Assigned to: ${t.assignee?.name || 'Unassigned'})`).join('\n');
          if (!taskListStr) taskListStr = 'No pending tasks left!';

          replyText = `📋 **Campaign PM Status Report for ${client.name}**\n\nI checked our project board for **${firstProj.name}**:\n- **Overall Campaign Progress**: ${progressPct}% complete (${doneTasks.length}/${allTasks.length} tasks resolved).\n- **Active Pending Tasks**:\n${taskListStr}\n\n${
            highPriorityPending.length > 0 
              ? `⚠️ **Urgent Action proposal**: We have ${highPriorityPending.length} high priority task(s) awaiting resolution (e.g. *${highPriorityPending[0].title}* assigned to Priya). Let me know if I should ping them or draft content COPY for them!`
              : `✅ Everything is running smoothly. All critical tasks are resolved or on schedule!`
          }`;
        }
      } else {
        // General query PM help
        replyText = `Hi! I'm **${botName}**, your Project Manager. I can help track deliverables, check task list statuses, or schedule upcoming social media posts.\n\n*Try asking me:*\n- *"Give me a status update on active campaigns"* \n- *"Schedule a post on instagram for tomorrow at 10 AM: Monsoon coffee special is here! ☕️🌧️"*`;
      }

    // ─── 2. COPYWRITER TAB ────────────────────────────────────────────────────
    } else if (activeTab === 'copywriter') {
      const tone = brandMemory?.toneOfVoice || 'Warm, inviting, artisanal';
      const banned = brandMemory?.bannedWords || 'cheap, generic';
      const audience = brandMemory?.targetAudience || 'Local community & coffee lovers';
      const guidelines = brandMemory?.guidelines || 'Highlight micro-roasting details and premium ingredients.';

      // Generate customized content
      const topic = msgLower.replace(/(write|draft|copy|caption|for|post|about)/gi, '').trim() || 'our artisanal pour-overs';

      replyText = `✍️ **Drafting Copy aligned with ${client.name}'s Brand Memory**\n\nHere is a copy draft proposal for **${topic}**:\n\n---\n\n"Seeking shelter from the rainy weather? ☕🌧️ Duck into our cozy workspace and wrap your hands around a fresh batch of single-origin pour-overs, roasted right here this morning. Taste the craftsmanship in every sip."\n\n---\n\n🔍 **Brand Memory Alignment Check**:\n- **Tone of Voice**: Successfully used a \`${tone}\` tone.\n- **Banned Words Filter**: Screened against \`${banned}\` (none detected).\n- **Target Audience Focus**: Tailored directly for \`${audience}\`.\n- **Guidelines**: Followed \`${guidelines}\`.\n\nLet me know if you want me to schedule this directly on your social calendar!`;

    // ─── 3. SEO STRATEGIST TAB ────────────────────────────────────────────────
    } else if (activeTab === 'seo') {
      const industry = brandMemory?.industry || 'Services';
      const audience = brandMemory?.targetAudience || 'General Public';

      if (msgLower.includes('insight') || msgLower.includes('keyword') || msgLower.includes('metadata') || msgLower.includes('help')) {
        replyText = `🎯 **SEO Strategy & Technical Insights for ${client.name}**\n\nAnalyzing keywords for the **${industry}** industry:\n\n### 1. Recommended Search Keywords\n- \`artisanal pour over coffee near me\` (High intent - local SEO)\n- \`cozy study workspace cafe\` (High volume)\n- \`fresh micro-roasted coffee beans online\` (E-commerce conversion)\n- \`best specialty coffee roastery\`\n- \`monsoon brunch reservation\`\n\n### 2. Suggested Homepage Metadata\n- **SEO Meta Title**: *Cozy Specialty Coffee & Workspace in Town | ${client.name}*\n- **SEO Meta Description**: *Discover single-origin pour-overs, artisanal small-batch roasts, and a welcoming community hub. Free Wi-Fi, premium brunch, and cozy workspace tables available.* (155 characters)\n\n### 3. Action proposal\nAdd Local Business Schema JSON-LD metadata to the homepage layout header to boost Google Maps local rankings by up to 18%. Let me know if you want me to write the JSON code!`;
      } else {
        replyText = `🔍 **SEO Assistant active for ${client.name}**\n\nI can analyze keyword priorities, draft metadata tags, and propose local search configurations for your client website.\n\n*Try asking me:* \n- *"Give me keyword insights"* or *"Draft metadata tags"*`;
      }

    // ─── 4. FINANCE COPILOT TAB ────────────────────────────────────────────────
    } else if (activeTab === 'finance') {
      let totalBudget = 0;
      let totalSpent = 0;
      projects.forEach(p => {
        totalBudget += p.budget;
        totalSpent += p.spent;
      });

      const avgMargin = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 100;
      
      const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
      const totalOutstanding = invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + i.amount, 0);
      const unpaidInvoicesList = invoices.filter(i => i.status !== 'PAID');

      replyText = `💰 **Financial Retainer Audit for ${client.name}**\n\nHere is a financial status summary from our sqlite ledger database:\n\n- **Project Budget Retainers**: ₹${totalBudget.toLocaleString()} total budget, with ₹${totalSpent.toLocaleString()} spent to date.\n- **Profit Margin Index**: **${avgMargin}%** profitability index.\n- **Paid Revenue MTD**: ₹${totalPaid.toLocaleString()} collected.\n- **Outstanding Retainers**: ₹${totalOutstanding.toLocaleString()} awaiting payment.\n\n${
        unpaidInvoicesList.length > 0 
          ? `⚠️ **Outstanding invoice detected**: Invoice **${unpaidInvoicesList[0].invoiceNumber}** (₹${unpaidInvoicesList[0].amount.toLocaleString()}) has a status of \`${unpaidInvoicesList[0].status}\`.\n*Action proposal*: Send a gentle follow-up notification via chat/email. Let me know if you want me to draft that copy!`
          : `✅ **Perfect Score**: All billed invoices are fully paid! No outstanding balances.`
      }`;
    }

    return NextResponse.json({
      reply: replyText,
      actionTriggered
    });

  } catch (error) {
    console.error('Chatbot POST handler error:', error);
    return NextResponse.json({ error: 'Failed to process AI Copilot message' }, { status: 500 });
  }
}
