import React, { useState } from 'react';
import { EqubGroup, RoundHistory, Language, AuditCorrection, DrawProof } from '../types/equb';
import { translations, formatETB, formatDate } from '../i18n/translations';
import {
  CheckCircle2,
  Share2,
  Plus,
  Calendar,
  Coins,
  UserCheck,
  ArrowLeftRight,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';

interface HistoryScreenProps {
  group: EqubGroup;
  lang: Language;
  onCheckDraw: (drawProof: DrawProof) => void;
  onOpenShare: (historyItem: RoundHistory) => void;
  onAddAuditCorrection: (roundNumber: number, correction: AuditCorrection) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  group,
  lang,
  onCheckDraw,
  onOpenShare,
  onAddAuditCorrection
}) => {
  const t = translations[lang];

  const [activeCorrectionRound, setActiveCorrectionRound] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [reason, setReason] = useState('');

  // Draw code sharing modal state inside history
  const [shareDrawCode, setShareDrawCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSaveCorrection = (roundNumber: number) => {
    if (!reason.trim()) return;

    const correction: AuditCorrection = {
      timestamp: new Date().toISOString(),
      reason: reason.trim(),
      author: authorName.trim() || (lang === 'am' ? 'አስተባባሪ' : 'Organizer')
    };

    onAddAuditCorrection(roundNumber, correction);
    setActiveCorrectionRound(null);
    setAuthorName('');
    setReason('');
  };

  const handleShareDraw = (item: RoundHistory) => {
    const code = item.drawProof?.drawCode || item.drawCode || 'EQ74AB';
    const link = `${window.location.origin}?check=${code}`;

    if (navigator.share) {
      navigator.share({
        title: `${group.name} - Round ${item.roundNumber} Draw`,
        text: `${group.name} Round ${item.roundNumber} Winner: ${item.winnerMemberName}. Check this draw with code ${code}:`,
        url: link
      }).catch(() => {
        setShareDrawCode(code);
      });
    } else {
      setShareDrawCode(code);
    }
  };

  const copyText = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-heading">
            {t.roundHistoryTitle}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {lang === 'am'
              ? 'የሁሉም ያለፉ ዙሮች የዕጣ ውጤቶች እና የክፍያ መዝገብ'
              : 'Record of all completed rounds, winners, and verified draws'}
          </p>
        </div>
      </div>

      {group.history.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center text-stone-500 space-y-2">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-800">
            {lang === 'am' ? 'እስካሁን የወጣ ዕጣ የለም' : 'No past draws recorded yet'}
          </p>
          <p className="text-xs text-stone-400">
            {lang === 'am'
              ? 'ዕጣ ለማውጣት "የአሁኑ ዙር" ገጽ ላይ "ዕጣ አውጣ" የሚለውን ይጫኑ።'
              : 'Go to "This round" to run the draw for Round 1.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {group.history.map(item => {
            const drawCode = item.drawProof?.drawCode || item.drawCode || 'EQ74AB';

            return (
              <div
                key={item.roundNumber}
                className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5"
              >
                {/* Top Row: Round # + Date + Method Tag */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center justify-center font-heading">
                      {item.roundNumber}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-stone-900 block leading-tight font-heading">
                        {t.roundNumber} {item.roundNumber}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {formatDate(item.date, lang)}
                      </span>
                    </div>
                  </div>

                  {/* Draw Method or Draw Code */}
                  <div className="flex items-center gap-1.5">
                    {drawCode && (
                      <span className="font-mono text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">
                        {drawCode}
                      </span>
                    )}
                    {item.method === 'group_decision' && (
                      <span className="text-xs font-bold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md">
                        {t.methodGroupDecision}
                      </span>
                    )}
                    {item.method === 'swap' && (
                      <span className="text-xs font-bold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md">
                        {t.methodSwap}
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Winner and Pot Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 rounded-2xl p-3">
                    <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                      {t.winner}
                    </span>
                    <span className="text-base font-bold text-stone-900 block mt-0.5">
                      {item.winnerMemberName}
                    </span>
                    {item.winningShareIndex && item.winningShareIndex > 1 && (
                      <span className="text-xs text-amber-800 font-medium">
                        ({lang === 'am' ? 'ዕጣ #2' : 'Share #2'})
                      </span>
                    )}
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-3">
                    <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                      {t.payout}
                    </span>
                    <span className="text-base font-bold text-emerald-800 tabular-nums block mt-0.5">
                      {formatETB(item.potAmount, lang)}
                    </span>
                  </div>
                </div>

                {/* Audit Corrections List */}
                {item.auditCorrections && item.auditCorrections.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      {lang === 'am' ? 'ማስታወሻዎች' : 'Notes'}:
                    </span>
                    {item.auditCorrections.map((corr, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2 bg-stone-50 rounded-xl text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                      >
                        <span>"{corr.reason}"</span>
                        <span className="text-[10px] text-stone-400">
                          {corr.author} · {new Date(corr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Correction Box */}
                {activeCorrectionRound === item.roundNumber && (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2 mt-2">
                    <h4 className="text-xs font-bold text-stone-900">{t.addCorrectionNote}</h4>
                    <input
                      type="text"
                      value={authorName}
                      onChange={e => setAuthorName(e.target.value)}
                      placeholder={t.authorName}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900"
                    />
                    <textarea
                      rows={2}
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder={t.reasonForNote}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveCorrectionRound(null)}
                        className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                      >
                        {t.cancel}
                      </button>
                      <button
                        onClick={() => handleSaveCorrection(item.roundNumber)}
                        className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold"
                      >
                        {t.saveNote}
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Actions: Check this draw & Share this draw */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    {/* "Check this draw" button */}
                    {item.drawProof && (
                      <button
                        onClick={() => onCheckDraw(item.drawProof!)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition-colors touch-target min-h-[44px]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{t.checkThisDraw}</span>
                      </button>
                    )}

                    {/* "Share this draw" button */}
                    <button
                      onClick={() => handleShareDraw(item)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors touch-target min-h-[44px]"
                    >
                      <Share2 className="w-4 h-4 text-stone-600 shrink-0" />
                      <span>{t.shareThisDraw}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveCorrectionRound(item.roundNumber)}
                    className="p-2 text-stone-400 hover:text-stone-700 text-xs font-semibold rounded-lg touch-target"
                    title={t.addCorrectionNote}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal for Draw Code / Link */}
      {shareDrawCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 font-heading">
                {t.shareThisDraw}
              </h3>
              <button
                onClick={() => setShareDrawCode(null)}
                className="text-stone-400 hover:text-stone-700 p-1 touch-target text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Draw Code Box */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  {lang === 'am' ? 'የዕጣው ኮድ' : 'Draw Code'}
                </span>
                <span className="text-3xl font-black font-mono tracking-widest text-emerald-800 block">
                  {shareDrawCode}
                </span>
              </div>

              {/* Copy Code Button */}
              <button
                onClick={() => copyText(shareDrawCode, false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors touch-target"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? (lang === 'am' ? 'ኮዱ ተቀድቷል!' : 'Code Copied!') : (lang === 'am' ? 'ኮዱን ቅዳ' : 'Copy Code')}</span>
              </button>

              {/* Copy Full Link Button */}
              <button
                onClick={() => copyText(`${window.location.origin}?check=${shareDrawCode}`, true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors touch-target"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? t.copiedLink : t.copyDrawLink}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
