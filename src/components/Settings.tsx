"use client";

import React from 'react';
import { useLocalStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export function Settings() {
  const { settings } = useLocalStore();

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1 py-4">
        <h2 className="text-3xl font-headline font-bold text-primary">Settings</h2>
        <p className="text-muted-foreground">Manage your application profile</p>
      </header>

      <div className="grid grid-cols-1 gap-6 mt-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="text-primary h-5 w-5" />
              <CardTitle className="text-lg">Location Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">
              Your location is used to calculate accurate prayer times and Islamic calendar dates.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-background border border-primary/10">
              <span className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Current City</span>
              <span className="font-bold text-secondary">{settings.location?.city || 'Detecting Location...'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
