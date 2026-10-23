import React, { useState, useEffect } from 'react';
import {
  EqubGroup,
  Language,
  EligibleTicket,
  MemberEntropyInput,
  DrawProof,
  RoundHistory
} from '../types/equb';
import { translations, formatETB } from '../i18n/translations';
import {
  getEligibleTickets,
  getPotAmount,
  getMemberRemainingShares
} from '../services/storage';
import {
  computeCommitment,
  computeSeed,
  deterministicPickWinner
} from '../services/crypto';
import { db, submitMemberInput, recordFinalDraw, recordEmergencyDecision, recordShareSwap } from '../services/firebase';
import { sendDrawNotificationEmails } from '../services/notifications';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { DrawWheel } from './DrawWheel';
import { EmergencyQueueJumpModal } from './EmergencyQueueJumpModal';
import { SwapSharesModal } from './SwapSharesModal';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Sparkles,
  ArrowLeft,
  Maximize2,
  Minimize2,
  AlertTriangle,
  RotateCw,
  Trophy,
  ArrowLeftRight,
  UserCheck,
  CheckCircle2,
  Hash,
  Send,
  Users
} from 'lucide-react';

interface DrawRoomProps {
  group: EqubGroup;
  user: User;
  isOrganizer: boolean;
  lang: Language;
  onBack: () => void;
  onDrawCompleted: () => void;
}

type DrawPhase =
  | 'eligibility_review'
  | 'entropy_inputs'
  | 'ready_to_spin'
  | 'spinning'
  | 'winner_revealed';

export const DrawRoom: React.FC<DrawRoomProps> = ({
  group,
  user,
  isOrganizer,
  lang,
  onBack,
  onDrawCompleted
}) => {
  const t = translations[lang];
  const round = group.currentRound;
  const potAmount = getPotAmount(group);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [phase, setPhase] = useState<DrawPhase>('eligibility_review');

  // Eligible tickets calculation
  const eligibleTickets = getEligibleTickets(group, round);

  // Commitment state
  const [commitmentTimestamp, setCommitmentTimestamp] = useState<string>('');
  const [commitmentHash, setCommitmentHash] = useState<string>('');

  // Live entropy inputs from Firestore subcollection: `groups/{groupId}/rounds/{roundNumber}/inputs`
  const [liveInputs, setLiveInputs] = useState<Record<string, { memberName: string; input: string }>>({});
  const [myInput, setMyInput] = useState('');
  const [myInputSubmitted, setMyInputSubmitted] = useState(false);
  const [inputSubmitting, setInputSubmitting] = useState(false);

  // Seed state
  const [seedHash, setSeedHash] = useState<string>('');
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [winningTicket, setWinningTicket] = useState<EligibleTicket | null>(null);
  const [algorithmDetails, setAlgorithmDetails] = useState<string>('');
  const [drawProof, setDrawProof] = useState<DrawProof | null>(null);
  const [isSavingDraw, setIsSavingDraw] = useState(false);

  // Modals state
  const [isQueueJumpOpen, setIsQueueJumpOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);

  // Real-time listener for member inputs from Firestore
  useEffect(() => {
    const inputsPath = `groups/${group.id}/rounds/${round}/inputs`;
    const unsubscribe = onSnapshot(collection(db, inputsPath), snapshot => {
      const inputsMap: Record<string, { memberName: string; input: string }> = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        inputsMap[docSnap.id] = {
          memberName: data.memberName || 'Member',
          input: data.input || ''
        };
      });
      setLiveInputs(inputsMap);

      if (inputsMap[user.uid]) {
        setMyInput(inputsMap[user.uid].input);
        setMyInputSubmitted(true);
      }
    }, err => {
      console.warn('Realtime inputs listener warning:', err.message);
    });

    return () => unsubscribe();
  }, [group.id, round, user.uid]);

  // Distinct eligible members
  const eligibleMembersMap = new Map();
  eligibleTickets.forEach(t => {
    if (!eligibleMembersMap.has(t.memberId)) {
      eligibleMembersMap.set(t.memberId, t.memberName);
    }
  });
  const distinctEligibleMembers = Array.from(eligibleMembersMap.entries()).map(
    ([id, name]) => ({ id, name })
  );

  const unwonMembers = group.members.filter(
    m => getMemberRemainingShares(group, m) > 0
  );

  // Step 1: Lock list & compute commitment (Organizer only)
  const handleLockAndCommit = async () => {
    if (eligibleTickets.length === 0) return;
    const now = new Date().toISOString();
    setCommitmentTimestamp(now);
    const hash = await computeCommitment(round, now, eligibleTickets);
    setCommitmentHash(hash);
    setPhase('entropy_inputs');
  };

  // Quick helper for organizer to fill inputs for absent members
  const handleQuickFillEntropy = async () => {
    const funWords = [
      'andinet', 'selam', 'habesha', 'teff', 'coffee', 'finfine', 'tana', 'lalibela', 'axum', 'awash'
    ];
    for (let i = 0; i < distinctEligibleMembers.length; i++) {
      const m = distinctEligibleMembers[i];
      if (!liveInputs[m.id]) {
        const randWord = funWords[i % funWords.length];
        const randNum = Math.floor(100 + Math.random() * 900);
        await submitMemberInput(group.id, round, m.id, m.name, `${randWord}-${randNum}`);
      }
    }
  };

  // Submit my own member input from my phone
  const handleSubmitMyInput = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!myInput.trim()) return;

    setInputSubmitting(true);
    const myName = user.displayName || user.email?.split('@')[0] || 'Member';
    await submitMemberInput(group.id, round, user.uid, myName, myInput.trim());
    setInputSubmitting(false);
    setMyInputSubmitted(true);
  };

  // Step 2: Combine inputs & compute seed (Organizer only)
  const handleComputeSeedAndPrepare = async () => {
    // Combine all inputs
    const formattedInputs: MemberEntropyInput[] = distinctEligibleMembers.map(m => {
      const live = liveInputs[m.id];
      return {
        memberId: m.id,
        memberName: m.name,
        input: live ? live.input : `input-${m.id.substring(0, 4)}`
      };
    });

    const computedSeed = await computeSeed(commitmentHash, round, formattedInputs);
    setSeedHash(computedSeed);

    const { winningIndex: pickIndex, details } = deterministicPickWinner(
      computedSeed,
      eligibleTickets.length
    );

    const winner = eligibleTickets[pickIndex];
    setWinningIndex(pickIndex);
    setWinningTicket(winner);
    setAlgorithmDetails(details);

    const proof: DrawProof = {
      roundNumber: round,
      timestamp: commitmentTimestamp,
      eligibleTickets,
      commitmentHash,
      memberInputs: formattedInputs,
      seedHash: computedSeed,
      winningTicketId: winner.ticketId,
      winnerMemberId: winner.memberId,
      winnerMemberName: winner.memberName,
      winningIndex: pickIndex,
      totalTickets: eligibleTickets.length,
      explanation: details
    };
    setDrawProof(proof);
    setPhase('ready_to_spin');
  };

  const handleStartSpin = () => {
    if (phase !== 'ready_to_spin') return;
    setPhase('spinning');
  };

  const handleSpinFinished = () => {
    setPhase('winner_revealed');
  };

  // Confirm winner and advance round in Firestore
  const handleConfirmWinnerAndAdvance = async () => {
    if (!winningTicket || !drawProof) return;
    setIsSavingDraw(true);

    const isLastRoundInCycle = group.history.length + 1 >= group.members.reduce((a, b) => a + b.shares, 0);

    try {
      const drawCode = await recordFinalDraw(
        group.id,
        group.name,
        round,
        drawProof,
        potAmount,
        isLastRoundInCycle
      );

      // Trigger email notifications in background
      sendDrawNotificationEmails({
        group,
        roundNumber: round,
        winnerMemberId: winningTicket.memberId,
        winnerMemberName: winningTicket.memberName,
        potAmount,
        drawCode: drawCode || drawProof.drawCode || 'EQ74AB',
        lang
      }).catch(e => console.warn('Notification queue error:', e));

      onDrawCompleted();
    } catch (err) {
      console.error('Failed to save final draw to Firestore', err);
    } finally {
      setIsSavingDraw(false);
    }
  };

  // Emergency Queue-jump
  const handleEmergencyQueueJumpConfirm = async (
    memberId: string,
    yesCount: number,
    noCount: number,
    reason: string
  ) => {
    const chosenMember = group.members.find(m => m.id === memberId);
    if (!chosenMember) return;

    const isLastRound = group.history.length + 1 >= group.members.reduce((a, b) => a + b.shares, 0);

    await recordEmergencyDecision(
      group.id,
      group.name,
      round,
      chosenMember.id,
      chosenMember.name,
      yesCount,
      noCount,
      reason,
      potAmount,
      isLastRound
    );

    setIsQueueJumpOpen(false);
    onDrawCompleted();
  };

  // Swap
  const handleSwapConfirm = async (
    memberAId: string,
    memberBId: string,
    note: string
  ) => {
    const memberA = group.members.find(m => m.id === memberAId);
    const memberB = group.members.find(m => m.id === memberBId);
    if (!memberA || !memberB) return;

    await recordShareSwap(group.id, memberA.name, memberB.name, note);
    setIsSwapOpen(false);
  };

  return (
    <div
      className={`min-h-[100dvh] pb-24 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-stone-950 text-white overflow-y-auto p-4 sm:p-6'
          : 'py-4 px-3 sm:px-4 max-w-[560px] mx-auto'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4 border-b border-stone-200/60 pb-3">
        <button
          onClick={onBack}
          disabled={phase === 'spinning'}
          className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-40 text-sm font-semibold p-1 rounded-xl touch-target"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.back}</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              {group.name}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs font-bold text-stone-900">
              {t.roundNumber} {round}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-stone-900 font-heading">
            {t.drawRoomTitle}
          </h1>
        </div>

        <button
          onClick={() => setIsFullscreen(f => !f)}
          className="flex items-center gap-1 p-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl touch-target"
          title={isFullscreen ? t.exitFullscreen : t.fullscreenMode}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-amber-600" />}
        </button>
      </div>

      {/* Member View-Only Warning Notice if not organizer */}
      {!isOrganizer && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <span>{t.memberViewOnlyWarning}</span>
        </div>
      )}

      {/* Pot Banner */}
      <div className="mb-5 bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-md flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-medium text-amber-400 uppercase tracking-wider block">
            {t.potSize}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight font-heading">
            {formatETB(potAmount, lang)}
          </span>
        </div>

        {/* Alternative Actions for Organizer */}
        {isOrganizer && phase !== 'spinning' && phase !== 'winner_revealed' && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsQueueJumpOpen(true)}
              className="p-2 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded-xl text-xs font-semibold text-stone-200 touch-target flex items-center gap-1"
              title={t.emergencyQueueJump}
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Vote</span>
            </button>

            {unwonMembers.length >= 2 && (
              <button
                onClick={() => setIsSwapOpen(true)}
                className="p-2 bg-stone-800 hover:bg-stone-700 border border-stone-600 rounded-xl text-xs font-semibold text-stone-200 touch-target flex items-center gap-1"
                title={t.swapShares}
              >
                <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Swap</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stage: Wheel & Winner Reveal */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center min-h-[340px] mb-5">
        <DrawWheel
          tickets={eligibleTickets}
          winningIndex={winningIndex}
          isSpinning={phase === 'spinning'}
          onSpinComplete={handleSpinFinished}
        />

        {/* Control Button Area */}
        <div className="w-full max-w-sm mt-3 text-center">
          {isOrganizer && phase === 'ready_to_spin' && (
            <button
              onClick={handleStartSpin}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-extrabold text-base rounded-2xl shadow-lg transition-transform touch-target"
            >
              <Sparkles className="w-5 h-5 text-stone-950" />
              <span>{t.spinWheel}</span>
            </button>
          )}

          {phase === 'spinning' && (
            <div className="py-3 px-6 bg-stone-900 text-amber-300 font-bold rounded-2xl animate-pulse text-sm flex items-center justify-center gap-2 touch-target">
              <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>{t.spinning}</span>
            </div>
          )}

          {phase === 'winner_revealed' && winningTicket && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                  {t.winnerAnnounced}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5 font-heading">
                  {winningTicket.memberName}
                </h2>
                <p className="text-xs text-emerald-700">
                  {t.payout}: {formatETB(potAmount, lang)}
                </p>
              </div>

              {isOrganizer && (
                <button
                  onClick={handleConfirmWinnerAndAdvance}
                  disabled={isSavingDraw}
                  className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-bold text-sm rounded-xl shadow-md transition-all mt-2 touch-target flex items-center justify-center gap-2"
                >
                  {isSavingDraw && <RotateCw className="w-4 h-4 animate-spin" />}
                  <span>{t.confirmWinnerAndSaveRound}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Member Phone Random Input Box (Members submit entropy live!) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 mb-5">
        <h2 className="text-xs uppercase tracking-wider font-bold text-stone-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-emerald-700" />
            <span>{t.memberInputSectionTitle}</span>
          </span>
          <span className="text-[11px] text-stone-500 font-semibold font-mono">
            {Object.keys(liveInputs).length} {t.inputsReceivedCount}
          </span>
        </h2>

        <p className="text-xs text-stone-600 leading-relaxed">
          {t.memberInputPromptOwnPhone}
        </p>

        <form onSubmit={handleSubmitMyInput} className="flex gap-2">
          <input
            type="text"
            required
            maxLength={30}
            value={myInput}
            onChange={e => setMyInput(e.target.value)}
            placeholder={t.memberInputPlaceholder}
            className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-base text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={inputSubmitting || !myInput.trim()}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl transition-all touch-target shrink-0 flex items-center gap-1.5"
          >
            {inputSubmitting ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : myInputSubmitted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'am' ? 'ተመዝግቧል' : 'Saved'}</span>
              </>
            ) : (
              <span>{t.submitMyInputBtn}</span>
            )}
          </button>
        </form>

        {myInputSubmitted && (
          <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.inputSubmittedSuccess}</span>
          </p>
        )}

        {/* Live List of Submitted Inputs */}
        <div className="pt-2 border-t border-stone-100 max-h-32 overflow-y-auto space-y-1.5">
          {Object.entries(liveInputs).map(([senderUid, item]) => (
            <div
              key={senderUid}
              className="flex items-center justify-between p-1.5 px-2 bg-stone-50 rounded-lg text-xs"
            >
              <span className="font-semibold text-stone-800">{item.memberName}</span>
              <span className="font-mono bg-stone-200/80 px-2 py-0.5 rounded text-stone-900">
                "{item.input}"
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Organizer Cryptographic Control Protocol */}
      {isOrganizer && (
        <div className="space-y-4">
          {/* Step 1: Lock List */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t.step1Title}</span>
              </span>
              {phase !== 'eligibility_review' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">{t.step1Desc}</p>

            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
              {eligibleTickets.map((ticket, idx) => (
                <div
                  key={ticket.ticketId}
                  className="flex items-center justify-between p-1.5 px-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                >
                  <span className="font-semibold text-stone-900">
                    #{idx + 1} {ticket.memberName}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {ticket.shareIndex > 1 ? `Share #${ticket.shareIndex}` : '1 Share'}
                  </span>
                </div>
              ))}
            </div>

            {phase === 'eligibility_review' && (
              <button
                onClick={handleLockAndCommit}
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors touch-target"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>{t.lockListAndGenerateCommitment}</span>
              </button>
            )}
          </div>

          {/* Step 2: Inputs & Seed Computation */}
          {(phase === 'entropy_inputs' || phase === 'ready_to_spin') && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-amber-600" />
                  <span>{t.step2Title}</span>
                </span>
                {phase === 'ready_to_spin' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>

              {/* Commitment */}
              <div className="p-2.5 bg-stone-900 text-amber-300 font-mono text-[11px] rounded-xl break-all">
                <span className="text-[9px] uppercase tracking-wider text-stone-400 block mb-0.5">
                  {t.commitmentHashLabel}
                </span>
                {commitmentHash}
              </div>

              {phase === 'entropy_inputs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">
                      {Object.keys(liveInputs).length} of {distinctEligibleMembers.length} inputs ready
                    </span>
                    <button
                      type="button"
                      onClick={handleQuickFillEntropy}
                      className="font-bold text-amber-800 hover:text-amber-900 underline text-xs"
                    >
                      {t.quickFillInputs}
                    </button>
                  </div>

                  <button
                    onClick={handleComputeSeedAndPrepare}
                    className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors touch-target"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>{t.computeSeedAndReady}</span>
                  </button>
                </div>
              )}

              {phase === 'ready_to_spin' && seedHash && (
                <div className="p-2.5 bg-stone-900 text-emerald-300 font-mono text-[11px] rounded-xl break-all">
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block mb-0.5">
                    {t.seedHashLabel}
                  </span>
                  {seedHash}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Alternative modals */}
      <EmergencyQueueJumpModal
        isOpen={isQueueJumpOpen}
        onClose={() => setIsQueueJumpOpen(false)}
        eligibleMembers={group.members.filter(m => getMemberRemainingShares(group, m) > 0)}
        onConfirm={handleEmergencyQueueJumpConfirm}
        lang={lang}
      />

      <SwapSharesModal
        isOpen={isSwapOpen}
        onClose={() => setIsSwapOpen(false)}
        unwonMembers={unwonMembers}
        onConfirm={handleSwapConfirm}
        lang={lang}
      />
    </div>
  );
};
