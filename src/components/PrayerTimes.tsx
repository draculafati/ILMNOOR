"use client";

import React, { useState, useEffect } from 'react';
import { fetchPrayerTimes } from '@/lib/api';
import { useLocalStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellOff, MapPin, Search, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export function PrayerTimes() {
  const { settings, updateSettings, toggleAlarm } = useLocalStore();
  const [prayerData, setPrayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualCity, setManualCity] = useState('');

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
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        updateSettings({ location: { lat: latitude, lng: longitude } });
        loadTimes(latitude, longitude);
      });
    }
  }, []);

  const handleManualSearch = async () => {
    if (!manualCity) return;
    setLoading(true);
    try {
      // Very simple geocoding fallback
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualCity)}`);
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

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-headline font-bold text-primary">Prayer Times</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {settings.location?.city || 'Detecting Location...'}
          </div>
        </div>

        <div className="flex gap-2">
          <Input 
            placeholder="Enter city or country..." 
            value={manualCity} 
            onChange={e => setManualCity(e.target.value)}
            className="bg-primary/5 border-primary/20"
          />
          <Button variant="secondary" onClick={handleManualSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary h-8 w-8" />
          <p className="text-muted-foreground">Updating times...</p>
        </div>
      ) : prayerData ? (
        <div className="flex flex-col gap-4 mt-2">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SpecialTimeCard label="Sehri Ends (Fajr)" time={get12Hour(prayerData.timings.Fajr)} active={settings.alarms.sehri} onToggle={() => toggleAlarm('sehri')} />
            <SpecialTimeCard label="Iftar Time (Maghrib)" time={get12Hour(prayerData.timings.Maghrib)} active={settings.alarms.iftar} onToggle={() => toggleAlarm('iftar')} />
          </section>

          <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mt-4">Full Schedule</h3>
          <div className="flex flex-col gap-2">
            <PrayerRow name="Fajr" time={get12Hour(prayerData.timings.Fajr)} active={settings.alarms.fajr} onToggle={() => toggleAlarm('fajr')} />
            <PrayerRow name="Dhuhr" time={get12Hour(prayerData.timings.Dhuhr)} active={settings.alarms.dhuhr} onToggle={() => toggleAlarm('dhuhr')} />
            <PrayerRow name="Asr" time={get12Hour(prayerData.timings.Asr)} active={settings.alarms.asr} onToggle={() => toggleAlarm('asr')} />
            <PrayerRow name="Maghrib" time={get12Hour(prayerData.timings.Maghrib)} active={settings.alarms.maghrib} onToggle={() => toggleAlarm('maghrib')} />
            <PrayerRow name="Isha" time={get12Hour(prayerData.timings.Isha)} active={settings.alarms.isha} onToggle={() => toggleAlarm('isha')} />
          </div>

          <div className="mt-8 p-4 rounded-lg bg-primary/10 flex gap-3 items-start border border-primary/20">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Notifications are triggered based on your local system time. Ensure ILMNOOR is allowed to send notifications in your browser settings.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SpecialTimeCard({ label, time, active, onToggle }: { label: string, time: string, active: boolean, onToggle: () => void }) {
  return (
    <Card className="bg-primary/15 border-primary/30">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-1">
        <div className="text-xs uppercase font-bold tracking-widest text-primary/70">{label}</div>
        <div className="text-4xl font-headline font-bold text-secondary">{time}</div>
        <div className="mt-4 flex items-center gap-2">
          {active ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
          <Switch checked={active} onCheckedChange={onToggle} />
        </div>
      </CardContent>
    </Card>
  );
}

function PrayerRow({ name, time, active, onToggle }: { name: string, time: string, active: boolean, onToggle: () => void }) {
  return (
    <Card className="bg-primary/5 border-primary/10">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="font-bold text-lg">{name}</div>
        <div className="flex items-center gap-6">
          <div className="font-mono text-secondary">{time}</div>
          <Switch checked={active} onCheckedChange={onToggle} />
        </div>
      </CardContent>
    </Card>
  );
}
