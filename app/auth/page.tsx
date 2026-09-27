'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  CheckCircle2, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

function AuthPageInner() {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Email + Password (Sign In or Sign Up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }

    if (tab === 'signup' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: tab,
          email: email.trim(),
          password: password.trim(),
          fullName: fullName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      if (tab === 'signup') {
        if (data.needsEmailConfirm) {
          setSuccessMsg(data.message || 'Confirmation email sent! Please check your inbox to confirm.');
          setLoading(false);
          return;
        }
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/onboarding');
        }, 1000);
      } else {
        setSuccessMsg('Signed in successfully! Opening dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication service error';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md fin-canvas p-8 shadow-2xl rounded-3xl border border-[var(--border-subtle)]">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-yellow-badge-bg)] border border-[var(--accent-yellow-badge-border)] text-[var(--accent-yellow)] mb-3 shadow-sm">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              {tab === 'signin' ? 'Welcome to SuchakAI' : 'Create an Account'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {tab === 'signin' 
                ? 'Sign in to access your saved schemes and citizen profile' 
                : 'Register to discover government benefits tailored to you'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-2xl bg-[var(--card-subtle)] p-1 border border-[var(--border-subtle)] mb-6">
            <button
              type="button"
              onClick={() => { setTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                tab === 'signin'
                  ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                tab === 'signup'
                  ? 'bg-[var(--card-bg)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 rounded-2xl bg-red-500/10 p-3.5 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-500 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-5 rounded-2xl bg-green-500/10 p-3.5 border border-green-500/30 flex items-start gap-2.5 text-xs text-green-500 animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-yellow)] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-yellow)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-yellow)] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-yellow)] text-zinc-950 py-3 px-4 text-xs font-extrabold hover:bg-amber-400 active:scale-[0.99] transition-all duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{tab === 'signin' ? 'Sign In to SuchakAI' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">OR</span>
            <div className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          {/* Instant Guest Access Button */}
          <Link
            href="/onboarding"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] py-3 px-4 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--card-subtle)] hover:border-[var(--accent-yellow)] active:scale-[0.99] transition-all shadow-sm"
          >
            <UserCheck className="w-4 h-4 text-[var(--accent-yellow)]" />
            <span>Continue as Guest (No account needed)</span>
          </Link>

          {/* Security Guarantee */}
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span>Secured with PostgreSQL Row Level Security (RLS)</span>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}
