import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    // Fetch projects for the client to compute budget and margin
    const projects = await prisma.project.findMany({
      where: { clientId },
    });

    let totalBudget = 0;
    let totalSpent = 0;

    projects.forEach((proj) => {
      totalBudget += proj.budget;
      totalSpent += proj.spent;
    });

    const margin = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 100;

    // Fetch count of paid invoices
    const paidInvoicesCount = await prisma.invoice.count({
      where: {
        clientId,
        status: 'PAID',
      },
    });

    return NextResponse.json({
      totalBudget,
      paidInvoicesCount,
      margin,
    });
  } catch (error) {
    console.error('Finance API error:', error);
    return NextResponse.json({ error: 'Failed to fetch financial indicators' }, { status: 500 });
  }
}
