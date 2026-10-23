import React, { useState } from 'react';
import { Member, Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { AlertCircle, X, Check } from 'lucide-react';

interface EmergencyQueueJumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  eligibleMembers: Member[];
  onConfirm: (memberId: string, yesCount: number, noCount: number, reason: string) => void;
  lang: Language;
}

export const EmergencyQueueJumpModal: React.FC<EmergencyQueueJumpModalProps> = ({
  isOpen,
  onClose,
  eligibleMembers,
  onConfirm,
  lang
}) => {
  const t = translations[lang];

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    eligibleMembers[0]?.id || ''
  );
  const [yesCount, setYesCount] = useState<number>(eligibleMembers.length);
  const [noCount, setNoCount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError(lang === 'am' ? 'እባክዎ አባል ይምረጡ' : 'Please select a beneficiary member');
      return;
    }
    if (!reason.trim()) {
      setError(lang === 'am' ? 'እባክዎ ምክንያቱን ያስገቡ' : 'Please explain the reason for the queue jump');
      return;
    }
    if (yesCount <= noCount) {
      setError(
        lang === 'am'
          ? 'የአስቸኳይ ጊዜ ውሳኔው ለማለፍ የደገፉ ድምፆች መብለጥ አለባቸው'
          : 'Votes in favor must exceed votes against to approve a group decision'
      );
      return;
    }

    onConfirm(selectedMemberId, yesCount, noCount, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>{t.queueJumpTitle}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            {t.queueJumpDesc}
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
              {error}
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.selectMember}
            </label>
            <select
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {eligibleMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.shares} {t.shares})
                </option>
              ))}
            </select>
          </div>

          {/* Group Vote Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                {t.votesInFavor}
              </label>
              <input
                type="number"
                min="0"
                value={yesCount}
                onChange={e => setYesCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-emerald-50/60 border border-emerald-300 rounded-xl text-sm font-bold tabular-nums text-emerald-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                {t.votesAgainst}
              </label>
              <input
                type="number"
                min="0"
                value={noCount}
                onChange={e => setNoCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold tabular-nums text-stone-800"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.emergencyReason}
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={
                lang === 'am'
                  ? 'ለምሳሌ፡ ድንገተኛ የህክምና ወጪ ወይም የንግድ አጋጣሚ...'
                  : 'e.g., Urgent medical emergency, funeral expense, or agreed family priority...'
              }
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 leading-tight">
            {lang === 'am'
              ? '📌 ይህ ውሳኔ በዑደቱ ታሪክ ላይ "የቡድን ውሳኔ" ተብሎ በግልጽ ይመዘገባል።'
              : '📌 This will be permanently recorded in the ledger as "Group Decision", not a random lottery.'}
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
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs min-h-[42px]"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{t.approveDecision}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
