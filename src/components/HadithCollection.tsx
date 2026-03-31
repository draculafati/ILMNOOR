"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, BookText } from 'lucide-react';

const HADITHS = [
  { id: 1, arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", transliteration: "Innamal a'malu bin-niyyat", translation: "Actions are (judged) by intentions.", narrator: "Narrated by 'Umar bin Al-Khattab (Bukhari & Muslim)" },
  { id: 2, arabic: "الدِّينُ النَّصِيحَةُ", transliteration: "Ad-deenu an-naseehah", translation: "Religion is sincerity.", narrator: "Narrated by Tamim Ad-Dari (Muslim)" },
  { id: 3, arabic: "مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ", transliteration: "Min husni islami al-mar'i tarkuhu ma la ya'neehi", translation: "Part of the perfection of one's Islam is his leaving that which does not concern him.", narrator: "Narrated by Abu Hurairah (Tirmidhi)" },
  { id: 4, arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", transliteration: "La yu'minu ahadukum hatta yuhibba li akheehi ma yuhibbu li nafsihi", translation: "None of you truly believes until he loves for his brother what he loves for himself.", narrator: "Narrated by Anas bin Malik (Bukhari & Muslim)" },
  { id: 5, arabic: "الْحَيَاءُ شُعْبَةٌ مِنَ الْإِيمَانِ", transliteration: "Al-haya'u shu'batun minal eeman", translation: "Modesty is a branch of faith.", narrator: "Narrated by Abu Hurairah (Muslim)" },
  { id: 6, arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", transliteration: "Al-kalimatu at-tayyibatu sadaqah", translation: "A good word is charity.", narrator: "Narrated by Abu Hurairah (Bukhari & Muslim)" },
  { id: 7, arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى", transliteration: "Al-yadu al-'ulya khayrun minal yadi as-sufla", translation: "The upper hand is better than the lower hand.", narrator: "Narrated by Hakim bin Hizam (Bukhari)" },
  { id: 8, arabic: "يَسِّرُوا وَلَا تُعَسِّرُوا", transliteration: "Yassiroo wa la tu'assiroo", translation: "Make things easy and do not make them difficult.", narrator: "Narrated by Anas bin Malik (Bukhari)" },
  { id: 9, arabic: "لَا تَغْضَبْ", transliteration: "La taghdab", translation: "Do not become angry.", narrator: "Narrated by Abu Hurairah (Bukhari)" },
  { id: 10, arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ", transliteration: "Laysa ash-shadeedu bis-sur'ati, innamash-shadeedul-ladhee yamliku nafsahu 'indal ghadab", translation: "The strong man is not the good wrestler, but the strong man is he who controls himself when he is angry.", narrator: "Narrated by Abu Hurairah (Bukhari & Muslim)" },
  { id: 11, arabic: "مَنْ لَا يَرْحَمُ لَا يُرْحَمُ", transliteration: "Man la yarham la yurham", translation: "He who does not show mercy will not be shown mercy.", narrator: "Narrated by Abu Hurairah (Bukhari & Muslim)" },
  { id: 12, arabic: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", transliteration: "Ahabbu al-a'mali ilallahi adwamuha wa in qalla", translation: "The most beloved of deeds to Allah are those that are most consistent, even if it is small.", narrator: "Narrated by Aisha (Bukhari & Muslim)" },
  { id: 13, arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", transliteration: "Man kana yu'minu billahi wal yawmil akhir fal yaqul khayran aw liyasmut", translation: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.", narrator: "Narrated by Abu Hurairah (Bukhari & Muslim)" },
  { id: 14, arabic: "إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ", transliteration: "Innallaha jameelun yuhibbu al-jamal", translation: "Allah is beautiful and loves beauty.", narrator: "Narrated by Abdullah bin Mas'ud (Muslim)" },
  { id: 15, arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ", transliteration: "At-tuhuru shatrul eeman", translation: "Cleanliness is half of faith.", narrator: "Narrated by Abu Malik Al-Ash'ari (Muslim)" },
  { id: 16, arabic: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا", transliteration: "Al-mu'minu lil mu'mini kal bunyani yashuddu ba'dhuhu ba'dha", translation: "The believer is to the believer like parts of a building, supporting one another.", narrator: "Narrated by Abu Musa (Bukhari & Muslim)" },
  { id: 17, arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ", transliteration: "Kullu ma'roofin sadaqah", translation: "Every act of kindness is charity.", narrator: "Narrated by Jabir bin Abdullah (Bukhari)" },
  { id: 18, arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", transliteration: "Khayrukum man ta'allama al-qur'ana wa 'allamahu", translation: "The best among you are those who learn the Quran and teach it.", narrator: "Narrated by Uthman bin Affan (Bukhari)" },
  { id: 19, arabic: "الْمَرْءُ مَعَ مَنْ أَحَبَّ", transliteration: "Al-mar'u ma'a man ahabba", translation: "A person will be with those whom he loves.", narrator: "Narrated by Anas bin Malik (Bukhari & Muslim)" },
  { id: 20, arabic: "كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ", transliteration: "Kun fid-dunya ka annaka ghareebun aw 'abiru sabeel", translation: "Be in this world as if you were a stranger or a traveler along a path.", narrator: "Narrated by Ibn Umar (Bukhari)" },
  { id: 21, arabic: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ", transliteration: "Talabul 'ilmi fareedhatun 'ala kulli muslim", translation: "Seeking knowledge is an obligation upon every Muslim.", narrator: "Narrated by Anas bin Malik (Ibn Majah)" },
  { id: 22, arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا", transliteration: "Akmalul mu'mineena eemanan ahsanuhum khuluqa", translation: "The most perfect believer in faith is the one whose character is finest.", narrator: "Narrated by Abu Hurairah (Tirmidhi)" },
  { id: 23, arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", transliteration: "Tabassumuka fee wajhi akheeka laka sadaqah", translation: "Smiling in your brother’s face is an act of charity.", narrator: "Narrated by Abu Dharr (Tirmidhi)" },
  { id: 24, arabic: "الظُّلْمُ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ", transliteration: "Adh-dhulmu dhulumatun yawmal qiyamah", translation: "Oppression will be a darkness on the Day of Resurrection.", narrator: "Narrated by Abdullah bin Umar (Bukhari & Muslim)" },
  { id: 25, arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ", transliteration: "Ma naqasat sadaqatun min mal", translation: "Wealth does not decrease because of charity.", narrator: "Narrated by Abu Hurairah (Muslim)" },
  { id: 26, arabic: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ، وَجَنَّةُ الْكَافِرِ", transliteration: "Ad-dunya sijnul mu'mini, wa jannatul kafir", translation: "The world is a prison for the believer and a paradise for the unbeliever.", narrator: "Narrated by Abu Hurairah (Muslim)" },
  { id: 27, arabic: "دَعْ مَا يَرِيبُكَ إِلَى مَا لَا يَرِيبُكَ", transliteration: "Da' ma yareebuka ila ma la yareebuka", translation: "Leave what makes you doubt for what does not make you doubt.", narrator: "Narrated by Hasan bin Ali (Tirmidhi)" },
  { id: 28, arabic: "خِيَارُكُمْ خِيَارُكُمْ لِنِسَائِهِمْ", transliteration: "Khiyarukum khiyarukum linisa'ihim", translation: "The best of you are those who are best to their women.", narrator: "Narrated by Abu Hurairah (Tirmidhi)" },
  { id: 29, arabic: "تَهَادُوا تَحَابُّوا", transliteration: "Tahadau tahabbu", translation: "Exchange gifts, you will love one another.", narrator: "Narrated by Abu Hurairah (Al-Adab Al-Mufrad)" },
  { id: 30, arabic: "الصَّلَاةُ نُورٌ", transliteration: "As-salatu noor", translation: "Prayer is light.", narrator: "Narrated by Abu Malik Al-Ash'ari (Muslim)" },
  { id: 31, arabic: "إِمَاطَتُكَ الْأَذَى عَنِ الطَّرِيقِ صَدَقَةٌ", transliteration: "Imatatukal adha 'anit-tareeqi sadaqah", translation: "Removing harmful things from the road is an act of charity.", narrator: "Narrated by Abu Dharr (Tirmidhi)" },
  { id: 32, arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", transliteration: "Al-muslimu man salimal muslimoona min lisanihi wa yadihi", translation: "A Muslim is the one from whose tongue and hands the Muslims are safe.", narrator: "Narrated by Abdullah bin Amr (Bukhari & Muslim)" },
  { id: 33, arabic: "السِّوَاكُ مَطْهَرَةٌ لِلْفَمِ، مَرْضَاةٌ لِلرَّبِّ", transliteration: "As-siwaku matharatun lil-fami, mardhatun lir-rabb", translation: "The miswak cleanses the mouth and pleases the Lord.", narrator: "Narrated by Aisha (An-Nasa'i)" },
  { id: 34, arabic: "لَا يَدْخُلُ الْجَنَّةَ قَاطِعُ رَحِمٍ", transliteration: "La yadkhulul jannata qati'u rahim", translation: "The one who severs the ties of kinship will not enter Paradise.", narrator: "Narrated by Jubair bin Mut'im (Bukhari & Muslim)" },
  { id: 35, arabic: "مَنْ صَمَتَ نَجَا", transliteration: "Man samata naja", translation: "He who keeps silent saves himself.", narrator: "Narrated by Abdullah bin Amr (Tirmidhi)" },
  { id: 36, arabic: "السَّفَرُ قِطْعَةٌ مِنَ الْعَذَابِ", transliteration: "As-safaru qit'atun minal 'adhab", translation: "Travel is a piece of torment.", narrator: "Narrated by Abu Hurairah (Bukhari)" },
  { id: 37, arabic: "الْعَيْنُ حَقٌّ", transliteration: "Al-'aynu haqq", translation: "The evil eye is true.", narrator: "Narrated by Abu Hurairah (Bukhari)" },
  { id: 38, arabic: "كُلُّ مِسْكِرٍ حَرَامٌ", transliteration: "Kullu muskirin haram", translation: "Every intoxicant is prohibited.", narrator: "Narrated by Abu Musa (Bukhari)" },
  { id: 39, arabic: "الْمَجَالِسُ بِالْأَمَانَةِ", transliteration: "Al-majalisu bil amanah", translation: "Meetings are confidential.", narrator: "Narrated by Jabir bin Abdullah (Abu Dawud)" },
  { id: 40, arabic: "الدَّالُّ عَلَى الْخَيْرِ كَفَاعِلِهِ", transliteration: "Ad-dallu 'alal khayri kafa'ilihi", translation: "He who guides to something good has a reward similar to that of its doer.", narrator: "Narrated by Abu Mas'ud Al-Ansari (Muslim)" }
];

export default function HadithCollection() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = HADITHS.filter(h => 
    h.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.narrator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.arabic.includes(searchTerm) ||
    h.transliteration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 py-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-primary">Hadith Collection</h2>
          <p className="text-muted-foreground">40 Short Authentic Narrations</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search hadith..." 
            className="pl-10 bg-primary/5 border-primary/20 text-foreground"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {filtered.map(hadith => (
          <Card key={hadith.id} className="glass-card transition-all">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                <span className="text-primary/70 font-bold text-lg">#{hadith.id}</span>
                <BookText className="h-4 w-4 text-primary opacity-50" />
              </div>
              <p className="text-3xl md:text-4xl font-arabic font-bold text-foreground text-right leading-[2.5]" dir="rtl">
                {hadith.arabic}
              </p>
              <div className="text-muted-foreground italic text-sm md:text-base leading-relaxed">
                {hadith.transliteration}
              </div>
              <div className="text-foreground/90 font-medium text-sm md:text-base leading-relaxed border-t border-primary/5 pt-3">
                "{hadith.translation}"
              </div>
              <div className="mt-1 text-[10px] md:text-xs uppercase tracking-widest text-primary font-bold">
                {hadith.narrator}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-1 md:col-span-2 py-12 text-center text-muted-foreground">
            No hadiths found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
