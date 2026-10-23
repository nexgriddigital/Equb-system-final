import { EligibleTicket, MemberEntropyInput, DrawProof } from '../types/equb';

/**
 * Calculates SHA-256 hash in hex format using standard Web Crypto API.
 */
export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalizes ticket array into a canonical string format for commitment.
 */
export function canonicalizeTickets(tickets: EligibleTicket[]): string {
  // Sort tickets by ticketId for canonical ordering
  const sorted = [...tickets].sort((a, b) => a.ticketId.localeCompare(b.ticketId));
  return JSON.stringify(sorted.map(t => ({
    id: t.ticketId,
    mid: t.memberId,
    name: t.memberName,
    s: t.shareIndex
  })));
}

/**
 * Normalizes member entropy inputs into canonical string.
 */
export function canonicalizeInputs(inputs: MemberEntropyInput[]): string {
  const sorted = [...inputs].sort((a, b) => a.memberId.localeCompare(b.memberId));
  return JSON.stringify(sorted.map(i => ({
    mid: i.memberId,
    name: i.memberName,
    val: i.input.trim().toLowerCase()
  })));
}

/**
 * Step 1: Commitment Hash of the locked eligible tickets, round number, and timestamp.
 */
export async function computeCommitment(
  roundNumber: number,
  timestamp: string,
  tickets: EligibleTicket[]
): Promise<string> {
  const canonicalTicketStr = canonicalizeTickets(tickets);
  const payload = `EQUB_COMMITMENT|round:${roundNumber}|time:${timestamp}|tickets:${canonicalTicketStr}`;
  return sha256(payload);
}

/**
 * Step 2: Combined Seed Hash from commitment, round, and all member inputs.
 */
export async function computeSeed(
  commitmentHash: string,
  roundNumber: number,
  inputs: MemberEntropyInput[]
): Promise<string> {
  const canonicalInputsStr = canonicalizeInputs(inputs);
  const payload = `EQUB_SEED|commit:${commitmentHash}|round:${roundNumber}|inputs:${canonicalInputsStr}`;
  return sha256(payload);
}

/**
 * Deterministically picks a winner from the seed hash without modulo bias.
 * Uses rejection sampling on 32-bit slices of the seed hash.
 */
export function deterministicPickWinner(
  seedHex: string,
  totalTickets: number
): { winningIndex: number; sliceUsed: number; hexSlice: string; details: string } {
  if (totalTickets <= 0) {
    throw new Error('Total tickets must be greater than 0');
  }

  // 32-bit maximum = 4294967295 (0xFFFFFFFF)
  const MAX_UINT32 = 0xFFFFFFFF;
  const limit = Math.floor(MAX_UINT32 / totalTickets) * totalTickets;

  // We have 64 hex chars = 32 bytes in a SHA-256 hash.
  // Each 32-bit chunk is 8 hex chars. There are 8 chunks.
  for (let i = 0; i < 8; i++) {
    const hexSlice = seedHex.substring(i * 8, i * 8 + 8);
    const num = parseInt(hexSlice, 16);

    // Rejection sampling check: only accept if below limit to avoid modulo bias
    if (num < limit) {
      const winningIndex = num % totalTickets;
      return {
        winningIndex,
        sliceUsed: i,
        hexSlice,
        details: `32-bit chunk #${i} (0x${hexSlice} = ${num}) accepted under rejection limit ${limit}. ${num} mod ${totalTickets} = index ${winningIndex}`
      };
    }
  }

  // Fallback if all 8 slices exceed limit (probability is astronomically low: < 1 in 10^30)
  const fallbackNum = parseInt(seedHex.substring(0, 8), 16);
  return {
    winningIndex: fallbackNum % totalTickets,
    sliceUsed: 0,
    hexSlice: seedHex.substring(0, 8),
    details: `Direct modulo on slice #0 (0x${seedHex.substring(0, 8)}) = ${fallbackNum % totalTickets}`
  };
}

/**
 * Re-runs verification on any saved draw proof.
 */
export async function verifyDrawProof(proof: DrawProof): Promise<{
  isValid: boolean;
  commitmentMatch: boolean;
  seedMatch: boolean;
  winnerMatch: boolean;
  computedCommitment: string;
  computedSeed: string;
  computedWinnerIndex: number;
  expectedWinnerName: string;
  message: string;
}> {
  try {
    const computedCommitment = await computeCommitment(
      proof.roundNumber,
      proof.timestamp,
      proof.eligibleTickets
    );

    const commitmentMatch = computedCommitment === proof.commitmentHash;

    const computedSeed = await computeSeed(
      proof.commitmentHash,
      proof.roundNumber,
      proof.memberInputs
    );

    const seedMatch = computedSeed === proof.seedHash;

    const { winningIndex: computedWinnerIndex } = deterministicPickWinner(
      proof.seedHash,
      proof.totalTickets
    );

    const winnerMatch =
      computedWinnerIndex === proof.winningIndex &&
      proof.eligibleTickets[computedWinnerIndex]?.ticketId === proof.winningTicketId &&
      proof.eligibleTickets[computedWinnerIndex]?.memberName === proof.winnerMemberName;

    const isValid = commitmentMatch && seedMatch && winnerMatch;

    return {
      isValid,
      commitmentMatch,
      seedMatch,
      winnerMatch,
      computedCommitment,
      computedSeed,
      computedWinnerIndex,
      expectedWinnerName: proof.eligibleTickets[computedWinnerIndex]?.memberName || 'Unknown',
      message: isValid
        ? 'Draw verified 100% mathematically valid and untampered.'
        : 'Verification failed: computed results do not match proof claims.'
    };
  } catch (err: any) {
    return {
      isValid: false,
      commitmentMatch: false,
      seedMatch: false,
      winnerMatch: false,
      computedCommitment: '',
      computedSeed: '',
      computedWinnerIndex: -1,
      expectedWinnerName: '',
      message: `Verification error: ${err?.message || 'Invalid proof format'}`
    };
  }
}
