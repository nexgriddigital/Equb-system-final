import React from 'react';
import { Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { Users, Coins, History, Settings } from 'lucide-react';

export type MainTab = 'groups' | 'current_round' | 'history' | 'settings';

interface BottomTabBarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  lang: Language;
  hasActiveGroup: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  lang,
  hasActiveGroup
}) => {
  const t = translations[lang];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-[560px] mx-auto grid grid-cols-4 h-16 px-1">
        {/* Tab 1: Groups */}
        <button
          type="button"
          onClick={() => onTabChange('groups')}
          className={`flex flex-col items-center justify-center touch-target transition-colors relative ${
            activeTab === 'groups'
              ? 'text-[#0E3B2E] font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          {activeTab === 'groups' && (
            <span className="absolute top-1 w-8 h-1 bg-[#0E3B2E] rounded-full" />
          )}
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight truncate max-w-[80px]">
            {t.navGroups}
          </span>
        </button>

        {/* Tab 2: Current Round */}
        <button
          type="button"
          onClick={() => onTabChange('current_round')}
          className={`flex flex-col items-center justify-center touch-target transition-colors relative ${
            activeTab === 'current_round'
              ? 'text-[#0E3B2E] font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          {activeTab === 'current_round' && (
            <span className="absolute top-1 w-8 h-1 bg-[#0E3B2E] rounded-full" />
          )}
          <Coins className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight truncate max-w-[80px]">
            {t.navThisRound}
          </span>
        </button>

        {/* Tab 3: History */}
        <button
          type="button"
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center touch-target transition-colors relative ${
            activeTab === 'history'
              ? 'text-[#0E3B2E] font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          {activeTab === 'history' && (
            <span className="absolute top-1 w-8 h-1 bg-[#0E3B2E] rounded-full" />
          )}
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight truncate max-w-[80px]">
            {t.navHistory}
          </span>
        </button>

        {/* Tab 4: Settings */}
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center touch-target transition-colors relative ${
            activeTab === 'settings'
              ? 'text-[#0E3B2E] font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          {activeTab === 'settings' && (
            <span className="absolute top-1 w-8 h-1 bg-[#0E3B2E] rounded-full" />
          )}
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight truncate max-w-[80px]">
            {t.navSettings}
          </span>
        </button>
      </div>
    </nav>
  );
};
