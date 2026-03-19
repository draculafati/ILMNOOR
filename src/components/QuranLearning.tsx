"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahs, fetchSurahDetail } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, Square, Loader2, Sparkles, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { transcribeAudio } from '@/app/actions/transcribe';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type ComparisonResult = {
  originalWords: string[];
  userWords: string[];
  matches: boolean[];
  score: number;
  transcription: string;
};

export function QuranLearning() {
  const { toast } = useToast();
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    fetchSurahs().then(setSurahs);
  }, []);

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
    
    // Convert to WAV
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
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * 2, true);
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
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

  const startRecording = async (ayah: any) => {
    if (cooldown) return;
    
    setComparisonResult(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingAyah(ayah.number);
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
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
                description: "The AI model is booting up. Please wait 30 seconds and try again.",
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
    const normalize = (str: string) => {
      return str.replace(/[\u064B-\u065F]/g, "").replace(/\s+/g, " ").trim();
    };

    const origWords = original.trim().split(/\s+/);
    const userWords = userRecited.trim().split(/\s+/);
    
    const matches = origWords.map((word, i) => {
      if (i >= userWords.length) return false;
      return normalize(word) === normalize(userWords[i]);
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
        <header className="p-4 border-b flex items-center gap-3 bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <Button variant="ghost" size="icon" onClick={() => setSelectedSurah(null)}>
            <ChevronLeft />
          </Button>
          <h2 className="text-xl font-headline font-bold">{arabic.englishName} Learning</h2>
        </header>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24">
            {apiStatus === 'warmup' && (
              <Alert className="bg-primary/20 border-primary/30 text-primary">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>AI Model Warming Up</AlertTitle>
                <AlertDescription>
                  The Tarteel AI model is currently initializing on Hugging Face. This can take about 30-60 seconds after a period of inactivity. Please try again shortly.
                </AlertDescription>
              </Alert>
            )}

            {apiStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>AI Service Unavailable</AlertTitle>
                <AlertDescription>
                  The transcription service is currently down or experiencing an error. Please check your internet connection or try again later.
                </AlertDescription>
              </Alert>
            )}

            {arabic.ayahs.map((ayah: any) => (
              <div key={ayah.number} className="flex flex-col gap-6 p-6 rounded-2xl border border-primary/20 bg-primary/5 transition-all hover:border-primary/40">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">Ayah {ayah.numberInSurah}</Badge>
                  {isRecording && recordingAyah === ayah.number ? (
                    <div className="flex items-center gap-2 text-red-500 font-mono font-bold animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-red-500" /> {timer}s
                    </div>
                  ) : null}
                </div>

                <div className="arabic-text text-4xl text-secondary leading-[1.8] tracking-wide">
                  {comparisonResult && recordingAyah === ayah.number ? (
                    <div className="flex flex-wrap flex-row-reverse gap-x-2 justify-start">
                      {comparisonResult.originalWords.map((word, i) => (
                        <span 
                          key={i} 
                          className={comparisonResult.matches[i] ? 'text-green-500' : 'text-red-400'}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  ) : ayah.text}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!isRecording ? (
                    <Button 
                      onClick={() => startRecording(ayah)} 
                      className="gap-2 rounded-full px-6 h-12 shadow-lg" 
                      disabled={comparing || cooldown}
                    >
                      <Mic className="h-4 w-4" /> Record Recitation
                    </Button>
                  ) : (
                    recordingAyah === ayah.number && (
                      <Button variant="destructive" onClick={stopRecording} className="gap-2 rounded-full px-6 h-12 shadow-lg">
                        <Square className="h-4 w-4" /> Stop Recording
                      </Button>
                    )
                  )}
                  {comparing && recordingAyah === ayah.number && (
                    <div className="flex items-center gap-2 text-primary font-bold animate-pulse px-4">
                      <Loader2 className="h-4 w-4 animate-spin" /> Tarteel AI Analyzing...
                    </div>
                  )}
                </div>

                {comparisonResult && recordingAyah === ayah.number && (
                  <div className="mt-4 p-5 rounded-xl bg-primary/10 border border-primary/30 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-primary h-6 w-6" />
                        <span className="font-bold text-2xl text-primary">{comparisonResult.score}%</span>
                        <span className="text-sm font-semibold ml-2">{getFeedbackMessage(comparisonResult.score)}</span>
                      </div>
                    </div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">AI Transcription</div>
                    <p className="text-sm text-foreground/80 arabic-text text-right" dir="rtl">{comparisonResult.transcription || "..."}</p>
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
          <Card key={s.number} className="group hover:border-primary/50 cursor-pointer bg-primary/5 transition-all" onClick={() => handleSelectSurah(s.number)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {s.number}
                </div>
                <span className="font-bold">{s.englishName}</span>
              </div>
              <span className="arabic-text text-primary text-lg">{s.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
