import React, { useState } from 'react';
import { EqubGroup, Member, Language, Interval } from '../types/equb';
import { translations, formatETB } from '../i18n/translations';
import {
  Plus,
  Trash2,
  Calendar,
  Coins,
  Users,
  ArrowLeft,
  Check,
  Sparkles,
  Loader2,
  Mail,
  Bell,
  Info
} from 'lucide-react';

interface GroupFormProps {
  initialGroup?: EqubGroup | null;
  lang: Language;
  onSave: (groupData: {
    name: string;
    contributionAmount: number;
    interval: Interval;
    startDate: string;
    members: Array<{ id?: string; name: string; shares: 1 | 2; phone?: string; email?: string }>;
    emailNotifications?: {
      paymentReminders: boolean;
      winnerAlert: boolean;
      memberResults: boolean;
      monthlySummary: boolean;
      reminderDays: number[];
    };
  }) => Promise<void>;
  onCancel: () => void;
  onLoadDemo?: () => void;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  initialGroup,
  lang,
  onSave,
  onCancel,
  onLoadDemo
}) => {
  const t = translations[lang];

  const [name, setName] = useState(initialGroup?.name || '');
  const [contributionAmount, setContributionAmount] = useState<number>(
    initialGroup?.contributionAmount || 2000
  );
  const [interval, setInterval] = useState<Interval>(initialGroup?.interval || 'monthly');
  const [startDate, setStartDate] = useState(
    initialGroup?.startDate || new Date().toISOString().split('T')[0]
  );

  const [members, setMembers] = useState<
    Array<{ id: string; name: string; shares: 1 | 2; phone?: string; email?: string }>
  >(
    initialGroup?.members && initialGroup.members.length > 0
      ? initialGroup.members.map(m => ({
          id: m.id,
          name: m.name,
          shares: m.shares,
          phone: m.phone,
          email: m.email || ''
        }))
      : [
          { id: 'm1', name: '', shares: 1, email: '' },
          { id: 'm2', name: '', shares: 1, email: '' },
          { id: 'm3', name: '', shares: 1, email: '' }
        ]
  );

  // Email Notification Settings
  const [paymentReminders, setPaymentReminders] = useState(
    initialGroup?.emailNotifications?.paymentReminders ?? true
  );
  const [winnerAlert, setWinnerAlert] = useState(
    initialGroup?.emailNotifications?.winnerAlert ?? true
  );
  const [memberResults, setMemberResults] = useState(
    initialGroup?.emailNotifications?.memberResults ?? true
  );
  const [monthlySummary, setMonthlySummary] = useState(
    initialGroup?.emailNotifications?.monthlySummary ?? true
  );
  const [reminderDays, setReminderDays] = useState<number[]>(
    initialGroup?.emailNotifications?.reminderDays || [-3, -1, 0, 2]
  );

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberShares, setNewMemberShares] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalShares = members.reduce((sum, m) => sum + (m.shares || 1), 0);
  const totalPot = totalShares * (contributionAmount || 0);

  const handleAddMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMemberName.trim()) return;

    setMembers(prev => [
      ...prev,
      {
        id: 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: newMemberName.trim(),
        shares: newMemberShares,
        email: newMemberEmail.trim() || undefined
      }
    ]);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberShares(1);
    setError(null);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdateMember = (id: string, field: 'name' | 'email', value: string) => {
    setMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleToggleShares = (id: string) => {
    setMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, shares: m.shares === 1 ? 2 : 1 } : m))
    );
  };

  const toggleReminderDay = (day: number) => {
    setReminderDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(lang === 'am' ? 'እባክዎ የእቁቡን ስም ያስገቡ' : 'Please provide an Equb group name');
      return;
    }

    const validMembers = members.filter(m => m.name.trim().length > 0);
    if (validMembers.length < 1) {
      setError(t.atLeastTwoMembersRequired);
      return;
    }

    if (contributionAmount <= 0) {
      setError(lang === 'am' ? 'የመዋጮ መጠኑ ከ 0 መብለጥ አለበት' : 'Contribution amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        contributionAmount: Number(contributionAmount),
        interval,
        startDate,
        members: validMembers.map(m => ({
          id: m.id,
          name: m.name.trim(),
          shares: m.shares,
          phone: m.phone,
          email: m.email?.trim() || undefined
        })),
        emailNotifications: {
          paymentReminders,
          winnerAlert,
          memberResults,
          monthlySummary,
          reminderDays
        }
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to save group');
      setLoading(false);
    }
  };

  return (
    <div className="py-4 px-3 sm:px-4 max-w-[560px] mx-auto pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 text-sm font-semibold p-1 rounded-xl touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.back}</span>
        </button>

        <h1 className="text-xl font-bold text-stone-900 font-heading">
          {initialGroup ? t.editGroup : t.newGroup}
        </h1>

        {!initialGroup && onLoadDemo && (
          <button
            type="button"
            onClick={onLoadDemo}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl touch-target"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo (6)</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs">
            {error}
          </div>
        )}

        {/* Basics Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-stone-500 flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-700" />
            <span>{lang === 'am' ? 'የእቁብ መሠረታዊ መረጃ' : 'Equb Basics'}</span>
          </h2>

          {/* Group Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.groupName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.groupNamePlaceholder}
              className="w-full px-3.5 py-3 bg-stone-50 border border-stone-300 rounded-xl text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Contribution amount */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.contributionAmount} (ETB) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="50"
                step="50"
                required
                value={contributionAmount}
                onChange={e => setContributionAmount(Number(e.target.value))}
                className="w-full pl-3.5 pr-14 py-3 bg-stone-50 border border-stone-300 rounded-xl text-base text-stone-900 font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-3.5 top-3.5 text-xs font-bold text-stone-500 pointer-events-none">
                ETB
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">{t.contributionHelp}</p>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.interval}
            </label>
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
              {(['weekly', 'biweekly', 'monthly'] as Interval[]).map(int => (
                <button
                  key={int}
                  type="button"
                  onClick={() => setInterval(int)}
                  className={`py-2 text-xs font-bold rounded-lg transition-colors touch-target ${
                    interval === int
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {int === 'weekly' ? t.weekly : int === 'biweekly' ? t.biweekly : t.monthly}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {t.startDate}
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3.5 py-3 bg-stone-50 border border-stone-300 rounded-xl text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Calendar className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Pot Preview */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between text-xs text-stone-700">
            <div>
              <span className="font-bold text-stone-900">{members.filter(m => m.name.trim()).length}</span> {t.members} · <span className="font-bold text-stone-900">{totalShares}</span> {lang === 'am' ? 'አጠቃላይ ድርሻ' : 'total shares'}
            </div>
            <div className="text-right">
              <span className="text-stone-500 block text-[10px] uppercase font-bold">{t.potSize}:</span>
              <span className="text-base font-bold text-amber-900 tabular-nums font-heading">
                {formatETB(totalPot, lang)}
              </span>
            </div>
          </div>
        </div>

        {/* Member Roster Card with Optional Emails */}
        <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-wider font-bold text-stone-500 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>{t.members} ({members.length})</span>
            </h2>
            <span className="text-xs text-stone-500">1 or 2 shares</span>
          </div>

          {/* Organizer Notice Note */}
          <div className="p-3 bg-stone-50 rounded-2xl flex items-start gap-2 text-xs text-stone-600 border border-stone-200">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>{t.memberEmailNote}</span>
          </div>

          {/* Member rows */}
          <div className="space-y-3">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>

                  <input
                    type="text"
                    value={member.name}
                    onChange={e => handleUpdateMember(member.id, 'name', e.target.value)}
                    placeholder={`${t.memberName} #${index + 1}`}
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-base text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() => handleToggleShares(member.id)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors shrink-0 touch-target ${
                      member.shares === 2
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    {member.shares === 2 ? `2 ${t.shares}` : `1 ${t.shares}`}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={members.length <= 1}
                    className="p-2 text-stone-400 hover:text-red-600 disabled:opacity-30 rounded-xl touch-target flex items-center justify-center shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Optional Email input */}
                <div className="flex items-center gap-2 pl-9">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <input
                    type="email"
                    value={member.email || ''}
                    onChange={e => handleUpdateMember(member.id, 'email', e.target.value)}
                    placeholder={t.optionalEmailPlaceholder}
                    className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add row */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                placeholder={t.memberNamePlaceholder}
                className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="button"
                onClick={() => setNewMemberShares(s => (s === 1 ? 2 : 1))}
                className={`px-3 py-2 text-xs font-bold rounded-xl border shrink-0 touch-target ${
                  newMemberShares === 2
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                {newMemberShares === 2 ? `2 ${t.shares}` : `1 ${t.shares}`}
              </button>

              <button
                type="button"
                onClick={() => handleAddMember()}
                disabled={!newMemberName.trim()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors touch-target shrink-0 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                value={newMemberEmail}
                onChange={e => setNewMemberEmail(e.target.value)}
                placeholder={t.optionalEmailPlaceholder}
                className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Email Notification Toggles & Schedule */}
        <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-stone-500 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-700" />
            <span>{t.emailScheduleSettings}</span>
          </h2>

          <div className="space-y-3">
            {/* Payment Reminders Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
              <span className="text-xs font-semibold text-stone-800">{t.paymentRemindersToggle}</span>
              <input
                type="checkbox"
                checked={paymentReminders}
                onChange={e => setPaymentReminders(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </div>

            {/* Reminder Schedule Days */}
            {paymentReminders && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-stone-600 block">
                  {t.reminderScheduleDays}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { day: -3, label: t.daysBefore3 },
                    { day: -1, label: t.daysBefore1 },
                    { day: 0, label: t.dueDay },
                    { day: 2, label: t.daysOverdue2 }
                  ].map(item => (
                    <button
                      key={item.day}
                      type="button"
                      onClick={() => toggleReminderDay(item.day)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                        reminderDays.includes(item.day)
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-white text-stone-600 border-stone-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Winner Alert Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
              <span className="text-xs font-semibold text-stone-800">{t.winnerAlertToggle}</span>
              <input
                type="checkbox"
                checked={winnerAlert}
                onChange={e => setWinnerAlert(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </div>

            {/* Member Results Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
              <span className="text-xs font-semibold text-stone-800">{t.memberResultsToggle}</span>
              <input
                type="checkbox"
                checked={memberResults}
                onChange={e => setMemberResults(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </div>

            {/* Monthly Summary Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
              <span className="text-xs font-semibold text-stone-800">{t.monthlySummaryToggle}</span>
              <input
                type="checkbox"
                checked={monthlySummary}
                onChange={e => setMonthlySummary(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 rounded-xl touch-target"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 active:scale-98 rounded-xl shadow-xs transition-transform touch-target"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
            <span>{t.saveGroup}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
