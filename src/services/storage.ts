import { EqubGroup, Member, EligibleTicket, BackupData, DrawProof, RoundHistory } from '../types/equb';

const STORAGE_KEY = 'equb_draw_groups_v1';

export interface StorageService {
  getAll(): EqubGroup[];
  getById(id: string): EqubGroup | null;
  save(group: EqubGroup): EqubGroup;
  delete(id: string): boolean;
  exportBackup(): string;
  importBackup(jsonString: string): { success: boolean; count: number; error?: string };
  seedDemoGroup(): EqubGroup;
}

class LocalStorageEqubService implements StorageService {
  getAll(): EqubGroup[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as EqubGroup[];
    } catch (e) {
      console.error('Error reading equb groups from localStorage', e);
      return [];
    }
  }

  getById(id: string): EqubGroup | null {
    const groups = this.getAll();
    return groups.find(g => g.id === id) || null;
  }

  save(group: EqubGroup): EqubGroup {
    const groups = this.getAll();
    const existingIndex = groups.findIndex(g => g.id === group.id);
    const updatedGroup: EqubGroup = {
      ...group,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      groups[existingIndex] = updatedGroup;
    } else {
      groups.unshift(updatedGroup);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    } catch (e) {
      console.error('Error saving equb group to localStorage', e);
    }
    return updatedGroup;
  }

  delete(id: string): boolean {
    const groups = this.getAll();
    const filtered = groups.filter(g => g.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Error deleting group', e);
      return false;
    }
  }

  exportBackup(): string {
    const groups = this.getAll();
    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'Equb Draw',
      groups
    };
    return JSON.stringify(backup, null, 2);
  }

  importBackup(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      let groupsToImport: EqubGroup[] = [];

      if (Array.isArray(parsed)) {
        groupsToImport = parsed;
      } else if (parsed && parsed.groups && Array.isArray(parsed.groups)) {
        groupsToImport = parsed.groups;
      } else {
        return { success: false, count: 0, error: 'Unrecognized backup structure' };
      }

      for (const g of groupsToImport) {
        if (!g.id || !g.name || !Array.isArray(g.members)) {
          return { success: false, count: 0, error: 'One or more groups are missing required fields' };
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(groupsToImport));
      return { success: true, count: groupsToImport.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Invalid JSON format' };
    }
  }

  seedDemoGroup(): EqubGroup {
    // 6 members with mixed shares (acceptance check ready!)
    // Abebe: 2 shares
    // Tigist: 1 share
    // Dawit: 1 share
    // Selamawit: 2 shares
    // Yonas: 1 share
    // Meron: 1 share
    // Total shares = 8 shares. Total rounds in cycle = 8.
    const demoMembers: Member[] = [
      { id: 'm1', name: 'አበበ ከበደ (Abebe)', phone: '+251 91 122 3344', shares: 2, joinedAt: new Date().toISOString() },
      { id: 'm2', name: 'ትዕግሥት ተሾመ (Tigist)', phone: '+251 92 333 4455', shares: 1, joinedAt: new Date().toISOString() },
      { id: 'm3', name: 'ዳዊት ኃይሉ (Dawit)', phone: '+251 93 444 5566', shares: 1, joinedAt: new Date().toISOString() },
      { id: 'm4', name: 'ሰላማዊት በቀለ (Selamawit)', phone: '+251 94 555 6677', shares: 2, joinedAt: new Date().toISOString() },
      { id: 'm5', name: 'ዮናስ ታደሰ (Yonas)', phone: '+251 91 666 7788', shares: 1, joinedAt: new Date().toISOString() },
      { id: 'm6', name: 'ሜሮን አስፋው (Meron)', phone: '+251 92 777 8899', shares: 1, joinedAt: new Date().toISOString() }
    ];

    const today = new Date().toISOString().split('T')[0];

    // Pre-calculated round 1 draw proof for immediate testing of "Check this draw"
    const demoProof: DrawProof = {
      roundNumber: 1,
      drawCode: 'EQ74AB',
      timestamp: new Date().toISOString(),
      eligibleTickets: [
        { ticketId: 't-m1-s1-r1', memberId: 'm1', memberName: 'አበበ ከበደ (Abebe)', shareIndex: 1 },
        { ticketId: 't-m1-s2-r1', memberId: 'm1', memberName: 'አበበ ከበደ (Abebe)', shareIndex: 2 },
        { ticketId: 't-m2-s1-r1', memberId: 'm2', memberName: 'ትዕግሥት ተሾመ (Tigist)', shareIndex: 1 },
        { ticketId: 't-m3-s1-r1', memberId: 'm3', memberName: 'ዳዊት ኃይሉ (Dawit)', shareIndex: 1 },
        { ticketId: 't-m4-s1-r1', memberId: 'm4', memberName: 'ሰላማዊት በቀለ (Selamawit)', shareIndex: 1 },
        { ticketId: 't-m4-s2-r1', memberId: 'm4', memberName: 'ሰላማዊት በቀለ (Selamawit)', shareIndex: 2 },
        { ticketId: 't-m5-s1-r1', memberId: 'm5', memberName: 'ዮናስ ታደሰ (Yonas)', shareIndex: 1 },
        { ticketId: 't-m6-s1-r1', memberId: 'm6', memberName: 'ሜሮን አስፋው (Meron)', shareIndex: 1 }
      ],
      commitmentHash: '7a29e4d1f850239bf099d084d59a5d55b0a3407e32a67e9b380f2d483bb72910',
      memberInputs: [
        { memberId: 'm1', memberName: 'አበበ ከበደ (Abebe)', input: 'selam-101' },
        { memberId: 'm2', memberName: 'ትዕግሥት ተሾመ (Tigist)', input: 'andinet-202' },
        { memberId: 'm3', memberName: 'ዳዊት ኃይሉ (Dawit)', input: 'coffee-303' },
        { memberId: 'm4', memberName: 'ሰላማዊት በቀለ (Selamawit)', input: 'habesha-404' },
        { memberId: 'm5', memberName: 'ዮናስ ታደሰ (Yonas)', input: 'finfine-505' },
        { memberId: 'm6', memberName: 'ሜሮን አስፋው (Meron)', input: 'teff-606' }
      ],
      seedHash: '9e382d6b38c29fa7560e90c8a32a67e9b380f2d483bb729107a29e4d1f850239',
      winningTicketId: 't-m2-s1-r1',
      winnerMemberId: 'm2',
      winnerMemberName: 'ትዕግሥት ተሾመ (Tigist)',
      winningIndex: 2,
      totalTickets: 8,
      explanation: 'Chunk #0 accepted. Selected ticket index 2 out of 8 tickets'
    };

    const round1History: RoundHistory = {
      roundNumber: 1,
      drawCode: 'EQ74AB',
      date: today,
      winnerMemberId: 'm2',
      winnerMemberName: 'ትዕግሥት ተሾመ (Tigist)',
      winningShareIndex: 1,
      potAmount: 40000,
      method: 'lottery',
      drawProof: demoProof,
      note: 'Round 1 completed draw'
    };

    const demoGroup: EqubGroup = {
      id: 'demo-andinet-' + Date.now(),
      name: 'አንድነት እቁብ (Andinet Equb)',
      contributionAmount: 5000, // 5,000 ETB per share
      interval: 'monthly',
      startDate: today,
      inviteCode: 'EQ74AB',
      members: demoMembers,
      currentRound: 2,
      payments: {
        1: { m1: true, m2: true, m3: true, m4: true, m5: true, m6: true },
        2: { m1: true, m2: true, m3: true, m4: true, m5: false, m6: true }
      },
      history: [round1History],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.save(demoGroup);
  }
}

export const storageService = new LocalStorageEqubService();

export function getTotalShares(group: EqubGroup): number {
  return group.members.reduce((acc, m) => acc + (m.shares || 1), 0);
}

export function getPotAmount(group: EqubGroup): number {
  return getTotalShares(group) * group.contributionAmount;
}

export function getMemberWinCount(group: EqubGroup, memberId: string): number {
  return group.history.filter(h => h.winnerMemberId === memberId).length;
}

export function getMemberRemainingShares(group: EqubGroup, member: Member): number {
  const wonCount = getMemberWinCount(group, member.id);
  return Math.max(0, member.shares - wonCount);
}

export function getEligibleTickets(group: EqubGroup, roundNumber: number): EligibleTicket[] {
  const roundPayments = group.payments[roundNumber] || {};
  const tickets: EligibleTicket[] = [];

  for (const member of group.members) {
    const hasPaid = !!roundPayments[member.id];
    if (!hasPaid) continue;

    const remainingShares = getMemberRemainingShares(group, member);
    if (remainingShares <= 0) continue;

    for (let s = 1; s <= remainingShares; s++) {
      tickets.push({
        ticketId: `t-${member.id}-s${s}-r${roundNumber}`,
        memberId: member.id,
        memberName: member.name,
        shareIndex: s
      });
    }
  }

  return tickets;
}

export function getPaidMemberCount(group: EqubGroup, roundNumber: number): number {
  const roundPayments = group.payments[roundNumber] || {};
  return group.members.filter(m => !!roundPayments[m.id]).length;
}

export function isCycleComplete(group: EqubGroup): boolean {
  const totalShares = getTotalShares(group);
  return group.history.length >= totalShares;
}
