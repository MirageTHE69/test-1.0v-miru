import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET calendar events (meetings, tasks, and posts)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let meetings = [];
    let tasks = [];
    let posts = [];

    if (clientId) {
      // 1. Fetch meetings
      meetings = await prisma.meeting.findMany({
        where: { clientId },
        orderBy: { date: 'asc' },
      });

      // 2. Fetch tasks connected to this client's projects
      tasks = await prisma.task.findMany({
        where: {
          project: {
            clientId: clientId,
          },
        },
        include: {
          project: true,
          assignee: true,
        },
        orderBy: { dueDate: 'asc' },
      });

      // 3. Fetch brand social posts
      const brandMemory = await prisma.brandMemory.findUnique({
        where: { clientId },
      });
      if (brandMemory && brandMemory.socialCalendar) {
        try {
          posts = JSON.parse(brandMemory.socialCalendar);
        } catch {
          posts = [];
        }
      }
    } else {
      // Fetch all for general manager calendar
      meetings = await prisma.meeting.findMany({
        include: { client: true },
        orderBy: { date: 'asc' },
      });

      tasks = await prisma.task.findMany({
        include: {
          project: {
            include: { client: true },
          },
          assignee: true,
        },
        orderBy: { dueDate: 'asc' },
      });

      const memories = await prisma.brandMemory.findMany({
        include: { client: true },
      });

      memories.forEach((bm) => {
        if (bm.socialCalendar) {
          try {
            const clientPosts = JSON.parse(bm.socialCalendar);
            // Append client metadata to post
            const postsWithClient = clientPosts.map((p: any) => ({
              ...p,
              clientId: bm.clientId,
              clientName: bm.client.name,
            }));
            posts.push(...postsWithClient);
          } catch {
            // Ignore parse errors
          }
        }
      });
    }

    return NextResponse.json({ meetings, tasks, posts });
  } catch (error) {
    console.error('Calendar GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

// POST to create a calendar event (meeting, task, or post)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, date, time, clientId, priority, content, channels } = body;

    if (!type || !title || !date || !clientId) {
      return NextResponse.json({ error: 'Missing required fields (type, title, date, clientId)' }, { status: 400 });
    }

    if (type === 'MEETING') {
      const meeting = await prisma.meeting.create({
        data: {
          title,
          date: new Date(date),
          time: time || '12:00 PM',
          clientId,
        },
      });
      return NextResponse.json({ success: true, event: meeting });
    } 
    
    if (type === 'TASK') {
      // Find first project for client to attach task to
      let project = await prisma.project.findFirst({
        where: { clientId },
      });

      // If no project exists, create a default one
      if (!project) {
        project = await prisma.project.create({
          data: {
            name: 'General Marketing Support',
            status: 'IN_PROGRESS',
            budget: 0,
            clientId,
          },
        });
      }

      const task = await prisma.task.create({
        data: {
          title,
          status: 'TODO',
          priority: priority || 'MEDIUM',
          dueDate: new Date(date),
          projectId: project.id,
        },
      });
      return NextResponse.json({ success: true, event: task });
    } 
    
    if (type === 'POST') {
      const brandMemory = await prisma.brandMemory.findUnique({
        where: { clientId },
      });

      let postsList = [];
      if (brandMemory && brandMemory.socialCalendar) {
        try {
          postsList = JSON.parse(brandMemory.socialCalendar);
        } catch {
          postsList = [];
        }
      }

      const newPost = {
        id: 'post_' + Date.now(),
        content: content || title,
        date: date, // YYYY-MM-DD string
        time: time || '09:00 AM',
        channels: channels || ['instagram'],
        status: 'SCHEDULED',
      };

      const updatedPosts = [newPost, ...postsList];

      await prisma.brandMemory.upsert({
        where: { clientId },
        update: {
          socialCalendar: JSON.stringify(updatedPosts),
        },
        create: {
          clientId,
          toneOfVoice: 'Warm, inviting, community-focused',
          bannedWords: 'cheap, fast',
          colors: '#4F3824',
          guidelines: 'Focus on quality.',
          socialCalendar: JSON.stringify(updatedPosts),
        },
      });

      return NextResponse.json({ success: true, event: newPost });
    }

    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  } catch (error) {
    console.error('Calendar POST error:', error);
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
}

// DELETE to remove an event (meeting or task; for posts, we handle it via marketing upsert or filtering)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const clientId = searchParams.get('clientId');

    if (!type || !id) {
      return NextResponse.json({ error: 'type and id are required' }, { status: 400 });
    }

    if (type === 'MEETING') {
      await prisma.meeting.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    if (type === 'TASK') {
      await prisma.task.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    if (type === 'POST') {
      if (!clientId) {
        return NextResponse.json({ error: 'clientId is required to delete posts' }, { status: 400 });
      }

      const brandMemory = await prisma.brandMemory.findUnique({
        where: { clientId },
      });

      if (brandMemory && brandMemory.socialCalendar) {
        const postsList = JSON.parse(brandMemory.socialCalendar);
        const updatedPosts = postsList.filter((p: any) => p.id !== id);

        await prisma.brandMemory.update({
          where: { clientId },
          data: {
            socialCalendar: JSON.stringify(updatedPosts),
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  } catch (error) {
    console.error('Calendar DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
