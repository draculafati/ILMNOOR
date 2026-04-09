export const QURAN_API_BASE = 'https://api.alquran.cloud/v1';
export const ALADHAN_API_BASE = 'https://api.aladhan.com/v1';

export async function fetchSurahs() {
  const res = await fetch(`${QURAN_API_BASE}/surah`);
  const data = await res.json();
  return data.data;
}

export async function fetchSurahDetail(number: number) {
  // Editions: quran-uthmani (Arabic), en.transliteration (Roman), ur.jalandhry (Urdu), en.sahih (English)
  const res = await fetch(`${QURAN_API_BASE}/surah/${number}/editions/quran-uthmani,en.transliteration,ur.jalandhry,en.sahih`);
  const data = await res.json();
  return data.data; // Array of 4 editions: [0]=Arabic [1]=Roman [2]=Urdu [3]=English
}

export async function fetchPrayerTimes(lat: number, lng: number) {
  const res = await fetch(`${ALADHAN_API_BASE}/timings?latitude=${lat}&longitude=${lng}&method=2`);
  const data = await res.json();
  return data.data;
}

export async function fetchHijriDate(dateStr: string) {
  // DD-MM-YYYY
  const res = await fetch(`${ALADHAN_API_BASE}/gToH?date=${dateStr}`);
  const data = await res.json();
  return data.data.hijri;
}

export function getAudioUrl(ayahAbsoluteNumber: number) {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahAbsoluteNumber}.mp3`;
}
