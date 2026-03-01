import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function TermsOfService() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const response = await api.get('/legal/terms');
      setContent(response.data);
    } catch (error) {
      console.error('Failed to load terms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="terms-page">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{content?.title || 'Terms of Service'}</h1>
              <p className="text-sm text-muted-foreground">Last updated: {content?.last_updated}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-transparent p-0">
            {content?.content}
          </pre>
        </div>
      </main>
    </div>
  );
}
