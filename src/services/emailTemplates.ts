import { Language } from '../types/equb';
import { formatETB } from '../i18n/translations';

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
  groupId: string;
  type: 'winner' | 'draw_result' | 'payment_reminder' | 'monthly_summary' | 'test';
}

const EMAIL_FONT_STACK = '"Noto Sans Ethiopic", Nyala, "Segoe UI", Arial, sans-serif';

/**
 * Builds standard mobile-friendly email wrapper HTML with email-safe Ethiopic fonts.
 */
function wrapHtml(
  title: string,
  bodyContent: string,
  groupName: string,
  unsubscribeUrl: string,
  lang: Language
): string {
  const disclaimer =
    lang === 'am'
      ? 'ይህ መተግበሪያ ገንዘብ አይይዝም ወይም አያስተላልፍም። መረጃውን ብቻ ይመዘግባል።'
      : 'This app does not hold money. It only keeps the record.';

  const unsubLabel =
    lang === 'am'
      ? 'ከዚህ እቁብ የኢሜይል መልእክት ላለመቀበል እዚህ ይጫኑ (Unsubscribe)'
      : 'Unsubscribe / change email settings';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafaf9; font-family: ${EMAIL_FONT_STACK}; color: #1c1917; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafaf9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 16px; overflow: hidden; padding: 28px 20px;">
          <!-- Header Bar -->
          <tr>
            <td style="padding-bottom: 20px; border-bottom: 1px solid #f5f5f4;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <img src="/logo-120.png" width="44" height="44" alt="Equb Draw" style="display: block; border-radius: 10px; width: 44px; height: 44px; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <div style="font-size: 18px; font-weight: bold; color: #0E3B2E; font-family: ${EMAIL_FONT_STACK};">
                            ${lang === 'am' ? 'እቁብ ዕጣ' : 'Equb Draw'}
                          </div>
                          <div style="font-size: 13px; color: #78716c; margin-top: 2px;">
                            ${groupName}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 24px 0;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid #f5f5f4; font-size: 12px; color: #78716c; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #a8a29e;">
                ${disclaimer}
              </p>
              <p style="margin: 0;">
                <a href="${unsubscribeUrl}" style="color: #78716c; text-decoration: underline;">
                  ${unsubLabel}
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Payment Reminder Email
 */
export function buildPaymentReminderEmail(params: {
  recipientEmail: string;
  recipientName: string;
  groupName: string;
  roundNumber: number;
  amountDue: number;
  dueDate: string;
  isOverdue?: boolean;
  unsubscribeUrl: string;
  lang: Language;
}): EmailPayload {
  const { recipientEmail, recipientName, groupName, roundNumber, amountDue, dueDate, isOverdue, unsubscribeUrl, lang } = params;
  const formattedAmount = formatETB(amountDue, lang);

  if (lang === 'am') {
    const subject = isOverdue
      ? `[${groupName}] የዙር ${roundNumber} ክፍያ ያለፈበት ማስታወሻ`
      : `[${groupName}] የዙር ${roundNumber} የእቁብ መዋጮ ማስታወሻ`;

    const text = `ሰላም ${recipientName}፣

የ${groupName} ዙር ${roundNumber} የእቁብ መዋጮ ${isOverdue ? 'ቀኑ አልፎበታል' : 'ይደርሳል'}።

• የሚከፈለው መጠን፡ ${formattedAmount}
• የመጨረሻ ቀን፡ ${dueDate}

ክፍያዎን ለአስተባባሪው በቀጥታ በቴሌብር፣ በሲቢኢ ብር ወይም በጥሬ ገንዘብ ያጠናቅቁ።

ይህ መተግበሪያ ገንዘብ አይይዝም ወይም አያስተላልፍም። መረጃውን ብቻ ይመዘግባል።
መልእክት ላለመቀበል፡ ${unsubscribeUrl}`;

    const htmlBody = `
      <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1c1917;">
        ${isOverdue ? 'የዙር ክፍያ ያለፈበት ማስታወሻ' : 'የእቁብ መዋጮ ማስታወሻ'}
      </h2>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #44403c;">
        ሰላም <strong>${recipientName}</strong>፣ የ${groupName} ዙር ${roundNumber} የእቁብ መዋጮ ${isOverdue ? 'ቀኑ አልፏል' : 'የመክፈያ ቀን ደርሷል'}።
      </p>
      <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 13px; color: #78716c; margin-bottom: 4px;">የሚከፈለው መጠን፡</div>
        <div style="font-size: 24px; font-weight: bold; color: #1c1917; margin-bottom: 12px;">${formattedAmount}</div>
        <div style="font-size: 13px; color: #78716c;">የመክፈያ ቀን፡ <strong style="color: #44403c;">${dueDate}</strong></div>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #57534e; margin: 0;">
        ክፍያዎን ለአስተባባሪው በቀጥታ በቴሌብር፣ በሲቢኢ ብር ወይም በባንክ ያጠናቅቁ።
      </p>
    `;

    return {
      to: recipientEmail,
      subject,
      text,
      html: wrapHtml(subject, htmlBody, groupName, unsubscribeUrl, lang),
      groupId: '',
      type: 'payment_reminder'
    };
  }

  // English
  const subject = isOverdue
    ? `[${groupName}] Overdue payment reminder for Round ${roundNumber}`
    : `[${groupName}] Payment reminder for Round ${roundNumber}`;

  const text = `Hi ${recipientName},

This is a friendly reminder that your contribution for ${groupName} (Round ${roundNumber}) is ${isOverdue ? 'overdue' : 'due'}.

• Amount due: ${formattedAmount}
• Due date: ${dueDate}

Please settle your payment directly with your organizer (via Telebirr, CBE, or cash).

This app does not hold money. It only keeps the record.
Unsubscribe: ${unsubscribeUrl}`;

  const htmlBody = `
    <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1c1917;">
      ${isOverdue ? 'Overdue Payment Reminder' : 'Equb Payment Reminder'}
    </h2>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #44403c;">
      Hi <strong>${recipientName}</strong>, your contribution for ${groupName} (Round ${roundNumber}) is ${isOverdue ? 'now overdue' : 'due soon'}.
    </p>
    <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <div style="font-size: 13px; color: #78716c; margin-bottom: 4px;">Amount due:</div>
      <div style="font-size: 24px; font-weight: bold; color: #1c1917; margin-bottom: 12px;">${formattedAmount}</div>
      <div style="font-size: 13px; color: #78716c;">Due date: <strong style="color: #44403c;">${dueDate}</strong></div>
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #57534e; margin: 0;">
      Please arrange payment directly with your organizer via Telebirr, bank transfer, or cash.
    </p>
  `;

  return {
    to: recipientEmail,
    subject,
    text,
    html: wrapHtml(subject, htmlBody, groupName, unsubscribeUrl, lang),
    groupId: '',
    type: 'payment_reminder'
  };
}

/**
 * 2. "You've Won" Email (to Winner)
 */
export function buildWinnerEmail(params: {
  recipientEmail: string;
  recipientName: string;
  groupName: string;
  roundNumber: number;
  potAmount: number;
  checkUrl: string;
  unsubscribeUrl: string;
  lang: Language;
}): EmailPayload {
  const { recipientEmail, recipientName, groupName, roundNumber, potAmount, checkUrl, unsubscribeUrl, lang } = params;
  const formattedPot = formatETB(potAmount, lang);

  if (lang === 'am') {
    const subject = `እንኳን ደስ አላችሁ! በ${groupName} ዙር ${roundNumber} አሸንፈዋል`;
    const text = `እንኳን ደስ አላችሁ ${recipientName}!

በዛሬው ዕጣ እርስዎ ወጥቶልዎታል።
• እቁብ፡ ${groupName}
• ዙር፡ ${roundNumber}
• የዙሩ ድምር፡ ${formattedPot}

አስተባባሪዎ ክፍያውን ያመቻቻል።

ዕጣው ፍትሐዊ መሆኑን ለማረጋገጥ ይህንን ሊንክ ይጫኑ፡
${checkUrl}

ይህ መተግበሪያ ገንዘብ አይይዝም ወይም አያስተላልፍም። መረጃውን ብቻ ይመዘግባል።
መልእክት ላለመቀበል፡ ${unsubscribeUrl}`;

    const htmlBody = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 32px; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; margin-bottom: 12px;">🏆</div>
        <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 6px 0; color: #1c1917;">
          እንኳን ደስ አላችሁ!
        </h2>
        <p style="font-size: 16px; color: #0E3B2E; font-weight: bold; margin: 0;">
          በዛሬው ዕጣ እርስዎ ወጥቶልዎታል።
        </p>
      </div>

      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 13px; color: #166534; margin-bottom: 4px;">የዙር ${roundNumber} የዕጣ ድምር፡</div>
        <div style="font-size: 28px; font-weight: bold; color: #0E3B2E; margin-bottom: 8px;">${formattedPot}</div>
        <div style="font-size: 14px; color: #166534;">አስተባባሪዎ ክፍያውን ያመቻቻል።</div>
      </div>

      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${checkUrl}" style="display: inline-block; background-color: #0E3B2E; color: #FFF1CC; text-decoration: none; font-weight: bold; font-size: 15px; padding: 14px 28px; border-radius: 12px; min-height: 48px;">
          ዕጣው ፍትሐዊ መሆኑን አረጋግጥ
        </a>
      </div>
    `;

    return {
      to: recipientEmail,
      subject,
      text,
      html: wrapHtml(subject, htmlBody, groupName, unsubscribeUrl, lang),
      groupId: '',
      type: 'winner'
    };
  }

  // English
  const subject = `Congratulations! You won Round ${roundNumber} in ${groupName}`;
  const text = `Congratulations ${recipientName}!

You were chosen in today's draw.
• Equb: ${groupName}
• Round: ${roundNumber}
• Pot: ${formattedPot}

Your organizer will arrange the payment.

See how the draw was checked:
${checkUrl}

This app does not hold money. It only keeps the record.
Unsubscribe: ${unsubscribeUrl}`;

  const htmlBody = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 32px; width: 64px; height: 64px; line-height: 64px; border-radius: 50%; margin-bottom: 12px;">🏆</div>
      <h2 style="font-size: 22px; font-weight: bold; margin: 0 0 6px 0; color: #1c1917;">
        Congratulations!
      </h2>
      <p style="font-size: 16px; color: #0E3B2E; font-weight: bold; margin: 0;">
        You were chosen in today's draw.
      </p>
    </div>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 13px; color: #166534; margin-bottom: 4px;">Round ${roundNumber} Pot:</div>
      <div style="font-size: 28px; font-weight: bold; color: #0E3B2E; margin-bottom: 8px;">${formattedPot}</div>
      <div style="font-size: 14px; color: #166534;">Your organizer will arrange the payment.</div>
    </div>

    <div style="text-align: center; margin-bottom: 16px;">
      <a href="${checkUrl}" style="display: inline-block; background-color: #0E3B2E; color: #FFF1CC; text-decoration: none; font-weight: bold; font-size: 15px; padding: 14px 28px; border-radius: 12px; min-height: 48px;">
        See how the draw was checked
      </a>
    </div>
  `;

  return {
    to: recipientEmail,
    subject,
    text,
    html: wrapHtml(subject, htmlBody, groupName, unsubscribeUrl, lang),
    groupId: '',
    type: 'winner'
  };
}

/**
 * 3. Draw Result Email (to other members)
 */
export function buildDrawResultEmail(params: {
  recipientEmail: string;
  recipientName: string;
  groupName: string;
  roundNumber: number;
  winnerName: string;
  potAmount: number;
  checkUrl: string;
  unsubscribeUrl: string;
  lang: Language;
}): EmailPayload {
  const { recipientEmail, recipientName, groupName, roundNumber, winnerName, potAmount, checkUrl, unsubscribeUrl, lang } = params;
  const formattedPot = formatETB(potAmount, lang);

  if (lang === 'am') {
    const subject = `[${groupName}] የዙር ${roundNumber} አሸናፊ ወጥቷል`;
    const text = `ሰላም ${recipientName}፣

የ${groupName} ዙር ${roundNumber} ዕጣ ወጥቷል።
• አሸናፊ፡ ${winnerName}
• የዙሩ ድምር፡ ${formattedPot}

ዕጣው ፍትሐዊ መሆኑን ለማረጋገጥ ይህንን ሊንክ ይጫኑ፡
${checkUrl}

ይህ መተግበሪያ ገንዘብ አይይዝም ወይም አያስተላልፍም። መረጃውን ብቻ ይመዘግባል።
መልእክት ላለመቀበል፡ ${unsubscribeUrl}`;

    const htmlBody = `
      <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1c1917;">
        የዙር ${roundNumber} አሸናፊ ወጥቷል
      </h2>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #44403c;">
        ሰላም <strong>${recipientName}</strong>፣ በ${groupName} ዙር ${roundNumber} አሸናፊው <strong>${winnerName}</strong> ሆኗል።
      </p>
      <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 13px; color: #78716c; margin-bottom: 4px;">አሸናፊ፡</div>
        <div style="font-size: 20px; font-weight: bold; color: #1c1917; margin-bottom: 8px;">${winnerName}</div>
        <div style="font-size: 13px; color: #78716c;">የዙሩ ድምር፡ <strong style="color: #44403c;">${formattedPot}</strong></div>
      </div>
      <div style="text-align: center;">
        <a href="${checkUrl}" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 12px;">
          ዕጣው ፍትሐዊ መሆኑን አረጋግጥ
        </a>
      </div>
    `;

    return {
      to: recipientEmail,
      subject,
      text,
      html: wrapHtml(subject, htmlBody, groupName, unsubscribeUrl, lang),
      groupId: '',
      type: 'draw_result'
    };
  }

  // English
  const subject = `[${groupName}] Round ${roundNumber} winner announced`;
  const text = `Hi ${recipientName},

The draw for ${groupName} (Round ${roundNumber}) has completed.
• Winner: ${winnerName}
• Pot: ${formattedPot}

See how the draw was checked:
${checkUrl}

This app does not hold money. It only keeps the record.
Unsubscribe: ${unsubscribeUrl}`;

  const htmlBody = `
    <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1c1917;">
      Round ${roundNumber} Winner Announced
    </h2>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #44403c;">
      Hi <strong>${recipientName}</strong>, the winner for ${groupName} (Round ${roundNumber}) is <strong>${winnerName}</strong>.
    </p>
    <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <div style="font-size: 13px; color: #78716c; margin-bottom: 4px;">Winner:</div>
      <div style="font-size: 20px; font-weight: bold; color: #1c1917; margin-bottom: 8px;">${winnerName}</div>
      <div style="font-size: 13px; color: #78716c;">Pot amount: <strong style="color: #44403c;">${formattedPot}</strong></div>
    </div>
    <div style="text-align: center;">
      <a href="${checkUrl}" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 12px;">
        See how the draw was checked
      </a>
    </div>
  `;

  return {
    to: recipientEmail,
    subject,
    text,
    html: wrapHtml(subject, htmlBody, groupName, unsubscribeUrl, lang),
    groupId: '',
    type: 'draw_result'
  };
}

/**
 * 4. Monthly Summary Email
 */
export function buildMonthlySummaryEmail(params: {
  recipientEmail: string;
  recipientName: string;
  groupName: string;
  contributionsRecorded: number;
  roundsPaidCount: number;
  totalRounds: number;
  hasWon: boolean;
  wonRoundsList: number[];
  nextDueDate: string;
  unsubscribeUrl: string;
  lang: Language;
}): EmailPayload {
  const { recipientEmail, recipientName, groupName, contributionsRecorded, roundsPaidCount, totalRounds, hasWon, wonRoundsList, nextDueDate, unsubscribeUrl, lang } = params;
  const formattedContrib = formatETB(contributionsRecorded, lang);

  if (lang === 'am') {
    const subject = `[${groupName}] የወርሀዊ እቁብዎ ማጠቃለያ`;
    const wonText = hasWon
      ? `አስቀድመው ወጥቶልዎታል (በዙር ${wonRoundsList.join(', ')})`
      : 'እስካሁን አልወጣሎትም (በቀጣይ ዙሮች ውስጥ ይካተታሉ)';

    const text = `ሰላም ${recipientName}፣

የ${groupName} ወርሀዊ ማጠቃለያ፡
• በመተግበሪያው የተመዘገበ መዋጮዎ፡ ${formattedContrib}
• የከፈሉት ዙር፡ ${roundsPaidCount} ከ ${totalRounds}
• የዕጣ ሁኔታ፡ ${wonText}
• ቀጣይ የክፍያ ቀን፡ ${nextDueDate}

ይህ መተግበሪያ ገንዘብ አይይዝም ወይም አያስተላልፍም። መረጃውን ብቻ ይመዘግባል።
መልእክት ላለመቀበል፡ ${unsubscribeUrl}`;

    const htmlBody = `
      <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1c1917;">
        የወርሀዊ እቁብዎ ማጠቃለያ
      </h2>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #44403c;">
        ሰላም <strong>${recipientName}</strong>፣ የ${groupName} የወር ማጠቃለያዎ እንደሚከተለው ነው፡
      </p>
      <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 18px; margin-bottom: 24px; line-height: 1.8;">
        <div style="font-size: 13px; color: #78716c;">በመተግበሪያው የተመዘገበ መዋጮዎ፡</div>
        <div style="font-size: 22px; font-weight: bold; color: #1c1917; margin-bottom: 12px;">${formattedContrib}</div>
        <div style="font-size: 14px; color: #44403c;">
          <strong>የከፈሉት ዙር፡</strong> ${roundsPaidCount} ከ ${totalRounds}
        </div>
        <div style="font-size: 14px; color: #44403c;">
          <strong>የዕጣ ሁኔታ፡</strong> ${wonText}
        </div>
        <div style="font-size: 14px; color: #44403c;">
          <strong>ቀጣይ የክፍያ ቀን፡</strong> ${nextDueDate}
        </div>
      </div>
    `;

    return {
      to: recipientEmail,
      subject,
      text,
      html: wrapHtml(subject, htmlBody, groupName, unsubscribeUrl, lang),
      groupId: '',
      type: 'monthly_summary'
    };
  }

  // English
  const subject = `[${groupName}] Your monthly Equb summary`;
  const wonText = hasWon
    ? `Won in Round ${wonRoundsList.join(', ')}`
    : 'Not yet won (eligible in upcoming rounds)';

  const text = `Hi ${recipientName},

Here is your monthly summary for ${groupName}:
• Contributions recorded in the app so far: ${formattedContrib}
• Rounds paid: ${roundsPaidCount} of ${totalRounds}
• Status: ${wonText}
• Next due date: ${nextDueDate}

This app does not hold money. It only keeps the record.
Unsubscribe: ${unsubscribeUrl}`;

  const htmlBody = `
    <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 12px 0; color: #1c1917;">
      Your Monthly Equb Summary
    </h2>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px 0; color: #44403c;">
      Hi <strong>${recipientName}</strong>, here is your recorded status in ${groupName}:
    </p>
    <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 18px; margin-bottom: 24px; line-height: 1.8;">
      <div style="font-size: 13px; color: #78716c;">Contributions recorded in the app so far:</div>
      <div style="font-size: 22px; font-weight: bold; color: #1c1917; margin-bottom: 12px;">${formattedContrib}</div>
      <div style="font-size: 14px; color: #44403c;">
        <strong>Rounds paid:</strong> ${roundsPaidCount} of ${totalRounds}
      </div>
      <div style="font-size: 14px; color: #44403c;">
        <strong>Draw status:</strong> ${wonText}
      </div>
      <div style="font-size: 14px; color: #44403c;">
        <strong>Next due date:</strong> ${nextDueDate}
      </div>
    </div>
  `;

  return {
    to: recipientEmail,
    subject,
    text,
    html: wrapHtml(subject, htmlBody, groupName, unsubscribeUrl, lang),
    groupId: '',
    type: 'monthly_summary'
  };
}
