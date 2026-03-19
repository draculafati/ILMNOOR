"use client";

import React, { useState } from 'react';
import { useLocalStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Key, ExternalLink, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Settings() {
  const { settings, updateSettings } = useLocalStore();
  const { toast } = useToast();
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ hfToken: e.target.value });
    setTestResult(null);
  };

  const testConnection = async () => {
    if (!settings.hfToken) {
      toast({
        variant: "destructive",
        title: "Token Required",
        description: "Please enter a token before testing."
      });
      return;
    }

    setTestLoading(true);
    setTestResult(null);
    try {
      const response = await fetch("https://api-inference.huggingface.co/models/tarteel-ai/whisper-base-ar-quran", {
        method: "POST",
        headers: { Authorization: `Bearer ${settings.hfToken}` },
        body: JSON.stringify({ inputs: "" }), // Small ping
      });
      
      if (response.status === 200 || response.status === 503) {
        // 503 means model is loading, which still implies token is valid
        setTestResult('success');
        toast({
          title: "Success",
          description: "Connection established with Hugging Face API."
        });
      } else {
        throw new Error("Invalid token");
      }
    } catch (err) {
      setTestResult('error');
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Please check your API token and try again."
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1 py-4">
        <h2 className="text-3xl font-headline font-bold text-primary">Settings</h2>
        <p className="text-muted-foreground">Manage your AI configurations and profile</p>
      </header>

      <div className="grid grid-cols-1 gap-6 mt-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="text-primary h-5 w-5" />
              <CardTitle className="text-lg">AI Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Key className="h-4 w-4" /> Hugging Face API Token
              </label>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  placeholder="hf_..." 
                  value={settings.hfToken || ''} 
                  onChange={handleTokenChange}
                  className="bg-background border-primary/20"
                />
                <Button variant="secondary" onClick={testConnection} disabled={testLoading}>
                  {testLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Connection'}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-1">
                <a 
                  href="https://huggingface.co/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  Get free token at huggingface.co/settings/tokens <ExternalLink className="h-3 w-3" />
                </a>
                {testResult === 'success' && <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase"><CheckCircle2 className="h-3 w-3" /> Verified</div>}
                {testResult === 'error' && <div className="flex items-center gap-1 text-[10px] text-destructive font-bold uppercase"><XCircle className="h-3 w-3" /> Failed</div>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20 opacity-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Location Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">
              Currently using detected location: {settings.location?.city || 'Not set'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
