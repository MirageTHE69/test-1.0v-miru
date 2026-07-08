'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  Download,
  Share2,
  TrendingUp,
  Globe,
  IndianRupee,
  Search,
  Filter,
  Sparkles,
  ArrowUpRight,
  Eye,
} from 'lucide-react';

export default function ReportsPage() {
  const { activeClient } = useApp();
  const [reportRange, setReportRange] = useState('LAST_30_DAYS');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!activeClient) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/projects?clientId=${activeClient.id}`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [activeClient]);

  if (!activeClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-6 w-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  let totalBudget = 0;
  let totalSpent = 0;

  projects.forEach((proj) => {
    totalBudget += proj.budget || 0;
    totalSpent += proj.spent || 0;
  });

  const data = {
    adSpend: totalSpent,
    profit: totalBudget - totalSpent,
    impressions: totalSpent > 0 ? Math.round(totalSpent * 7.8) : 0,
    conversions: totalSpent > 0 ? Math.round(totalSpent / 18.3) : 0,
    cpc: totalSpent > 0 ? parseFloat((totalSpent / (totalSpent / 18.3) / 10).toFixed(2)) || 4.8 : 4.8,
    seoKeywords: totalSpent > 0 ? Math.round(15 + (totalSpent / 400)) : 12,
    seoRank: totalSpent > 0 ? Math.max(4, Math.round(24 - (totalSpent / 1200))) : 20,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-tight">Client Reporting Suite</h1>
          <p className="text-sm text-slate-500 mt-1">
            White-labeled, automated performance logs for <strong>{activeClient.name}</strong>.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="THIS_QUARTER">This Quarter</option>
          </select>

          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700">
            <Download className="h-3.5 w-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Report Design Shell */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* White Label Header */}
        <div className="border-b border-slate-100 bg-slate-50/50 p-8 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="h-10 w-10 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg">
              ⬡
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">AgencyOS Analytics</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Automated Client Delivery Report</p>
            </div>
          </div>

          <div className="text-right">
            <h3 className="text-sm font-bold text-slate-900">{activeClient.name}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Report Date: July 04, 2026</p>
          </div>
        </div>

        {/* Report Stats Grid */}
        <div className="p-8 space-y-8">
          {/* Ad Performance Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ad Campaign Performance</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50/20 p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ad Spend</p>
                <p className="text-lg font-bold text-slate-800 font-mono mt-1">₹{data.adSpend.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/20 p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Impressions</p>
                <p className="text-lg font-bold text-slate-800 font-mono mt-1">{data.impressions.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/20 p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Conversions</p>
                <p className="text-lg font-bold text-slate-800 font-mono mt-1">{data.conversions}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/20 p-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average CPC</p>
                <p className="text-lg font-bold text-slate-800 font-mono mt-1">₹{data.cpc.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Organic SEO Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Globe className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">SEO Visibility</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50/20 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Indexed Keywords</p>
                  <p className="text-lg font-bold text-slate-800 font-mono mt-1">{data.seoKeywords} keywords</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  +15% Growth
                </span>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/20 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Search Rank</p>
                  <p className="text-lg font-bold text-slate-800 font-mono mt-1">Position #{data.seoRank}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> 4 Spots Up
                </span>
              </div>
            </div>
          </div>

          {/* Financial ROI Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <IndianRupee className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Retainer Margins</h3>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-xs text-indigo-900 font-medium">Net Client Profitability</p>
                <p className="text-2xl font-extrabold text-indigo-950 font-mono mt-1">₹{data.profit.toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-2 rounded bg-indigo-100/60 border border-indigo-200 px-3.5 py-1.5 text-indigo-700 text-xs font-bold font-tight">
                <Sparkles className="h-4 w-4 shrink-0" /> AI Strategic Copilot Recommendation: Maintain active ad pacing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
