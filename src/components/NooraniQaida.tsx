"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

// ── Correct Noorani Qaida alphabet with all 4 forms ───────────────────────────
// Actual Noorani Qaida order as taught by Sheikh Noor Muhammad Haqqani
// Includes: isolated, initial (بـ), medial (ـبـ), final (ـب) forms + makharij

const ALPHABET = [
  { id:1,  iso:'ا', ini:'ا',  med:'ـا', fin:'ـا', name:'Alif',  sound:'aa',  makhraj:'Throat (deep)' },
  { id:2,  iso:'ب', ini:'بـ', med:'ـبـ',fin:'ـب', name:'Baa',   sound:'b',   makhraj:'Lips (together)' },
  { id:3,  iso:'ت', ini:'تـ', med:'ـتـ',fin:'ـت', name:'Taa',   sound:'t',   makhraj:'Tongue tip + upper teeth' },
  { id:4,  iso:'ث', ini:'ثـ', med:'ـثـ',fin:'ـث', name:'Thaa',  sound:'th',  makhraj:'Tongue tip between teeth' },
  { id:5,  iso:'ج', ini:'جـ', med:'ـجـ',fin:'ـج', name:'Jeem',  sound:'j',   makhraj:'Middle of tongue + palate' },
  { id:6,  iso:'ح', ini:'حـ', med:'ـحـ',fin:'ـح', name:'Haa',   sound:'h',   makhraj:'Middle of throat' },
  { id:7,  iso:'خ', ini:'خـ', med:'ـخـ',fin:'ـخ', name:'Khaa',  sound:'kh',  makhraj:'Top of throat' },
  { id:8,  iso:'د', ini:'د',  med:'ـد', fin:'ـد', name:'Daal',  sound:'d',   makhraj:'Tongue tip + gum of upper teeth' },
  { id:9,  iso:'ذ', ini:'ذ',  med:'ـذ', fin:'ـذ', name:'Dhaal', sound:'dh',  makhraj:'Tongue tip between teeth' },
  { id:10, iso:'ر', ini:'ر',  med:'ـر', fin:'ـر', name:'Raa',   sound:'r',   makhraj:'Tongue tip (curled up)' },
  { id:11, iso:'ز', ini:'ز',  med:'ـز', fin:'ـز', name:'Zaa',   sound:'z',   makhraj:'Tongue tip between teeth' },
  { id:12, iso:'س', ini:'سـ', med:'ـسـ',fin:'ـس', name:'Seen',  sound:'s',   makhraj:'Tongue tip + lower teeth' },
  { id:13, iso:'ش', ini:'شـ', med:'ـشـ',fin:'ـش', name:'Sheen', sound:'sh',  makhraj:'Middle of tongue + palate' },
  { id:14, iso:'ص', ini:'صـ', med:'ـصـ',fin:'ـص', name:'Saad',  sound:'s*',  makhraj:'Tongue tip + teeth (heavy)' },
  { id:15, iso:'ض', ini:'ضـ', med:'ـضـ',fin:'ـض', name:'Daad',  sound:'d*',  makhraj:'Side of tongue + molars' },
  { id:16, iso:'ط', ini:'طـ', med:'ـطـ',fin:'ـط', name:'Taa',   sound:'t*',  makhraj:'Tongue tip (heavy)' },
  { id:17, iso:'ظ', ini:'ظـ', med:'ـظـ',fin:'ـظ', name:'Dhaa',  sound:'dh*', makhraj:'Tongue tip between teeth (heavy)' },
  { id:18, iso:'ع', ini:'عـ', med:'ـعـ',fin:'ـع', name:'Ayn',   sound:"'a",  makhraj:'Deep throat (compressed)' },
  { id:19, iso:'غ', ini:'غـ', med:'ـغـ',fin:'ـغ', name:'Ghayn', sound:'gh',  makhraj:'Top of throat' },
  { id:20, iso:'ف', ini:'فـ', med:'ـفـ',fin:'ـف', name:'Faa',   sound:'f',   makhraj:'Upper teeth + lower lip' },
  { id:21, iso:'ق', ini:'قـ', med:'ـقـ',fin:'ـق', name:'Qaaf',  sound:'q',   makhraj:'Back of tongue + soft palate' },
  { id:22, iso:'ك', ini:'كـ', med:'ـكـ',fin:'ـك', name:'Kaaf',  sound:'k',   makhraj:'Back of tongue + hard palate' },
  { id:23, iso:'ل', ini:'لـ', med:'ـلـ',fin:'ـل', name:'Laam',  sound:'l',   makhraj:'Tongue edge + gum' },
  { id:24, iso:'م', ini:'مـ', med:'ـمـ',fin:'ـم', name:'Meem',  sound:'m',   makhraj:'Lips (closed)' },
  { id:25, iso:'ن', ini:'نـ', med:'ـنـ',fin:'ـن', name:'Noon',  sound:'n',   makhraj:'Tongue tip + gum (nasal)' },
  { id:26, iso:'و', ini:'و',  med:'ـو', fin:'ـو', name:'Waaw',  sound:'w/oo',makhraj:'Lips (rounded)' },
  { id:27, iso:'ه', ini:'هـ', med:'ـهـ',fin:'ـه', name:'Haa',   sound:'h',   makhraj:'Chest / lungs' },
  { id:28, iso:'ء', ini:'ء',  med:'ء',  fin:'ء',  name:"Hamza", sound:"'",   makhraj:'Throat (glottal stop)' },
  { id:29, iso:'ي', ini:'يـ', med:'ـيـ',fin:'ـي', name:'Yaa',   sound:'y/ee',makhraj:'Middle of tongue + palate' },
];

// Correct Noorani Qaida grouping — as in the actual book
const GROUPS = [
  { title: 'Alif to Khaa',  subtitle:'أ — خ', range:[0,6],   color:'from-emerald-500/20 to-emerald-500/5', border:'border-emerald-500/30' },
  { title: 'Daal to Zaa',   subtitle:'د — ز', range:[7,10],  color:'from-blue-500/20 to-blue-500/5',    border:'border-blue-500/30' },
  { title: 'Seen to Daad',  subtitle:'س — ض', range:[11,14], color:'from-purple-500/20 to-purple-500/5', border:'border-purple-500/30' },
  { title: 'Taa to Ghayn', subtitle:'ط — غ', range:[15,18], color:'from-amber-500/20 to-amber-500/5',  border:'border-amber-500/30' },
  { title: 'Faa to Laam',   subtitle:'ف — ل', range:[19,22], color:'from-rose-500/20 to-rose-500/5',   border:'border-rose-500/30' },
  { title: 'Meem to Yaa',   subtitle:'م — ي', range:[23,27], color:'from-cyan-500/20 to-cyan-500/5',   border:'border-cyan-500/30' },
  { title: 'Hamza & Laam-Alif', subtitle:'ء — لا', range:[28,29], color:'from-orange-500/20 to-orange-500/5', border:'border-orange-500/30' },
];

const HARAKAT = [
  { symbol:'بَ', name:'Fatha',   sound:'ba',  desc:'Short "a" vowel — small diagonal line above the letter' },
  { symbol:'بِ', name:'Kasra',   sound:'bi',  desc:'Short "i" vowel — small diagonal line below the letter' },
  { symbol:'بُ', name:'Damma',   sound:'bu',  desc:'Short "u" vowel — small loop above the letter' },
  { symbol:'بْ', name:'Sukoon',  sound:'b',   desc:'No vowel — small circle above means the letter is silent/closed' },
  { symbol:'بَّ', name:'Shaddah', sound:'bb',  desc:'Double/stress — the letter is pronounced twice (heavy)' },
  { symbol:'بً', name:'Tanween Fath', sound:'ban', desc:'Double fatha — adds "n" sound at end of word' },
  { symbol:'بٍ', name:'Tanween Kasr', sound:'bin', desc:'Double kasra — adds "n" sound at end of word' },
  { symbol:'بٌ', name:'Tanween Damm', sound:'bun', desc:'Double damma — adds "n" sound at end of word' },
];

// ── Letter Card ────────────────────────────────────────────────────────────────
function LetterCard({ letter, showForms }: { letter: typeof ALPHABET[0]; showForms: boolean }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <Card
      onClick={() => setFlipped(f => !f)}
      className="glass-card cursor-pointer hover:border-primary/50 hover:scale-105 transition-all duration-200 border-primary/20"
    >
      <CardContent className="p-3 flex flex-col items-center justify-center min-h-[110px] gap-1.5 relative">
        {!flipped ? (
          <>
            <div className="text-4xl sm:text-5xl font-arabic text-foreground leading-none">{letter.iso}</div>
            <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{letter.name}</div>
            <div className="text-[9px] text-primary/70 font-mono">/{letter.sound}/</div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 w-full">
            {showForms && (
              <div className="grid grid-cols-4 gap-0.5 w-full text-center mb-1">
                {[
                  { label:'ISO', val: letter.iso },
                  { label:'INI', val: letter.ini },
                  { label:'MED', val: letter.med },
                  { label:'FIN', val: letter.fin },
                ].map(f => (
                  <div key={f.label} className="flex flex-col items-center">
                    <span className="text-lg font-arabic text-primary leading-none">{f.val}</span>
                    <span className="text-[7px] text-muted-foreground uppercase">{f.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="text-[9px] text-center text-muted-foreground leading-tight px-1">{letter.makhraj}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function NooraniQaida() {
  const [activeTab, setActiveTab]   = useState<'alphabet'|'harakat'|'curriculum'>('alphabet');
  const [showForms, setShowForms]   = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-background animate-in fade-in duration-300">
      <header className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-xl border-b border-primary/10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary">Noorani Qaida</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Arabic Alphabet — Sheikh Noor Muhammad Haqqani</p>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-primary/5 border border-primary/10 mt-3">
            {(['alphabet','harakat','curriculum'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                }`}>
                {tab === 'alphabet' ? '🔤 Alphabet' : tab === 'harakat' ? '✦ Harakat' : '📚 Curriculum'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 pb-32 max-w-4xl mx-auto w-full overflow-y-auto">

        {/* ── ALPHABET TAB ──────────────────────────────────────────────── */}
        {activeTab === 'alphabet' && (
          <div className="flex flex-col gap-5">
            {/* Show forms toggle */}
            <div className="flex items-center justify-between glass-card p-3 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-foreground">Show Letter Forms</p>
                <p className="text-xs text-muted-foreground">Tap any card to flip — see Isolated/Initial/Medial/Final</p>
              </div>
              <button
                onClick={() => setShowForms(f => !f)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  showForms ? 'bg-primary text-primary-foreground border-primary' : 'border-primary/30 text-primary'
                }`}
              >
                {showForms ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Groups */}
            {GROUPS.map((group, gi) => {
              const letters = ALPHABET.slice(group.range[0], group.range[1] + 1);
              const isExpanded = expandedGroup === gi || expandedGroup === null;
              return (
                <div key={gi} className={`rounded-2xl border bg-gradient-to-br ${group.color} ${group.border} overflow-hidden`}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3"
                    onClick={() => setExpandedGroup(expandedGroup === gi ? null : gi)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-arabic text-xl text-primary">{group.subtitle}</span>
                      <span className="text-sm font-bold text-foreground">{group.title}</span>
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{letters.length} letters</span>
                    </div>
                    {expandedGroup === gi
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    }
                  </button>
                  {(expandedGroup === gi || expandedGroup === null) && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2" dir="rtl">
                        {letters.map(letter => (
                          <LetterCard key={letter.id} letter={letter} showForms={showForms} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <p className="text-[11px] text-muted-foreground text-center pb-2">
              💡 Tap any letter card to see its 4 forms + Makhraj (articulation point)
            </p>
          </div>
        )}

        {/* ── HARAKAT TAB ───────────────────────────────────────────────── */}
        {activeTab === 'harakat' && (
          <div className="flex flex-col gap-4">
            <div className="glass-card p-4 rounded-xl">
              <h3 className="font-bold text-foreground mb-1">Short Vowels (Harakat)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Harakat are the vowel marks placed on Arabic letters to show how they are pronounced. Without them, the letter is like a consonant with no vowel sound.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HARAKAT.map((h, i) => (
                <Card key={i} className="glass-card border-primary/15 hover:border-primary/40 transition-all">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="text-4xl font-arabic text-primary leading-none shrink-0 mt-1">{h.symbol}</div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground text-sm">{h.name}</p>
                      <p className="text-xs text-primary font-mono mb-1">/{h.sound}/</p>
                      <p className="text-xs text-muted-foreground leading-snug">{h.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── CURRICULUM TAB ────────────────────────────────────────────── */}
        {activeTab === 'curriculum' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 glass-card p-4 rounded-xl">
              <Lightbulb className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h3 className="font-bold text-foreground">Noorani Qaida — Full Syllabus</h3>
                <p className="text-xs text-muted-foreground">Step by step as per the original book</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { n:1,  title:'Arabic Alphabet (Huroof Mufridaat)', desc:'Learn all 28 isolated letters with correct pronunciation and Makhraj.' },
                { n:2,  title:'Compound Letters (Murakkabat)', desc:'How letters change shape when joined — initial, medial, final forms.' },
                { n:3,  title:'Similar-Looking Letters (Mutashabihat)', desc:'Distinguish ب ت ث / س ش / ص ض etc. by their dots.' },
                { n:4,  title:'Short Vowels (Harakat)', desc:'Fatha (a), Kasra (i), Damma (u) — the three fundamental movements.' },
                { n:5,  title:'Tanween (Nunnation)', desc:'Double vowels — Tanween Fath, Kasr, Damm — adding "n" sound.' },
                { n:6,  title:'Standing & Lying Vowels (Khari Harakat)', desc:'Vertical/horizontal alif, waw, yaa as long vowel markers.' },
                { n:7,  title:'Madd Letters (Prolongation)', desc:'Alif Madd (آ), Waw Madd, Yaa Madd — elongate sound to 2 counts.' },
                { n:8,  title:'Huroof e Leen (Soft Letters)', desc:'و ي with sukoon preceded by fatha — soft gentle sounds.' },
                { n:9,  title:'Sukoon (Jazm)', desc:'Silent/closed consonant — no vowel, stop the sound.' },
                { n:10, title:'Shaddah (Tashdeed)', desc:'Doubling sign — pronounce the letter twice with stress.' },
                { n:11, title:'Laam — Sun & Moon Letters', desc:'Laam Shamsiyah (assimilated) vs Laam Qamariyah (clear) in Al.' },
                { n:12, title:'Qalqalah Letters', desc:'ق ط ب ج د — bouncing echo sound when they have sukoon.' },
                { n:13, title:'Tajweed — Noon & Meem Rules', desc:'Idgham, Ikhfaa, Iqlaab, Izhar — rules for Noon/Meem Sakin.' },
                { n:14, title:'Waqf — Stopping Rules', desc:'How and where to stop during recitation (ج م لا ط ص etc.).' },
              ].map(step => (
                <div key={step.n} className="glass-card p-4 rounded-xl border border-primary/10 hover:border-primary/30 transition-all flex gap-3 items-start">
                  <div className="bg-primary/15 text-primary w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {step.n}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm mb-0.5">{step.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
