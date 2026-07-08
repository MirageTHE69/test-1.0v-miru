'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Zap,
  PlayCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Sliders,
  Send,
  Eye,
  Settings,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

// Custom SVG Icons (to ensure rendering across different packages)
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const SlackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
  </svg>
);

interface FlowField {
  name: string;
  label: string;
  type: 'text' | 'textarea';
}

interface FlowAction {
  type: 'LINKEDIN' | 'SLACK' | 'DISCORD' | 'CUSTOM';
  config: {
    template?: string;
  };
}

interface AutomationFlowType {
  id: string;
  name: string;
  triggerType: string;
  formFields: string; // JSON Array of FlowField
  actions: string; // JSON Array of FlowAction
  isActive: boolean;
  webhookPath: string;
  createdAt: string;
  logs?: any[];
}

export default function AutomationPage() {
  const { activeClient } = useApp();
  const [flows, setFlows] = useState<AutomationFlowType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Builder state
  const [selectedFlow, setSelectedFlow] = useState<AutomationFlowType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [flowName, setFlowName] = useState('');
  const [fields, setFields] = useState<FlowField[]>([
    { name: 'post_text', label: 'Post Content', type: 'textarea' }
  ]);
  const [actions, setActions] = useState<FlowAction[]>([
    { type: 'LINKEDIN', config: { template: '{post_text}' } }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  // Simulator states
  const [simulatorInputs, setSimulatorInputs] = useState<Record<string, string>>({});
  const [simulatorResult, setSimulatorResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  const fetchFlows = async () => {
    if (!activeClient) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/automation?clientId=${activeClient.id}`);
      if (res.ok) {
        const data = await res.json();
        setFlows(data);
        if (data.length > 0 && !selectedFlow) {
          setSelectedFlow(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
    setIsCreating(false);
    setSimulatorResult(null);
  }, [activeClient]);

  // Sync simulator input values when active flow changes
  useEffect(() => {
    if (selectedFlow) {
      const defaultInputs: Record<string, string> = {};
      try {
        const parsedFields: FlowField[] = JSON.parse(selectedFlow.formFields || '[]');
        parsedFields.forEach(f => {
          defaultInputs[f.name] = '';
        });
      } catch {
        // ignore
      }
      setSimulatorInputs(defaultInputs);
      setSimulatorResult(null);
    }
  }, [selectedFlow]);

  // Field definitions actions
  const addField = () => {
    setFields([...fields, { name: `field_${Date.now()}`, label: 'Custom Parameter', type: 'text' }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof FlowField, value: string) => {
    setFields(fields.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  // Action definitions handlers
  const toggleAction = (type: FlowAction['type']) => {
    if (actions.some(a => a.type === type)) {
      setActions(actions.filter(a => a.type !== type));
    } else {
      setActions([...actions, { type, config: { template: fields[0] ? `{${fields[0].name}}` : '' } }]);
    }
  };

  const updateActionTemplate = (type: FlowAction['type'], val: string) => {
    setActions(actions.map(a => a.type === type ? { ...a, config: { ...a.config, template: val } } : a));
  };

  // Submit Flow Builder form
  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !flowName.trim() || isSaving) return;
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient.id,
          name: flowName,
          triggerType: 'FORM',
          formFields: fields,
          actions: actions,
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFlows([data.flow, ...flows]);
        setSelectedFlow(data.flow);
        setIsCreating(false);
        setFlowName('');
        setFields([{ name: 'post_text', label: 'Post Content', type: 'textarea' }]);
        setActions([{ type: 'LINKEDIN', config: { template: '{post_text}' } }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Flow active status
  const handleToggleActive = async (flow: AutomationFlowType) => {
    try {
      const res = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient?.id,
          id: flow.id,
          name: flow.name,
          triggerType: flow.triggerType,
          isActive: !flow.isActive,
        })
      });

      if (res.ok) {
        const updated = flows.map(f => f.id === flow.id ? { ...f, isActive: !flow.isActive } : f);
        setFlows(updated);
        if (selectedFlow?.id === flow.id) {
          setSelectedFlow({ ...selectedFlow, isActive: !flow.isActive });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Flow
  const handleDeleteFlow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation flow?')) return;
    try {
      const res = await fetch(`/api/automation?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = flows.filter(f => f.id !== id);
        setFlows(updated);
        if (selectedFlow?.id === id) {
          setSelectedFlow(updated.length > 0 ? updated[0] : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run the hook trigger simulation
  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlow || isSimulating) return;
    setIsSimulating(true);
    setSimulatorResult(null);

    const triggerUrl = `/api/automation/trigger/${selectedFlow.webhookPath}`;
    try {
      const res = await fetch(triggerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulatorInputs)
      });
      const data = await res.json();
      setSimulatorResult({
        ok: res.ok && data.success,
        status: res.status,
        message: data.message || 'Trigger resolved',
        details: data.details || []
      });
      
      // Refresh flow logs after simulation runs
      setTimeout(() => {
        fetchFlows();
      }, 1000);

    } catch (err: any) {
      setSimulatorResult({
        ok: false,
        status: 500,
        message: err.message,
        details: ['Connection error during simulator run.']
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const copyTriggerUrl = (path: string) => {
    const fullUrl = `${window.location.origin}/api/automation/trigger/${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  if (!activeClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-650 animate-spin" />
      </div>
    );
  }

  // Parse JSON values for rendering safely
  const getParsedFields = (jsonStr: string): FlowField[] => {
    try { return JSON.parse(jsonStr || '[]'); } catch { return []; }
  };

  const getParsedActions = (jsonStr: string): FlowAction[] => {
    try { return JSON.parse(jsonStr || '[]'); } catch { return []; }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-250 px-3 py-1 text-xs font-bold text-indigo-700">
            <Zap className="h-3.5 w-3.5" /> Workflow Automations
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-tight">Lead Capture Form Hook & Social Automation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create custom lead capture form parameters, generate unique webhook trigger endpoints, and hook direct social API publishers.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => {
              setIsCreating(true);
              setSelectedFlow(null);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Custom Flow Hook
          </button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: ACTIVE WORKFLOWS LIST */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 h-max">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Your Active Trigger Hooks</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Manage form triggers and webhook URLs mapped to your channels.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
            </div>
          ) : flows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-3">
              <PlayCircle className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">No flows created. Click &quot;Create Custom Flow Hook&quot; above to configure your first form trigger.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flows.map((flow) => {
                const isSelected = selectedFlow?.id === flow.id;
                const flowFields = getParsedFields(flow.formFields);
                const flowActions = getParsedActions(flow.actions);

                return (
                  <div
                    key={flow.id}
                    onClick={() => {
                      setSelectedFlow(flow);
                      setIsCreating(false);
                    }}
                    className={`rounded-xl border p-4 cursor-pointer text-xs space-y-3 transition-all ${
                      isSelected ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-800 truncate max-w-[150px]">{flow.name}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(flow);
                          }}
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                            flow.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {flow.isActive ? 'Active' : 'Paused'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFlow(flow.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 text-[10px] text-slate-500 font-medium">
                      <span className="bg-slate-150 border border-slate-200 px-2 py-0.5 rounded">
                        {flowFields.length} Form Field{flowFields.length !== 1 ? 's' : ''}
                      </span>
                      <span className="bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-indigo-700">
                        {flowActions.length} Action{flowActions.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Mini Actions Badges */}
                    <div className="flex gap-1.5">
                      {flowActions.map((act, idx) => (
                        <span key={idx} className="bg-white border border-slate-250 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-600 uppercase">
                          {act.type}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MIDDLE/RIGHT WORKSPACE: FLOW CREATOR OR ACTIVE DETAILED VIEW */}
        <div className="lg:col-span-2 space-y-6">
          {/* STATE 1: FLOW CREATOR FORM */}
          {isCreating && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Create Custom Webflow Hook</h3>
                <p className="text-xs text-slate-400 mt-0.5">Build a lead capture form or automated webhook. Fields specified here will generate payload schemas.</p>
              </div>

              <form onSubmit={handleCreateFlow} className="space-y-6">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Automation Name</label>
                  <input
                    type="text"
                    value={flowName}
                    onChange={e => setFlowName(e.target.value)}
                    placeholder="e.g. Campaign Contact Form Hook"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>

                {/* Fields Builder */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Define Payload Fields</label>
                    <button
                      type="button"
                      onClick={addField}
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-650 hover:underline"
                    >
                      <Plus className="h-3 w-3" /> Add Custom Field
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {fields.map((f, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 animate-fade-in">
                        <div className="grid gap-2 grid-cols-3 flex-1">
                          <input
                            type="text"
                            value={f.name}
                            onChange={e => updateField(idx, 'name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                            placeholder="field_key (eg message)"
                            className="text-[11px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 outline-none font-mono"
                            required
                          />
                          <input
                            type="text"
                            value={f.label}
                            onChange={e => updateField(idx, 'label', e.target.value)}
                            placeholder="Input Field Label"
                            className="text-[11px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 outline-none"
                            required
                          />
                          <select
                            value={f.type}
                            onChange={e => updateField(idx, 'type', e.target.value as any)}
                            className="text-[11px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 outline-none font-semibold"
                          >
                            <option value="text">Single Line Text</option>
                            <option value="textarea">Multi-line Paragraph</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeField(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions selection */}
                <div className="space-y-3.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Connect Publishing Actions</label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { id: 'LINKEDIN' as const, label: 'Publish to LinkedIn', desc: 'Directly posts text updates to LinkedIn feed.' },
                      { id: 'SLACK' as const, label: 'Post to Slack Webhook', desc: 'Pings a notification to your Slack workspace.' },
                      { id: 'DISCORD' as const, label: 'Post to Discord Webhook', desc: 'Delivers a post embed inside Discord channels.' },
                      { id: 'CUSTOM' as const, label: 'Trigger Custom Webhook', desc: 'Forwards event to Make.com / Zapier.' },
                    ].map((item) => {
                      const isConnected = actions.some(a => a.type === item.id);
                      const activeAct = actions.find(a => a.type === item.id);
                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-4 space-y-3 transition-colors ${
                            isConnected ? 'border-indigo-650 bg-indigo-50/10' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-800">{item.label}</span>
                            <input
                              type="checkbox"
                              checked={isConnected}
                              onChange={() => toggleAction(item.id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400">{item.desc}</p>
                          {isConnected && (
                            <div className="space-y-1.5 pt-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Content Template</label>
                              <input
                                type="text"
                                value={activeAct?.config.template || ''}
                                onChange={e => updateActionTemplate(item.id, e.target.value)}
                                placeholder="e.g. Lead details: {post_text}"
                                className="w-full text-[10px] rounded border border-slate-200 bg-white p-1.5 outline-none font-mono focus:border-indigo-500"
                              />
                              <p className="text-[8px] text-slate-400 leading-none">Use placeholders like <code>{`{field_key}`}</code> to map values.</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      if (flows.length > 0) setSelectedFlow(flows[0]);
                    }}
                    className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs px-5 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || actions.length === 0}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 shadow-sm transition-all disabled:opacity-40"
                  >
                    {isSaving ? 'Creating Webhook...' : 'Generate Automation Webhook'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STATE 2: ACTIVE FLOW DETAILS, SIMULATOR & LOGS */}
          {selectedFlow && !isCreating && (
            <div className="space-y-6">
              {/* Webhook Path Details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{selectedFlow.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Webhook Hook Trigger URL. Trigger this hook using curl, external website forms, or Make.com.</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedFlow.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {selectedFlow.isActive ? '● Live Receiver' : '○ Disabled'}
                  </span>
                </div>

                <div className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                  <Globe className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                  <code className="flex-1 font-mono text-[10px] text-slate-700 truncate select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/automation/trigger/${selectedFlow.webhookPath}` : `/api/automation/trigger/${selectedFlow.webhookPath}`}
                  </code>
                  <button
                    onClick={() => copyTriggerUrl(selectedFlow.webhookPath)}
                    className="p-2 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Copy Hook URL"
                  >
                    {copiedPath ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Form Simulator */}
              <div className="grid gap-6 md:grid-cols-5 items-start">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-3 space-y-5">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4.5 w-4.5 text-indigo-650" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lead Form Simulator</h4>
                      <p className="text-[10px] text-slate-400">Fill standard fields to simulate a real website submission hitting your webhook.</p>
                    </div>
                  </div>

                  <form onSubmit={handleRunSimulation} className="space-y-4 text-xs font-medium">
                    {getParsedFields(selectedFlow.formFields).map((f) => (
                      <div key={f.name} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{f.label}</label>
                        {f.type === 'textarea' ? (
                          <textarea
                            value={simulatorInputs[f.name] || ''}
                            onChange={e => setSimulatorInputs({ ...simulatorInputs, [f.name]: e.target.value })}
                            placeholder={`Enter simulated payload value for {${f.name}}`}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 min-h-[80px]"
                            required
                          />
                        ) : (
                          <input
                            type="text"
                            value={simulatorInputs[f.name] || ''}
                            onChange={e => setSimulatorInputs({ ...simulatorInputs, [f.name]: e.target.value })}
                            placeholder={`Enter simulated payload value for {${f.name}}`}
                            className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                            required
                          />
                        )}
                      </div>
                    ))}

                    <button
                      type="submit"
                      disabled={isSimulating || !selectedFlow.isActive}
                      className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isSimulating ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Triggering Hook API...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" /> Submit Form & Trigger Hook
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Simulator Result details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 space-y-4 min-h-[220px]">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Execution Response</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Live response logs from the API endpoint.</p>
                  </div>

                  {simulatorResult ? (
                    <div className={`rounded-xl border p-4 text-[10px] space-y-2.5 leading-relaxed ${
                      simulatorResult.ok ? 'border-emerald-250 bg-emerald-50/50' : 'border-rose-250 bg-rose-50/50'
                    }`}>
                      <div className="flex justify-between items-center font-bold">
                        <span className={simulatorResult.ok ? 'text-emerald-700' : 'text-rose-700'}>
                          {simulatorResult.ok ? '✓ 200 OK' : `✗ Status ${simulatorResult.status}`}
                        </span>
                      </div>
                      
                      <p className="text-slate-800 font-semibold">{simulatorResult.message}</p>
                      
                      {simulatorResult.details.length > 0 && (
                        <div className="border-t border-slate-200/50 pt-2 space-y-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Action Logs</span>
                          <ul className="list-disc ml-3 space-y-1 font-mono text-[9px] text-slate-650">
                            {simulatorResult.details.map((d: string, idx: number) => (
                              <li key={idx}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center space-y-1">
                      <Sliders className="h-6 w-6 text-slate-300 mx-auto" />
                      <p className="text-[10px] text-slate-450 font-medium leading-normal">Submit the simulator form on the left to see instant execution logs here.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Execution logs */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Trigger Logs (Database History)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Audit history of webhook payload submissions and downstream API outputs.</p>
                </div>

                {!selectedFlow.logs || selectedFlow.logs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No trigger history recorded for this workflow yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {selectedFlow.logs.map((log: any) => (
                      <div key={log.id} className="py-3.5 flex flex-col sm:flex-row justify-between gap-3 text-[11px] first:pt-0 last:pb-0">
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex gap-2.5 items-center">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {log.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED'}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 font-semibold">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                          
                          <p className="text-slate-500 font-medium leading-relaxed">{log.details}</p>
                          
                          <div className="bg-slate-50 border border-slate-150 p-2 rounded-lg font-mono text-[9px] text-slate-700 leading-normal max-w-lg truncate">
                            <strong>Payload: </strong>{log.payload}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
