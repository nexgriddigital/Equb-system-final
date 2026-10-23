import React, { useState, useEffect } from 'react';
import { Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  lang: Language;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ lang }) => {
  const t = translations[lang];
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="bg-amber-600 text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between gap-3 shadow-md sticky top-0 z-50 animate-in slide-in-from-top duration-200"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
        <span>{t.offlineBanner}</span>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1"
      >
        <RefreshCw className="w-3 h-3" />
        <span>{t.retryBtn}</span>
      </button>
    </div>
  );
};
