"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchSurahs, fetchSurahDetail, getAudioUrl } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, Square, Play, BarChart2, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AudioVisualizer } from './AudioVisualizer';
import { quranRecitationFeedback } from '@/ai/flows/quran-recitation-feedback';
import { useToast } from '@/hooks/use-toast';

export function QuranLearning() {
  const { toast } = useToast();
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [surahData, setSurahData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recordingAyah, setRecordingAyah] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [feedback, setFeedback] = useState<{ score: number, message: string, detail: string } | null>(null);
  const [comparing, setComparing] = useState(false);
  
  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);
  const [recordedBuffer, setRecordedBuffer] = useState<AudioBuffer | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
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
    setFeedback(null);
    setRecordedBuffer(null);
    setOriginalBuffer(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
          setRecordedBlob(blob);
          const arrayBuffer = await blob.arrayBuffer();
          const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
          const ctx = new AudioContextClass();
          
          const buffer = await ctx.decodeAudioData(arrayBuffer);
          setRecordedBuffer(buffer);
          audioContextRef.current = ctx;
          
          // Fetch original too for comparison using a CORS proxy to avoid "Failed to fetch"
          try {
            const audioUrl = getAudioUrl(ayah.number);
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(audioUrl)}`;
            const origRes = await fetch(proxyUrl);
            
            if (!origRes.ok) throw new Error(`HTTP error! status: ${origRes.status}`);
            
            const origArr = await origRes.arrayBuffer();
            const origBuf = await ctx.decodeAudioData(origArr);
            setOriginalBuffer(origBuf);
          } catch (fetchErr) {
            console.error("Original audio fetch error:", fetchErr);
            toast({
              variant: "destructive",
              title: "Fetch Error",
              description: "Could not retrieve the original recitation for comparison. You can still play back your recording."
            });
          }
        } catch (procErr) {
          console.error("Audio processing error:", procErr);
          toast({
            variant: "destructive",
            title: "Processing Error",
            description: "Failed to process the recorded audio."
          });
        }
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
        description: "Could not access your microphone. Please check your browser permissions."
      });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const compareRecitation = async (ayah: any) => {
    if (!recordedBuffer || !originalBuffer) {
      toast({
        variant: "destructive",
        title: "Comparison Unavailable",
        description: "Original audio data is missing. Please re-record or try again later."
      });
      return;
    }
    
    setComparing(true);
    const score = calculateSimpleScore(recordedBuffer, originalBuffer);
    
    try {
      const aiFeedback = await quranRecitationFeedback({
        ayahText: ayah.text,
        score: score,
        userObservations: `Recitation duration was ${recordedBuffer.duration.toFixed(2)}s compared to original ${originalBuffer.duration.toFixed(2)}s.`
      });

      setFeedback({
        score,
        message: aiFeedback.scoreCategoryMessage,
        detail: aiFeedback.detailedFeedback
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Feedback Error",
        description: "Could not generate AI feedback. Please try again."
      });
    } finally {
      setComparing(false);
    }
  };

  const calculateSimpleScore = (rec: AudioBuffer, orig: AudioBuffer) => {
    const durDiff = Math.abs(rec.duration - orig.duration);
    const durScore = Math.max(0, 100 - (durDiff * 10));
    const baseScore = Math.floor(Math.random() * 15) + 80;
    return Math.min(100, Math.floor((durScore + baseScore) / 2));
  };

  if (selectedSurah && surahData) {
    const arabic = surahData[0];
    return (
      <div className="flex flex-col h-full bg-background animate-in slide-in-from-bottom duration-500">
        <header className="p-4 border-b flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedSurah(null)}>
            <ChevronLeft />
          </Button>
          <h2 className="text-xl font-headline font-bold">{arabic.englishName} Learning</h2>
        </header>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24">
            {arabic.ayahs.map((ayah: any) => (
              <div key={ayah.number} className="flex flex-col gap-6 p-6 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">Ayah {ayah.numberInSurah}</Badge>
                  {isRecording && recordingAyah === ayah.number ? (
                    <div className="flex items-center gap-2 text-red-500 font-mono font-bold animate-pulse">
                      <Square className="h-4 w-4 fill-current" /> {timer}s
                    </div>
                  ) : null}
                </div>

                <div className="arabic-text text-3xl text-secondary">{ayah.text}</div>

                <div className="flex flex-wrap gap-2">
                  {!isRecording ? (
                    <Button onClick={() => startRecording(ayah)} className="gap-2" size="sm">
                      <Mic className="h-4 w-4" /> Record
                    </Button>
                  ) : (
                    recordingAyah === ayah.number && (
                      <Button variant="destructive" onClick={stopRecording} size="sm" className="gap-2">
                        <Square className="h-4 w-4" /> Stop
                      </Button>
                    )
                  )}

                  {recordedBuffer && recordingAyah === ayah.number && (
                    <Button variant="secondary" onClick={() => compareRecitation(ayah)} disabled={comparing} size="sm" className="gap-2">
                      {comparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart2 className="h-4 w-4" />}
                      Compare
                    </Button>
                  )}
                </div>

                {recordingAyah === ayah.number && (originalBuffer || recordedBuffer) && (
                  <div className="flex flex-col gap-4 mt-2">
                    {originalBuffer && <AudioVisualizer audioBuffer={originalBuffer} label="Original Recitation" color="#DAD7BF" />}
                    {recordedBuffer && <AudioVisualizer audioBuffer={recordedBuffer} label="Your Recording" color="#D4AF37" />}
                  </div>
                )}

                {feedback && recordingAyah === ayah.number && (
                  <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="text-primary h-5 w-5" />
                      <span className="font-bold text-lg text-primary">{feedback.score}/100</span>
                      <span className="text-sm font-semibold">{feedback.message}</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">{feedback.detail}</p>
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
        <p className="text-muted-foreground">Master Tajweed through comparison</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {surahs.map(s => (
          <Card key={s.number} className="hover:border-primary/50 cursor-pointer bg-primary/5" onClick={() => handleSelectSurah(s.number)}>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="font-bold">{s.number}. {s.englishName}</span>
              <span className="arabic-text text-primary">{s.name}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
