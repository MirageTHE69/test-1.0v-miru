'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  Phone,
  Mail,
  User,
  X,
  ArrowRight,
  TrendingUp,
  FileText,
  Check,
  ChevronRight,
  Briefcase,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface LeadType {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  status: string; // LEAD, QUALIFIED, PROPOSAL_SENT, WON, LOST
  value: number;
  proposalText: string | null;
  aiDraftReady: boolean;
  createdAt: string;
}

export default function CrmPage() {
  const { reloadContext } = useApp();
  const [leads, setLeads] = useState<LeadType[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [proposalText, setProposalText] = useState('');

  // Add Lead Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formStatus, setFormStatus] = useState('LEAD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Business name and contact email are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          contactName: formContactName,
          email: formEmail,
          phone: formPhone,
          value: parseFloat(formValue) || 0,
          status: formStatus,
        }),
      });

      if (res.ok) {
        setFormName('');
        setFormContactName('');
        setFormEmail('');
        setFormPhone('');
        setFormValue('');
        setFormStatus('LEAD');
        setIsAddModalOpen(false);
        await fetchLeads();
      } else {
        const errData = await res.json();
        setFormError(errData.error || 'Failed to create lead.');
      }
    } catch (err) {
      console.error(err);
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch leads
  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/crm');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Failed to fetch leads', error);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      if (res.ok) {
        await fetchLeads();
        // If WON, reload global app context to sync client list in dropdown
        if (newStatus === 'WON') {
          await reloadContext();
        }
        // Update drawer selection
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleGenerateAiProposal = async (lead: LeadType) => {
    setIsDraftingAi(true);
    setTimeout(async () => {
      const mockProposal = `**AI PROPOSAL: ${lead.name.toUpperCase()} MARKETING STRATEGY**\n\n1. **Core Objective**: Elevate brand awareness and direct client booking channels by 25% within 90 days.\n2. **AI-driven Social Media**: Weekly publication of customized, localized creatives tailored to target demographics.\n3. **Omnichannel Inbox**: Unify customer leads from WhatsApp and website chat to drive a 3x higher booking rate.\n4. **Budget proposal**: INR ${lead.value.toLocaleString()}/month retainer.`;
      
      try {
        const res = await fetch('/api/crm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: lead.id,
            proposalText: mockProposal,
            aiDraftReady: true,
          }),
        });
        if (res.ok) {
          setProposalText(mockProposal);
          await fetchLeads();
          setSelectedLead((prev) => prev ? { ...prev, proposalText: mockProposal, aiDraftReady: true } : null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsDraftingAi(false);
      }
    }, 1500);
  };

  // Group leads by column
  const getLeadsByStatus = (status: string) => {
    return leads.filter((lead) => lead.status === status);
  };

  const columns = [
    { title: 'Lead', status: 'LEAD', badgeColor: 'bg-indigo-100 text-indigo-800' },
    { title: 'Qualified', status: 'QUALIFIED', badgeColor: 'bg-blue-100 text-blue-800' },
    { title: 'Proposal Sent', status: 'PROPOSAL_SENT', badgeColor: 'bg-amber-100 text-amber-800' },
    { title: 'Won', status: 'WON', badgeColor: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-tight">CRM & Sales Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage agency prospects. Leads converted to "Won" automatically initialize new workspaces.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 shadow-sm transition-all"
        >
          <span>Add Lead</span>
        </button>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 items-start">
        {columns.map((col) => {
          const colLeads = getLeadsByStatus(col.status);
          const colValue = colLeads.reduce((acc, lead) => acc + lead.value, 0);

          return (
            <div key={col.status} className="rounded-xl bg-slate-100/70 p-4 border border-slate-200 flex flex-col max-h-[80vh]">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">{col.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.badgeColor}`}>
                    {colLeads.length}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  ₹{(colValue / 1000).toFixed(0)}k
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-4">
                {colLeads.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
                    No leads in this stage
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => {
                        setSelectedLead(lead);
                        setProposalText(lead.proposalText || '');
                        setIsDrawerOpen(true);
                      }}
                      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow transition-all cursor-pointer card-hover"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-xs font-bold text-slate-800">{lead.name}</h3>
                        {lead.aiDraftReady && (
                          <span className="flex items-center gap-0.5 text-[9px] font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100 animate-pulse">
                            <Sparkles className="h-2.5 w-2.5" /> Ready
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          ₹{lead.value.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer Details Panel */}
      {isDrawerOpen && selectedLead && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Wrapper */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white border-l border-slate-200 z-50 shadow-2xl flex flex-col slide-in-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6 bg-slate-50">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Lead Details
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedLead.name}</h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats & Actions Quick View */}
              <div className="flex items-center justify-between border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Pipeline Value</p>
                  <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                    ₹{selectedLead.value.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-xs text-slate-400 font-medium mb-1">Status Action</p>
                  <div className="flex gap-2">
                    {selectedLead.status === 'LEAD' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedLead.id, 'QUALIFIED')}
                        className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        Qualify Lead
                      </button>
                    )}
                    {selectedLead.status === 'QUALIFIED' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedLead.id, 'PROPOSAL_SENT')}
                        className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        Mark proposal sent
                      </button>
                    )}
                    {selectedLead.status === 'PROPOSAL_SENT' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedLead.id, 'WON')}
                        className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" /> Convert to Won
                      </button>
                    )}
                    {selectedLead.status === 'WON' && (
                      <span className="rounded bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 animate-pulse" /> Client Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Contact Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 border border-slate-100 rounded-lg p-3 bg-slate-50/20">
                    <User className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Primary Contact</p>
                      <p className="text-xs font-bold text-slate-700">{selectedLead.contactName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border border-slate-100 rounded-lg p-3 bg-slate-50/20">
                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Email Address</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{selectedLead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border border-slate-100 rounded-lg p-3 bg-slate-50/20 col-span-2">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Phone Number</p>
                      <p className="text-xs font-bold text-slate-700">{selectedLead.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Copywriter Proposal Section */}
              <div className="border border-indigo-100 rounded-xl p-6 bg-gradient-to-br from-indigo-50/20 via-white to-white space-y-4">
                <div className="flex justify-between items-center border-b border-indigo-100/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600 animate-spin" />
                    <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">AI Proposal Draft</h3>
                  </div>
                  {!selectedLead.aiDraftReady && (
                    <button
                      onClick={() => handleGenerateAiProposal(selectedLead)}
                      disabled={isDraftingAi}
                      className="rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 transition-all disabled:opacity-50"
                    >
                      {isDraftingAi ? 'Drafting...' : 'Generate with Copilot'}
                    </button>
                  )}
                </div>

                {selectedLead.aiDraftReady ? (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedLead.proposalText}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedLead.proposalText || '');
                          alert('Copied proposal draft to clipboard!');
                        }}
                        className="rounded border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3 py-1.5"
                      >
                        Copy text
                      </button>
                      {selectedLead.status === 'QUALIFIED' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedLead.id, 'PROPOSAL_SENT')}
                          className="rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          Send Draft to Client <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    {isDraftingAi ? (
                      <div className="flex flex-col items-center gap-2">
                        <Sparkles className="h-6 w-6 text-indigo-600 animate-bounce" />
                        <p className="font-semibold text-indigo-900 animate-pulse">AI Agent is studying Brand Memory & drafting proposal...</p>
                      </div>
                    ) : (
                      'No proposal drafted yet. Click "Generate with Copilot" to trigger AI.'
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {/* Add Lead Modal Overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">Add New Prospect</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Business Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Acme Studio"
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contact Person</label>
                <input
                  type="text"
                  value={formContactName}
                  onChange={(e) => setFormContactName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. hello@acme.com"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Budget Value (INR)</label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="LEAD">Lead</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 shadow-sm transition-all"
                >
                  {isSubmitting ? 'Adding...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
