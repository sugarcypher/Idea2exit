import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Cookie, Settings } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      accepted_at: new Date().toISOString()
    }));
    setShow(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      accepted_at: new Date().toISOString()
    }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t border-border/40 shadow-lg" data-testid="cookie-consent">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold mb-1">We value your privacy</h3>
            <p className="text-sm text-muted-foreground mb-3">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies.
            </p>
            
            {showDetails && (
              <div className="mb-4 p-4 bg-muted/50 rounded-lg text-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Essential Cookies</span>
                    <p className="text-xs text-muted-foreground">Required for the site to function</p>
                  </div>
                  <span className="text-xs text-green-500">Always Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Analytics Cookies</span>
                    <p className="text-xs text-muted-foreground">Help us improve our services</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Marketing Cookies</span>
                    <p className="text-xs text-muted-foreground">Personalized advertisements</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={acceptAll} size="sm" data-testid="accept-all-cookies">
                Accept All
              </Button>
              <Button onClick={acceptEssential} variant="outline" size="sm" data-testid="accept-essential-cookies">
                Essential Only
              </Button>
              <Button 
                onClick={() => setShowDetails(!showDetails)} 
                variant="ghost" 
                size="sm"
                className="gap-1"
              >
                <Settings className="w-4 h-4" />
                {showDetails ? 'Hide' : 'Details'}
              </Button>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={acceptEssential} className="flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
