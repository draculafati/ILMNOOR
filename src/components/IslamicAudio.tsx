"use client";

import React, { useState } from 'react';
import { ExternalLink, BookOpen, Search, Youtube } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const SCHOLARS = [
  {
    id: 'dr-israr',
    name: 'Dr. Israr Ahmed',
    urdu: 'ڈاکٹر اسرار احمد',
    description: 'Renowned Pakistani Islamic scholar & Quran teacher (1932–2010). Known for Bayan ul Quran, his complete tafseer of the Holy Quran.',
    avatar: '🧔',
    color: 'from-emerald-900/40 to-emerald-700/10',
    border: 'border-emerald-500/30',
    channelUrl: 'https://www.youtube.com/@Official-drisrarahmed',
    channelHandle: '@Official-drisrarahmed',
    playlists: [
      { title: 'Bayan ul Quran — Complete Tafseer', emoji: '📖', url: 'https://www.youtube.com/@Official-drisrarahmed/playlists' },
      { title: 'Khutbaat — Friday Sermons', emoji: '🎤', url: 'https://www.youtube.com/@Official-drisrarahmed/videos' },
      { title: 'Lectures & Dars', emoji: '🕌', url: 'https://www.youtube.com/@Official-drisrarahmed/videos' },
    ],
    topics: ['Bayan ul Quran', 'Tafseer', 'Khutbaat', 'Islamic Philosophy', 'Quran Fehmi', 'Iman & Yaqeen'],
  },
  {
    id: 'hisham',
    name: 'Hisham Abu Yusuf',
    urdu: 'ہشام ابو یوسف',
    description: 'Islamic teacher, motivational speaker & youth mentor. Known for Tazkiyah, Seerah, and practical Islamic guidance.',
    avatar: '🕌',
    color: 'from-blue-900/40 to-blue-700/10',
    border: 'border-blue-500/30',
    channelUrl: 'https://www.youtube.com/@hishamabuyusuf',
    channelHandle: '@hishamabuyusuf',
    playlists: [
      { title: 'Tazkiyah — Soul Purification', emoji: '💚', url: 'https://www.youtube.com/@hishamabuyusuf/playlists' },
      { title: 'Seerah of the Prophet ﷺ', emoji: '🌟', url: 'https://www.youtube.com/@hishamabuyusuf/playlists' },
      { title: 'Motivational Lectures', emoji: '🔥', url: 'https://www.youtube.com/@hishamabuyusuf/videos' },
    ],
    topics: ['Tazkiyah', 'Seerah', 'Salah & Khushoo', 'Tawakkul', 'Youth & Islam', 'Heart Purification'],
  },
];

const FREE_AUDIOBOOKS = [
  { id: 'ab1', title: 'Riyad as-Salihin', author: 'Imam an-Nawawi', description: 'Gardens of the Righteous — compiled hadith collection', duration: '12+ hrs', emoji: '📚', url: 'https://archive.org/details/riyad-as-salihin-audio' },
  { id: 'ab2', title: 'The Sealed Nectar', author: 'Safi-ur-Rahman al-Mubarakpuri', description: 'Award-winning biography of Prophet Muhammad ﷺ', duration: '8+ hrs', emoji: '🌟', url: 'https://archive.org/details/ar-raheeq-al-makhtum-english' },
  { id: 'ab3', title: "Don't Be Sad (La Tahzan)", author: 'Dr. Aaidh al-Qarni', description: 'Bestselling Islamic self-help & spiritual guide', duration: '6+ hrs', emoji: '💚', url: 'https://archive.org/details/dont-be-sad-la-tahzan' },
  { id: 'ab4', title: 'Fortress of the Muslim', author: 'Said bin Ali Al-Qahtani', description: 'Essential duas and dhikr collection with audio', duration: '2+ hrs', emoji: '🛡️', url: 'https://archive.org/details/hisnul-muslim-audio' },
  { id: 'ab5', title: 'Stories of the Prophets', author: 'Ibn Kathir', description: 'Stories of all Prophets mentioned in the Quran', duration: '10+ hrs', emoji: '📖', url: 'https://archive.org/details/stories-of-prophets-ibn-kathir' },
];

export function IslamicAudio() {
  const [activeTab, setActiveTab] = useState<'scholars' | 'audiobooks'>('scholars');
  const [search, setSearch] = useState('');

  const filteredBooks = FREE_AUDIOBOOKS.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="py-3 mb-3">
        <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary">Islamic Audio</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Scholars • Bayans • Free Audiobooks</p>
      </header>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-primary/5 border border-primary/10 mb-4">
        {(['scholars', 'audiobooks'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'scholars' ? <Youtube className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
            {tab === 'scholars' ? 'Scholars & Bayans' : 'Free Audiobooks'}
          </button>
        ))}
      </div>

      {/* ── SCHOLARS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'scholars' && (
        <div className="flex flex-col gap-5">
          {SCHOLARS.map(scholar => (
            <Card key={scholar.id} className={`bg-gradient-to-br ${scholar.color} border ${scholar.border} overflow-hidden`}>
              <CardContent className="p-0">
                {/* Scholar header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{scholar.avatar}</div>
                      <div>
                        <h3 className="font-bold text-base text-foreground">{scholar.name}</h3>
                        <p className="text-sm text-primary font-medium">{scholar.urdu}</p>
                      </div>
                    </div>
                    {/* Main YouTube button */}
                    <a
                      href={scholar.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shrink-0 shadow-sm"
                    >
                      <Youtube className="h-3.5 w-3.5" />
                      YouTube
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{scholar.description}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-primary/10 mx-4" />

                {/* Playlists */}
                <div className="p-4 pt-3 flex flex-col gap-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Browse Playlists</p>
                  {scholar.playlists.map((pl, i) => (
                    <a
                      key={i}
                      href={pl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-background/30 hover:bg-background/60 border border-primary/10 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{pl.emoji}</span>
                        <span className="text-xs font-semibold text-foreground">{pl.title}</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </a>
                  ))}
                </div>

                {/* Topics chips */}
                <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                  {scholar.topics.map(topic => (
                    <span key={topic} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Channel handle */}
                <div className="px-4 pb-3">
                  <a
                    href={scholar.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                  >
                    youtube.com/{scholar.channelHandle}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── AUDIOBOOKS TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'audiobooks' && (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search audiobooks…"
              className="pl-10 bg-primary/5 border-primary/20 text-sm h-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            {filteredBooks.map(book => (
              <Card key={book.id} className="bg-primary/5 border-primary/10 hover:border-primary/30 transition-all">
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-3xl shrink-0 mt-0.5">{book.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground">{book.title}</p>
                    <p className="text-[11px] text-primary font-medium">{book.author}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">{book.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">⏱ {book.duration}</p>
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all"
                    >
                      <ExternalLink className="h-3 w-3" /> Listen Free on Archive.org
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
            📡 All audiobooks hosted freely on <strong className="text-primary">archive.org</strong> — tap to stream or download.
          </div>
        </div>
      )}
    </div>
  );
}
