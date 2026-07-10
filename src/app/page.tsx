'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Bot, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  MessageSquare, 
  Terminal, 
  IndianRupee, 
  Megaphone, 
  Check, 
  X, 
  ShieldCheck, 
  Mail, 
  Building2, 
  Eye, 
  Cpu, 
  RefreshCw, 
  BarChart2, 
  FileText, 
  Layout, 
  TrendingUp,
  ExternalLink,
  Laptop,
  ArrowDown
} from 'lucide-react';

// Data definitions
interface MapNode {
  id: string;
  title: string;
  icon: any;
  manages: string;
  enters: string;
  leaves: string;
  agents: string;
  flows: string;
}

const SYSTEM_NODES: MapNode[] = [
  {
    id: 'crm',
    title: 'CRM & Sales',
    icon: Users,
    manages: 'Lead scoring, custom proposal compiling, and billing pipeline logs.',
    enters: 'Fresh contact inputs, webforms, and social ad lead data.',
    leaves: 'AI-generated client proposals, contracts, and Retainer budgets.',
    agents: 'AI Account Manager evaluates client values.',
    flows: 'New lead triggers proposal drafting and contract workspace creation.'
  },
  {
    id: 'projects',
    title: 'Projects & Tasks',
    icon: Layout,
    manages: 'Task cards, kanban state tracking, and team capacity margins.',
    enters: 'Contract milestones, client feedback, and AI optimization recommendations.',
    leaves: 'Developer/designer tasks, deadline alerts, and capacity status feeds.',
    agents: 'AI Project Manager distributes tasks based on developer capacity.',
    flows: 'Milestone approval auto-creates next-phase project tasks.'
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Marketing',
    icon: MessageSquare,
    manages: 'Conversational chat history, template broadcasts, and custom templates.',
    enters: 'Incoming client messages, media, and quick questions.',
    leaves: 'AI replies, qualified sales opportunities, and client alerts.',
    agents: 'AI Account Manager qualifies leads and updates conversation history.',
    flows: 'Lead qualifying dialogue logs details directly into the CRM.'
  },
  {
    id: 'ads',
    title: 'Advertising Workspace',
    icon: Megaphone,
    manages: 'Meta, Google, and LinkedIn campaign budgets, metrics, and pacing.',
    enters: 'Budget limits, design assets, and marketing guidelines.',
    leaves: 'Published ad units, live CPC/CPA metrics, and anomalies logs.',
    agents: 'AI Advertising Analyst monitors budget spend and performance pacing.',
    flows: 'Anomaly detection auto-triggers budget reallocation alerts.'
  },
  {
    id: 'approvals',
    title: 'Creative Approvals',
    icon: CheckCircle2,
    manages: 'Deliverable review queue, image/video mocks, and change notes.',
    enters: 'Draft copy, design file URLs, and post layout captions.',
    leaves: 'Approved status records, changes requested, and feedback histories.',
    agents: 'AI Content Strategist updates media assets based on client feedback.',
    flows: 'Approval logs trigger direct social scheduling automation.'
  },
  {
    id: 'finance',
    title: 'Finance & Billing',
    icon: IndianRupee,
    manages: 'Invoices, payment logs, profit margins, and retainer spends.',
    enters: 'Project spent hours, completed milestones, and budget definitions.',
    leaves: 'PDF Invoice bills, margin metrics, and overdue warning notifications.',
    agents: 'AI Finance Analyst audits retainer profitability margins.',
    flows: 'Milestone sign-off auto-generates billing invoices for the client.'
  },
  {
    id: 'automation',
    title: 'Workflows & API',
    icon: Zap,
    manages: 'Custom webhooks, trigger events, and integrations mapping.',
    enters: 'API payloads, webform submissions, and external app alerts.',
    leaves: 'Internal alerts, automated state updates, and synchronized database edits.',
    agents: 'AI Project Manager coordinates automatic workspace updates.',
    flows: 'Client onboarding form submission builds dynamic client memory structures.'
  },
  {
    id: 'agents',
    title: 'AI Agent Team',
    icon: Cpu,
    manages: 'Collaborative task resolution, client briefings, and monitoring feeds.',
    enters: 'Entire SQLite table records, campaign specs, and brand memory values.',
    leaves: 'Custom action recommendations, drafted copy layouts, and metric alerts.',
    agents: 'All specialized AI Agents run in collaborative context.',
    flows: 'Anomaly notification triggers marketing strategist review.'
  }
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Centerpiece Map state
  const [activeNode, setActiveNode] = useState<MapNode>(SYSTEM_NODES[0]);

  // Horizontal client journey steps
  const [activeJourneyStep, setActiveJourneyStep] = useState(0);
  const clientJourney = [
    { title: 'New Lead Entered', detail: 'Contact details and operational challenges flow into the CRM pipeline.' },
    { title: 'AI Proposal Drafted', detail: 'The AI Copywriter drafts a tailored marketing strategy aligned with standard retainers.' },
    { title: 'Contract Signed', detail: 'Client signs, and the system automatically logs a new active client record.' },
    { title: 'Workspace Created', detail: 'Client workspace and brand memory schema files are auto-initialized in the SQLite db.' },
    { title: 'Team Capacity Check', detail: 'AI Project Manager audits active workloads and assigns design tasks to team members.' },
    { title: 'Campaign Blueprint', detail: 'AI Marketing Strategist generates the monsoons or seasonal social planner.' },
    { title: 'Deliverables Review', detail: 'Client reviews image copy layouts in their clean, calm approvals dashboard portal.' },
    { title: 'Automatic Publishing', detail: 'Approved items are scheduled and automatically published to connected channels.' },
    { title: 'Performance Analytics', detail: 'Live ad clicks, WhatsApp leads, and revenue are monitored by AI Analysts.' },
    { title: 'Retainer Audit', detail: 'Finance tools tally margins and generate monthly invoice payment logs.' }
  ];

  // AI agents automated communication simulation state
  const [simStep, setSimStep] = useState(0);
  const [isSimRunning, setIsSimRunning] = useState(true);
  const simInterval = useRef<any>(null);

  const agentLogs = [
    { role: 'AI Advertising Analyst', text: '🚨 Alert: ROAS for Bloom Café monsoon campaign dropped below target (2.4x vs 3.0x).', color: 'text-amber-500 bg-amber-500/10' },
    { role: 'AI Marketing Strategist', text: '🧠 Evaluation: Audiences are engaging with specialty pour-over copy. Recommending shifting ₹15,000 budget from generic branding to micro-roasting video retargeting.', color: 'text-indigo-400 bg-indigo-500/10' },
    { role: 'AI Project Manager', text: '🛠️ Task Logging: Creating 3 optimization tasks: "Video asset retargeting setup", "Copy guidelines pass", and "Adjust budget pacing". Assigned to Priya Sharma.', color: 'text-emerald-500 bg-emerald-500/10' },
    { role: 'AI Account Manager', text: '✉️ Client Brief: Drafting a performance update email for Meera (Bloom Café) explaining the budget realignment to maximize pour-over ROI.', color: 'text-sky-500 bg-sky-500/10' }
  ];

  useEffect(() => {
    if (isSimRunning) {
      simInterval.current = setInterval(() => {
        setSimStep((prev) => (prev + 1) % agentLogs.length);
      }, 4000);
    }
    return () => clearInterval(simInterval.current);
  }, [isSimRunning]);

  // Section 06 Brand memory text generator state
  const [selectedBrand, setSelectedBrand] = useState<'bloom' | 'watch' | 'tech'>('bloom');
  const brandOutputs = {
    bloom: {
      name: 'Bloom Café (Artisanal Coffee)',
      tone: 'Warm, artisanal, inviting',
      banned: 'cheap, generic, discount',
      output: '☕🌧️ Seeking shelter from the monsoon showers? Duck into our cozy sanctuary. Breathe in the rich aroma of single-origin pour-overs, roasted in micro-batches right here this morning. Taste the artisanal craftsmanship.'
    },
    watch: {
      name: 'Vanguard (Luxury Watches)',
      tone: 'Sophisticated, precise, timeless',
      banned: 'affordable, low-cost, fast',
      output: '⏱️✨ Precision defined. Craftsmanship preserved. Every mechanical balance wheel in the Vanguard Chronograph represents a legacy of micro-engineering. A timeless statement for the discerning hand.'
    },
    tech: {
      name: 'SyncFlow (B2B SaaS DevTools)',
      tone: 'Precise, authoritative, confident',
      banned: 'magic, revolutionary, easy',
      output: '⚡⚙️ Optimize database queries dynamically. SyncFlow maps schema migrations directly inside your execution compiler, eliminating thread delays and reducing query latency by up to 42% at scale.'
    }
  };

  // Section 07 Campaign command center simulator state
  const [activeCommandClient, setActiveCommandClient] = useState<'bloom' | 'zenith'>('bloom');
  const commandClientData = {
    bloom: {
      name: 'Bloom Café',
      spend: '₹41,200',
      revenue: '₹1,56,000',
      roas: '3.78x',
      clicks: '8,420',
      alert: '✅ Active campaigns running smoothly. Micro-roasting video ad performing at top conversion rates.',
      performanceColor: 'text-emerald-550'
    },
    zenith: {
      name: 'Zenith Retail',
      spend: '₹84,000',
      revenue: '₹2,10,000',
      roas: '2.50x',
      clicks: '14,350',
      alert: '⚠️ Anomaly detected: Google Ads CTR dropped by 18% in the last 48 hours. Suggesting keyword optimization.',
      performanceColor: 'text-amber-600'
    }
  };

  // Section 09 Advertising budget slider state
  const [adSpend, setAdSpend] = useState(25000);
  const estimatedClicks = Math.round(adSpend * 0.18);
  const estimatedLeads = Math.round(adSpend * 0.024);
  const estimatedROAS = (3.4 - (adSpend / 100000) * 0.5).toFixed(2);

  // Section 11 Executive copilot simulated conversation state
  const [copilotQuery, setCopilotQuery] = useState<string | null>(null);
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  const copilotAnswers = {
    profitability: {
      answer: `📊 **Retainer Profitability Audit**\n\nI checked active retainer budgets against recorded team spent hours:\n\n- **Unprofitable Account**: *Zenith Retail* stands at a margin of **12%** (Target: >35%). High volume of custom copy revision cycles has delayed task resolution.\n- **Top Performer**: *Bloom Café* leads with a **52%** profit margin (₹85k budget vs ₹41k spent).\n\n**Proposed Action**: Trigger the custom retainer automation to log extra revision billings for Zenith.`,
      action: 'Log revisions billing task'
    },
    campaigns: {
      answer: `🚨 **Campaign Attention Report**\n\n- **Meta Ads (Bloom Café)**: Running optimally. Conversions are up 14% this week.\n- **Google Ads (Zenith Retail)**: CPA has climbed to ₹240 (Budget limit: ₹200). Creative assets have high fatigue.\n\n**Proposed Action**: Draft retargeting ad graphics for Zenith.`,
      action: 'Assign task: design ad copy'
    },
    workload: {
      answer: `👥 **Team Capacity Check**\n\n- **Priya Sharma (Manager)**: At **95%** capacity this week (assigned to 4 active landing page tasks).\n- **Aarav Patel (Developer)**: At **40%** capacity. Ready for campaign setup tasks.\n\n**Proposed Action**: Reassign the Zenith copy review task to Aarav to balance the load.`,
      action: 'Reallocate task to Aarav'
    }
  };

  const handleCopilotQuery = (key: 'profitability' | 'campaigns' | 'workload') => {
    setIsCopilotLoading(true);
    setCopilotQuery(key);
    setCopilotResponse(null);
    setTimeout(() => {
      setCopilotResponse(copilotAnswers[key].answer);
      setIsCopilotLoading(false);
    }, 1200);
  };

  // Section 13 Interactive problem survey validator state
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [problemFeedback, setProblemFeedback] = useState('');
  const [problemStep, setProblemStep] = useState(0); // 0: select, 1: textarea, 2: success

  // Waitlist form state
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistAgency, setWaitlistAgency] = useState('');
  const [waitlistSize, setWaitlistSize] = useState('1-5');
  const [waitlistChallenge, setWaitlistChallenge] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistName || !waitlistEmail || !waitlistAgency) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setWaitlistSubmitted(true);
      setIsSubmitting(false);
    }, 1500);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1C1C] overflow-x-hidden selection:bg-[#4F46E5]/10 selection:text-[#4F46E5] font-sans antialiased">
      
      {/* GLOBAL HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-3 shadow-xs' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1C1C1C] text-white font-bold text-lg transition-transform group-hover:rotate-12 duration-300">
              ⬡
            </div>
            <span className="font-extrabold text-[#1C1C1C] tracking-tight text-lg">AgencyOS</span>
            <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 text-[9px] font-bold text-indigo-650">AI</span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-500">
            <a href="#control-system" className="hover:text-black transition-colors">Product</a>
            <a href="#centerpiece" className="hover:text-black transition-colors">Platform</a>
            <a href="#ai-team" className="hover:text-black transition-colors">AI Agents</a>
            <a href="#command-center" className="hover:text-black transition-colors">Integrations</a>
            <a href="#waitlist" className="hover:text-black transition-colors text-indigo-600 font-extrabold">Early Access</a>
          </nav>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-xs font-bold uppercase tracking-wider text-[#1C1C1C] hover:underline px-3 py-1.5"
            >
              Sign In
            </Link>
            <a
              href="#waitlist"
              className="rounded bg-[#1C1C1C] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 transition-all shadow-xs shrink-0"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </header>

      {/* SECTION 01: HERO EXPERIENCE */}
      <section className="min-h-screen flex flex-col justify-center items-center pt-24 px-6 max-w-7xl mx-auto text-center relative border-b border-slate-200/60 bg-[#FAF9F6]">
        {/* Sub-eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/50 px-4 py-1.5 text-[10px] font-bold text-indigo-750 uppercase tracking-wider mb-6 animate-fade-in shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-indigo-650 animate-pulse" />
          <span>The AI Operating System for Marketing Agencies</span>
        </div>

        {/* Oversized typography */}
        <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tight text-[#1C1C1C] leading-[1.05] max-w-5xl mx-auto font-sans">
          Your agency is running on 15 tools.<br className="hidden sm:inline" />
          <span className="text-indigo-600 block mt-2">It should run on one.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto mt-6 leading-relaxed font-medium">
          Unifying client brand guidelines, project milestones, automated WhatsApp qualified leads, budget allocation ledgers, and collaborative AI agents into a single operating console.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-10 w-full max-w-sm sm:max-w-none">
          <a
            href="#waitlist"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-7 py-4.5 transition-all shadow-xs"
          >
            <span>Join the Early Access Waitlist</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#control-system"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded border border-slate-350 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider px-7 py-4.5 transition-all"
          >
            <span>Explore the System</span>
            <ArrowDown className="h-4 w-4 text-slate-500" />
          </a>
        </div>

        {/* Microcopy */}
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-5 block">
          Built with agencies. Launching with a limited group of early partners.
        </span>

        {/* Interactive Software Windows Chaos Simulator */}
        <div className="relative w-full max-w-5xl h-[300px] mt-16 border border-slate-200 bg-white/50 rounded-xl shadow-xs overflow-hidden p-6 hidden md:block">
          <div className="absolute inset-0 bg-linear-to-t from-[#FAF9F6] via-transparent to-transparent z-10 pointer-events-none" />
          
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-left mb-6 border-b border-slate-100 pb-2">
            Dynamic Workspace Chaos Simulator · Click to align tools
          </span>

          <div className="relative h-[200px] w-full flex items-center justify-center">
            {/* Scattered or aligned layout based on scroll */}
            {['CRM & Sales', 'Client Portal', 'Meta Ads Account', 'WhatsApp Inbox', 'Billing Retainers', 'Tasks List'].map((title, idx) => {
              const scatterOffset = [
                { left: '8%', top: '10%' },
                { left: '42%', top: '25%' },
                { left: '72%', top: '8%' },
                { left: '18%', top: '55%' },
                { left: '55%', top: '60%' },
                { left: '78%', top: '50%' }
              ][idx];

              const alignedOffset = {
                left: `${idx * 16 + 2}%`,
                top: '30%',
                transform: 'translateY(0px)'
              };

              const isAligned = scrollY > 200;

              return (
                <div
                  key={idx}
                  style={isAligned ? alignedOffset : scatterOffset}
                  className={`absolute rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-sm text-left transition-all duration-700 w-44 select-none ${
                    isAligned ? 'border-indigo-400/50 shadow-indigo-100/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5 border-b border-slate-100 pb-1.5">
                    <span className={`h-2 w-2 rounded-full ${isAligned ? 'bg-indigo-500' : 'bg-rose-450'}`} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {isAligned ? 'Connected' : 'Fragmented'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 block truncate">{title}</span>
                  <span className="text-[9px] text-slate-400 mt-1 block">
                    {isAligned ? 'Data synchronized live' : 'Isolated db instances'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 02: THE TOOL CHAOS */}
      <section id="control-system" className="py-28 px-6 bg-white border-b border-slate-200/60 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-bold tracking-widest text-indigo-650 uppercase block">The Core Workflow Problem</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
              Your agency doesn't have a software problem. <br />
              It has a fragmentation problem.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Daily agency operations live scattered across email briefs, WhatsApp chat logs, spreadsheet ledgers, standalone ad panels, and disconnected task lists. When tools don't talk to each other, execution slows, margins leak, and client transparency breaks down.
            </p>
            <div className="rounded-xl border border-slate-200 bg-[#FAF9F6] p-5 border-l-4 border-l-indigo-600">
              <span className="text-xs font-bold text-indigo-700 uppercase block tracking-wider">The Resolution</span>
              <p className="text-xs font-extrabold text-slate-805 mt-2 leading-relaxed">
                "AgencyOS connects the entire operation. Client briefs trigger task lists, copy assets pull from brand memories, and invoice logs update budget spent hours dynamically."
              </p>
            </div>
          </div>

          {/* Interactive Flow Visual representation of Chaos -> Connection */}
          <div className="border border-slate-200 rounded-2xl p-6 bg-[#FAF9F6]/50 min-h-[350px] flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-4 text-center">
                Visualizing the Workflow Breaking Point
              </span>
              
              <div className="space-y-3 relative text-xs">
                {/* Disconnected tool instances */}
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-[#1C1C1C]">1. Lead Enters CRM</span>
                  <span className="text-[10px] text-rose-500 font-bold border border-rose-100 bg-rose-50 px-2 py-0.5 rounded">Disconnected</span>
                </div>
                
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-[#1C1C1C]">2. Brief arrives through WhatsApp</span>
                  <span className="text-[10px] text-rose-500 font-bold border border-rose-100 bg-rose-50 px-2 py-0.5 rounded">Isolated context</span>
                </div>

                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-[#1C1C1C]">3. Tasks created in PM software</span>
                  <span className="text-[10px] text-rose-500 font-bold border border-rose-100 bg-rose-50 px-2 py-0.5 rounded">Manual copy pasting</span>
                </div>

                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-[#1C1C1C]">4. Retainer Invoices generated elsewhere</span>
                  <span className="text-[10px] text-rose-500 font-bold border border-rose-100 bg-rose-50 px-2 py-0.5 rounded">Margin leakage</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 mt-6 text-center">
              <span className="text-xs font-bold text-indigo-650 uppercase tracking-wider">
                Scroll below to watch them consolidate in the system map ↓
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: THE AGENCY OPERATING SYSTEM CENTERPIECE */}
      <section id="centerpiece" className="py-28 px-6 bg-[#090A0C] text-white border-b border-slate-900">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Core Centerpiece Architecture</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              One Connected System Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
              Hover over the surrounding campaign modules to inspect their entry conditions, outputs, automated workflows, and the specialized AI agents that control them.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 items-start">
            {/* Node Grid Layout */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              {SYSTEM_NODES.map((node) => {
                const NodeIcon = node.icon;
                const isSelected = activeNode.id === node.id;
                
                return (
                  <button
                    key={node.id}
                    onMouseEnter={() => setActiveNode(node)}
                    onClick={() => setActiveNode(node)}
                    className={`p-5 rounded-xl border text-left transition-all duration-300 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600/10 shadow-lg shadow-indigo-600/5'
                        : 'border-slate-800 bg-[#121316] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`rounded-lg p-2 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <NodeIcon className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <h4 className="font-extrabold text-sm tracking-tight">{node.title}</h4>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                          {isSelected ? 'Active Scope' : 'Hover to audit'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simulated Live Monitor Console */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#121316] p-6 shadow-2xl space-y-6 text-xs text-slate-350">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                    Node Monitor Console
                  </span>
                </div>
                <span className="rounded bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                  {activeNode.title}
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Scope Management</span>
                  <p className="text-white leading-relaxed font-semibold">{activeNode.manages}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-850">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Data Inputs Enters</span>
                    <p className="leading-relaxed font-medium">{activeNode.enters}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Data Outputs Leaves</span>
                    <p className="leading-relaxed font-medium">{activeNode.leaves}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-850">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Specialized AI Agents</span>
                  <p className="leading-relaxed font-medium">{activeNode.agents}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-850">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Automated System Workflows</span>
                  <p className="text-indigo-300 leading-relaxed font-medium">{activeNode.flows}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
                <span>Status: Connected to SQLite</span>
                <span className="font-mono">PULSE: SUBTLE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 04: ONE CLIENT, ONE WORKSPACE CINEMATIC JOURNEY */}
      <section className="py-28 px-6 bg-white border-b border-slate-200/60 max-w-7xl mx-auto">
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest block">Interactive Workflow Journey</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
              One Client. One Intelligent Workspace.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              We replace fragmented folders with a single horizontal scroll-guided lifecycle narrative. Check how client data flows from first touchpoint to final profitability.
            </p>
          </div>

          {/* Interactive Steps Journey */}
          <div className="border border-slate-200 rounded-2xl bg-[#FAF9F6]/50 p-8 shadow-xs max-w-4xl mx-auto">
            {/* Step Indicators */}
            <div className="flex justify-between items-center gap-1.5 overflow-x-auto pb-4">
              {clientJourney.map((step, idx) => {
                const isActive = activeJourneyStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveJourneyStep(idx)}
                    className={`h-2.5 rounded-full min-w-8 flex-1 transition-all ${
                      isActive 
                        ? 'bg-indigo-600 shadow-xs' 
                        : 'bg-slate-200 hover:bg-slate-350'
                    }`}
                    title={step.title}
                  />
                );
              })}
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 text-center md:text-left space-y-1">
                <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">
                  Step {activeJourneyStep + 1} of {clientJourney.length}
                </span>
                <h3 className="text-lg font-black text-slate-900">{clientJourney[activeJourneyStep].title}</h3>
              </div>
              <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {clientJourney[activeJourneyStep].detail}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200/80 text-xs">
              <button
                disabled={activeJourneyStep === 0}
                onClick={() => setActiveJourneyStep(prev => prev - 1)}
                className="rounded border border-slate-250 bg-white hover:bg-slate-50 font-bold px-3 py-1.5 disabled:opacity-50"
              >
                Back
              </button>
              <button
                disabled={activeJourneyStep === clientJourney.length - 1}
                onClick={() => setActiveJourneyStep(prev => prev + 1)}
                className="rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 disabled:opacity-50"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 05: AI AGENT TEAM CONSOLE */}
      <section id="ai-team" className="py-28 px-6 bg-[#090A0C] text-white border-b border-slate-900">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Collaborative Execution</span>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight">
              Don't add another AI chatbot. <br className="hidden sm:inline" /> Add an AI team.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
              Our agents are not generic text responders. They operate inside one connected operating system, retrieving context from SQLite tables, capacity stats, and campaign channels to execute collaborative workflows.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Interactive Simulation Panel */}
            <div className="rounded-2xl border border-slate-800 bg-[#121316] p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">
                    Agent Workflow Simulator
                  </span>
                </div>
                <button
                  onClick={() => setIsSimRunning(!isSimRunning)}
                  className="rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-3 py-1"
                >
                  {isSimRunning ? 'Pause Workflow' : 'Play Workflow'}
                </button>
              </div>

              <div className="space-y-4 h-[240px] overflow-y-auto pr-1">
                {agentLogs.slice(0, simStep + 1).map((log, idx) => (
                  <div key={idx} className="space-y-1.5 animate-fade-in text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold rounded px-1.5 py-0.5 ${log.color}`}>
                        {log.role}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">Step {idx + 1}</span>
                    </div>
                    <p className="text-slate-350 leading-relaxed font-medium pl-2 border-l border-slate-800">
                      {log.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-850 text-center">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  "AI agents understand your clients, campaigns, projects, team capacity, approvals, and business performance because they operate inside one connected system."
                </p>
              </div>
            </div>

            {/* List of Agents */}
            <div className="space-y-4">
              {[
                { title: 'AI Account Manager', desc: 'Monitors client communication records, drafts WhatsApp proposals, and registers onboarding profiles.' },
                { title: 'AI Project Manager', desc: 'Analyzes task completions, checks developer workload limits, and logs new project cards.' },
                { title: 'AI Marketing Strategist', desc: 'Researches target demographics to compile growth calendars and channels allocation.' },
                { title: 'AI SEO Specialist', desc: 'Suggests keyword rankings, writes meta tag layouts, and indexes business schema.' }
              ].map((agent, idx) => (
                <div key={idx} className="rounded-xl border border-slate-850 bg-[#121316] p-5 space-y-1">
                  <h4 className="text-sm font-extrabold text-white">{agent.title}</h4>
                  <p className="text-xs text-slate-450 leading-relaxed font-medium">{agent.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 06: BRAND MEMORY VISUAL MATRIX */}
      <section className="py-28 px-6 bg-white border-b border-slate-200/60 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest block">Dynamic Brand Memory</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
              AI that actually knows your clients.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              A standard AI template produces generic, tone-deaf copy. AgencyOS features a persistent Client Brand Memory profile storing specific colors, fonts, industry context, approved vocabulary, guidelines, and banned keywords. 
            </p>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Every content draft or report generated by the operating system automatically cross-references this memory profile to guarantee absolute brand consistency.
            </p>
          </div>

          {/* Interactive Brand Memory Showcase */}
          <div className="border border-slate-200 rounded-2xl bg-[#FAF9F6]/50 p-6 space-y-6">
            <div className="flex justify-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              {(['bloom', 'watch', 'tech'] as const).map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded uppercase tracking-wider transition-all cursor-pointer ${
                    selectedBrand === brand
                      ? 'bg-white text-indigo-650 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {brand === 'bloom' ? 'Bloom Café' : brand === 'watch' ? 'Vanguard Watch' : 'SyncFlow Tech'}
                </button>
              ))}
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-750">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tone of Voice</span>
                  <p className="text-[#1C1C1C] font-extrabold">{brandOutputs[selectedBrand].tone}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Banned Vocabulary</span>
                  <p className="text-rose-600 font-extrabold">{brandOutputs[selectedBrand].banned}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  AI Generated Creative Copy Output
                </span>
                <p className="text-xs text-slate-650 leading-relaxed font-medium italic">
                  {brandOutputs[selectedBrand].output}
                </p>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-center">
              Notice how the AI automatically swaps adjectives and filters banned words based on the active memory profile.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 07: CAMPAIGN COMMAND CENTER */}
      <section id="command-center" className="py-28 px-6 bg-[#090A0C] text-white border-b border-slate-900">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Omnichannel Monitoring</span>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight">
              Every campaign. Every channel.<br />One command center.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
              Tally spend, track CPC metrics, monitor live ROAS margins, and review AI alerts for your entire client portfolio from a single dashboard interface. Toggles clients below.
            </p>
          </div>

          {/* Interactive Command Dashboard */}
          <div className="border border-slate-800 bg-[#121316] rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-850 pb-4">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">
                  Live Campaigns Performance Ledgers
                </span>
              </div>

              {/* Client Toggles */}
              <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                <button
                  onClick={() => setActiveCommandClient('bloom')}
                  className={`text-[10px] font-bold uppercase px-3.5 py-1 rounded transition-all cursor-pointer ${
                    activeCommandClient === 'bloom'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  Bloom Café
                </button>
                <button
                  onClick={() => setActiveCommandClient('zenith')}
                  className={`text-[10px] font-bold uppercase px-3.5 py-1 rounded transition-all cursor-pointer ${
                    activeCommandClient === 'zenith'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  Zenith Retail
                </button>
              </div>
            </div>

            {/* Dashboard KPIs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
              <div className="rounded-xl border border-slate-850 bg-slate-900/60 p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider">BUDGET SPENT</span>
                <p className="text-xl font-black text-white">{commandClientData[activeCommandClient].spend}</p>
                <span className="text-[9px] text-slate-500 font-medium">Billed current month</span>
              </div>
              <div className="rounded-xl border border-slate-850 bg-slate-900/60 p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider">REVENUE GENERATED</span>
                <p className="text-xl font-black text-white">{commandClientData[activeCommandClient].revenue}</p>
                <span className="text-[9px] text-emerald-500 font-semibold">Live return tracking</span>
              </div>
              <div className="rounded-xl border border-slate-850 bg-slate-900/60 p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider">LIVE ROAS INDEX</span>
                <p className={`text-xl font-black ${commandClientData[activeCommandClient].performanceColor}`}>
                  {commandClientData[activeCommandClient].roas}
                </p>
                <span className="text-[9px] text-slate-500 font-semibold">Target: &gt;3.00x</span>
              </div>
              <div className="rounded-xl border border-slate-850 bg-slate-900/60 p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider">CLICKS / ENGAGEMENT</span>
                <p className="text-xl font-black text-white">{commandClientData[activeCommandClient].clicks}</p>
                <span className="text-[9px] text-slate-500 font-semibold">Meta & Google combined</span>
              </div>
            </div>

            {/* Alert bar */}
            <div className="rounded-xl border border-slate-850 bg-slate-950 p-4 text-xs font-semibold text-slate-300">
              {commandClientData[activeCommandClient].alert}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 08: WHATSAPP CONVERSATIONAL FLOW */}
      <section className="py-28 px-6 bg-white border-b border-slate-200/60 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest block">Conversational CRM Integration</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
              Turn conversations into growth.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              We treat WhatsApp Business as a native segment of your agency CRM infrastructure. Watch incoming messages qualify leads automatically, update contact records, and notify sales team executives on high-value retainers.
            </p>
            <div className="space-y-3.5 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                <span>Shared Team Inbox mapping WhatsApp & email</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                <span>Approved marketing template campaigns broadcasts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                <span>Auto Lead Qualification with message analytics</span>
              </div>
            </div>
          </div>

          {/* Interactive Chat qualification flow visual */}
          <div className="border border-slate-200 rounded-2xl bg-[#FAF9F6]/50 p-6 space-y-4">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
              WhatsApp Qualification Journey Simulator
            </span>

            <div className="space-y-4">
              {/* Message 1 */}
              <div className="bg-slate-100 text-slate-800 rounded-lg rounded-tl-none p-3 max-w-[85%] text-xs font-semibold mr-auto">
                <span className="text-[8px] text-slate-400 font-bold block mb-1">Meera (Bloom Café)</span>
                "Hi! We are looking to scale our weekend brunch bookings by 40% next month. Can your agency help?"
              </div>

              {/* Message 2 (AI Auto Reply) */}
              <div className="bg-indigo-600 text-white rounded-lg rounded-tr-none p-3 max-w-[85%] text-xs font-semibold ml-auto text-right">
                <span className="text-[8px] text-indigo-200 font-bold block mb-1">AI Agent (Auto-reply)</span>
                "Hello Meera! Absolutely. I have analyzed your local search indexing. I've logged this in our CRM and created a website copy redesign task for Aarav Patel. Would you like to review our automated proposal copy?"
              </div>

              {/* CRM Update Log indicator */}
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 text-[10px] text-indigo-700 font-extrabold text-center uppercase tracking-wide">
                ⚡ CRM Pipeline Synchronized: Opportunity logged (Value: ₹85k Retainer)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 09: ADVERTISING WORKSPACE & SLIDER */}
      <section className="py-28 px-6 bg-white border-b border-slate-200/60 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Interactive Spend Estimator Widget */}
          <div className="border border-slate-200 bg-[#FAF9F6]/50 rounded-2xl p-6 space-y-6">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
                Budget Allocation & CPC Estimator
              </span>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-left">
                  Simulated Monthly Ad Spend: ₹{adSpend.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="10000"
                  max="150000"
                  step="5000"
                  value={adSpend}
                  onChange={(e) => setAdSpend(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-0.5">
                <span className="text-[8px] font-bold text-slate-400 uppercase">Est. Clicks</span>
                <p className="font-extrabold text-[#1C1C1C]">{estimatedClicks.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-0.5">
                <span className="text-[8px] font-bold text-slate-400 uppercase">Est. Leads</span>
                <p className="font-extrabold text-[#1C1C1C]">{estimatedLeads.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-0.5">
                <span className="text-[8px] font-bold text-slate-400 uppercase">ROAS Pacing</span>
                <p className="font-extrabold text-indigo-600">{estimatedROAS}x</p>
              </div>
            </div>

            <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider block text-center">
              "Create and manage campaigns across supported advertising integrations."
            </span>
          </div>

          <div className="space-y-6">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest block">Interactive Advertising Hub</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
              Plan. Launch. Monitor. Optimize.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Connect Meta Ads, Google Analytics, and LinkedIn Ads accounts to synchronize your budgets under one ledger. The system maps pacing CPC, flags ROI decreases, and makes recommendation edits to allocate funds to high-performing campaigns dynamically.
            </p>
            <div className="flex gap-3">
              {['Meta Ads', 'Google Ads', 'LinkedIn Ads'].map((ch) => (
                <span key={ch} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700">
                  {ch} Connected
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: CALM CLIENT PORTAL VIEW COMPARISON */}
      <section className="py-28 px-6 bg-[#090A0C] text-white border-b border-slate-900">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Calm Client Portal</span>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight">
              Powerful for your agency. <br /> Effortless for your clients.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
              Contrast your complex developer project dashboard workspace with the ultra-clean, minimal client dashboard. They review creatives, check timelines, and audit invoices in absolute calm.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Left: Complex Internal Agency Dashboard */}
            <div className="rounded-xl border border-slate-800 bg-[#121316] p-5 space-y-4 opacity-75">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">
                Internal Agency Operating System Panel
              </span>
              <div className="space-y-2 text-[10px] font-mono text-slate-400">
                <div className="border border-slate-850 p-2.5 rounded bg-slate-950 flex justify-between">
                  <span>SELECT * FROM "Task" WHERE status = "TODO"</span>
                  <span className="text-indigo-400">EXPLAIN ANALYZE</span>
                </div>
                <div className="border border-slate-850 p-2.5 rounded bg-slate-950 flex justify-between">
                  <span>GET /api/dashboard?retries=3&timeout=1500</span>
                  <span className="text-emerald-400">200 OK (11ms)</span>
                </div>
                <div className="border border-slate-850 p-2.5 rounded bg-slate-950">
                  <p>DB connections pool: 8 active. SQLite file locks: 0.</p>
                  <p className="text-slate-600 mt-1">Gantt milestone check dependencies loaded: true</p>
                </div>
              </div>
            </div>

            {/* Right: Calm, Premium Client Portal */}
            <div className="rounded-xl border border-indigo-900/60 bg-white p-5 space-y-4 text-slate-800 shadow-xl shadow-indigo-950/20">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[9px] font-bold text-indigo-650 uppercase tracking-widest block">
                  Branded Client Portal View
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-[#1C1C1C]">Bloom Café website layout redesigned</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  We have updated the pour-over origins pricing and added monsoon layouts. Click to review.
                </p>

                <div className="flex gap-2 justify-end text-[10px] font-bold">
                  <button className="rounded border border-slate-200 hover:bg-slate-50 px-3 py-1 text-slate-500">
                    Request revisions
                  </button>
                  <button className="rounded bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1">
                    Approve draft copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: EXECUTIVE COPILOT SIMULATED TERMINAL */}
      <section className="py-28 px-6 bg-white border-b border-slate-200/60 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest block">Conversational Database Exploration</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
              Ask your agency anything.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Stop digging through separate dashboards to find metrics. Simply query the Executive Copilot. It scans CRM retainers, active campaign ad CPCs, and invoice payment statuses to write out custom text briefings and log correction tasks.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleCopilotQuery('profitability')}
                className={`text-left rounded-lg border p-3.5 transition-all text-xs font-bold ${
                  copilotQuery === 'profitability'
                    ? 'border-indigo-400 bg-indigo-50/50 text-indigo-750'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                ❓ "Which clients are becoming unprofitable?"
              </button>
              <button
                onClick={() => handleCopilotQuery('campaigns')}
                className={`text-left rounded-lg border p-3.5 transition-all text-xs font-bold ${
                  copilotQuery === 'campaigns'
                    ? 'border-indigo-400 bg-indigo-50/50 text-indigo-750'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                ❓ "Which campaigns need attention today?"
              </button>
              <button
                onClick={() => handleCopilotQuery('workload')}
                className={`text-left rounded-lg border p-3.5 transition-all text-xs font-bold ${
                  copilotQuery === 'workload'
                    ? 'border-indigo-400 bg-indigo-50/50 text-indigo-750'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                ❓ "Who is overloaded this week?"
              </button>
            </div>
          </div>

          {/* Simulated Copilot output terminal */}
          <div className="rounded-2xl border border-slate-800 bg-[#0F131E] p-5 shadow-2xl text-slate-200 min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-indigo-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Executive Assistant Terminal
                  </span>
                </div>
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
              </div>

              {isCopilotLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
                  <span className="text-[10px] text-slate-500 font-mono">Processing database queries...</span>
                </div>
              ) : copilotResponse ? (
                <div className="space-y-4 animate-fade-in text-xs leading-relaxed text-slate-300">
                  <div className="whitespace-pre-wrap font-sans text-left">
                    {/* Render text mockup */}
                    {copilotResponse.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>

                  <div className="flex justify-start">
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 text-[9px] font-bold text-indigo-400 uppercase tracking-wide">
                      ⚡ Action proposing: {copilotAnswers[copilotQuery as 'profitability' | 'campaigns' | 'workload'].action}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-xs text-slate-500 font-medium">
                  Select a question on the left to query the sqlite operating database logs.
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-3 mt-4 text-center">
              <span className="text-[9px] text-slate-550 font-bold uppercase tracking-widest block">
                "Imagine knowing what needs attention before it becomes a problem."
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: PRODUCT VALIDATION / EARLY ACCESS TRANSITIONAL CONVERSION */}
      <section className="py-28 px-6 bg-[#FAF9F6] border-b border-slate-200/60 max-w-5xl mx-auto text-center space-y-10">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest block">Founding Member Partnership</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            We're building AgencyOS with agencies, <br /> not just for them.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
            We are preparing for our initial MVP product launch. In the spirit of build transparency, we are inviting a limited group of agency founders and marketing professionals to join our waitlist and help define the operating system's roadmap.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {[
            { t: 'Early Product Access', d: 'Receive priority access to compile layouts and test SQLite database updates.' },
            { t: 'Founding Member Pricing', d: 'Secure permanent early pricing retainers once production licenses scale.' },
            { t: 'Direct Product Influence', d: 'Co-design features directly with our engineering and AI strategies team.' },
            { t: 'Private Founder Community', d: 'Gain access to a selected group of boutique agency owners.' },
            { t: 'Priority Onboarding', d: 'Receive direct technical configuration help mapping existing ad accounts.' },
            { t: 'Early Roadmap Access', d: 'Review upcoming WhatsApp and automation releases before the public launch.' }
          ].map((benefit, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 space-y-1">
              <h4 className="text-xs font-extrabold text-[#1C1C1C] flex items-center gap-1.5">
                <Check className="h-4 w-4 text-indigo-650 shrink-0" />
                {benefit.t}
              </h4>
              <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">{benefit.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 13: INTERACTIVE FEEDBACK QUESTION (UNCONVENTIONAL VALIDATOR) */}
      <section className="py-28 px-6 bg-white border-b border-slate-200/60 max-w-5xl mx-auto">
        <div className="max-w-2xl mx-auto space-y-8 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest block">Interactive Validation Survey</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
              If AgencyOS could solve one problem for your agency tomorrow, what should it be?
            </h2>
          </div>

          {problemStep === 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Managing Clients', 'Project Delivery', 'Content Production', 
                'Social Media Scheduling', 'Advertising Budgets', 'WhatsApp Marketing', 
                'Client Reporting', 'Team Productivity', 'Retainer Profitability', 
                'API Webhook Automation', 'Something Else'
              ].map((prob) => (
                <button
                  key={prob}
                  onClick={() => {
                    setSelectedProblem(prob);
                    setProblemStep(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                >
                  {prob}
                </button>
              ))}
            </div>
          )}

          {problemStep === 1 && (
            <div className="space-y-4 max-w-md mx-auto text-left animate-fade-in">
              <span className="text-xs font-bold text-indigo-650 uppercase block">Selected: {selectedProblem}</span>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tell us why</label>
                <textarea
                  value={problemFeedback}
                  onChange={(e) => setProblemFeedback(e.target.value)}
                  placeholder="How does this impact your agency metrics? Tell us briefly..."
                  className="w-full text-xs rounded-lg border border-slate-200 p-3 bg-white outline-none focus:border-indigo-500 min-h-[100px]"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end text-xs">
                <button
                  onClick={() => {
                    setSelectedProblem(null);
                    setProblemStep(0);
                    setProblemFeedback('');
                  }}
                  className="rounded border border-slate-200 hover:bg-slate-50 px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setProblemStep(2)}
                  className="rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          )}

          {problemStep === 2 && (
            <div className="py-8 space-y-3 animate-fade-in text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600 mx-auto">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="text-base font-extrabold text-[#1C1C1C]">Thanks. You're helping shape AgencyOS.</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                We have saved this input to guide our core layout and AI agent configurations.
              </p>
              <button
                onClick={() => {
                  setSelectedProblem(null);
                  setProblemFeedback('');
                  setProblemStep(0);
                }}
                className="text-xs text-indigo-650 font-bold hover:underline"
              >
                Submit another response
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 14: WAITLIST CONVERSION REQUEST FORM */}
      <section id="waitlist" className="py-28 px-6 bg-[#090A0C] text-white relative">
        <div className="max-w-md mx-auto space-y-8 text-center z-10 relative">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Apply For Access</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Your agency deserves better infrastructure.
            </h2>
            <p className="text-xs text-slate-450 leading-relaxed font-semibold">
              Help us build the operating system modern agencies actually need. Requests are evaluated manually.
            </p>
          </div>

          {waitlistSubmitted ? (
            <div className="rounded-xl border border-indigo-900 bg-slate-900/50 p-6 text-center space-y-4 animate-fade-in">
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-650/20">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Application Received successfully!</h4>
                <p className="text-xs text-slate-450 mt-1.5 leading-relaxed font-medium">
                  Thanks for applying, {waitlistName}. We'll audit your operational challenges and reach out to {waitlistEmail} within 48 hours.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="rounded-xl border border-slate-800 bg-[#121316]/80 p-6 shadow-2xl space-y-4 text-left text-xs font-semibold text-slate-350">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={waitlistName}
                  onChange={(e) => setWaitlistName(e.target.value)}
                  placeholder="e.g. Aarav Patel"
                  className="w-full text-xs rounded-lg border border-slate-850 bg-slate-900/60 p-2.5 bg-white outline-none focus:border-indigo-500 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Work Email</label>
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="name@agency.com"
                    className="w-full text-xs rounded-lg border border-slate-850 bg-slate-900/60 p-2.5 bg-white outline-none focus:border-indigo-500 text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Agency Name</label>
                  <input
                    type="text"
                    value={waitlistAgency}
                    onChange={(e) => setWaitlistAgency(e.target.value)}
                    placeholder="e.g. AgencyOS Digital"
                    className="w-full text-xs rounded-lg border border-slate-850 bg-slate-900/60 p-2.5 bg-white outline-none focus:border-indigo-500 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Agency Size</label>
                <select
                  value={waitlistSize}
                  onChange={(e) => setWaitlistSize(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-850 bg-slate-900 p-2.5 outline-none focus:border-indigo-500 text-white"
                >
                  <option value="1-5">Boutique (1-5 staff)</option>
                  <option value="6-20">Growth (6-20 staff)</option>
                  <option value="21-50">Scale (21-50 staff)</option>
                  <option value="50+">Enterprise (50+ staff)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Biggest Operational Challenge</label>
                <textarea
                  value={waitlistChallenge}
                  onChange={(e) => setWaitlistChallenge(e.target.value)}
                  placeholder="e.g. isolated tools, invoicing margins leakage, client copy review bottlenecks..."
                  className="w-full text-xs rounded-lg border border-slate-850 bg-slate-900/60 p-2.5 bg-white outline-none focus:border-indigo-500 min-h-[70px] text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all mt-4 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Sending Request...' : 'Request Early Access'}
              </button>

              <span className="text-[9px] text-slate-500 block text-center mt-2.5 font-bold uppercase tracking-wider">
                No spam. No pressure. Just product updates and early-access invitations.
              </span>
            </form>
          )}

          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
            "Limited early partners will receive founding-member benefits."
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/60 bg-white py-16 px-6 text-slate-750">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-12 items-start text-xs font-semibold">
          {/* Wordmark & Statement */}
          <div className="md:col-span-6 space-y-4">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C1C1C] text-white font-bold text-lg">
                ⬡
              </div>
              <span className="font-extrabold text-[#1C1C1C] tracking-tight text-base">AgencyOS</span>
              <span className="rounded bg-indigo-50 border border-indigo-200 px-1 py-0.2 text-[8px] font-bold text-indigo-650">AI</span>
            </Link>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              The AI Operating System for Marketing Agencies.
            </p>
            <p className="text-slate-450 max-w-sm leading-relaxed font-medium">
              A unified campaign cockpit for modern boutique agencies. Syncing retainers pipelines, project copy checkoffs, WhatsApp dialogues, and financial metrics dynamically.
            </p>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block pt-2">
              Built with ambitious agencies.
            </span>
          </div>

          {/* Links columns */}
          <div className="md:col-span-2 space-y-3 text-left">
            <span className="text-[9px] font-bold text-[#1C1C1C] uppercase tracking-widest block">Product</span>
            <ul className="space-y-2 text-slate-500 font-medium">
              <li><a href="#control-system" className="hover:text-black transition-colors">Campaign Cockpit</a></li>
              <li><a href="#centerpiece" className="hover:text-black transition-colors">System Modules Map</a></li>
              <li><a href="#ai-team" className="hover:text-black transition-colors">Specialized AI Agents</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3 text-left">
            <span className="text-[9px] font-bold text-[#1C1C1C] uppercase tracking-widest block">Developer Scope</span>
            <ul className="space-y-2 text-slate-500 font-medium">
              <li><Link href="/login" className="hover:text-black transition-colors">Sign In Preview</Link></li>
              <li><Link href="/client" className="hover:text-black transition-colors">Branded Client Portal</Link></li>
              <li><a href="#waitlist" className="hover:text-black transition-colors">Early Partners Waiting List</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3 text-left">
            <span className="text-[9px] font-bold text-[#1C1C1C] uppercase tracking-widest block">Social & Support</span>
            <ul className="space-y-2 text-slate-500 font-medium">
              <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors flex items-center gap-1.5">LinkedIn <ExternalLink className="h-3 w-3" /></a></li>
              <li><a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-black transition-colors flex items-center gap-1.5">X / Twitter <ExternalLink className="h-3 w-3" /></a></li>
              <li><a href="mailto:support@agencyos.ai" className="hover:text-black transition-colors">Contact email</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>&copy; 2026 AgencyOS Digital Inc. All rights reserved.</span>
          <span>Running SQLite Sandbox Node Environment</span>
        </div>
      </footer>

    </div>
  );
}
