'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Info
} from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      setErrorMsg('Google sign-in failed. Please try again or use email sign-in.');
    }
  }, [searchParams]);

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
      setErrorMsg('Please provide your name.');
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
        }, 1200);
      } else {
        setSuccessMsg('Signed in successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication service error';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://suchak-ai.vercel.app';
      const redirectOrigin =
        typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? window.location.origin
          : siteUrl.replace(/\/+$/, '');
      const redirectTo = `${redirectOrigin}/api/auth/callback`;

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication service error';
      setErrorMsg(msg);
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
              {tab === 'signin' ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {tab === 'signin' 
                ? 'Sign in to access your saved schemes and citizen profile' 
                : 'Join SuchakAI to discover benefits tailored to your eligibility'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-2xl bg-[var(--card-subtle)] p-1 border border-[var(--border-subtle)] mb-6">
            <button
              type="button"
              onClick={() => { setTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
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
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
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

          {/* If Supabase is not yet configured with real keys */}
          {!isConfigured && (
            <div className="mb-5 rounded-2xl bg-amber-500/10 p-3 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-500">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Connect your Supabase project in <code className="font-mono font-bold bg-amber-500/20 px-1 py-0.5 rounded">.env.local</code> (URL & Anon Key) to enable cloud authentication across devices.
              </p>
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

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            id="google-signin-btn"
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] py-2.5 px-4 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--card-subtle)] hover:shadow-sm active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Guest Mode */}
          <div className="mt-5 text-center">
            <Link
              href="/onboarding"
              className="text-xs font-semibold text-[var(--accent-yellow)] hover:underline inline-flex items-center gap-1 transition-colors"
            >
              Continue as Guest (No login required) →
            </Link>
          </div>

          {/* Security Guarantee */}
          <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
            <span>Encrypted with Row Level Security (RLS)</span>
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
