"use client";

import React, { useState, useEffect } from 'react';
import { fetchSurahs, fetchSurahDetail, getAudioUrl } from '@/lib/api';
import { useLocalStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, Pause, CheckCircle2, BookOpen, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function QuranReader() {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahData, setSurahData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { progress, updateSurahStatus } = useLocalStore();
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSurahs().then(setSurahs);
  }, []);

  const handleSelectSurah = async (num: number) => {
    setLoading(true);
    setSelectedSurah(num);
    const data = await fetchSurahDetail(num);
    setSurahData(data);
    setLoading(false);
  };

  const playAyah = (num: number) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(getAudioUrl(num));
    newAudio.play();
    setPlayingAyah(num);
    setAudio(newAudio);
    newAudio.onended = () => setPlayingAyah(null);
  };

  if (selectedSurah && surahData) {
    const arabic = surahData[0];
    const translit = surahData[1];
    const urdu = surahData[2];

    return (
      <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right duration-300">
        <header className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-md border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSurah(null)}>
              <ChevronLeft />
            </Button>
            <div>
              <h2 className="text-xl font-headline font-bold">{arabic.englishName}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">{arabic.name}</p>
            </div>
          </div>
          <select 
            className="bg-primary/10 text-primary text-xs font-bold rounded-md px-2 py-1 outline-none border-none"
            value={progress[selectedSurah] || 'Not Started'}
            onChange={(e) => updateSurahStatus(selectedSurah, e.target.value as any)}
          >
            <option>Not Started</option>
            <option>Learning</option>
            <option>Completed</option>
          </select>
        </header>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24">
            {arabic.ayahs.map((ayah: any, i: number) => (
              <div key={ayah.number} className="flex flex-col gap-4 border-b border-primary/10 pb-6 relative group">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-[10px] text-primary/60 border-primary/20">
                    {ayah.numberInSurah}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => playAyah(ayah.number)}
                  >
                    {playingAyah === ayah.number ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="arabic-text text-3xl md:text-4xl text-secondary">
                  {ayah.text}
                </div>
                <div className="text-sm italic text-muted-foreground leading-relaxed">
                  {translit.ayahs[i].text}
                </div>
                <div className="text-md font-medium text-foreground/80 leading-relaxed text-right">
                  {urdu.ayahs[i].text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1 py-4">
        <h2 className="text-3xl font-headline font-bold text-primary">Quran Reader</h2>
        <p className="text-muted-foreground">Journey through the 114 Surahs</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary h-10 w-10" />
          <p className="text-muted-foreground animate-pulse">Loading Surah Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {surahs.map(s => (
            <Card key={s.number} className="group hover:border-primary/50 transition-all cursor-pointer bg-primary/5" onClick={() => handleSelectSurah(s.number)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {s.number}
                  </div>
                  <div>
                    <h3 className="font-bold leading-none">{s.englishName}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{s.englishNameTranslation}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="arabic-text text-lg text-primary">{s.name}</div>
                  {progress[s.number] === 'Completed' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
