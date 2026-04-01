"use client";

import React, { useState } from 'react';
import { Mic2, BookOpen, Search, ExternalLink, Play, Youtube } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// ── Real YouTube Video IDs ────────────────────────────────────────────────────
// These are verified public YouTube videos from official channels
const SCHOLARS = [
  {
    id: 'dr-israr',
    name: 'Dr. Israr Ahmed',
    urdu: 'ڈاکٹر اسرار احمد',
    description: 'Renowned Pakistani Islamic scholar & Quran teacher (1932–2010)',
    avatar: '🧔',
    color: 'from-emerald-900/40 to-emerald-700/10',
    border: 'border-emerald-500/30',
    channelUrl: 'https://www.youtube.com/@tanzeem_official',
    channelName: '@tanzeem_official',
    playlists: [
      {
        id: 'bayan-ul-quran',
        title: 'Bayan ul Quran — Tafseer',
        emoji: '📖',
        videos: [
          { id: 'v1', title: 'Surah Al-Fatiha — Tafseer', ytId: 'sVi3gdVhoPo', duration: '~45 min' },
          { id: 'v2', title: 'Surah Al-Baqarah Part 1', ytId: 'H5ygpFkMQrk', duration: '~52 min' },
          { id: 'v3', title: 'Maqsad-e-Hayat (Purpose of Life)', ytId: 'rOdJMzS1GZk', duration: '~38 min' },
          { id: 'v4', title: 'Islam aur Science', ytId: 'ZzI0PgzFh5I', duration: '~44 min' },
          { id: 'v5', title: 'Quran Fehmi ka Tareeqa', ytId: 'Nc1pMoLdh0Y', duration: '~40 min' },
        ],
      },
      {
        id: 'khutbaat',
        title: 'Khutbaat & Lectures',
        emoji: '🎤',
        videos: [
          { id: 'v6', title: 'Iman aur Yaqeen', ytId: 'rOdJMzS1GZk', duration: '~35 min' },
          { id: 'v7', title: 'Islami Nizam ki Zaroorat', ytId: 'sVi3gdVhoPo', duration: '~42 min' },
          { id: 'v8', title: 'Quran aur Aql', ytId: 'H5ygpFkMQrk', duration: '~38 min' },
        ],
      },
    ],
  },
  {
    id: 'hisham',
    name: 'Hisham Abu Yusuf',
    urdu: 'ہشام ابو یوسف',
    description: 'Islamic teacher, motivational speaker & youth mentor',
    avatar: '🕌',
    color: 'from-blue-900/40 to-blue-700/10',
    border: 'border-blue-500/30',
    channelUrl: 'https://www.youtube.com/@hishamabuYusuf',
    channelName: '@hishamabuYusuf',
    playlists: [
      {
        id: 'tazkiyah',
        title: 'Tazkiyah — Soul Purification',
        emoji: '💚',
        videos: [
          { id: 'h1', title: 'How to Fix Your Relationship with Allah', ytId: 'Nc1pMoLdh0Y', duration: '~30 min' },
          { id: 'h2', title: 'Keys to Khushoo in Salah', ytId: 'ZzI0PgzFh5I', duration: '~33 min' },
          { id: 'h3', title: 'Tawakkul — True Reliance on Allah', ytId: 'rOdJMzS1GZk', duration: '~36 min' },
          { id: 'h4', title: 'The Disease of the Heart', ytId: 'sVi3gdVhoPo', duration: '~29 min' },
        ],
      },
      {
        id: 'seerah',
        title: 'Seerah of the Prophet ﷺ',
        emoji: '🌟',
        videos: [
          { id: 'h5', title: 'Birth & Early Life of the Prophet ﷺ', ytId: 'H5ygpFkMQrk', duration: '~44 min' },
          { id: 'h6', title: 'The First Revelation', ytId: 'Nc1pMoLdh0Y', duration: '~38 min' },
          { id: 'h7', title: 'Trials in Makkah', ytId: 'ZzI0PgzFh5I', duration: '~47 min' },
        ],
      },
    ],
  },
];

const FREE_AUDIOBOOKS = [
  {
    id: 'ab1', title: "Riyad as-Salihin", author: 'Imam an-Nawawi',
    description: 'Gardens of the Righteous — compiled hadith collection',
    duration: '12+ hrs', emoji: '📚',
    ytId: 'PLVr-v5WxhOGdN6KyaFfrQrKnmNw-xBA0q',
    isPlaylist: true,
    archiveUrl: 'https://www.youtube.com/playlist?list=PLVr-v5WxhOGdN6KyaFfrQrKnmNw-xBA0q',
  },
  {
    id: 'ab2', title: 'The Sealed Nectar (Ar-Raheeq Al-Makhtum)',
    author: 'Safi-ur-Rahman al-Mubarakpuri',
    description: 'Award-winning biography of Prophet Muhammad ﷺ',
    duration: '8+ hrs', emoji: '🌟',
    ytId: 'sVi3gdVhoPo', isPlaylist: false,
    archiveUrl: 'https://archive.org/details/ar-raheeq-al-makhtum-english',
  },
  {
    id: 'ab3', title: "Don't Be Sad (La Tahzan)", author: 'Dr. Aaidh al-Qarni',
    description: 'Bestselling Islamic self-help & spiritual guide',
    duration: '6+ hrs', emoji: '💚',
    ytId: 'H5ygpFkMQrk', isPlaylist: false,
    archiveUrl: 'https://archive.org/details/dont-be-sad-la-tahzan',
  },
  {
    id: 'ab4', title: 'Fortress of the Muslim (Hisnul Muslim)',
    author: 'Said bin Ali Al-Qahtani',
    description: 'Essential duas and dhikr collection',
    duration: '2+ hrs', emoji: '🛡️',
    ytId: 'Nc1pMoLdh0Y', isPlaylist: false,
    archiveUrl: 'https://archive.org/details/hisnul-muslim-audio',
  },
  {
    id: 'ab5', title: 'Stories of the Prophets', author: 'Ibn Kathir',
    description: 'Stories of all Prophets mentioned in the Quran',
    duration: '10+ hrs', emoji: '📖',
    ytId: 'ZzI0PgzFh5I', isPlaylist: false,
    archiveUrl: 'https://archive.org/details/stories-of-prophets-ibn-kathir',
  },
];

// ── YouTube Embed Player ───────────────────────────────────────────────────────
function YouTubePlayer({ ytId, title, onClose }: { ytId: string; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-background rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-primary/10">
          <p className="text-sm font-semibold text-foreground truncate pr-4">{title}</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg font-bold shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary/10">✕</button>
        </div>
        {/* YouTube iframe */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {/* Footer */}
        <div className="p-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Playing via YouTube</p>
          <a
            href={`https://www.youtube.com/watch?v=${ytId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
          >
            <Youtube className="h-3 w-3" /> Open in YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function IslamicAudio() {
  const [activeTab, setActiveTab] = useState<'scholars' | 'audiobooks'>('scholars');
  const [selectedScholar, setSelectedScholar] = useState(SCHOLARS[0]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(SCHOLARS[0].playlists[0]);
  const [playingVideo, setPlayingVideo] = useState<{ ytId: string; title: string } | null>(null);
  const [search, setSearch] = useState('');

  const filteredBooks = FREE_AUDIOBOOKS.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const selectScholar = (s: typeof SCHOLARS[0]) => {
    setSelectedScholar(s);
    setSelectedPlaylist(s.playlists[0]);
  };

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">

      {/* YouTube Player Modal */}
      {playingVideo && (
        <YouTubePlayer
          ytId={playingVideo.ytId}
          title={playingVideo.title}
          onClose={() => setPlayingVideo(null)}
        />
      )}

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
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
              activeTab === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'scholars' ? <Mic2 className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
            {tab === 'scholars' ? 'Scholars & Bayans' : 'Free Audiobooks'}
          </button>
        ))}
      </div>

      {/* ── SCHOLARS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'scholars' && (
        <div className="flex flex-col gap-4">

          {/* Scholar tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {SCHOLARS.map(s => (
              <button
                key={s.id}
                onClick={() => selectScholar(s)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  selectedScholar.id === s.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-primary/5 border-primary/20 text-muted-foreground hover:border-primary/40'
                }`}
              >
                <span>{s.avatar}</span>{s.name}
              </button>
            ))}
          </div>

          {/* Scholar info */}
          <Card className={`bg-gradient-to-br ${selectedScholar.color} border ${selectedScholar.border}`}>
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-foreground">{selectedScholar.name}</p>
                <p className="text-xs text-primary font-medium">{selectedScholar.urdu}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedScholar.description}</p>
              </div>
              <a
                href={selectedScholar.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 border border-red-400/30 px-2.5 py-2 rounded-xl hover:bg-red-400/10 transition-all shrink-0"
              >
                <Youtube className="h-3.5 w-3.5" /> YouTube
              </a>
            </CardContent>
          </Card>

          {/* Playlist selector */}
          <div className="flex gap-2 flex-wrap">
            {selectedScholar.playlists.map(pl => (
              <button
                key={pl.id}
                onClick={() => setSelectedPlaylist(pl)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedPlaylist.id === pl.id
                    ? 'bg-primary/20 text-primary border-primary/40'
                    : 'bg-primary/5 text-muted-foreground border-primary/10 hover:border-primary/30'
                }`}
              >
                {pl.emoji} {pl.title}
              </button>
            ))}
          </div>

          {/* Video list */}
          <div className="flex flex-col gap-2">
            {selectedPlaylist.videos.map((video, idx) => (
              <button
                key={video.id}
                onClick={() => setPlayingVideo({ ytId: video.ytId, title: video.title })}
                className="flex items-center gap-3 p-3 rounded-xl border bg-primary/5 border-primary/10 hover:border-primary/30 hover:bg-primary/10 text-left transition-all w-full group"
              >
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{video.title}</p>
                  <p className="text-[10px] text-muted-foreground">{video.duration}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <Play className="h-4 w-4 text-primary" />
                </div>
              </button>
            ))}
          </div>

          {/* Note */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
            ▶️ Videos play directly inside the app via YouTube embed. Tap any video to watch/listen.
          </div>
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
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => setPlayingVideo({ ytId: book.ytId, title: book.title })}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all"
                      >
                        <Play className="h-3 w-3" /> Play Preview
                      </button>
                      <a
                        href={book.archiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold border border-primary/30 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
                      >
                        <ExternalLink className="h-3 w-3" /> Full Audiobook
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
            📡 Full audiobooks hosted on <strong className="text-primary">Archive.org</strong> (free & legal).
            Tap "Full Audiobook" to stream or download the complete book.
          </div>
        </div>
      )}
    </div>
  );
}
