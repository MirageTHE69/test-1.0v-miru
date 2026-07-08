'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Megaphone, Sparkles, BarChart3, AlertCircle } from 'lucide-react';

export default function AdvertisingPage() {
  const { activeClient } = useApp();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-tight">Advertising Command Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor and optimize live paid media campaigns across Meta, Google Ads, and LinkedIn.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div className="flex gap-3 items-center border-b border-slate-100 pb-4">
          <Megaphone className="h-6 w-6 text-indigo-600 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Omnichannel Ad Console (Phase 2 & 3)</h3>
            <p className="text-[11px] text-slate-400">Connect Meta & Google Ads APIs to track CPA and ROAS automatically.</p>
          </div>
        </div>

        {activeClient ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/10 p-8 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-indigo-600 mx-auto animate-spin" />
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Ready to connect channels for {activeClient.name}</h4>
              <p className="text-xs text-indigo-900/70 max-w-md mx-auto leading-relaxed">
                Connect external accounts to launch ad campaigns, sync creatives, and monitor budget pacing directly from this unified view.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Select a client account to load advertising console.</div>
        )}
      </div>
    </div>
  );
}
