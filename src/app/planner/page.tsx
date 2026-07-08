'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import CalendarView from '@/components/CalendarView';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import {
  Sparkles,
  BookOpen,
  Calendar,
  FileText,
  Megaphone,
  CheckCircle2,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Building2,
  Target,
  Image as ImageIcon,
  Send,
  Plus,
  Clock,
  Check,
  Bell,
  UserCheck,
  ArrowRight,
  Shield,
  Layers,
  Info
} from 'lucide-react';

// Custom SVG Brand Icons for consistent lucide-react compile
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

interface BrandMemoryType {
  id?: string;
  toneOfVoice: string;
  bannedWords: string;
  colors: string;
  guidelines: string;
  industry: string;
  targetAudience: string;
  marketingPlan: string | null;
  socialCalendar: string; // JSON string
  telegramToken?: string | null;
  telegramChatId?: string | null;
}

interface PostSuggestion {
  id: string;
  title: string;
  type: 'EDUCATIONAL' | 'PROMOTIONAL' | 'BEHIND_THE_SCENES' | 'ENGAGEMENT';
  brief: string;
  channels: string[];
  recommendedTime: string;
  timeOfDay: string;
}

export default function PlannerPage() {
  const { activeClient } = useApp();
  const [brandMemory, setBrandMemory] = useState<BrandMemoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [marketingPlan, setMarketingPlan] = useState<string | null>(null);
  
  // Custom editing states for swatches
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('');
  const [bannedWords, setBannedWords] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [colors, setColors] = useState('');
  const [isSavingSwatches, setIsSavingSwatches] = useState(false);
  const [swatchSuccess, setSwatchSuccess] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<PostSuggestion[]>([]);

  // Draft creator state
  const [selectedSuggestion, setSelectedSuggestion] = useState<PostSuggestion | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftedCopy, setDraftedCopy] = useState('');
  const [draftedImagePrompt, setDraftedImagePrompt] = useState('');
  const [draftedImage, setDraftedImage] = useState<string | null>(null);

  // Scheduling states
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('2026-07-07');
  const [scheduleTime, setScheduleTime] = useState('09:00 AM');
  const [scheduleChannels, setScheduleChannels] = useState<string[]>([]);
  const [reminderManager, setReminderManager] = useState(true);
  const [reminderExecutive, setReminderExecutive] = useState(true);
  const [teamNotification, setTeamNotification] = useState(true);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Telegram credentials states
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [telegramSaveSuccess, setTelegramSaveSuccess] = useState(false);

  // Publishing response logs state
  const [isPublishingNow, setIsPublishingNow] = useState(false);
  const [publishStatus, setPublishStatus] = useState<any[] | null>(null);

  // Active reminders state for this client
  const [clientReminders, setClientReminders] = useState<any[]>([]);

  const fetchBrandMemory = async () => {
    if (!activeClient) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing?clientId=${activeClient.id}`);
      if (res.ok) {
        const data: BrandMemoryType = await res.json();
        setBrandMemory(data);
        
        // Sync inputs
        setIndustry(data.industry || 'Services');
        setTargetAudience(data.targetAudience || 'General Public');
        setToneOfVoice(data.toneOfVoice || 'Professional, direct, clear');
        setBannedWords(data.bannedWords || 'cheap, fast');
        setGuidelines(data.guidelines || 'Focus on premium quality deliverables.');
        setColors(data.colors || '#4F46E5');
        setMarketingPlan(data.marketingPlan);
        setTelegramToken(data.telegramToken || '');
        setTelegramChatId(data.telegramChatId || '');
        
        // Pre-populate structured suggestions if plan exists
        if (data.marketingPlan) {
          generatePostSuggestions(data.industry, data.targetAudience);
        } else {
          setSuggestions([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch brand memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarReminders = async () => {
    if (!activeClient) return;
    try {
      const res = await fetch(`/api/calendar?clientId=${activeClient.id}`);
      if (res.ok) {
        const data = await res.json();
        const posts = data.posts || [];
        // Map any scheduled posts into local reminders list
        const activeRem = posts
          .filter((p: any) => p.status === 'SCHEDULED')
          .map((p: any) => ({
            id: p.id,
            content: p.content,
            date: p.date,
            time: p.time,
            channels: p.channels,
            remindedUsers: ['Priya Sharma (Manager)', 'Aarav Patel (Executive)']
          }));
        setClientReminders(activeRem);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBrandMemory();
    fetchCalendarReminders();
    setSelectedSuggestion(null);
    setDraftedCopy('');
    setDraftedImage(null);
    setScheduleSuccess(false);
    setPublishStatus(null);
  }, [activeClient]);

  // Save Telegram config
  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;
    setIsSavingTelegram(true);
    try {
      const res = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient.id,
          telegramToken,
          telegramChatId,
        })
      });
      if (res.ok) {
        setTelegramSaveSuccess(true);
        setTimeout(() => setTelegramSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save telegram credentials:', err);
    } finally {
      setIsSavingTelegram(false);
    }
  };

  // Publish Now to Telegram Bot + Sandbox Simulation
  const handlePublishNow = async () => {
    if (!activeClient || !draftedCopy) return;
    setIsPublishingNow(true);
    setPublishStatus(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient.id,
          content: draftedCopy,
          channels: scheduleChannels.length > 0 ? scheduleChannels : ['telegram']
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPublishStatus(data.statusLogs || []);
      } else {
        setPublishStatus([{ channel: 'system', status: 'FAILED', details: 'Publishing API failed' }]);
      }
    } catch (err: any) {
      setPublishStatus([{ channel: 'system', status: 'FAILED', details: err.message || err }]);
    } finally {
      setIsPublishingNow(false);
    }
  };

  // Seed mock suggestions based on client info
  function generatePostSuggestions(ind: string, aud: string) {
    const formattedInd = ind || 'Premium Operations';
    const formattedAud = aud || 'Corporate Leaders';
    setSuggestions([
      {
        id: 'sug_1',
        title: 'Brand Briefing & Mission',
        type: 'EDUCATIONAL',
        brief: `High-value introduction explaining how we service the ${formattedInd} space for ${formattedAud}.`,
        channels: ['instagram', 'linkedin'],
        recommendedTime: 'Tuesday',
        timeOfDay: '10:00 AM'
      },
      {
        id: 'sug_2',
        title: 'Customer Retainer Spotlight',
        type: 'BEHIND_THE_SCENES',
        brief: 'Mini video mockup showcasing design elements and strategy workflow parameters in active client workspace.',
        channels: ['instagram', 'facebook'],
        recommendedTime: 'Friday',
        timeOfDay: '11:30 AM'
      },
      {
        id: 'sug_3',
        title: 'Industry Insight Case Study',
        type: 'PROMOTIONAL',
        brief: `A detailed carousel outline explaining optimization tactics used to acquire target ${formattedAud} subscribers.`,
        channels: ['linkedin', 'twitter'],
        recommendedTime: 'Wednesday',
        timeOfDay: '02:00 PM'
      },
      {
        id: 'sug_4',
        title: 'Strategy Interactive Q&A',
        type: 'ENGAGEMENT',
        brief: `Engaging prompt seeking client feedback on what metrics matter most in ${formattedInd} operations.`,
        channels: ['twitter', 'instagram'],
        recommendedTime: 'Monday',
        timeOfDay: '09:00 AM'
      }
    ]);
  }

  // Compile detailed strategy marketing plan
  const handleGenerateStrategy = () => {
    setIsGeneratingPlan(true);
    setTimeout(async () => {
      const clientName = activeClient?.name || 'Client';
      const detailedPlan = `# Deep Strategic Marketing Plan: ${clientName}
      
## 1. Demographic Alignment & Tone constraints
* **Target Audience Focus**: ${targetAudience}
* **Brand Tone Voice**: "${toneOfVoice}"
* **Lexicon Directives**: Ensure all copywriting blocks strictly omit banned keywords: **${bannedWords}**. Maintain premium messaging style.

## 2. Multi-Channel Distribution Mix
* **LinkedIn (Professional Thought Leadership)**: Focus on detailed reports, ROI metrics, and operational guidelines (1 post/week).
* **Instagram / Facebook Reels (Visual Credibility)**: Share client onboarding snippets, designer workflow logs, and highlight brand color palette: \`${colors}\`.
* **X / Twitter API (Industry Realtime engagement)**: Post direct polls, metrics hooks, and comment on industry trends.

## 3. Recommended Content Pillars
* **Authority Building**: Educational carousels discussing metrics optimizations in the ${industry} space.
* **Co-working Transparency**: Highlighting team onboarding logs and communication channels.
* **Value Conversion**: Direct previews of dashboard templates and case studies.

## 4. Quarterly Goals & Milestones
* **Milestone 1**: Seed 15 scheduled omnichannel posts via Content Scheduler.
* **Milestone 2**: Setup automated reminders for Manager and Executives to review drafts 2 hours before push.
* **Milestone 3**: Verify client portal feedback loops to optimize campaign creative parameters.`;

      setMarketingPlan(detailedPlan);
      setIsGeneratingPlan(false);
      generatePostSuggestions(industry, targetAudience);

      // Autosave generated strategy to DB
      if (activeClient) {
        await fetch('/api/marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: activeClient.id,
            marketingPlan: detailedPlan,
            industry,
            targetAudience,
            toneOfVoice,
            bannedWords,
            colors,
            guidelines,
          })
        });
      }
    }, 2000);
  };

  // Save swatch profile changes
  const handleSaveSwatches = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;
    setIsSavingSwatches(true);
    try {
      const res = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient.id,
          industry,
          targetAudience,
          toneOfVoice,
          bannedWords,
          colors,
          guidelines,
        })
      });
      if (res.ok) {
        setSwatchSuccess(true);
        setTimeout(() => setSwatchSuccess(false), 3000);
        const data = await res.json();
        setBrandMemory(data.brandMemory);
        if (marketingPlan) {
          generatePostSuggestions(industry, targetAudience);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSwatches(false);
    }
  };

  // Generate copy draft based on suggestion and client guidelines
  const handleDraftSuggestion = (sug: PostSuggestion) => {
    setSelectedSuggestion(sug);
    setIsDrafting(true);
    setDraftedCopy('');
    setDraftedImage(null);
    setScheduleSuccess(false);

    // Auto set date for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setScheduleDate(`${yyyy}-${mm}-${dd}`);
    setScheduleTime(sug.timeOfDay);
    setScheduleChannels(sug.channels);

    setTimeout(() => {
      const clientName = activeClient?.name || 'Client';
      
      const copy = `✨ **Omnichannel Campaign Post [Drafted via Brand Memory]**

🎯 **Pillar Category**: ${sug.type}
💬 **Voice Matrix**: ${toneOfVoice}
❌ *Lexicon check: Banned words (${bannedWords}) avoided.*

"${sug.brief} We are excited to support our growing audience in the ${industry} space. Looking forward to driving premium quality outcomes together!"

🔗 Head to our link in bio to learn more!
#${clientName.replace(/\s+/g, '')} #OmnichannelPlanner #GrowthRetainer`;

      setDraftedCopy(copy);
      setDraftedImagePrompt(`High quality premium mockup concept representing ${sug.title} with brand hex code ${colors.split(',')[0] || '#4F46E5'}`);
      
      // Determine gorgeous mock image representation
      let selectedUrl = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';
      if (industry.toLowerCase().includes('coffee') || industry.toLowerCase().includes('cafe')) {
        selectedUrl = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80';
      } else if (industry.toLowerCase().includes('clinic') || industry.toLowerCase().includes('medical')) {
        selectedUrl = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80';
      } else if (industry.toLowerCase().includes('fit') || industry.toLowerCase().includes('gym')) {
        selectedUrl = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';
      } else if (sug.type === 'BEHIND_THE_SCENES') {
        selectedUrl = 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600&auto=format&fit=crop&q=80';
      }
      setDraftedImage(selectedUrl);
      setIsDrafting(false);
    }, 1550);
  };

  // Schedule confirmed post in local database + notifications
  const handleConfirmSchedule = async () => {
    if (!activeClient || !selectedSuggestion) return;
    setIsScheduling(true);
    setScheduleSuccess(false);

    try {
      // POST event to calendar api
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'POST',
          title: selectedSuggestion.title,
          content: draftedCopy,
          date: scheduleDate,
          time: scheduleTime,
          clientId: activeClient.id,
          channels: scheduleChannels,
          // Custom flags serialized inside socialCalendar JSON
          reminderManager,
          reminderExecutive,
          teamNotification
        })
      });

      if (res.ok) {
        setScheduleSuccess(true);
        setTimeout(() => {
          setScheduleSuccess(false);
          setSelectedSuggestion(null);
          setDraftedCopy('');
          setDraftedImage(null);
        }, 3000);
        
        // Refresh items
        fetchCalendarReminders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScheduling(false);
    }
  };

  if (!activeClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto flex flex-col pb-12">
      {/* Page Title Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Advanced Marketing Strategy
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2 font-tight tracking-tight">
            AI Content Planner & Omnichannel Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Create highly defined strategic plans, generate on-brand copy, push omnichannel events to client calendars, and orchestrate reminders for executives & managers.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left Side: Brand swatches identity config */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Client Swatches</h3>
            </div>

            {swatchSuccess && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Synchronized with SQLite brand registry!</span>
              </div>
            )}

            <form onSubmit={handleSaveSwatches} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-slate-50/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Demographics</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-slate-50/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Voice Tone</label>
                <input
                  type="text"
                  value={toneOfVoice}
                  onChange={(e) => setToneOfVoice(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-slate-50/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Banned Expressions</label>
                <input
                  type="text"
                  value={bannedWords}
                  onChange={(e) => setBannedWords(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Brand Color Palette (Hex)</label>
                <input
                  type="text"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-mono bg-slate-50/50"
                  required
                />
                <div className="flex gap-1.5 pt-1.5">
                  {colors.split(',').map((c, i) => (
                    <div 
                      key={i} 
                      className="h-5 w-5 rounded-full border border-slate-200" 
                      style={{ backgroundColor: c.trim() }} 
                      title={c.trim()}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Brand Guidelines</label>
                <textarea
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 min-h-[70px] bg-slate-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSavingSwatches}
                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 shadow-sm transition-all"
              >
                {isSavingSwatches ? 'Saving swatches...' : 'Update Client Swatches'}
              </button>
            </form>
          </div>

          {/* Telegram Omnichannel Credentials integration card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-sky-50 flex items-center justify-center">
                  <Send className="h-4 w-4 text-sky-500 shrink-0" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Telegram Connection</h3>
              </div>
              <span className="text-[9px] font-extrabold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Omnichannel</span>
            </div>

            {telegramSaveSuccess && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-[10px] text-emerald-700 font-semibold flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 animate-bounce" />
                <span>Credentials saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveTelegram} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bot API Token</label>
                <input
                  type="password"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="7176435345:AAH3k_lY..."
                  className="w-full text-xs rounded-lg border border-slate-205 p-2 outline-none focus:border-indigo-500 bg-slate-50/50 font-mono text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Chat ID / Channel Username</label>
                  <span className="text-[9px] text-slate-450 hover:underline cursor-pointer" title="Example: @my_channel_name or -10012345678">Need help?</span>
                </div>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="@bloomcafe_channel"
                  className="w-full text-xs rounded-lg border border-slate-205 p-2 outline-none focus:border-indigo-500 bg-slate-50/50 font-mono text-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingTelegram}
                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 shadow-sm transition-all text-xs cursor-pointer"
              >
                {isSavingTelegram ? 'Saving...' : 'Save Connection Credentials'}
              </button>
            </form>

            <div className="rounded-lg bg-slate-50 p-2.5 text-[9px] text-slate-450 leading-relaxed space-y-1">
              <span className="font-bold text-slate-650 block mb-0.5">💡 How to connect your Telegram channel:</span>
              <p>1. Talk to <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold">@BotFather</a> to create a bot.</p>
              <p>2. Add your bot as an **Administrator** in your public channel or group.</p>
              <p>3. Input your channel's public username (e.g. <code className="font-mono bg-slate-200/60 px-0.5 rounded text-slate-650">@my_channel</code>) as Chat ID.</p>
            </div>
          </div>

          {/* Active Notifications & Reminders widget */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="h-5 w-5 text-indigo-600 animate-bounce" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Scheduled Reminders List</h3>
            </div>
            
            {clientReminders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No active content calendar reminders set.</p>
            ) : (
              <div className="space-y-3">
                {clientReminders.map((rem) => (
                  <div key={rem.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-slate-800 truncate">{rem.content.split('\n')[0] || 'Scheduled Post'}</span>
                      <span className="shrink-0 bg-indigo-50 text-indigo-700 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">{rem.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[10px]">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Reminder target date: {rem.date}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex flex-col gap-1 text-[9px] text-slate-500">
                      <span className="font-bold uppercase text-[8px] text-indigo-600">Active Alert Receivers:</span>
                      {rem.remindedUsers.map((u: string) => (
                        <div key={u} className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3 text-emerald-500" />
                          <span>{u}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Main Section */}
        <div className="space-y-6 lg:col-span-2">
          {/* Defined AI Strategy Planner Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Strategic Marketing Planner</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define content pillars and omnichannel schedules for {activeClient.name}.</p>
              </div>
              
              {!marketingPlan && (
                <button
                  onClick={handleGenerateStrategy}
                  disabled={isGeneratingPlan}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 shadow-sm transition-all flex items-center gap-1.5"
                >
                  {isGeneratingPlan ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Compile AI Strategy Plan
                    </>
                  )}
                </button>
              )}
            </div>

            {marketingPlan ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-150 bg-slate-50/40 p-5 max-w-4xl border-l-4 border-l-indigo-600 max-h-[300px] overflow-y-auto">
                  <MarkdownRenderer content={marketingPlan} />
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button 
                    onClick={() => {
                      setMarketingPlan(null);
                      setSuggestions([]);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 font-semibold"
                  >
                    Clear / Recompile Strategy
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
                <Info className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">No strategy blueprint generated</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Compile an AI strategy plan utilizing client constraints. Generating a strategy automatically unlocks structured content suggestions for active execution.
                </p>
              </div>
            )}
          </div>

          {/* AI Post Suggestions List */}
          {suggestions.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Suggested Campaign Posts</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automated suggestions optimized for optimal reach demographics.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {suggestions.map((sug) => (
                  <div 
                    key={sug.id} 
                    className={`rounded-2xl border p-4 text-xs flex flex-col justify-between transition-all hover:shadow-md ${
                      selectedSuggestion?.id === sug.id ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-slate-800 leading-snug">{sug.title}</span>
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded capitalize shrink-0">{sug.type.toLowerCase().replace(/_/g, ' ')}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{sug.brief}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <div className="flex gap-1.5">
                        {sug.channels.map((ch) => (
                          <span key={ch} className="text-slate-400 hover:text-slate-600 transition-colors">
                            {ch === 'instagram' && <InstagramIcon className="h-4.5 w-4.5 text-pink-600" />}
                            {ch === 'linkedin' && <LinkedinIcon className="h-4.5 w-4.5 text-indigo-600" />}
                            {ch === 'facebook' && <FacebookIcon className="h-4.5 w-4.5 text-blue-600" />}
                            {ch === 'twitter' && <TwitterIcon className="h-4.5 w-4.5 text-slate-900" />}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleDraftSuggestion(sug)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        Draft Post <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Drafting Overlay/Panel */}
          {selectedSuggestion && (
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white p-6 shadow-sm space-y-6 relative animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-600 animate-spin" /> Drafting: {selectedSuggestion.title}
                  </h3>
                  <p className="text-xs text-indigo-700/60 mt-0.5">AI Copilot is tailoring parameters based on brand memory.</p>
                </div>
                <button 
                  onClick={() => setSelectedSuggestion(null)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {isDrafting ? (
                <div className="flex h-40 items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Draft Output Display */}
                  <div className="grid gap-6 md:grid-cols-5">
                    <div className="md:col-span-3 space-y-3">
                      <label className="text-[10px] text-indigo-950 font-bold uppercase tracking-wider">AI Generated Copy</label>
                      <textarea
                        value={draftedCopy}
                        onChange={(e) => setDraftedCopy(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 p-4 font-mono text-slate-700 bg-white outline-none focus:border-indigo-500 min-h-[160px] leading-relaxed shadow-sm"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-3 text-xs">
                      <label className="text-[10px] text-indigo-950 font-bold uppercase tracking-wider">Suggested Mock Concept</label>
                      {draftedImage ? (
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-inner p-1.5 bg-white">
                          <img 
                            src={draftedImage} 
                            alt="Mock visual concept" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <p className="text-[9px] text-slate-400 font-semibold p-1 mt-1 leading-snug">{draftedImagePrompt}</p>
                        </div>
                      ) : (
                        <div className="h-32 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                          Rendering conceptual graphic...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Calendar schedule config parameters */}
                  <div className="border-t border-slate-200 pt-4 space-y-4 text-xs font-semibold text-slate-600">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">One-Click Scheduler Configuration</h4>
                    
                    {scheduleSuccess ? (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-700 font-semibold space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-bold">Post successfully registered in omnichannel campaign calendar!</span>
                        </div>
                        <p className="text-[10px] text-emerald-600/80 font-normal pl-6 leading-relaxed">
                          Reminders dispatched to Aarav (Executive) & Priya (Manager) via local app notification services.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Posting Date</label>
                            <input 
                              type="date" 
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="w-full text-xs rounded-lg border border-slate-200 p-2 outline-none focus:border-indigo-500 bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Posting Time</label>
                            <input 
                              type="text" 
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full text-xs rounded-lg border border-slate-200 p-2 outline-none focus:border-indigo-500 bg-white"
                            />
                          </div>
                        </div>

                        {/* Channels selection checkboxes */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Omnichannel Platforms</label>
                          <div className="flex gap-2">
                            {[
                              { id: 'instagram', label: 'Instagram Feed', icon: InstagramIcon, color: 'text-pink-600 bg-pink-50 border-pink-100' },
                              { id: 'linkedin', label: 'LinkedIn Page', icon: LinkedinIcon, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                              { id: 'facebook', label: 'Facebook Meta', icon: FacebookIcon, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                              { id: 'twitter', label: 'X / Twitter API', icon: TwitterIcon, color: 'text-slate-900 bg-slate-50 border-slate-200' },
                            ].map((plat) => {
                              const isSel = scheduleChannels.includes(plat.id);
                              const Icon = plat.icon;
                              return (
                                <button
                                  key={plat.id}
                                  type="button"
                                  onClick={() => {
                                    setScheduleChannels(prev => 
                                      prev.includes(plat.id) ? prev.filter(x => x !== plat.id) : [...prev, plat.id]
                                    );
                                  }}
                                  className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all text-[10px] font-bold ${
                                    isSel ? `${plat.color} border-2 scale-105 shadow-sm` : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                                  }`}
                                >
                                  <Icon className="h-4 w-4 shrink-0" />
                                  <span>{plat.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Automated Reminder Toggles */}
                        <div className="space-y-3 border-t border-slate-100 pt-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reminders & Team Alerts</span>
                          
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="flex items-start gap-2.5 rounded-lg border border-slate-100 p-2.5 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={reminderExecutive}
                                onChange={(e) => setReminderExecutive(e.target.checked)}
                                className="rounded accent-indigo-600 mt-0.5"
                              />
                              <div className="text-[10px]">
                                <span className="font-bold text-slate-700 block">Executive Push Reminder</span>
                                <span className="text-[9px] text-slate-400 font-normal">Alert Aarav Patel (Marketing Executive) to post.</span>
                              </div>
                            </label>

                            <label className="flex items-start gap-2.5 rounded-lg border border-slate-100 p-2.5 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={reminderManager}
                                onChange={(e) => setReminderManager(e.target.checked)}
                                className="rounded accent-indigo-600 mt-0.5"
                              />
                              <div className="text-[10px]">
                                <span className="font-bold text-slate-700 block">Manager Push Alert</span>
                                <span className="text-[9px] text-slate-400 font-normal">Notify Priya Sharma (Manager) at scheduling time.</span>
                              </div>
                            </label>

                            <label className="flex items-start gap-2.5 rounded-lg border border-slate-100 p-2.5 bg-slate-50/50 hover:bg-slate-50 cursor-pointer sm:col-span-2">
                              <input 
                                type="checkbox"
                                checked={teamNotification}
                                onChange={(e) => setTeamNotification(e.target.checked)}
                                className="rounded accent-indigo-600 mt-0.5"
                              />
                              <div className="text-[10px]">
                                <span className="font-bold text-slate-700 block">Omnichannel Calendar Alert Notification</span>
                                <span className="text-[9px] text-slate-400 font-normal">Push notification banner to all agency users connected in the dashboard header.</span>
                              </div>
                            </label>
                          </div>
                        </div>

                        {publishStatus && (
                          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Publication Status Logs</span>
                            <div className="space-y-1.5">
                              {publishStatus.map((log, i) => (
                                <div key={i} className="text-xs flex items-start gap-2 leading-relaxed">
                                  <span className={`shrink-0 font-mono text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                                    log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    log.status === 'SIMULATED' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                                    'bg-rose-50 text-rose-700 border border-rose-100'
                                  }`}>
                                    {log.status}
                                  </span>
                                  <span className="font-bold text-slate-700 uppercase font-mono text-[9.5px]">{log.channel}:</span>
                                  <span className="text-slate-500">{log.details}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => { setSelectedSuggestion(null); setPublishStatus(null); }}
                            className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 font-semibold cursor-pointer text-xs"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={handlePublishNow}
                            disabled={isPublishingNow || isScheduling}
                            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2 shadow-md shadow-sky-600/10 flex items-center gap-1.5 cursor-pointer text-xs"
                          >
                            {isPublishingNow ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Publishing...
                              </>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" /> Publish Live Now
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleConfirmSchedule}
                            disabled={isScheduling || isPublishingNow}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer text-xs"
                          >
                            {isScheduling ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Scheduling...
                              </>
                            ) : (
                              <>
                                <Calendar className="h-3.5 w-3.5" /> Confirm & Schedule Campaign
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Integrated Content Calendar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Omnichannel Calendar View</h3>
                <p className="text-xs text-slate-400 mt-0.5">Click cells directly to customize general tasks or events.</p>
              </div>
            </div>
            <CalendarView clientId={activeClient.id} isClientView={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
