import React, { useState } from 'react';
import { EqubGroup, Language } from '../types/equb';
import { translations, formatETB, formatDate } from '../i18n/translations';
import { getTotalShares, getPotAmount, getPaidMemberCount, isCycleComplete } from '../services/storage';
import { NoticeBanner } from './NoticeBanner';
import { User } from 'firebase/auth';
import {
  Plus,
  KeyRound,
  Users,
  Coins,
  ChevronRight,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  Share2,
  Search,
  X
} from 'lucide-react';
import { Logo } from './Logo';

interface HomeScreenProps {
  groups: EqubGroup[];
  user: User;
  lang: Language;
  onSelectGroup: (group: EqubGroup) => void;
  onNewGroup: () => void;
  onOpenJoinCode: () => void;
  onLoadDemo: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  groups,
  user,
  lang,
  onSelectGroup,
  onNewGroup,
  onOpenJoinCode,
  onLoadDemo
}) => {
  const t = translations[lang];
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const cleanQuery = searchQuery.trim().toLowerCase();
  const digitsOnlyQuery = searchQuery.replace(/\D/g, '');

  const filteredGroups = groups.filter(group => {
    if (!cleanQuery) return true;

    // 1. Match group name
    if (group.name.toLowerCase().includes(cleanQuery)) return true;

    // 2. Match invite code
    if (group.inviteCode && group.inviteCode.toLowerCase().includes(cleanQuery)) return true;

    // 3. Match member name or phone
    return group.members.some(member => {
      const nameMatch = member.name.toLowerCase().includes(cleanQuery);
      const phoneDigits = (member.phone || '').replace(/\D/g, '');
      const phoneMatch = Boolean(digitsOnlyQuery && phoneDigits.includes(digitsOnlyQuery));
      return nameMatch || phoneMatch;
    });
  });

  const handleCopyInvite = (e: React.MouseEvent, inviteCode: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(inviteCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="py-4 px-3 sm:px-4 max-w-[560px] md:max-w-[720px] mx-auto space-y-5 pb-24">
      {/* Notice Banner */}
      <NoticeBanner lang={lang} expanded />

      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-heading">
            {t.myGroups}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {user.displayName || user.email?.split('@')[0]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Join with code */}
          <button
            type="button"
            onClick={onOpenJoinCode}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors touch-target"
          >
            <KeyRound className="w-4 h-4 text-amber-700" />
            <span>{t.joinWithCode}</span>
          </button>

          {/* Create new equb */}
          <button
            type="button"
            onClick={onNewGroup}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#0E3B2E] hover:bg-[#07241C] text-[#FFF1CC] rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-98 transition-all touch-target focus:ring-2 focus:ring-[#F2B705]"
          >
            <Plus className="w-4 h-4 text-[#F2B705]" />
            <span>{t.newGroup}</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {groups.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
          {/* Logo at 64px with low opacity above the Create a group button */}
          <div className="flex justify-center mx-auto pb-1">
            <Logo size={64} className="opacity-35 rounded-[14px]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 font-heading">
              {t.noGroupsYet}
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
              {t.noGroupsDesc}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={onNewGroup}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0E3B2E] hover:bg-[#07241C] text-[#FFF1CC] font-bold text-sm rounded-xl shadow-xs transition-colors touch-target focus:outline-none focus:ring-2 focus:ring-[#F2B705]"
            >
              <Plus className="w-4 h-4 text-[#F2B705]" />
              <span>{t.createFirstGroup}</span>
            </button>

            <button
              type="button"
              onClick={onOpenJoinCode}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm rounded-xl transition-colors touch-target"
            >
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span>{t.joinWithCode}</span>
            </button>

            <button
              type="button"
              onClick={onLoadDemo}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-amber-900 hover:text-amber-950 underline pt-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.loadDemo}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Groups List with Search */
        <div className="space-y-3.5">
          {/* Search Bar */}
          <div className="space-y-1.5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchGroupsPlaceholder}
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0E3B2E]/30 focus:border-[#0E3B2E] transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="flex items-center justify-between px-1 text-[11px] text-stone-500">
                <span>
                  {lang === 'am'
                    ? `የተገኙ እቁቦች፡ ${filteredGroups.length} ከ ${groups.length}`
                    : `Showing ${filteredGroups.length} of ${groups.length} groups`}
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-amber-800 hover:text-amber-950 font-semibold"
                >
                  {t.clearFilter}
                </button>
              </div>
            )}
          </div>

          {filteredGroups.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-2">
              <Search className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-700">
                {t.noMatchingGroups}
              </p>
              <p className="text-xs text-stone-400 font-mono">
                "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold touch-target"
              >
                {t.clearFilter}
              </button>
            </div>
          ) : (
            filteredGroups.map(group => {
              const totalShares = getTotalShares(group);
              const pot = getPotAmount(group);
              const cycleCompleted = isCycleComplete(group);
              const paidCount = getPaidMemberCount(group, group.currentRound);
              const isOrganizer = (group as any).organizerUid === user.uid;

              // Find matching members if query exists
              const matchedMembers = cleanQuery
                ? group.members.filter(m => {
                    const nMatch = m.name.toLowerCase().includes(cleanQuery);
                    const pDigits = (m.phone || '').replace(/\D/g, '');
                    const pMatch = Boolean(digitsOnlyQuery && pDigits.includes(digitsOnlyQuery));
                    return nMatch || pMatch;
                  })
                : [];

              return (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className="group cursor-pointer bg-white border border-stone-200 hover:border-emerald-600/70 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                {/* Top: Metadata & Role Tag */}
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-medium text-stone-600">
                    {group.interval === 'weekly'
                      ? t.weekly
                      : group.interval === 'biweekly'
                      ? t.biweekly
                      : t.monthly}
                    {' · '}
                    {formatDate(group.startDate, lang)}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      isOrganizer
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {isOrganizer ? t.roleOrganizer : t.roleMember}
                  </span>
                </div>

                {/* Name & Round Badge */}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors font-heading">
                    {group.name}
                  </h2>

                  {cycleCompleted ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[11px] font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>Done</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-800 rounded-md text-[11px] font-bold shrink-0">
                      {t.roundNumber} {group.currentRound}/{totalShares}
                    </span>
                  )}
                </div>

                {/* Matching members preview if search query matched a member */}
                {matchedMembers.length > 0 && !group.name.toLowerCase().includes(cleanQuery) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-amber-800 font-semibold uppercase">
                      {lang === 'am' ? 'የተገኘ አባል፡' : 'Matched member:'}
                    </span>
                    {matchedMembers.slice(0, 3).map(m => (
                      <span
                        key={m.id}
                        className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-[11px] font-medium"
                      >
                        {m.name} {m.phone ? `(${m.phone})` : ''}
                      </span>
                    ))}
                    {matchedMembers.length > 3 && (
                      <span className="text-[10px] text-stone-400">
                        +{matchedMembers.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                      {t.potSize}
                    </span>
                    <span className="text-sm font-bold text-stone-900 tabular-nums font-heading">
                      {formatETB(pot, lang)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                      {t.members}
                    </span>
                    <span className="text-sm font-semibold text-stone-800">
                      {group.members.length} ({totalShares} {t.shares})
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Invite Code & Open Arrow */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  {/* Invite Code button */}
                  {(group as any).inviteCode ? (
                    <button
                      type="button"
                      onClick={e => handleCopyInvite(e, (group as any).inviteCode)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-mono font-bold transition-colors touch-target"
                      title={t.copyInviteCode}
                    >
                      {copiedCode === (group as any).inviteCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-stone-500" />
                          <span>Code: {(group as any).inviteCode}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-stone-500">
                      {paidCount}/{group.members.length} {t.paid}
                    </span>
                  )}

                  <span className="flex items-center gap-1 text-emerald-800 font-bold">
                    <span>{lang === 'am' ? 'ክፈት' : 'Open'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          }))}
        </div>
      )}
    </div>
  );
};
