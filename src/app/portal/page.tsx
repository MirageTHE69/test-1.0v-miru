'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import MarkdownRenderer from '@/components/MarkdownRenderer';
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
  Plus,
  Trash2,
  Lock,
  User,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Upload,
  Film,
  Image as ImageIcon,
  Heart,
  Share2,
  Bookmark,
  Smartphone,
  Play,
  Laptop,
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
  status: string;
  budget: number;
  spent: number;
  createdAt: string;
}

interface TaskType {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string;
  assignee: {
    name: string;
    role: string;
  } | null;
}

export default function AgencyManagerPortalPage() {
  const { activeClient } = useApp();
  const [approvals, setApprovals] = useState<ApprovalType[]>([]);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalTab, setPortalTab] = useState<'overview' | 'approvals' | 'invoices'>('overview');

  // Creation forms states
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [appTitle, setAppTitle] = useState('');
  const [appType, setAppType] = useState('IMAGE');
  const [appContentUrl, setAppContentUrl] = useState('');
  const [appTextBody, setAppTextBody] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // File upload and modal preview states
  const [uploadSource, setUploadSource] = useState<'url' | 'file'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<ApprovalType | null>(null);

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invNumber, setInvNumber] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDueDate, setInvDueDate] = useState('');
  const [submittingInvoice, setSubmittingInvoice] = useState(false);

  const fetchPortalData = async () => {
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
    fetchPortalData();
  }, [activeClient]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAppContentUrl(data.url);
        setUploadedFileName(data.fileName);
        setUploadedFileSize(data.fileSize);
      } else {
        alert('Failed to upload file. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setAppContentUrl('');
    setUploadedFileName('');
    setUploadedFileSize(null);
  };

  // Render mock preview containers (matches the client dashboard preview layouts)
  const renderVisualMockup = (item: ApprovalType) => {
    const defaultImg = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80';
    const mockImage = item.contentUrl || defaultImg;

    if (item.type === 'IMAGE') {
      return (
        <div className="bg-[#FAF9F6] border border-slate-200 rounded-2xl shadow-inner max-w-sm mx-auto overflow-hidden w-full text-slate-800">
          <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-800 text-white flex items-center justify-center font-bold text-sm border border-amber-900 shadow-xs shrink-0">
                {activeClient?.name.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block text-left">{activeClient?.name}</span>
                <span className="text-[10px] text-slate-400 block font-semibold leading-none text-left">Sponsored · Post Preview</span>
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
            <div className="text-xs text-left">
              <span className="font-bold text-slate-800">142 Likes</span>
              <p className="text-[11px] text-slate-650 mt-1 leading-relaxed">
                <span className="font-bold text-slate-800 mr-1.5">{activeClient?.name.toLowerCase().replace(/\s+/g, '')}</span>
                Seek shelter in our warm, aromatic coffee workspace this monsoon season...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (item.type === 'VIDEO') {
      const isUploadedVideo = item.contentUrl && (
        item.contentUrl.endsWith('.mp4') || 
        item.contentUrl.endsWith('.webm') || 
        item.contentUrl.endsWith('.ogg') ||
        item.contentUrl.startsWith('/uploads/')
      );

      return (
        <div className="bg-slate-900 border-4 border-slate-800 rounded-3xl shadow-xl max-w-[280px] mx-auto overflow-hidden relative aspect-[9/16] text-white w-full">
          {isUploadedVideo ? (
            <video 
              src={item.contentUrl || undefined} 
              controls 
              className="absolute inset-0 w-full h-full object-cover opacity-85"
              playsInline
            />
          ) : (
            <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=80" alt="Video cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 flex flex-col justify-between p-4 pointer-events-none">
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] font-bold tracking-wide">Reels Preview</span>
              <Smartphone className="h-4 w-4 text-slate-400" />
            </div>

            {!isUploadedVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/40 shadow-lg">
                  <Play className="h-6 w-6 text-white fill-white ml-1" />
                </div>
              </div>
            )}

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

            <div className="space-y-2 mt-auto text-left">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-amber-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {activeClient?.name.charAt(0)}
                </div>
                <span className="text-xs font-bold">{activeClient?.name.toLowerCase().replace(/\s+/g, '')}</span>
              </div>
              <p className="text-[10px] text-slate-250 leading-relaxed font-sans line-clamp-2">
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
        <div className="bg-[#F8F9FD] border border-slate-300 rounded-2xl shadow-xl overflow-hidden flex flex-col h-72 w-full text-slate-800">
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <div className="h-3 w-3 rounded-full bg-rose-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-md py-0.5 px-3 text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 truncate">
              <Globe className="h-3 w-3 text-slate-300 shrink-0" />
              {mockImage}
            </div>
            <Laptop className="h-4 w-4 text-slate-400 shrink-0" />
          </div>

          <div className="flex-1 overflow-y-auto bg-[#FDFBF7] p-5 text-[#4F3824] flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-[#E0C39E]/30 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded bg-[#4F3824] text-white flex items-center justify-center font-bold text-xs shrink-0">B</div>
                <span className="text-xs font-extrabold font-tight">BLOOM CAFÉ</span>
              </div>
              <div className="flex gap-3 text-[9px] font-bold uppercase tracking-wider text-[#4F3824]/85">
                <span>Menu</span>
                <span>Our Roast</span>
              </div>
            </div>

            <div className="my-auto text-center space-y-2">
              <h2 className="text-sm font-extrabold font-tight leading-tight max-w-[200px] mx-auto">
                Sanctuary For Single-Origin Pour-overs.
              </h2>
              <a href={mockImage} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[9px] text-indigo-650 hover:underline font-bold">
                Open live link <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-md p-6 h-64 overflow-y-auto flex flex-col justify-between w-full text-slate-800">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="h-5 w-5 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Document Transcript</span>
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed line-clamp-5 text-left">
            {item.textBody}
          </p>
        </div>
        <span className="text-[9px] text-slate-400 font-mono text-left">Document Format: copy pass draft</span>
      </div>
    );
  };

  const handleCreateApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !appTitle.trim()) return;
    setSubmittingApproval(true);

    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_APPROVAL',
          title: appTitle,
          type: appType,
          contentUrl: appContentUrl,
          textBody: appTextBody,
          clientId: activeClient.id,
        }),
      });

      if (res.ok) {
        setAppTitle('');
        setAppContentUrl('');
        setAppTextBody('');
        setUploadedFileName('');
        setUploadedFileSize(null);
        setShowApprovalForm(false);
        fetchPortalData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !invNumber.trim() || !invAmount) return;
    setSubmittingInvoice(true);

    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_INVOICE',
          invoiceNumber: invNumber,
          amount: invAmount,
          dueDate: invDueDate,
          clientId: activeClient.id,
        }),
      });

      if (res.ok) {
        setInvNumber('');
        setInvAmount('');
        setInvDueDate('');
        setShowInvoiceForm(false);
        fetchPortalData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleForceApprove = async (approvalId: string) => {
    const confirmApprove = window.confirm('Force approve this deliverable on behalf of the client?');
    if (!confirmApprove) return;

    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId,
          status: 'APPROVED',
        }),
      });

      if (res.ok) {
        fetchPortalData();
      }
    } catch (err) {
      console.error(err);
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Workspace Manager Console
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-tight">
            Client Campaign Manager — {activeClient.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage deliverables approvals queue, create new project invoices, and preview the branded client console.
          </p>
        </div>

        {/* Live Client Link */}
        <a
          href="/client"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <span>Open Live Client Dashboard</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 gap-2 pb-px bg-white/45 p-1.5 rounded-lg border">
        {([
          { id: 'overview', label: 'Client SW Overview' },
          { id: 'approvals', label: 'Approvals queue' },
          { id: 'invoices', label: 'Invoices & Billing' }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPortalTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              portalTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW */}
          {portalTab === 'overview' && (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Client Contact Swatch */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Account Specifications</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Details from sqlite tables.</p>
                </div>
                <div className="space-y-4 text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4.5 w-4.5 text-indigo-650 shrink-0" />
                    <span className="font-bold">Client Name:</span>
                    <span>{activeClient.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4.5 w-4.5 text-indigo-650 shrink-0" />
                    <span className="font-bold">Client Email:</span>
                    <span>{activeClient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4.5 w-4.5 text-indigo-650 shrink-0" />
                    <span className="font-bold">Client Phone:</span>
                    <span>{activeClient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <TrendingUp className="h-4.5 w-4.5 text-indigo-650 shrink-0" />
                    <span className="font-bold">Health Score:</span>
                    <span className={`font-bold uppercase tracking-wider ${
                      activeClient.healthScore > 80 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {activeClient.healthScore}% ({activeClient.status.toLowerCase()})
                    </span>
                  </div>
                </div>
              </div>

              {/* Projects List Card */}
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Campaigns</h3>
                <div className="divide-y divide-slate-100">
                  {projects.map((proj) => {
                    const projTasks = tasks.filter((t) => t.projectId === proj.id);
                    const doneTasks = projTasks.filter((t) => t.status === 'DONE');
                    const progressPct = projTasks.length > 0 ? Math.round((doneTasks.length / projTasks.length) * 100) : 0;
                    
                    return (
                      <div key={proj.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-slate-850">{proj.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Budget: ₹{proj.budget.toLocaleString()} · Spent: ₹{proj.spent.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-indigo-600">{progressPct}% Complete</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">({doneTasks.length}/{projTasks.length} tasks)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPROVALS QUEUE */}
          {portalTab === 'approvals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Pending and Logged approvals</h3>
                <button
                  onClick={() => setShowApprovalForm(!showApprovalForm)}
                  className="rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs px-3.5 py-2 hover:bg-indigo-100 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Publish New Deliverable
                </button>
              </div>

              {/* Publish Approval Form */}
              {showApprovalForm && (
                <form onSubmit={handleCreateApproval} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 max-w-xl animate-fade-in text-xs font-semibold text-slate-700">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Publish Deliverable for Client Verification
                  </h4>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deliverable Title</label>
                    <input
                      type="text"
                      value={appTitle}
                      onChange={(e) => setAppTitle(e.target.value)}
                      placeholder="e.g. Website Layout Draft v3"
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Type</label>
                      <select
                        value={appType}
                        onChange={(e) => {
                          const newType = e.target.value;
                          setAppType(newType);
                          // Default uploadSource based on type
                          if (newType === 'LINK') {
                            setUploadSource('url');
                          } else if (newType === 'TEXT') {
                            setUploadSource('url'); // hidden anyway
                          } else {
                            setUploadSource('file');
                          }
                          // Clear previous file values
                          setAppContentUrl('');
                          setUploadedFileName('');
                          setUploadedFileSize(null);
                        }}
                        className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="IMAGE">Social Post (IMAGE)</option>
                        <option value="VIDEO">Video Reel (VIDEO)</option>
                        <option value="LINK">Website Mockup (LINK)</option>
                        <option value="TEXT">Copy Document (TEXT)</option>
                      </select>
                    </div>

                    {(appType === 'IMAGE' || appType === 'VIDEO') && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Asset Source</label>
                        <div className="flex gap-2 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => {
                              setUploadSource('file');
                              setAppContentUrl('');
                            }}
                            className={`flex-1 py-1 text-center rounded-md font-bold text-[10px] uppercase transition-all ${
                              uploadSource === 'file'
                                ? 'bg-white text-indigo-650 shadow-xs'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadSource('url');
                              setAppContentUrl('');
                            }}
                            className={`flex-1 py-1 text-center rounded-md font-bold text-[10px] uppercase transition-all ${
                              uploadSource === 'url'
                                ? 'bg-white text-indigo-650 shadow-xs'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            Paste URL
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Conditional Upload/URL Area */}
                  {appType !== 'TEXT' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {appType === 'LINK'
                          ? 'Mockup / Website URL'
                          : uploadSource === 'file'
                          ? 'Upload Photo/Video'
                          : 'Visual URL / Cover Image Link'}
                      </label>

                      {appType === 'LINK' || uploadSource === 'url' ? (
                        <input
                          type="text"
                          value={appContentUrl}
                          onChange={(e) => setAppContentUrl(e.target.value)}
                          placeholder={
                            appType === 'LINK'
                              ? 'e.g. https://bloomcafe.com/mockup'
                              : 'e.g. https://images.unsplash.com/photo-...'
                          }
                          className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white outline-none focus:border-indigo-500"
                          required
                        />
                      ) : (
                        // File Upload Zone
                        <div className="space-y-2">
                          {isUploading ? (
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 bg-white min-h-[140px] space-y-3">
                              <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                              <span className="text-xs text-slate-550 font-bold">Uploading asset to server...</span>
                            </div>
                          ) : appContentUrl ? (
                            // File Upload Success State & Mini-Preview
                            <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-white gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                                  {appType === 'IMAGE' ? (
                                    <img src={appContentUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full w-full bg-slate-100">
                                      <Film className="h-5 w-5 text-indigo-500" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 text-left">
                                  <p className="text-xs font-bold text-slate-800 truncate" title={uploadedFileName}>
                                    {uploadedFileName || 'Uploaded file'}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                    {uploadedFileSize
                                      ? `${(uploadedFileSize / (1024 * 1024)).toFixed(2)} MB`
                                      : 'Successfully uploaded'}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors shrink-0"
                                title="Remove file"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          ) : (
                            // Big Dotted Dropzone
                            <div>
                              <input
                                type="file"
                                accept={appType === 'IMAGE' ? 'image/*' : 'video/*'}
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-uploader-input"
                              />
                              <label
                                htmlFor="file-uploader-input"
                                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-white hover:bg-slate-50/50 cursor-pointer transition-colors text-center group min-h-[140px]"
                              >
                                <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-150 transition-colors">
                                  <Upload className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 mt-3 group-hover:text-indigo-650 transition-colors">
                                  Choose a {appType.toLowerCase()} file
                                </span>
                                <span className="text-[9px] text-slate-400 font-semibold mt-1">
                                  Drag & drop or browse from PC ({appType === 'IMAGE' ? 'PNG, JPG, WEBP' : 'MP4, WEBM'})
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deliverable Copy Caption / Details</label>
                    <textarea
                      value={appTextBody}
                      onChange={(e) => setAppTextBody(e.target.value)}
                      placeholder="Add markdown copy text caption to display inside deliverables..."
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white outline-none focus:border-indigo-500 min-h-[80px]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowApprovalForm(false)}
                      className="rounded px-3.5 py-1.5 text-slate-400 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingApproval}
                      className="rounded bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 font-bold"
                    >
                      {submittingApproval ? 'Publishing...' : 'Publish to Client'}
                    </button>
                  </div>
                </form>
              )}

              {/* Approvals Table List */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-xs text-left text-slate-550">
                  <thead className="text-[10px] text-slate-400 bg-slate-50 border-b border-slate-200 uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3">Deliverable</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Client Status</th>
                      <th className="px-6 py-3">Client Feedback comment</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {approvals.map((app) => {
                      const statusColor = {
                        PENDING: 'bg-amber-50 border-amber-200 text-amber-700',
                        APPROVED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                        CHANGES_REQUESTED: 'bg-rose-50 border-rose-200 text-rose-700',
                      }[app.status as 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED'];

                      return (
                        <tr key={app.id}>
                          <td className="px-6 py-4 font-bold text-slate-800 max-w-[200px] truncate">{app.title}</td>
                          <td className="px-6 py-4 uppercase font-semibold text-slate-400">{app.type}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
                              {app.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] max-w-[250px] truncate">
                            {app.feedback ? (
                              <span className="text-slate-650 bg-slate-50 px-2 py-1 rounded border border-slate-100 block">
                                {app.feedback}
                              </span>
                            ) : (
                              <span className="text-slate-350 italic">No feedback submitted</span>
                            )}
                          </td>
                          <td className="px-6 py-4 flex items-center gap-3">
                            <button
                              onClick={() => setPreviewItem(app)}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition-all"
                            >
                              Preview
                            </button>
                            {app.status === 'PENDING' && (
                              <>
                                <span className="text-slate-200">|</span>
                                <button
                                  onClick={() => handleForceApprove(app.id)}
                                  className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition-all"
                                >
                                  Force Approve
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INVOICES & BILLING */}
          {portalTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Billing Log</h3>
                <button
                  onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                  className="rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs px-3.5 py-2 hover:bg-indigo-100 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Create New Invoice
                </button>
              </div>

              {/* Create Invoice Form */}
              {showInvoiceForm && (
                <form onSubmit={handleCreateInvoice} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 max-w-xl animate-fade-in text-xs font-semibold text-slate-700">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Create Invoice & Log Billing
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Invoice Number</label>
                      <input
                        type="text"
                        value={invNumber}
                        onChange={(e) => setInvNumber(e.target.value)}
                        placeholder="e.g. INV-2026-002"
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Amount (₹)</label>
                      <input
                        type="number"
                        value={invAmount}
                        onChange={(e) => setInvAmount(e.target.value)}
                        placeholder="e.g. 45000"
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Due Date</label>
                    <input
                      type="date"
                      value={invDueDate}
                      onChange={(e) => setInvDueDate(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-200/60 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowInvoiceForm(false)}
                      className="rounded px-3.5 py-1.5 text-slate-400 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingInvoice}
                      className="rounded bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 font-bold"
                    >
                      {submittingInvoice ? 'Saving Invoices...' : 'Save Invoice Log'}
                    </button>
                  </div>
                </form>
              )}

              {/* Invoices List Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-xs text-left text-slate-500">
                  <thead className="text-[10px] text-slate-400 bg-slate-50 border-b border-slate-200 uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3">Invoice Number</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="px-6 py-4 font-bold text-slate-800">{inv.invoiceNumber}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                          ₹{inv.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            inv.status === 'PAID' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}>
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
      {/* Visual Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 border px-2 py-0.5 rounded text-slate-550">
                  {previewItem.type} Deliverable
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-center min-h-[300px]">
                {renderVisualMockup(previewItem)}
              </div>

              {previewItem.textBody && (
                <div className="rounded-xl bg-white p-4 border border-slate-200 text-xs">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Caption Copy / Details</h4>
                  <div className="prose prose-sm max-w-none text-slate-700">
                    <MarkdownRenderer content={previewItem.textBody} />
                  </div>
                </div>
              )}

              {previewItem.feedback && (
                <div className="rounded-lg bg-rose-50/55 border border-rose-100 p-3.5 text-xs text-rose-800 leading-normal">
                  <strong className="block mb-0.5">Feedback History:</strong>
                  {previewItem.feedback}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end shrink-0">
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
