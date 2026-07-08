'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  FolderKanban,
  Briefcase,
  MessageSquare,
  IndianRupee,
  FileBarChart,
  Zap,
  Bot,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  HelpCircle,
  Menu,
  LogOut,
} from 'lucide-react';

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeClient,
    setActiveClient,
    activeUser,
    isAiPanelOpen,
    setIsAiPanelOpen,
    clients,
  } = useApp();

  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOk, setAuthOk] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const clientName = activeClient?.name || 'Client';
    setNotifications([
      {
        id: 'notif_1',
        title: 'Omnichannel Post Scheduled',
        message: `Instagram & LinkedIn campaign post scheduled for ${clientName} tomorrow at 9:00 AM.`,
        time: '10 mins ago',
        read: false,
      },
      {
        id: 'notif_2',
        title: 'Executive & Manager Reminder Set',
        message: `Priya (Manager) & Aarav (Executive) notified to review ${clientName} scheduled content.`,
        time: '1 hour ago',
        read: false,
      },
      {
        id: 'notif_3',
        title: 'Strategy Plan Drafted',
        message: `AI generated a brand new marketing plan outline for ${clientName}.`,
        time: '3 hours ago',
        read: true,
      },
    ]);
  }, [activeClient]);

  // Authentication Guards
  useEffect(() => {
    if (pathname === '/' || pathname === '/login') {
      setAuthOk(true);
      return;
    }
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      setAuthOk(true);
    } else {
      router.push('/login');
    }
  }, [pathname, router]);

  // AI Copilot states
  const [aiActiveTab, setAiActiveTab] = useState<'pm' | 'copywriter' | 'seo' | 'finance'>('pm');
  const [aiInput, setAiInput] = useState('');
  const [aiChats, setAiChats] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([]);

  // Dynamically initialize AI copilot greeting
  useEffect(() => {
    if (activeClient) {
      setAiChats([
        {
          sender: 'ai',
          text: `Hello ${activeUser?.name || 'Aarav'}! I have synchronized with ${activeClient.name}'s workspace. Brand tone guidelines are loaded. Let me know if you need to draft content or analyze budgets.`,
          time: 'Just now',
        }
      ]);
    } else {
      setAiChats([
        {
          sender: 'ai',
          text: `Welcome to AgencyOS! Choose a client account to begin co-piloting.`,
          time: 'Just now',
        }
      ]);
    }
  }, [activeClient, activeUser]);

  // Bypassing sidebar/header rendering for public or client paths
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/client')) {
    return <>{children}</>;
  }

  if (!authOk) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8F9FD]">
        <div className="h-8 w-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleSendAiMessage = () => {
    if (!aiInput.trim()) return;
    const newChats = [...aiChats, { sender: 'user' as const, text: aiInput, time: 'Just now' }];
    setAiChats(newChats);
    setAiInput('');

    // Simulate AI response
    setTimeout(() => {
      let replyText = "I'm processing that request. Let me check the details for " + (activeClient?.name || 'this client') + ".";
      if (aiActiveTab === 'copywriter') {
        replyText = `✨ Proposal draft generated based on ${activeClient?.name || 'Client'}'s Brand Memory. I have updated the proposal text in the CRM. You can review it now.`;
      } else if (aiActiveTab === 'pm') {
        replyText = `Done — draft ready in Comms for your review before sending. ✨`;
      } else if (aiActiveTab === 'seo') {
        replyText = `Analysis complete. Keyword ranking for "${activeClient?.name || 'Client'}" has improved by 4 spots this week. Suggested actions updated in report.`;
      } else if (aiActiveTab === 'finance') {
        replyText = `Live margin check: ${activeClient?.name || 'Client'} stands at a stable profitability index of 52%. All invoices are currently paid.`;
      }

      setAiChats((prev) => [...prev, { sender: 'ai' as const, text: replyText, time: 'Just now' }]);
    }, 1200);
  };

  const navItems = [
    {
      cluster: 'Grow',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'CRM', href: '/crm', icon: Users },
        { label: 'Marketing', href: '/marketing', icon: Calendar },
        { label: 'Content Planner', href: '/planner', icon: Sparkles },
        { label: 'Advertising', href: '/advertising', icon: Megaphone },
      ],
    },
    {
      cluster: 'Deliver',
      items: [
        { label: 'Projects', href: '/projects', icon: FolderKanban },
        { label: 'Client Workspace', href: '/portal', icon: Briefcase },
        { label: 'Communication', href: '/inbox', icon: MessageSquare },
      ],
    },
    {
      cluster: 'Run the Agency',
      items: [
        { label: 'Finance', href: '/finance', icon: IndianRupee },
        { label: 'Reports', href: '/reports', icon: FileBarChart },
        { label: 'Automation', href: '/automation', icon: Zap },
      ],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FD]">
      {/* 1. FIXED LEFT SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#0F172A] text-slate-300 transition-transform duration-300 xl:static xl:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'}`}>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg">
            ⬡
          </div>
          <span className="font-semibold text-white tracking-wide text-lg">AgencyOS</span>
          <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">AI</span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          {navItems.map((group) => (
            <div key={group.cluster} className="space-y-2">
              <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.cluster}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User Details */}
        <div className="border-t border-slate-800 p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-slate-900/40 flex-1 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-semibold text-sm">
              {activeUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{activeUser?.name || 'Aarav Patel'}</p>
              <p className="truncate text-xs text-slate-500 capitalize">{activeUser?.role?.toLowerCase() || 'Owner'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('loggedInUserEmail');
              router.push('/login');
            }}
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* 2. GLOBAL TOP BAR */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 xl:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients, tasks, documents..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Active Client Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{activeClient?.name || 'Loading client...'}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {isClientDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsClientDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 z-20 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Switch Client Account
                    </div>
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setActiveClient(client);
                          setIsClientDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-left transition-colors ${
                          activeClient?.id === client.id
                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{client.name}</span>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                          client.status === 'HEALTHY' ? 'bg-green-500' :
                          client.status === 'WATCH' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notification trigger */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-50 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-indigo-600" />
                )}
              </button>

              {isNotificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsNotificationOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-20 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 pb-2">
                      <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Reminders & Notifications</span>
                      <button 
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-1">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No new alerts</div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                            }}
                            className={`p-3 text-left transition-colors cursor-pointer rounded-lg hover:bg-slate-50 flex gap-2.5 items-start ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                          >
                            <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-indigo-600' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-800">{notif.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                              <span className="text-[9px] text-slate-400 mt-1 block font-medium">{notif.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Collapsed AI Button toggle */}
            <button
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold border transition-all ${
                isAiPanelOpen
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden md:inline">AI Copilot</span>
            </button>
          </div>
        </header>

        {/* Inner layout with optional AI Copilot panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main workspace scroll view */}
          <main className="flex-1 overflow-y-auto p-8 min-w-0">
            {children}
          </main>

          {/* 3. PERSISTENT COLLAPSIBLE AI PANEL */}
          {isAiPanelOpen && (
            <aside className="w-80 border-l border-slate-200 bg-white flex flex-col slide-in-right relative shrink-0">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                  <h2 className="font-semibold text-slate-800">AI Team</h2>
                </div>
                <button
                  onClick={() => setIsAiPanelOpen(false)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scoped Agent Selection Tabs */}
              <div className="flex border-b border-slate-100 p-2 gap-1 bg-slate-50/50">
                {(['pm', 'copywriter', 'seo', 'finance'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAiActiveTab(tab)}
                    className={`flex-1 rounded py-1.5 text-[10px] font-bold text-center capitalize transition-all ${
                      aiActiveTab === tab
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab === 'pm' ? 'Project Mgr' : tab}
                  </button>
                ))}
              </div>

              {/* Active Agent Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiChats.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] rounded-lg p-3 text-sm ${
                      chat.sender === 'user'
                        ? 'bg-indigo-600 text-white self-end ml-auto rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 mr-auto rounded-tl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{chat.text}</p>
                    <span className={`text-[10px] mt-1 text-right block ${chat.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {chat.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Suggestions quick action buttons */}
              {aiActiveTab === 'pm' && (
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/20 space-y-2">
                  <button
                    onClick={() => {
                      setAiChats((prev) => [
                        ...prev,
                        { sender: 'user', text: 'Yes, notify designer Aarav and Priya.', time: 'Just now' },
                      ]);
                      setTimeout(() => {
                        setAiChats((prev) => [
                          ...prev,
                          { sender: 'ai', text: 'Done — draft ready in Comms for your review before sending. ✨', time: 'Just now' },
                        ]);
                      }, 1000);
                    }}
                    className="w-full text-left rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                  >
                    Yes, and draft the client update message.
                  </button>
                </div>
              )}

              {/* Message Composer */}
              <div className="border-t border-slate-200 p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendAiMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder={`Ask AI ${
                      aiActiveTab === 'pm' ? 'Project Manager' :
                      aiActiveTab === 'copywriter' ? 'Copywriter' :
                      aiActiveTab === 'seo' ? 'SEO Strategist' : 'Finance Copilot'
                    }...`}
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Send
                  </button>
                </form>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
