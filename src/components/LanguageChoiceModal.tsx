import React from 'react';
import { Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { Check, Globe } from 'lucide-react';

interface LanguageChoiceModalProps {
  isOpen: boolean;
  onSelectLanguage: (lang: Language) => void;
}

export const LanguageChoiceModal: React.FC<LanguageChoiceModalProps> = ({
  isOpen,
  onSelectLanguage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <Globe className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-stone-900 font-heading">
            ቋንቋ ይምረጡ / Choose Language
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Welcome to Equb Draw (እቁብ ዕጣ). Please select your preferred language:
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Amharic Option */}
          <button
            type="button"
            onClick={() => onSelectLanguage('am')}
            className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-amber-50/70 border-2 border-stone-200 hover:border-amber-400 rounded-2xl transition-all min-h-[56px] text-left active:scale-[0.98]"
          >
            <div>
              <span className="text-lg font-bold text-stone-900 block font-heading-amharic">
                አማርኛ
              </span>
              <span className="text-xs text-stone-500">Amharic (Ethiopian)</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              ዕጣ
            </div>
          </button>

          {/* English Option */}
          <button
            type="button"
            onClick={() => onSelectLanguage('en')}
            className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-amber-50/70 border-2 border-stone-200 hover:border-amber-400 rounded-2xl transition-all min-h-[56px] text-left active:scale-[0.98]"
          >
            <div>
              <span className="text-lg font-bold text-stone-900 block font-heading">
                English
              </span>
              <span className="text-xs text-stone-500">English (Global)</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
              EN
            </div>
          </button>
        </div>

        <p className="text-xs text-stone-400 pt-1">
          You can change your language anytime in Settings.
        </p>
      </div>
    </div>
  );
};
