"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahs, fetchSurahDetail } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, Square, Loader2, Sparkles, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLocalStore } from '@/lib/store';
import { bufferToWav, getLevenshteinDistance } from '@/lib/audio-utils';

type ComparisonResult = {
  originalWords: string[];
  userWords: string[];
  matches: boolean[];
  score: number;
  transcription: string;
};

export function QuranLearning() {
  const { toast } = useToast();
  const { settings } = useLocalStore();
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

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);
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

  const startRecording = async (ayah: any) => {
    if (cooldown) return;
    if (!settings.hfToken) {
      toast({
        variant: "destructive",
        title: "Configuration Required",
        description: "Please add your Hugging Face token in Settings to use advanced analysis."
      });
      return;
    }

    setComparisonResult(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        audioChunksRef.current.push(new Float32Array(inputData));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

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

  const stopRecording = (ayah: any) => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    processRecitation(ayah);
  };

  const processRecitation = async (ayah: any) => {
    if (!audioContextRef.current) return;

    setComparing(true);
    try {
      // Flatten chunks
      const totalLength = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
      const resultBuffer = audioContextRef.current.createBuffer(1, totalLength, 16000);
      let offset = 0;
      audioChunksRef.current.forEach(chunk => {
        resultBuffer.getChannelData(0).set(chunk, offset);
        offset += chunk.length;
      });

      const wavBlob = bufferToWav(resultBuffer);
      
      const response = await fetch("https://api-inference.huggingface.co/models/tarteel-ai/whisper-base-ar-quran", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${settings.hfToken}`,
          "Content-Type": "audio/wav"
        },
        body: wavBlob
      });

      if (response.status === 503) {
        toast({
          title: "Model Warming Up",
          description: "AI model is warming up, please wait 20 seconds and try again."
        });
        throw new Error("Model loading");
      }

      if (!response.ok) throw new Error("API call failed");

      const data = await response.json();
      const transcription = data.text || "";
      
      const analysis = analyzeRecitation(ayah.text, transcription);
      setComparisonResult(analysis);

      // Start cooldown
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);

    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err instanceof Error && err.message === "Model loading" 
          ? "AI model is warming up. Please try again in a few seconds." 
          : "Basic comparison mode — check token in Settings."
      });
    } finally {
      setComparing(false);
    }
  };

  const analyzeRecitation = (original: string, userRecited: string): ComparisonResult => {
    const origWords = original.trim().split(/\s+/);
    const userWords = userRecited.trim().split(/\s+/);
    
    // Simple matching for highlighting
    const matches = origWords.map((word, i) => {
      if (i >= userWords.length) return false;
      // Rough match (ignoring small differences in pronunciation markers if any)
      return userWords[i].includes(word) || word.includes(userWords[i]);
    });

    const editDistance = getLevenshteinDistance(original, userRecited);
    const score = Math.max(0, Math.min(100, Math.round((1 - editDistance / original.length) * 100)));

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
            {!settings.hfToken && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex gap-3 items-center">
                <AlertCircle className="text-destructive h-5 w-5 shrink-0" />
                <p className="text-sm text-destructive-foreground">
                  Hugging Face token missing. Please visit <b>Settings</b> to enable advanced AI analysis.
                </p>
              </div>
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
                      <Button variant="destructive" onClick={() => stopRecording(ayah)} className="gap-2 rounded-full px-6 h-12 shadow-lg">
                        <Square className="h-4 w-4" /> Stop Recording
                      </Button>
                    )
                  )}
                  {comparing && recordingAyah === ayah.number && (
                    <div className="flex items-center gap-2 text-primary font-bold animate-pulse px-4">
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your Tajweed...
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
        
        <div className="p-3 bg-secondary/10 border-t flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest justify-center">
          <Info className="h-3 w-3" /> Hugging Face Whisper-Base-AR-Quran
        </div>
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
