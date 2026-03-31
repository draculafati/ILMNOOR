"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahs, fetchSurahDetail } from '@/lib/api';
import { useLocalStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, Pause, CheckCircle2, Loader2, BookOpen } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AyahEnd = ({ num }: { num: number }) => (
  <span className="inline-flex items-center justify-center relative mx-2 w-[1.8em] h-[1.8em] align-middle select-none drop-shadow-[0_0_8px_rgba(201,168,76,0.3)]">
    <span className="text-primary font-arabic absolute inset-0 flex items-center justify-center text-[1.8em] leading-none mb-[0.1em] opacity-90">
      ۝
    </span>
    <span className="text-primary font-bold absolute inset-0 flex items-center justify-center text-[0.45em] pt-[0.2em] font-sans">
      {num.toLocaleString('ar-EG')}
    </span>
  </span>
);

export function ReciteQuran() {
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahData, setSurahData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { progress, updateSurahStatus } = useLocalStore();
  const [mounted, setMounted] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchSurahs().then(setSurahs);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleSelectSurah = async (num: number) => {
    setLoading(true);
    setSelectedSurah(num);
    const data = await fetchSurahDetail(num);
    setSurahData(data);
    setLoading(false);

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  const getSurahAudioUrl = (num: number) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${num}.mp3`;

  const togglePlay = () => {
    if (!selectedSurah) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(getSurahAudioUrl(selectedSurah));
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  if (selectedSurah && surahData) {
    const arabic = surahData[0];
    const translit = surahData[1];
    const urdu = surahData[2];

    // Combines all ayahs into continuous text
    // Replace traditional string mapping with React fragments
    const fullUrduText = urdu?.ayahs?.map((a: any) => `${a.text} (${a.numberInSurah})`).join(' ') || 'Translation not available.';

    return (
      <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right duration-300">
        <header className="sticky top-0 z-10 p-4 bg-background/50 backdrop-blur-xl border-b border-white/5 flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedSurah(null)} className="hover:bg-primary/20">
                <ChevronLeft className="text-primary" />
              </Button>
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-foreground text-glow">{arabic.englishName}</h2>
                  <p className="text-[10px] text-primary uppercase tracking-widest">{arabic.name}</p>
                </div>

                <select
                  className="bg-background/80 backdrop-blur-md text-primary text-xs font-bold rounded-md px-3 py-1.5 outline-none border border-primary/20 cursor-pointer shadow-[0_0_10px_rgba(201,168,76,0.15)]"
                  value={mounted ? ((progress[selectedSurah] as any) === 'Learning' ? 'In Progress' : (progress[selectedSurah] || 'Not Started')) : 'Not Started'}
                  onChange={(e) => updateSurahStatus(selectedSurah, e.target.value as any)}
                  disabled={!mounted}
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Bookmarked</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between glass-card p-3 rounded-2xl">
            <Button
              onClick={togglePlay}
              className={`gap-2 rounded-full px-6 shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all font-bold ${isPlaying ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.8)] text-primary-foreground hover:opacity-90'}`}
            >
              {isPlaying ? <><Pause className="h-4 w-4" /> Pause Surah</> : <><Play className="h-4 w-4" /> Play Fast Read</>}
            </Button>

            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full backdrop-blur-sm border border-border/50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Translate</span>
              <Switch checked={showTranslation} onCheckedChange={setShowTranslation} />
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-24">
            {/* Arabic Continuous Text */}
            <div className="glass-card rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div
                className="arabic-text text-3xl md:text-5xl text-foreground font-arabic leading-[2.6] md:leading-[2.8] text-justify drop-shadow-sm relative z-10"
                dir="rtl"
              >
                {arabic.ayahs.map((a: any) => (
                  <React.Fragment key={a.number}>
                    <span className="hover:text-primary transition-colors cursor-text">{a.text}</span>
                    <AyahEnd num={a.numberInSurah} />
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Translation Continuous Text */}
            {showTranslation && (
              <div className="glass-card border border-primary/20 rounded-[1.5rem] p-6 md:p-8 animate-in zoom-in-95 duration-200">
                <h3 className="text-xs uppercase tracking-widest font-bold text-primary mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                  <BookOpen className="h-4 w-4" />
                  Urdu Translation
                </h3>
                <div
                  className="text-lg md:text-xl text-foreground/90 font-medium leading-loose text-justify text-shadow-sm"
                  dir="rtl"
                >
                  {fullUrduText}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1 py-4">
        <h2 className="text-3xl font-headline font-bold text-primary">Recite Quran</h2>
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
            <Card key={s.number} className="glass-card cursor-pointer" onClick={() => handleSelectSurah(s.number)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {s.number}
                  </div>
                  <div>
                    <h3 className="font-bold leading-none text-foreground">{s.englishName}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{s.englishNameTranslation}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="arabic-text text-lg text-primary">{s.name}</div>
                  {mounted && progress[s.number] === 'Completed' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  {mounted && ((progress[s.number] as any) === 'In Progress' || (progress[s.number] as any) === 'Learning') && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">IN PROGRESS</span>}
                  {mounted && progress[s.number] === 'Bookmarked' && <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-bold">BOOKMARKED</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
