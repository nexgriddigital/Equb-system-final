import React, { useState } from 'react';
import { Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { unsubscribeMember } from '../services/notifications';
import { BellOff, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface PublicUnsubscribeScreenProps {
  groupId: string;
  memberId: string;
  lang: Language;
  onGoToApp: () => void;
}

export const PublicUnsubscribeScreen: React.FC<PublicUnsubscribeScreenProps> = ({
  groupId,
  memberId,
  lang,
  onGoToApp
}) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const ok = await unsubscribeMember(groupId, memberId);
      if (ok) {
        setUnsubscribed(true);
      } else {
        setError(
          lang === 'am'
            ? 'ከማሳወቂያዎች መሰረዝ አልተቻለም። እባክዎ እንደገና ይሞክሩ።'
            : 'Failed to unsubscribe. Please try again.'
        );
      }
    } catch (e: any) {
      setError(e?.message || 'Error unsubscribing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-stone-50 text-stone-900 flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg space-y-5 text-center">
        {unsubscribed ? (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 font-heading">
              {lang === 'am' ? 'ከማሳወቂያዎች ተሰርዘዋል' : 'Unsubscribed Successfully'}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {lang === 'am'
                ? 'ከዚህ ቡድን ምንም አይነት የኢሜይል ማስታወሻዎች አይላኩሎትም።'
                : 'You will no longer receive email notifications for this group.'}
            </p>
            <button
              onClick={onGoToApp}
              className="mt-4 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-bold touch-target"
            >
              {lang === 'am' ? 'ወደ መተግበሪያው ሂድ' : 'Go to Equb App'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
              <BellOff className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 font-heading">
              {lang === 'am' ? 'ከማሳወቂያዎች መሰረዝ' : 'Unsubscribe from Notifications'}
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              {lang === 'am'
                ? 'ለዚህ የእቁብ ቡድን የሚላኩ የክፍያ ማስታወሻዎች እና የዕጣ ውጤቶች እንዳይደርሱዎት እርግጠኛ ነዎት?'
                : 'Are you sure you want to stop receiving payment reminders and draw results for this group?'}
            </p>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 touch-target transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{lang === 'am' ? 'አዎ፣ ከማሳወቂያዎች ሰርዝ' : 'Yes, Unsubscribe'}</span>
              </button>
              <button
                onClick={onGoToApp}
                className="w-full py-2.5 text-stone-500 hover:text-stone-800 text-xs font-semibold"
              >
                {lang === 'am' ? 'ተመለስ' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
