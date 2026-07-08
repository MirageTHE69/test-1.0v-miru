'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  RefreshCw,
  Clock,
  User,
} from 'lucide-react';

interface ClientType {
  id: string;
  name: string;
}

interface MessageType {
  id: string;
  content: string;
  sender: string; // CLIENT, AGENCY_USER, AI
  senderName: string;
  isAI: boolean;
  createdAt: string;
}

interface ConversationType {
  id: string;
  channel: string; // WHATSAPP, EMAIL, CHAT
  client: ClientType;
  messages: MessageType[];
}

export default function InboxPage() {
  const { activeUser } = useApp();
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [inputText, setInputText] = useState('');

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/inbox');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        // Default select first conversation if none selected
        if (data.length > 0 && !selectedConv) {
          setSelectedConv(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (convId: string) => {
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/inbox?conversationId=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
    }
  }, [selectedConv]);

  const handleSendMessage = async (text: string, isFromAi = false) => {
    if (!selectedConv || !text.trim()) return;

    try {
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          content: text,
          sender: 'AGENCY_USER',
          senderName: activeUser?.name || 'Priya Sharma',
          isAI: isFromAi,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setInputText('');
        fetchConversations(); // Reload sidebar list for latest snippets
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Suggested AI reply mock
  const aiSuggestedReply = selectedConv?.client.name.includes('Bloom')
    ? 'Done! Moved to Saturday 10 AM — you\'ll see it reflected in your content calendar.'
    : 'Yes, we are on track. The open items should be completed by tomorrow evening. I will keep you posted.';

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-[80vh] flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-tight">Communication Hub</h1>
        <p className="text-sm text-slate-500 mt-1">
          Unified agency inbox mapping WhatsApp Business, client chat, and email logs into single thread workflows.
        </p>
      </div>

      {/* Main Inbox Pane split */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex">
        {/* Left Side Pane: Conversations List */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <input
              type="text"
              placeholder="Search inbox..."
              className="w-full text-xs rounded-lg border border-slate-200 p-2 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingList ? (
              <div className="flex h-40 items-center justify-center">
                <RefreshCw className="h-5 w-5 text-indigo-600 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">No active threads</div>
            ) : (
              conversations.map((conv) => {
                const latestMsg = conv.messages[0];
                const channelBadge = {
                  WHATSAPP: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  EMAIL: 'bg-blue-50 text-blue-700 border-blue-100',
                  CHAT: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                }[conv.channel as 'WHATSAPP' | 'EMAIL' | 'CHAT'];

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedConv?.id === conv.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-800">{conv.client.name}</h4>
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded capitalize ${channelBadge}`}>
                        {conv.channel === 'WHATSAPP' ? 'WA' : conv.channel.toLowerCase()}
                      </span>
                    </div>
                    {latestMsg && (
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {latestMsg.sender === 'AI' ? '✨ ' : ''}
                        {latestMsg.content}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side Pane: Chat Message Thread */}
        <div className="flex-1 flex flex-col justify-between bg-slate-50/20">
          {selectedConv ? (
            <>
              {/* Thread Header */}
              <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">{selectedConv.client.name} Chat</h3>
                  <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">
                    Channel: {selectedConv.channel}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Updated just now
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingThread ? (
                  <div className="flex h-full items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-indigo-600 animate-spin" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isClient = msg.sender === 'CLIENT';
                    const isAi = msg.sender === 'AI';

                    let bubbleClass = 'bg-white border border-slate-200 text-slate-800 mr-auto rounded-tl-none';
                    if (isClient) {
                      bubbleClass = 'bg-white border border-slate-200 text-slate-800 mr-auto rounded-tl-none';
                    } else if (isAi) {
                      bubbleClass = 'bg-amber-50/40 border border-amber-100 text-slate-700 mr-auto rounded-tl-none';
                    } else {
                      bubbleClass = 'bg-indigo-600 text-white self-end ml-auto rounded-tr-none';
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[70%] rounded-xl p-3 text-xs ${bubbleClass}`}
                      >
                        <div className="flex justify-between items-center gap-4 mb-1">
                          <span className="font-bold text-[9px] uppercase tracking-wider opacity-75">
                            {msg.senderName}
                          </span>
                          {isAi && (
                            <span className="flex items-center gap-0.5 text-[8px] font-bold text-amber-700 bg-amber-100/60 px-1 rounded">
                              <Sparkles className="h-2 w-2" /> AI Suggested
                            </span>
                          )}
                        </div>
                        <p className="leading-relaxed font-sans">{msg.content}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Suggested AI Banner */}
              {messages.length > 0 && messages[messages.length - 1].sender === 'CLIENT' && (
                <div className="mx-6 mb-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-white p-4 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-600 animate-pulse shrink-0" />
                    <div>
                      <p className="text-[10px] text-indigo-900 font-bold uppercase tracking-wider">AI suggested reply</p>
                      <p className="text-xs text-indigo-950 font-medium mt-0.5">"{aiSuggestedReply}"</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInputText(aiSuggestedReply)}
                    className="rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-1.5 transition-colors shrink-0"
                  >
                    Apply suggested reply
                  </button>
                </div>
              )}

              {/* Message Composer */}
              <div className="bg-white border-t border-slate-200 p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type client message or apply AI suggestions..."
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-xs outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    <span>Send message</span> <Send className="h-3 w-3" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select a conversation thread to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
