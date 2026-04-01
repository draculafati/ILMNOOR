"use client";

import React, { useState, useEffect } from 'react';
import { useLocalStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Trash2, Star, Edit2, Check, PenTool, BookOpen, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const PRELOADED_DUAS: any[] = [
  // ── Daily Routine ──────────────────────────────────────────────────────────
  { id:'p1', category:'Daily Routine', title:'Upon Going to Sleep', arabic:'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا', transliteration:'Allahumma bismika amutu wa ahya.', translation:'O Allah, in Your name I die and I live.', reference:'Sahih Muslim 4/2083' },
  { id:'p2', category:'Daily Routine', title:'Wake Up from Sleep', arabic:'الْحَمْدُ للهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', transliteration:"Alhamdu lillahil-ladhee ahyana ba'da ma amatana wa-ilayhin-nushoor.", translation:'All praise be to Allah, who gave us life after death and to Him will we be raised and returned.', reference:'Sahih Muslim 4/2083' },
  { id:'p3', category:'Daily Routine', title:'Entering the Toilet', arabic:'بِسْمِ اللَّهِ اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ', transliteration:"Bismillaah. Allahumma innee a'oothu bika minal-khubthi wal-khabaa'ith.", translation:'In the name of Allah. O Allah, I seek refuge in You from the male and female evil jinn.', reference:'Al-Bukhari 1/45 | Sahih Muslim 1/283' },
  { id:'p4', category:'Daily Routine', title:'Leaving the Toilet', arabic:'غُفْرَانَكَ الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانِي', transliteration:"Ghufraanak. Alhamdu lillaahil-ladhee adh-haba 'annil-athaa wa'aafaanee.", translation:'O Allah, I seek Your forgiveness. All Praise to Allah who removed difficulty from me and gave me ease.', reference:'Abu Dawood | Ibn Majah | At-Tirmidhi' },
  { id:'p5', category:'Daily Routine', title:'Looking in the Mirror', arabic:'اللَّهُمَّ أَنْتَ حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي', transliteration:"Allahumma anta hassanta khalqee fa-hassin khuluqee.", translation:'O Allah, just as You have made my external features beautiful, make my character beautiful as well.', reference:'Ahmad 1/403' },
  { id:'p6', category:'Daily Routine', title:'Getting Dressed', arabic:'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', transliteration:"Alhamdu lillahil-lathee kasaanee haatha wa razaqaneehi min ghayri hawlin minnee wa laa quwwah.", translation:'Praise be to Allah who has clothed me with this and provided it for me, with no power or strength from myself.', reference:'Abu Dawood 4/41 | At-Tirmidhi 5/559' },
  // ── Wudu & Prayer ─────────────────────────────────────────────────────────
  { id:'p7', category:'Wudu & Prayer', title:'Start of Wudu', arabic:'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', transliteration:'Bismillahir-Rahmanir-Raheem.', translation:'In the name of Allah, the Entirely Merciful, the Especially Merciful.', reference:'Abu Dawood | Ibn Majah | Imam Ahmed' },
  { id:'p8', category:'Wudu & Prayer', title:'Completion of Wudu', arabic:'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', transliteration:'Ashhadu an laa ilaaha illallaahu wahdahu laa shareeka lahu wa-ashhadu anna Muhammadan abduhu wa rasooluh.', translation:'I testify that none is worthy of worship except Allah, alone without partner, and I testify that Muhammad is His slave and messenger.', reference:'Sahih Muslim 1/209' },
  { id:'p9', category:'Wudu & Prayer', title:'Dua Qunoot', arabic:'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ وَعَافِنِي فِيمَنْ عَافَيْتَ وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ', transliteration:"Allahummah-dinee feeman hadayt, wa 'aafinee feeman 'aafayt, wa tawallanee feeman tawallayt.", translation:'O Allah, guide me among those You have guided, pardon me among those You have pardoned, and befriend me among those You have befriended.', reference:'Abu Dawood 1425 | At-Tirmidhi 464' },
  { id:'p10', category:'Wudu & Prayer', title:'After Adhaan', arabic:'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ', transliteration:"Allahumma rabba hathihid-da'watit-tammah, was-salaatil-qaa'imah, aati Muhammadanil-waseelata wal-fadeelah.", translation:'O Allah, Lord of this perfect call and established prayer, grant Muhammad the intercession and the special rank.', reference:'Al-Bukhari 1/152' },
  { id:'p11', category:'Wudu & Prayer', title:'Dua Before Salam (in Salah)', arabic:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ وَمِنْ عَذَابِ جَهَنَّمَ وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ', transliteration:"Allahumma innee a'oothu bika min 'athaabil-qabr, wa min 'athaabi jahannam, wa min fitnatil-mahyaa wal-mamaat.", translation:'O Allah, I seek refuge in You from the punishment of the grave, the punishment of Hell, and the trials of life and death.', reference:'Al-Bukhari 2/102 | Muslim 1/412' },
  // ── Masjid ─────────────────────────────────────────────────────────────────
  { id:'p12', category:'Masjid', title:'Entering the Masjid', arabic:'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', transliteration:"Allahummaf-tah lee abwaaba rahmatik.", translation:'O Allah, open the doors of Your mercy for me.', reference:'Abu Dawood | Ibn As-Sunan 888' },
  { id:'p13', category:'Masjid', title:'Leaving the Masjid', arabic:'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', transliteration:"Allahumma innee as'aluka min fadlik.", translation:'O Allah, I ask You of Your favour and bounty.', reference:'Abu Dawood | Sahih Al-Jaami 4591' },
  // ── Food & Meals ───────────────────────────────────────────────────────────
  { id:'p14', category:'Food & Meals', title:'Before Meals', arabic:'بِسْمِ اللَّهِ', transliteration:'Bismillaah.', translation:'In the name of Allah.', reference:'Abu Dawood 3/437 | At-Tirmidhi 4/288' },
  { id:'p15', category:'Food & Meals', title:'Forgetting Bismillah at Start', arabic:'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', transliteration:'Bismillaahi fee awwalihi wa aakhirihi.', translation:'In the name of Allah in the beginning and end.', reference:'Abu Dawood 3/437' },
  { id:'p16', category:'Food & Meals', title:'After Meals', arabic:'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', transliteration:"Alhamdu lillaahil-ladhee at'amanee haathaa wa razaqaneehi min ghayri hawlin minnee wa laa quwwah.", translation:'All praise is for Allah who fed me this and provided it for me without any might or power from myself.', reference:'At-Tirmidhi | Ibn Majah' },
  { id:'p17', category:'Food & Meals', title:'When Breaking Fast (Iftar)', arabic:'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ', transliteration:'Allahumma laka sumtu wa bika aamantu wa alayka tawakkaltu wa ala rizqika aftartu.', translation:'O Allah! I fasted for You, I believe in You, I put my trust in You, and I break my fast with Your sustenance.', reference:'Abu Dawood 2/306' },
  // ── Travel & Home ──────────────────────────────────────────────────────────
  { id:'p18', category:'Travel & Home', title:'When Leaving Home', arabic:'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration:'Bismillaahi, tawakkaltu alal-laahi, laa hawla wa laa quwwata illaa billaah.', translation:'In the name of Allah. I place my trust in Allah. There is no power nor might except with Allah.', reference:'Abu Dawood 4/325 | At-Tirmidhi 5/490' },
  { id:'p19', category:'Travel & Home', title:'When Entering Home', arabic:'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ', transliteration:"Allahumma innee as'aluka khayral-mawlaji wa khayral-makhraj.", translation:'O Allah, I ask You for the best entrance and the best exit. In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we rely.', reference:'Abu Dawood 4/325' },
  { id:'p20', category:'Travel & Home', title:'Beginning a Journey', arabic:'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ', transliteration:'Subhaanal-lathee sakhkhara lanaa haathaa wa maa kunnaa lahu muqrineen, wa innaa ilaa rabbinaa lamunqaliboon.', translation:'Glory be to Him who has put this (transport) under our control though we were unable to control it. And verily, to Our Lord we are to return.', reference:'Abu Dawood 3/34 | At-Tirmidhi 5/501' },
  { id:'p21', category:'Travel & Home', title:'Return from Journey', arabic:'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ', transliteration:'Aayiboona taa-iboona 'aabidoona lirabbinaa haamidoon.', translation:'Returning, repenting, worshipping, and praising our Lord.', reference:'Abu Dawood 3/34' },
  // ── Social ─────────────────────────────────────────────────────────────────
  { id:'p22', category:'Social', title:'Islamic Greeting (Salaam)', arabic:'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ', transliteration:'Assalaamu alaykum wa rahmatullaahi wa barakaatuh.', translation:'Peace be upon you and the mercy of Allah and His blessings.', reference:'Quran 24:61' },
  { id:'p23', category:'Social', title:'When Sneezing', arabic:'الْحَمْدُ لِلَّهِ', transliteration:'Alhamdulillah.', translation:'All praise is for Allah.', reference:'Al-Bukhari 7/125' },
  { id:'p24', category:'Social', title:'Hearing Someone Sneeze', arabic:'يَرْحَمُكَ اللَّهُ', transliteration:'Yar-hamukallah.', translation:'May Allah have mercy on you.', reference:'Al-Bukhari 7/125' },
  { id:'p25', category:'Social', title:'Entering the Market', arabic:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ حَيٌّ لَا يَمُوتُ بِيَدِهِ الْخَيْرُ', transliteration:'Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamd, yuhyee wa yumeetu wa huwa hayyun laa yamoot, biyadihil-khayr.', translation:'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise. He gives life and causes death, and He is living and does not die. In His hand is all good.', reference:'At-Tirmidhi 5/291 | Ibn Majah 2/752' },
  // ── Dhikr ──────────────────────────────────────────────────────────────────
  { id:'p26', category:'Dhikr', title:'SubhanAllah', arabic:'سُبْحَانَ اللَّهِ', transliteration:'Subhanallah.', translation:'Glory be to Allah.', reference:'Al-Bukhari | Muslim' },
  { id:'p27', category:'Dhikr', title:'Alhamdulillah', arabic:'الْحَمْدُ لِلَّهِ', transliteration:'Alhamdulillah.', translation:'All praise is for Allah.', reference:'Al-Bukhari | Muslim' },
  { id:'p28', category:'Dhikr', title:'Allahu Akbar', arabic:'اللَّهُ أَكْبَرُ', transliteration:'Allahu Akbar.', translation:'Allah is the Greatest.', reference:'Al-Bukhari | Muslim' },
  { id:'p29', category:'Dhikr', title:'Tasbih (Glory, Praise, Greatest)', arabic:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ', transliteration:'Subhaanallaahi wa bihamdihi, subhaanallaahil-Adheem.', translation:'Glory be to Allah and I praise Him. Glory be to Allah the Supreme.', reference:'Al-Bukhari 4/2071' },
  { id:'p30', category:'Dhikr', title:'Seeking Forgiveness (Istighfar)', arabic:'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', transliteration:'Astaghfirullahal-lathee laa ilaaha illaa huwal-Hayyul-Qayyoomu wa atoobu ilayh.', translation:'I seek forgiveness from Allah, there is no god but He, the Living, the Sustaining, and I repent to Him.', reference:'Abu Dawood 2/85 | At-Tirmidhi 5/569' },
  { id:'p31', category:'Dhikr', title:'Seeking Pardon (Laylat ul-Qadr)', arabic:'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', transliteration:"Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'annee.", translation:'O Allah, You are the Pardoning One, You love to pardon, so pardon me.', reference:'At-Tirmidhi 9/201' },
  { id:'p32', category:'Dhikr', title:'La Hawla wa La Quwwata', arabic:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', transliteration:'Laa hawla wa laa quwwata illaa billaah.', translation:'There is no might nor power except with Allah.', reference:'Al-Bukhari | Sahih Muslim 4/2076' },
  { id:'p33', category:'Dhikr', title:'Sayyidul Istighfar (Master Dua for Forgiveness)', arabic:'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ', transliteration:'Allahumma anta rabbee laa ilaaha illaa ant, khalaqtanee wa ana abduk, wa ana alaa ahdika wa wadika mas-tata\'t, a\'oothu bika min sharri maa sana\'t, aboo\'u laka bini\'matika alayya wa aboo\'u laka bithanbee faghfir lee fa-innahu laa yaghfirul-thunooba illaa ant.', translation:'O Allah, You are my Lord. None has the right to be worshipped but You. You created me and I am Your slave. I am faithful to my covenant and my promise to You as much as I can. I seek refuge in You from all the evil I have done. I acknowledge Your favor upon me and I acknowledge my sins. So forgive me, for none forgives sins but You.', reference:'Al-Bukhari 7/150' },
  // ── Hardship & Anxiety ─────────────────────────────────────────────────────
  { id:'p34', category:'Hardship', title:'Dua of Yunus (AS) in the Whale', arabic:'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ', transliteration:'Laa ilaaha illaa anta subhaanaka innee kuntu minath-thaalimeen.', translation:'None has the right to be worshipped except You. How perfect You are! Verily I was among the wrongdoers.', reference:'Surah Al-Anbiyah 21:87' },
  { id:'p35', category:'Hardship', title:'When Distressed or Anxious', arabic:'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ', transliteration:"Allahumma innee a'oothu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal.", translation:'O Allah, I seek refuge in You from anxiety and grief, from incapability and laziness.', reference:'Al-Bukhari 7/158' },
  { id:'p36', category:'Hardship', title:'When Facing Difficult Affairs', arabic:'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا', transliteration:'Allahumma laa sahla illaa maa ja\'altahu sahlaa, wa anta taj\'alul-hazna ithaa shi\'ta sahlaa.', translation:'O Allah, there is no ease except that which You make easy, and You make difficulty, if You wish, easy.', reference:'Ibn Hibban 327' },
  { id:'p37', category:'Hardship', title:'Leaving Affairs to Allah (Hasbunallah)', arabic:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', transliteration:'Hasbunallaahu wa ni\'mal-wakeel.', translation:'Allah Alone is Sufficient for us, and He is the Best Disposer of affairs.', reference:'Quran 3:173' },
  { id:'p38', category:'Hardship', title:'Dua for Relief from Debt', arabic:'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ', transliteration:"Allahumm-akfinee bihalalika 'an haramika wa aghnini bifadlika 'amman siwaak.", translation:'O Allah, suffice me with what You have allowed instead of what You have forbidden, and make me independent of all others besides You.', reference:'At-Tirmidhi 5/560' },
  // ── Protection ─────────────────────────────────────────────────────────────
  { id:'p39', category:'Protection', title:'Morning Adhkar (Ayatul Kursi)', arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', transliteration:'Allahu laa ilaaha illaa huwal-Hayyul-Qayyoom. Laa ta\'khuthuhu sinatun wa laa nawm...', translation:'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep…', reference:'Quran 2:255 — Ayatul Kursi' },
  { id:'p40', category:'Protection', title:'Morning Protection (3x)', arabic:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', transliteration:"Bismillahil-lathee laa yadurru ma'asmihi shay'un fil-ardi wa laa fis-samaa'i wa huwas-samee'ul-'aleem.", translation:'In the name of Allah with Whose name nothing can harm on earth or in the heavens, and He is the All-Hearing, the All-Knowing.', reference:'Abu Dawood 4/323 | At-Tirmidhi 5/465' },
  { id:'p41', category:'Protection', title:'Protection from Shirk', arabic:'اللَّهُمَّ إِنَّا نَعُوذُ بِكَ أَنْ نُشْرِكَ بِكَ شَيْئًا نَعْلَمُهُ', transliteration:"Allahumma innaa na'oothu bika an nushrika bika shay'an na'lamuh.", translation:'O Allah, we seek refuge in You from knowingly associating partners with You, and we seek forgiveness for what we do not know.', reference:'Imam Ahmed 4/403' },
  { id:'p42', category:'Protection', title:'Ruqyah — Protection Dua', arabic:'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', transliteration:"A'oothu bikalimaatil-laahit-taammaati min sharri maa khalaq.", translation:'I seek refuge in the perfect words of Allah from the evil of what He has created.', reference:'Sahih Muslim 4/2080' },
  // ── Family ─────────────────────────────────────────────────────────────────
  { id:'p43', category:'Family', title:'Dua for Parents', arabic:'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', transliteration:'Rabbir-hamhumaa kamaa rabbayaanee sagheeraa.', translation:'My Lord, have mercy upon them as they brought me up [when I was] small.', reference:'Quran 17:24' },
  { id:'p44', category:'Family', title:'Dua for Righteous Spouse & Children', arabic:'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا', transliteration:'Rabbanaa hab lanaa min azwaajinaa wa thurriyyaatinaa qurrata a\'yun waj\'alnaa lil-muttaqeena imaamaa.', translation:'Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us a leader for the righteous.', reference:'Quran 25:74' },
  { id:'p45', category:'Family', title:'Dua for Protection of Children', arabic:'أُعِيذُكَ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ', transliteration:"U'eedhuka bikalimaatil-laahit-taammmah, min kulli shaytaanin wa haammah, wa min kulli 'aynin laammah.", translation:'I seek protection for you in the perfect words of Allah from every devil and every beast, and from every envious blameworthy eye.', reference:'Al-Bukhari 4/119' },
  // ── Health ─────────────────────────────────────────────────────────────────
  { id:'p46', category:'Health', title:'Healing Dua (7 times)', arabic:'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', transliteration:"As'alullahal-'Atheema rabbal-'arshil-'atheemi an yashfiyak.", translation:'I ask Almighty Allah, Lord of the Magnificent Throne, to make you well.', reference:'At-Tirmidhi 2/210' },
  { id:'p47', category:'Health', title:'Cure of Any Illness (Ruqyah)', arabic:'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا', transliteration:"Allahumma rabban-naas, athhibil-ba's, ishfi antash-shaafi, laa shifaa'a illaa shifaa'uka shifaa'an laa yughaadiru saqamaa.", translation:'O Allah, Lord of the people, remove this pain and cure it. You are the Curer and there is no cure except Yours, a cure that leaves no illness.', reference:'Al-Bukhari | Sahih Muslim' },
  // ── Special ────────────────────────────────────────────────────────────────
  { id:'p48', category:'Special', title:'Salatul Istikhara', arabic:'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ', transliteration:"Allahumma innee astakheeruka bi'ilmika wa astaqdiruka biqudratika wa as'aluka min fadlikal-'adheem.", translation:'O Allah, I seek Your guidance by virtue of Your knowledge, and I seek ability by virtue of Your power, and I ask You of Your great bounty…', reference:'Al-Bukhari 7/162' },
  { id:'p49', category:'Special', title:'Dua for Janaza (Funeral Prayer)', arabic:'اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا', transliteration:'Allahummaghfir lihayyinaa wa mayyitinaa wa shaahidinaa wa ghaa\'ibinaa.', translation:'O Allah, forgive our living and our dead, those present and those absent, our young and our old, our males and our females.', reference:'Ibn Majah 1/480' },
  { id:'p50', category:'Special', title:'Visiting the Graves', arabic:'السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ', transliteration:'Assalaamu alaykum ahlad-diyaari minal-mu\'mineena wal-muslimeen.', translation:'Peace be upon you, people of this abode, from among the believers and Muslims. We shall, by the Will of Allah, join you. I ask Allah for us and you strength.', reference:'Sahih Muslim 2/671' },
  { id:'p51', category:'Special', title:'Dua for Rain (Istisqa)', arabic:'اللَّهُمَّ أَغِثْنَا اللَّهُمَّ أَغِثْنَا اللَّهُمَّ أَغِثْنَا', transliteration:'Allahumma agithnaa, Allahumma agithnaa, Allahumma agithnaa.', translation:'O Allah, send us rain. O Allah, send us rain. O Allah, send us rain.', reference:'Al-Bukhari 1/224' },
  { id:'p52', category:'Special', title:'Upon Seeing Lightning', arabic:'اللَّهُمَّ لَا تَقْتُلْنَا بِغَضَبِكَ وَلَا تُهْلِكْنَا بِعَذَابِكَ وَعَافِنَا قَبْلَ ذَلِكَ', transliteration:"Allahumma laa taqtulanaa bighadabika wa laa tuhliknaa bi'athaabika wa 'aafinaa qabla thaalik.", translation:'O Allah, do not kill us with Your wrath, and do not destroy us with Your punishment, and pardon us before that.', reference:'At-Tirmidhi 5/518' },
  // ── Knowledge & Study ──────────────────────────────────────────────────────
  { id:'p53', category:'Knowledge', title:'Dua for Increase in Knowledge', arabic:'رَّبِّ زِدْنِي عِلْمًا', transliteration:"Rabbi zidnee 'ilmaa.", translation:'My Lord, increase me in knowledge.', reference:'Quran 20:114' },
  { id:'p54', category:'Knowledge', title:'Before Studying', arabic:'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي وَزِدْنِي عِلْمًا', transliteration:"Allahumman-fa'nee bimaa 'allamtanee wa 'allimnee maa yanfa'unee wa zidnee 'ilmaa.", translation:'O Allah, benefit me with what You have taught me, and teach me that which will benefit me, and increase me in knowledge.', reference:'Ibn Majah 1/92 | At-Tirmidhi 5/548' },
  { id:'p55', category:'Knowledge', title:'Against Forgetfulness', arabic:'سُبْحَانَكَ لَا عِلْمَ لَنَا إِلَّا مَا عَلَّمْتَنَا إِنَّكَ أَنْتَ الْعَلِيمُ الْحَكِيمُ', transliteration:"Subhaanaka laa 'ilma lanaa illaa maa 'allamtanaa innaka antal-'aleemul-hakeem.", translation:'Glory be to You! We have no knowledge except what You have taught us. Verily, it is You, the All-Knower, the All-Wise.', reference:'Quran 2:32' },
];

const CATEGORIES = ['All', ...Array.from(new Set(PRELOADED_DUAS.map(d => d.category)))];

function LearnSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [learnSearch, setLearnSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hiddenTranslations, setHiddenTranslations] = useState<Set<string>>(new Set());
  const [memorized, setMemorized] = useState<Set<string>>(new Set());

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
    const term = learnSearch.toLowerCase();
    const matchSearch = !term ||
      d.title.toLowerCase().includes(term) ||
      d.translation.toLowerCase().includes(term) ||
      (d.transliteration && d.transliteration.toLowerCase().includes(term));
    return matchCat && matchSearch;
  });

  return (
    <div className="mt-2">
      {/* Stats */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <BookOpen className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm text-muted-foreground">
          <span className="font-bold text-primary">{memorized.size}</span> / {PRELOADED_DUAS.length} duas memorized
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-primary/10 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(memorized.size / PRELOADED_DUAS.length) * 100}%` }} />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input placeholder="Search duas…" className="pl-10 bg-primary/5 border-primary/20 text-sm" value={learnSearch} onChange={e => setLearnSearch(e.target.value)} />
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-primary/5 text-muted-foreground border-primary/10 hover:border-primary/30'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Dua cards */}
      <div className="flex flex-col gap-2.5">
        {filtered.map(dua => {
          const isExpanded = expandedId === dua.id;
          const isHidden = hiddenTranslations.has(dua.id);
          const isMemorized = memorized.has(dua.id);
          return (
            <div key={dua.id} className={`rounded-xl border transition-all duration-200 overflow-hidden ${isMemorized ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/10'}`}>
              <div className="flex items-center justify-between p-3 sm:p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : dua.id)}>
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${isMemorized ? 'bg-primary' : 'bg-primary/20'}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{dua.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{dua.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isMemorized && <span className="text-[10px] text-primary font-bold uppercase tracking-wider mr-1 hidden sm:block">✓ Done</span>}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
              {isExpanded && (
                <div className="px-3 sm:px-4 pb-4 border-t border-primary/10 pt-3 animate-in fade-in duration-200">
                  {/* Arabic */}
                  {dua.arabic && <p className="text-xl sm:text-2xl font-arabic text-right leading-loose text-primary mb-3">{dua.arabic}</p>}
                  {/* Transliteration */}
                  {dua.transliteration && <p className="text-sm italic text-foreground/80 mb-3 leading-relaxed">{dua.transliteration}</p>}
                  {/* Translation toggle */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">English Translation</p>
                    <button onClick={() => toggleTranslation(dua.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      {isHidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {isHidden ? 'Reveal' : 'Hide'}
                    </button>
                  </div>
                  {isHidden ? (
                    <div className="bg-primary/5 rounded-lg p-3 text-center text-sm text-muted-foreground italic border border-dashed border-primary/20">Translation hidden — recall it!</div>
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed font-medium">{dua.translation}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-2 italic">📖 {dua.reference}</p>
                  <button onClick={() => toggleMemorized(dua.id)}
                    className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold border transition-all ${isMemorized ? 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/10' : 'bg-background text-muted-foreground border-primary/20 hover:bg-primary/5 hover:text-primary'}`}>
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

export function DuaNotepad() {
  const { duas, addDua, deleteDua, toggleDuaFavorite, editDua } = useLocalStore();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDua, setNewDua] = useState({ title: '', arabic: '', transliteration: '', translation: '', reference: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', arabic: '', transliteration: '', translation: '', reference: '' });
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'learn' | 'mynotes'>('learn');

  useEffect(() => { setIsMounted(true); }, []);

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
    setEditForm({ title: dua.title || '', arabic: dua.arabic || '', transliteration: dua.transliteration || '', translation: dua.translation || dua.text || '', reference: dua.reference || '' });
  };

  const saveEdit = (id: string) => {
    editDua(id, { title: editForm.title, arabic: editForm.arabic, transliteration: editForm.transliteration, translation: editForm.translation, reference: editForm.reference, text: editForm.translation });
    setEditingId(null);
  };

  if (!isMounted) return null;

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-3 py-3">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary">Dua Notepad</h2>
          {activeTab === 'mynotes' && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full h-10 w-10 shadow-lg shrink-0"><Plus /></Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/20 max-w-sm mx-3">
                <DialogHeader><DialogTitle className="text-primary">Add New Dua</DialogTitle></DialogHeader>
                <form onSubmit={handleAddSubmit} className="flex flex-col gap-3 py-3 max-h-[65vh] overflow-y-auto pr-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">Title</label>
                    <Input placeholder="e.g., Dua for waking up" value={newDua.title} onChange={e => setNewDua({ ...newDua, title: e.target.value })} className="bg-background text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">Arabic</label>
                    <Textarea placeholder="اَلْحَمْدُ للهِ..." dir="rtl" rows={3} value={newDua.arabic} onChange={e => setNewDua({ ...newDua, arabic: e.target.value })} className="bg-background font-arabic text-xl" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">Roman Arabic (Transliteration)</label>
                    <Textarea placeholder="Alhamdu lillahil-ladhi..." rows={2} value={newDua.transliteration} onChange={e => setNewDua({ ...newDua, transliteration: e.target.value })} className="bg-background text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">English Translation</label>
                    <Textarea placeholder="Praise is to Allah..." rows={3} value={newDua.translation} onChange={e => setNewDua({ ...newDua, translation: e.target.value })} className="bg-background text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">Reference</label>
                    <Input placeholder="e.g., Al-Bukhari" value={newDua.reference} onChange={e => setNewDua({ ...newDua, reference: e.target.value })} className="bg-background text-sm" />
                  </div>
                  <Button type="submit" disabled={!newDua.title.trim() || (!newDua.translation.trim() && !newDua.arabic.trim())} className="w-full mt-1">Save Dua</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-primary/5 border border-primary/10">
          <button onClick={() => setActiveTab('learn')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'learn' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <BookOpen className="h-3.5 w-3.5" />Learn & Memorize
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'learn' ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'}`}>{PRELOADED_DUAS.length}</span>
          </button>
          <button onClick={() => setActiveTab('mynotes')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'mynotes' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <PenTool className="h-3.5 w-3.5" />My Saved Duas
            {duas.length > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'mynotes' ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'}`}>{duas.length}</span>}
          </button>
        </div>
      </header>

      {activeTab === 'learn' ? (
        <LearnSection />
      ) : (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search your duas…" className="pl-10 bg-primary/5 border-primary/20 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filteredDuas.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <PenTool className="h-12 w-12 mx-auto opacity-20 mb-4" />
              <p className="text-sm">No duas found. Add one using the + button!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 mt-2">
              {filteredDuas.map(dua => (
                <Card key={dua.id} className="bg-primary/5 border-primary/10 relative group overflow-hidden">
                  <CardHeader className="p-3 sm:p-4 pb-2 flex flex-row items-start justify-between">
                    <div className="flex-1 pr-8 min-w-0">
                      {editingId === dua.id ? (
                        <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="mb-2 font-bold text-foreground text-sm" />
                      ) : (
                        <>
                          <CardTitle className="text-base font-bold text-foreground">{dua.title}</CardTitle>
                          <p className="text-[10px] text-muted-foreground uppercase mt-1">{dua.date}</p>
                        </>
                      )}
                    </div>
                    {editingId !== dua.id && (
                      <Button variant="ghost" size="icon" className={`h-8 w-8 shrink-0 ${dua.isFavorite ? 'text-primary' : 'text-muted-foreground'}`} onClick={() => toggleDuaFavorite(dua.id)}>
                        <Star className={dua.isFavorite ? 'fill-current' : ''} />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    {editingId === dua.id ? (
                      <div className="flex flex-col gap-2.5">
                        <Textarea value={editForm.arabic} onChange={(e) => setEditForm({...editForm, arabic: e.target.value})} placeholder="Arabic" dir="rtl" className="font-arabic text-xl bg-background/50" rows={2}/>
                        <Textarea value={editForm.transliteration} onChange={(e) => setEditForm({...editForm, transliteration: e.target.value})} placeholder="Transliteration (Roman Arabic)" className="bg-background/50 text-sm italic" rows={2}/>
                        <Textarea value={editForm.translation} onChange={(e) => setEditForm({...editForm, translation: e.target.value})} placeholder="English Translation" className="bg-background/50 text-sm" rows={2}/>
                        <Input value={editForm.reference} onChange={(e) => setEditForm({...editForm, reference: e.target.value})} placeholder="Reference" className="bg-background/50 text-xs"/>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {dua.arabic && <p className="text-xl sm:text-2xl font-arabic text-right leading-loose text-primary">{dua.arabic}</p>}
                        {dua.transliteration && <p className="text-sm italic text-foreground/80">{dua.transliteration}</p>}
                        {(dua.translation || dua.text) && <p className="text-sm text-foreground font-medium leading-relaxed">{dua.translation || dua.text}</p>}
                        {dua.reference && <p className="text-xs text-primary/70 font-semibold">{dua.reference}</p>}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-2 border-t border-primary/5 justify-end gap-1">
                    {editingId === dua.id ? (
                      <Button variant="ghost" size="sm" className="h-8 text-primary font-bold" onClick={() => saveEdit(dua.id)}><Check className="h-4 w-4 mr-1" /> Save</Button>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startEdit(dua)}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteDua(dua.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
