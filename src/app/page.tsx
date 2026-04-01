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

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavItem>('home');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'home':    return <Dashboard onNavigate={(s) => setActiveSection(s as NavItem)} />;
      case 'quran':   return <ReciteQuran />;
      case 'learning': return <QuranLearning />;
      case 'duas':    return <DuaNotepad />;
      case 'prayer':  return <PrayerTimes />;
      case 'hadith':  return <HadithCollection />;
      case 'audio':   return <IslamicAudio />;
      case 'settings': return <Settings />;
      case 'qaida':   return <NooraniQaida />;
      default:        return <Dashboard onNavigate={(s) => setActiveSection(s as NavItem)} />;
    }
  };

  const toggleNightMode = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('ilmnoor_theme', isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const theme = localStorage.getItem('ilmnoor_theme');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16 transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleNightMode}
          className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-primary/20 backdrop-blur-md transition-all"
        >
          Night Mode
        </button>
      </div>
      {renderSection()}
      <Navigation active={activeSection} onNavigate={setActiveSection} />
    </div>
  );
}
