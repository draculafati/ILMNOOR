"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { ALADHAN_API_BASE } from '@/lib/api';

export function IslamicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hijriMonths, setHijriMonths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCalendar = async (year: number, month: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${ALADHAN_API_BASE}/gToHCalendar/${month + 1}/${year}`);
      const data = await res.json();
      setHijriMonths(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentDate(next);
  };

  const IMPORTANT_DATES = [
    { day: 1, month: 'Shawwal', name: 'Eid ul Fitr' },
    { day: 10, month: 'Dhul-Hijjah', name: 'Eid ul Adha' },
    { day: 1, month: 'Muharram', name: 'Islamic New Year' },
    { day: 10, month: 'Muharram', name: 'Ashura' }
  ];

  const getDayEvent = (hijriDay: any) => {
    return IMPORTANT_DATES.find(d => 
      parseInt(hijriDay.day) === d.day && 
      hijriDay.month.en === d.month
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-headline font-bold text-primary">Islamic Calendar</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}><ChevronLeft /></Button>
            <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}><ChevronRight /></Button>
          </div>
        </div>
        <p className="text-secondary font-bold text-lg">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </header>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-primary">Loading Calendar...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] uppercase tracking-widest text-muted-foreground pb-2">{d}</div>
          ))}
          {hijriMonths.map((day: any, i: number) => {
            const event = getDayEvent(day.hijri);
            return (
              <Card key={i} className={`h-24 p-1 overflow-hidden transition-all ${event ? 'border-primary bg-primary/10' : 'bg-primary/5 border-transparent'}`}>
                <div className="flex flex-col h-full items-center justify-between">
                  <span className="text-xs opacity-50">{day.gregorian.day}</span>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-headline font-bold text-secondary leading-none">{day.hijri.day}</span>
                    <span className="text-[8px] uppercase tracking-tighter text-primary">{day.hijri.month.en}</span>
                  </div>
                  {event ? (
                    <div className="w-full bg-primary text-[8px] font-bold text-primary-foreground py-0.5 px-1 truncate text-center rounded">
                      {event.name}
                    </div>
                  ) : <div className="h-3" />}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <section className="mt-10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Upcoming Important Dates</h3>
        <div className="flex flex-col gap-3">
          {IMPORTANT_DATES.map(d => (
            <div key={d.name} className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
              <Star className="text-primary fill-current h-4 w-4" />
              <div className="flex-1">
                <p className="font-bold text-secondary">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.day} {d.month}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
