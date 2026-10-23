import React from 'react';
import { Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { Info } from 'lucide-react';

interface NoticeBannerProps {
  lang: Language;
  expanded?: boolean;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ lang, expanded = false }) => {
  const t = translations[lang];

  return (
    <aside
      aria-label="App purpose statement"
      className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 sm:p-4 text-stone-800"
    >
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-md bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs sm:text-sm leading-relaxed">
          <p className="font-medium text-stone-900 mb-0.5">
            {lang === 'am' ? 'ማስታወሻ፡ ገንዘብ አያያዝን በተመለከተ' : 'Friendly Reminder: Zero Money Handling'}
          </p>
          <p className="text-stone-700">
            {expanded ? t.disclaimer : t.disclaimerShort}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            {lang === 'am'
              ? 'ክፍያዎች በቀጥታ በአባላት መካከል በቴሌብር፣ በሲቢኢ ብር፣ በባንክ ወይም በጥሬ ገንዘብ ይከናወናሉ።'
              : 'Members settle directly between themselves via Telebirr, CBE, Awash, or cash.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
