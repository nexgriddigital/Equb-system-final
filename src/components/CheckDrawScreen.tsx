import React, { useState, useEffect } from 'react';
import { Language, DrawProof, PublicDrawRecord } from '../types/equb';
import { translations, formatDate, formatETB } from '../i18n/translations';
import { verifyDrawProof } from '../services/crypto';
import { getPublicDrawByCode } from '../services/firebase';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Search,
  Loader2,
  Users,
  Calendar,
  Coins,
  Share2,
  ShieldCheck
} from 'lucide-react';

interface CheckDrawScreenProps {
  initialCode?: string;
  initialProof?: DrawProof | null;
  initialProofJson?: string;
  lang: Language;
  onBack: () => void;
}

export const CheckDrawScreen: React.FC<CheckDrawScreenProps> = ({
  initialCode = '',
  initialProof = null,
  initialProofJson = '',
  lang,
  onBack
}) => {
  const t = translations[lang];

  const [drawCodeInput, setDrawCodeInput] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Verification State
  const [checkedProof, setCheckedProof] = useState<DrawProof | null>(initialProof);
  const [isFair, setIsFair] = useState<boolean | null>(null);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Run calculation when proof is provided
  const runVerification = async (proof: DrawProof) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await verifyDrawProof(proof);
      setCheckedProof(proof);
      setIsFair(result.isValid);
      setCalculationResult(result);
    } catch (err: any) {
      setIsFair(false);
      setCalculationResult({ isValid: false, message: err?.message || 'Verification calculation failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // On mount: check if initial proof or JSON or code is given
  useEffect(() => {
    if (initialProof) {
      runVerification(initialProof);
    } else if (initialProofJson && initialProofJson.trim().length > 0) {
      try {
        const parsed = JSON.parse(initialProofJson) as DrawProof;
        runVerification(parsed);
      } catch {
        setLoadError(lang === 'am' ? 'የተሳሳተ የዕጣ መረጃ' : 'Invalid draw data');
      }
    } else if (initialCode && initialCode.trim().length > 0) {
      handleLookupByCode(initialCode.trim().toUpperCase());
    }
  }, [initialProof, initialProofJson, initialCode]);

  const handleLookupByCode = async (codeToLookup?: string) => {
    const code = (codeToLookup || drawCodeInput).trim().toUpperCase();
    if (!code) return;

    setIsLoading(true);
    setLoadError(null);
    setCheckedProof(null);
    setIsFair(null);

    try {
      const publicDraw = await getPublicDrawByCode(code);
      if (!publicDraw) {
        setLoadError(
          lang === 'am'
            ? `ይህ የዕጣ ኮድ (${code}) አልተገኘም። እባክዎ ኮዱን ያረጋግጡ።`
            : `Draw code "${code}" was not found. Please check the code.`
        );
        setIsLoading(false);
        return;
      }

      // Parse proof JSON
      let proof: DrawProof;
      if (typeof publicDraw.proofJson === 'string') {
        proof = JSON.parse(publicDraw.proofJson);
      } else {
        proof = publicDraw.proofJson;
      }

      proof.drawCode = code;
      await runVerification(proof);
    } catch (err: any) {
      setLoadError(
        lang === 'am'
          ? 'ዕጣውን መጫን አልተቻለም። እባክዎ እንደገና ይሞክሩ።'
          : `Failed to load draw: ${err?.message || 'Unknown error'}`
      );
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!checkedProof) return;
    navigator.clipboard.writeText(JSON.stringify(checkedProof, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleCopyShareLink = () => {
    const code = checkedProof?.drawCode || drawCodeInput.trim().toUpperCase();
    const link = `${window.location.origin}?check=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  return (
    <div className="max-w-[560px] mx-auto py-5 px-3 sm:px-4 space-y-4 pb-20">
      {/* Top Bar: Back & Help */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 text-sm font-semibold p-2 rounded-xl touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <h1 className="text-lg font-bold text-stone-900 font-heading">
          {t.wasDrawFair}
        </h1>

        <button
          onClick={() => setShowHelpModal(true)}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl touch-target transition-colors"
          title={t.howDoesThisWork}
        >
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <span className="hidden sm:inline">{t.howDoesThisWork}</span>
        </button>
      </div>

      {/* Code Search Input Box (when no proof or to check another) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
          {t.enterDrawCode}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={drawCodeInput}
              onChange={e => setDrawCodeInput(e.target.value.toUpperCase())}
              placeholder="EQ74AB"
              maxLength={8}
              className="w-full pl-3.5 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-base font-bold font-mono tracking-widest text-stone-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
          <button
            onClick={() => handleLookupByCode()}
            disabled={isLoading || !drawCodeInput.trim()}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 touch-target transition-colors shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{t.checkThisDraw}</span>
          </button>
        </div>
        <p className="text-[11px] text-stone-400">
          {lang === 'am'
            ? 'ከዕጣው በኋላ የተሰጠውን ባለ 6-ፊደል ኮድ ያስገቡ (ምሳሌ: EQ74AB)'
            : 'Enter the 6-character draw code given after the draw (e.g. EQ74AB)'}
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
          <p className="text-sm font-bold text-stone-800">{t.checkingDraw}</p>
        </div>
      )}

      {/* Error state */}
      {loadError && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs sm:text-sm space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{loadError}</span>
          </div>
        </div>
      )}

      {/* Result Display */}
      {!isLoading && isFair !== null && checkedProof && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {isFair ? (
            /* SUCCESS CARD */
            <div className="p-5 sm:p-6 bg-emerald-50 border-2 border-emerald-400 rounded-3xl text-emerald-950 shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-emerald-950 font-heading">
                    {t.drawWasFair}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-900 font-medium mt-1 leading-relaxed">
                    {t.everyoneIncluded}
                  </p>
                </div>
              </div>

              {/* Draw Summary Details */}
              <div className="bg-white/80 rounded-2xl p-4 border border-emerald-200 space-y-3 text-xs sm:text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {t.winner}
                    </span>
                    <span className="text-base font-bold text-stone-950 block mt-0.5">
                      {checkedProof.winnerMemberName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {t.roundNumber}
                    </span>
                    <span className="text-base font-bold text-stone-950 block mt-0.5">
                      {checkedProof.roundNumber}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs text-stone-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{formatDate(checkedProof.timestamp, lang)}</span>
                  </span>
                  {checkedProof.drawCode && (
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {checkedProof.drawCode}
                    </span>
                  )}
                </div>
              </div>

              {/* List of People in Draw */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>{t.peopleInDraw} ({checkedProof.eligibleTickets.length})</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {checkedProof.eligibleTickets.map((ticket, idx) => (
                    <span
                      key={ticket.ticketId}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${
                        ticket.ticketId === checkedProof.winningTicketId
                          ? 'bg-emerald-700 text-white border-emerald-800 font-bold shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      {ticket.memberName} {ticket.shareIndex > 1 ? `(2)` : ''}
                      {ticket.ticketId === checkedProof.winningTicketId ? ' ★' : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share button */}
              <div className="pt-1">
                <button
                  onClick={handleCopyShareLink}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors touch-target"
                >
                  {copiedShareLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t.copiedLink}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>{t.shareThisDraw}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* FAILURE CARD */
            <div className="p-5 sm:p-6 bg-red-50 border-2 border-red-400 rounded-3xl text-red-950 shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-red-950 font-heading">
                    {t.drawMismatch}
                  </h2>
                  <p className="text-xs sm:text-sm text-red-900 font-medium mt-1 leading-relaxed">
                    {lang === 'am'
                      ? 'የዕጣው ውጤት አልተዛመደም። አስተባባሪውን ይጠይቁ።'
                      : 'Something does not match. Ask the organizer to explain.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ADVANCED SECTION (Collapsed by default for ordinary users) */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
            <button
              onClick={() => setShowAdvanced(s => !s)}
              className="w-full px-4 py-3 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-600 transition-colors"
            >
              <span>{t.forExpertsTitle}</span>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showAdvanced && (
              <div className="p-4 space-y-4 text-xs font-mono text-stone-700 border-t border-stone-200 bg-stone-50/50">
                <div>
                  <span className="font-bold text-stone-800 block mb-1">Commitment:</span>
                  <div className="p-2 bg-stone-900 text-amber-300 rounded-lg break-all select-all text-[11px]">
                    {checkedProof.commitmentHash}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-stone-800 block mb-1">Seed:</span>
                  <div className="p-2 bg-stone-900 text-emerald-300 rounded-lg break-all select-all text-[11px]">
                    {checkedProof.seedHash}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-stone-800 block mb-1">
                    Participant Inputs ({checkedProof.memberInputs?.length || 0}):
                  </span>
                  <div className="space-y-1">
                    {checkedProof.memberInputs?.map((inp, idx) => (
                      <div key={idx} className="p-1.5 bg-stone-100 rounded text-[11px] flex justify-between">
                        <span>{inp.memberName}:</span>
                        <span className="font-bold">"{inp.input}"</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied JSON</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.copyRawJson}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* "HOW DOES THIS WORK?" HELP MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  ✓
                </div>
                <h3 className="text-base font-bold text-stone-900 font-heading">
                  {t.howDoesThisWork}
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold p-1 touch-target"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-stone-700 text-xs sm:text-sm leading-relaxed">
              <div className="flex gap-3 p-3 bg-stone-50 rounded-2xl">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <p>{t.howWorksStep1}</p>
              </div>

              <div className="flex gap-3 p-3 bg-stone-50 rounded-2xl">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <p>{t.howWorksStep2}</p>
              </div>

              <div className="flex gap-3 p-3 bg-stone-50 rounded-2xl">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <p>{t.howWorksStep3}</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 bg-stone-900 text-white rounded-2xl text-xs font-bold touch-target"
            >
              {lang === 'am' ? 'ገባኝ' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
