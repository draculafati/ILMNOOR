"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchPrayerTimes } from '@/lib/api';
import { useLocalStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellOff, MapPin, Search, Loader2, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

// ── Prayer names → alarm keys ──────────────────────────────────────────────────
const PRAYER_ALARM_KEYS = {
  Fajr:    'fajr',
  Dhuhr:   'dhuhr',
  Asr:     'asr',
  Maghrib: 'maghrib',
  Isha:    'isha',
} as const;

const PRAYER_EMOJIS: Record<string, string> = {
  Fajr:    '🌙',
  Dhuhr:   '☀️',
  Asr:     '🌤️',
  Maghrib: '🌅',
  Isha:    '🌙',
};

// ── Convert "HH:MM" to today's Date ───────────────────────────────────────────
function todayAt(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// ── Request permission helper ──────────────────────────────────────────────────
async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

// ── Fire a notification ────────────────────────────────────────────────────────
async function fireNotification(prayer: string) {
  const ok = await requestPermission();
  if (!ok) return;
  new Notification(`${PRAYER_EMOJIS[prayer]} ${prayer} Prayer Time`, {
    body: `It's time for ${prayer} prayer. May Allah accept your prayers. آمین`,
    icon: '/icons/icon-192x192.png',
    tag: `prayer-${prayer}`,
    requireInteraction: true,
  });
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function PrayerTimes() {
  const { settings, updateSettings, toggleAlarm } = useLocalStore();
  const [prayerData, setPrayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  // Track which prayers already notified today
  const notifiedToday = useRef<Set<string>>(new Set());
  const notifiedDate  = useRef<string>('');

  // ── Load prayer times ────────────────────────────────────────────────────────
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

  // ── Clock ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Notification permission state ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // ── Alarm checker — runs every 30s ───────────────────────────────────────────
  useEffect(() => {
    if (!prayerData) return;

    const check = () => {
      const now   = new Date();
      const today = now.toDateString();

      // Reset at midnight
      if (notifiedDate.current !== today) {
        notifiedToday.current = new Set();
        notifiedDate.current  = today;
      }

      for (const [prayer, alarmKey] of Object.entries(PRAYER_ALARM_KEYS)) {
        const rawTime = prayerData?.timings?.[prayer];
        if (!rawTime) continue;

        // Only fire if alarm toggle is ON
        if (!settings.alarms[alarmKey as keyof typeof settings.alarms]) continue;

        const prayerTime = todayAt(rawTime);
        const diffMs     = prayerTime.getTime() - now.getTime();
        const diffMins   = diffMs / 60_000;

        // Fire when within 0–2 minutes of prayer time
        if (diffMins >= 0 && diffMins <= 2 && !notifiedToday.current.has(prayer)) {
          notifiedToday.current.add(prayer);
          fireNotification(prayer);
        }
      }
    };

    check(); // run immediately
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [prayerData, settings.alarms]);

  // ── Handle toggle — also request permission on first enable ─────────────────
  const handleToggle = async (key: keyof typeof settings.alarms) => {
    // If turning ON, request permission first
    const currentlyOff = !settings.alarms[key];
    if (currentlyOff) {
      const granted = await requestPermission();
      setNotifPermission(Notification.permission);
      if (!granted) return; // don't toggle if permission denied
    }
    toggleAlarm(key);
  };

  const handleRequestPermission = async () => {
    await requestPermission();
    setNotifPermission(Notification.permission);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
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
      { name: 'Fajr',    time: prayerData.timings.Fajr },
      { name: 'Dhuhr',   time: prayerData.timings.Dhuhr },
      { name: 'Asr',     time: prayerData.timings.Asr },
      { name: 'Maghrib', time: prayerData.timings.Maghrib },
      { name: 'Isha',    time: prayerData.timings.Isha },
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

        {/* Title + Clock */}
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

        {/* Notification permission banner — only show if not granted */}
        {notifPermission !== 'granted' && (
          <button
            onClick={handleRequestPermission}
            className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-semibold hover:bg-primary/20 transition-all text-left"
          >
            <BellRing className="h-4 w-4 shrink-0 animate-bounce" />
            {notifPermission === 'denied'
              ? '⚠️ Notifications blocked — enable in browser settings'
              : 'Tap to enable prayer alarm notifications 🔔'}
          </button>
        )}

        {/* City search */}
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
        <div className="flex flex-col gap-2 mt-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Prayer Schedule</h3>
          {[
            { name: 'Fajr',    alarmKey: 'fajr'    as const, timing: prayerData.timings.Fajr },
            { name: 'Dhuhr',   alarmKey: 'dhuhr'   as const, timing: prayerData.timings.Dhuhr },
            { name: 'Asr',     alarmKey: 'asr'      as const, timing: prayerData.timings.Asr },
            { name: 'Maghrib', alarmKey: 'maghrib' as const, timing: prayerData.timings.Maghrib },
            { name: 'Isha',    alarmKey: 'isha'    as const, timing: prayerData.timings.Isha },
          ].map(p => (
            <PrayerRow
              key={p.name}
              name={p.name}
              emoji={PRAYER_EMOJIS[p.name]}
              time={get12Hour(p.timing)}
              active={settings.alarms[p.alarmKey]}
              onToggle={() => handleToggle(p.alarmKey)}
              isNext={nextPrayerName === p.name}
            />
          ))}
        </div>
      ) : null}
    </div>
  );

  async function handleManualSearch() {
    if (!manualCity) return;
    setLoading(true);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualCity)}`);
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
  }
}

// ── Prayer Row ─────────────────────────────────────────────────────────────────
function PrayerRow({
  name, emoji, time, active, isNext, onToggle,
}: {
  name: string; emoji: string; time: string; active: boolean; isNext?: boolean; onToggle: () => void;
}) {
  return (
    <Card className={`transition-all ${
      isNext
        ? 'bg-primary/10 border-primary shadow-[0_0_14px_rgba(14,165,233,0.2)] scale-[1.01] z-10'
        : 'bg-primary/5 border-primary/10'
    }`}>
      <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl shrink-0">{emoji}</span>
          <div className="min-w-0">
            <div className={`font-bold text-base sm:text-lg ${isNext ? 'text-primary' : 'text-foreground/90'}`}>
              {name}
            </div>
            {isNext && (
              <span className="text-[9px] uppercase tracking-widest text-primary font-bold">● Next Prayer</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className={`font-mono text-sm sm:text-base tabular-nums ${isNext ? 'text-primary font-bold' : 'text-foreground/80'}`}>
            {time}
          </div>
          <div className="flex items-center gap-1.5">
            {active
              ? <Bell className="h-3.5 w-3.5 text-primary" />
              : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
            }
            <Switch checked={active} onCheckedChange={onToggle} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
