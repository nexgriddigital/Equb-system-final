import React, { useState } from 'react';
import { DrawProof, Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { ShieldCheck, Copy, Check, ExternalLink, X, Hash, Cpu } from 'lucide-react';

interface ProofModalProps {
  proof: DrawProof;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigateToVerify: (proofJson: string) => void;
}

export const ProofModal: React.FC<ProofModalProps> = ({
  proof,
  isOpen,
  onClose,
  lang,
  onNavigateToVerify
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const proofJson = JSON.stringify(proof, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(proofJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {t.proofModalTitle} — {t.roundNumber} {proof.roundNumber}
              </h3>
              <p className="text-[11px] text-stone-400">
                {new Date(proof.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Proof Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-800 text-xs sm:text-sm">
          {/* Winner Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800 block">
                {t.winner}
              </span>
              <span className="text-base font-bold text-emerald-950">
                {proof.winnerMemberName}
              </span>
              <span className="text-xs text-emerald-700 ml-2">
                (Ticket #{proof.winningIndex + 1} of {proof.totalTickets})
              </span>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-emerald-600 text-white font-mono text-[11px] font-semibold rounded-md">
                VALID PROOF
              </span>
            </div>
          </div>

          {/* Cryptographic Hashes */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1">
                <Hash className="w-3.5 h-3.5 text-amber-600" />
                <span>1. {t.commitmentHashLabel}</span>
              </div>
              <div className="p-2.5 bg-stone-900 text-amber-300 font-mono text-[11px] rounded-lg break-all select-all">
                {proof.commitmentHash}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {t.commitmentExplanation}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 mb-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. {t.seedHashLabel}</span>
              </div>
              <div className="p-2.5 bg-stone-900 text-emerald-300 font-mono text-[11px] rounded-lg break-all select-all">
                {proof.seedHash}
              </div>
            </div>
          </div>

          {/* Mathematical Step Explanation */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1.5">
            <h4 className="font-semibold text-xs text-stone-900">
              {t.proofMathematicalDetails}
            </h4>
            <p className="text-[11px] text-stone-600 font-mono leading-relaxed">
              {proof.explanation}
            </p>
          </div>

          {/* Participant Inputs */}
          <div>
            <h4 className="font-semibold text-xs text-stone-900 mb-2">
              {t.memberInputsRecorded} ({proof.memberInputs.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {proof.memberInputs.map((input, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-stone-800">{input.memberName}:</span>
                  <span className="font-mono bg-stone-200/80 px-2 py-0.5 rounded text-stone-900">
                    "{input.input}"
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligible Tickets at Draw */}
          <div>
            <h4 className="font-semibold text-xs text-stone-900 mb-2">
              {t.eligibleTicketsAtDraw} ({proof.eligibleTickets.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {proof.eligibleTickets.map((ticket, idx) => (
                <span
                  key={ticket.ticketId}
                  className={`px-2 py-1 rounded text-xs font-medium border ${
                    ticket.ticketId === proof.winningTicketId
                      ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
                      : 'bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  #{idx + 1} {ticket.memberName} {ticket.shareIndex > 1 ? `(s${ticket.shareIndex})` : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded-xl min-h-[42px] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied JSON!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateToVerify(proofJson);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl min-h-[42px] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t.recomputeAndVerify}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
