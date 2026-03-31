"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Lightbulb } from 'lucide-react';

const qaidaAlphabet = [
  { id: 1, char: 'ا', name: 'Alif' },
  { id: 2, char: 'ب', name: 'Baa' },
  { id: 3, char: 'ت', name: 'Taa' },
  { id: 4, char: 'ث', name: 'Thaa' },
  { id: 5, char: 'ج', name: 'Jeem' },
  { id: 6, char: 'ح', name: 'Haa' },
  { id: 7, char: 'خ', name: 'Khaa' },
  { id: 8, char: 'د', name: 'Daal' },
  { id: 9, char: 'ذ', name: 'Dhaal' },
  { id: 10, char: 'ر', name: 'Raa' },
  { id: 11, char: 'ز', name: 'Zaa' },
  { id: 12, char: 'س', name: 'Seen' },
  { id: 13, char: 'ش', name: 'Sheen' },
  { id: 14, char: 'ص', name: 'Saad' },
  { id: 15, char: 'ض', name: 'Daad' },
  { id: 16, char: 'ط', name: 'Taa' },
  { id: 17, char: 'ظ', name: 'Zaa' },
  { id: 18, char: 'ع', name: 'Ayn' },
  { id: 19, char: 'غ', name: 'Ghayn' },
  { id: 20, char: 'ف', name: 'Faa' },
  { id: 21, char: 'ق', name: 'Qaaf' },
  { id: 22, char: 'ك', name: 'Kaaf' },
  { id: 23, char: 'ل', name: 'Laam' },
  { id: 24, char: 'م', name: 'Meem' },
  { id: 25, char: 'ن', name: 'Noon' },
  { id: 26, char: 'ه', name: 'Haa' },
  { id: 27, char: 'و', name: 'Waw' },
  { id: 28, char: 'ي', name: 'Yaa' },
];

export function NooraniQaida() {

  const groups = [
    { title: "Alif to Khaa", items: qaidaAlphabet.slice(0, 7) },
    { title: "Daal to Daad", items: qaidaAlphabet.slice(7, 15) },
    { title: "Taa to Meem", items: qaidaAlphabet.slice(15, 24) },
    { title: "Noon to Yaa", items: qaidaAlphabet.slice(24, 28) },
  ];

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right duration-300">
      <header className="sticky top-0 z-10 p-4 bg-background/50 backdrop-blur-xl border-b border-white/5 flex flex-col gap-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-headline font-bold text-primary">Noorani Qaida</h2>
            <p className="text-muted-foreground text-sm tracking-wide">Learn the Arabic Alphabet</p>
          </div>
          <Button 
            onClick={() => document.getElementById('curriculum-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="gap-2 rounded-full px-6 shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-all font-bold bg-gradient-to-r from-primary to-[hsl(var(--primary)/0.8)] text-primary-foreground hover:opacity-90"
          >
            <BookOpen className="h-4 w-4" /> Curriculum
          </Button>
        </div>
      </header>
      
      <div className="flex-1 p-4 pb-32 max-w-4xl mx-auto w-full overflow-y-auto hidden-scrollbar">
        <div className="glass-card mb-8 p-6 rounded-2xl flex flex-col gap-3">
          <h3 className="text-lg font-bold text-foreground">Beginner's Guide</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Welcome to your Noorani Qaida journey. Start by familiarizing yourself with the Arabic Alphabet. Remember that Arabic is read from right to left.</p>
        </div>

        {groups.map((group, idx) => (
          <div key={idx} className="mb-8 block">
            <h3 className="text-xs uppercase tracking-widest font-bold text-secondary mb-4 flex items-center gap-2 border-b border-white/5 pb-2 rtl:text-right">
              {group.title}
            </h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3" dir="rtl">
              {group.items.map((letter) => {
                return (
                  <Card 
                    key={letter.id} 
                    className="glass-card transition-all duration-300 relative overflow-hidden group border-primary/20 hover:scale-105 hover:border-primary/50 hover:bg-primary/5"
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center min-h-[100px] h-full gap-2 relative z-10 w-full">
                      <div className="text-5xl font-arabic text-foreground group-hover:text-primary transition-colors drop-shadow-sm leading-none">
                        {letter.char}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                        {letter.name}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        <div id="curriculum-section" className="mt-12 pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Next Steps Curriculum</h3>
              <p className="text-sm text-muted-foreground">What a beginner should learn next</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: '1. Compound Letters (Murakkabat)', desc: 'Learn how letters change shape when joined together to form words.' },
              { title: '2. Short Vowels (Harakaat)', desc: 'Fatha, Kasra, and Damma - the fundamental movements in Arabic.' },
              { title: '3. Nunnation (Tanween)', desc: 'Double vowels creating the "nn" sound at the end of words.' },
              { title: '4. Standing Vowels', desc: 'Vertical signs that act as short elongations (Khari Harakaat).' },
              { title: '5. Maddah & Leen Letters', desc: 'Rules for elongating sounds and the soft, gentle letter transitions.' },
              { title: '6. Sukoon (Jazm)', desc: 'Silent letters and the rules for joining a letter to the one before it.' },
              { title: '7. Tashdeed', desc: 'The doubling sign requiring emphasis on a single letter.' },
              { title: '8. Tajweed Fundamentals', desc: 'Rules of Noon Sakin, Meem Sakin, and proper stopping (Waqf).' }
            ].map((step, i) => (
              <div key={i} className="glass-card p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-colors flex gap-4 items-start">
                <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
