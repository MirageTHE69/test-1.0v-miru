import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0; // Disable caching

export async function GET() {
  try {
    const [clients, projects, pendingApprovalsCount, leads, activePendingApprovals, paidInvoices] = await Promise.all([
      prisma.client.findMany({ orderBy: { healthScore: 'desc' } }),
      prisma.project.findMany(),
      prisma.approval.count({ where: { status: 'PENDING' } }),
      prisma.lead.findMany(),
      prisma.approval.findMany({
        where: { status: 'PENDING' },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      prisma.invoice.findMany({
        where: { status: 'PAID' },
      }),
    ]);

    return NextResponse.json({
      clients,
      projects,
      pendingApprovalsCount,
      leads,
      activePendingApprovals,
      paidInvoices,
    });
  } catch (error) {
    console.error('Dashboard statistics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}
