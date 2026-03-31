"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Mic, PenTool, Calendar, Bell, ChevronRight, Moon, Sun, Clock, Bookmark, Activity, CheckCircle2 } from 'lucide-react';
import { useLocalStore } from '@/lib/store';
import { fetchPrayerTimes, fetchHijriDate, fetchSurahs } from '@/lib/api';
import { Progress } from '@/components/ui/progress';

export function Dashboard({ onNavigate }: { onNavigate: (section: string) => void }) {
  const { completionPercentage, settings, completedCount, inProgressCount, bookmarkedCount, progress } = useLocalStore();
  const [prayerData, setPrayerData] = useState<any>(null);
  const [hijriDate, setHijriDate] = useState<any>(null);
  const [countdown, setCountdown] = useState<{ label: string, time: string } | null>(null);
  const [surahs, setSurahs] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (settings.location) {
      fetchPrayerTimes(settings.location.lat, settings.location.lng).then(setPrayerData);
    } else {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        fetchPrayerTimes(latitude, longitude).then(setPrayerData);
      });
    }

    const today = new Date();
    const formatted = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    fetchHijriDate(formatted).then(setHijriDate);
    fetchSurahs().then(setSurahs);
  }, [settings.location]);

  useEffect(() => {
    if (!prayerData) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timings = prayerData.timings;
      const nextPrayer = findNextPrayer(timings);
      if (nextPrayer) {
        setCountdown(nextPrayer);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerData]);

  const findNextPrayer = (timings: any) => {
    const now = new Date();
    const prayerTimes = [
      { name: 'Fajr (Sehri)', time: timings.Fajr },
      { name: 'Dhuhr', time: timings.Dhuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib (Iftar)', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha }
    ];

    for (const p of prayerTimes) {
      const [h, m] = p.time.split(':');
      const pDate = new Date();
      pDate.setHours(parseInt(h), parseInt(m), 0);
      if (pDate > now) {
        const diff = pDate.getTime() - now.getTime();
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        return {
          label: p.name,
          time: `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        };
      }
    }
    return null;
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto pb-24">
      <header className="flex flex-col gap-1 py-4">
        <h1 className="text-4xl font-headline font-bold text-primary">ILMNOOR</h1>
        <p className="text-muted-foreground">Welcome to your spiritual journey.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card relative overflow-hidden group border-primary/20">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full transition-transform group-hover:scale-150" />
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
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full transition-transform group-hover:scale-150" />
          <CardContent className="p-6 flex items-center justify-between gap-5">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-primary/80 mb-1">Next: {countdown?.label || 'Prayer'}</div>
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

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">Quran Completion</h3>
          <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2 bg-primary/10" />
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
            <CheckCircle2 className="text-[#4ade80] h-6 w-6 mb-1 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <span className="text-2xl font-bold font-headline">{completedCount}</span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Completed</span>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
            <Activity className="text-primary h-6 w-6 mb-1 drop-shadow-[0_0_8px_rgba(201,168,76,0.5)]" />
            <span className="text-2xl font-bold font-headline">{inProgressCount}</span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">In Progress</span>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1">
            <Bookmark className="text-[#38bdf8] h-6 w-6 mb-1 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
            <span className="text-2xl font-bold font-headline text-[#38bdf8]">{bookmarkedCount}</span>
            <span className="text-[10px] uppercase tracking-widest text-[#38bdf8] font-bold">Bookmarked</span>
          </div>
        </div>

        {(inProgressCount > 0 || bookmarkedCount > 0) && surahs.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary px-1">Active Surahs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {surahs.filter(s => progress[s.number] === 'In Progress' || (progress as any)[s.number] === 'Learning').map(s => (
                <div key={`ip-${s.number}`} className="glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer" onClick={() => onNavigate('quran')}>
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary drop-shadow-[0_0_5px_rgba(201,168,76,0.4)]" />
                    <span className="font-bold text-sm text-foreground">{s.englishName}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">In Progress</span>
                </div>
              ))}
              {surahs.filter(s => progress[s.number] === 'Bookmarked').map(s => (
                <div key={`bm-${s.number}`} className="glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer" onClick={() => onNavigate('quran')}>
                  <div className="flex items-center gap-3">
                    <Bookmark className="h-5 w-5 text-[#38bdf8] drop-shadow-[0_0_5px_rgba(56,189,248,0.4)]" />
                    <span className="font-bold text-sm text-foreground">{s.englishName}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#38bdf8]">Bookmarked</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <NavCard icon={<BookOpen />} title="Surah" desc="Recite" onClick={() => onNavigate('quran')} isPrimary />
        <NavCard icon={<Bookmark />} title="Para" desc="Juz Index" onClick={() => onNavigate('quran')} isPrimary />
        <NavCard icon={<Mic />} title="Learn" desc="Tajweed" onClick={() => onNavigate('learning')} isPrimary={false} />
        <NavCard icon={<PenTool />} title="Duas" desc="Notepad" onClick={() => onNavigate('duas')} isPrimary={false} />
      </div>
    </div>
  );
}

function NavCard({ icon, title, desc, onClick, isPrimary }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void, isPrimary?: boolean }) {
  if (isPrimary) {
    return (
      <Card className="group border-none text-primary-foreground relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all bg-gradient-to-br from-primary to-[hsl(var(--primary)/0.6)] shadow-[0_5px_15px_hsl(var(--primary)/0.3)]" onClick={onClick}>
        <div className="absolute right-[-10px] top-[-10px] opacity-20 w-16 h-16 bg-white rounded-full blur-xl" />
        <div className="absolute left-[10%] bottom-[10%] w-2 h-2 rounded-full bg-white/40 animate-pulse" />
        <div className="absolute right-[20%] top-[40%] w-1 h-1 rounded-full bg-white/60 animate-[pulse_2s_infinite]" />
        
        <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 relative z-10 h-full">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white shadow-sm [&>svg]:w-5 [&>svg]:h-5">
            {icon}
          </div>
          <div>
            <h4 className="font-bold font-headline text-lg md:text-xl leading-none mb-1 text-white">{title}</h4>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/80">{desc}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group glass-card cursor-pointer border hover:border-primary/40 transition-all overflow-hidden" onClick={onClick}>
      <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center text-center gap-3 h-full">
        <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-lg leading-none mb-1 text-foreground">{title}</h4>
          <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}
