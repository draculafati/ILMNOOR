"use client";

import React, { useState, useEffect } from 'react';
import { fetchPrayerTimes } from '@/lib/api';
import { useLocalStore } from '@/lib/store';
import { usePrayerNotifications } from '@/hooks/use-prayer-notifications';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellOff, MapPin, Search, Loader2, Info, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export function PrayerTimes() {
  const { settings, updateSettings, toggleAlarm } = useLocalStore();
  const [prayerData, setPrayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  usePrayerNotifications(prayerData?.timings ?? null, settings.alarms);

  const loadTimes = (lat: number, lng: number) => {
    setLoading(true);
    fetchPrayerTimes(lat, lng).then(data => {
      setPrayerData(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (settings.location) {
      loadTimes(settings.location.lat, settings.location.lng);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          updateSettings({ location: { lat: latitude, lng: longitude } });
          loadTimes(latitude, longitude);
        },
        () => setLoading(false)
      );
    }
  }, []);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleRequestNotifPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  const handleManualSearch = async () => {
    if (!manualCity) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualCity)}`
      );
      const data = await res.json();
      if (data && data[0]) {
        const { lat, lon } = data[0];
        updateSettings({ location: { lat: parseFloat(lat), lng: parseFloat(lon), city: manualCity } });
        loadTimes(parseFloat(lat), parseFloat(lon));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const get12Hour = (time24: string) => {
    const [h, m] = time24.split(':');
    let hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    hr = hr % 12 || 12;
    return `${hr}:${m} ${ampm}`;
  };

  const getNextPrayer = () => {
    if (!prayerData || !currentTime) return null;
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    const prayers = [
      { name: 'Fajr', time: prayerData.timings.Fajr },
      { name: 'Dhuhr', time: prayerData.timings.Dhuhr },
      { name: 'Asr', time: prayerData.timings.Asr },
      { name: 'Maghrib', time: prayerData.timings.Maghrib },
      { name: 'Isha', time: prayerData.timings.Isha },
    ];
    for (const p of prayers) {
      const [h, m] = p.time.split(':').map(Number);
      if (currentMins < h * 60 + m) return p.name;
    }
    return 'Fajr';
  };

  const nextPrayerName = getNextPrayer();

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary leading-tight">Prayer Times</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{settings.location?.city || 'Detecting location…'}</span>
            </div>
          </div>
          {currentTime && (
            <div className="text-right shrink-0">
              <div className="font-mono text-lg sm:text-xl text-foreground font-bold tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Local Time</div>
            </div>
          )}
        </div>

        {notifPermission !== 'granted' && (
          <button
            onClick={handleRequestNotifPermission}
            className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-semibold hover:bg-primary/20 transition-all text-left"
          >
            <BellRing className="h-4 w-4 shrink-0 animate-bounce" />
            {notifPermission === 'denied'
              ? 'Notifications blocked — enable in browser settings'
              : 'Tap to enable prayer alarm notifications 🔔'}
          </button>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Enter city or country…"
            value={manualCity}
            onChange={e => setManualCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
            className="bg-primary/5 border-primary/20 text-sm h-9"
          />
          <Button variant="secondary" onClick={handleManualSearch} className="h-9 px-3 shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary h-8 w-8" />
          <p className="text-muted-foreground text-sm">Updating times…</p>
        </div>
      ) : prayerData ? (
        <div className="flex flex-col gap-3 mt-1">
          <section className="grid grid-cols-2 gap-3">
            <SpecialTimeCard label="Sehri (Fajr)" time={get12Hour(prayerData.timings.Fajr)} active={settings.alarms.sehri} onToggle={() => toggleAlarm('sehri')} isNext={nextPrayerName === 'Fajr'} />
            <SpecialTimeCard label="Iftar (Maghrib)" time={get12Hour(prayerData.timings.Maghrib)} active={settings.alarms.iftar} onToggle={() => toggleAlarm('iftar')} isNext={nextPrayerName === 'Maghrib'} />
          </section>

          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">Full Schedule</h3>
          <div className="flex flex-col gap-2">
            <PrayerRow name="Fajr"    time={get12Hour(prayerData.timings.Fajr)}    active={settings.alarms.fajr}    onToggle={() => toggleAlarm('fajr')}    isNext={nextPrayerName === 'Fajr'} />
            <PrayerRow name="Dhuhr"   time={get12Hour(prayerData.timings.Dhuhr)}   active={settings.alarms.dhuhr}   onToggle={() => toggleAlarm('dhuhr')}   isNext={nextPrayerName === 'Dhuhr'} />
            <PrayerRow name="Asr"     time={get12Hour(prayerData.timings.Asr)}     active={settings.alarms.asr}     onToggle={() => toggleAlarm('asr')}     isNext={nextPrayerName === 'Asr'} />
            <PrayerRow name="Maghrib" time={get12Hour(prayerData.timings.Maghrib)} active={settings.alarms.maghrib} onToggle={() => toggleAlarm('maghrib')} isNext={nextPrayerName === 'Maghrib'} />
            <PrayerRow name="Isha"    time={get12Hour(prayerData.timings.Isha)}    active={settings.alarms.isha}    onToggle={() => toggleAlarm('isha')}    isNext={nextPrayerName === 'Isha'} />
          </div>

          <div className="mt-4 p-3 rounded-xl bg-primary/10 flex gap-3 items-start border border-primary/20">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Alarms fire as browser notifications ~1 min before each enabled prayer. Install as a PWA for best results.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SpecialTimeCard({ label, time, active, isNext, onToggle }: { label: string; time: string; active: boolean; isNext?: boolean; onToggle: () => void }) {
  return (
    <Card className={`relative transition-all overflow-hidden ${isNext ? 'bg-primary/20 border-primary shadow-md scale-[1.01]' : 'bg-primary/15 border-primary/30'}`}>
      {isNext && <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />}
      <CardContent className="p-3 sm:p-5 flex flex-col items-center justify-center text-center gap-1">
        {isNext && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            <span className="text-[9px] font-bold uppercase text-primary tracking-wider">Next</span>
          </div>
        )}
        <div className={`text-[10px] uppercase font-bold tracking-widest leading-tight ${isNext ? 'text-primary' : 'text-primary/70'}`}>{label}</div>
        <div className={`text-lg sm:text-3xl font-headline font-bold tabular-nums ${isNext ? 'text-primary' : 'text-foreground'}`}>{time}</div>
        <div className="mt-2 flex items-center gap-2">
          {active ? <Bell className="h-3.5 w-3.5 text-primary" /> : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
          <Switch checked={active} onCheckedChange={onToggle} />
        </div>
      </CardContent>
    </Card>
  );
}

function PrayerRow({ name, time, active, isNext, onToggle }: { name: string; time: string; active: boolean; isNext?: boolean; onToggle: () => void }) {
  return (
    <Card className={`transition-all ${isNext ? 'bg-primary/10 border-primary shadow-[0_0_12px_rgba(14,165,233,0.25)] scale-[1.01] z-10' : 'bg-primary/5 border-primary/10'}`}>
      <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`font-bold text-base sm:text-lg truncate ${isNext ? 'text-primary' : 'text-foreground/90'}`}>{name}</div>
          {isNext && <span className="text-[9px] uppercase tracking-widest bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full animate-pulse shrink-0">Next</span>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className={`font-mono text-sm sm:text-base tabular-nums ${isNext ? 'text-primary font-bold' : 'text-foreground/80'}`}>{time}</div>
          <Switch checked={active} onCheckedChange={onToggle} />
        </div>
      </CardContent>
    </Card>
  );
}
