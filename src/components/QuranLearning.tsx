"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahs, fetchSurahDetail, getAudioUrl } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, Square, Loader2, Sparkles, AlertCircle, RefreshCw, Play, Pause, CheckCircle2, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLocalStore } from '@/lib/store';
import { transcribeAudio } from '@/app/actions/transcribe';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const AyahEnd = ({ num }: { num: number }) => (
  <span className="inline-flex items-center justify-center relative mx-1 w-[1.5em] h-[1.5em] align-middle select-none drop-shadow-[0_0_8px_rgba(201,168,76,0.3)]">
    <span className="text-primary font-arabic absolute inset-0 flex items-center justify-center text-[1.5em] leading-none mb-[0.1em] opacity-90">
      ۝
    </span>
    <span className="text-primary font-bold absolute inset-0 flex items-center justify-center text-[0.45em] pt-[0.2em] font-sans">
      {num.toLocaleString('ar-EG')}
    </span>
  </span>
);

type ComparisonResult = {
  originalWords: string[];
  userWords: string[];
  matches: boolean[];
  score: number;
  transcription: string;
};

export function QuranLearning() {
  const { toast } = useToast();
  const { progress, updateSurahStatus } = useLocalStore();
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahData, setSurahData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recordingAyah, setRecordingAyah] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'error' | 'warmup'>('online');
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [practicePhase, setPracticePhase] = useState<'idle' | 'listening' | 'recording'>('idle');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSurahs().then(setSurahs);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAyahAudio = (ayahNumber: number) => {
    if (playingAyah === ayahNumber) {
      audioRef.current?.pause();
      setPlayingAyah(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const newAudio = new Audio(getAudioUrl(ayahNumber));
    audioRef.current = newAudio;
    newAudio.play();
    setPlayingAyah(ayahNumber);
    newAudio.onended = () => setPlayingAyah(null);
    newAudio.onerror = () => {
      setPlayingAyah(null);
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: "Could not play audio. Please try again."
      });
    };
  };

  const handleSelectSurah = async (num: number) => {
    setLoading(true);
    setSelectedSurah(num);
    try {
      const data = await fetchSurahDetail(num);
      setSurahData(data);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load Surah details. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const targetSampleRate = 16000;
    const offlineCtx = new OfflineAudioContext(
      1,
      audioBuffer.duration * targetSampleRate,
      targetSampleRate
    );
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start();

    const resampled = await offlineCtx.startRendering();

    const numSamples = resampled.length;
    const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(wavBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    const channelData = resampled.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  const startPractice = async (ayah: any) => {
    if (cooldown) return;
    
    // Check microphone permissions first before playing audio
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions to practice."
      });
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingAyah(null);
    }

    setComparisonResult(null);
    setRecordingAyah(ayah.number);
    setPracticePhase('listening');

    const newAudio = new Audio(getAudioUrl(ayah.number));
    audioRef.current = newAudio;
    
    newAudio.play();
    setPlayingAyah(ayah.number);

    newAudio.onended = () => {
      setPlayingAyah(null);
      startRecordingWithStream(stream, ayah);
    };

    newAudio.onerror = () => {
      setPlayingAyah(null);
      setPracticePhase('idle');
      setRecordingAyah(null);
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: "Could not play audio. Please try again."
      });
      // Stop stream tracks if audio failed
      stream.getTracks().forEach(track => track.stop());
    };
  };

  const startRecordingWithStream = (stream: MediaStream, ayah: any) => {
    setPracticePhase('recording');
    audioChunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      processRecitation(ayah, audioBlob);
      setPracticePhase('idle');
    };

    mediaRecorder.start();
    setIsRecording(true);
    setTimer(0);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    } else if (practicePhase === 'listening' && audioRef.current) {
      // User cancelled during listening phase
      audioRef.current.pause();
      setPlayingAyah(null);
      setPracticePhase('idle');
      setRecordingAyah(null);
    }
  };

  const processRecitation = async (ayah: any, audioBlob: Blob) => {
    setComparing(true);
    setApiStatus('online');
    try {
      const wavBlob = await convertToWav(audioBlob);
      const reader = new FileReader();
      reader.readAsDataURL(wavBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        try {
          const result = await transcribeAudio(base64data);

          if (result.error) {
            if (result.error.includes("503")) {
              setApiStatus('warmup');
              toast({
                title: "AI Service Warming Up",
                description: "Please wait 30 seconds and try again.",
              });
            } else {
              setApiStatus('error');
              toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: result.error
              });
            }
            return;
          }

          const transcription = result.text || "";
          const analysis = analyzeRecitation(ayah.text, transcription);
          setComparisonResult(analysis);

          setCooldown(true);
          setTimeout(() => setCooldown(false), 3000);
        } catch (err) {
          console.error(err);
          setApiStatus('error');
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "An unexpected error occurred during transcription."
          });
        } finally {
          setComparing(false);
        }
      };
    } catch (err) {
      console.error(err);
      setComparing(false);
      toast({
        variant: "destructive",
        title: "Process Failed",
        description: "Could not format audio for analysis."
      });
    }
  };

  const analyzeRecitation = (original: string, userRecited: string): ComparisonResult => {
    // Harakat, alif variants, ta marbuta normalize karo
    const normalize = (str: string) => {
      return str
        .replace(/[\u064B-\u065F\u0670]/g, "")
        .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
        .replace(/\u0629/g, "\u0647")
        .replace(/\u0649/g, "\u064A")
        .replace(/\s+/g, " ")
        .trim();
    };

    // Levenshtein distance se similarity nikaalte hain
    const similarity = (a: string, b: string): number => {
      const na = normalize(a);
      const nb = normalize(b);
      if (na === nb) return 1;
      if (na.length === 0 || nb.length === 0) return 0;

      const dp: number[][] = Array.from({ length: na.length + 1 }, (_, i) =>
        Array.from({ length: nb.length + 1 }, (_, j) =>
          i === 0 ? j : j === 0 ? i : 0
        )
      );

      for (let i = 1; i <= na.length; i++) {
        for (let j = 1; j <= nb.length; j++) {
          dp[i][j] = na[i - 1] === nb[j - 1]
            ? dp[i - 1][j - 1]
            : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }

      const dist = dp[na.length][nb.length];
      const maxLen = Math.max(na.length, nb.length);
      return 1 - dist / maxLen;
    };

    const origWords = original.trim().split(/\s+/);
    const userWords = userRecited.trim().split(/\s+/);

    // 65% similarity pe sahi maano — rhythm off ho lekin word sahi ho toh green
    const matches = origWords.map((word, i) => {
      if (i >= userWords.length) return false;
      return similarity(word, userWords[i]) >= 0.65;
    });

    const correctCount = matches.filter(Boolean).length;
    const score = Math.round((correctCount / origWords.length) * 100);

    return {
      originalWords: origWords,
      userWords,
      matches,
      score,
      transcription: userRecited
    };
  };

  const getFeedbackMessage = (score: number) => {
    if (score >= 90) return "ماشاءاللہ! Perfect recitation! 🌟";
    if (score >= 70) return "Very good! Keep practicing! ✨";
    if (score >= 50) return "Good effort! Try again 💪";
    return "Keep going, practice makes perfect! 🤲";
  };

  if (selectedSurah && surahData) {
    const arabic = surahData[0];
    return (
      <div className="flex flex-col h-full bg-background animate-in slide-in-from-bottom duration-500">
        <header className="p-4 border-b border-white/5 flex items-center justify-between gap-3 bg-background/50 backdrop-blur-xl sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/20"
              onClick={() => {
                setSelectedSurah(null);
                if (audioRef.current) {
                  audioRef.current.pause();
                  setPlayingAyah(null);
                }
              }}
            >
              <ChevronLeft className="text-primary" />
            </Button>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-headline font-bold text-foreground text-glow">{arabic.englishName} Learning</h2>
              <select 
                className="bg-background/80 backdrop-blur-md text-primary text-xs font-bold rounded-md px-3 py-1.5 outline-none border border-primary/20 cursor-pointer shadow-[0_0_10px_rgba(201,168,76,0.15)]"
                value={(progress[selectedSurah] as any) === 'Learning' ? 'In Progress' : (progress[selectedSurah] || 'Not Started')}
                onChange={(e) => updateSurahStatus(selectedSurah, e.target.value as any)}
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Bookmarked</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24">
            {apiStatus === 'warmup' && (
              <Alert className="bg-primary/20 border-primary/30 text-primary">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>AI Model Warming Up</AlertTitle>
                <AlertDescription>Please try again in 30 seconds.</AlertDescription>
              </Alert>
            )}

            {apiStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>AI Service Unavailable</AlertTitle>
                <AlertDescription>Please check your connection and try again.</AlertDescription>
              </Alert>
            )}

            {arabic.ayahs.map((ayah: any) => (
              <div
                key={ayah.number}
                className="flex flex-col gap-4 p-5 rounded-[1.5rem] glass-card mb-4 group"
              >
                <div className="ayah-bar relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-3 relative z-10 w-full justify-between">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-[0_0_15px_hsl(var(--primary)/0.5)]">
                      {ayah.numberInSurah}
                    </div>
                    {isRecording && recordingAyah === ayah.number && (
                      <div className="flex items-center gap-2 text-destructive font-mono font-bold animate-pulse absolute left-14">
                        <div className="w-2 h-2 rounded-full bg-destructive" /> {timer}s
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => playAyahAudio(ayah.number)} className="hover:bg-primary/20 text-primary h-9 w-9 rounded-full transition-transform active:scale-95">
                        {playingAyah === ayah.number && practicePhase === 'idle' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-primary/20 text-muted-foreground hover:text-primary h-9 w-9 rounded-full transition-all">
                         <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="arabic-text text-3xl md:text-5xl text-foreground font-arabic leading-[2.6] drop-shadow-sm px-2">
                  {comparisonResult && recordingAyah === ayah.number ? (
                    <div className="flex flex-wrap flex-row-reverse gap-x-3 gap-y-1 justify-start items-center">
                      {comparisonResult.originalWords.map((word, i) => (
                        <span
                          key={i}
                          className={comparisonResult.matches[i] ? 'text-[#4ade80] drop-shadow-[0_0_10px_rgba(74,222,128,0.4)] transition-all' : 'text-[#f87171] drop-shadow-[0_0_10px_rgba(248,113,113,0.4)] transition-all'}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  ) : <>{ayah.text}</>}
                </div>

                <div className="flex flex-wrap items-center mt-2 gap-2 border-t border-border pt-4">
                  {practicePhase === 'idle' ? (
                    <Button
                      onClick={() => startPractice(ayah)}
                      className="gap-2 rounded-full px-5 h-10 shadow-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 transition-all font-bold group-hover:bg-primary group-hover:text-primary-foreground"
                      disabled={comparing || cooldown || playingAyah !== null}
                    >
                      <Mic className="h-4 w-4" /> Try Reciting
                    </Button>
                  ) : (
                    recordingAyah === ayah.number && (
                      practicePhase === 'listening' ? (
                        <Button
                          variant="secondary"
                          onClick={stopRecording}
                          className="gap-2 rounded-full px-6 h-12 shadow-lg animate-pulse"
                        >
                          <Play className="h-4 w-4" /> Listening... (Click to Cancel)
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={stopRecording}
                          className="gap-2 rounded-full px-6 h-12 shadow-lg animate-pulse"
                        >
                          <Square className="h-4 w-4" /> Recording... (Click to Stop)
                        </Button>
                      )
                    )
                  )}

                  {comparing && recordingAyah === ayah.number && (
                    <div className="flex items-center gap-2 text-primary font-bold animate-pulse px-4">
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                    </div>
                  )}
                </div>

                {comparisonResult && recordingAyah === ayah.number && (
                  <div className="mt-4 p-5 rounded-xl bg-primary/10 border border-primary/30 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-primary h-6 w-6" />
                      <span className="font-bold text-2xl text-primary">{comparisonResult.score}%</span>
                      <span className="text-sm font-semibold ml-2">{getFeedbackMessage(comparisonResult.score)}</span>
                    </div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">AI Transcription</div>
                    <p className="text-sm text-foreground/80 arabic-text text-right" dir="rtl">
                      {comparisonResult.transcription || "..."}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24">
      <header className="flex flex-col gap-1 py-4">
        <h2 className="text-3xl font-headline font-bold text-primary">Quran Learning</h2>
        <p className="text-muted-foreground">Master Tajweed with AI-powered feedback</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {surahs.map(s => (
          <Card
            key={s.number}
            className="glass-card cursor-pointer"
            onClick={() => handleSelectSurah(s.number)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {s.number}
                </div>
                <span className="font-bold">{s.englishName}</span>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="arabic-text text-primary text-lg">{s.name}</span>
                {progress[s.number] === 'Completed' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                {((progress[s.number] as any) === 'In Progress' || (progress[s.number] as any) === 'Learning') && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">IN PROGRESS</span>}
                {progress[s.number] === 'Bookmarked' && <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-bold">BOOKMARKED</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
