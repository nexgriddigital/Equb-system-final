import React, { useState } from 'react';
import { Member, Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { ArrowLeftRight, X, Check } from 'lucide-react';

interface SwapSharesModalProps {
  isOpen: boolean;
  onClose: () => void;
  unwonMembers: Member[];
  onConfirm: (memberAId: string, memberBId: string, note: string) => void;
  lang: Language;
}

export const SwapSharesModal: React.FC<SwapSharesModalProps> = ({
  isOpen,
  onClose,
  unwonMembers,
  onConfirm,
  lang
}) => {
  const t = translations[lang];

  const [memberAId, setMemberAId] = useState<string>(unwonMembers[0]?.id || '');
  const [memberBId, setMemberBId] = useState<string>(unwonMembers[1]?.id || '');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberAId || !memberBId) {
      setError(lang === 'am' ? 'እባክዎ ሁለቱንም አባላት ይምረጡ' : 'Please select both members');
      return;
    }
    if (memberAId === memberBId) {
      setError(lang === 'am' ? 'አንድ አባል ከራሱ ጋር መለዋወጥ አይችልም' : 'Please select two distinct members');
      return;
    }
    if (!note.trim()) {
      setError(lang === 'am' ? 'እባክዎ የመለዋወጫ ማስታወሻ ያስገቡ' : 'Please enter an agreement note');
      return;
    }

    onConfirm(memberAId, memberBId, note.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
            <span>{t.swapTitle}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">{t.swapDesc}</p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
              {error}
            </div>
          )}

          {/* Member A */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.memberA}
            </label>
            <select
              value={memberAId}
              onChange={e => setMemberAId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {unwonMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.shares} {t.shares})
                </option>
              ))}
            </select>
          </div>

          {/* Member B */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.memberB}
            </label>
            <select
              value={memberBId}
              onChange={e => setMemberBId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {unwonMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.shares} {t.shares})
                </option>
              ))}
            </select>
          </div>

          {/* Reason note */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.swapReason}
            </label>
            <textarea
              rows={2}
              required
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={
                lang === 'am'
                  ? 'ለምሳሌ፡ በሁለቱ አባላት የጋራ ስምምነት እና በአስተባባሪው እውቅና...'
                  : 'e.g., Mutual agreement between both parties witnessed by organizer...'
              }
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-xl min-h-[42px]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs min-h-[42px]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{t.executeSwap}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
