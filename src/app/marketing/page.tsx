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
  Check
} from 'lucide-react';

// Custom SVG Brand Icons (safeguards compilation against differing lucide-react package versions)
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
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
  socialCalendar: string;
  telegramToken?: string | null;
  telegramChatId?: string | null;
  slackWebhookUrl?: string | null;
  discordWebhookUrl?: string | null;
  customWebhookUrl?: string | null;
  xConsumerKey?: string | null;
  xConsumerSecret?: string | null;
  xAccessToken?: string | null;
  xAccessTokenSecret?: string | null;
  linkedinAccessToken?: string | null;
  linkedinPersonId?: string | null;
}

interface PostItem {
  id: string;
  content: string;
  date: string;
  time: string;
  channels: string[];
  status: 'SCHEDULED' | 'PUBLISHED';
}

export default function MarketingPage() {
  const { activeClient } = useApp();
  const [brandMemory, setBrandMemory] = useState<BrandMemoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'planner' | 'creative' | 'scheduler' | 'integrations'>('profile');

  // Brand Profile form states
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('');
  const [bannedWords, setBannedWords] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [colors, setColors] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Strategy Planner states
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [marketingPlan, setMarketingPlan] = useState<string | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Creative Suite states
  const [promptText, setPromptText] = useState('');
  const [contentType, setContentType] = useState<'CAPTION' | 'AD_COPY' | 'BLOG'>('CAPTION');
  const [generatedResult, setGeneratedResult] = useState('');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  // Mock Image states
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState('VIBRANT');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageProgressStep, setImageProgressStep] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Social Scheduler states
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [showAddPost, setShowAddPost] = useState(false);
  const [postCopy, setPostCopy] = useState('');
  const [postDate, setPostDate] = useState('2026-07-05');
  const [postTime, setPostTime] = useState('09:00 AM');
  const [postChannels, setPostChannels] = useState<string[]>(['slack']);

  // Real publish states
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [publishLogs, setPublishLogs] = useState<{ channel: string; status: 'SUCCESS' | 'FAILED' | 'SIMULATED'; details: string }[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Integration config states
  const [slackWebhook, setSlackWebhook] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [customWebhook, setCustomWebhook] = useState('');
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [xConsumerKey, setXConsumerKey] = useState('');
  const [xConsumerSecret, setXConsumerSecret] = useState('');
  const [xAccessToken, setXAccessToken] = useState('');
  const [xAccessTokenSecret, setXAccessTokenSecret] = useState('');
  const [isSavingIntegrations, setIsSavingIntegrations] = useState(false);
  const [integrationSaveSuccess, setIntegrationSaveSuccess] = useState(false);

  // LinkedIn states
  const [linkedinAccessToken, setLinkedinAccessToken] = useState('');
  const [linkedinPersonId, setLinkedinPersonId] = useState('');
  const [isRetrievingPersonId, setIsRetrievingPersonId] = useState(false);
  const [linkedinPosts, setLinkedinPosts] = useState<any[]>([]);
  const [isFetchingFeed, setIsFetchingFeed] = useState(false);
  // Test connection states per platform
  const [testStatus, setTestStatus] = useState<{ [key: string]: 'testing' | 'ok' | 'fail' }>({});
  const [testMsg, setTestMsg] = useState<{ [key: string]: string }>({});

  const fetchLinkedInFeed = async (clientId: string) => {
    setIsFetchingFeed(true);
    try {
      const res = await fetch(`/api/linkedin-posts?clientId=${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setLinkedinPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching LinkedIn feed:', err);
    } finally {
      setIsFetchingFeed(false);
    }
  };

  const handleRetrievePersonId = async () => {
    if (!linkedinAccessToken) return;
    setIsRetrievingPersonId(true);
    try {
      const res = await fetch('/api/integrations-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'linkedin', token: linkedinAccessToken }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.profile) {
        setLinkedinPersonId(data.profile.id);
        alert(`Retrieved Profile: ${data.profile.name} (ID: ${data.profile.id})`);
      } else {
        alert(`Failed to retrieve profile: ${data.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsRetrievingPersonId(false);
    }
  };

  const fetchBrandMemory = async () => {
    if (!activeClient) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing?clientId=${activeClient.id}`);
      if (res.ok) {
        const data: BrandMemoryType = await res.json();
        setBrandMemory(data);

        // Sync brand profile states
        setIndustry(data.industry || 'Services');
        setTargetAudience(data.targetAudience || 'General Public');
        setToneOfVoice(data.toneOfVoice || 'Professional, direct, clear');
        setBannedWords(data.bannedWords || '');
        setGuidelines(data.guidelines || '');
        setColors(data.colors || '#4F46E5');
        setMarketingPlan(data.marketingPlan);

        // Sync integration states
        setSlackWebhook(data.slackWebhookUrl || '');
        setDiscordWebhook(data.discordWebhookUrl || '');
        setCustomWebhook(data.customWebhookUrl || '');
        setTelegramToken(data.telegramToken || '');
        setTelegramChatId(data.telegramChatId || '');
        setXConsumerKey(data.xConsumerKey || '');
        setXConsumerSecret(data.xConsumerSecret || '');
        setXAccessToken(data.xAccessToken || '');
        setXAccessTokenSecret(data.xAccessTokenSecret || '');
        setLinkedinAccessToken(data.linkedinAccessToken || '');
        setLinkedinPersonId(data.linkedinPersonId || '');
        fetchLinkedInFeed(activeClient.id);

        try {
          const parsedCalendar = JSON.parse(data.socialCalendar || '[]');
          setPosts(parsedCalendar);
        } catch {
          setPosts([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandMemory();
    setGeneratedResult('');
    setGeneratedImage(null);
    setImagePrompt('');
    setShowAddPost(false);
  }, [activeClient]);

  // Save Brand Profile Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;
    setIsSavingProfile(true);
    setProfileSuccess(false);

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
        }),
      });

      if (res.ok) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
        // Refresh local brand memory cache
        const data = await res.json();
        setBrandMemory(data.brandMemory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Compile Marketing Plan
  const handleGeneratePlan = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      const clientName = activeClient?.name || 'Client';
      const starterPlan = `# Marketing Plan: ${clientName}
      
## 1. Executive Summary & Brand Brief
**Business Focus**: ${industry || 'B2B/B2C Operations'}
**Target Audience Demographic**: ${targetAudience || 'General Retail & Corporate Users'}
**Brand Guidelines Core**: ${guidelines || 'Maintain customer trust and high quality standard.'}

## 2. Competitive Positioning
- Position ${clientName} as an innovative, customer-centric leader in the ${industry} market.
- Capitalize on the core tone: "${toneOfVoice}" to differentiate from generic competitors.
- Focus creatives heavily around customer testimonials and micro-details.

## 3. Recommended Multi-Channel Mix
- **Instagram / Facebook Reels**: Focus on behind-the-scenes aesthetics and employee spots (2 posts/week).
- **LinkedIn Articles**: Thought leadership articles highlighting efficiency metrics and growth strategies (1 post/week).
- **WhatsApp Channels**: Automated reminders and custom news briefs directly to subscribers.

## 4. Quarterly Milestones
- **Month 1**: Establish tone guidelines; publish core brand introductory reels.
- **Month 2**: Expand organic reach via localized target keyword SEO visibility campaigns.
- **Month 3**: Audit paid media CPA margins to refine customer acquisition flows.`;

      setMarketingPlan(starterPlan);
      setIsGeneratingPlan(false);
    }, 2000);
  };

  // Save Marketing Plan to DB
  const handleSavePlan = async () => {
    if (!activeClient || !marketingPlan) return;
    setIsSavingPlan(true);
    try {
      const res = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient.id,
          marketingPlan,
        }),
      });
      if (res.ok) {
        alert('Strategic Marketing Plan saved to database!');
        const data = await res.json();
        setBrandMemory(data.brandMemory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Copy Content Generation
  const handleGenerateContent = () => {
    if (!promptText.trim()) return;
    setIsGeneratingCopy(true);

    setTimeout(() => {
      let result = '';
      const clientName = activeClient?.name || 'Client';
      const tone = toneOfVoice;
      const banned = bannedWords ? ` (Banned expressions avoided: ${bannedWords})` : '';

      if (contentType === 'CAPTION') {
        result = `✨ **SOCIAL MEDIA CAPTION FOR ${clientName.toUpperCase()}**\n\n${promptText}\n\n💬 *Voice applied: ${tone}* ${banned}\n📖 *Directives applied: ${guidelines}*\n\n📍 Contact us today to learn more or visit the link in bio!\n\n#${clientName.replace(/\s+/g, '')} #SaaS #GrowthMindset`;
      } else if (contentType === 'AD_COPY') {
        result = `🎯 **PAID MEDIA COPY: ${clientName.toUpperCase()}**\n\n🔥 **Headline**: The smarter way to experience ${clientName}!\n\n${promptText}\n\n💡 **Key Benefits**:\n- Built for: ${targetAudience}\n- Aligned to core brand guidelines: "${guidelines}"\n\n👉 Learn more & book your trial slot today!`;
      } else {
        result = `✍️ **BLOG ARTICLE DRAFT OUTLINE: ${clientName.toUpperCase()}**\n\n**Title**: ${promptText}\n\n**Overview**: An organic exploration of industry developments tailored to ${targetAudience}.\n\n**Brand Context details**:\n- Tone Guidelines applied: ${tone}\n- Visual Theme colors: ${colors}\n\n**Content Layout**:\n1. Introduction: Market challenges facing clients.\n2. Strategic approaches: How ${clientName} provides premium quality.\n3. Summary & strategic calls-to-action.`;
      }

      setGeneratedResult(result);
      setIsGeneratingCopy(false);
    }, 1500);
  };

  // Mock Image Generation
  const handleGenerateImage = () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageProgressStep(0);
    setGeneratedImage(null);

    // Simulate progressive generation steps
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < stepsList.length) {
        setImageProgressStep(currentStep);
      } else {
        clearInterval(interval);
        
        // Select pre-set Unsplash links based on industry keywords
        const query = imagePrompt.toLowerCase();
        let selectedUrl = 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600&auto=format&fit=crop&q=80'; // collaborative agency
        
        if (query.includes('coffee') || query.includes('cafe') || query.includes('cup') || query.includes('espresso')) {
          selectedUrl = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80';
        } else if (query.includes('clinic') || query.includes('medical') || query.includes('dental') || query.includes('doctor') || query.includes('teeth')) {
          selectedUrl = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80';
        } else if (query.includes('gym') || query.includes('fitness') || query.includes('workout') || query.includes('studio') || query.includes('dumbell')) {
          selectedUrl = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';
        } else if (query.includes('dashboard') || query.includes('analytics') || query.includes('charts') || query.includes('code')) {
          selectedUrl = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';
        } else if (query.includes('fashion') || query.includes('clothing') || query.includes('shoes') || query.includes('apparel')) {
          selectedUrl = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80';
        }

        setGeneratedImage(selectedUrl);
        setIsGeneratingImage(false);
      }
    }, 800);
  };

  // Add new post to Scheduler
  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postCopy.trim()) return;

    const newPost: PostItem = {
      id: 'post_' + Date.now(),
      content: postCopy,
      date: postDate,
      time: postTime,
      channels: postChannels,
      status: 'SCHEDULED',
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    setPostCopy('');
    setShowAddPost(false);

    // Save to DB
    if (activeClient) {
      try {
        await fetch('/api/marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId: activeClient.id,
            socialCalendar: JSON.stringify(updatedPosts),
          }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Real Omnichannel Publish — calls /api/publish which hits real Slack/Discord APIs
  const handlePublishNow = async (post: PostItem) => {
    if (!activeClient || isPublishing) return;
    setPublishingPostId(post.id);
    setIsPublishing(true);
    setPublishLogs([]);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient.id,
          content: post.content,
          channels: post.channels,
        }),
      });

      const data = await res.json();
      if (res.ok && data.statusLogs) {
        setPublishLogs(data.statusLogs);
      }

      // Mark post as published
      const updated = posts.map(p =>
        p.id === post.id ? { ...p, status: 'PUBLISHED' as const } : p
      );
      setPosts(updated);

      // Persist updated calendar
      await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: activeClient.id, socialCalendar: JSON.stringify(updated) }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
      setPublishingPostId(null);
    }
  };

  // Save integration credentials to DB
  const handleSaveIntegrations = async () => {
    if (!activeClient) return;
    setIsSavingIntegrations(true);
    setIntegrationSaveSuccess(false);
    try {
      const res = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient.id,
          slackWebhookUrl: slackWebhook || null,
          discordWebhookUrl: discordWebhook || null,
          customWebhookUrl: customWebhook || null,
          telegramToken: telegramToken || null,
          telegramChatId: telegramChatId || null,
          xConsumerKey: xConsumerKey || null,
          xConsumerSecret: xConsumerSecret || null,
          xAccessToken: xAccessToken || null,
          xAccessTokenSecret: xAccessTokenSecret || null,
          linkedinAccessToken: linkedinAccessToken || null,
          linkedinPersonId: linkedinPersonId || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBrandMemory(data.brandMemory);
        setIntegrationSaveSuccess(true);
        fetchLinkedInFeed(activeClient.id);
        setTimeout(() => setIntegrationSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingIntegrations(false);
    }
  };

  // Test a specific integration
  const handleTestIntegration = async (platform: 'slack' | 'discord' | 'telegram' | 'x' | 'custom' | 'linkedin') => {
    setTestStatus(prev => ({ ...prev, [platform]: 'testing' }));
    setTestMsg(prev => ({ ...prev, [platform]: '' }));
    try {
      const payload: Record<string, string> = { platform };
      if (platform === 'slack') payload.webhookUrl = slackWebhook;
      if (platform === 'discord') payload.webhookUrl = discordWebhook;
      if (platform === 'custom') payload.webhookUrl = customWebhook;
      if (platform === 'telegram') { payload.token = telegramToken; payload.chatId = telegramChatId; }
      if (platform === 'linkedin') payload.token = linkedinAccessToken;
      if (platform === 'x') {
        payload.consumerKey = xConsumerKey;
        payload.consumerSecret = xConsumerSecret;
        payload.accessToken = xAccessToken;
        payload.accessTokenSecret = xAccessTokenSecret;
      }

      const res = await fetch('/api/integrations-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setTestStatus(prev => ({ ...prev, [platform]: data.success ? 'ok' : 'fail' }));
      setTestMsg(prev => ({ ...prev, [platform]: data.message }));
    } catch (err: any) {
      setTestStatus(prev => ({ ...prev, [platform]: 'fail' }));
      setTestMsg(prev => ({ ...prev, [platform]: err.message }));
    }
  };

  if (!activeClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const stepsList = [
    'Configuring creative dimensions...',
    'Applying theme color schemes...',
    'Injecting shadow details...',
    'Enhancing resolution...',
    'Polishing lighting render...'
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
            <Megaphone className="h-3.5 w-3.5 animate-pulse" /> Marketing Console
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-tight">Client Growth Hub — {activeClient.name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure client audience specifications, compile strategic guidelines, create visual drafts, and organize scheduling streams.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-1.5 bg-white/40 p-1.5 rounded-lg border border-slate-200">
        {[
          { id: 'profile', label: 'Brand Profile', icon: Building2 },
          { id: 'planner', label: 'Strategy Planner', icon: FileText },
          { id: 'creative', label: 'Creative Suite', icon: ImageIcon },
          { id: 'scheduler', label: 'Social Scheduler', icon: Calendar },
          { id: 'integrations', label: 'Integrations', icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="flex-1">
          {/* TAB 1: BRAND PROFILE MANAGER */}
          {activeTab === 'profile' && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Company Brand Identity Form</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Edit this client's profile parameters to automatically train the copywriting copilots.</p>
                </div>

                {profileSuccess && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-700 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Brand memory parameters successfully synchronized with SQLite database!</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Industry</label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g. Specialty Coffee Shop, Tech Consulting"
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hex Colors (Comma Separated)</label>
                      <input
                        type="text"
                        value={colors}
                        onChange={(e) => setColors(e.target.value)}
                        placeholder="e.g. #4F3824,#EEDC82"
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Audience Demographics</label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Weekend brunch seekers, corporate developers aged 25-40"
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Voice & Tone Matrix</label>
                      <input
                        type="text"
                        value={toneOfVoice}
                        onChange={(e) => setToneOfVoice(e.target.value)}
                        placeholder="e.g. Warm, inviting, community-focused"
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Banned Vocabulary</label>
                      <input
                        type="text"
                        value={bannedWords}
                        onChange={(e) => setBannedWords(e.target.value)}
                        placeholder="e.g. cheap, discount, generic"
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Core Brand Guidelines</label>
                    <textarea
                      value={guidelines}
                      onChange={(e) => setGuidelines(e.target.value)}
                      placeholder="Focus on fresh local ingredients, cozy workspace vibes, and specialty pour-over origins."
                      className="w-full text-xs rounded-lg border border-slate-200 p-3 outline-none focus:border-indigo-500 min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-2.5 shadow-sm transition-all"
                    >
                      {isSavingProfile ? 'Saving Settings...' : 'Save Profile Settings'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar View Memory details */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Memory Swatches</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Live database constraints computed for client.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4.5 w-4.5 text-indigo-600" />
                      <span className="font-bold text-slate-700">Industry:</span>
                      <span className="text-slate-600">{brandMemory?.industry || 'Unset'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4.5 w-4.5 text-indigo-600" />
                      <span className="font-bold text-slate-700">Audience:</span>
                      <span className="text-slate-600 truncate max-w-[160px]" title={brandMemory?.targetAudience}>{brandMemory?.targetAudience || 'Unset'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Palette Colors</span>
                    <div className="flex gap-2.5 pt-1">
                      {brandMemory?.colors.split(',').map((c) => (
                        <div key={c} className="flex flex-col items-center gap-1">
                          <div 
                            className="h-8 w-8 rounded-full border border-slate-300 shadow-sm"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRATEGY PLANNER */}
          {activeTab === 'planner' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Marketing Strategic Planner</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate an in-depth brand marketing strategy compiling targets, platforms, and quarterly milestones.
                  </p>
                </div>

                {marketingPlan && (
                  <button
                    onClick={handleSavePlan}
                    disabled={isSavingPlan}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 shadow-sm transition-all"
                  >
                    {isSavingPlan ? 'Saving Plan...' : 'Save Strategy Plan'}
                  </button>
                )}
              </div>

              {!marketingPlan ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
                  <Sparkles className="h-10 w-10 text-indigo-600 mx-auto animate-pulse" />
                  <div className="max-w-md mx-auto">
                    <h4 className="text-sm font-bold text-slate-700">No Strategic Plan Drafted</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Initialize an AI-directed strategic plan. The planner reads active industry constraints ("{industry}") and audience profiles ("{targetAudience}") to compile customized channel actions.
                    </p>
                  </div>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 transition-all shadow-md shadow-indigo-600/10"
                  >
                    {isGeneratingPlan ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Gathering competitors & tone matrices...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> Compile Strategic Marketing Plan
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {isGeneratingPlan ? (
                    <div className="flex h-40 items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin" />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-6 max-w-4xl border-l-4 border-l-indigo-600 shadow-xs">
                      <MarkdownRenderer content={marketingPlan} />
                    </div>
                  )}

                  <div className="flex gap-3 justify-end border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setMarketingPlan(null)}
                      className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs px-4 py-2"
                    >
                      Clear / Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI CREATIVE SUITE */}
          {activeTab === 'creative' && (
            <div className="grid gap-6 lg:grid-cols-5 items-start">
              {/* Copywriting Creative panel */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ad Copy & Blog Post draft Generator</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Use client guidelines to compile content blocks.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(['CAPTION', 'AD_COPY', 'BLOG'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setContentType(type)}
                      className={`rounded-lg border py-2.5 text-center text-xs font-bold transition-all ${
                        contentType === type
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'CAPTION' ? 'Social Caption' : type === 'AD_COPY' ? 'Ad copy' : 'Blog outline'}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Post Theme / Brief</label>
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Focus of the content..."
                    className="w-full text-xs rounded-lg border border-slate-200 p-3 outline-none focus:border-indigo-500 min-h-[80px]"
                  />
                </div>

                <button
                  onClick={handleGenerateContent}
                  disabled={isGeneratingCopy || !promptText.trim()}
                  className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {isGeneratingCopy ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Applying Brand Memory Guidelines...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Draft AI Content
                    </>
                  )}
                </button>

                {generatedResult && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-5 space-y-4 animate-fade-in">
                    <div className="rounded-lg bg-white border border-indigo-100 p-4 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {generatedResult}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedResult);
                          alert('Copied to clipboard!');
                        }}
                        className="rounded border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-1.5"
                      >
                        Copy text
                      </button>
                      <button
                        onClick={() => {
                          setPostCopy(generatedResult);
                          setActiveTab('scheduler');
                          setShowAddPost(true);
                        }}
                        className="rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-1.5"
                      >
                        Send to Calendar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mock Image Creative Panel */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">AI Mockup Image Creator</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Render high-fidelity photography concepts from creative briefs.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Describe Creative Visual</label>
                    <input
                      type="text"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="e.g. coffee mug with latte art on a cozy workspace table"
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Render Style Preset</label>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white outline-none focus:border-indigo-500"
                    >
                      <option value="MINIMALIST">Minimalist Clean</option>
                      <option value="VIBRANT">Vibrant Pop</option>
                      <option value="CINEMATIC">Cinematic Light</option>
                      <option value="ARTISTIC">Artistic / Sketch</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isGeneratingImage ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Rendering Creative...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-3.5 w-3.5" /> Generate Ad Creative
                      </>
                    )}
                  </button>

                  {/* Rendering Progress Checklist */}
                  {isGeneratingImage && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2 text-xs">
                      {stepsList.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 font-medium text-slate-500">
                          {imageProgressStep > idx ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          ) : imageProgressStep === idx ? (
                            <RefreshCw className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-slate-300 shrink-0" />
                          )}
                          <span className={imageProgressStep === idx ? 'text-indigo-600 font-bold' : ''}>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Generated Image Display */}
                  {generatedImage && !isGeneratingImage && (
                    <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-inner p-2 space-y-2">
                      <img 
                        src={generatedImage} 
                        alt="AI Generated Sandbox Creative" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] text-slate-400 font-mono">Render: {imageStyle}</span>
                        <a 
                          href={generatedImage} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-indigo-600 font-semibold hover:underline"
                        >
                          View Full HD URL
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OMNICHANNEL SOCIAL SCHEDULER */}
          {activeTab === 'scheduler' && (
            <div className="grid gap-6 md:grid-cols-3 items-start">
              {/* Content Calendar */}
              <div className="md:col-span-2">
                <CalendarView clientId={activeClient.id} isClientView={false} />
              </div>

              {/* Publish Results Panel */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Publish Results</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time delivery logs per channel.</p>
                </div>

                {isPublishing ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
                    <p className="text-xs font-semibold text-indigo-700">Publishing to channels...</p>
                  </div>
                ) : publishLogs.length > 0 ? (
                  <div className="space-y-2.5">
                    {publishLogs.map((log, i) => (
                      <div key={i} className={`rounded-xl border p-3.5 text-xs space-y-1 ${
                        log.status === 'SUCCESS' ? 'border-emerald-200 bg-emerald-50' :
                        log.status === 'FAILED' ? 'border-red-200 bg-red-50' :
                        'border-amber-200 bg-amber-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold capitalize text-slate-800">{log.channel}</span>
                          <span className={`font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                            log.status === 'SUCCESS' ? 'bg-emerald-600 text-white' :
                            log.status === 'FAILED' ? 'bg-red-600 text-white' :
                            'bg-amber-500 text-white'
                          }`}>
                            {log.status === 'SUCCESS' ? '✓ Delivered' : log.status === 'FAILED' ? '✗ Failed' : '~ Simulated'}
                          </span>
                        </div>
                        <p className="text-slate-500 leading-relaxed">{log.details}</p>
                      </div>
                    ))}
                    <button
                      onClick={() => setPublishLogs([])}
                      className="text-[10px] text-slate-400 hover:text-slate-600 w-full text-center pt-1 font-semibold"
                    >
                      Clear logs
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center space-y-2">
                    <Send className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">Click &quot;Publish Now&quot; on a scheduled post to see live delivery results here.</p>
                    <p className="text-[10px] text-slate-300">
                      Slack & Discord deliver in real-time if configured in <button className="text-indigo-500 underline" onClick={() => setActiveTab('integrations')}>Integrations</button>.
                    </p>
                  </div>
                )}

                {/* Quick channel status */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Connected Channels</p>
                  {[
                    { key: 'slack', label: 'Slack Workspace', configured: !!brandMemory?.slackWebhookUrl },
                    { key: 'discord', label: 'Discord Channel', configured: !!brandMemory?.discordWebhookUrl },
                    { key: 'custom', label: 'Custom Webhook (Make/Zapier)', configured: !!brandMemory?.customWebhookUrl },
                    { key: 'linkedin', label: 'LinkedIn Account', configured: !!brandMemory?.linkedinAccessToken },
                    { key: 'x', label: 'X (Twitter) Feed', configured: !!(brandMemory?.xConsumerKey && brandMemory?.xAccessToken) },
                    { key: 'telegram', label: 'Telegram Bot', configured: !!(brandMemory?.telegramToken && brandMemory?.telegramChatId) },
                  ].map(({ key, label, configured }) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        configured ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {configured ? '● Live' : '○ Not set'}
                      </span>
                    </div>
                  ))}
                  <button
                    onClick={() => setActiveTab('integrations')}
                    className="text-[10px] text-indigo-600 hover:underline font-semibold w-full text-left pt-1"
                  >
                    Configure integrations →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Omnichannel Integrations</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Connect real publishing channels. Posts sent from the Social Scheduler will be delivered live to these channels via their APIs.
                      Slack & Discord use <strong>Incoming Webhooks</strong> — no OAuth or phone number required.
                    </p>
                  </div>
                </div>
              </div>

              {integrationSaveSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Integrations saved!</p>
                    <p className="text-xs text-emerald-600">Now select these channels when scheduling posts.</p>
                  </div>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-3">

                {/* ── LINKEDIN ───────────────────────────────────────────── */}
                <div className="rounded-2xl border-2 border-[#0077B5]/25 bg-gradient-to-br from-[#0077B5]/5 to-slate-50 p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#0077B5] flex items-center justify-center shadow-md shadow-[#0077B5]/20">
                      <LinkedinIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">LinkedIn</h4>
                      <p className="text-[10px] text-slate-400">Direct Publishing & Feed API</p>
                    </div>
                    {brandMemory?.linkedinAccessToken && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">● Configured</span>
                    )}
                  </div>

                  <div className="rounded-xl bg-white/80 border border-slate-100 p-3.5 space-y-1.5 text-[11px] text-slate-600">
                    <p className="font-bold text-slate-700 text-xs">How to get your LinkedIn Token (Free):</p>
                    <ol className="list-decimal ml-4 space-y-1 leading-relaxed">
                      <li>Go to <strong>developer.linkedin.com</strong> → Create App.</li>
                      <li>In <strong>Products</strong>, request <strong>Share on LinkedIn</strong> and <strong>Sign In with LinkedIn</strong>.</li>
                      <li>Generate a <strong>User Access Token</strong> using the Developer Token Generator tool.</li>
                      <li>Paste the token below, click <strong>Fetch Profile ID</strong>, and save!</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Access Token</label>
                      <input
                        type="password"
                        value={linkedinAccessToken}
                        onChange={e => setLinkedinAccessToken(e.target.value)}
                        placeholder="AQVxxxxx..."
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-[#0077B5] font-mono bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Person URN ID</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={linkedinPersonId}
                          onChange={e => setLinkedinPersonId(e.target.value)}
                          placeholder="e.g. URN string"
                          className="flex-1 text-xs rounded-lg border border-slate-200 p-2.5 outline-none font-mono bg-slate-50/50"
                        />
                        <button
                          type="button"
                          onClick={handleRetrievePersonId}
                          disabled={!linkedinAccessToken || isRetrievingPersonId}
                          className="px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold transition-all disabled:opacity-40 whitespace-nowrap cursor-pointer"
                        >
                          {isRetrievingPersonId ? 'Fetching...' : 'Fetch Profile ID'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTestIntegration('linkedin')}
                      disabled={!linkedinAccessToken || testStatus.linkedin === 'testing'}
                      className="rounded-lg border border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5] hover:text-white font-semibold text-xs py-2 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {testStatus.linkedin === 'testing' ? 'Testing...' : 'Test Token'}
                    </button>

                    <button
                      type="button"
                      onClick={() => fetchLinkedInFeed(activeClient.id)}
                      disabled={isFetchingFeed}
                      className="rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs py-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isFetchingFeed ? 'Refreshing...' : 'Refresh Feed'}
                    </button>
                  </div>

                  {testStatus.linkedin && testStatus.linkedin !== 'testing' && (
                    <div className={`rounded-lg p-2.5 text-[11px] font-medium ${
                      testStatus.linkedin === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {testStatus.linkedin === 'ok' ? '✅' : '❌'} {testMsg.linkedin}
                    </div>
                  )}

                  {/* LinkedIn Posts Feed Display */}
                  <div className="border-t border-slate-200 pt-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recent LinkedIn Feed (Read API)</span>
                    {linkedinPosts.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">No posts fetched yet. Save credentials and click Refresh Feed.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {linkedinPosts.map((post: any, i: number) => (
                          <div key={i} className="pt-2 text-[10px] space-y-1">
                            <p className="text-slate-700 font-medium leading-relaxed">{post.content}</p>
                            <span className="text-[8px] text-slate-400 block font-semibold">{new Date(post.createdAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── CUSTOM WEBHOOK (Make.com / Zapier / n8n) ─────────── */}
                <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Custom Webhook</h4>
                      <p className="text-[10px] text-indigo-600 font-semibold">Make.com · Zapier · n8n · Any URL</p>
                    </div>
                    {brandMemory?.customWebhookUrl && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">● Live</span>
                    )}
                  </div>

                  <div className="rounded-xl bg-white/80 border border-indigo-100 p-3.5 space-y-2 text-[11px] text-slate-600">
                    <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <span className="text-indigo-600">★</span> How to connect Facebook Pages via Make.com (FREE):
                    </p>
                    <ol className="list-decimal ml-4 space-y-1.5 leading-relaxed">
                      <li>Go to <strong>make.com</strong> and sign up for a free account (1,000 free operations/month).</li>
                      <li>Create a <strong>New Scenario</strong> → Add a <strong>Webhooks</strong> module → Select <strong>"Custom webhook"</strong>.</li>
                      <li>Click <strong>Add</strong> to generate a unique webhook URL, then copy it.</li>
                      <li>Add a second module: <strong>Facebook Pages</strong> → Select <strong>"Create a Post"</strong>.</li>
                      <li>Connect your Facebook account, select your Page, and map the <code className="bg-slate-100 px-1 rounded">content</code> field to the <strong>Message</strong> field.</li>
                      <li>Set the scenario status to <strong>ON</strong> (Active). Paste the webhook URL below and click save.</li>
                    </ol>
                    <p className="text-indigo-700 font-semibold text-[10px] pt-1">💡 Pro-Tip: You can use the same webhook to route posts to Instagram, LinkedIn, or any other app!</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Webhook URL</label>
                    <input
                      type="url"
                      value={customWebhook}
                      onChange={e => setCustomWebhook(e.target.value)}
                      placeholder="https://hook.eu1.make.com/... or https://hooks.zapier.com/..."
                      className="w-full text-[11px] rounded-lg border border-indigo-200 p-2.5 outline-none focus:border-indigo-500 font-mono bg-white"
                    />
                  </div>

                  <button
                    onClick={() => handleTestIntegration('custom')}
                    disabled={!customWebhook || testStatus.custom === 'testing'}
                    className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                  >
                    {testStatus.custom === 'testing' ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Triggering...</> : '⚡ Test Webhook'}
                  </button>

                  {testStatus.custom && testStatus.custom !== 'testing' && (
                    <div className={`rounded-lg p-2.5 text-[11px] font-medium ${
                      testStatus.custom === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {testStatus.custom === 'ok' ? '✅' : '❌'} {testMsg.custom}
                    </div>
                  )}
                </div>

                {/* ── SLACK ─────────────────────────────────────────────── */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#4A154B] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Slack</h4>
                      <p className="text-[10px] text-slate-400">Incoming Webhook</p>
                    </div>
                    {brandMemory?.slackWebhookUrl && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">● Configured</span>
                    )}
                  </div>

                  {/* How to get */}
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-1.5 text-[11px] text-slate-600">
                    <p className="font-bold text-slate-700 text-xs">How to get your Webhook URL:</p>
                    <ol className="list-decimal ml-4 space-y-1 leading-relaxed">
                      <li>Go to <strong>api.slack.com/apps</strong> → Create New App → From Scratch</li>
                      <li>Choose workspace → Enable <strong>Incoming Webhooks</strong></li>
                      <li>Click <strong>Add New Webhook to Workspace</strong> → pick a channel</li>
                      <li>Copy the webhook URL starting with <code className="bg-slate-200 px-1 rounded">https://hooks.slack.com/</code></li>
                    </ol>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Webhook URL</label>
                    <input
                      type="url"
                      value={slackWebhook}
                      onChange={e => setSlackWebhook(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleTestIntegration('slack')}
                    disabled={!slackWebhook || testStatus.slack === 'testing'}
                    className="w-full rounded-lg border border-[#4A154B] text-[#4A154B] hover:bg-[#4A154B] hover:text-white font-semibold text-xs py-2.5 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {testStatus.slack === 'testing' ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Testing...</> : 'Send Test Message'}
                  </button>

                  {testStatus.slack && testStatus.slack !== 'testing' && (
                    <div className={`rounded-lg p-2.5 text-[11px] font-medium ${
                      testStatus.slack === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {testStatus.slack === 'ok' ? '✅' : '❌'} {testMsg.slack}
                    </div>
                  )}
                </div>

                {/* ── DISCORD ───────────────────────────────────────────── */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#5865F2] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Discord</h4>
                      <p className="text-[10px] text-slate-400">Channel Webhook</p>
                    </div>
                    {brandMemory?.discordWebhookUrl && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">● Configured</span>
                    )}
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-1.5 text-[11px] text-slate-600">
                    <p className="font-bold text-slate-700 text-xs">How to get your Webhook URL:</p>
                    <ol className="list-decimal ml-4 space-y-1 leading-relaxed">
                      <li>Open Discord → Right-click a channel → <strong>Edit Channel</strong></li>
                      <li>Go to <strong>Integrations → Webhooks → New Webhook</strong></li>
                      <li>Name it AgencyOS → click <strong>Copy Webhook URL</strong></li>
                      <li>URL starts with <code className="bg-slate-200 px-1 rounded">https://discord.com/api/webhooks/</code></li>
                    </ol>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Webhook URL</label>
                    <input
                      type="url"
                      value={discordWebhook}
                      onChange={e => setDiscordWebhook(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <button
                    onClick={() => handleTestIntegration('discord')}
                    disabled={!discordWebhook || testStatus.discord === 'testing'}
                    className="w-full rounded-lg border border-[#5865F2] text-[#5865F2] hover:bg-[#5865F2] hover:text-white font-semibold text-xs py-2.5 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {testStatus.discord === 'testing' ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Testing...</> : 'Send Test Message'}
                  </button>

                  {testStatus.discord && testStatus.discord !== 'testing' && (
                    <div className={`rounded-lg p-2.5 text-[11px] font-medium ${
                      testStatus.discord === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {testStatus.discord === 'ok' ? '✅' : '❌'} {testMsg.discord}
                    </div>
                  )}
                </div>

                {/* ── TELEGRAM (future) ──────────────────────────────────── */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#229ED9] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Telegram</h4>
                      <p className="text-[10px] text-slate-400">Bot API</p>
                    </div>
                    {brandMemory?.telegramToken && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">● Configured</span>
                    )}
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-700">
                    <p className="font-bold">⚠️ Currently unavailable in India</p>
                    <p className="mt-1 leading-relaxed">BotFather is not accessible in India at the moment. Fields are saved for when access is restored. Use Slack or Discord in the meantime.</p>
                  </div>

                  <div className="space-y-3 opacity-60 pointer-events-none">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bot Token</label>
                      <input
                        type="text"
                        value={telegramToken}
                        onChange={e => setTelegramToken(e.target.value)}
                        placeholder="7890123456:AAHxxx..."
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none font-mono"
                        disabled
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Chat / Channel ID</label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={e => setTelegramChatId(e.target.value)}
                        placeholder="@mychannel or -100..."
                        className="w-full text-xs rounded-lg border border-slate-200 p-2.5 outline-none font-mono"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* ── X / TWITTER ───────────────────────────────────────── */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
                      <TwitterIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">X (Twitter)</h4>
                      <p className="text-[10px] text-slate-400">Direct Publishing API</p>
                    </div>
                    {brandMemory?.xConsumerKey && brandMemory?.xAccessToken && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">● Configured</span>
                    )}
                  </div>

                  {/* How to get */}
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-1.5 text-[11px] text-slate-600">
                    <p className="font-bold text-slate-700 text-xs">How to get your X API keys (Free):</p>
                    <ol className="list-decimal ml-4 space-y-1 leading-relaxed">
                      <li>Go to <strong>developer.x.com</strong> and register for a Free Account.</li>
                      <li>In your app settings, edit <strong>User Authentication</strong>: set Permissions to <strong>Read and Write</strong>.</li>
                      <li>Generate <strong>API Key & Secret</strong> (under Consumer Keys).</li>
                      <li>Generate <strong>Access Token & Secret</strong> (under Authentication Tokens).</li>
                    </ol>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">API Key (Consumer Key)</label>
                      <input
                        type="text"
                        value={xConsumerKey}
                        onChange={e => setXConsumerKey(e.target.value)}
                        placeholder="Consumer Key..."
                        className="w-full text-[11px] rounded-lg border border-slate-200 p-2 outline-none font-mono focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">API Secret (Consumer Secret)</label>
                      <input
                        type="text"
                        value={xConsumerSecret}
                        onChange={e => setXConsumerSecret(e.target.value)}
                        placeholder="Consumer Secret..."
                        className="w-full text-[11px] rounded-lg border border-slate-200 p-2 outline-none font-mono focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Access Token</label>
                      <input
                        type="text"
                        value={xAccessToken}
                        onChange={e => setXAccessToken(e.target.value)}
                        placeholder="Access Token..."
                        className="w-full text-[11px] rounded-lg border border-slate-200 p-2 outline-none font-mono focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Access Token Secret</label>
                      <input
                        type="text"
                        value={xAccessTokenSecret}
                        onChange={e => setXAccessTokenSecret(e.target.value)}
                        placeholder="Access Secret..."
                        className="w-full text-[11px] rounded-lg border border-slate-200 p-2 outline-none font-mono focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleTestIntegration('x')}
                    disabled={!xConsumerKey || !xConsumerSecret || !xAccessToken || !xAccessTokenSecret || testStatus.x === 'testing'}
                    className="w-full rounded-lg border border-black text-black hover:bg-black hover:text-white font-semibold text-xs py-2.5 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {testStatus.x === 'testing' ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Posting...</> : 'Send Test Tweet'}
                  </button>

                  {testStatus.x && testStatus.x !== 'testing' && (
                    <div className={`rounded-lg p-2.5 text-[11px] font-medium ${
                      testStatus.x === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {testStatus.x === 'ok' ? '✅' : '❌'} {testMsg.x}
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-between items-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">After saving, go to the Social Scheduler tab</p>
                  <p>Select &quot;slack&quot; or &quot;discord&quot; as channels when creating a post, then click Publish Now.</p>
                </div>
                <button
                  onClick={handleSaveIntegrations}
                  disabled={isSavingIntegrations}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-8 py-3 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 shrink-0 flex items-center gap-2"
                >
                  {isSavingIntegrations ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving...</> : <><CheckCircle2 className="h-4 w-4" />Save All Integrations</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
