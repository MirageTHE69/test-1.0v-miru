'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Users, 
  FolderKanban, 
  IndianRupee, 
  Bot, 
  CheckCircle2, 
  Star,
  ChevronDown,
  HelpCircle,
  TrendingUp,
  Layers,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { number: '1,200+', label: 'Agencies Powered' },
    { number: '₹24Cr+', label: 'Retainers Managed' },
    { number: '850K+', label: 'AI Deliverables Approved' },
    { number: '99.2%', label: 'Client Satisfaction Index' }
  ];

  const pricingPlans = [
    {
      name: 'Developer Sandbox',
      price: '₹0',
      period: 'Forever Free',
      description: 'Test workflows, seed single-client operations, and compile AI copilots locally.',
      features: [
        '1 Active Client Profile',
        'SQLite Local Database File',
        'Full AI PM & Copywriter Access',
        'Standard Project Kanban Board',
        'Invoice Billing Overview',
        'Client Branded Portal Simulator'
      ],
      cta: 'Launch Sandbox',
      popular: false
    },
    {
      name: 'Agency Scale',
      price: '₹12,500',
      period: 'Per Month',
      description: 'Ideal for growing boutique agencies managing multiple multi-tenant retainers.',
      features: [
        'Unlimited Client Workspaces',
        'Up to 10 Team Seats',
        'AI Brand Memory Vector Profiles',
        'Omnichannel Auto-Publishing (Instagram, X)',
        'Strategic Marketing Plan Compiler',
        'Shared Slack & Teams Client Connectors'
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true
    },
    {
      name: 'Enterprise Hub',
      price: 'Custom',
      period: 'Contact Sales',
      description: 'Designed for global networks requiring high performance, security, and ledger systems.',
      features: [
        'Everything in Scale plan',
        'Dedicated Dedicated Support PM',
        'Custom AI Strategy Fine-Tuning',
        'Full Multi-Tenant Profit Ledger Audit',
        'Whitelabel Portal custom domains',
        'Meta, LinkedIn & Google Ads Live APIs'
      ],
      cta: 'Request Enterprise Demo',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'Is AgencyOS AI compatible with local databases?',
      answer: 'Yes! The developer preview stores all records dynamically in a local SQLite file (`dev.db`). You can inspect, modify, and migrate schemas on demand.'
    },
    {
      question: 'How does the Client Brand Memory system work?',
      answer: 'Brand Memory is a dedicated table linking tone guidelines, colors, industries, audiences, and prohibited vocabulary. The AI strategies automatically inject these rules into creative content streams.'
    },
    {
      question: 'What is the role of the AI PM Copilot?',
      answer: 'The persistent sidebar Copilot simulates active agency directors. It analyzes project delay margins, writes client notifications, tracks ad pacing, and updates task boards via chat prompts.'
    },
    {
      question: 'Can I publish to social media channels directly?',
      answer: 'Phase 3 implements dynamic Omnichannel checklists for Instagram, Facebook, LinkedIn, and X. It simulates direct API connection progress indicators and publishes records instantly in the social scheduler logs.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 selection:text-white font-sans text-[1.05rem]">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. STICKY HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/60 py-4 shadow-lg' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-600/20">
              ⬡
            </div>
            <span className="font-extrabold text-white tracking-wide text-xl">AgencyOS</span>
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">AI</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Performance</a>
            <a href="#preview" className="hover:text-white transition-colors">Console</a>
            <a href="#pricing" className="hover:text-white transition-colors">Plans</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4.5 py-2.5 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO HIGHLIGHTS */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800/80 px-4.5 py-1.5 text-xs text-indigo-400 font-bold mb-8 hover:border-slate-700 cursor-pointer transition-all">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Starting Phase 3: Client Marketing & Omnichannel Suite</span>
        </div>

        <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white font-tight max-w-5xl mx-auto leading-tight">
          Manage Your Agency Operations <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500">
            Through Collaborative AI
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto mt-8 leading-relaxed">
          The unified Next.js dashboard linking client Brand Memory files to CRM pipelines, marketing plan generators, creative copy image renderers, and live SQLite database schedulers.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 group"
          >
            <span>Launch Live Console</span>
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#preview"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 text-slate-300 font-semibold px-8 py-4 transition-all hover:-translate-y-0.5"
          >
            Explore Dashboard
          </a>
        </div>
      </section>

      {/* 3. VISUAL STATISTICS SECTION */}
      <section id="stats" className="py-12 bg-slate-950/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">{stat.number}</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PRODUCT MOCK PREVIEW */}
      <section id="preview" className="px-6 py-28 max-w-6xl mx-auto">
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/30 p-4 shadow-2xl backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-80 z-10" />
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 px-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="text-[10px] text-slate-600 font-mono bg-slate-950/60 rounded px-4 py-0.5 border border-slate-900">
              https://app.agencyos.ai/dashboard
            </div>
            <div className="w-10" />
          </div>

          <div className="grid gap-4 md:grid-cols-4 select-none opacity-80">
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4 space-y-1">
              <span className="text-[9px] font-bold text-slate-500 tracking-wider">REVENUE MTD</span>
              <p className="text-xl font-bold text-white">₹8.5L</p>
              <span className="text-[9px] text-emerald-500 font-semibold">+12% vs last month</span>
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4 space-y-1">
              <span className="text-[9px] font-bold text-slate-500 tracking-wider">ACTIVE CLIENTS</span>
              <p className="text-xl font-bold text-white">1 Active</p>
              <span className="text-[9px] text-slate-500 font-medium">Realtime Synchronized</span>
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4 space-y-1">
              <span className="text-[9px] font-bold text-slate-500 tracking-wider">PROFIT MARGIN</span>
              <p className="text-xl font-bold text-white">52%</p>
              <span className="text-[9px] text-emerald-500 font-semibold">Healthy Margin Index</span>
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4 space-y-1">
              <span className="text-[9px] font-bold text-slate-500 tracking-wider">PENDING APPROVALS</span>
              <p className="text-xl font-bold text-white">2 Items</p>
              <span className="text-[9px] text-amber-500 font-semibold">Action Required</span>
            </div>
          </div>

          {/* Foreground card */}
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center p-6 bg-slate-950/40 backdrop-blur-xs">
            <div className="rounded-2xl border border-slate-800 bg-[#0F1321] p-6 shadow-2xl text-center max-w-md border-t-indigo-500/40 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white mt-4">SQLite Development Console</h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Add leads in CRM, convert them to WON, compile custom Brand Memories, draft templates, mock post images, and run scheduling workflows in real-time.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5"
              >
                <span>Launch Free Preview</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING GRIDS */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Pricing Strategy</h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-white mt-3 font-tight">Plans tailored for any team size</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-4 leading-relaxed">
            Start testing for free on your local workspace sandbox. Upgrade when adding additional team members or scaling channels.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-start">
          {pricingPlans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`rounded-2xl border bg-slate-900/10 p-6 space-y-6 relative flex flex-col justify-between ${
                plan.popular 
                  ? 'border-indigo-500 shadow-xl shadow-indigo-600/5' 
                  : 'border-slate-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-4 rounded-full bg-indigo-600 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                  Most Popular
                </span>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono">{plan.price}</span>
                  <span className="text-slate-500 text-xs font-medium font-sans">/{plan.period}</span>
                </div>
                
                <ul className="space-y-3 pt-2 text-xs">
                  {plan.features.map((feature, idx2) => (
                    <li key={idx2} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/login"
                className={`w-full text-center rounded-xl py-3 text-xs font-bold transition-all mt-6 ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Frequently Asked Questions</h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-white mt-3 font-tight">Got Questions? We Have Answers</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-xl border border-slate-800/80 bg-slate-900/10 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-900/20 transition-colors"
                >
                  <span className="text-sm font-bold text-white">{faq.question}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 border-t border-slate-800/60">
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-900 bg-[#070A11] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg">
              ⬡
            </div>
            <span className="font-extrabold text-white tracking-wide text-sm">AgencyOS</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; 2026 AgencyOS Digital Inc. All rights reserved. Running sandbox SQLite environment.
          </p>
        </div>
      </footer>
    </div>
  );
}
