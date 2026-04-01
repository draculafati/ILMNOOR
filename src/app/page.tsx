"use client";

import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { ReciteQuran } from '@/components/ReciteQuran';
import { QuranLearning } from '@/components/QuranLearning';
import { DuaNotepad } from '@/components/DuaNotepad';
import { PrayerTimes } from '@/components/PrayerTimes';
import HadithCollection from '@/components/HadithCollection';
import { Settings } from '@/components/Settings';
import { Navigation, NavItem } from '@/components/Navigation';
import { NooraniQaida } from '@/components/NooraniQaida';
import { IslamicAudio } from '@/components/IslamicAudio';
import { LoginPage, UserBadge, useAuth } from '@/components/LoginPage';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavItem>('home');
  const [showLogin, setShowLogin] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem('ilmnoor_theme');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const toggleNightMode = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('ilmnoor_theme', isDark ? 'dark' : 'light');
  };

  // Show loading spinner while Firebase checks auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl">🌙</div>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Loading ILMNOOR…</p>
        </div>
      </div>
    );
  }

  // Show login page if triggered
  if (showLogin) {
    return <LoginPage onSuccess={() => setShowLogin(false)} />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'home':     return <Dashboard onNavigate={(s) => setActiveSection(s as NavItem)} />;
      case 'quran':    return <ReciteQuran />;
      case 'learning': return <QuranLearning />;
      case 'duas':     return <DuaNotepad />;
      case 'prayer':   return <PrayerTimes />;
      case 'hadith':   return <HadithCollection />;
      case 'audio':    return <IslamicAudio />;
      case 'settings': return <Settings />;
      case 'qaida':    return <NooraniQaida />;
      default:         return <Dashboard onNavigate={(s) => setActiveSection(s as NavItem)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 transition-colors duration-300">
      {/* Top bar */}
      <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
        {/* User badge or Login button */}
        {user ? (
          <UserBadge user={user} onLogout={() => {}} />
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-primary/20 backdrop-blur-md transition-all"
          >
            Login
          </button>
        )}
        {/* Night mode toggle */}
        <button
          onClick={toggleNightMode}
          className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-primary/20 backdrop-blur-md transition-all"
        >
          🌙
        </button>
      </div>

      {renderSection()}
      <Navigation active={activeSection} onNavigate={setActiveSection} />
    </div>
  );
}
