"use client";

import { useState, useEffect } from 'react';

export type QuranProgress = {
  [surahNumber: number]: 'Not Started' | 'In Progress' | 'Completed' | 'Bookmarked';
};

// Ayah-level bookmark
export type AyahBookmark = {
  surahNumber: number;
  surahName: string;       // Arabic name e.g. الْفَاتِحَة
  surahEnglishName: string; // e.g. Al-Faatiha
  ayahNumber: number;
  ayahText: string;        // Arabic text snippet
  savedAt: string;
};

export type Dua = {
  id: string;
  title: string;
  text?: string;
  arabic?: string;
  transliteration?: string;
  translation?: string;
  reference?: string;
  date: string;
  isFavorite: boolean;
};

export type AppSettings = {
  alarms: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    sehri: boolean;
    iftar: boolean;
  };
  location?: { lat: number; lng: number; city?: string };
  hfToken?: string;
};

const DEFAULT_SETTINGS: AppSettings = {
  alarms: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true, sehri: true, iftar: true }
};

export function useLocalStore() {
  const [progress, setProgress] = useState<QuranProgress>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ilmnoor_quran_progress');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [duas, setDuas] = useState<Dua[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ilmnoor_duas');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved    = localStorage.getItem('ilmnoor_settings');
      const hfToken  = localStorage.getItem('hf_token');
      const parsed   = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
      return { ...parsed, hfToken: hfToken || '' };
    }
    return DEFAULT_SETTINGS;
  });

  // ── Ayah bookmarks ──────────────────────────────────────────────────────────
  const [ayahBookmarks, setAyahBookmarks] = useState<AyahBookmark[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ilmnoor_ayah_bookmarks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => { localStorage.setItem('ilmnoor_quran_progress', JSON.stringify(progress)); }, [progress]);
  useEffect(() => { localStorage.setItem('ilmnoor_duas', JSON.stringify(duas)); }, [duas]);
  useEffect(() => {
    localStorage.setItem('ilmnoor_settings', JSON.stringify(settings));
    if (settings.hfToken !== undefined) localStorage.setItem('hf_token', settings.hfToken);
  }, [settings]);
  useEffect(() => { localStorage.setItem('ilmnoor_ayah_bookmarks', JSON.stringify(ayahBookmarks)); }, [ayahBookmarks]);

  const updateSurahStatus = (num: number, status: QuranProgress[number]) => {
    setProgress(prev => ({ ...prev, [num]: status }));
  };

  // Ayah bookmark helpers
  const addAyahBookmark = (bm: AyahBookmark) => {
    setAyahBookmarks(prev => {
      // avoid duplicates
      const exists = prev.find(b => b.surahNumber === bm.surahNumber && b.ayahNumber === bm.ayahNumber);
      if (exists) return prev;
      return [bm, ...prev];
    });
  };
  const removeAyahBookmark = (surahNumber: number, ayahNumber: number) => {
    setAyahBookmarks(prev => prev.filter(b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)));
  };
  const isAyahBookmarked = (surahNumber: number, ayahNumber: number) =>
    ayahBookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);

  const addDua = (dua: Omit<Dua, 'id' | 'date' | 'isFavorite'>) => {
    const newDua: Dua = { ...dua, id: crypto.randomUUID(), date: new Date().toLocaleDateString(), isFavorite: false };
    setDuas(prev => [newDua, ...prev]);
  };
  const deleteDua    = (id: string) => setDuas(prev => prev.filter(d => d.id !== id));
  const toggleDuaFavorite = (id: string) => setDuas(prev => prev.map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d));
  const editDua      = (id: string, updates: Partial<Dua>) => setDuas(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  const updateSettings = (updates: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...updates }));
  const toggleAlarm  = (key: keyof AppSettings['alarms']) =>
    setSettings(prev => ({ ...prev, alarms: { ...prev.alarms, [key]: !prev.alarms[key] } }));

  const completedCount       = Object.values(progress).filter(s => s === 'Completed').length;
  const inProgressCount      = Object.values(progress).filter(s => s === 'In Progress' || (s as any) === 'Learning').length;
  const bookmarkedCount      = Object.values(progress).filter(s => s === 'Bookmarked').length;
  const completionPercentage = Math.round((completedCount / 114) * 100) || 0;

  return {
    progress, updateSurahStatus,
    duas, addDua, deleteDua, toggleDuaFavorite, editDua,
    settings, updateSettings, toggleAlarm,
    ayahBookmarks, addAyahBookmark, removeAyahBookmark, isAyahBookmarked,
    completionPercentage, completedCount, inProgressCount, bookmarkedCount,
  };
}
