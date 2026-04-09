"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahs, fetchSurahDetail } from '@/lib/api';
import { useLocalStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Play, Pause, CheckCircle2, Loader2, BookOpen, Bookmark, BookmarkCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AyahEnd = ({ num }: { num: number }) => (
  <span className="inline-flex items-center justify-center relative mx-2 w-[1.8em] h-[1.8em] align-middle select-none drop-shadow-[0_0_8px_rgba(201,168,76,0.3)]">
    <span className="text-primary font-arabic absolute inset-0 flex items-center justify-center text-[1.8em] leading-none mb-[0.1em] opacity-90">۝</span>
    <span className="text-primary font-bold absolute inset-0 flex items-center justify-center text-[0.45em] pt-[0.2em] font-sans">{num.toLocaleString('ar-EG')}</span>
  </span>
);

export function ReciteQuran() {
  const [surahs, setSurahs]         = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahData, setSurahData]   = useState<any>(null);
  const [loading, setLoading]       = useState(false);
  const { progress, updateSurahStatus, addAyahBookmark, removeAyahBookmark, isAyahBookmarked } = useLocalStore();
  const [mounted, setMounted]       = useState(false);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showTranslit, setShowTranslit]       = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchSurahs().then(setSurahs);
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  const handleSelectSurah = async (num: number) => {
    setLoading(true);
    setSelectedSurah(num);
    const data = await fetchSurahDetail(num);
    setSurahData(data);
    setLoading(false);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setIsPlaying(false); }
  };

  const getSurahAudioUrl = (num: number) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${num}.mp3`;

  const togglePlay = () => {
    if (!selectedSurah) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(getSurahAudioUrl(selectedSurah));
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  // ── Surah detail view ────────────────────────────────────────────────────────
  if (selectedSurah && surahData) {
    const arabic   = surahData[0];
    const english  = surahData[3];
    const translit = surahData[1];
    const urdu     = surahData[2];

    const fullUrduText     = urdu?.ayahs?.map((a: any) => `${a.text} (${a.numberInSurah})`).join(' ') || 'Translation not available.';
    const fullTranslitText = translit?.ayahs?.map((a: any) => `${a.text} (${a.numberInSurah})`).join(' ') || 'Roman translation not available.';

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
                  {/* Only show Arabic name — no English name */}
                  <h2 className="text-2xl font-arabic font-bold text-primary">{arabic.name}</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{arabic.numberOfAyahs} Ayahs</p>
                </div>
                <select
                  className="bg-background/80 backdrop-blur-md text-primary text-xs font-bold rounded-md px-3 py-1.5 outline-none border border-primary/20 cursor-pointer"
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
              className={`gap-2 rounded-full px-6 shadow-[0_0_15px_hsl(var(--primary)/0.3)] font-bold ${isPlaying ? 'bg-secondary text-secondary-foreground' : 'bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.8)] text-primary-foreground'}`}
            >
              {isPlaying ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Play</>}
            </Button>
            <div className="flex items-center gap-1.5 bg-background/50 px-3 py-2 rounded-full backdrop-blur-sm border border-border/50 flex-wrap justify-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Roman</span>
              <Switch checked={showTranslit} onCheckedChange={setShowTranslit} />
              <div className="w-[1px] h-4 bg-border/50 mx-0.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">اردو</span>
              <Switch checked={showTranslation} onCheckedChange={setShowTranslation} />
              <div className="w-[1px] h-4 bg-border/50 mx-0.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">EN</span>
              <Switch checked={showEnglish} onCheckedChange={setShowEnglish} />
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-24">
            {/* Ayah-by-ayah with bookmark button */}
            <div className="glass-card rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col gap-4 relative z-10">
                {arabic.ayahs.map((a: any, idx: number) => {
                  const bmed = mounted && isAyahBookmarked(selectedSurah, a.numberInSurah);
                  const translitAyah = translit?.ayahs?.[idx];
                  const urduAyah     = urdu?.ayahs?.[idx];
                  const englishAyah  = english?.ayahs?.[idx];
                  return (
                    <div key={a.number} className={`group relative rounded-2xl p-4 transition-all ${bmed ? 'bg-primary/10 border border-primary/30' : 'hover:bg-primary/5'}`}>
                      {/* Bookmark toggle button */}
                      <button
                        onClick={() => {
                          if (bmed) {
                            removeAyahBookmark(selectedSurah, a.numberInSurah);
                          } else {
                            addAyahBookmark({
                              surahNumber: selectedSurah,
                              surahName: arabic.name,
                              surahEnglishName: arabic.englishName,
                              ayahNumber: a.numberInSurah,
                              ayahText: a.text.slice(0, 60),
                              savedAt: new Date().toLocaleDateString(),
                            });
                          }
                        }}
                        className={`absolute top-3 left-3 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 ${bmed ? 'opacity-100 text-primary bg-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                        title={bmed ? 'Remove bookmark' : 'Bookmark this ayah'}
                      >
                        {bmed ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </button>

                      {/* Arabic text */}
                      <p className="arabic-text text-2xl md:text-4xl text-foreground font-arabic leading-[2.5] text-right" dir="rtl">
                        {a.text}
                        <AyahEnd num={a.numberInSurah} />
                      </p>

                      {/* Transliteration per ayah */}
                      {showTranslit && translitAyah && (
                        <p className="text-sm text-foreground/80 italic leading-relaxed mt-2">{translitAyah.text}</p>
                      )}

                      {/* Urdu translation per ayah */}
                      {showTranslation && urduAyah && (
                        <p className="text-base text-foreground/90 leading-loose mt-2 text-right font-arabic" dir="rtl">{urduAyah.text}</p>
                      )}

                      {/* English translation per ayah */}
                      {showEnglish && englishAyah && (
                        <p className="text-sm text-foreground/80 leading-relaxed mt-2 border-l-2 border-primary/30 pl-3 italic">{englishAyah.text}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ── Surah list view ──────────────────────────────────────────────────────────
  return (
    <div className="p-4 flex flex-col gap-6 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1 py-4">
        <h2 className="text-3xl font-headline font-bold text-primary">Recite Quran</h2>
        <p className="text-muted-foreground text-sm">114 Surahs</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary h-10 w-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {surahs.map(s => (
            <Card key={s.number} className="glass-card cursor-pointer hover:border-primary/40 transition-all" onClick={() => handleSelectSurah(s.number)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {s.number}
                  </div>
                  <div className="min-w-0">
                    {/* Only Arabic name shown — no English */}
                    <h3 className="font-arabic text-lg text-primary leading-none">{s.name}</h3>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  {mounted && progress[s.number] === 'Completed'   && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  {mounted && (progress[s.number] === 'In Progress' || (progress[s.number] as any) === 'Learning') && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">IN PROGRESS</span>}
                  {mounted && progress[s.number] === 'Bookmarked'  && <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-bold">BOOKMARKED</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
