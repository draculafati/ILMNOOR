"use client";

import React, { useState, useEffect } from 'react';
import { useLocalStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Trash2, Star, Edit2, Check, PenTool, BookOpen, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// ─── Preloaded Duas Data ───────────────────────────────────────────────────────
const PRELOADED_DUAS: any[] = [
  { id: 'p1', category: 'Daily Routine', title: 'Upon Going to Sleep', arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا', transliteration: 'Allahumma bismika amutu wa ahya.', translation: 'O Allah, in Your name I die and I live.', reference: 'Sahih Muslim 4/2083' },
  { id: 'p2', category: 'Daily Routine', title: 'Wake Up from Sleep', arabic: 'الْحَمْدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', transliteration: 'Alhamdu lillahil-ladhee ahyana ba\'da ma amatana wa-ilayhin-nushoor.', translation: 'All praise be to Allah, who gave us life after death (sleep is a form of death) and to Him will we be raised and returned.', reference: 'Sahih Muslim 4/2083' },
  { id: 'p3', category: 'Daily Routine', title: 'Entering the Toilet', arabic: 'بِسْمِ اللَّهِ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ', transliteration: 'Bismillaah. Allahumma innee a\'oothu bika minal-khubthi wal-khabaa\'ith.', translation: 'In the name of Allah. O Allah I seek refuge in You from the male female evil and Jinns.', reference: 'Al Bukhari 1/45 | Sahih Muslim 1/283' },
  { id: 'p4', category: 'Daily Routine', title: 'Leaving the Toilet', arabic: 'غُفْرَانَكَ. الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانِي', transliteration: 'Ghufraanak. Alhamdu lillaahil-ladhee adh-haba \'annil-athaa wa\'aafaanee.', translation: 'O Allah, I seek forgiveness and pardon from You. All Praise be to Allah, who removed the difficulty from me and gave me ease (relief).', reference: 'Abu Dawood | Ibn Majah | At-Tirmidhi' },
  { id: 'p5', category: 'Wudu & Prayer', title: 'Start of Wudu', arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', transliteration: 'Bismillahir-Rahmanir-Raheem.', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.', reference: 'Abu Dawood | Ibn Majah | Imam Ahmed' },
  { id: 'p6', category: 'Wudu & Prayer', title: 'Completion of Wudu', arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', transliteration: 'Ashhadu an laa ilaaha illallaahu wahdahu laa shareeka lahu...', translation: 'I testify that there is no one worthy of worship besides Allah. He is all by Himself and has no partner and I testify that Muhammad is Allah\'s messenger.', reference: 'Sahih Muslim 1/209' },
  { id: 'p7', category: 'Masjid', title: 'Entering the Masjid', arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', transliteration: 'Allahummaf-tah lee abwaaba rahmatik.', translation: 'In the Name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, open the doors of mercy.', reference: 'Abu Dawood | Ibn As Sunan 888' },
  { id: 'p8', category: 'Masjid', title: 'Leaving the Masjid', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', transliteration: 'Allahumma innee as\'aluka min fadlik.', translation: 'In the Name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, I ask for Your favour and bounty.', reference: 'Abu Dawood | Sahih Al Jaami 4591' },
  { id: 'p9', category: 'Food & Meals', title: 'Before Meals', arabic: 'بِسْمِ اللَّهِ', transliteration: 'Bismillaah.', translation: 'In the name of Allah.', reference: 'Abu Dawood 3/437 | At-Tirmidhi 4/288' },
  { id: 'p10', category: 'Food & Meals', title: 'Forgetting Bismillah', arabic: 'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', transliteration: 'Bismillaahi fee awwalihi wa aakhirihi.', translation: 'In the name of Allah in the beginning and end.', reference: 'Abu Dawood 3/437' },
  { id: 'p11', category: 'Food & Meals', title: 'After Meals', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا', transliteration: 'Alhamdu lillaahil-ladhee at\'amanee haathaa...', translation: 'Praise is to Allah Who has given me this food and sustained me with it though I was unable to do it and powerless. All praise belongs to Allah, who fed us and quenched our thirst and made us Muslims.', reference: 'At-Tirmidhi | Ibn Majah' },
  { id: 'p12', category: 'Wudu & Prayer', title: 'Dua Before Salam', translation: 'O Allah, I seek refuge in You from the punishment of the grave, from Hell-fire, from the trials of life and death, and from the evil trial of the False Messiah.', reference: 'Al Bukhari 2/102 | Muslim 1/412' },
  { id: 'p13', category: 'Travel & Home', title: 'When Leaving Home', translation: 'I depart with Allah\'s name, relying on Him. It is Allah who saves us from sins with His guidance.', reference: 'Sahih Muslim 1/209' },
  { id: 'p14', category: 'Travel & Home', title: 'When Entering Home', translation: 'In the Name of Allah we enter, in the Name of Allah we leave, and upon our Lord we depend.', reference: 'At-Tirmidhi 5/490' },
  { id: 'p15', category: 'Travel & Home', title: 'On Journey', translation: 'Allah is pure, He has given control and without His power we would not have any control. Without doubt we are to return to Him.', reference: 'Abu Dawood 3/34 | At-Tirmidhi 5/501' },
  { id: 'p16', category: 'Travel & Home', title: 'Return from Journey', translation: 'Allah is pure, He has given control. We return, repent, worship and praise our Lord.', reference: 'Abu Dawood 3/34' },
  { id: 'p17', category: 'Social', title: 'When Sneezing', translation: 'All praise is for Allah.', reference: 'Al Bukhari 7/125' },
  { id: 'p18', category: 'Social', title: 'Hearing Someone Sneeze', translation: 'May Allah have mercy on you.', reference: 'Al Bukhari 7/125' },
  { id: 'p19', category: 'Social', title: 'Sneezer Replies Back', translation: 'May Allah guide you and rectify your condition.', reference: 'Al Bukhari 7/125' },
  { id: 'p20', category: 'Social', title: 'Entering the Market', translation: 'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise. He gives life and causes death, and He is living and does not die. In His hand is all good and He is over all things, omnipotent.', reference: 'At-Tirmidhi 5/291' },
  { id: 'p21', category: 'Family', title: 'Having Relation with Spouse', translation: 'In the Name of Allah. O Allah, keep us away from Satan and keep Satan away from what You have bestowed upon us.', reference: 'Abu Dawood 2/248' },
  { id: 'p22', category: 'Wudu & Prayer', title: 'After Adhaan', translation: 'O Allah, Lord of this perfect call, grant Muhammad Al-wasilah and raise him to a praised platform which You have promised him.', reference: 'Al Bukhari 1/152' },
  { id: 'p23', category: 'Special', title: 'Dua for Janaza', translation: 'O Allah, forgive our living and our dead, those present and those absent, our young and our old, our males and our females. O Allah, whom You keep alive, let such a life be upon Islam, and whom You take, let such a death be upon faith.', reference: 'Ibn Majah 1/480' },
  { id: 'p24', category: 'Dhikr', title: 'Glorification of Allah', translation: 'How perfect Allah is and I praise Him. How perfect Allah is, The Supreme.', reference: 'Al Bukhari 4/2071' },
  { id: 'p25', category: 'Dhikr', title: 'Seeking Pardon', translation: 'O Allah You are The One Who pardons greatly and loves to pardon, so pardon me.', reference: 'At-Tirmidhi 9/201' },
  { id: 'p26', category: 'Dhikr', title: 'No Might Except Allah', translation: 'There is no might nor power except with Allah.', reference: 'Al Bukhari | Sahih Muslim 4/2076' },
  { id: 'p27', category: 'Dhikr', title: 'Complete Glorification', translation: 'Glory be to Allah, All Praise is for Allah, There is No God but Allah, Allah is the Greatest.', reference: 'Sahih Muslim 3/1685' },
  { id: 'p28', category: 'Hardship', title: 'One in Distress', translation: 'None has the right to be worshipped except you. How perfect you are, verily I was among the wrong doers.', reference: 'Surah Al Anbiyah 21:87' },
  { id: 'p29', category: 'Hardship', title: 'Leaving Affairs to Allah', translation: 'Allah Alone is Sufficient for us, and He is the Best Disposer of affairs.', reference: 'Quran 3:173' },
  { id: 'p30', category: 'Protection', title: 'Protection from Hellfire', translation: 'O Allah, save me from the fire.', reference: 'Abu Dawood 5079' },
  { id: 'p31', category: 'Protection', title: 'Fear of Shirk', translation: 'O Allah we seek refuge in You from associating anything with You knowingly, and we seek Your forgiveness for what we do unknowingly.', reference: 'Imam Ahmed 4/403' },
  { id: 'p32', category: 'Family', title: 'Protection for Children', translation: 'I seek protection for you in the Perfect Words of Allah from every devil and every beast, and from every envious blameworthy eye.', reference: 'Al Bukhari 4/119' },
  { id: 'p33', category: 'Family', title: 'Dua for Parents', translation: 'Our Lord! Forgive me and my parents and all believers on the Day of Reckoning. My Lord! Have mercy on them both as they did care for me when I was young.', reference: 'Quran 14:41 | 17:24' },
  { id: 'p34', category: 'Special', title: 'When Breaking Fast', translation: 'The thirst has quenched and left wetness and with the will of Allah, reward is proven (certain).', reference: 'Abu Dawood 2/306' },
  { id: 'p35', category: 'Health', title: 'When Visiting the Sick', translation: 'Do not worry, it will be a purification (for you) Allah willing.', reference: 'Al Bukhari' },
  { id: 'p36', category: 'Health', title: 'For Good Health (7 times)', translation: 'I ask Almighty Allah, Lord of the Magnificent Throne, to make you well.', reference: 'At-Tirmidhi 2/210' },
  { id: 'p37', category: 'Health', title: 'Cure of Any Illness', translation: 'O Lord of the people, remove this pain and cure it. You are the one who cures and there is no one besides You who can cure, grant such a cure that no illness remains.', reference: 'Al Bukhari | Sahih Muslim' },
  { id: 'p38', category: 'Special', title: 'Visiting the Graves', translation: 'Peace be upon you, people of this abode, from among the believers and Muslims. We, by the Will of Allah, shall be joining you. I ask Allah to grant us and you strength.', reference: 'Sahih Muslim 2/671' },
  { id: 'p39', category: 'Hardship', title: 'Any Difficult Affairs', translation: 'O Allah, there is no ease except in that which You have made easy, and You make the difficulty, if You wish, easy.', reference: 'Ibn Hibban 327' },
  { id: 'p40', category: 'Special', title: 'Salatul Istikhara', translation: 'O Allah, I seek Your guidance by virtue of Your knowledge, and I seek ability by virtue of Your power, and I ask You of Your great bounty. O Allah, if in Your knowledge this matter is good for me in this world and the Hereafter, then ordain it for me, make it easy and bless it. And if it is bad for me, then turn me away from it and ordain for me the good wherever it may be.', reference: 'Al Bukhari 7/162' },
  { id: 'p41', category: 'Wudu & Prayer', title: 'Dua Qunoot 1', translation: 'O Allah, guide us among those You have guided, pardon us among those You have pardoned, bless us in what You have bestowed, and save us from the evil of what You have decreed. Blessed are You, O Lord, and Exalted.', reference: 'Abu Dawood 1425 | At-Tirmidhi 464' },
  { id: 'p42', category: 'Wudu & Prayer', title: 'Dua Qunoot 2', translation: 'O Allah, we beg help from You alone, ask forgiveness from You alone, turn towards You and praise You for all good things. O Allah, You alone do we worship, we hasten eagerly towards You and fear Your severe punishment and hope for Your Mercy.', reference: 'Al-Bayhaqi 2/210' },
];

const CATEGORIES = ['All', ...Array.from(new Set(PRELOADED_DUAS.map(d => d.category)))];

// ─── Learn Section ─────────────────────────────────────────────────────────────
function LearnSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [learnSearch, setLearnSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hiddenTranslations, setHiddenTranslations] = useState<Set<string>>(new Set());
  const [memorized, setMemorized] = useState<Set<string>>(new Set());

  // Load memorized state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('memorized-duas');
    if (saved) setMemorized(new Set(JSON.parse(saved)));
  }, []);

  const toggleMemorized = (id: string) => {
    setMemorized(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('memorized-duas', JSON.stringify([...next]));
      return next;
    });
  };

  const toggleTranslation = (id: string) => {
    setHiddenTranslations(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = PRELOADED_DUAS.filter(d => {
    const matchCat = selectedCategory === 'All' || d.category === selectedCategory;
    const matchSearch = d.title.toLowerCase().includes(learnSearch.toLowerCase()) ||
      d.translation.toLowerCase().includes(learnSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="mt-2">
      {/* Stats bar */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-sm text-muted-foreground">
          <span className="font-bold text-primary">{memorized.size}</span> / {PRELOADED_DUAS.length} duas memorized
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(memorized.size / PRELOADED_DUAS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search duas to learn..."
          className="pl-10 bg-primary/5 border-primary/20"
          value={learnSearch}
          onChange={e => setLearnSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedCategory === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-primary/5 text-muted-foreground border-primary/10 hover:border-primary/30'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dua cards */}
      <div className="flex flex-col gap-3">
        {filtered.map(dua => {
          const isExpanded = expandedId === dua.id;
          const isHidden = hiddenTranslations.has(dua.id);
          const isMemorized = memorized.has(dua.id);

          return (
            <div
              key={dua.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${isMemorized
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-primary/5 border-primary/10'
                }`}
            >
              {/* Header row */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : dua.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isMemorized ? 'bg-primary' : 'bg-primary/20'}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{dua.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{dua.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isMemorized && (
                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider mr-1">✓ Memorized</span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-primary/10 pt-3 animate-in fade-in duration-200">
                  {/* Arabic text (if exists) */}
                  {(dua as any).arabic && (
                    <div className="mb-4">
                      <p className="text-2xl font-arabic text-right leading-loose text-primary">{(dua as any).arabic}</p>
                    </div>
                  )}

                  {/* Transliteration (if exists) */}
                  {(dua as any).transliteration && (
                    <div className="mb-4">
                      <p className="text-sm italic text-foreground/80">{(dua as any).transliteration}</p>
                    </div>
                  )}

                  {/* Translation toggle */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Translation</p>
                    <button
                      onClick={() => toggleTranslation(dua.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {isHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {isHidden ? 'Reveal' : 'Hide (test yourself)'}
                    </button>
                  </div>

                  {isHidden ? (
                    <div className="bg-primary/5 rounded-lg p-3 text-center text-sm text-muted-foreground italic border border-dashed border-primary/20">
                      Translation hidden — try to recall it!
                    </div>
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed font-medium">{dua.translation}</p>
                  )}

                  <p className="text-[11px] text-muted-foreground mt-3 italic">📖 {dua.reference}</p>

                  {/* Memorized toggle */}
                  <button
                    onClick={() => toggleMemorized(dua.id)}
                    className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold border transition-all ${isMemorized
                        ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/10'
                        : 'bg-background text-muted-foreground border-primary/20 hover:bg-primary/5 hover:text-primary'
                      }`}
                  >
                    {isMemorized ? '✓ Mark as Not Memorized' : 'Mark as Memorized'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function DuaNotepad() {
  const { duas, addDua, deleteDua, toggleDuaFavorite, editDua } = useLocalStore();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDua, setNewDua] = useState({ title: '', arabic: '', transliteration: '', translation: '', reference: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', arabic: '', transliteration: '', translation: '', reference: '' });
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'mynotes'>('learn');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredDuas = duas.filter(d => {
    const term = search.toLowerCase();
    return d.title.toLowerCase().includes(term) ||
      (d.text && d.text.toLowerCase().includes(term)) ||
      (d.translation && d.translation.toLowerCase().includes(term)) ||
      (d.arabic && d.arabic.toLowerCase().includes(term)) ||
      (d.transliteration && d.transliteration.toLowerCase().includes(term));
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDua.title.trim() && (newDua.translation.trim() || newDua.arabic.trim())) {
      addDua({ ...newDua, text: newDua.translation });
      setNewDua({ title: '', arabic: '', transliteration: '', translation: '', reference: '' });
      setIsAddOpen(false);
    }
  };

  const startEdit = (dua: any) => {
    setEditingId(dua.id);
    setEditForm({ 
      title: dua.title || '', 
      arabic: dua.arabic || '', 
      transliteration: dua.transliteration || '', 
      translation: dua.translation || dua.text || '', 
      reference: dua.reference || '' 
    });
  };

  const saveEdit = (id: string) => {
    editDua(id, { 
      title: editForm.title, 
      arabic: editForm.arabic, 
      transliteration: editForm.transliteration, 
      translation: editForm.translation, 
      reference: editForm.reference,
      text: editForm.translation
    });
    setEditingId(null);
  };

  if (!isMounted) return null;

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-4 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-headline font-bold text-primary">Dua Notepad</h2>
          {activeTab === 'mynotes' && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
                  <Plus />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/20">
                <DialogHeader>
                  <DialogTitle className="text-primary">Add New Dua</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="dua-title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Title</label>
                    <Input id="dua-title" placeholder="e.g., Dua for waking up" value={newDua.title} onChange={e => setNewDua({ ...newDua, title: e.target.value })} className="bg-background" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="dua-arabic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Arabic</label>
                    <Textarea id="dua-arabic" placeholder="اَلْحَمْدُ للهِ..." dir="rtl" rows={3} value={newDua.arabic} onChange={e => setNewDua({ ...newDua, arabic: e.target.value })} className="bg-background font-arabic text-xl" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="dua-transliteration" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Transliteration (Roman Arabic)</label>
                    <Textarea id="dua-transliteration" placeholder="Alhamdu lillahil-ladhi..." rows={2} value={newDua.transliteration} onChange={e => setNewDua({ ...newDua, transliteration: e.target.value })} className="bg-background" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="dua-translation" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">English Translation</label>
                    <Textarea id="dua-translation" placeholder="Praise is to Allah..." rows={3} value={newDua.translation} onChange={e => setNewDua({ ...newDua, translation: e.target.value })} className="bg-background" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="dua-reference" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Reference</label>
                    <Input id="dua-reference" placeholder="e.g., Al-Bukhari" value={newDua.reference} onChange={e => setNewDua({ ...newDua, reference: e.target.value })} className="bg-background" />
                  </div>
                  <Button type="submit" disabled={!newDua.title.trim() || (!newDua.translation.trim() && !newDua.arabic.trim())} className="w-full mt-2">Save Dua</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-primary/5 border border-primary/10">
          <button
            onClick={() => setActiveTab('learn')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'learn'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <BookOpen className="h-4 w-4" />
            Learn & Memorize
          </button>
          <button
            onClick={() => setActiveTab('mynotes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'mynotes'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <PenTool className="h-4 w-4" />
            My Saved Duas
            {duas.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'mynotes' ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'}`}>
                {duas.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Tab Content */}
      {activeTab === 'learn' ? (
        <LearnSection />
      ) : (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your duas..."
              className="pl-10 bg-primary/5 border-primary/20"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {filteredDuas.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <PenTool className="h-12 w-12 mx-auto opacity-20 mb-4" />
              <p>No duas found. Start by adding one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {filteredDuas.map(dua => (
                <Card key={dua.id} className="bg-primary/5 border-primary/10 relative group overflow-hidden">
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                    <div className="flex-1 pr-8">
                      {editingId === dua.id ? (
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="mb-2 font-bold text-foreground"
                        />
                      ) : (
                        <>
                          <CardTitle className="text-lg font-bold text-foreground">{dua.title}</CardTitle>
                          <p className="text-[10px] text-muted-foreground uppercase mt-1">{dua.date}</p>
                        </>
                      )}
                    </div>
                    {editingId !== dua.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${dua.isFavorite ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={() => toggleDuaFavorite(dua.id)}
                      >
                        <Star className={dua.isFavorite ? 'fill-current' : ''} />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {editingId === dua.id ? (
                      <div className="flex flex-col gap-3">
                        <Textarea value={editForm.arabic} onChange={(e) => setEditForm({...editForm, arabic: e.target.value})} placeholder="Arabic" dir="rtl" className="font-arabic text-xl bg-background/50" rows={2}/>
                        <Textarea value={editForm.transliteration} onChange={(e) => setEditForm({...editForm, transliteration: e.target.value})} placeholder="Transliteration" className="bg-background/50 text-sm italic" rows={2}/>
                        <Textarea value={editForm.translation} onChange={(e) => setEditForm({...editForm, translation: e.target.value})} placeholder="English Translation" className="bg-background/50 text-sm" rows={2}/>
                        <Input value={editForm.reference} onChange={(e) => setEditForm({...editForm, reference: e.target.value})} placeholder="Reference" className="bg-background/50 text-xs text-muted-foreground"/>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {dua.arabic && <p className="text-2xl font-arabic text-right leading-loose text-primary">{dua.arabic}</p>}
                        {dua.transliteration && <p className="text-sm italic text-foreground/80">{dua.transliteration}</p>}
                        {(dua.translation || dua.text) && <p className="text-sm text-foreground font-medium leading-relaxed">{dua.translation || dua.text}</p>}
                        {dua.reference && <p className="text-xs text-primary/70 font-semibold">{dua.reference}</p>}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-2 border-t border-primary/5 justify-end gap-1">
                    {editingId === dua.id ? (
                      <Button variant="ghost" size="sm" className="h-8 text-primary font-bold" onClick={() => saveEdit(dua.id)}>
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startEdit(dua)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteDua(dua.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
