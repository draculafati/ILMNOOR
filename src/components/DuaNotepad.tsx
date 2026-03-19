"use client";

import React, { useState } from 'react';
import { useLocalStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Trash2, Star, Edit2, X, PenTool } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function DuaNotepad() {
  const { duas, addDua, deleteDua, toggleDuaFavorite, editDua } = useLocalStore();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDua, setNewDua] = useState({ title: '', text: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredDuas = duas.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) || 
    d.text.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (newDua.title && newDua.text) {
      addDua(newDua);
      setNewDua({ title: '', text: '' });
      setIsAddOpen(false);
    }
  };

  const handleEdit = (id: string, title: string, text: string) => {
    editDua(id, { title, text });
    setEditingId(null);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-headline font-bold text-primary">Dua Notepad</h2>
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
              <div className="flex flex-col gap-4 py-4">
                <Input placeholder="Title (e.g., Dua for Patience)" value={newDua.title} onChange={e => setNewDua({ ...newDua, title: e.target.value })} className="bg-background" />
                <Textarea placeholder="Write your heart out..." rows={6} value={newDua.text} onChange={e => setNewDua({ ...newDua, text: e.target.value })} className="bg-background" />
                <Button onClick={handleAdd} className="w-full">Save Dua</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search your duas..." 
            className="pl-10 bg-primary/5 border-primary/20"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

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
                  <CardTitle className="text-lg font-bold text-secondary">{dua.title}</CardTitle>
                  <p className="text-[10px] text-muted-foreground uppercase mt-1">{dua.date}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${dua.isFavorite ? 'text-primary' : 'text-muted-foreground'}`}
                  onClick={() => toggleDuaFavorite(dua.id)}
                >
                  <Star className={dua.isFavorite ? 'fill-current' : ''} />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm whitespace-pre-wrap text-foreground/80 leading-relaxed">{dua.text}</p>
              </CardContent>
              <CardFooter className="p-2 border-t border-primary/5 justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditingId(dua.id)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteDua(dua.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}