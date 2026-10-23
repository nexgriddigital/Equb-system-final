import React from 'react';
import { EqubGroup, Language } from '../types/equb';
import { translations, formatETB } from '../i18n/translations';
import { getPaidMemberCount, getMemberRemainingShares, getMemberWinCount } from '../services/storage';
import { Check, X, CheckCheck, RotateCcw, ArrowRight, ShieldAlert } from 'lucide-react';

interface PaymentsScreenProps {
  group: EqubGroup;
  isOrganizer: boolean;
  lang: Language;
  onTogglePayment: (memberId: string) => void;
  onMarkAll: (paid: boolean) => void;
  onGoToDraw: () => void;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({
  group,
  isOrganizer,
  lang,
  onTogglePayment,
  onMarkAll,
  onGoToDraw
}) => {
  const t = translations[lang];
  const round = group.currentRound;
  const currentPayments = group.payments[round] || {};

  const paidCount = getPaidMemberCount(group, round);
  const totalMembers = group.members.length;
  const percentage = Math.round((paidCount / Math.max(1, totalMembers)) * 100);

  const collectedETB = group.members.reduce((sum, m) => {
    return sum + (currentPayments[m.id] ? m.shares * group.contributionAmount : 0);
  }, 0);
  const targetPotETB = group.members.reduce((sum, m) => sum + m.shares, 0) * group.contributionAmount;

  return (
    <div className="space-y-4 pb-24">
      {/* Non-organizer notice */}
      {!isOrganizer && (
        <div className="p-3 bg-stone-100 border border-stone-200 rounded-2xl text-xs text-stone-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{t.memberViewOnlyWarning}</span>
        </div>
      )}

      {/* Progress & Totals */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-stone-500">
              {t.roundNumber} {round}
            </span>
            <h2 className="text-lg font-bold text-stone-900 font-heading">
              {t.payments}
            </h2>
          </div>

          {/* Quick Mark All Buttons (Organizer only) */}
          {isOrganizer && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onMarkAll(true)}
                className="flex items-center gap-1 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors touch-target"
              >
                <CheckCheck className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">{t.markAllPaid}</span>
              </button>
              <button
                type="button"
                onClick={() => onMarkAll(false)}
                className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors touch-target flex items-center justify-center"
                title={t.markAllUnpaid}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
            <div
              className="h-full bg-emerald-700 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span>
              {t.totalCollected}: <strong className="text-stone-900 tabular-nums">{formatETB(collectedETB, lang)}</strong>
            </span>
            <span>
              {paidCount} / {totalMembers} {t.paid}
            </span>
          </div>
        </div>
      </div>

      {/* Stacked Member Cards (touch targets >= 48px, accessible, no horizontal scroll) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-2 sm:p-3 shadow-xs space-y-2">
        {group.members.map((member, index) => {
          const isPaid = !!currentPayments[member.id];
          const remainingShares = getMemberRemainingShares(group, member);
          const winsSoFar = getMemberWinCount(group, member.id);
          const contributionRequired = member.shares * group.contributionAmount;

          return (
            <button
              key={member.id}
              type="button"
              disabled={!isOrganizer}
              onClick={() => isOrganizer && onTogglePayment(member.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all touch-target ${
                isPaid
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-stone-50 border-stone-200'
              } ${isOrganizer ? 'hover:border-stone-400 active:scale-[0.99] cursor-pointer' : 'cursor-default'}`}
              aria-label={`${member.name}, ${isPaid ? t.paid : t.unpaid}`}
            >
              {/* Member details */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isPaid ? 'bg-emerald-200 text-emerald-900' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-stone-900">
                      {member.name}
                    </span>
                    {member.shares === 2 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded">
                        2 {t.shares}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-stone-700 tabular-nums">
                      {formatETB(contributionRequired, lang)}
                    </span>
                    <span>·</span>
                    <span>
                      {t.winsRatio}: {winsSoFar}/{member.shares}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 touch-target ${
                  isPaid
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-300'
                }`}
              >
                {isPaid ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{t.paid}</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-500" />
                    <span>{t.unpaid}</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar for Draw Room */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGoToDraw}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-amber-400 hover:bg-amber-300 active:scale-98 text-stone-950 font-bold text-base rounded-2xl shadow-md transition-all touch-target"
        >
          <span>{t.enterDrawRoom}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
