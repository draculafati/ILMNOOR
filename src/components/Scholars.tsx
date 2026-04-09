"use client";

import React from 'react';
import { ExternalLink, Youtube, BookOpen, Mic2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const SCHOLARS = [
  {
    id: 'dr-israr',
    name: 'Dr. Israr Ahmed',
    urdu: 'ڈاکٹر اسرار احمد',
    years: '1932 — 2010',
    description: 'Renowned Pakistani Islamic scholar, philosopher & Quran teacher. Founder of Tanzeem-e-Islami. Famous for his complete Tafseer "Bayan ul Quran".',
    avatar: '🧔',
    color: 'from-emerald-900/40 to-emerald-700/5',
    border: 'border-emerald-500/30',
    channelUrl: 'https://www.youtube.com/@Official-drisrarahmed',
    channelHandle: '@Official-drisrarahmed',
    topics: ['Bayan ul Quran', 'Tafseer', 'Khutbaat', 'Islamic Philosophy', 'Quran Fehmi', 'Iman & Yaqeen', 'Islami Nizam'],
    playlists: [
      { title: 'Bayan ul Quran — Complete Tafseer', emoji: '📖', url: 'https://www.youtube.com/@Official-drisrarahmed/playlists' },
      { title: 'Friday Khutbaat (Sermons)', emoji: '🎤', url: 'https://www.youtube.com/@Official-drisrarahmed/videos' },
      { title: 'Short Clips & Highlights', emoji: '✂️', url: 'https://www.youtube.com/@Official-drisrarahmed/videos' },
    ],
  },
  {
    id: 'hisham',
    name: 'Hisham Abu Yusuf',
    urdu: 'ہشام ابو یوسف',
    years: 'Contemporary',
    description: 'Islamic teacher, motivational speaker & youth mentor. Known for Tazkiyah (soul purification), Seerah of the Prophet ﷺ, and practical Islamic guidance for youth.',
    avatar: '🕌',
    color: 'from-blue-900/40 to-blue-700/5',
    border: 'border-blue-500/30',
    channelUrl: 'https://www.youtube.com/@hishamabuyusuf',
    channelHandle: '@hishamabuyusuf',
    topics: ['Tazkiyah', 'Seerah', 'Salah & Khushoo', 'Tawakkul', 'Youth & Islam', 'Heart Purification', 'Motivational'],
    playlists: [
      { title: 'Tazkiyah — Soul Purification', emoji: '💚', url: 'https://www.youtube.com/@hishamabuyusuf/playlists' },
      { title: 'Seerah of the Prophet ﷺ', emoji: '🌟', url: 'https://www.youtube.com/@hishamabuyusuf/playlists' },
      { title: 'Motivational Lectures', emoji: '🔥', url: 'https://www.youtube.com/@hishamabuyusuf/videos' },
    ],
  },
];

export function Scholars() {
  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="py-3 mb-4">
        <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary">Scholars</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Learn from trusted Islamic scholars on YouTube</p>
      </header>

      <div className="flex flex-col gap-5">
        {SCHOLARS.map(scholar => (
          <Card key={scholar.id} className={`bg-gradient-to-br ${scholar.color} border ${scholar.border} overflow-hidden`}>
            <CardContent className="p-0">

              {/* Scholar header */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-5xl leading-none">{scholar.avatar}</div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground leading-tight">{scholar.name}</h3>
                      <p className="text-sm text-primary font-medium">{scholar.urdu}</p>
                      <p className="text-[11px] text-muted-foreground">{scholar.years}</p>
                    </div>
                  </div>
                  {/* YouTube button */}
                  <a
                    href={scholar.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shrink-0 shadow-md"
                  >
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{scholar.description}</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-primary/10 mx-4" />

              {/* Playlists */}
              <div className="p-4 pt-3 flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Playlists & Content</p>
                {scholar.playlists.map((pl, i) => (
                  <a
                    key={i}
                    href={pl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-background/30 hover:bg-background/60 border border-primary/10 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{pl.emoji}</span>
                      <span className="text-xs font-semibold text-foreground">{pl.title}</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </a>
                ))}
              </div>

              {/* Topics */}
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {scholar.topics.map(topic => (
                  <span key={topic} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                    {topic}
                  </span>
                ))}
              </div>

              {/* Channel link */}
              <div className="px-4 pb-4">
                <a
                  href={scholar.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Youtube className="h-3 w-3" />
                  youtube.com/{scholar.channelHandle}
                </a>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
        🔗 Tap any playlist or the YouTube button to open directly in YouTube app or browser.
      </div>
    </div>
  );
}
