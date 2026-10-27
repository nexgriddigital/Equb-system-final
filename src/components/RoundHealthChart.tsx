import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { EqubGroup, Language } from '../types/equb';
import { translations, formatETB } from '../i18n/translations';
import { getTotalShares, getPotAmount } from '../services/storage';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  PieChart as PieIcon,
  BarChart3,
  ArrowRight
} from 'lucide-react';

interface RoundHealthChartProps {
  group: EqubGroup;
  lang: Language;
  onGoToPayments?: () => void;
}

export const RoundHealthChart: React.FC<RoundHealthChartProps> = ({
  group,
  lang,
  onGoToPayments
}) => {
  const t = translations[lang];
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');

  const currentRound = group.currentRound;
  const roundPayments = group.payments[currentRound] || {};
  const potAmount = getPotAmount(group);

  // Calculate collected vs outstanding amounts based on member shares
  let collectedAmount = 0;
  let paidMembersCount = 0;

  group.members.forEach(m => {
    const isPaid = !!roundPayments[m.id];
    if (isPaid) {
      paidMembersCount += 1;
      collectedAmount += (m.shares || 1) * group.contributionAmount;
    }
  });

  const outstandingAmount = Math.max(0, potAmount - collectedAmount);
  const unpaidMembersCount = group.members.length - paidMembersCount;
  const percentage = potAmount > 0 ? Math.round((collectedAmount / potAmount) * 100) : 0;

  // Chart data
  const pieData = [
    {
      name: t.totalCollected,
      value: collectedAmount,
      color: '#0E3B2E', // Brand deep green
      count: paidMembersCount
    },
    {
      name: t.outstanding,
      value: outstandingAmount,
      color: '#F2B705', // Brand gold
      count: unpaidMembersCount
    }
  ];

  // For Bar Chart view
  const barData = [
    {
      name: t.totalCollected,
      amount: collectedAmount,
      fill: '#0E3B2E'
    },
    {
      name: t.outstanding,
      amount: outstandingAmount,
      fill: '#F2B705'
    }
  ];

  // Health assessment
  const isComplete = percentage === 100;
  const isHealthy = percentage >= 70;

  const healthStatus = isComplete
    ? {
        label: t.healthExcellent,
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        icon: CheckCircle2,
        iconClass: 'text-emerald-700'
      }
    : isHealthy
    ? {
        label: t.healthGood,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        icon: TrendingUp,
        iconClass: 'text-amber-700'
      }
    : {
        label: t.healthNeedsAttention,
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
        icon: AlertCircle,
        iconClass: 'text-rose-700'
      };

  const HealthIcon = healthStatus.icon;

  // Custom tooltip for clean ETB display
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-stone-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-stone-700">
          <p className="font-semibold text-stone-300">{data.name}</p>
          <p className="font-bold text-sm text-[#F2B705] font-heading mt-0.5">
            {formatETB(data.value, lang)}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">
            {potAmount > 0 ? Math.round((data.value / potAmount) * 100) : 0}% of pot
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Title, Health Badge, and Chart View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900 font-heading">
              {t.groupHealth}
            </h2>
            <span className="text-xs text-stone-400">·</span>
            <span className="text-xs text-stone-500 font-medium">
              {t.currentRound} {currentRound}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {t.collectionProgress} ({percentage}%)
          </p>
        </div>

        {/* View toggle (Donut vs Bar) */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType('donut')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              chartType === 'donut'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Donut Chart"
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Donut</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              chartType === 'bar'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Bars</span>
          </button>
        </div>
      </div>

      {/* Health Status Indicator Banner */}
      <div
        className={`px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-2 text-xs font-medium ${healthStatus.badgeClass}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <HealthIcon className={`w-4 h-4 shrink-0 ${healthStatus.iconClass}`} />
          <span className="truncate">{healthStatus.label}</span>
        </div>
        <span className="font-bold text-xs shrink-0 font-mono">
          {percentage}%
        </span>
      </div>

      {/* Chart Visualization Area */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1">
        {/* Recharts Container */}
        <div className="w-full sm:w-1/2 h-[190px] relative flex items-center justify-center">
          {chartType === 'donut' ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={potAmount > 0 && collectedAmount > 0 && outstandingAmount > 0 ? 4 : 0}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl sm:text-2xl font-extrabold text-stone-900 tabular-nums font-heading">
                  {percentage}%
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  {t.paid}
                </span>
              </div>
            </>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 15, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis type="number" hide domain={[0, potAmount || 1]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#57534e' }}
                  width={85}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="amount"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Breakdown Card Details */}
        <div className="w-full sm:w-1/2 space-y-2.5">
          {/* Collected Metric */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0E3B2E] shrink-0 shadow-xs" />
              <div>
                <span className="text-xs font-bold text-stone-800 block">
                  {t.totalCollected}
                </span>
                <span className="text-[11px] text-stone-500">
                  {paidMembersCount} / {group.members.length} {t.membersPaidCount}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-[#0E3B2E] font-heading tabular-nums block">
                {formatETB(collectedAmount, lang)}
              </span>
              <span className="text-[10px] text-stone-400 tabular-nums">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Outstanding Metric */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#F2B705] shrink-0 shadow-xs" />
              <div>
                <span className="text-xs font-bold text-stone-800 block">
                  {t.outstanding}
                </span>
                <span className="text-[11px] text-stone-500">
                  {unpaidMembersCount} {t.unpaid}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-amber-700 font-heading tabular-nums block">
                {formatETB(outstandingAmount, lang)}
              </span>
              <span className="text-[10px] text-stone-400 tabular-nums">
                {100 - percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action / Helper footer if payments are pending */}
      {outstandingAmount > 0 && onGoToPayments && (
        <div className="pt-1 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-stone-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {unpaidMembersCount} {t.pendingPaymentsWarning}
            </span>
          </span>
          <button
            type="button"
            onClick={onGoToPayments}
            className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold p-1 touch-target transition-colors"
          >
            <span>{t.payments}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
