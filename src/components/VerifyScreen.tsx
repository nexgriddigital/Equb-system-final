import React, { useState, useEffect } from 'react';
import { Language, DrawProof } from '../types/equb';
import { translations } from '../i18n/translations';
import { verifyDrawProof } from '../services/crypto';
import { ShieldCheck, ShieldAlert, ArrowLeft, CheckCircle2, XCircle, Terminal, HelpCircle } from 'lucide-react';

interface VerifyScreenProps {
  initialProofJson?: string;
  lang: Language;
  onBack: () => void;
}

export const VerifyScreen: React.FC<VerifyScreenProps> = ({
  initialProofJson = '',
  lang,
  onBack
}) => {
  const t = translations[lang];
  const [proofText, setProofText] = useState(initialProofJson);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (initialProofJson && initialProofJson.trim().length > 0) {
      setProofText(initialProofJson);
      handleVerify(initialProofJson);
    }
  }, [initialProofJson]);

  const handleVerify = async (textToVerify?: string) => {
    const raw = (textToVerify !== undefined ? textToVerify : proofText).trim();
    if (!raw) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const parsed = JSON.parse(raw) as DrawProof;
      const result = await verifyDrawProof(parsed);
      setVerificationResult({
        ...result,
        proof: parsed
      });
    } catch (err: any) {
      setVerificationResult({
        isValid: false,
        message: lang === 'am' ? 'የተሳሳተ የ JSON ኮድ ነው' : `Invalid JSON format: ${err?.message || 'Parse error'}`
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-5 px-3 sm:px-4">
      {/* Back button & title */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 text-sm font-medium p-1 rounded-lg min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <h1 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span>{t.verifyPageTitle}</span>
        </h1>

        <button
          onClick={() => setShowExplanation(s => !s)}
          className="p-2 text-stone-500 hover:text-stone-800 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          title={t.howFairDrawWorks}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Explainer card */}
      {showExplanation && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-stone-800 space-y-2">
          <h2 className="font-bold text-amber-950 flex items-center gap-2">
            <span>{t.howFairDrawWorks}</span>
          </h2>
          <p className="leading-relaxed text-stone-700">
            {t.fairDrawExplanation}
          </p>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
            {t.pasteProofJson}
          </label>
          <textarea
            rows={7}
            value={proofText}
            onChange={e => setProofText(e.target.value)}
            placeholder={t.pasteProofPlaceholder}
            className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-500">
            {lang === 'am'
              ? 'የ Web Crypto API SHA-256 ስሌት በኮምፒውተርዎ ላይ ይከናወናል'
              : 'Verifies SHA-256 commitment & seed in-browser via Web Crypto'}
          </span>

          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || !proofText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold min-h-[44px] transition-all"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{isVerifying ? 'Verifying...' : t.verifyButton}</span>
          </button>
        </div>
      </div>

      {/* Verification Output Results */}
      {verificationResult && (
        <div className="mt-6 space-y-4 animate-in fade-in duration-200">
          {verificationResult.isValid ? (
            <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 shadow-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-emerald-950">
                    {t.verificationPassed}
                  </h3>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 bg-red-50 border border-red-300 rounded-2xl text-red-950 shadow-xs">
              <div className="flex items-center gap-3">
                <XCircle className="w-7 h-7 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-red-950">
                    {t.verificationFailed}
                  </h3>
                  <p className="text-xs text-red-800 mt-0.5">
                    {verificationResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Audit breakdown steps */}
          {verificationResult.proof && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 text-xs sm:text-sm text-stone-800">
              <h3 className="font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
                {t.proofMathematicalDetails}
              </h3>

              {/* Step 1: Commitment check */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700">1. Commitment Hash:</span>
                  {verificationResult.commitmentMatch ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold flex items-center gap-1 text-xs">
                      <XCircle className="w-3.5 h-3.5" /> Mismatch
                    </span>
                  )}
                </div>
                <div className="p-2 bg-stone-50 font-mono text-[11px] text-stone-600 rounded-lg break-all">
                  Computed: {verificationResult.computedCommitment}
                </div>
              </div>

              {/* Step 2: Seed check */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700">2. Deterministic Seed Hash:</span>
                  {verificationResult.seedMatch ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold flex items-center gap-1 text-xs">
                      <XCircle className="w-3.5 h-3.5" /> Mismatch
                    </span>
                  )}
                </div>
                <div className="p-2 bg-stone-50 font-mono text-[11px] text-stone-600 rounded-lg break-all">
                  Computed: {verificationResult.computedSeed}
                </div>
              </div>

              {/* Step 3: Winner Ticket Calculation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700">3. Mathematical Winner Resolution:</span>
                  {verificationResult.winnerMatch ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold flex items-center gap-1 text-xs">
                      <XCircle className="w-3.5 h-3.5" /> Mismatch
                    </span>
                  )}
                </div>
                <div className="p-3 bg-stone-100 rounded-xl space-y-1 text-xs">
                  <p>
                    <span className="font-semibold text-stone-900">Deterministic Winning Index:</span>{' '}
                    <span className="font-mono font-bold text-emerald-800">
                      #{verificationResult.computedWinnerIndex + 1}
                    </span>{' '}
                    out of {verificationResult.proof.totalTickets} tickets
                  </p>
                  <p>
                    <span className="font-semibold text-stone-900">Winner Name:</span>{' '}
                    <span className="font-bold text-stone-900">
                      {verificationResult.expectedWinnerName}
                    </span>
                  </p>
                  <p className="text-[11px] text-stone-500 font-mono mt-1">
                    {verificationResult.proof.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
