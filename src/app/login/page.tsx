'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Bot, Sparkles, Key, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { users, setActiveUser } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [botName, setBotName] = useState('Copilot');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      const savedEmail = localStorage.getItem('loggedInUserEmail') || '';
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === savedEmail.toLowerCase().trim()
      );
      if (foundUser) {
        if (foundUser.role === 'CLIENT') {
          router.push('/client');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [router, users]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user from database users loaded in AppContext
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (foundUser && password === 'password') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUserEmail', foundUser.email);
        setActiveUser(foundUser);
        if (foundUser.role === 'CLIENT') {
          router.push('/client');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Invalid credentials. Hint: password is "password"');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSignupSuccess(false);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/context-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, botName }),
      });

      const data = await res.json();
      if (res.ok) {
        setSignupSuccess(true);
        // Refresh context data
        const reloadRes = await fetch('/api/context-data');
        if (reloadRes.ok) {
          window.location.reload();
        }
        setIsSignup(false);
        setPassword('');
      } else {
        setError(data.error || 'Failed to sign up.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error, failed to reach authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: 'OWNER' | 'MANAGER' | 'CLIENT') => {
    setError('');
    setIsLoading(true);

    const targetEmail = 
      role === 'OWNER' ? 'aarav@agencyos.ai' : 
      role === 'MANAGER' ? 'priya@agencyos.ai' : 'client@bloomcafe.com';
    setEmail(targetEmail);
    setPassword('password');

    setTimeout(() => {
      const foundUser = users.find((u) => u.email === targetEmail);
      if (foundUser) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUserEmail', foundUser.email);
        setActiveUser(foundUser);
        if (foundUser.role === 'CLIENT') {
          router.push('/client');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Database user not loaded yet. Please wait a second and try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-6 relative font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-violet-600/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-2xl shadow-xl shadow-indigo-600/20">
              ⬡
            </div>
            <span className="font-extrabold text-white tracking-wide text-2xl">AgencyOS</span>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-bold text-indigo-400 border border-indigo-500/30">AI</span>
          </Link>
          <p className="text-xs text-slate-400 mt-2">Scale your agency metrics in real-time</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 shadow-2xl backdrop-blur-md">
          {signupSuccess && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-450 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Registration successful! You can now sign in.</span>
            </div>
          )}

          <div className="flex border-b border-slate-800 mb-6 gap-4">
            <button 
              type="button" 
              onClick={() => { setIsSignup(false); setError(''); }}
              className={`pb-2 text-sm font-bold transition-all cursor-pointer ${!isSignup ? 'text-white border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Sign In
            </button>
            <button 
              type="button" 
              onClick={() => { setIsSignup(true); setError(''); }}
              className={`pb-2 text-sm font-bold transition-all cursor-pointer ${isSignup ? 'text-white border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 flex items-center gap-2 animate-pulse">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-450" />
              <span>{error}</span>
            </div>
          )}

          {isSignup ? (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-xs text-white placeholder:text-slate-600 outline-none transition-all focus:border-indigo-600"
                  required
                />
              </div>

              {/* Email input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agencyos.ai"
                  className="w-full rounded-lg border border-slate-800 bg-slate-955/50 py-2.5 px-4 text-xs text-white placeholder:text-slate-600 outline-none transition-all focus:border-indigo-600"
                  required
                />
              </div>

              {/* Password input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-800 bg-slate-955/50 py-2.5 px-4 text-xs text-white placeholder:text-slate-600 outline-none transition-all focus:border-indigo-600"
                  required
                />
              </div>

              {/* AI Bot Name input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Custom AI Bot's Name</label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="e.g. MyAssistant, BloomBot, AaraBot"
                  className="w-full rounded-lg border border-slate-800 bg-slate-955/50 py-2.5 px-4 text-xs text-white placeholder:text-slate-600 outline-none transition-all focus:border-indigo-600"
                  required
                />
              </div>

              {/* Role select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-xs text-white outline-none transition-all focus:border-indigo-600"
                >
                  <option value="OWNER">OWNER (Full Agency Access)</option>
                  <option value="MANAGER">MANAGER (Strategic Lead)</option>
                  <option value="MEMBER">MEMBER (Agency Executive)</option>
                  <option value="CLIENT">CLIENT (Guest/Viewer Account)</option>
                </select>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Register Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@agencyos.ai"
                    className="w-full rounded-lg border border-slate-800 bg-slate-955/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none transition-all focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                  <span className="text-[10px] text-slate-500 hover:text-indigo-400 cursor-pointer">Forgot?</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-800 bg-slate-955/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none transition-all focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Access sandbox accounts */}
          <div className="mt-8 border-t border-slate-800/80 pt-6 space-y-3">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              Quick Sandbox Testing Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('OWNER')}
                disabled={isLoading}
                className="rounded-lg border border-slate-800/60 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 py-2.5 px-2 text-left transition-all disabled:opacity-50"
              >
                <p className="text-[10px] font-bold text-white leading-none">Aarav Patel</p>
                <p className="text-[7px] text-indigo-400 mt-1 uppercase font-semibold">Owner</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('MANAGER')}
                disabled={isLoading}
                className="rounded-lg border border-slate-800/60 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 py-2.5 px-2 text-left transition-all disabled:opacity-50"
              >
                <p className="text-[10px] font-bold text-white leading-none">Priya Sharma</p>
                <p className="text-[7px] text-emerald-400 mt-1 uppercase font-semibold">Manager</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('CLIENT')}
                disabled={isLoading}
                className="rounded-lg border border-slate-850 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 py-2.5 px-2 text-left transition-all disabled:opacity-50 border-indigo-900/40"
              >
                <p className="text-[10px] font-bold text-white leading-none">Bloom Client</p>
                <p className="text-[7px] text-pink-400 mt-1 uppercase font-semibold font-sans">Client Role</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
