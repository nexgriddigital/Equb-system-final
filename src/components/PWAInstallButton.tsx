import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';
import { Language } from '../types/equb';

interface PWAInstallButtonProps {
  lang?: Language;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang = 'am',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center justify-center gap-2 rounded-xl bg-[#0E3B2E] hover:bg-[#07241C] px-4 py-3 text-sm font-bold text-[#FFF1CC] shadow-xs active:scale-98 transition touch-target focus:outline-none focus:ring-2 focus:ring-[#F2B705] ${className}`}
      >
        <Download className="w-4 h-4 text-[#F2B705]" />
        <span>{lang === 'am' ? 'መተግበሪያውን ስልክ ላይ ጫን' : 'Install App on Phone'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-800 shadow-xs transition touch-target ${className}`}
        >
          <Smartphone className="w-4 h-4 text-[#0E3B2E]" />
          <span>{lang === 'am' ? 'በ iPhone / iPad ላይ ጫን' : 'Install on iPhone'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900 font-heading">
                  {lang === 'am' ? 'በ iPhone / iPad ላይ መጫኛ' : 'Install on iPhone / iPad'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-stone-600 space-y-2">
                <p>
                  1. {lang === 'am' ? 'በ Safari ታችኛው ክፍል የሚገኘውን የ' : 'Tap the '}
                  <strong>{lang === 'am' ? 'ማጋሪያ (Share)' : 'Share'}</strong>
                  {lang === 'am' ? ' ምልክት ይጫኑ።' : ' button in Safari.'}
                </p>
                <p>
                  2. {lang === 'am' ? 'ዝቅ ብለው ' : 'Scroll down and tap '}
                  <strong>{lang === 'am' ? '«ወደ መነሻ ገጽ ጨምር» (Add to Home Screen)' : 'Add to Home Screen'}</strong>
                  {lang === 'am' ? ' የሚለውን ይምረጡ።' : '.'}
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#0E3B2E] py-2.5 text-sm font-bold text-[#FFF1CC] hover:bg-[#07241C]"
              >
                {lang === 'am' ? 'ገባኝ' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
