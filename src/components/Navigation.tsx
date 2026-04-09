"use client";

import React from 'react';
import { Home, BookOpen, PenTool, Clock, BookText, GraduationCap } from 'lucide-react';

export type NavItem = 'home' | 'quran' | 'learning' | 'duas' | 'prayer' | 'hadith' | 'scholars' | 'settings' | 'qaida';

export function Navigation({ active, onNavigate }: { active: NavItem; onNavigate: (nav: NavItem) => void }) {
  const items: { id: NavItem; icon: React.ReactElement<{ className?: string }>; label: string }[] = [
    { id: 'home',    icon: <Home />,           label: 'Home' },
    { id: 'quran',   icon: <BookOpen />,        label: 'Quran' },
    { id: 'duas',    icon: <PenTool />,         label: 'Duas' },
    { id: 'prayer',  icon: <Clock />,           label: 'Pray' },
    { id: 'scholars',icon: <GraduationCap />,   label: 'Scholars' },
    { id: 'hadith',  icon: <BookText />,        label: 'Hadith' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-primary/20 safe-area-bottom">
      <div className="max-w-4xl mx-auto flex justify-around items-center py-1.5 px-1">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-0.5 transition-all flex-1 py-1 min-w-0 ${
              active === item.id ? 'text-primary' : 'text-muted-foreground hover:text-secondary'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${active === item.id ? 'bg-primary/10 scale-110' : ''}`}>
              {React.cloneElement(item.icon, { className: 'h-5 w-5' })}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
