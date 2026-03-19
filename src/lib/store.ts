
"use client";

import { useState, useEffect } from 'react';

export type QuranProgress = {
  [surahNumber: number]: 'Not Started' | 'Learning' | 'Completed';
};

export type Dua = {
  id: string;
  title: string;
  text: string;
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
  location?: {
    lat: number;
    lng: number;
    city?: string;
  };
  hfToken?: string;
};

const DEFAULT_SETTINGS: AppSettings = {
  alarms: {
    fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true, sehri: true, iftar: true
  }
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
      const saved = localStorage.getItem('ilmnoor_settings');
      const hfToken = localStorage.getItem('hf_token');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
      return { ...parsed, hfToken: hfToken || '' };
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('ilmnoor_quran_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('ilmnoor_duas', JSON.stringify(duas));
  }, [duas]);

  useEffect(() => {
    localStorage.setItem('ilmnoor_settings', JSON.stringify(settings));
    if (settings.hfToken !== undefined) {
      localStorage.setItem('hf_token', settings.hfToken);
    }
  }, [settings]);

  const updateSurahStatus = (num: number, status: QuranProgress[number]) => {
    setProgress(prev => ({ ...prev, [num]: status }));
  };

  const addDua = (dua: Omit<Dua, 'id' | 'date' | 'isFavorite'>) => {
    const newDua: Dua = {
      ...dua,
      id: crypto.randomUUID(),
      date: new Date().toLocaleDateString(),
      isFavorite: false
    };
    setDuas(prev => [newDua, ...prev]);
  };

  const deleteDua = (id: string) => {
    setDuas(prev => prev.filter(d => d.id !== id));
  };

  const toggleDuaFavorite = (id: string) => {
    setDuas(prev => prev.map(d => d.id === id ? { ...d, isFavorite: !d.isFavorite } : d));
  };

  const editDua = (id: string, updates: Partial<Dua>) => {
    setDuas(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleAlarm = (key: keyof AppSettings['alarms']) => {
    setSettings(prev => ({
      ...prev,
      alarms: { ...prev.alarms, [key]: !prev.alarms[key] }
    }));
  };

  const completionPercentage = Math.round(
    (Object.values(progress).filter(s => s === 'Completed').length / 114) * 100
  );

  return {
    progress,
    updateSurahStatus,
    duas,
    addDua,
    deleteDua,
    toggleDuaFavorite,
    editDua,
    settings,
    updateSettings,
    toggleAlarm,
    completionPercentage
  };
}
