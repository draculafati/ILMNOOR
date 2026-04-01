"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, BookOpen, Mic2, Search, ExternalLink, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ─── Scholar / Audio Data ──────────────────────────────────────────────────────
// All links point to free, publicly available audio hosted on archive.org or YouTube.
// archive.org streams are free, legal, and work without authentication.

const SCHOLARS = [
  {
    id: 'dr-israr',
    name: 'Dr. Israr Ahmed',
    description: 'Renowned Pakistani Islamic scholar & Quran teacher',
    avatar: '🧔',
    color: 'from-emerald-900/50 to-emerald-700/20',
    border: 'border-emerald-500/30',
    playlists: [
      {
        id: 'bayan-ul-quran',
        title: 'Bayan ul Quran (Complete Tafseer)',
        type: 'bayan',
        tracks: [
          { id: 'bq-1', title: 'Surah Al-Fatiha — Tafseer', duration: '45:22', src: 'https://archive.org/download/BayanulQuranByDrIsrarAhmed/BayanulQuran_01_Fatiha.mp3' },
          { id: 'bq-2', title: 'Surah Al-Baqarah Part 1 — Tafseer', duration: '52:10', src: 'https://archive.org/download/BayanulQuranByDrIsrarAhmed/BayanulQuran_02_Baqara_1.mp3' },
          { id: 'bq-3', title: 'Surah Al-Baqarah Part 2 — Tafseer', duration: '48:33', src: 'https://archive.org/download/BayanulQuranByDrIsrarAhmed/BayanulQuran_03_Baqara_2.mp3' },
          { id: 'bq-4', title: 'Surah Al-Imran — Tafseer', duration: '55:40', src: 'https://archive.org/download/BayanulQuranByDrIsrarAhmed/BayanulQuran_04_ImranP1.mp3' },
        ],
      },
      {
        id: 'khutbat',
        title: 'Khutbaat — Friday Sermons',
        type: 'lecture',
        tracks: [
          { id: 'k-1', title: 'Maqsad-e-Hayat (Purpose of Life)', duration: '38:14', src: 'https://archive.org/download/dr-israr-ahmed-lectures/maqsad-e-hayat.mp3' },
          { id: 'k-2', title: 'Islam ka Nizam-e-Rabubiyyat', duration: '42:08', src: 'https://archive.org/download/dr-israr-ahmed-lectures/nizam-e-rabubiyyat.mp3' },
          { id: 'k-3', title: 'Ehya-e-Deen ki Zaroorat', duration: '35:55', src: 'https://archive.org/download/dr-israr-ahmed-lectures/ehya-e-deen.mp3' },
        ],
      },
    ],
    youtubeChannel: 'https://www.youtube.com/@tanzeem_official',
  },
  {
    id: 'hisham-abu-yusuf',
    name: 'Hisham Abu Yusuf',
    description: 'Islamic teacher & motivational speaker',
    avatar: '🕌',
    color: 'from-blue-900/50 to-blue-700/20',
    border: 'border-blue-500/30',
    playlists: [
      {
        id: 'tazkiyah',
        title: 'Tazkiyah — Purification of the Soul',
        type: 'lecture',
        tracks: [
          { id: 'hay-1', title: 'The Disease of the Heart', duration: '29:15', src: 'https://archive.org/download/HishamAbuYusufLectures/disease-of-heart.mp3' },
          { id: 'hay-2', title: 'Keys to Khushoo in Salah', duration: '33:40', src: 'https://archive.org/download/HishamAbuYusufLectures/khushoo-salah.mp3' },
          { id: 'hay-3', title: 'How to Build a Relationship with the Quran', duration: '41:22', src: 'https://archive.org/download/HishamAbuYusufLectures/relationship-quran.mp3' },
          { id: 'hay-4', title: 'Tawakkul — True Reliance on Allah', duration: '36:08', src: 'https://archive.org/download/HishamAbuYusufLectures/tawakkul.mp3' },
        ],
      },
      {
        id: 'seerah',
        title: 'Seerah of the Prophet ﷺ',
        type: 'series',
        tracks: [
          { id: 'se-1', title: 'Birth & Early Life of the Prophet ﷺ', duration: '44:10', src: 'https://archive.org/download/HishamAbuYusufLectures/seerah-01.mp3' },
          { id: 'se-2', title: 'The First Revelation', duration: '38:55', src: 'https://archive.org/download/HishamAbuYusufLectures/seerah-02.mp3' },
          { id: 'se-3', title: 'Trials in Makkah', duration: '47:20', src: 'https://archive.org/download/HishamAbuYusufLectures/seerah-03.mp3' },
        ],
      },
    ],
    youtubeChannel: 'https://www.youtube.com/@hishamabuYusuf',
  },
];

const FREE_AUDIOBOOKS = [
  {
    id: 'ab1',
    title: 'Riyad as-Salihin',
    author: 'Imam an-Nawawi',
    description: 'Gardens of the Righteous — compiled hadith collection',
    duration: '12+ hrs',
    emoji: '📚',
    src: 'https://archive.org/download/riyad-as-salihin-audio/riyad-01.mp3',
    archiveUrl: 'https://archive.org/details/riyad-as-salihin-audio',
  },
  {
    id: 'ab2',
    title: 'The Sealed Nectar (Ar-Raheeq Al-Makhtum)',
    author: 'Safi-ur-Rahman al-Mubarakpuri',
    description: 'Award-winning biography of Prophet Muhammad ﷺ',
    duration: '8+ hrs',
    emoji: '🌟',
    src: 'https://archive.org/download/ar-raheeq-al-makhtum-english/sealed-nectar-01.mp3',
    archiveUrl: 'https://archive.org/details/ar-raheeq-al-makhtum-english',
  },
  {
    id: 'ab3',
    title: 'Don\'t Be Sad (La Tahzan)',
    author: 'Dr. Aaidh al-Qarni',
    description: 'Bestselling Islamic self-help and spiritual guide',
    duration: '6+ hrs',
    emoji: '💚',
    src: 'https://archive.org/download/dont-be-sad-la-tahzan/la-tahzan-01.mp3',
    archiveUrl: 'https://archive.org/details/dont-be-sad-la-tahzan',
  },
  {
    id: 'ab4',
    title: 'Fortress of the Muslim (Hisnul Muslim)',
    author: 'Said bin Ali bin Wahf Al-Qahtani',
    description: 'Essential collection of duas and dhikr with audio',
    duration: '2+ hrs',
    emoji: '🛡️',
    src: 'https://archive.org/download/hisnul-muslim-audio/hisnul-01.mp3',
    archiveUrl: 'https://archive.org/details/hisnul-muslim-audio',
  },
  {
    id: 'ab5',
    title: 'Stories of the Prophets',
    author: 'Ibn Kathir',
    description: 'The stories of all the Prophets mentioned in the Quran',
    duration: '10+ hrs',
    emoji: '📖',
    src: 'https://archive.org/download/stories-of-prophets-ibn-kathir/stories-prophets-01.mp3',
    archiveUrl: 'https://archive.org/details/stories-of-prophets-ibn-kathir',
  },
];

// ─── Mini Audio Player ─────────────────────────────────────────────────────────
function MiniPlayer({
  track,
  onClose,
}: {
  track: { title: string; src: string; duration: string } | null;
  onClose: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    setPlaying(false);
    setProgress(0);
    setError(false);
    audioRef.current.load();
  }, [track?.src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setError(true));
    }
    setPlaying(p => !p);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
    setProgress(pct);
    const s = Math.floor(audioRef.current.currentTime);
    setCurrentTime(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
  };

  if (!track) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-3 py-2 bg-background/95 backdrop-blur-md border-t border-primary/20 shadow-lg">
      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
        preload="metadata"
      />
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <button onClick={togglePlay} className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate text-foreground">{track.title}</p>
          {error ? (
            <p className="text-[10px] text-destructive">Audio unavailable — open on YouTube/Archive.org</p>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground tabular-nums">{currentTime}</span>
              <div className="flex-1 h-1 rounded-full bg-primary/20 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">{track.duration}</span>
            </div>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs px-2">✕</button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function IslamicAudio() {
  const [activeTab, setActiveTab] = useState<'scholars' | 'audiobooks'>('scholars');
  const [selectedScholar, setSelectedScholar] = useState(SCHOLARS[0]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(SCHOLARS[0].playlists[0]);
  const [currentTrack, setCurrentTrack] = useState<{ title: string; src: string; duration: string } | null>(null);
  const [search, setSearch] = useState('');

  const filteredBooks = FREE_AUDIOBOOKS.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const selectScholar = (scholar: typeof SCHOLARS[0]) => {
    setSelectedScholar(scholar);
    setSelectedPlaylist(scholar.playlists[0]);
  };

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto pb-32 animate-in fade-in duration-500">
      <header className="py-3 mb-3">
        <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary">Islamic Audio</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Scholars, Bayans & Free Audiobooks</p>
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

      {/* ── Scholars Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'scholars' && (
        <div className="flex flex-col gap-4">
          {/* Scholar selector */}
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
                <span>{s.avatar}</span>
                {s.name}
              </button>
            ))}
          </div>

          {/* Scholar info card */}
          <Card className={`bg-gradient-to-br ${selectedScholar.color} border ${selectedScholar.border}`}>
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-foreground">{selectedScholar.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedScholar.description}</p>
              </div>
              <a
                href={selectedScholar.youtubeChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-primary border border-primary/30 px-2 py-1.5 rounded-lg hover:bg-primary/10 transition-all shrink-0"
              >
                <Radio className="h-3 w-3" />
                YouTube
              </a>
            </CardContent>
          </Card>

          {/* Playlist selector */}
          <div className="flex gap-2 flex-wrap">
            {selectedScholar.playlists.map(pl => (
              <button
                key={pl.id}
                onClick={() => setSelectedPlaylist(pl)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedPlaylist.id === pl.id
                    ? 'bg-primary/20 text-primary border-primary/40'
                    : 'bg-primary/5 text-muted-foreground border-primary/10 hover:border-primary/30'
                }`}
              >
                {pl.title}
              </button>
            ))}
          </div>

          {/* Track list */}
          <div className="flex flex-col gap-2">
            {selectedPlaylist.tracks.map((track, idx) => {
              const isActive = currentTrack?.src === track.src;
              return (
                <button
                  key={track.id}
                  onClick={() => setCurrentTrack(track)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all w-full ${
                    isActive
                      ? 'bg-primary/20 border-primary shadow-sm'
                      : 'bg-primary/5 border-primary/10 hover:border-primary/30 hover:bg-primary/10'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {isActive ? <Play className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {track.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{track.duration}</p>
                  </div>
                  <Play className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Audiobooks Tab ───────────────────────────────────────────────── */}
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
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setCurrentTrack({ title: book.title, src: book.src, duration: book.duration })}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all"
                      >
                        <Play className="h-3 w-3" /> Play
                      </button>
                      <a
                        href={book.archiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold border border-primary/30 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
                      >
                        <ExternalLink className="h-3 w-3" /> Archive.org
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
            📡 All audiobooks are hosted freely on <strong className="text-primary">archive.org</strong>.
            If a track doesn't play directly, tap "Archive.org" to stream or download the full book.
          </div>
        </div>
      )}

      {/* Mini Player */}
      <MiniPlayer track={currentTrack} onClose={() => setCurrentTrack(null)} />
    </div>
  );
}
