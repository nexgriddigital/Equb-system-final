export type Language = 'en' | 'am';

export type Interval = 'weekly' | 'biweekly' | 'monthly';

export interface Member {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notificationPreferences?: {
    paymentReminders?: boolean;
    drawResults?: boolean;
    monthlySummary?: boolean;
    emailLanguage?: Language;
    unsubscribedAt?: string;
  };
  shares: 1 | 2;
  joinedAt: string;
}

export type DrawMethod = 'lottery' | 'group_decision' | 'swap';

export interface EligibleTicket {
  ticketId: string;
  memberId: string;
  memberName: string;
  shareIndex: number; // 1 or 2
}

export interface MemberEntropyInput {
  memberId: string;
  memberName: string;
  input: string;
}

export interface DrawProof {
  roundNumber: number;
  drawCode?: string;
  timestamp: string;
  eligibleTickets: EligibleTicket[];
  commitmentHash: string;
  memberInputs: MemberEntropyInput[];
  seedHash: string;
  winningTicketId: string;
  winnerMemberId: string;
  winnerMemberName: string;
  winningIndex: number;
  totalTickets: number;
  explanation: string;
}

export interface AuditCorrection {
  timestamp: string;
  reason: string;
  author: string;
}

export interface RoundHistory {
  roundNumber: number;
  drawCode?: string;
  date: string;
  winnerMemberId: string;
  winnerMemberName: string;
  winningShareIndex?: number;
  potAmount: number;
  method: DrawMethod;
  drawProof?: DrawProof;
  decisionVote?: {
    yesCount: number;
    noCount: number;
    reason: string;
  };
  swapDetails?: {
    memberAId: string;
    memberAName: string;
    memberBId: string;
    memberBName: string;
    note: string;
  };
  note?: string;
  auditCorrections?: AuditCorrection[];
}

export interface EqubGroup {
  id: string;
  name: string;
  organizerUid?: string;
  inviteCode?: string;
  contributionAmount: number; // ETB per share
  interval: Interval;
  startDate: string;
  members: Member[];
  currentRound: number; // 1-indexed
  payments: Record<number, Record<string, boolean>>;
  history: RoundHistory[];
  status: 'active' | 'completed';
  emailNotifications?: {
    paymentReminders: boolean;
    winnerAlert: boolean;
    memberResults: boolean;
    monthlySummary: boolean;
    reminderDays: number[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: string;
  groupId: string;
  groupName: string;
  memberId: string;
  memberName: string;
  recipientEmail: string;
  type: 'payment_reminder' | 'winner' | 'draw_result' | 'monthly_summary' | 'test' | string;
  roundNumber?: number;
  monthKey?: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'queued';
  error?: string;
}

export interface PublicDrawRecord {
  drawCode: string;
  groupId?: string;
  groupName: string;
  roundNumber: number;
  winnerName: string;
  date: string;
  potAmount: number;
  type: string;
  eligibleNames: string[];
  proofJson: string;
  createdAt: string;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  app: 'Equb Draw';
  groups: EqubGroup[];
}

