import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Fallback APP_URL if env not set
const APP_URL = process.env.APP_URL || 'https://equb-draw.web.app';

// Font stack for email clients that supports Ethiopic
const EMAIL_FONT = '"Noto Sans Ethiopic", Nyala, "Segoe UI", Arial, sans-serif';

interface MemberData {
  displayName?: string;
  name?: string;
  email?: string;
  shares?: number;
  uid?: string;
  notificationPreferences?: {
    paymentReminders?: boolean;
    drawResults?: boolean;
    monthlySummary?: boolean;
    emailLanguage?: 'am' | 'en';
    unsubscribedAt?: string;
  };
}

/**
 * Helper to queue an email into the `mail` collection (used by Trigger Email from Firestore extension)
 */
async function queueEmail(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
  groupId: string;
  type: string;
}) {
  const mailId = `mail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.collection('mail').doc(mailId).set({
    to: payload.to,
    message: {
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    },
    groupId: payload.groupId,
    type: payload.type,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Helper to log sent notification for deduplication and audit
 */
async function logNotification(entry: {
  groupId: string;
  groupName: string;
  memberId: string;
  memberName: string;
  recipientEmail: string;
  type: string;
  roundNumber?: number;
  monthKey?: string;
}) {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.collection('notificationLog').doc(logId).set({
    ...entry,
    id: logId,
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'sent'
  });
}

/**
 * 1. TRIGGER: onDrawCreated
 * Triggers when a new draw is finalized in groups/{groupId}/draws/{drawId}
 * Sends winner notification and optional member draw result emails.
 */
export const onDrawCreated = functions.firestore
  .document('groups/{groupId}/draws/{drawId}')
  .onCreate(async (snap, context) => {
    const draw = snap.data();
    const groupId = context.params.groupId;
    if (!draw) return;

    const groupDoc = await db.collection('groups').doc(groupId).get();
    if (!groupDoc.exists) return;
    const group = groupDoc.data()!;

    // Check group notification settings
    const emailConfig = group.emailNotifications || {
      paymentReminders: true,
      winnerAlert: true,
      memberResults: true,
      monthlySummary: true
    };

    const membersSnap = await db.collection(`groups/${groupId}/members`).get();
    const checkUrl = `${APP_URL}?check=${draw.drawCode || ''}`;

    for (const mDoc of membersSnap.docs) {
      const member = mDoc.data() as MemberData;
      if (!member.email) continue;

      const prefs = member.notificationPreferences || {};
      if (prefs.unsubscribedAt) continue;

      const lang = prefs.emailLanguage || 'am';
      const unsubUrl = `${APP_URL}?unsub=1&gid=${groupId}&mid=${mDoc.id}`;
      const isWinner = mDoc.id === draw.winnerMemberId;
      const memberName = member.displayName || member.name || 'Member';

      if (isWinner && emailConfig.winnerAlert !== false) {
        const subject =
          lang === 'am'
            ? `የዛሬው ዕጣ አሸናፊ ሆነዋል! - ${group.name || 'እቁብ'}`
            : `You were chosen in today's draw! - ${group.name || 'Equb'}`;

        const potText = Number(draw.potAmount || 0).toLocaleString();

        const html = `
          <div style="font-family: ${EMAIL_FONT}; max-width: 520px; margin: 0 auto; padding: 24px; color: #1c1917; background-color: #fafaf9; border-radius: 16px; border: 1px solid #e7e5e4;">
            <div style="text-align: center; margin-bottom: 16px;">
              <img src="${APP_URL}/logo-120.png" width="48" height="48" alt="Equb Draw" style="border-radius: 10px; width: 48px; height: 48px; display: inline-block;" />
            </div>
            <div style="background-color: #0E3B2E; color: #FFF1CC; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 20px; color: #FFF1CC;">${lang === 'am' ? 'እንኳን ደስ አለዎት!' : 'Congratulations!'}</h1>
            </div>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              ${
                lang === 'am'
                  ? `ውድ ${memberName}፣ በ<strong>${group.name || 'እቁብ'}</strong> የዙር ${draw.roundNumber} የዛሬው ዕጣ አሸናፊ ሆነዋል።`
                  : `Dear ${memberName}, you were chosen in today's draw for <strong>${group.name || 'Equb'}</strong> (Round ${draw.roundNumber}).`
              }
            </p>
            <div style="background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #d6d3d1; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #78716c;">${lang === 'am' ? 'የዕጣው ጠቅላላ ድምር (ብር)' : 'Pot Amount'}:</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0E3B2E;">${potText} ETB</p>
            </div>
            <p style="font-size: 15px; line-height: 1.6; color: #44403c; margin-bottom: 20px;">
              ${
                lang === 'am'
                  ? 'የገንዘብ ክፍያውን አስተባባሪዎ ከመተግበሪያው ውጭ (በቴሌብር ወይም በባንክ) ያመቻቻል።'
                  : 'Your organizer will arrange the payment.'
              }
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${checkUrl}" style="display: inline-block; background-color: #0E3B2E; color: #FFF1CC; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: bold; min-height: 48px;">
                ${lang === 'am' ? 'ዕጣው እንዴት እንደተረጋገጠ ይመልከቱ' : 'See how the draw was checked'}
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0 16px 0;" />
            <p style="font-size: 12px; color: #a8a29e; text-align: center; margin: 0;">
              ${lang === 'am' ? 'ይህ መተግበሪያ ገንዘብ አይይዝም፤ መዝገብ ብቻ ይይዛል።' : 'This app does not hold money. It only keeps the record.'}
              <br /><a href="${unsubUrl}" style="color: #78716c; text-decoration: underline;">${lang === 'am' ? 'ከማሳወቂያዎች ሰርዝ' : 'Unsubscribe'}</a>
            </p>
          </div>
        `;

        const text =
          lang === 'am'
            ? `እንኳን ደስ አለዎት! ውድ ${memberName}፣ በ${group.name} ዙር ${draw.roundNumber} የዛሬው ዕጣ አሸናፊ ሆነዋል። መጠን: ${potText} ብር። አስተባባሪዎ ክፍያውን ያመቻቻል። ዕጣውን ይመልከቱ: ${checkUrl}`
            : `Congratulations! Dear ${memberName}, you were chosen in today's draw for ${group.name} (Round ${draw.roundNumber}). Pot: ${potText} ETB. Your organizer will arrange the payment. Check draw: ${checkUrl}`;

        await queueEmail({
          to: member.email,
          subject,
          html,
          text,
          groupId,
          type: 'winner'
        });

        await logNotification({
          groupId,
          groupName: group.name || 'Equb',
          memberId: mDoc.id,
          memberName,
          recipientEmail: member.email,
          type: 'winner',
          roundNumber: draw.roundNumber
        });
      } else if (!isWinner && emailConfig.memberResults !== false && prefs.drawResults !== false) {
        const subject =
          lang === 'am'
            ? `የዙር ${draw.roundNumber} የዕጣ ውጤት - ${group.name || 'እቁብ'}`
            : `Round ${draw.roundNumber} Draw Result - ${group.name || 'Equb'}`;

        const html = `
          <div style="font-family: ${EMAIL_FONT}; max-width: 520px; margin: 0 auto; padding: 24px; color: #1c1917; background-color: #fafaf9; border-radius: 12px; border: 1px solid #e7e5e4;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1c1917;">
              ${lang === 'am' ? `${group.name} - የዙር ${draw.roundNumber} ውጤት` : `${group.name} - Round ${draw.roundNumber} Result`}
            </h2>
            <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
              ${
                lang === 'am'
                  ? `የዛሬው ዙር ዕጣ ወጥቷል! አሸናፊ: <strong>${draw.winnerMemberName}</strong>`
                  : `Today's draw has been completed! Winner: <strong>${draw.winnerMemberName}</strong>`
              }
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${checkUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold;">
                ${lang === 'am' ? 'ዕጣውን ይፈትሹ' : 'Check this draw'}
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0 12px 0;" />
            <p style="font-size: 12px; color: #a8a29e; text-align: center; margin: 0;">
              <a href="${unsubUrl}" style="color: #78716c; text-decoration: underline;">${lang === 'am' ? 'ከማሳወቂያዎች ሰርዝ' : 'Unsubscribe'}</a>
            </p>
          </div>
        `;

        const text =
          lang === 'am'
            ? `${group.name} ዙር ${draw.roundNumber} አሸናፊ: ${draw.winnerMemberName}። ዕጣውን ይፈትሹ: ${checkUrl}`
            : `${group.name} Round ${draw.roundNumber} winner: ${draw.winnerMemberName}. Check draw: ${checkUrl}`;

        await queueEmail({
          to: member.email,
          subject,
          html,
          text,
          groupId,
          type: 'draw_result'
        });

        await logNotification({
          groupId,
          groupName: group.name || 'Equb',
          memberId: mDoc.id,
          memberName,
          recipientEmail: member.email,
          type: 'draw_result',
          roundNumber: draw.roundNumber
        });
      }
    }
  });

/**
 * 2. SCHEDULED CRON: dailyPaymentReminders
 * Runs every day at 08:00 Africa/Addis_Ababa
 * Sends reminders for due dates according to schedule (-3, -1, 0, 2 days overdue)
 */
export const dailyPaymentReminders = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('Africa/Addis_Ababa')
  .onRun(async context => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeGroupsSnap = await db
      .collection('groups')
      .where('status', '==', 'active')
      .get();

    for (const gDoc of activeGroupsSnap.docs) {
      const group = gDoc.data();
      const groupId = gDoc.id;

      const emailConfig = group.emailNotifications || {
        paymentReminders: true,
        reminderDays: [-3, -1, 0, 2]
      };

      if (emailConfig.paymentReminders === false) continue;
      const allowedOffsets: number[] = emailConfig.reminderDays || [-3, -1, 0, 2];

      // Calculate current round due date
      // Interval can be 'weekly', 'biweekly', 'monthly'
      const startDate = new Date(group.startDate || Date.now());
      const currentRound = group.currentRound || 1;
      const interval = group.interval || 'monthly';

      const dueDate = new Date(startDate);
      if (interval === 'weekly') {
        dueDate.setDate(dueDate.getDate() + (currentRound - 1) * 7);
      } else if (interval === 'biweekly') {
        dueDate.setDate(dueDate.getDate() + (currentRound - 1) * 14);
      } else {
        dueDate.setMonth(dueDate.getMonth() + (currentRound - 1));
      }
      dueDate.setHours(0, 0, 0, 0);

      // Diff in calendar days
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // Check if today matches any configured offset
      if (!allowedOffsets.includes(diffDays)) continue;

      // Read current round payment statuses
      const paymentsSnap = await db
        .collection(`groups/${groupId}/rounds/${currentRound}/payments`)
        .get();
      const paidMembers = new Set<string>();
      paymentsSnap.forEach(pDoc => {
        if (pDoc.data().paid) paidMembers.add(pDoc.id);
      });

      // Query members
      const membersSnap = await db.collection(`groups/${groupId}/members`).get();
      for (const mDoc of membersSnap.docs) {
        if (paidMembers.has(mDoc.id)) continue; // Already paid!

        const member = mDoc.data() as MemberData;
        if (!member.email) continue;

        const prefs = member.notificationPreferences || {};
        if (prefs.unsubscribedAt || prefs.paymentReminders === false) continue;

        // Check deduplication in notificationLog
        const existingLogs = await db
          .collection('notificationLog')
          .where('groupId', '==', groupId)
          .where('memberId', '==', mDoc.id)
          .where('roundNumber', '==', currentRound)
          .where('type', '==', `reminder_${diffDays}`)
          .limit(1)
          .get();

        if (!existingLogs.empty) continue; // Already sent today's reminder

        const lang = prefs.emailLanguage || 'am';
        const memberName = member.displayName || member.name || 'Member';
        const shares = member.shares || 1;
        const amountDue = (group.contributionAmount || 2000) * shares;
        const dueFormatted = dueDate.toLocaleDateString();
        const unsubUrl = `${APP_URL}?unsub=1&gid=${groupId}&mid=${mDoc.id}`;

        const isOverdue = diffDays > 0;
        const subject = isOverdue
          ? lang === 'am'
            ? `የእቁብ ክፍያ ማስታወሻ (ያለፈ) - ${group.name}`
            : `Payment Reminder (Overdue) - ${group.name}`
          : lang === 'am'
          ? `የእቁብ ክፍያ ማስታወሻ - ${group.name}`
          : `Equb Payment Reminder - ${group.name}`;

        const html = `
          <div style="font-family: ${EMAIL_FONT}; max-width: 520px; margin: 0 auto; padding: 24px; color: #1c1917; background-color: #fafaf9; border-radius: 12px; border: 1px solid #e7e5e4;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px; color: ${isOverdue ? '#dc2626' : '#1c1917'};">
              ${isOverdue ? (lang === 'am' ? 'የክፍያ ማስታወሻ (ጊዜው ያለፈ)' : 'Payment Reminder (Overdue)') : (lang === 'am' ? 'የክፍያ ማስታወሻ' : 'Payment Reminder')}
            </h2>
            <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
              ${
                lang === 'am'
                  ? `ውድ ${memberName}፣ ለ<strong>${group.name}</strong> የዙር ${currentRound} ክፍያ ${isOverdue ? 'የመክፈያው ቀን አልፏል።' : 'የመክፈያ ቀን ደርሷል።'}`
                  : `Dear ${memberName}, this is a reminder for your contribution in <strong>${group.name}</strong> for Round ${currentRound}.`
              }
            </p>
            <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #d6d3d1; margin-bottom: 20px;">
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #78716c;">${lang === 'am' ? 'የሚከፈል መጠን' : 'Amount Due'}:</p>
              <p style="margin: 0; font-size: 22px; font-weight: bold; color: #0f172a;">${amountDue.toLocaleString()} ETB</p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #78716c;">${lang === 'am' ? 'የመክፈያ ቀን' : 'Due Date'}: ${dueFormatted}</p>
            </div>
            <p style="font-size: 14px; line-height: 1.5; color: #44403c; margin-bottom: 20px;">
              ${
                lang === 'am'
                  ? 'እባክዎ ክፍያዎን በቀጥታ ለአስተባባሪዎ (በቴሌብር ወይም በባንክ) ይፈጽሙ።'
                  : 'Please send your payment directly to the organizer (via Telebirr or bank transfer).'
              }
            </p>
            <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0 16px 0;" />
            <p style="font-size: 12px; color: #a8a29e; text-align: center; margin: 0;">
              ${lang === 'am' ? 'ይህ መተግበሪያ ገንዘብ አይይዝም፤ መዝገብ ብቻ ይይዛል።' : 'This app does not hold money. It only keeps the record.'}
              <br /><a href="${unsubUrl}" style="color: #78716c; text-decoration: underline;">${lang === 'am' ? 'ከማሳወቂያዎች ሰርዝ' : 'Unsubscribe'}</a>
            </p>
          </div>
        `;

        const text =
          lang === 'am'
            ? `የእቁብ ክፍያ ማስታወሻ: ውድ ${memberName}፣ ለ${group.name} ዙር ${currentRound} ${amountDue.toLocaleString()} ብር ክፍያ ያስፈልጋል። እባክዎ ለአስተባባሪዎ ይክፈሉ። ይህ መተግበሪያ ገንዘብ አይይዝም።`
            : `Equb payment reminder: Dear ${memberName}, your contribution of ${amountDue.toLocaleString()} ETB for ${group.name} (Round ${currentRound}) is due. Please pay your organizer. This app does not hold money.`;

        await queueEmail({
          to: member.email,
          subject,
          html,
          text,
          groupId,
          type: `reminder_${diffDays}`
        });

        await logNotification({
          groupId,
          groupName: group.name || 'Equb',
          memberId: mDoc.id,
          memberName,
          recipientEmail: member.email,
          type: `reminder_${diffDays}`,
          roundNumber: currentRound
        });
      }
    }
  });

/**
 * 3. SCHEDULED CRON: monthlySummary
 * Runs on the 1st of every month at 08:00 Africa/Addis_Ababa
 * Sends monthly summary with required phrasing:
 * "contributions recorded in the app" and "This app does not hold money. It only keeps the record."
 */
export const monthlySummary = functions.pubsub
  .schedule('0 8 1 * *')
  .timeZone('Africa/Addis_Ababa')
  .onRun(async context => {
    const today = new Date();
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const activeGroupsSnap = await db
      .collection('groups')
      .where('status', '==', 'active')
      .get();

    for (const gDoc of activeGroupsSnap.docs) {
      const group = gDoc.data();
      const groupId = gDoc.id;

      const emailConfig = group.emailNotifications || { monthlySummary: true };
      if (emailConfig.monthlySummary === false) continue;

      const membersSnap = await db.collection(`groups/${groupId}/members`).get();
      const currentRound = group.currentRound || 1;
      const history = (group.history || []) as Array<{
        roundNumber: number;
        winnerMemberId: string;
      }>;

      for (const mDoc of membersSnap.docs) {
        const member = mDoc.data() as MemberData;
        if (!member.email) continue;

        const prefs = member.notificationPreferences || {};
        if (prefs.unsubscribedAt || prefs.monthlySummary === false) continue;

        // Deduplication for this monthKey
        const existingLogs = await db
          .collection('notificationLog')
          .where('groupId', '==', groupId)
          .where('memberId', '==', mDoc.id)
          .where('monthKey', '==', monthKey)
          .limit(1)
          .get();

        if (!existingLogs.empty) continue;

        const lang = prefs.emailLanguage || 'am';
        const memberName = member.displayName || member.name || 'Member';
        const shares = member.shares || 1;

        // Check rounds won
        const wonRounds = history
          .filter(h => h.winnerMemberId === mDoc.id)
          .map(h => h.roundNumber);
        const hasWon = wonRounds.length > 0;

        // Calculate rounds paid so far
        let roundsPaid = 0;
        for (let r = 1; r <= currentRound; r++) {
          const pDoc = await db
            .collection(`groups/${groupId}/rounds/${r}/payments`)
            .doc(mDoc.id)
            .get();
          if (pDoc.exists && pDoc.data()?.paid) {
            roundsPaid++;
          }
        }

        const totalRecorded = roundsPaid * (group.contributionAmount || 2000) * shares;
        const totalRounds = group.members?.length || 10;
        const unsubUrl = `${APP_URL}?unsub=1&gid=${groupId}&mid=${mDoc.id}`;

        const subject =
          lang === 'am'
            ? `የወርሃዊ መዝገብ ማጠቃለያ - ${group.name}`
            : `Monthly Summary - ${group.name}`;

        const html = `
          <div style="font-family: ${EMAIL_FONT}; max-width: 520px; margin: 0 auto; padding: 24px; color: #1c1917; background-color: #fafaf9; border-radius: 12px; border: 1px solid #e7e5e4;">
            <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1c1917;">
              ${lang === 'am' ? `የ${group.name} ወርሃዊ ማጠቃለያ` : `${group.name} Monthly Summary`}
            </h2>
            <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
              ${lang === 'am' ? `ውድ ${memberName}፣ በመተግበሪያው የተመዘገበው የወሩ ማጠቃለያ የሚከተለው ነው:` : `Dear ${memberName}, here is the summary recorded in the app for your group:`}
            </p>
            <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #d6d3d1; margin-bottom: 20px;">
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #78716c;">
                ${lang === 'am' ? 'በመተግበሪያው የተመዘገቡ መዋጮዎች' : 'Contributions recorded in the app'}:
              </p>
              <p style="margin: 0 0 12px 0; font-size: 22px; font-weight: bold; color: #0f172a;">
                ${totalRecorded.toLocaleString()} ETB
              </p>
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #78716c;">
                ${lang === 'am' ? 'የተከፈሉ ዙሮች' : 'Rounds paid'}: <strong>${roundsPaid} / ${totalRounds}</strong>
              </p>
              <p style="margin: 0; font-size: 13px; color: #78716c;">
                ${lang === 'am' ? 'የዕጣ ሁኔታ' : 'Draw status'}: <strong>${hasWon ? (lang === 'am' ? `በዙር ${wonRounds.join(', ')} ደርሶዎታል` : `Won in round ${wonRounds.join(', ')}`) : (lang === 'am' ? 'ዕጣ አልደረሰዎትም' : 'Pending')}</strong>
              </p>
            </div>
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 13px; color: #92400e;">
                ${lang === 'am' ? 'ይህ መተግበሪያ ገንዘብ አይይዝም። መዝገብ ብቻ ይይዛል።' : 'This app does not hold money. It only keeps the record.'}
              </p>
            </div>
            <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0 16px 0;" />
            <p style="font-size: 12px; color: #a8a29e; text-align: center; margin: 0;">
              <a href="${unsubUrl}" style="color: #78716c; text-decoration: underline;">${lang === 'am' ? 'ከማሳወቂያዎች ሰርዝ' : 'Unsubscribe'}</a>
            </p>
          </div>
        `;

        const text =
          lang === 'am'
            ? `የ${group.name} ማጠቃለያ: በመተግበሪያው የተመዘገቡ መዋጮዎች ${totalRecorded.toLocaleString()} ብር። የተከፈሉ ዙሮች: ${roundsPaid}/${totalRounds}። ይህ መተግበሪያ ገንዘብ አይይዝም። መዝገብ ብቻ ይይዛል።`
            : `${group.name} monthly summary: Contributions recorded in the app: ${totalRecorded.toLocaleString()} ETB. Rounds paid: ${roundsPaid}/${totalRounds}. This app does not hold money. It only keeps the record.`;

        await queueEmail({
          to: member.email,
          subject,
          html,
          text,
          groupId,
          type: 'monthly_summary'
        });

        await logNotification({
          groupId,
          groupName: group.name || 'Equb',
          memberId: mDoc.id,
          memberName,
          recipientEmail: member.email,
          type: 'monthly_summary',
          monthKey
        });
      }
    }
  });
