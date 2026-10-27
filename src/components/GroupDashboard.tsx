import React, { useState } from 'react';
import { EqubGroup, Language, RoundHistory } from '../types/equb';
import { translations, formatETB, formatDate } from '../i18n/translations';
import {
  getTotalShares,
  getPotAmount,
  getPaidMemberCount,
  getMemberWinCount,
  getMemberRemainingShares,
  isCycleComplete
} from '../services/storage';
import { PaymentsScreen } from './PaymentsScreen';
import { RoundHealthChart } from './RoundHealthChart';

const HistoryScreen = React.lazy(() =>
  import('./HistoryScreen').then(m => ({ default: m.HistoryScreen }))
);
import {
  Coins,
  Calendar,
  Users,
  Trophy,
  ArrowRight,
  Send,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface GroupDashboardProps {
  group: EqubGroup;
  isOrganizer: boolean;
  lang: Language;
  onBack: () => void;
  onEditGroup: (group: EqubGroup) => void;
  onDeleteGroup: (id: string) => void;
  onGoToDrawRoom: () => void;
  onTogglePayment: (memberId: string) => void;
  onMarkAllPayments: (paid: boolean) => void;
  onOpenProof: (historyItem: RoundHistory) => void;
  onOpenShare: (historyItem?: RoundHistory | null) => void;
  onAddAuditCorrection: (roundNumber: number, correction: any) => void;
}

type DashboardTab = 'roster' | 'payments' | 'history';

export const GroupDashboard: React.FC<GroupDashboardProps> = ({
  group,
  isOrganizer,
  lang,
  onBack,
  onEditGroup,
  onDeleteGroup,
  onGoToDrawRoom,
  onTogglePayment,
  onMarkAllPayments,
  onOpenProof,
  onOpenShare,
  onAddAuditCorrection
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<DashboardTab>('roster');
  const [copiedInvite, setCopiedInvite] = useState(false);

  const totalShares = getTotalShares(group);
  const potAmount = getPotAmount(group);
  const currentRound = group.currentRound;
  const cycleFinished = isCycleComplete(group);
  const paidCount = getPaidMemberCount(group, currentRound);
  const roundPayments = group.payments[currentRound] || {};

  const handleCopyInvite = () => {
    const code = (group as any).inviteCode || '';
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  return (
    <div className="py-4 px-3 sm:px-4 max-w-[560px] md:max-w-[720px] mx-auto space-y-4 pb-24">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 text-sm font-semibold p-1 rounded-xl touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.groups}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpenShare(null)}
            className="flex items-center gap-1 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl border border-sky-200 transition-colors touch-target"
          >
            <Send className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">{t.shareSummary}</span>
          </button>

          {isOrganizer && (
            <>
              <button
                onClick={() => onEditGroup(group)}
                className="p-2 text-stone-500 hover:text-stone-900 rounded-xl touch-target flex items-center justify-center"
                title={t.editGroup}
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (window.confirm(t.deleteConfirm)) {
                    onDeleteGroup(group.id);
                  }
                }}
                className="p-2 text-stone-400 hover:text-red-600 rounded-xl touch-target flex items-center justify-center"
                title={t.deleteGroup}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Group Header Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>
              {group.interval === 'weekly'
                ? t.weekly
                : group.interval === 'biweekly'
                ? t.biweekly
                : t.monthly}{' '}
              · {formatDate(group.startDate, lang)}
            </span>

            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                isOrganizer ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'
              }`}
            >
              {isOrganizer ? t.roleOrganizer : t.roleMember}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-heading">
            {group.name}
          </h1>
        </div>

        {/* 2x2 Metric Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              {t.currentRound}
            </span>
            <span className="text-base font-bold text-stone-900 tabular-nums">
              {cycleFinished ? totalShares : currentRound} / {totalShares}
            </span>
          </div>

          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              {t.potSize}
            </span>
            <span className="text-base font-bold text-stone-900 tabular-nums font-heading">
              {formatETB(potAmount, lang)}
            </span>
          </div>

          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              {t.status}
            </span>
            <span className="text-xs font-bold text-emerald-800">
              {paidCount}/{group.members.length} {t.paid}
            </span>
          </div>

          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              {t.contributionAmount}
            </span>
            <span className="text-base font-bold text-stone-900 tabular-nums font-heading">
              {formatETB(group.contributionAmount, lang)}
            </span>
          </div>
        </div>

        {/* Invite Code row */}
        {(group as any).inviteCode && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">
              {t.inviteCodeLabel}:{' '}
              <strong className="font-mono text-stone-900 tracking-wider">
                {(group as any).inviteCode}
              </strong>
            </span>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold touch-target"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copyInviteCode}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Draw Room Button */}
        {!cycleFinished ? (
          <button
            onClick={onGoToDrawRoom}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm rounded-xl shadow-xs transition-transform active:scale-98 touch-target"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>{t.enterDrawRoom}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-3 bg-emerald-100 text-emerald-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{t.cycleCompleted}</span>
          </div>
        )}
      </div>

      {/* Visual Chart: Collected vs. Outstanding Payments (Recharts) */}
      <RoundHealthChart
        group={group}
        lang={lang}
        onGoToPayments={() => setActiveTab('payments')}
      />

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-2xl">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all touch-target ${
            activeTab === 'roster'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {t.members} ({group.members.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all touch-target ${
            activeTab === 'payments'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {t.payments} ({paidCount}/{group.members.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all touch-target ${
            activeTab === 'history'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {t.history} ({group.history.length})
        </button>
      </div>

      {/* Tab 1: Member Roster (Stacked Mobile Cards) */}
      {activeTab === 'roster' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-2 sm:p-3 shadow-xs space-y-2">
          {group.members.map((member, index) => {
            const wins = getMemberWinCount(group, member.id);
            const remaining = getMemberRemainingShares(group, member);
            const isPaid = !!roundPayments[member.id];

            return (
              <div
                key={member.id}
                className="p-3 bg-stone-50 border border-stone-100 rounded-xl flex items-center justify-between gap-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-stone-900">
                        {member.name}
                      </span>
                      {member.shares === 2 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded">
                          2x
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {t.winsRatio}: {wins}/{member.shares} · {remaining} {t.remainingShares}
                    </div>
                  </div>
                </div>

                {/* Paid badge */}
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-stone-200/80 text-stone-600'
                  }`}
                >
                  {isPaid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <XCircle className="w-3.5 h-3.5 text-stone-400" />}
                  <span>{isPaid ? t.paid : t.unpaid}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Payments */}
      {activeTab === 'payments' && (
        <PaymentsScreen
          group={group}
          isOrganizer={isOrganizer}
          lang={lang}
          onTogglePayment={onTogglePayment}
          onMarkAll={onMarkAllPayments}
          onGoToDraw={onGoToDrawRoom}
        />
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <React.Suspense fallback={<div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" /></div>}>
          <HistoryScreen
            group={group}
            lang={lang}
            onCheckDraw={proof => onOpenProof({ drawProof: proof } as any)}
            onOpenShare={item => onOpenShare(item)}
            onAddAuditCorrection={onAddAuditCorrection}
          />
        </React.Suspense>
      )}
    </div>
  );
};
