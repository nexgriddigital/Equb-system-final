import React, { useState } from 'react';
import { EqubGroup, RoundHistory, Language } from '../types/equb';
import { translations, generateTelegramSummary } from '../i18n/translations';
import { getPaidMemberCount } from '../services/storage';
import { Send, Copy, Check, X } from 'lucide-react';

interface ShareModalProps {
  group: EqubGroup;
  historyItem?: RoundHistory | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  group,
  historyItem,
  isOpen,
  onClose,
  lang
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // If no specific history item is passed, use latest or current round info
  const latestRound = historyItem || (group.history.length > 0 ? group.history[group.history.length - 1] : null);

  const roundNumber = latestRound ? latestRound.roundNumber : group.currentRound;
  const winnerName = latestRound ? latestRound.winnerMemberName : 'Pending Draw';
  const potAmount = latestRound ? latestRound.potAmount : group.members.reduce((acc, m) => acc + m.shares, 0) * group.contributionAmount;
  const method = latestRound ? latestRound.method : 'lottery';
  const paidCount = getPaidMemberCount(group, roundNumber);
  const totalMembers = group.members.length;
  const proofHash = latestRound?.drawProof?.seedHash;

  const summaryText = generateTelegramSummary(
    group.name,
    roundNumber,
    winnerName,
    potAmount,
    method,
    paidCount,
    totalMembers,
    proofHash,
    lang
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
            <Send className="w-5 h-5 text-sky-600" />
            <span>{t.shareSummary}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-600">
            {lang === 'am'
              ? 'ይህን ማጠቃለያ በቀላሉ ኮፒ በማድረግ ወደ ቴሌግራም ወይም ዋትስአፕ ግሩፕ መለጠፍ ይችላሉ።'
              : 'Formatted for instant pasting into your family or friends Telegram, WhatsApp, or SMS group.'}
          </p>

          {/* Textarea preview */}
          <textarea
            readOnly
            rows={10}
            value={summaryText}
            className="w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-mono text-stone-900 leading-relaxed focus:outline-none select-all"
          />

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-stone-500">
              {lang === 'am' ? 'የተመረጠ ቋንቋ፡ አማርኛ' : 'Current Language: English'}
            </span>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all min-h-[44px] ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-sky-500 hover:bg-sky-400 text-white shadow-xs active:scale-98'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.telegramCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t.copyTelegram}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
