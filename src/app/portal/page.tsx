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
  Percent
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Type</label>
                      <select
                        value={appType}
                        onChange={(e) => setAppType(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="IMAGE">Social Post (IMAGE)</option>
                        <option value="VIDEO">Video Reel (VIDEO)</option>
                        <option value="LINK">Website Mockup (LINK)</option>
                        <option value="TEXT">Copy Document (TEXT)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Visual URL / cover image</label>
                      <input
                        type="text"
                        value={appContentUrl}
                        onChange={(e) => setAppContentUrl(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/..."
                        className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white"
                      />
                    </div>
                  </div>

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
                          <td className="px-6 py-4">
                            {app.status === 'PENDING' && (
                              <button
                                onClick={() => handleForceApprove(app.id)}
                                className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold"
                              >
                                Force Approve
                              </button>
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
    </div>
  );
}
