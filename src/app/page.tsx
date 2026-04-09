"use client";

import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { ReciteQuran } from '@/components/ReciteQuran';
import { QuranLearning } from '@/components/QuranLearning';
import { DuaNotepad } from '@/components/DuaNotepad';
import { PrayerTimes } from '@/components/PrayerTimes';
import HadithCollection from '@/components/HadithCollection';
import { Navigation, NavItem } from '@/components/Navigation';
import { NooraniQaida } from '@/components/NooraniQaida';
import { Scholars } from '@/components/Scholars';

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavItem>('home');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') Notification.requestPermission();
    }
    const theme = localStorage.getItem('ilmnoor_theme');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'home':     return <Dashboard onNavigate={(s) => setActiveSection(s as NavItem)} />;
      case 'quran':    return <ReciteQuran />;
      case 'learning': return <QuranLearning />;
      case 'duas':     return <DuaNotepad />;
      case 'prayer':   return <PrayerTimes />;
      case 'hadith':   return <HadithCollection />;
      case 'scholars': return <Scholars />;
      case 'qaida':    return <NooraniQaida />;
      default:         return <Dashboard onNavigate={(s) => setActiveSection(s as NavItem)} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 transition-colors duration-300">
      {renderSection()}
      <Navigation active={activeSection} onNavigate={setActiveSection} />
    </div>
  );
}
