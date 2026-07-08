'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { IndianRupee, Sparkles, TrendingUp, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function FinancePage() {
  const { activeClient } = useApp();
  const [financials, setFinancials] = React.useState<{ totalBudget: number; paidInvoicesCount: number; margin: number } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFinanceData = async () => {
      if (!activeClient) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/finance?clientId=${activeClient.id}`);
        if (res.ok) {
          const data = await res.json();
          setFinancials(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinanceData();
  }, [activeClient]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-tight">Retainer & Budget Finance</h1>
        <p className="text-sm text-slate-500 mt-1">
          Live cash flows, billing statements, and per-client profitability margins.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div className="flex gap-3 items-center border-b border-slate-100 pb-4">
          <ShieldCheck className="h-6 w-6 text-indigo-600 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Financial Suite Active (MVP Mode)</h3>
            <p className="text-[11px] text-slate-400">Phase 1 covers basic retainer invoice statuses. Phase 2 introduces full margin audits.</p>
          </div>
        </div>

        {/* Dynamic Client Billing Info */}
        {activeClient ? (
          loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : financials ? (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/20 p-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Retainer Budget</p>
                  <p className="text-lg font-bold text-slate-800 font-mono mt-1">
                    ₹{financials.totalBudget.toLocaleString()} / mo
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/20 p-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Paid Invoices YTD</p>
                  <p className="text-lg font-bold text-slate-800 font-mono mt-1">
                    {financials.paidInvoicesCount} {financials.paidInvoicesCount === 1 ? 'Invoice' : 'Invoices'}
                  </p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/10 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Current Account Margin</p>
                    <p className="text-lg font-bold text-indigo-950 font-mono mt-1">{financials.margin}%</p>
                  </div>
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              
              <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Retainer Margin Forecasting</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Profit margins are calculated using live time tracking metrics, actual ad spend from connected channels, and retainer pricing models. 
                  Full multi-tenant ledger reports are scheduled for implementation during the combined **Phases 2 & 3** release.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Failed to load billing metrics.</div>
          )
        ) : (
          <div className="text-xs text-slate-400">Select a client account to load billing overview.</div>
        )}
      </div>
    </div>
  );
}
