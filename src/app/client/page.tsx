'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import CalendarView from '@/components/CalendarView';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageSquare,
  Download,
  IndianRupee,
  Briefcase,
  X,
  FileCode,
  Globe,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Smartphone,
  Laptop,
  Play,
  Heart,
  Share2,
  Bookmark,
  Check,
  TrendingUp,
  User,
  LogOut,
  ShieldCheck,
  Calendar as CalendarIcon,
  Award
} from 'lucide-react';

interface ApprovalType {
  id: string;
  title: string;
  type: string; // IMAGE, VIDEO, TEXT, LINK
  contentUrl: string | null;
  textBody: string | null;
  status: string; // PENDING, APPROVED, CHANGES_REQUESTED
  feedback: string | null;
  createdAt: string;
}

interface InvoiceType {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string; // PAID, SENT, OVERDUE
  dueDate: string;
}

interface ProjectType {
  id: string;
  name: string;
  status: string; // BACKLOG, IN_PROGRESS, CLIENT_REVIEW, DONE
  budget: number;
  spent: number;
  createdAt: string;
}

interface TaskType {
  id: string;
  title: string;
  status: string; // TODO, IN_PROGRESS, REVIEW, DONE
  priority: string; // LOW, MEDIUM, HIGH
  dueDate: string | null;
  projectId: string;
  assignee: {
    name: string;
    role: string;
  } | null;
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const { activeClient, activeUser, reloadContext } = useApp();
  const [approvals, setApprovals] = useState<ApprovalType[]>([]);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalTab, setPortalTab] = useState<'overview' | 'progress' | 'calendar' | 'approvals' | 'files' | 'invoices'>('overview');

  // Feedback input state for requesting changes
  const [feedbackTargetId, setFeedbackTargetId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const fetchClientData = async () => {
    if (!activeClient) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/portal?clientId=${activeClient.id}`);
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
        setInvoices(data.invoices || []);
        setProjects(data.projects || []);
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auth Guard check: ensure user is client
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      router.push('/login');
      return;
    }
    
    fetchClientData();
  }, [activeClient]);

  const handleStatusChange = async (approvalId: string, newStatus: string, feedbackVal?: string) => {
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId,
          status: newStatus,
          feedback: feedbackVal || null,
        }),
      });

      if (res.ok) {
        setApprovals((prev) =>
          prev.map((app) =>
            app.id === approvalId
              ? { ...app, status: newStatus, feedback: feedbackVal || null }
              : app
          )
        );
        setFeedbackTargetId(null);
        setFeedbackText('');
        fetchClientData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUserEmail');
    router.push('/login');
  };

  // Render mock preview containers
  const renderVisualMockup = (item: ApprovalType) => {
    const defaultImg = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80';
    const mockImage = item.contentUrl || defaultImg;

    if (item.type === 'IMAGE') {
      return (
        <div className="bg-[#FAF9F6] border border-slate-200 rounded-2xl shadow-inner max-w-sm mx-auto overflow-hidden">
          <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-800 text-white flex items-center justify-center font-bold text-sm border border-amber-900 shadow-xs">
                {activeClient?.name.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">{activeClient?.name}</span>
                <span className="text-[10px] text-slate-400 block font-semibold leading-none">Sponsored · Post Preview</span>
              </div>
            </div>
            <span className="text-slate-400 font-bold text-xs tracking-widest">•••</span>
          </div>

          <div className="relative bg-slate-100 aspect-square overflow-hidden">
            <img src={mockImage} alt="Instagram Post Mockup" className="w-full h-full object-cover" />
          </div>

          <div className="bg-white p-3.5 space-y-2">
            <div className="flex justify-between items-center text-slate-700">
              <div className="flex items-center gap-4">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                <MessageSquare className="h-5 w-5" />
                <Share2 className="h-5 w-5" />
              </div>
              <Bookmark className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800">142 Likes</span>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                <span className="font-bold text-slate-800 mr-1.5">{activeClient?.name.toLowerCase().replace(/\s+/g, '')}</span>
                Seek shelter in our warm, aromatic coffee workspace this monsoon season...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (item.type === 'VIDEO') {
      return (
        <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl shadow-xl max-w-[280px] mx-auto overflow-hidden relative aspect-[9/16] text-white">
          <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80" alt="Video cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 flex flex-col justify-between p-4">
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] font-bold tracking-wide">Reels Preview</span>
              <Smartphone className="h-4 w-4 text-slate-400" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/40 shadow-lg animate-pulse">
                <Play className="h-6 w-6 text-white fill-white ml-1" />
              </div>
            </div>

            <div className="absolute right-3 bottom-16 flex flex-col items-center gap-4 text-slate-200">
              <div className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-full bg-slate-800/60 flex items-center justify-center border border-slate-700/40">
                  <Heart className="h-4.5 w-4.5 text-white fill-white" />
                </div>
                <span className="text-[9px] mt-0.5 font-bold">1.2k</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-full bg-slate-800/60 flex items-center justify-center border border-slate-700/40">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <span className="text-[9px] mt-0.5 font-bold">45</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-full bg-slate-800/60 flex items-center justify-center border border-slate-700/40">
                  <Share2 className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-auto">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-amber-800 text-white flex items-center justify-center font-bold text-xs">
                  {activeClient?.name.charAt(0)}
                </div>
                <span className="text-xs font-bold">{activeClient?.name.toLowerCase().replace(/\s+/g, '')}</span>
              </div>
              <p className="text-[10px] text-slate-200 leading-relaxed font-sans line-clamp-2">
                Your table is waiting. Find your rainy-day solace at Bloom. ☕️🌧️
              </p>
              <div className="flex items-center gap-1.5 text-[9px] text-indigo-300 font-bold bg-slate-900/60 rounded px-2 py-0.5 w-max">
                <Award className="h-3 w-3" /> Acoustic Lo-Fi Jazz Mix
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (item.type === 'LINK') {
      return (
        <div className="bg-[#F8F9FD] border border-slate-300 rounded-2xl shadow-xl overflow-hidden flex flex-col h-72">
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <div className="h-3 w-3 rounded-full bg-rose-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-md py-0.5 px-3 text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-slate-300" />
              https://bloomcafe.com/new-website-redesign
            </div>
            <Laptop className="h-4 w-4 text-slate-400" />
          </div>

          <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-5 text-[#4F3824] flex flex-col">
            <div className="flex justify-between items-center border-b border-[#E0C39E]/30 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded bg-[#4F3824] text-white flex items-center justify-center font-bold text-xs">B</div>
                <span className="text-xs font-extrabold font-tight">BLOOM CAFÉ</span>
              </div>
              <div className="flex gap-3 text-[9px] font-bold uppercase tracking-wider text-[#4F3824]/85">
                <span>Menu</span>
                <span>Our Roast</span>
                <span>Study Lounge</span>
              </div>
            </div>

            <div className="mt-4 text-center space-y-2">
              <h2 className="text-sm font-extrabold font-tight leading-tight max-w-[200px] mx-auto">
                Your Sanctuary For Single-Origin Pour-overs.
              </h2>
              <p className="text-[9px] text-slate-500 max-w-[260px] mx-auto leading-relaxed">
                Experience Small-Batch Roasting Crafted to Bring Local Freelancers and Coffee Lovers Together.
              </p>
              <button className="rounded bg-[#EEDC82] border border-[#d1bd5a] text-[#4F3824] font-bold text-[9px] uppercase tracking-wider px-3.5 py-1 mt-2.5">
                Book study reservation
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-md p-6 h-64 overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-5 w-5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Document Transcript</span>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed line-clamp-5">
            {item.textBody}
          </p>
        </div>
        <span className="text-[9px] text-slate-400 font-mono">Document Format: copy pass draft</span>
      </div>
    );
  };

  const clientFiles = [
    { name: 'Brand Guidelines V2.pdf', size: '4.2 MB', type: 'PDF', date: 'Jul 01, 2026' },
    { name: 'Ad Account Performance Report Q2.pdf', size: '1.8 MB', type: 'PDF', date: 'Jun 28, 2026' },
    { name: 'Primary Vector Logo Assets.zip', size: '18.5 MB', type: 'ZIP', date: 'May 12, 2026' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F6] font-sans">
      {/* 1. BRANDED CLIENT SIDEBAR */}
      <aside className="w-64 bg-[#4F3824] text-[#FDFBF7] flex flex-col justify-between shrink-0 shadow-xl border-r border-[#3a291b]">
        <div>
          {/* Logo Header */}
          <div className="flex h-16 items-center gap-3 border-b border-[#3a291b] px-6 bg-[#3a291b]/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEDC82] text-[#4F3824] font-extrabold text-xl border border-[#d1bd5a]">
              B
            </div>
            <div>
              <span className="font-extrabold tracking-wide text-sm block">Bloom Café</span>
              <span className="text-[9px] text-[#EEDC82] font-bold uppercase tracking-widest leading-none">Collaboration Workspace</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-2">
            {([
              { id: 'overview', label: 'Dashboard Overview', icon: Briefcase },
              { id: 'progress', label: 'Campaign Progress', icon: TrendingUp },
              { id: 'calendar', label: 'Content Calendar', icon: CalendarIcon },
              { id: 'approvals', label: 'Deliverables review', icon: CheckCircle2 },
              { id: 'files', label: 'Shared Files', icon: FileText },
              { id: 'invoices', label: 'Billing & Invoices', icon: IndianRupee }
            ] as const).map((tab) => {
              const Icon = tab.icon;
              const isActive = portalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPortalTab(tab.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#EEDC82] text-[#4F3824] shadow-md border border-[#d1bd5a]'
                      : 'text-[#E0C39E] hover:bg-[#3a291b]/40 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logged In User */}
        <div className="border-t border-[#3a291b] p-4 flex items-center justify-between gap-2 bg-[#3a291b]/20">
          <div className="flex items-center gap-3 rounded-lg px-3 py-1.5 flex-1 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E0C39E]/25 text-[#EEDC82] font-semibold text-xs border border-[#E0C39E]/30 shrink-0">
              {activeUser?.name?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-white">{activeUser?.name || 'Meera'}</p>
              <p className="truncate text-[9px] text-[#E0C39E] font-semibold uppercase tracking-wider mt-0.5">Client Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-[#E0C39E] hover:text-rose-300 hover:bg-[#3a291b]/40 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN SCROLL VIEW */}
      <main className="flex-1 overflow-y-auto p-8 min-w-0 relative">
        {loading ? (
          <div className="flex h-screen items-center justify-center absolute inset-0 bg-[#FAF9F6]/80">
            <RefreshCw className="h-8 w-8 text-[#4F3824] animate-spin" />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-[#E0C39E]/20 pb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#4F3824] font-tight capitalize">
                  Bloom Collaboration console
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage approvals, track active task checklists, download creative resources, and audit invoices.
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Assigned PM</span>
                <span className="font-bold text-[#4F3824] block mt-0.5">Priya Sharma</span>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {portalTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Campaign Health</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Healthy
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Awaiting Approvals</p>
                    <p className={`text-xs font-bold mt-1.5 ${approvals.filter((a) => a.status === 'PENDING').length > 0 ? 'text-amber-600' : 'text-slate-650'}`}>
                      {approvals.filter((a) => a.status === 'PENDING').length} Items
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Campaigns</p>
                    <p className="text-xs font-bold text-slate-800 mt-1.5">{projects.length} Project</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Completed Tasks</p>
                    <p className="text-xs font-bold text-slate-800 mt-1.5">
                      {tasks.filter((t) => t.status === 'DONE').length} of {tasks.length}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 rounded-2xl border border-slate-250 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold text-[#4F3824] uppercase tracking-wider">Collaboration Overview</h3>
                      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                        Welcome to your Bloom Café workspace. Review and approve visual assets, check release dates on the calendar, track active timelines, and communicate updates to Priya.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setPortalTab('approvals')}
                        className="rounded-lg bg-[#4F3824] hover:bg-[#3a291b] text-white font-bold text-xs px-4 py-2 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        Verify Deliverables <ArrowUpRight className="h-4 w-4 text-[#EEDC82]" />
                      </button>
                      <button
                        onClick={() => setPortalTab('progress')}
                        className="rounded-lg border border-slate-200 bg-white hover:bg-slate-55 text-slate-700 font-semibold text-xs px-4 py-2 transition-colors"
                      >
                        Track Campaign Checklist
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-250 bg-white p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Your Project Lead</h3>
                      <div className="flex items-center gap-3 mt-4">
                        <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          PS
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Priya Sharma</h4>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Account Coordinator</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <a href="mailto:priya@agencyos.ai" className="w-full block text-center rounded-lg border border-slate-205 text-xs font-semibold py-1.5 hover:bg-slate-50 transition-colors">
                        Email Agency Lead
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROGRESS CHECK */}
            {portalTab === 'progress' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Campaigns & Checklists</h3>
                
                {projects.map((proj) => {
                  const projTasks = tasks.filter((t) => t.projectId === proj.id);
                  const doneTasks = projTasks.filter((t) => t.status === 'DONE');
                  const progressPct = projTasks.length > 0 ? Math.round((doneTasks.length / projTasks.length) * 100) : 0;
                  const budgetSpentPct = proj.budget > 0 ? Math.round((proj.spent / proj.budget) * 100) : 0;

                  return (
                    <div key={proj.id} className="space-y-6">
                      {/* Project KPI Card */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2 space-y-4">
                          <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[9px] font-bold text-indigo-700 uppercase tracking-wider">
                              {proj.status.replace('_', ' ')}
                            </span>
                            <h3 className="text-sm font-bold text-slate-800 mt-2">{proj.name}</h3>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-500">Task Completion Rate</span>
                              <span className="text-indigo-600 font-bold">{progressPct}% ({doneTasks.length}/{projTasks.length} tasks)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-650 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-2">
                          <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Allocated Budget Status</h4>
                          <div>
                            <span className="text-xl font-bold text-slate-800 font-tight">₹{proj.spent.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 font-semibold"> / ₹{proj.budget.toLocaleString()} allocated</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#EEDC82] h-full rounded-full" style={{ width: `${budgetSpentPct}%` }} />
                          </div>
                          <span className="text-[9px] text-slate-450 block font-semibold">{budgetSpentPct}% budget limit consumed</span>
                        </div>
                      </div>

                      {/* Checklist */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-[#4F3824] uppercase tracking-wider border-b border-slate-100 pb-2">
                          Campaign Task Checklist
                        </h4>
                        <div className="divide-y divide-slate-100 text-xs">
                          {projTasks.map((t) => {
                            const isDone = t.status === 'DONE';
                            return (
                              <div key={t.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                  <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 ${
                                    isDone ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'border-slate-300 bg-white'
                                  }`}>
                                    {isDone && <Check className="h-3 w-3" />}
                                  </div>
                                  <div>
                                    <span className={`font-semibold block ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                      {t.title}
                                    </span>
                                    {t.dueDate && (
                                      <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                                        Due: {new Date(t.dueDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider rounded px-2.5 py-0.5 ${
                                  t.status === 'DONE' ? 'bg-emerald-50 text-emerald-700' :
                                  t.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-750' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {t.status.replace('_', ' ')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: CALENDAR */}
            {portalTab === 'calendar' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Collaboration Calendar</h3>
                    <p className="text-xs text-slate-400 mt-1">Verify scheduled meetings, release dates, and campaign task due dates.</p>
                  </div>
                  <div className="bg-[#4F3824] text-[#EEDC82] text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border border-[#3a291b] flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#EEDC82]" /> Read-Only Mode
                  </div>
                </div>
                {/* Embed in readOnly Mode so clients cannot add/delete events */}
                <CalendarView clientId={activeClient?.id} isClientView={true} readOnly={true} />
              </div>
            )}

            {/* TAB 4: DELIVERABLES REVIEW */}
            {portalTab === 'approvals' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xs font-bold text-slate-455 uppercase tracking-wider">Deliverables review queue</h3>

                <div className="space-y-8">
                  {approvals.map((item) => {
                    const statusBadge = {
                      PENDING: 'bg-amber-50 border border-amber-200 text-amber-700',
                      APPROVED: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
                      CHANGES_REQUESTED: 'bg-rose-50 border border-rose-200 text-rose-700',
                    }[item.status as 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED'];

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm grid gap-8 md:grid-cols-2 items-start"
                      >
                        {/* Visual mockup simulator */}
                        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-center min-h-[300px]">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-3 block text-center">
                            Visual Preview Frame
                          </span>
                          {renderVisualMockup(item)}
                        </div>

                        {/* Text and Actions */}
                        <div className="flex flex-col justify-between h-full space-y-6 text-xs">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 border px-2 py-0.5 rounded text-slate-500">
                                  {item.type} Deliverable
                                </span>
                                <h3 className="text-sm font-extrabold text-slate-900 mt-2 leading-snug">{item.title}</h3>
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 ${statusBadge}`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </div>

                            {item.textBody && (
                              <div className="rounded-xl bg-slate-50 p-4 border border-slate-150 max-h-48 overflow-y-auto">
                                <MarkdownRenderer content={item.textBody} />
                              </div>
                            )}

                            {item.feedback && (
                              <div className="rounded-lg bg-rose-50/50 border border-rose-100 p-3.5 text-rose-800 leading-normal">
                                <strong className="block mb-0.5">Feedback Sent:</strong>
                                {item.feedback}
                              </div>
                            )}
                          </div>

                          {/* Client Interactive Approval Forms */}
                          {item.status === 'PENDING' && (
                            <div className="border-t border-slate-100 pt-4 font-semibold">
                              {feedbackTargetId === item.id ? (
                                <div className="space-y-3">
                                  <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    placeholder="Write instructions detailing requested changes for the agency designers..."
                                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-rose-500 bg-white"
                                    rows={3}
                                    required
                                  />
                                  <div className="flex justify-end gap-2 text-xs">
                                    <button
                                      onClick={() => setFeedbackTargetId(null)}
                                      className="rounded border border-slate-250 hover:bg-slate-50 px-3.5 py-1.5 text-slate-500 font-bold"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(item.id, 'CHANGES_REQUESTED', feedbackText)}
                                      className="rounded bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 font-bold"
                                    >
                                      Send Request
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-3 justify-end text-xs">
                                  <button
                                    onClick={() => setFeedbackTargetId(item.id)}
                                    className="rounded-lg border border-rose-250 hover:bg-rose-50 text-rose-600 px-4 py-2 font-bold"
                                  >
                                    Request Changes
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(item.id, 'APPROVED')}
                                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 font-bold"
                                  >
                                    Approve Deliverable
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: FILES */}
            {portalTab === 'files' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Shared Brand Assets</h3>
                <div className="divide-y divide-slate-150 text-xs">
                  {clientFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[#FAF9F6] border border-[#E0C39E]/25 p-2.5 text-[#4F3824]">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-700">{file.name}</h4>
                          <p className="text-[10px] text-slate-450 font-semibold mt-0.5">{file.size} · Uploaded {file.date}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 rounded-lg border border-slate-205 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700">
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: BILLING */}
            {portalTab === 'invoices' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Invoice History</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left text-slate-500">
                    <thead className="text-[10px] text-slate-400 bg-slate-50 border-b border-slate-200 uppercase font-bold">
                      <tr>
                        <th className="px-6 py-3">Invoice Number</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Due Date</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 bg-white">
                      {invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="px-6 py-4 font-bold text-slate-800">{inv.invoiceNumber}</td>
                          <td className="px-6 py-4 font-mono font-bold text-[#4F3824]">
                            ₹{inv.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {new Date(inv.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="rounded bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
