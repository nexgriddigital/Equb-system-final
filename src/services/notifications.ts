import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import {
  EmailPayload,
  buildPaymentReminderEmail,
  buildWinnerEmail,
  buildDrawResultEmail,
  buildMonthlySummaryEmail
} from './emailTemplates';
import { EqubGroup, Member, Language, NotificationLog } from '../types/equb';

/**
 * Queues an email document to the Firestore `mail` collection for the Trigger Email extension.
 */
export async function queueEmailDocument(payload: EmailPayload): Promise<boolean> {
  const mailId = 'mail_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  try {
    await setDoc(doc(db, 'mail', mailId), {
      to: payload.to,
      message: {
        subject: payload.subject,
        text: payload.text,
        html: payload.html
      },
      groupId: payload.groupId,
      type: payload.type,
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn('Could not queue email to /mail collection in Firestore:', err);
    return false;
  }
}

/**
 * Writes an audit record to the `notificationLog` collection.
 */
export async function logNotification(entry: Omit<NotificationLog, 'id'>): Promise<string> {
  const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  try {
    await setDoc(doc(db, 'notificationLog', logId), {
      ...entry,
      id: logId
    });
    return logId;
  } catch (err) {
    console.warn('Could not write to notificationLog:', err);
    return logId;
  }
}

/**
 * Checks whether a notification of the given type was already sent to avoid duplicate sends.
 */
export async function wasNotificationSent(params: {
  groupId: string;
  memberId: string;
  type: string;
  roundNumber?: number;
  monthKey?: string;
}): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'notificationLog'),
      where('groupId', '==', params.groupId),
      where('memberId', '==', params.memberId),
      where('type', '==', params.type)
    );
    const snap = await getDocs(q);
    if (snap.empty) return false;

    // Filter by roundNumber or monthKey
    return snap.docs.some(d => {
      const data = d.data();
      if (params.roundNumber !== undefined && data.roundNumber === params.roundNumber) return true;
      if (params.monthKey !== undefined && data.monthKey === params.monthKey) return true;
      return false;
    });
  } catch {
    return false;
  }
}

/**
 * Sends a sample test email of each type to the organizer's own address.
 */
export async function sendTestEmailsToOrganizer(
  organizerEmail: string,
  organizerName: string,
  group: EqubGroup,
  lang: Language
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const appUrl = window.location.origin;
    const unsubUrl = `${appUrl}?unsub=1&gid=${group.id}&mid=test`;
    const checkUrl = `${appUrl}?check=EQ74AB`;

    // 1. Test winner email
    const winnerMail = buildWinnerEmail({
      recipientEmail: organizerEmail,
      recipientName: organizerName,
      groupName: group.name,
      roundNumber: group.currentRound,
      potAmount: group.contributionAmount * group.members.reduce((a, b) => a + b.shares, 0),
      checkUrl,
      unsubscribeUrl: unsubUrl,
      lang
    });
    winnerMail.groupId = group.id;
    winnerMail.type = 'test';
    await queueEmailDocument(winnerMail);

    // 2. Test reminder email
    const reminderMail = buildPaymentReminderEmail({
      recipientEmail: organizerEmail,
      recipientName: organizerName,
      groupName: group.name,
      roundNumber: group.currentRound,
      amountDue: group.contributionAmount,
      dueDate: new Date().toLocaleDateString(),
      unsubscribeUrl: unsubUrl,
      lang
    });
    reminderMail.groupId = group.id;
    reminderMail.type = 'test';
    await queueEmailDocument(reminderMail);

    await logNotification({
      groupId: group.id,
      groupName: group.name,
      memberId: 'organizer',
      memberName: organizerName,
      recipientEmail: organizerEmail,
      type: 'test',
      roundNumber: group.currentRound,
      sentAt: new Date().toISOString(),
      status: 'sent'
    });

    return { success: true, count: 2 };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Failed to send test emails' };
  }
}

/**
 * Fetches sent notification logs for a group.
 */
export async function getGroupNotificationLogs(groupId: string): Promise<NotificationLog[]> {
  try {
    const q = query(
      collection(db, 'notificationLog'),
      where('groupId', '==', groupId)
    );
    const snap = await getDocs(q);
    const logs: NotificationLog[] = [];
    snap.forEach(d => {
      const data = d.data();
      logs.push({
        id: d.id,
        groupId: data.groupId,
        groupName: data.groupName || 'Equb',
        memberId: data.memberId || '',
        memberName: data.memberName || 'Member',
        recipientEmail: data.recipientEmail || '',
        type: data.type || 'payment_reminder',
        roundNumber: data.roundNumber,
        monthKey: data.monthKey,
        sentAt: data.sentAt || new Date().toISOString(),
        status: data.status || 'sent',
        error: data.error
      });
    });

    // Sort newest first
    return logs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  } catch (e) {
    console.warn('Could not read notification logs:', e);
    return [];
  }
}

/**
 * Unsubscribe member without logging in (via signed URL params).
 */
export async function unsubscribeMember(groupId: string, memberId: string): Promise<boolean> {
  try {
    const memberRef = doc(db, `groups/${groupId}/members`, memberId);
    await updateDoc(memberRef, {
      'notificationPreferences.paymentReminders': false,
      'notificationPreferences.drawResults': false,
      'notificationPreferences.monthlySummary': false,
      'notificationPreferences.unsubscribedAt': new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.warn('Unsubscribe update error:', e);
    return false;
  }
}

/**
 * Triggered on client when draw is saved: queues winner email and optional draw result emails.
 */
export async function sendDrawNotificationEmails(params: {
  group: EqubGroup;
  roundNumber: number;
  winnerMemberId: string;
  winnerMemberName: string;
  potAmount: number;
  drawCode: string;
  lang: Language;
}) {
  const { group, roundNumber, winnerMemberId, winnerMemberName, potAmount, drawCode, lang } = params;
  const appUrl = window.location.origin;
  const checkUrl = `${appUrl}?check=${drawCode}`;

  for (const member of group.members) {
    const memberEmail = (member as any).email;
    if (!memberEmail) continue;

    const prefs = (member as any).notificationPreferences || {
      paymentReminders: true,
      drawResults: true,
      monthlySummary: true,
      emailLanguage: lang
    };

    if (prefs.unsubscribedAt) continue;

    const memberLang = prefs.emailLanguage || lang;
    const unsubUrl = `${appUrl}?unsub=1&gid=${group.id}&mid=${member.id}`;

    // Winner email
    if (member.id === winnerMemberId) {
      const winnerMail = buildWinnerEmail({
        recipientEmail: memberEmail,
        recipientName: member.name,
        groupName: group.name,
        roundNumber,
        potAmount,
        checkUrl,
        unsubscribeUrl: unsubUrl,
        lang: memberLang
      });
      winnerMail.groupId = group.id;
      winnerMail.type = 'winner';
      await queueEmailDocument(winnerMail);

      await logNotification({
        groupId: group.id,
        groupName: group.name,
        memberId: member.id,
        memberName: member.name,
        recipientEmail: memberEmail,
        type: 'winner',
        roundNumber,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });
    } else if (prefs.drawResults !== false) {
      // Draw result email to other members
      const resultMail = buildDrawResultEmail({
        recipientEmail: memberEmail,
        recipientName: member.name,
        groupName: group.name,
        roundNumber,
        winnerName: winnerMemberName,
        potAmount,
        checkUrl,
        unsubscribeUrl: unsubUrl,
        lang: memberLang
      });
      resultMail.groupId = group.id;
      resultMail.type = 'draw_result';
      await queueEmailDocument(resultMail);

      await logNotification({
        groupId: group.id,
        groupName: group.name,
        memberId: member.id,
        memberName: member.name,
        recipientEmail: memberEmail,
        type: 'draw_result',
        roundNumber,
        sentAt: new Date().toISOString(),
        status: 'sent'
      });
    }
  }
}
