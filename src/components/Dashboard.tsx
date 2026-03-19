"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Mic, PenTool, Calendar, Bell, ChevronRight, Moon, Sun, Clock } from 'lucide-react';
import { useLocalStore } from '@/lib/store';
import { fetchPrayerTimes, fetchHijriDate } from '@/lib/api';
import { Progress } from '@/components/ui/progress';

export function Dashboard({ onNavigate }: { onNavigate: (section: string) => void }) {
  const { completionPercentage, settings } = useLocalStore();
  const [prayerData, setPrayerData] = useState<any>(null);
  const [hijriDate, setHijriDate] = useState<any>(null);
  const [countdown, setCountdown] = useState<{ label: string, time: string } | null>(null);

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

  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto pb-24">
      <header className="flex flex-col gap-1 py-4">
        <h1 className="text-4xl font-headline font-bold text-primary">ILMNOOR</h1>
        <p className="text-muted-foreground">Welcome to your spiritual journey.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
            <Calendar className="text-primary w-8 h-8" />
            <div className="text-xs uppercase tracking-widest opacity-70">Today's Hijri Date</div>
            <div className="text-2xl font-headline font-bold">
              {hijriDate ? `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year}` : 'Loading...'}
            </div>
            <div className="text-sm opacity-60">{new Date().toDateString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
            <Clock className="text-primary w-8 h-8" />
            <div className="text-xs uppercase tracking-widest opacity-70">Next: {countdown?.label || 'Prayer'}</div>
            <div className="text-4xl font-mono font-bold text-primary">
              {countdown?.time || '--:--:--'}
            </div>
            <div className="text-sm opacity-60">Iftar is usually at Maghrib</div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">Quran Completion</h3>
          <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2 bg-primary/10" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <NavCard icon={<BookOpen />} title="Quran Reader" desc="Read and listen to the Holy Quran" onClick={() => onNavigate('quran')} />
        <NavCard icon={<Mic />} title="Quran Learning" desc="Record and compare your recitation" onClick={() => onNavigate('learning')} />
        <NavCard icon={<PenTool />} title="Dua Notepad" desc="Save and organize your personal duas" onClick={() => onNavigate('duas')} />
        <NavCard icon={<Clock />} title="Prayer Times" desc="Daily schedules and Ramadan timings" onClick={() => onNavigate('prayer')} />
        <NavCard icon={<Calendar />} title="Islamic Calendar" desc="Monthly view and important dates" onClick={() => onNavigate('calendar')} />
      </div>
    </div>
  );
}

function NavCard({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void }) {
  return (
    <Card className="group hover:bg-primary/5 transition-all cursor-pointer border-transparent hover:border-primary/20 overflow-hidden" onClick={onClick}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg leading-none mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
        <ChevronRight className="text-muted-foreground w-5 h-5 group-hover:text-primary transition-all" />
      </CardContent>
    </Card>
  );
}
