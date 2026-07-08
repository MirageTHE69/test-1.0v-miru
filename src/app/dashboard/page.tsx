'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import CalendarView from '@/components/CalendarView';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import {
  TrendingUp,
  Users,
  Percent,
  Clock,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Calendar as CalendarIcon
} from 'lucide-react';

interface ClientType {
  id: string;
  name: string;
  status: string;
  healthScore: number;
  email: string;
}

interface ApprovalType {
  id: string;
  title: string;
  type: string;
  status: string;
  client: {
    name: string;
  };
}

export default function DashboardPage() {
  const { activeClient, activeUser } = useApp();
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStatsData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !statsData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const {
    clients = [],
    projects = [],
    pendingApprovalsCount = 0,
    leads = [],
    activePendingApprovals = [],
    paidInvoices = []
  } = statsData;

  // Compute stats
  const activeClientsCount = clients.length;
  
  let totalBudget = 0;
  let totalSpent = 0;
  projects.forEach((p: any) => {
    totalBudget += p.budget;
    totalSpent += p.spent;
  });
  const avgMargin = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 100;

  const totalPaidRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);
  const revenueMtd = `₹${(totalPaidRevenue / 100000).toFixed(1)}L`;

  const stats = [
    {
      label: 'REVENUE MTD',
      value: revenueMtd,
      change: '+12%',
      positive: true,
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-150',
    },
    {
      label: 'ACTIVE CLIENTS',
      value: activeClientsCount,
      change: clients.length > 1 ? `+${clients.length - 1}` : 'Stable',
      positive: true,
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-150',
    },
    {
      label: 'AVG. MARGIN',
      value: `${avgMargin}%`,
      change: 'Live',
      positive: true,
      icon: Percent,
      color: 'text-blue-600 bg-blue-50 border-blue-150',
    },
    {
      label: 'PENDING APPROVALS',
      value: pendingApprovalsCount,
      change: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Awaiting` : 'All Clear',
      positive: pendingApprovalsCount === 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-150',
    },
  ];

  // AI Generated Insights Markdown formatted
  const aiInsightMarkdown = clients.find((c: any) => c.status === 'AT_RISK' || c.healthScore < 50)
    ? `### ⚠️ Flagged Account: **${clients.find((c: any) => c.status === 'AT_RISK' || c.healthScore < 50)?.name}**
- Performance health score stands at **${clients.find((c: any) => c.status === 'AT_RISK' || c.healthScore < 50)?.healthScore}%**.
- **Action proposal**: Review pending deliverables or trigger an alignment check-in.`
    : `### ✅ Account Health: **Excellent**
- All synchronized client accounts are showing optimal metrics.
- No flagged critical indicators detected in SQLite database logs.`;

  const leadInsightMarkdown = leads.filter((l: any) => l.status !== 'WON' && l.status !== 'LOST').length > 0
    ? `### 📈 Lead Opportunities Available
- Active prospects are waiting in your sales pipeline.
- The **AI copywriting team** is ready to draft custom proposal documents.`
    : `### 🌱 Pipeline Status: Ready
- Sales pipeline is currently empty.
- **Action proposal**: Create new prospect leads in the CRM view to start pitching proposals.`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-tight">
            Good morning, {activeUser?.name || 'Aarav'} ☕
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here is what needs your attention today across the agency.</p>
        </div>
      </div>

      {/* Stats KPI Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm card-hover flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {stat.label}
                </span>
                <span className={`rounded-lg p-2 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight text-slate-900 font-tight">
                  {stat.value}
                </span>
                <div className="flex items-center gap-1 mt-1 text-xs">
                  {stat.positive ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                  )}
                  <span className={stat.positive ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                    {stat.change}
                  </span>
                  <span className="text-slate-450 font-medium">vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Calendar Section */}
      {activeClient && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Unified Schedule Calendar — {activeClient.name}
            </h2>
          </div>
          <CalendarView clientId={activeClient.id} isClientView={false} />
        </div>
      )}

      {/* Grid of Main Content Panels */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Health Widget */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Client Health</h2>
            <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs text-slate-550 font-semibold">
              {clients.length} Accounts
            </span>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {clients.map((client: ClientType) => {
              const statusColors = {
                HEALTHY: 'bg-emerald-50 text-emerald-700 border-emerald-250',
                WATCH: 'bg-amber-50 text-amber-700 border-amber-250',
                AT_RISK: 'bg-rose-50 text-rose-700 border-rose-250',
              }[client.status as 'HEALTHY' | 'WATCH' | 'AT_RISK'];

              const dotColors = {
                HEALTHY: 'bg-emerald-550',
                WATCH: 'bg-amber-550',
                AT_RISK: 'bg-rose-550',
              }[client.status as 'HEALTHY' | 'WATCH' | 'AT_RISK'];

              return (
                <div key={client.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColors}`} />
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">{client.name}</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{client.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-800 font-tight">{client.healthScore}%</span>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Health Score</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusColors}`}>
                      {client.status === 'AT_RISK' ? 'At Risk' : client.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insight Widget */}
        <div className="rounded-xl border border-indigo-150 bg-gradient-to-br from-indigo-50/40 via-white to-white p-6 shadow-sm flex flex-col justify-between ai-pulse-glow">
          <div>
            <div className="flex items-center gap-2 border-b border-indigo-100/50 pb-4">
              <Sparkles className="h-4.5 w-4.5 text-indigo-650" />
              <h2 className="text-sm font-bold text-indigo-900 tracking-wide uppercase">AI Insights</h2>
            </div>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-indigo-50/40 border border-indigo-100 p-4">
                <MarkdownRenderer content={aiInsightMarkdown} />
              </div>
              <div className="rounded-lg bg-emerald-50/30 border border-emerald-100 p-4">
                <MarkdownRenderer content={leadInsightMarkdown} />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <a
              href="/crm"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-indigo-700"
            >
              <span>Address CRM Insights</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Team Workload & Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Workload Heatmap */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Team Workload</h2>
            <span className="text-xs text-slate-400 font-semibold">Capacity Index</span>
          </div>
          <div className="mt-6 space-y-4 text-xs font-medium">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-700">Priya Sharma (Project Manager)</span>
                <span className="text-indigo-600 font-bold">85% load</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-700">Aarav Patel (Director)</span>
                <span className="text-slate-650 font-bold">55% load</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-700">Simulated Creator (Designer)</span>
                <span className="text-rose-605 font-extrabold">95% (Overload)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Pending Approvals Widget */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Active Approvals Queue</h2>
            <a href="/portal" className="text-xs text-indigo-600 font-bold hover:underline">
              View approvals Portal
            </a>
          </div>
          <div className="mt-4 space-y-3">
            {activePendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-405 border border-dashed border-slate-200 rounded-lg">
                No active pending approvals
              </div>
            ) : (
              activePendingApprovals.map((app: ApprovalType) => (
                <div key={app.id} className="flex items-center justify-between border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{app.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{app.client.name} · {app.type.toLowerCase()} deliverable</p>
                  </div>
                  <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-extrabold text-amber-700 uppercase">
                    Pending
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
