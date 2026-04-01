"use client";

import React, { useState, useEffect } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import app from '@/lib/firebase';
import { Loader2, Mail, Lock, User as UserIcon, Eye, EyeOff, LogOut, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ── Auth Context Hook ──────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}

// ── Login Page Component ───────────────────────────────────────────────────────
export function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    clearError();
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo / branding */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🌙</div>
        <h1 className="text-3xl font-headline font-bold text-primary">ILMNOOR</h1>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Islamic Companion</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-card border border-primary/20 rounded-2xl p-6 shadow-xl">
        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-primary/5 border border-primary/10 mb-5">
          <button
            onClick={() => { setMode('login'); clearError(); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'login' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('signup'); clearError(); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'signup' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-sm font-semibold text-foreground transition-all mb-4 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="pl-10 bg-background text-sm"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="pl-10 bg-background text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="pl-10 pr-10 bg-background text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full font-semibold"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : mode === 'login' ? 'Login' : 'Create Account'
            }
          </Button>
        </form>

        {/* Guest option */}
        <button
          onClick={handleGuest}
          className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Continue as Guest →
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground mt-4 text-center">
        Your data is saved securely with Firebase 🔒
      </p>
    </div>
  );
}

// ── User Avatar / Logout button (show in app header) ──────────────────────────
export function UserBadge({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1.5 hover:bg-primary/20 transition-all"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="h-5 w-5 rounded-full object-cover" />
        ) : (
          <div className="h-5 w-5 rounded-full bg-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className="text-xs font-medium text-foreground max-w-[80px] truncate">
          {user.displayName || user.email?.split('@')[0] || 'User'}
        </span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-card border border-primary/20 rounded-xl shadow-lg p-2 min-w-[160px] z-50">
          <p className="text-xs text-muted-foreground px-2 py-1 truncate">{user.email}</p>
          <hr className="border-primary/10 my-1" />
          <button
            onClick={async () => { await signOut(auth); onLogout(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-all"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Friendly error messages ────────────────────────────────────────────────────
function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found':      'No account found with this email.',
    'auth/wrong-password':      'Incorrect password. Please try again.',
    'auth/email-already-in-use':'This email is already registered. Try logging in.',
    'auth/invalid-email':       'Please enter a valid email address.',
    'auth/weak-password':       'Password must be at least 6 characters.',
    'auth/too-many-requests':   'Too many attempts. Please wait a moment.',
    'auth/popup-closed-by-user':'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
