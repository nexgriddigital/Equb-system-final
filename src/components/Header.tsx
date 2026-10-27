import React from 'react';
import { User } from 'firebase/auth';
import { Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { Logo } from './Logo';
import { CloudSyncBadge, SyncState } from './CloudSyncBadge';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateHome: () => void;
  currentScreen?: string;
  user?: User | null;
  syncState?: SyncState;
  lastSyncedAt?: Date | null;
  localGroupCount?: number;
  cloudGroupCount?: number;
  onSyncNow?: () => Promise<void>;
  onSyncLocalToCloud?: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onNavigateHome,
  user,
  syncState = 'synced',
  lastSyncedAt = null,
  localGroupCount = 0,
  cloudGroupCount = 0,
  onSyncNow,
  onSyncLocalToCloud
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-[#0E3B2E] text-[#FFF1CC] shadow-md border-b border-[#0E3B2E]/80">
      <div className="max-w-[560px] mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand: Logo at 36px + Live Text App Name in selected language */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] rounded-lg p-1 transition-opacity hover:opacity-95 shrink-0"
          aria-label={t.appName}
        >
          {/* Logo at 36px with at least 8px clear space around it */}
          <Logo size={36} className="shadow-xs shrink-0" />

          {/* Live text app name (not baked into an image) */}
          <div className="leading-tight">
            <span className="text-base sm:text-lg font-bold tracking-tight text-[#FFF1CC] group-hover:text-[#F2B705] transition-colors font-heading block">
              {t.appName}
            </span>
            <span className="hidden xs:inline-block text-[11px] sm:text-xs text-[#FFF1CC]/75 font-normal">
              {lang === 'am' ? 'ፍትሐዊ የዕጣ መዝገብ' : 'Fair Equb Ledger'}
            </span>
          </div>
        </button>

        {/* Header Right Actions: Cloud Sync Badge + Language Switch */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Real-time Cross-device Cloud Sync Status */}
          {user && onSyncNow && onSyncLocalToCloud && (
            <CloudSyncBadge
              syncState={syncState}
              lastSyncedAt={lastSyncedAt}
              user={user}
              lang={lang}
              localGroupCount={localGroupCount}
              cloudGroupCount={cloudGroupCount}
              onSyncNow={onSyncNow}
              onSyncLocalToCloud={onSyncLocalToCloud}
            />
          )}

          {/* Language Switch */}
          <div className="flex items-center bg-[#07241C] p-0.5 rounded-lg border border-[#F2B705]/20 shadow-inner">
            <button
              onClick={() => onLanguageChange('am')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-all touch-target min-h-[38px] flex items-center justify-center ${
                lang === 'am'
                  ? 'bg-[#F2B705] text-[#0E3B2E] font-bold shadow-xs'
                  : 'text-[#FFF1CC]/80 hover:text-[#FFF1CC]'
              }`}
              aria-pressed={lang === 'am'}
            >
              አማርኛ
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-md transition-all touch-target min-h-[38px] flex items-center justify-center ${
                lang === 'en'
                  ? 'bg-[#F2B705] text-[#0E3B2E] font-bold shadow-xs'
                  : 'text-[#FFF1CC]/80 hover:text-[#FFF1CC]'
              }`}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

