'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Mail, Upload, Users, Sparkles, Send, Settings2, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, Eye, RefreshCw, Download, Plus, Trash2,
  AlertCircle, FileText, Copy
} from 'lucide-react';

interface ParsedContact {
  name: string;
  email: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  fromAddress: string;
  replyTo?: string;
  htmlBody: string;
  status: string;
  sentAt?: string;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  createdAt: string;
}

interface DeliveryResult {
  contactId: string;
  email: string;
  success: boolean;
  error?: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'text-slate-500 bg-slate-100',
  SENDING: 'text-amber-600 bg-amber-50',
  SENT: 'text-emerald-600 bg-emerald-50',
  FAILED: 'text-rose-600 bg-rose-50',
};

const DEFAULT_HTML_TEMPLATE = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
  <h1 style="font-size: 28px; font-weight: 800; color: #1a1a1a; margin-bottom: 8px;">
    Hello, {{name}}! 👋
  </h1>
  <p style="font-size: 16px; color: #555555; line-height: 1.7; margin-bottom: 24px;">
    We have something exciting to share with you. Write your message here and personalize it using tokens like {{name}}.
  </p>
  <a href="#" style="display: inline-block; background: #4f46e5; color: #ffffff; font-weight: 700; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 14px;">
    View Details →
  </a>
  <hr style="border: none; border-top: 1px solid #eeeeee; margin: 32px 0;" />
  <p style="font-size: 12px; color: #aaaaaa;">
    You are receiving this email because you subscribed to our list. 
    <a href="#" style="color: #aaaaaa;">Unsubscribe</a>
  </p>
</div>`;

export default function EmailCampaign() {
  const { activeClient } = useApp();

  // ── SMTP / API Settings ──────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [resendApiKey, setResendApiKey] = useState('');
  const [fromAddress, setFromAddress] = useState('');

  // ── Campaign Setup ───────────────────────────────────────────────────────
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('');
  const [replyTo, setReplyTo] = useState('');

  // ── Contact Uploader ─────────────────────────────────────────────────────
  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  const [rawPasteText, setRawPasteText] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Email Body Builder ───────────────────────────────────────────────────
  const [htmlBody, setHtmlBody] = useState(DEFAULT_HTML_TEMPLATE);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');

  // ── Campaign Creation + Sending ──────────────────────────────────────────
  const [step, setStep] = useState<'compose' | 'review' | 'sending' | 'done'>('compose');
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deliveryResults, setDeliveryResults] = useState<DeliveryResult[]>([]);
  const [deliverySummary, setDeliverySummary] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [sendError, setSendError] = useState('');

  // ── Past Campaigns ───────────────────────────────────────────────────────
  const [pastCampaigns, setPastCampaigns] = useState<Campaign[]>([]);
  const [showPastCampaigns, setShowPastCampaigns] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('resend_api_key') || '';
    const savedFrom = localStorage.getItem('resend_from_address') || '';
    setResendApiKey(savedKey);
    setFromAddress(savedFrom);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('resend_api_key', resendApiKey);
    localStorage.setItem('resend_from_address', fromAddress);
    setShowSettings(false);
  };

  // Load past campaigns for active client
  const loadCampaigns = useCallback(async () => {
    if (!activeClient) return;
    setIsLoadingCampaigns(true);
    try {
      const res = await fetch(`/api/campaigns/email?clientId=${activeClient.id}`);
      if (res.ok) {
        const data = await res.json();
        setPastCampaigns(data.campaigns || []);
      }
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, [activeClient]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // ─── File Upload / Parse ─────────────────────────────────────────────────
  const parseFile = async (file: File) => {
    setIsParsingFile(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/campaigns/email/parse-contacts', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Parse failed');
      const data = await res.json();
      setContacts((prev) => {
        const combined = [...prev, ...data.contacts];
        const seen = new Set<string>();
        return combined.filter((c) => {
          if (seen.has(c.email)) return false;
          seen.add(c.email);
          return true;
        });
      });
      if (data.invalidSkipped > 0) setUploadError(`${data.invalidSkipped} invalid email(s) were skipped.`);
    } catch (e: any) {
      setUploadError(e.message || 'Failed to parse file.');
    } finally {
      setIsParsingFile(false);
    }
  };

  const parsePastedText = async () => {
    if (!rawPasteText.trim()) return;
    setIsParsingFile(true);
    setUploadError('');
    try {
      const res = await fetch('/api/campaigns/email/parse-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawPasteText }),
      });
      const data = await res.json();
      setContacts((prev) => {
        const combined = [...prev, ...data.contacts];
        const seen = new Set<string>();
        return combined.filter((c) => {
          if (seen.has(c.email)) return false;
          seen.add(c.email);
          return true;
        });
      });
      setRawPasteText('');
      if (data.invalidSkipped > 0) setUploadError(`${data.invalidSkipped} invalid email(s) were skipped.`);
    } catch (e: any) {
      setUploadError(e.message || 'Failed to parse pasted text.');
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  // ─── AI Copy Generator ───────────────────────────────────────────────────
  const generateWithAI = async () => {
    if (!activeClient) return;
    setIsGeneratingAI(true);
    try {
      const prompt = `Write a complete, professional HTML email for an email marketing campaign called "${campaignName || 'Campaign'}" for the client "${activeClient.name}". 
Subject: ${subject || 'New Update'}
Include a personalization token {{name}} in the greeting. 
The email should be visually clean with inline CSS styling (max-width: 600px). Include a compelling headline, 2-3 paragraphs of body copy, and a clear call-to-action button. 
Follow the client brand guidelines strictly. Return ONLY the HTML — no markdown fences.`;

      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          tab: 'copywriter',
          clientId: activeClient.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Strip any markdown fences if present
        const cleaned = (data.message || '').replace(/```html?/gi, '').replace(/```/g, '').trim();
        if (cleaned) setHtmlBody(cleaned);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // ─── Save & Send ─────────────────────────────────────────────────────────
  const saveCampaign = async (): Promise<string | null> => {
    if (!activeClient) return null;
    setIsSaving(true);
    try {
      const res = await fetch('/api/campaigns/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient.id,
          name: campaignName,
          subject,
          fromName,
          replyTo,
          fromAddress,
          htmlBody,
          resendApiKey: resendApiKey || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      return data.campaign.id;
    } catch (e: any) {
      setSendError(e.message || 'Failed to save campaign.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const uploadContacts = async (campaignId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/campaigns/email/${campaignId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleReviewAndSend = async () => {
    setSendError('');
    if (!campaignName || !subject || !fromName || !fromAddress || !htmlBody) {
      setSendError('Please fill in all required campaign fields.');
      return;
    }
    if (contacts.length === 0) {
      setSendError('Please upload at least one contact.');
      return;
    }
    if (!resendApiKey) {
      setSendError('Please add your Resend API key in the Settings panel above.');
      setShowSettings(true);
      return;
    }
    setStep('review');
  };

  const handleSendCampaign = async () => {
    setIsSending(true);
    setSendError('');
    setStep('sending');

    // 1. Save campaign
    const campaignId = await saveCampaign();
    if (!campaignId) {
      setStep('review');
      setIsSending(false);
      return;
    }
    setActiveCampaignId(campaignId);

    // 2. Upload contacts
    const uploaded = await uploadContacts(campaignId);
    if (!uploaded) {
      setSendError('Failed to upload contacts.');
      setStep('review');
      setIsSending(false);
      return;
    }

    // 3. Send
    try {
      const res = await fetch(`/api/campaigns/email/${campaignId}/send`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setDeliverySummary({ sent: data.sent, failed: data.failed, total: data.total });
      setDeliveryResults(data.results || []);
      setStep('done');
      loadCampaigns();
    } catch (e: any) {
      setSendError(e.message || 'Failed to send campaign.');
      setStep('review');
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setCampaignName('');
    setSubject('');
    setFromName('');
    setReplyTo('');
    setHtmlBody(DEFAULT_HTML_TEMPLATE);
    setContacts([]);
    setDeliveryResults([]);
    setDeliverySummary(null);
    setSendError('');
    setActiveCampaignId(null);
    setStep('compose');
  };

  const exportLog = () => {
    const csv = ['Email,Status,Error']
      .concat(deliveryResults.map((r) => `${r.email},${r.success ? 'SENT' : 'FAILED'},${r.error || ''}`))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaignName || 'campaign'}-delivery-log.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!activeClient) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-semibold text-slate-500">Select a client to start an email campaign.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ─── Settings Panel ───────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-bold text-slate-800">Resend API Settings</span>
            {resendApiKey ? (
              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded px-2 py-0.5 uppercase tracking-wider">
                Configured
              </span>
            ) : (
              <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200 rounded px-2 py-0.5 uppercase tracking-wider">
                Required
              </span>
            )}
          </div>
          {showSettings ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {showSettings && (
          <div className="p-5 border-t border-slate-100 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Get your API key from{' '}
              <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline">
                resend.com/api-keys
              </a>
              . You can also set{' '}
              <code className="bg-slate-100 px-1 rounded text-[10px]">RESEND_API_KEY</code> in your <code className="bg-slate-100 px-1 rounded text-[10px]">.env</code> file.
            </p>
            {/* Free-tier restriction notice */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
              <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Resend Free Plan Restriction
              </p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Without a verified domain, Resend only allows sending to <strong>your own Resend account email</strong>.
                To send to any email address (client campaigns), verify your domain at{' '}
                <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="font-bold underline">
                  resend.com/domains
                </a>{' '}
                and set <strong>From Address</strong> to an email on that domain (e.g. <code className="bg-amber-100 px-1 rounded">campaigns@yourdomain.com</code>).
              </p>
              <p className="text-[11px] text-amber-600 font-semibold">
                Testing without a domain? Use <code className="bg-amber-100 px-1 rounded">onboarding@resend.dev</code> as From Address and only send to your own Resend account email.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Resend API Key</label>
                <input
                  type="password"
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_••••••••••••••••••••••"
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-400 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Default From Address</label>
                <input
                  type="email"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  placeholder="campaigns@yourdomain.com"
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <button
              onClick={saveSettings}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 transition-all"
            >
              Save Settings
            </button>
          </div>
        )}
      </div>

      {/* ─── STEP: COMPOSE ───────────────────────────────────────── */}
      {step === 'compose' && (
        <>
          {/* Campaign Setup */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Mail className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Campaign Setup</h3>
                <p className="text-[10px] text-slate-400">Configure the identity and subject of your email campaign.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Campaign Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. July Monsoon Special Offer"
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. ☕ Exclusive offer for our loyal guests"
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  From Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder={`e.g. ${activeClient.name} Team`}
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reply-To (optional)</label>
                <input
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="e.g. hello@yourclient.com"
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Contact List Uploader */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Contact List</h3>
                  <p className="text-[10px] text-slate-400">Upload a CSV/Excel/TXT or paste emails directly.</p>
                </div>
              </div>
              {contacts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
                    {contacts.length} contacts
                  </span>
                  <button onClick={() => setContacts([])} className="text-rose-500 hover:text-rose-600" title="Clear all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-400 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) parseFile(e.target.files[0]); }}
              />
              {isParsingFile ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
                  <span className="text-xs font-semibold text-slate-500">Parsing contacts...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-600">Drop your file here or click to browse</p>
                  <p className="text-[10px] text-slate-400 font-medium">Supports .csv, .xlsx, .xls, .txt • Max 500 contacts</p>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {uploadError}
              </div>
            )}

            {/* Paste text area */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Or paste emails (one per line, or "Name &lt;email&gt;" format)
              </label>
              <div className="flex gap-2">
                <textarea
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder={`John Doe <john@example.com>\njane@example.com\nAlice Smith <alice@domain.com>`}
                  className="flex-1 text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-400 resize-none min-h-[80px] font-mono"
                />
                <button
                  onClick={parsePastedText}
                  disabled={!rawPasteText.trim() || isParsingFile}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-2 disabled:opacity-50 self-start"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Parsed Contacts Preview */}
            {contacts.length > 0 && (
              <div className="rounded-lg border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between bg-slate-50 px-4 py-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Contact Preview ({contacts.length})
                  </span>
                  <button
                    onClick={() => setContacts([])}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2 font-bold text-slate-500 text-[10px] uppercase tracking-wider">#</th>
                        <th className="text-left px-4 py-2 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-2 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {contacts.slice(0, 100).map((c, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="px-4 py-2 text-slate-700 font-semibold">{c.name}</td>
                          <td className="px-4 py-2 text-slate-500">{c.email}</td>
                          <td className="px-4 py-2">
                            <button
                              onClick={() => setContacts((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-slate-300 hover:text-rose-500 transition-colors"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {contacts.length > 100 && (
                    <div className="text-center py-2 text-[10px] text-slate-400 font-semibold">
                      … and {contacts.length - 100} more contacts
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Email Body Builder */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Email Body</h3>
                  <p className="text-[10px] text-slate-400">
                    Write HTML directly or use AI. Use <code className="bg-slate-100 px-1 rounded">{'{{name}}'}</code> for personalization.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Preview toggle */}
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  <button
                    onClick={() => setPreviewMode('code')}
                    className={`text-[10px] font-bold px-3 py-1 rounded transition-all ${previewMode === 'code' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setPreviewMode('preview')}
                    className={`text-[10px] font-bold px-3 py-1 rounded transition-all ${previewMode === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Preview
                  </button>
                </div>

                {/* AI Generate Button */}
                <button
                  onClick={generateWithAI}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 disabled:opacity-60 transition-all"
                >
                  {isGeneratingAI ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            </div>

            {previewMode === 'code' ? (
              <textarea
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                className="w-full h-[400px] text-xs font-mono p-4 outline-none resize-none bg-[#0d1117] text-[#e6edf3] border-0"
                spellCheck={false}
                placeholder="Paste or write your HTML email body here..."
              />
            ) : (
              <div className="h-[400px] bg-slate-100 flex items-start justify-center p-4 overflow-auto">
                <iframe
                  srcDoc={htmlBody.replace(/\{\{name\}\}/gi, contacts[0]?.name || 'Preview Name')}
                  className="w-full max-w-[600px] bg-white rounded-lg shadow-sm border border-slate-200"
                  style={{ height: '580px' }}
                  sandbox="allow-same-origin"
                  title="Email Preview"
                />
              </div>
            )}
          </div>

          {/* Error + CTA */}
          {sendError && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {sendError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleReviewAndSend}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-7 py-3.5 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              <Eye className="h-4 w-4" />
              Review & Send Campaign
            </button>
          </div>
        </>
      )}

      {/* ─── STEP: REVIEW ────────────────────────────────────────── */}
      {step === 'review' && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto">
              <Send className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Ready to Send?</h3>
            <p className="text-xs text-slate-500 font-medium">Review your campaign details before sending.</p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 divide-y divide-slate-200 text-xs">
            <div className="flex justify-between items-center px-5 py-3">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Campaign</span>
              <span className="font-bold text-slate-900">{campaignName}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-3">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Subject</span>
              <span className="font-semibold text-slate-700 max-w-[60%] text-right">{subject}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-3">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">From</span>
              <span className="font-semibold text-slate-700">{fromName} &lt;{fromAddress}&gt;</span>
            </div>
            <div className="flex justify-between items-center px-5 py-3">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Recipients</span>
              <span className="font-extrabold text-indigo-700">{contacts.length.toLocaleString()} contacts</span>
            </div>
            <div className="flex justify-between items-center px-5 py-3">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Client</span>
              <span className="font-semibold text-slate-700">{activeClient.name}</span>
            </div>
          </div>

          {sendError && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {sendError}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setStep('compose')}
              className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs px-5 py-3"
            >
              Edit Campaign
            </button>
            <button
              onClick={handleSendCampaign}
              disabled={isSending}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3 shadow-lg shadow-indigo-600/20 disabled:opacity-60 transition-all"
            >
              {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSending ? 'Sending...' : `Send to ${contacts.length} Recipients`}
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP: SENDING ───────────────────────────────────────── */}
      {step === 'sending' && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto">
            <Send className="h-6 w-6 text-indigo-600 animate-bounce" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Sending Campaign...</h3>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Delivering emails via Resend in batches of 10. Please wait and don't close the tab.
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-sm mx-auto overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* ─── STEP: DONE ──────────────────────────────────────────── */}
      {step === 'done' && deliverySummary && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/* Summary header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Campaign Sent!</h3>
                <p className="text-[10px] text-slate-400">{campaignName} · {activeClient.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportLog}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs px-3 py-2"
              >
                <Download className="h-3.5 w-3.5" />
                Export Log
              </button>
              <button
                onClick={resetForm}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2"
              >
                New Campaign
              </button>
            </div>
          </div>

          {/* Delivery Stats */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50">
            <div className="p-5 text-center space-y-1">
              <p className="text-2xl font-black text-emerald-600">{deliverySummary.sent}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivered</p>
            </div>
            <div className="p-5 text-center space-y-1">
              <p className="text-2xl font-black text-rose-600">{deliverySummary.failed}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Failed</p>
            </div>
            <div className="p-5 text-center space-y-1">
              <p className="text-2xl font-black text-slate-900">{deliverySummary.total}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Sent</p>
            </div>
          </div>

          {/* Per-contact delivery log */}
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-2.5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-2.5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-2.5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {deliveryResults.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-5 py-2.5 text-slate-700 font-medium">{r.email}</td>
                    <td className="px-5 py-2.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                        r.success
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}>
                        {r.success ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                        {r.success ? 'Sent' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-slate-400 font-mono text-[10px]">{r.error || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Past Campaigns ──────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <button
          onClick={() => setShowPastCampaigns(!showPastCampaigns)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-800">Campaign History</span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
              {pastCampaigns.length}
            </span>
          </div>
          {showPastCampaigns ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {showPastCampaigns && (
          <div className="divide-y divide-slate-50">
            {isLoadingCampaigns ? (
              <div className="py-8 text-center">
                <RefreshCw className="h-5 w-5 text-slate-300 animate-spin mx-auto" />
              </div>
            ) : pastCampaigns.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No campaigns sent yet for {activeClient.name}.
              </div>
            ) : (
              pastCampaigns.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{c.subject}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4 text-xs">
                    <div className="text-center">
                      <p className="font-extrabold text-slate-900">{c.totalContacts}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="font-extrabold text-emerald-600">{c.sentCount}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="font-extrabold text-rose-600">{c.failedCount}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Failed</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${STATUS_COLORS[c.status] || STATUS_COLORS.DRAFT}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
