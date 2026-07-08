import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET projects and tasks for a specific clientId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const projects = await prisma.project.findMany({
      where: { clientId },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST to update task status or create new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, taskId, status, title, priority, projectId, dueDate } = body;

    if (action === 'update_task_status') {
      if (!taskId || !status) {
        return NextResponse.json({ error: 'taskId and status are required' }, { status: 400 });
      }
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status },
      });
      return NextResponse.json({ success: true, task: updatedTask });
    }

    if (action === 'create_task') {
      if (!projectId || !title) {
        return NextResponse.json({ error: 'projectId and title are required' }, { status: 400 });
      }
      const newTask = await prisma.task.create({
        data: {
          title,
          status: 'TODO',
          priority: priority || 'MEDIUM',
          projectId,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });
      return NextResponse.json({ success: true, task: newTask });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
