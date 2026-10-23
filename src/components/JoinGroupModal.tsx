import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { joinGroupByCode } from '../services/firebase';
import { Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { KeyRound, X, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  lang: Language;
  onJoined: (groupId: string) => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  isOpen,
  onClose,
  user,
  lang,
  onJoined
}) => {
  const t = translations[lang];

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 5) {
      setError(t.invalidInviteCode);
      return;
    }

    setLoading(true);
    setError(null);

    const res = await joinGroupByCode(cleanCode, user);
    setLoading(false);

    if (res.success && res.groupId) {
      onJoined(res.groupId);
      onClose();
    } else {
      setError(t.invalidInviteCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-sm shadow-xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-base font-heading">
            <KeyRound className="w-5 h-5 text-amber-600" />
            <span>{t.joinWithCode}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg touch-target flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            {lang === 'am'
              ? 'ከእቁብ አስተባባሪው የተሰጠዎትን ባለ 6-ፊደል የመጋበዣ ኮድ እዚህ ያስገቡ።'
              : 'Enter the 6-character code shared by your Equb organizer to join.'}
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.enterInviteCode}
            </label>
            <input
              type="text"
              required
              maxLength={8}
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder={t.inviteCodePlaceholder}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-center text-xl font-bold tracking-widest text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 rounded-xl touch-target"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || code.trim().length < 5}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-98 disabled:opacity-40 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all touch-target"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{t.joinBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
