import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET approvals & invoices for portal view
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const [approvals, invoices, projects, tasks] = await Promise.all([
      prisma.approval.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.findMany({
        where: {
          project: {
            clientId,
          },
        },
        include: {
          assignee: true,
        },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    return NextResponse.json({ approvals, invoices, projects, tasks });
  } catch (error) {
    console.error('Portal GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch portal items' }, { status: 500 });
  }
}

// POST to update approval status, request changes, or create items
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, approvalId, status, feedback, title, type, contentUrl, textBody, clientId, invoiceNumber, amount, dueDate } = body;

    // 1. Action: Create a New Deliverable Approval
    if (action === 'CREATE_APPROVAL') {
      if (!title || !type || !clientId) {
        return NextResponse.json({ error: 'title, type, and clientId are required' }, { status: 400 });
      }
      const newApproval = await prisma.approval.create({
        data: {
          title,
          type,
          contentUrl: contentUrl || null,
          textBody: textBody || null,
          status: 'PENDING',
          clientId,
        },
      });
      return NextResponse.json({ success: true, approval: newApproval });
    }

    // 2. Action: Create a New Billing Invoice
    if (action === 'CREATE_INVOICE') {
      if (!invoiceNumber || !amount || !dueDate || !clientId) {
        return NextResponse.json({ error: 'invoiceNumber, amount, dueDate, and clientId are required' }, { status: 400 });
      }
      const newInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          amount: parseFloat(amount),
          status: 'SENT',
          dueDate: new Date(dueDate),
          clientId,
        },
      });
      return NextResponse.json({ success: true, invoice: newInvoice });
    }

    // 3. Default: Update existing Approval status (Backwards Compatible)
    if (!approvalId || !status) {
      return NextResponse.json({ error: 'approvalId and status are required' }, { status: 400 });
    }

    const updatedApproval = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status,
        ...(feedback !== undefined && { feedback }),
      },
    });

    return NextResponse.json({ success: true, approval: updatedApproval });
  } catch (error) {
    console.error('Portal POST error:', error);
    return NextResponse.json({ error: 'Failed to process portal action' }, { status: 500 });
  }
}
