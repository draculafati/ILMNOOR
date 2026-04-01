"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Mic, PenTool, Calendar, Clock, Bookmark, Activity, CheckCircle2, Type, BookmarkCheck, ChevronRight } from 'lucide-react';
import { useLocalStore } from '@/lib/store';
import { fetchPrayerTimes, fetchHijriDate, fetchSurahs } from '@/lib/api';
import { Progress } from '@/components/ui/progress';

export function Dashboard({ onNavigate }: { onNavigate: (section: string) => void }) {
  const { completionPercentage, settings, completedCount, inProgressCount, bookmarkedCount, progress, ayahBookmarks } = useLocalStore();
  const [prayerData, setPrayerData] = useState<any>(null);
  const [hijriDate, setHijriDate]   = useState<any>(null);
  const [countdown, setCountdown]   = useState<{ label: string; time: string } | null>(null);
  const [surahs, setSurahs]         = useState<any[]>([]);
  const [isMounted, setIsMounted]   = useState(false);
  const [nightMode, setNightMode]   = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // sync night mode state
    setNightMode(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (settings.location) {
      fetchPrayerTimes(settings.location.lat, settings.location.lng).then(setPrayerData);
    } else {
      navigator.geolocation.getCurrentPosition((pos) => {
        fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude).then(setPrayerData);
      });
    }
    const today = new Date();
    fetchHijriDate(`${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`).then(setHijriDate);
    fetchSurahs().then(setSurahs);
  }, [settings.location]);

  useEffect(() => {
    if (!prayerData) return;
    const interval = setInterval(() => {
      setCountdown(findNextPrayer(prayerData.timings));
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerData]);

  const findNextPrayer = (timings: any) => {
    const now = new Date();
    // No Sehri/Iftar labels
    const prayers = [
      { name: 'Fajr',    time: timings.Fajr },
      { name: 'Dhuhr',   time: timings.Dhuhr },
      { name: 'Asr',     time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha',    time: timings.Isha },
    ];
    for (const p of prayers) {
      const [h, m] = p.time.split(':');
      const pDate  = new Date();
      pDate.setHours(parseInt(h), parseInt(m), 0);
      if (pDate > now) {
        const diff = pDate.getTime() - now.getTime();
        const hrs  = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return { label: p.name, time: `${hrs}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}` };
      }
    }
    return null;
  };

  const toggleNightMode = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('ilmnoor_theme', isDark ? 'dark' : 'light');
    setNightMode(isDark);
  };

  // Group ayah bookmarks by surah
  const bookmarksBySurah = ayahBookmarks.reduce<Record<number, typeof ayahBookmarks>>((acc, bm) => {
    if (!acc[bm.surahNumber]) acc[bm.surahNumber] = [];
    acc[bm.surahNumber].push(bm);
    return acc;
  }, {});

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto pb-24">
      {/* Header with Night Mode button ONLY on Dashboard */}
      <header className="flex items-start justify-between py-4">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary">ILMNOOR</h1>
          <p className="text-muted-foreground text-sm">Welcome to your spiritual journey.</p>
        </div>
        <button
          onClick={toggleNightMode}
          className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-primary/20 backdrop-blur-md transition-all mt-1"
        >
          {nightMode ? '☀️ Light' : '🌙 Night'}
        </button>
      </header>

      {/* Date + Countdown cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card relative overflow-hidden group border-primary/20">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary)/0.6)] text-primary-foreground flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.5)]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-primary/80 mb-1">Today's Date</div>
              <div className="text-2xl font-headline font-bold text-foreground">
                {hijriDate ? `${hijriDate.day} ${hijriDate.month.en}` : 'Loading...'}
              </div>
              <div className="text-sm text-muted-foreground">{new Date().toDateString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card relative overflow-hidden group border-primary/20">
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
          <CardContent className="p-6 flex items-center justify-between gap-5">
            <div>
              {/* No Sehri/Iftar label */}
              <div className="text-[10px] uppercase font-bold tracking-widest text-primary/80 mb-1">
                Next: {countdown?.label || 'Prayer'}
              </div>
              <div className="text-4xl font-mono font-bold text-foreground drop-shadow-[0_0_10px_hsl(var(--primary)/0.3)]">
                {countdown?.time || '--:--'}
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 text-primary flex items-center justify-center">
              <Clock className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quran progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">Quran Completion</h3>
          <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2 bg-primary/10" />

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
            <CheckCircle2 className="text-[#4ade80] h-6 w-6 mb-1" />
            <span className="text-2xl font-bold font-headline">{completedCount}</span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Completed</span>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
            <Activity className="text-primary h-6 w-6 mb-1" />
            <span className="text-2xl font-bold font-headline">{inProgressCount}</span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">In Progress</span>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
            <Bookmark className="text-[#38bdf8] h-6 w-6 mb-1" />
            <span className="text-2xl font-bold font-headline text-[#38bdf8]">{bookmarkedCount}</span>
            <span className="text-[10px] uppercase tracking-widest text-[#38bdf8] font-bold">Bookmarked</span>
          </div>
        </div>
      </div>

      {/* ── Ayah Bookmarks — categorised by Surah ────────────────────────────── */}
      {ayahBookmarks.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary px-1 flex items-center gap-2">
            <BookmarkCheck className="h-4 w-4 text-primary" /> Ayah Bookmarks
          </h3>
          <div className="flex flex-col gap-3">
            {Object.entries(bookmarksBySurah).map(([surahNum, bms]) => (
              <div key={surahNum} className="glass-card rounded-xl overflow-hidden border border-primary/10">
                {/* Surah header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 bg-primary/10 cursor-pointer"
                  onClick={() => onNavigate('quran')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-arabic text-lg">{bms[0].surahName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Surah {surahNum}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{bms.length} ayah{bms.length > 1 ? 's' : ''}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
                {/* Ayah list */}
                <div className="divide-y divide-primary/5">
                  {bms.map(bm => (
                    <div key={bm.ayahNumber} className="flex items-center justify-between px-4 py-2.5 hover:bg-primary/5 cursor-pointer" onClick={() => onNavigate('quran')}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{bm.ayahNumber}</span>
                        <p className="text-xs text-foreground/80 truncate font-arabic" dir="rtl">{bm.ayahText}…</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{bm.savedAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Surahs */}
      {(inProgressCount > 0 || bookmarkedCount > 0) && surahs.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary px-1">Active Surahs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {surahs.filter(s => progress[s.number] === 'In Progress' || (progress as any)[s.number] === 'Learning').map(s => (
              <div key={`ip-${s.number}`} className="glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer" onClick={() => onNavigate('quran')}>
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-arabic text-lg text-primary">{s.name}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">In Progress</span>
              </div>
            ))}
            {surahs.filter(s => progress[s.number] === 'Bookmarked').map(s => (
              <div key={`bm-${s.number}`} className="glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer" onClick={() => onNavigate('quran')}>
                <div className="flex items-center gap-3">
                  <Bookmark className="h-5 w-5 text-[#38bdf8] shrink-0" />
                  <span className="font-arabic text-lg text-primary">{s.name}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#38bdf8]">Bookmarked</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nav cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
        <NavCard icon={<BookOpen />} title="Surah"  desc="Recite"    onClick={() => onNavigate('quran')}    isPrimary />
        <NavCard icon={<Type />}     title="Qaida"  desc="Alphabet"  onClick={() => onNavigate('qaida')}    isPrimary />
        <NavCard icon={<Mic />}      title="Learn"  desc="Tajweed"   onClick={() => onNavigate('learning')} isPrimary={false} />
        <NavCard icon={<PenTool />}  title="Duas"   desc="Notepad"   onClick={() => onNavigate('duas')}     isPrimary={false} />
      </div>
    </div>
  );
}

function NavCard({ icon, title, desc, onClick, isPrimary }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void; isPrimary?: boolean }) {
  if (isPrimary) {
    return (
      <Card className="group border-none text-primary-foreground relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all bg-gradient-to-br from-primary to-[hsl(var(--primary)/0.6)] shadow-[0_5px_15px_hsl(var(--primary)/0.3)]" onClick={onClick}>
        <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 relative z-10 h-full">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white shadow-sm [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
          <div>
            <h4 className="font-bold font-headline text-lg leading-none mb-1 text-white">{title}</h4>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/80">{desc}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="group glass-card cursor-pointer border hover:border-primary/40 transition-all overflow-hidden" onClick={onClick}>
      <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 h-full">
        <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">{icon}</div>
        <div>
          <h4 className="font-bold text-lg leading-none mb-1 text-foreground">{title}</h4>
          <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}
