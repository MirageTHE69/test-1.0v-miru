'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import EmailCampaign from '@/components/advertising/EmailCampaign';
import {
  Mail,
  MessageSquare,
  Layers,
  Send,
  ExternalLink,
  Lock,
  Sparkles,
} from 'lucide-react';

type ChannelTab = 'email' | 'whatsapp' | 'meta' | 'telegram' | 'linkedin';

interface Channel {
  id: ChannelTab;
  label: string;
  icon: React.ElementType;
  live: boolean;
  description: string;
  color: string;
}

const CHANNELS: Channel[] = [
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    live: true,
    description: 'Send personalized bulk email campaigns to client contact lists via Resend.',
    color: 'indigo',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageSquare,
    live: false,
    description: 'Broadcast approved WhatsApp templates and automate lead qualification flows.',
    color: 'emerald',
  },
  {
    id: 'meta',
    label: 'Meta Ads',
    icon: Layers,
    live: false,
    description: 'Create and manage Facebook & Instagram ad campaigns, track ROAS and CPA.',
    color: 'blue',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: Send,
    live: false,
    description: 'Send bulk Telegram messages and channel broadcasts to engaged communities.',
    color: 'sky',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: ExternalLink,
    live: false,
    description: 'Publish sponsored posts and message campaigns to B2B LinkedIn audiences.',
    color: 'blue',
  },
];

const COLOR_MAP: Record<string, { tab: string; badge: string; icon: string; coming: string }> = {
  indigo: {
    tab: 'border-indigo-600 text-indigo-700 bg-indigo-50',
    badge: 'bg-indigo-600 text-white',
    icon: 'text-indigo-600 bg-indigo-100',
    coming: 'border-indigo-100 bg-indigo-50/40',
  },
  emerald: {
    tab: 'border-emerald-600 text-emerald-700 bg-emerald-50',
    badge: 'bg-emerald-600 text-white',
    icon: 'text-emerald-600 bg-emerald-100',
    coming: 'border-emerald-100 bg-emerald-50/40',
  },
  blue: {
    tab: 'border-blue-600 text-blue-700 bg-blue-50',
    badge: 'bg-blue-600 text-white',
    icon: 'text-blue-600 bg-blue-100',
    coming: 'border-blue-100 bg-blue-50/40',
  },
  sky: {
    tab: 'border-sky-600 text-sky-700 bg-sky-50',
    badge: 'bg-sky-600 text-white',
    icon: 'text-sky-600 bg-sky-100',
    coming: 'border-sky-100 bg-sky-50/40',
  },
};

export default function AdvertisingPage() {
  const { activeClient } = useApp();
  const [activeTab, setActiveTab] = useState<ChannelTab>('email');

  const activeChannel = CHANNELS.find((c) => c.id === activeTab)!;
  const colors = COLOR_MAP[activeChannel.color];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Advertising Campaigns
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Launch and manage multi-channel campaigns across Email, WhatsApp, Meta, Telegram, and LinkedIn
          {activeClient ? ` for ${activeClient.name}` : ''}.
        </p>
      </div>

      {/* Channel Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon;
          const isActive = activeTab === channel.id;
          const c = COLOR_MAP[channel.color];

          return (
            <button
              key={channel.id}
              onClick={() => setActiveTab(channel.id)}
              className={`relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? c.tab + ' shadow-sm'
                  : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? '' : 'opacity-60'}`} />
              <span>{channel.label}</span>
              {channel.live ? (
                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider ${
                  isActive ? c.badge : 'bg-slate-100 text-slate-500'
                }`}>
                  Live
                </span>
              ) : (
                <span className="rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-400">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      {activeChannel.live ? (
        /* ── LIVE: Email Campaign ─────────────────── */
        <EmailCampaign />
      ) : (
        /* ── COMING SOON: Other Channels ──────────── */
        <div className={`rounded-2xl border-2 border-dashed p-12 text-center space-y-5 ${colors.coming}`}>
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mx-auto ${colors.icon}`}>
            {React.createElement(activeChannel.icon, { className: 'h-7 w-7' })}
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">{activeChannel.label} Campaigns</h3>
              <Lock className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {activeChannel.description}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
            Coming in the next release
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 max-w-sm mx-auto text-left space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Planned Features
            </span>
            {activeTab === 'whatsapp' && (
              <ul className="space-y-1 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-1.5">✓ Approved template broadcasting</li>
                <li className="flex items-center gap-1.5">✓ AI-powered lead qualification flows</li>
                <li className="flex items-center gap-1.5">✓ Shared team inbox integration</li>
                <li className="flex items-center gap-1.5">✓ Contact group management</li>
              </ul>
            )}
            {activeTab === 'meta' && (
              <ul className="space-y-1 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-1.5">✓ Meta Ads API integration</li>
                <li className="flex items-center gap-1.5">✓ Campaign ROAS + CPA tracking</li>
                <li className="flex items-center gap-1.5">✓ AI creative copy generation for ads</li>
                <li className="flex items-center gap-1.5">✓ Budget anomaly alerts</li>
              </ul>
            )}
            {activeTab === 'telegram' && (
              <ul className="space-y-1 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-1.5">✓ Bot token integration</li>
                <li className="flex items-center gap-1.5">✓ Bulk channel broadcasts</li>
                <li className="flex items-center gap-1.5">✓ Message scheduling via social calendar</li>
                <li className="flex items-center gap-1.5">✓ Multi-chat group routing</li>
              </ul>
            )}
            {activeTab === 'linkedin' && (
              <ul className="space-y-1 text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-1.5">✓ LinkedIn OAuth integration</li>
                <li className="flex items-center gap-1.5">✓ Sponsored post publishing</li>
                <li className="flex items-center gap-1.5">✓ B2B audience targeting setup</li>
                <li className="flex items-center gap-1.5">✓ Message campaign automation</li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
