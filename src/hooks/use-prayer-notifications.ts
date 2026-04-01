"use client";

// src/hooks/use-prayer-notifications.ts
// Handles PWA browser notifications for prayer alarms.
// Fires a notification 1 minute before each prayer whose alarm is ON.

import { useEffect, useRef } from 'react';
import { AppSettings } from '@/lib/store';

type PrayerTimings = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
};

const PRAYER_TO_ALARM_KEY: Record<string, keyof AppSettings['alarms']> = {
  Fajr:    'fajr',
  Dhuhr:   'dhuhr',
  Asr:     'asr',
  Maghrib: 'maghrib',
  Isha:    'isha',
};

const PRAYER_EMOJIS: Record<string, string> = {
  Fajr:    '🌙 Fajr',
  Dhuhr:   '☀️ Dhuhr',
  Asr:     '🌤️ Asr',
  Maghrib: '🌅 Maghrib',
  Isha:    '🌙 Isha',
};

/** Convert "HH:MM" string to today's Date object */
function todayAt(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function usePrayerNotifications(
  timings: PrayerTimings | null,
  alarms: AppSettings['alarms'],
) {
  // Keep a Set of prayers already notified today so we don't spam
  const notifiedToday = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!timings) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    const tick = () => {
      const now = new Date();
      const todayKey = now.toDateString();

      // Reset at midnight
      if ((notifiedToday.current as any).__date !== todayKey) {
        notifiedToday.current = new Set();
        (notifiedToday.current as any).__date = todayKey;
      }

      for (const [prayer, alarmKey] of Object.entries(PRAYER_TO_ALARM_KEY)) {
        const rawTime = timings[prayer];
        if (!rawTime) continue;
        if (!alarms[alarmKey]) continue; // alarm is OFF

        const prayerTime = todayAt(rawTime);
        const diffMs = prayerTime.getTime() - now.getTime();
        const diffMins = diffMs / 60_000;

        // Fire when 1–2 minutes before prayer (window so we don't miss it)
        if (diffMins > 0 && diffMins <= 2 && !notifiedToday.current.has(prayer)) {
          notifiedToday.current.add(prayer);
          fireNotification(prayer);
        }
      }

      // Also fire Sehri (Fajr) and Iftar (Maghrib) alarms if enabled
      if (alarms.sehri && !notifiedToday.current.has('sehri_extra')) {
        const fajrTime = todayAt(timings.Fajr);
        const diff = (fajrTime.getTime() - now.getTime()) / 60_000;
        if (diff > 0 && diff <= 2) {
          notifiedToday.current.add('sehri_extra');
          fireCustomNotification('⏰ Sehri Ending', 'Sehri time is ending — make your niyyah for Sehri!');
        }
      }

      if (alarms.iftar && !notifiedToday.current.has('iftar_extra')) {
        const maghribTime = todayAt(timings.Maghrib);
        const diff = (maghribTime.getTime() - now.getTime()) / 60_000;
        if (diff > 0 && diff <= 2) {
          notifiedToday.current.add('iftar_extra');
          fireCustomNotification('🌙 Iftar Time!', 'Maghrib is about to begin — time to break your fast! Alhamdulillah 🕌');
        }
      }
    };

    const interval = setInterval(tick, 30_000); // check every 30 seconds
    tick(); // check immediately on mount
    return () => clearInterval(interval);
  }, [timings, alarms]);
}

async function requestAndCheck(): Promise<boolean> {
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

async function fireNotification(prayer: string) {
  const allowed = await requestAndCheck();
  if (!allowed) return;

  const emoji = PRAYER_EMOJIS[prayer] || prayer;
  new Notification(`🕌 ${emoji} Prayer Time`, {
    body: `It's almost time for ${prayer} prayer. May Allah accept your prayers. آمین`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: `prayer-${prayer}`,
    requireInteraction: true,
  });
}

async function fireCustomNotification(title: string, body: string) {
  const allowed = await requestAndCheck();
  if (!allowed) return;
  new Notification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    tag: title,
    requireInteraction: true,
  });
}
