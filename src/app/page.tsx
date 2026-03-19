"use client";

import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { QuranReader } from '@/components/QuranReader';
import { QuranLearning } from '@/components/QuranLearning';
import { DuaNotepad } from '@/components/DuaNotepad';
import { PrayerTimes } from '@/components/PrayerTimes';
import { Settings } from '@/components/Settings';
import { Navigation, NavItem } from '@/components/Navigation';

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavItem>('home');

  useEffect(() => {
    // Request notification permission on first visit
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return <Dashboard onNavigate={(s) => setActiveSection(s as NavItem)} />;
      case 'quran': return <QuranReader />;
      case 'learning': return <QuranLearning />;
      case 'duas': return <DuaNotepad />;
      case 'prayer': return <PrayerTimes />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={(s) => setActiveSection(s as NavItem)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {renderSection()}
      <Navigation active={activeSection} onNavigate={setActiveSection} />
    </div>
  );
}
