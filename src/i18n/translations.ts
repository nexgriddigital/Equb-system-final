import { Language, Interval, DrawMethod } from '../types/equb';

export interface TranslationDictionary {
  appName: string;
  appTagline: string;
  disclaimer: string;
  disclaimerShort: string;
  chooseLanguage: string;
  chooseLanguageDesc: string;
  continueBtn: string;

  // Auth & Account
  loginTitle: string;
  signupTitle: string;
  forgotPasswordTitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  displayNameLabel: string;
  displayNamePlaceholder: string;
  signInBtn: string;
  signUpBtn: string;
  sendResetEmailBtn: string;
  continueWithGoogle: string;
  noAccountPrompt: string;
  haveAccountPrompt: string;
  forgotPasswordPrompt: string;
  backToSignIn: string;
  resetEmailSent: string;
  loginErrorInvalid: string;
  loginErrorUserNotFound: string;
  loginErrorWrongPassword: string;
  loginErrorEmailInUse: string;
  loginErrorWeakPassword: string;
  loginErrorOperationNotAllowed: string;
  loginErrorNetwork: string;
  loginErrorGeneric: string;
  logoutBtn: string;
  deleteAccountBtn: string;
  deleteAccountConfirm: string;
  deleteAccountWarning: string;
  accountDeleted: string;
  settingsTitle: string;
  myAccount: string;
  roleOrganizer: string;
  roleMember: string;

  // Backup & Restore in Settings (Clear everyday words)
  saveCopyData: string;
  saveCopyDataDesc: string;
  restoreData: string;
  restoreDataDesc: string;
  exportSuccess: string;
  importSuccess: string;
  importFailed: string;

  // Navigation Bottom Tabs (4 tabs)
  navGroups: string;
  navThisRound: string;
  navHistory: string;
  navSettings: string;

  // Home & Groups
  home: string;
  groups: string;
  myGroups: string;
  createGroupBtn: string; // "+ Create a group"
  editGroup: string;
  deleteGroup: string;
  joinWithCode: string;
  enterInviteCode: string;
  inviteCodePlaceholder: string;
  joinBtn: string;
  joinSuccess: string;
  invalidInviteCode: string;
  inviteCodeLabel: string;
  copyInviteCode: string;
  copyInviteLink: string;
  inviteCopied: string;
  groupName: string;
  groupNamePlaceholder: string;
  contributionAmount: string;
  contributionHelp: string;
  interval: string;
  weekly: string;
  biweekly: string;
  monthly: string;
  startDate: string;
  members: string;
  memberCount: string;
  addMember: string;
  memberName: string;
  memberNamePlaceholder: string;
  phoneOptional: string;
  shares: string;
  singleShare: string;
  doubleShare: string;
  saveGroup: string;
  cancel: string;
  back: string;
  deleteConfirm: string;
  loadDemo: string;
  demoLoaded: string;
  activeCycle: string;
  cycleCompleted: string;
  currentRound: string;
  roundProgress: string;
  potSize: string;
  totalCollected: string;
  nextDraw: string;
  payoutOrder: string;
  status: string;
  paid: string;
  unpaid: string;
  markPaid: string;
  markUnpaid: string;
  markAllPaid: string;
  markAllUnpaid: string;
  membersPaidCount: string;
  drawRoom: string;
  enterDrawRoom: string;
  payments: string;
  history: string;
  shareSummary: string;
  copyTelegram: string;
  telegramCopied: string;
  noGroupsYet: string;
  noGroupsDesc: string;
  createFirstGroup: string;
  noActiveGroupSelected: string;
  offlineBanner: string;
  retryBtn: string;

  // Simplified Draw Check (No technical jargon)
  checkThisDraw: string; // "Check this draw"
  wasDrawFairTitle: string; // "Was the draw fair?"
  checkingDraw: string; // "Checking..."
  drawWasFairSuccess: string; // "This draw was fair."
  drawWasFairSuccessSub: string; // "Everyone's name was in the draw, and the result was not changed."
  drawWasFairFailure: string; // "Something does not match. Ask the organizer to explain."
  peopleInDraw: string;
  winnerLabel: string;
  drawDateLabel: string;
  roundLabel: string;
  drawCodeLabel: string;
  shareThisDraw: string;
  copyLink: string;
  shareToMessenger: string;
  linkCopied: string;
  checkWithCodeTitle: string;
  checkWithCodePrompt: string;
  checkCodePlaceholder: string;
  checkCodeBtn: string;
  invalidDrawCode: string;
  chooseDrawFirstWarning: string;

  // "How does this work?" in plain words
  howDoesThisWork: string;
  howStep1Title: string;
  howStep1Desc: string;
  howStep2Title: string;
  howStep2Desc: string;
  howStep3Title: string;
  howStep3Desc: string;
  close: string;

  // "For experts" (Collapsed section)
  forExperts: string;
  forExpertsDesc: string;
  pasteDrawCodeJson: string;
  pastePlaceholder: string;
  verifyRawJsonBtn: string;

  // Live Member Draw Input
  memberInputSectionTitle: string;
  memberInputPromptOwnPhone: string;
  memberInputPlaceholder: string;
  submitMyInputBtn: string;
  inputSubmittedSuccess: string;
  inputsReceivedCount: string;

  // Draw Room
  drawRoomTitle: string;
  drawRoomSubtitle: string;
  fullscreenMode: string;
  exitFullscreen: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  eligibleCount: string;
  ineligibleUnpaid: string;
  ineligibleWonAll: string;
  lockListAndGenerateCommitment: string;
  listLocked: string;
  memberInputPrompt: string;
  quickFillInputs: string;
  computeSeedAndReady: string;
  spinWheel: string;
  spinning: string;
  winnerAnnounced: string;
  winnerCongrats: string;
  confirmWinnerAndSaveRound: string;
  specialActions: string;
  emergencyQueueJump: string;
  swapShares: string;
  queueJumpTitle: string;
  queueJumpDesc: string;
  selectMember: string;
  votesInFavor: string;
  votesAgainst: string;
  emergencyReason: string;
  approveDecision: string;
  swapTitle: string;
  swapDesc: string;
  memberA: string;
  memberB: string;
  swapReason: string;
  executeSwap: string;

  // History & Ledger
  roundHistoryTitle: string;
  roundNumber: string;
  drawDate: string;
  winner: string;
  payout: string;
  method: string;
  methodLottery: string;
  methodGroupDecision: string;
  methodSwap: string;
  addCorrectionNote: string;
  reasonForNote: string;
  authorName: string;
  saveNote: string;
  netPosition: string;
  totalContributed: string;
  winsRatio: string;
  allSharesWon: string;
  remainingShares: string;
  cannotDrawNoEligible: string;
  atLeastTwoMembersRequired: string;
  groupSaved: string;
  memberViewOnlyWarning: string;

  // Draw Check & Plain Language
  enterDrawCode: string;
  wasDrawFair: string;
  drawWasFair: string;
  everyoneIncluded: string;
  copiedLink: string;
  copyDrawLink: string;
  drawMismatch: string;
  forExpertsTitle: string;
  copyRawJson: string;
  howWorksStep1: string;
  howWorksStep2: string;
  howWorksStep3: string;
  newGroup: string;

  // Member Emails & Group Notifications
  memberEmailNote: string;
  optionalEmailPlaceholder: string;
  emailScheduleSettings: string;
  paymentRemindersToggle: string;
  reminderScheduleDays: string;
  daysBefore3: string;
  daysBefore1: string;
  dueDay: string;
  daysOverdue2: string;
  winnerAlertToggle: string;
  memberResultsToggle: string;
  monthlySummaryToggle: string;

  // Settings & Notifications
  notificationsSection: string;
  sendMeEmailNotifications: string;
  blazePlanTitle: string;
  blazePlanDesc: string;
  sendTestEmailBtn: string;
  messagesSentLog: string;
  saveCopyOfData: string;
  restoreMyData: string;

  // Technical & Modal labels
  proofModalTitle: string;
  commitmentHashLabel: string;
  commitmentExplanation: string;
  seedHashLabel: string;
  proofMathematicalDetails: string;
  memberInputsRecorded: string;
  eligibleTicketsAtDraw: string;
  recomputeAndVerify: string;
  verifyPageTitle: string;
  howFairDrawWorks: string;
  fairDrawExplanation: string;
  pasteProofJson: string;
  pasteProofPlaceholder: string;
  verifyButton: string;
  verificationPassed: string;
  verificationFailed: string;
  backupRestore: string;
  exportData: string;
  importData: string;
  navCurrentRound: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Equb Draw',
    appTagline: 'Fair Lottery & Ledger for Ethiopian Equb',
    disclaimer: 'This app NEVER holds, moves, or processes money. Members pay each other directly outside the app (cash, Telebirr, CBE, bank transfer). The app only runs the draw and keeps transparent records.',
    disclaimerShort: 'This app does not hold money. It only runs the draw and keeps the record.',
    chooseLanguage: 'Choose Language / ቋንቋ ይምረጡ',
    chooseLanguageDesc: 'Select your preferred language. You can change this at any time in Settings.',
    continueBtn: 'Continue',

    loginTitle: 'Sign in to Equb Draw',
    signupTitle: 'Create your Account',
    forgotPasswordTitle: 'Reset Password',
    emailLabel: 'Email Address',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    displayNameLabel: 'Full Name',
    displayNamePlaceholder: 'e.g., Abebe Kebede',
    signInBtn: 'Sign In',
    signUpBtn: 'Create Account',
    sendResetEmailBtn: 'Send Reset Link',
    continueWithGoogle: 'Continue with Google',
    noAccountPrompt: "Don't have an account? Sign up",
    haveAccountPrompt: 'Already have an account? Sign in',
    forgotPasswordPrompt: 'Forgot password?',
    backToSignIn: 'Back to Sign In',
    resetEmailSent: 'Password reset link sent to your email!',
    loginErrorInvalid: 'Invalid email or password. Please try again.',
    loginErrorUserNotFound: 'No account found with this email.',
    loginErrorWrongPassword: 'Incorrect password.',
    loginErrorEmailInUse: 'An account with this email already exists.',
    loginErrorWeakPassword: 'Password should be at least 6 characters.',
    loginErrorOperationNotAllowed: 'Email/Password sign-up is not yet enabled in the Firebase Console. Use "Continue with Google" below, or enable Email/Password provider in your Firebase project.',
    loginErrorNetwork: 'Network connection failed. Please check your internet connection.',
    loginErrorGeneric: 'Authentication error. Please check your credentials or use Google sign-in.',
    logoutBtn: 'Log Out',
    deleteAccountBtn: 'Delete My Account',
    deleteAccountConfirm: 'Are you sure you want to permanently delete your account? This action cannot be undone.',
    deleteAccountWarning: 'Permanently deletes your account and removes your profile.',
    accountDeleted: 'Your account has been deleted.',
    settingsTitle: 'Settings',
    myAccount: 'My Account',
    roleOrganizer: 'Organizer',
    roleMember: 'Member',

    saveCopyData: 'Save a copy of my data',
    saveCopyDataDesc: 'Download all your Equb records as a backup file.',
    restoreData: 'Restore my data',
    restoreDataDesc: 'Bring back your Equb records from a backup file.',
    exportSuccess: 'Backup file saved to your device!',
    importSuccess: 'Backup restored successfully!',
    importFailed: 'Could not restore file. Please check file format.',

    navGroups: 'Groups',
    navThisRound: 'This round',
    navHistory: 'History',
    navSettings: 'Settings',

    home: 'Home',
    groups: 'Equb Groups',
    myGroups: 'My Groups',
    createGroupBtn: '+ Create a group',
    editGroup: 'Edit Equb',
    deleteGroup: 'Delete Equb',
    joinWithCode: 'Join with Code',
    enterInviteCode: 'Enter 6-Character Invite Code',
    inviteCodePlaceholder: 'e.g. EQ74AB',
    joinBtn: 'Join Equb',
    joinSuccess: 'Successfully joined the Equb!',
    invalidInviteCode: 'No Equb found with this invite code. Please check with your organizer.',
    inviteCodeLabel: 'Invite Code',
    copyInviteCode: 'Copy Code',
    copyInviteLink: 'Copy Link',
    inviteCopied: 'Invite code copied!',
    groupName: 'Equb Name',
    groupNamePlaceholder: 'e.g., Family Equb, Friends Circle',
    contributionAmount: 'Contribution per share',
    contributionHelp: 'Members with 2 shares contribute double each round',
    interval: 'Contribution Interval',
    weekly: 'Weekly',
    biweekly: 'Every 2 Weeks',
    monthly: 'Monthly',
    startDate: 'Start Date',
    members: 'Members & Shares',
    memberCount: 'members',
    addMember: 'Add Member',
    memberName: 'Full Name',
    memberNamePlaceholder: 'e.g., Abebe Kebede',
    phoneOptional: 'Phone / Telegram (optional)',
    shares: 'Shares',
    singleShare: '1 Share (Single)',
    doubleShare: '2 Shares (Double)',
    saveGroup: 'Save Equb Group',
    cancel: 'Cancel',
    back: 'Back',
    deleteConfirm: 'Are you sure you want to delete this Equb group? This cannot be undone.',
    loadDemo: 'Load Demo Equb (6 Friends)',
    demoLoaded: 'Sample 6-member Equb created with mixed shares!',
    activeCycle: 'Active Cycle',
    cycleCompleted: 'Cycle Completed! All shares have won.',
    currentRound: 'Current Round',
    roundProgress: 'Round Progress',
    potSize: 'Round Pot',
    totalCollected: 'Collected So Far',
    nextDraw: 'Next Draw',
    payoutOrder: 'Payout History',
    status: 'Status',
    paid: 'Paid',
    unpaid: 'Unpaid',
    markPaid: 'Mark Paid',
    markUnpaid: 'Mark Unpaid',
    markAllPaid: 'Mark All as Paid',
    markAllUnpaid: 'Reset to Unpaid',
    membersPaidCount: 'members paid',
    drawRoom: 'Draw Room',
    enterDrawRoom: 'Enter Draw Room',
    payments: 'Payment Ledger',
    history: 'Cycle History',
    shareSummary: 'Share to Telegram',
    copyTelegram: 'Copy Telegram Summary',
    telegramCopied: 'Summary copied to clipboard!',
    noGroupsYet: 'No Equb Groups Yet',
    noGroupsDesc: 'Create an Equb group for your family or friends, or join an existing group with an invite code.',
    createFirstGroup: 'Create First Equb',
    noActiveGroupSelected: 'No active Equb selected. Please select or create a group from the Groups tab.',
    offlineBanner: 'You are currently offline. Live updates will resume when reconnected.',
    retryBtn: 'Retry',

    // Simplified Check Draw
    checkThisDraw: 'Check this draw',
    wasDrawFairTitle: 'Was the draw fair?',
    checkingDraw: 'Checking...',
    drawWasFairSuccess: 'This draw was fair.',
    drawWasFairSuccessSub: "Everyone's name was in the draw, and the result was not changed.",
    drawWasFairFailure: 'Something does not match. Ask the organizer to explain.',
    peopleInDraw: 'People who were in this draw',
    winnerLabel: 'Winner',
    drawDateLabel: 'Draw Date',
    roundLabel: 'Round',
    drawCodeLabel: 'Draw Code',
    shareThisDraw: 'Share this draw',
    copyLink: 'Copy link',
    shareToMessenger: 'Share to Telegram / WhatsApp',
    linkCopied: 'Link copied to clipboard!',
    checkWithCodeTitle: 'Check a draw by code',
    checkWithCodePrompt: 'Enter the 6-character draw code shared by your organizer:',
    checkCodePlaceholder: 'e.g. EQ74AB',
    checkCodeBtn: 'Check now',
    invalidDrawCode: 'No draw found with this code. Please check with your organizer.',
    chooseDrawFirstWarning: 'Choose a draw first to see details.',

    // Plain words explanation
    howDoesThisWork: 'How does this work?',
    howStep1Title: '1. Names are locked before the draw',
    howStep1Desc: 'Before the draw, the list of names is locked and everyone can see it.',
    howStep2Title: '2. Everyone adds a random number',
    howStep2Desc: 'Everyone adds a number of their own, so nobody can control the result.',
    howStep3Title: '3. Math picks the winner',
    howStep3Desc: 'The app picks the winner from these numbers. Anyone can check it again.',
    close: 'Close',

    // For experts
    forExperts: 'For experts',
    forExpertsDesc: 'Detailed calculations and raw data records.',
    pasteDrawCodeJson: 'Paste draw record to check manually:',
    pastePlaceholder: '{"roundNumber": 1, ...}',
    verifyRawJsonBtn: 'Run calculation',

    // Live Member Draw Input
    memberInputSectionTitle: 'Add your number for the draw',
    memberInputPromptOwnPhone: 'Enter any number or short word from your phone to mix into the draw:',
    memberInputPlaceholder: 'e.g., 42, 777, coffee',
    submitMyInputBtn: 'Submit',
    inputSubmittedSuccess: 'Your number was added to the draw!',
    inputsReceivedCount: 'numbers added',

    // Draw Room (Simplified)
    drawRoomTitle: 'Live Equb Draw Room',
    drawRoomSubtitle: 'Fair lottery watched live by all members',
    fullscreenMode: 'Screen Share Mode',
    exitFullscreen: 'Exit Fullscreen',
    step1Title: '1. Check the names in the draw',
    step1Desc: 'Only members who have paid for this round and have not won yet are in the draw.',
    step2Title: '2. Everyone adds a number',
    step2Desc: 'Members add their own numbers so the winner cannot be predicted.',
    step3Title: '3. Lock and prepare the draw',
    step3Desc: 'The app combines all numbers together to find the winner.',
    step4Title: '4. Spin for the winner',
    step4Desc: 'Spin the wheel to reveal the winner.',
    eligibleCount: 'Tickets in the draw',
    ineligibleUnpaid: 'Unpaid (not in this draw)',
    ineligibleWonAll: 'Already won this cycle',
    lockListAndGenerateCommitment: 'Lock names and prepare draw',
    listLocked: 'Names locked and confirmed',
    memberInputPrompt: 'Enter number spoken by member',
    quickFillInputs: 'Add random numbers for remaining members',
    computeSeedAndReady: 'Combine numbers and get ready',
    spinWheel: 'Spin the wheel',
    spinning: 'Finding the winner...',
    winnerAnnounced: 'Winner chosen!',
    winnerCongrats: 'Congratulations to',
    confirmWinnerAndSaveRound: 'Confirm winner and finish round',
    specialActions: 'Other actions',
    emergencyQueueJump: 'Group vote (Emergency)',
    swapShares: 'Swap turn with another member',
    queueJumpTitle: 'Group Decision (Emergency)',
    queueJumpDesc: 'If a member has an emergency, the group can vote to give this round to them instead of drawing.',
    selectMember: 'Select member',
    votesInFavor: 'Yes votes',
    votesAgainst: 'No votes',
    emergencyReason: 'Reason',
    approveDecision: 'Confirm group decision',
    swapTitle: 'Swap turn between two members',
    swapDesc: 'Two members who have not won yet can swap turns if both agree.',
    memberA: 'First member',
    memberB: 'Second member',
    swapReason: 'Note',
    executeSwap: 'Confirm swap',

    roundHistoryTitle: 'All Rounds',
    roundNumber: 'Round',
    drawDate: 'Draw Date',
    winner: 'Winner',
    payout: 'Payout',
    method: 'Method',
    methodLottery: 'Draw',
    methodGroupDecision: 'Group Decision',
    methodSwap: 'Turn Swap',
    addCorrectionNote: 'Add a note',
    reasonForNote: 'Explanation',
    authorName: 'Your name',
    saveNote: 'Save note',
    netPosition: 'Net Position',
    totalContributed: 'Contributed',
    winsRatio: 'Wins',
    allSharesWon: 'Done',
    remainingShares: 'Unwon Shares',
    cannotDrawNoEligible: 'Cannot draw: no paid members with remaining shares.',
    atLeastTwoMembersRequired: 'At least 2 members are needed to start an Equb.',
    groupSaved: 'Equb saved successfully!',
    memberViewOnlyWarning: 'You are viewing this group as a Member. Only the organizer can mark payments and run draws.',

    // Draw Check & Plain Language
    enterDrawCode: 'Enter 6-character draw code',
    wasDrawFair: 'Was the draw fair?',
    drawWasFair: 'This draw was fair.',
    everyoneIncluded: "Everyone's name was in the draw, and the result was not changed.",
    copiedLink: 'Link copied to clipboard!',
    copyDrawLink: 'Copy Link',
    drawMismatch: 'Something does not match. Ask the organizer to explain.',
    forExpertsTitle: 'For experts: see cryptographic proof',
    copyRawJson: 'Copy raw JSON',
    howWorksStep1: 'Before the draw, the computer locks in a secret random number.',
    howWorksStep2: 'During the draw, members add their own numbers to mix it up.',
    howWorksStep3: 'After the draw, the secret is revealed so anyone can check that the winner was picked fairly and could not have been chosen in advance.',
    newGroup: 'New Equb',

    // Member Emails & Group Notifications
    memberEmailNote: 'Only add an email if this person agreed to get messages.',
    optionalEmailPlaceholder: 'Email address (optional)',
    emailScheduleSettings: 'Email Notification Settings',
    paymentRemindersToggle: 'Payment Reminders',
    reminderScheduleDays: 'Reminder Schedule Days',
    daysBefore3: '3 days before',
    daysBefore1: '1 day before',
    dueDay: 'On due date',
    daysOverdue2: '2 days overdue',
    winnerAlertToggle: 'Winner Alert ("You\'ve won")',
    memberResultsToggle: 'Member Draw Results',
    monthlySummaryToggle: 'Monthly Ledger Summary (1st of month)',

    // Settings & Notifications
    notificationsSection: 'Email Notifications',
    sendMeEmailNotifications: 'Send me email notifications',
    blazePlanTitle: 'Firebase Blaze Plan Required',
    blazePlanDesc: 'Sending automated emails and scheduled cron reminders requires the Firebase Blaze plan and Trigger Email extension.',
    sendTestEmailBtn: 'Send test email to organizer',
    messagesSentLog: 'Messages Sent Log',
    saveCopyOfData: 'Save a copy of my data',
    restoreMyData: 'Restore my data',

    // Technical & Modal labels
    proofModalTitle: 'Draw Proof',
    commitmentHashLabel: 'Initial Locked Commitment',
    commitmentExplanation: 'Calculated before any member inputs were submitted to lock the random choice.',
    seedHashLabel: 'Deterministic Mixed Seed',
    proofMathematicalDetails: 'Deterministic Winner Calculation',
    memberInputsRecorded: 'Member Inputs Recorded',
    eligibleTicketsAtDraw: 'Eligible Tickets at Draw',
    recomputeAndVerify: 'Check Draw Calculation',
    verifyPageTitle: 'Was the draw fair?',
    howFairDrawWorks: 'How does this work?',
    fairDrawExplanation: 'Before the draw, the system locks a secret number. During the draw, members add their own numbers. After the draw, anyone can check that the winner could not have been picked in advance.',
    pasteProofJson: 'Paste draw proof data',
    pasteProofPlaceholder: 'Paste draw code or JSON here...',
    verifyButton: 'Check Draw',
    verificationPassed: 'Draw Verified Fair',
    verificationFailed: 'Verification Mismatch',
    backupRestore: 'Save / Restore Data',
    exportData: 'Save a copy of my data',
    importData: 'Restore my data',
    navCurrentRound: 'This round'
  },
  am: {
    appName: 'እቁብ ዕጣ',
    appTagline: 'ፍትሐዊ የዕጣ ማውጫ እና የሒሳብ መመዝገቢያ',
    disclaimer: 'ይህ መተግበሪያ ገንዘብ አይይዝም ወይም አያስተላልፍም። አባላት በቀጥታ እርስ በርሳቸው ወይም ለአስተባባሪው (በጥሬ ገንዘብ፣ በቴሌብር፣ በባንክ) ይከፋፈላሉ። መተግበሪያው የሚሠራው ፍትሐዊውን ዕጣ ማውጣት እና መረጃን መመዝገብ ብቻ ነው።',
    disclaimerShort: 'ይህ መተግበሪያ ገንዘብ አይይዝም ወይም አያስተላልፍም። ዕጣውን ያወጣል እንዲሁም መረጃውን ብቻ ይመዘግባል።',
    chooseLanguage: 'ቋንቋ ይምረጡ / Choose Language',
    chooseLanguageDesc: 'የሚፈልጉትን ቋንቋ ይምረጡ። ይህንን ምርጫ በማንኛውም ጊዜ በቅንብሮች ውስጥ መቀየር ይችላሉ።',
    continueBtn: 'ቀጥል',

    loginTitle: 'ወደ እቁብ ዕጣ ይግቡ',
    signupTitle: 'አዲስ መለያ ይክፈቱ',
    forgotPasswordTitle: 'የይለፍ ቃል ማስተካከያ',
    emailLabel: 'የኢሜይል አድራሻ',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'የይለፍ ቃል',
    passwordPlaceholder: 'ቢያንስ 6 ፊደላት ወይም ቁጥሮች',
    displayNameLabel: 'ሙሉ ስም',
    displayNamePlaceholder: 'ለምሳሌ፡ አበበ ከበደ',
    signInBtn: 'ግባ',
    signUpBtn: 'መለያ ፍጠር',
    sendResetEmailBtn: 'የይለፍ ቃል ማስጀመሪያ ላክ',
    continueWithGoogle: 'በ Google ቀጥል',
    noAccountPrompt: 'መለያ የለዎትም? አዲስ ይክፈቱ',
    haveAccountPrompt: 'መለያ አለዎት? ይግቡ',
    forgotPasswordPrompt: 'የይለፍ ቃል ረሱ?',
    backToSignIn: 'ወደ መግቢያ ገጽ ተመለስ',
    resetEmailSent: 'የይለፍ ቃል ማስተካከያ ሊንክ ወደ ኢሜይልዎ ተልኳል!',
    loginErrorInvalid: 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል። እባክዎ ደግመው ይሞክሩ።',
    loginErrorUserNotFound: 'በዚህ ኢሜይል የተመዘገበ መለያ አልተገኘም።',
    loginErrorWrongPassword: 'የይለፍ ቃሉ የተሳሳተ ነው።',
    loginErrorEmailInUse: 'ይህ ኢሜይል አስቀድሞ ተመዝግቧል።',
    loginErrorWeakPassword: 'የይለፍ ቃሉ ቢያንስ 6 ፊደላት ወይም ቁጥሮች መሆን አለበት።',
    loginErrorOperationNotAllowed: 'የኢሜይል/የይለፍ ቃል ምዝገባ በFirebase አልነቃም። እባክዎ ከታች "በ Google ቀጥል" የሚለውን ይጠቀሙ ወይም በFirebase Console ውስጥ ያብሩት።',
    loginErrorNetwork: 'የበይነመረብ ግንኙነት ተቋርጧል። እባክዎ የበይነመረብ ግንኙነትዎን ፈትሸው እንደገና ይሞክሩ።',
    loginErrorGeneric: 'የመግቢያ ስህተት አጋጥሟል። እባክዎ መረጃዎን ያረጋግጡ ወይም በGoogle ይግቡ።',
    logoutBtn: 'ውጣ',
    deleteAccountBtn: 'መለያዬን ሰርዝ',
    deleteAccountConfirm: 'እርግጠኛ ነዎት መለያዎን በቋሚነት መሰረዝ ይፈልጋሉ? ይህ እርምጃ ሊመለስ አይችልም።',
    deleteAccountWarning: 'መለያዎን እና የተመዘገቡ መረጃዎችን በቋሚነት ያጠፋል።',
    accountDeleted: 'መለያዎ በተሳካ ሁኔታ ተሰርዟል።',
    settingsTitle: 'ቅንብሮች',
    myAccount: 'የእኔ መለያ',
    roleOrganizer: 'አስተባባሪ',
    roleMember: 'አባል',

    saveCopyData: 'የመረጃዬን ቅጂ አስቀምጥ',
    saveCopyDataDesc: 'የእቁብ መረጃዎችን በፋይል አውርደው ያስቀምጡ።',
    restoreData: 'መረጃዬን መልስ',
    restoreDataDesc: 'አስቀድመው ያስቀመጡትን የእቁብ መረጃ ፋይል ይመልሱ።',
    exportSuccess: 'የመረጃው ቅጂ ወርዷል!',
    importSuccess: 'መረጃው በትክክል ተመልሷል!',
    importFailed: 'ፋይሉን ማስገባት አልተቻለም። እባክዎ ትክክለኛ ፋይል መሆኑን ያረጋግጡ።',

    navGroups: 'ቡድኖች',
    navThisRound: 'ይህ ዙር',
    navHistory: 'ታሪክ',
    navSettings: 'ቅንብሮች',

    home: 'ዋና ገጽ',
    groups: 'የእቁብ ቡድኖች',
    myGroups: 'የእኔ እቁቦች',
    createGroupBtn: '+ አዲስ እቁብ ፍጠር',
    editGroup: 'እቁብ አድስ',
    deleteGroup: 'እቁብ ሰርዝ',
    joinWithCode: 'በኮድ ተቀላቀል',
    enterInviteCode: 'ባለ 6-ፊደል የመጋበዣ ኮድ ያስገቡ',
    inviteCodePlaceholder: 'ለምሳሌ፡ EQ74AB',
    joinBtn: 'እቁቡን ተቀላቀል',
    joinSuccess: 'እቁቡን በተሳካ ሁኔታ ተቀላቅለዋል!',
    invalidInviteCode: 'በዚህ ኮድ የተመዘገበ እቁብ አልተገኘም። እባክዎ አስተባባሪውን ያነጋግሩ።',
    inviteCodeLabel: 'የመጋበዣ ኮድ',
    copyInviteCode: 'ኮድ ቅዳ',
    copyInviteLink: 'ሊንክ ቅዳ',
    inviteCopied: 'የመጋበዣ ኮዱ ተቀድቷል!',
    groupName: 'የእቁቡ ስም',
    groupNamePlaceholder: 'ለምሳሌ፡ የቤተሰብ እቁብ፣ የጓደኞች እቁብ',
    contributionAmount: 'የአንድ ዕጣ መዋጮ',
    contributionHelp: '2 ዕጣ ያላቸው አባላት በየዙሩ እጥፍ ይከፍላሉ',
    interval: 'የመዋጮ ጊዜ',
    weekly: 'በየሳምንቱ',
    biweekly: 'በየሁለት ሳምንቱ',
    monthly: 'በየወሩ',
    startDate: 'የሚጀመርበት ቀን',
    members: 'አባላት እና የዕጣ ብዛት',
    memberCount: 'አባላት',
    addMember: 'አባል ጨምር',
    memberName: 'ሙሉ ስም',
    memberNamePlaceholder: 'ለምሳሌ፡ አበበ ከበደ',
    phoneOptional: 'ስልክ / ቴሌግራም (አማራጭ)',
    shares: 'የዕጣ ብዛት',
    singleShare: '1 ዕጣ (ነጠላ)',
    doubleShare: '2 ዕጣ (ድርብ)',
    saveGroup: 'እቁቡን መዝግብ',
    cancel: 'ይቅር',
    back: 'ተመለስ',
    deleteConfirm: 'እርግጠኛ ነዎት ይህን የእቁብ ቡድን መሰረዝ ይፈልጋሉ? ይህ እርምጃ ሊመለስ አይችልም።',
    loadDemo: 'የሙከራ እቁብ ጫን (6 አባላት)',
    demoLoaded: 'የ 6 አባላት የሙከራ እቁብ ተፈጥሯል!',
    activeCycle: 'በሂደት ላይ ያለ ዑደት',
    cycleCompleted: 'ዑደቱ ተጠናቋል! ሁሉም ዕጣዎች ወጥተዋል።',
    currentRound: 'የአሁኑ ዙር',
    roundProgress: 'የዙር ሂደት',
    potSize: 'የዙሩ ጠቅላላ ድምር',
    totalCollected: 'እስካሁን የተሰበሰበ',
    nextDraw: 'ቀጣይ ዕጣ',
    payoutOrder: 'የዕጣ አወጣጥ ቅደም ተከተል',
    status: 'ሁኔታ',
    paid: 'የከፈለ',
    unpaid: 'ያልከፈለ',
    markPaid: 'ከፍሏል',
    markUnpaid: 'አልከፈለም',
    markAllPaid: 'ሁሉንም ከፍለዋል በል',
    markAllUnpaid: 'ሁሉንም ወደ አልከፈለም መልስ',
    membersPaidCount: 'አባላት ከፍለዋል',
    drawRoom: 'የዕጣ ማውጫ ክፍል',
    enterDrawRoom: 'ወደ ዕጣ ማውጫ ክፍል ግባ',
    payments: 'የክፍያ መዝገብ',
    history: 'የዑደቱ ታሪክ',
    shareSummary: 'ወደ ቴሌግራም አጋራ',
    copyTelegram: 'የቴሌግራም ማጠቃለያ ቅዳ',
    telegramCopied: 'ማጠቃለያው ተቀድቷል!',
    noGroupsYet: 'ምንም የእቁብ ቡድን የለም',
    noGroupsDesc: 'ለቤተሰብዎ ወይም ለጓደኞችዎ አዲስ እቁብ ይፍጠሩ ወይም በመጋበዣ ኮድ ይቀላቀሉ።',
    createFirstGroup: 'የመጀመሪያውን እቁብ ፍጠር',
    noActiveGroupSelected: 'ምንም የተመረጠ እቁብ የለም። እባክዎ ከቡድኖች ዝርዝር ውስጥ እቁብ ይምረጡ ወይም ይፍጠሩ።',
    offlineBanner: 'በአሁኑ ሰዓት ከመስመር ውጭ ነዎት። የበይነመረብ ግንኙነት ሲመለስ መረጃው በቀጥታ ይታደሳል።',
    retryBtn: 'እንደገና ሞክር',

    // Simplified Check Draw
    checkThisDraw: 'ዕጣውን ፈትሽ',
    wasDrawFairTitle: 'ዕጣው ፍትሐዊ ነበር?',
    checkingDraw: 'እየተፈተሸ ነው...',
    drawWasFairSuccess: 'ዕጣው ፍትሐዊ ነበር።',
    drawWasFairSuccessSub: 'ሁሉም ሰው ዕጣ ውስጥ ገብቷል፣ ውጤቱም አልተለወጠም።',
    drawWasFairFailure: 'መረጃው አልተመሳከረም። እባክዎ አስተባባሪውን ይጠይቁ።',
    peopleInDraw: 'ዕጣ ውስጥ የነበሩ ሰዎች ዝርዝር',
    winnerLabel: 'አሸናፊ',
    drawDateLabel: 'የወጣበት ቀን',
    roundLabel: 'ዙር',
    drawCodeLabel: 'የዕጣ መለያ ኮድ',
    shareThisDraw: 'ይህንን ዕጣ አጋራ',
    copyLink: 'ሊንክ ቅዳ',
    shareToMessenger: 'በቴሌግራም ወይም በዋትስአፕ አጋራ',
    linkCopied: 'ሊንኩ ተቀድቷል!',
    checkWithCodeTitle: 'ዕጣን በመለያ ኮድ ፈትሽ',
    checkWithCodePrompt: 'አስተባባሪው የላከውን ባለ 6-ፊደል የዕጣ መለያ ኮድ እዚህ ያስገቡ፡',
    checkCodePlaceholder: 'ለምሳሌ፡ EQ74AB',
    checkCodeBtn: 'አሁን ፈትሽ',
    invalidDrawCode: 'በዚህ ኮድ የተመዘገበ ዕጣ አልተገኘም። እባክዎ አስተባባሪውን ያነጋግሩ።',
    chooseDrawFirstWarning: 'ዝርዝሩን ለማየት መጀመሪያ ዕጣ ይምረጡ።',

    // Plain words explanation
    howDoesThisWork: 'እንዴት ነው የሚሰራው?',
    howStep1Title: '1. ስሞች አስቀድመው ይቆለፋሉ',
    howStep1Desc: 'ዕጣው ከመውጣቱ በፊት የአባላት ስም ዝርዝር ይቆለፋል፣ ሁሉም ሰውም ማየት ይችላል።',
    howStep2Title: '2. ሁሉም ሰው ቁጥር ይጨምራል',
    howStep2Desc: 'ማንም ሰው ውጤቱን አስቀድሞ እንዳይቆጣጠር እያንዳንዱ ሰው የራሱን ቁጥር ያስገባል።',
    howStep3Title: '3. ስሌቱ አሸናፊውን ያወጣል',
    howStep3Desc: 'መተግበሪያው ከነዚህ ቁጥሮች አሸናፊውን ያወጣል። ማንኛውም ሰው ደግሞ ውጤቱን ማረጋገጥ ይችላል።',
    close: 'ዝጋ',

    // For experts
    forExperts: 'ለባለሙያዎች (For experts)',
    forExpertsDesc: 'የሂሳብ ስሌቶች እና ጥሬ መረጃዎች።',
    pasteDrawCodeJson: 'የዕጣ ዝርዝር ኮድ እዚህ ይለጥፉ፡',
    pastePlaceholder: '{"roundNumber": 1, ...}',
    verifyRawJsonBtn: 'ስሌቱን አረጋግጥ',

    // Live Member Draw Input
    memberInputSectionTitle: 'የእርስዎን ቁጥር ያስገቡ',
    memberInputPromptOwnPhone: 'በዕጣው ስሌት ውስጥ እንዲካተት ከስልክዎ ቁጥር ወይም አጭር ቃል ያስገቡ፡',
    memberInputPlaceholder: 'ለምሳሌ፡ 42፣ 777፣ ቡና',
    submitMyInputBtn: 'አስገባ',
    inputSubmittedSuccess: 'ቁጥርዎ በዕጣው ውስጥ ተካቷል!',
    inputsReceivedCount: 'ቁጥሮች ገብተዋል',

    // Draw Room (Simplified)
    drawRoomTitle: 'የቀጥታ እቁብ ዕጣ ማውጫ',
    drawRoomSubtitle: 'በሁሉም አባላት ፊት በግልጽ የሚወጣ ፍትሐዊ ዕጣ',
    fullscreenMode: 'ስክሪን ማጋሪያ ሁነታ',
    exitFullscreen: 'ሙሉ ስክሪን ውጣ',
    step1Title: '1. ዕጣ ውስጥ የሚገቡትን ስሞች አረጋግጥ',
    step1Desc: 'የዚህን ዙር የከፈሉ እና እስካሁን ያልወጣላቸው አባላት ብቻ ይገባሉ።',
    step2Title: '2. ሁሉም ሰው የራሱን ቁጥር ያስገባል',
    step2Desc: 'ውጤቱ እንዳይታወቅ አባላት የየራሳቸውን ቁጥር ያስገባሉ።',
    step3Title: '3. ስሞችን ቆልፍ እና ዕጣውን አዘጋጅ',
    step3Desc: 'መተግበሪያው ቁጥሮቹን በማጣመር አሸናፊውን ለመለየት ይዘጋጃል።',
    step4Title: '4. መንኮራኩሩን አሽከርክር',
    step4Desc: 'መንኮራኩሩን በማሽከርከር አሸናፊውን ይፋ አድርግ።',
    eligibleCount: 'ዕጣ ውስጥ የሚገቡ',
    ineligibleUnpaid: 'ያልከፈሉ (ዕጣ ውስጥ አይገቡም)',
    ineligibleWonAll: 'ሁሉንም ዕጣቸውን ያወጡ',
    lockListAndGenerateCommitment: 'ስሞችን ቆልፍ እና ዕጣውን አዘጋጅ',
    listLocked: 'ስሞች ተቆልፈው ተረጋግጠዋል',
    memberInputPrompt: 'አባሉ የተናገረውን ቁጥር ያስገቡ',
    quickFillInputs: 'ላልገቡ አባላት በዘፈቀደ ቁጥሮች ምላ',
    computeSeedAndReady: 'ቁጥሮችን አጣምረህ አዘጋጅ',
    spinWheel: 'መንኮራኩሩን አሽከርክር',
    spinning: 'ዕጣው እየወጣ ነው...',
    winnerAnnounced: 'አሸናፊው ወጥቷል!',
    winnerCongrats: 'እንኳን ደስ አላችሁ ለ',
    confirmWinnerAndSaveRound: 'አሸናፊውን አጽድቀህ ዙሩን አጠናቅቅ',
    specialActions: 'ሌሎች አማራጮች',
    emergencyQueueJump: 'የቡድን ድምጽ (አስቸኳይ)',
    swapShares: 'ተራ መለዋወጥ',
    queueJumpTitle: 'የቡድን ውሳኔ (አስቸኳይ ጉዳይ)',
    queueJumpDesc: 'አንድ አባል አስቸኳይ ጉዳይ ሲያጋጥመው ቡድኑ ድምጽ ሰጥቶ የዚህን ዙር ገንዘብ እንዲወስድ ማድረግ ይቻላል።',
    selectMember: 'አባሉን ይምረጡ',
    votesInFavor: 'የደገፉ ድምጾች',
    votesAgainst: 'የተቃወሙ ድምጾች',
    emergencyReason: 'ምክንያት',
    approveDecision: 'የቡድን ውሳኔውን አጽድቅ',
    swapTitle: 'ሁለት አባላት ተራ መለዋወጫ',
    swapDesc: 'ያልወጣላቸው ሁለት አባላት ከተስማሙ ተራቸውን መለዋወጥ ይችላሉ።',
    memberA: 'የመጀመሪያው አባል',
    memberB: 'ሁለተኛው አባል',
    swapReason: 'ማስታወሻ',
    executeSwap: 'መለዋወጡን አጽድቅ',

    roundHistoryTitle: 'ያለፉ ዙሮች',
    roundNumber: 'ዙር',
    drawDate: 'የወጣበት ቀን',
    winner: 'አሸናፊ',
    payout: 'የገንዘብ መጠን',
    method: 'የወጣበት መንገድ',
    methodLottery: 'በዕጣ',
    methodGroupDecision: 'በቡድን ውሳኔ',
    methodSwap: 'በመለዋወጥ',
    addCorrectionNote: 'ማስታወሻ ጨምር',
    reasonForNote: 'ማብራሪያ',
    authorName: 'የእርስዎ ስም',
    saveNote: 'ማስታወሻ መዝግብ',
    netPosition: 'የተጣራ ሂሳብ',
    totalContributed: 'አጠቃላይ የከፈለው',
    winsRatio: 'ድል',
    allSharesWon: 'ተጠናቋል',
    remainingShares: 'ያልወጡ ዕጣዎች',
    cannotDrawNoEligible: 'ዕጣ ማውጣት አይቻልም፡ የከፈለ እና ዕጣ ያልወጣለት አባል የለም።',
    atLeastTwoMembersRequired: 'እቁብ ለመጀመር ቢያንስ 2 አባላት ያስፈልጋሉ።',
    groupSaved: 'የእቁብ መረጃው ተቀምጧል!',
    memberViewOnlyWarning: 'ይህን እቁብ እንደ አባል እየተመለከቱ ነው። ክፍያዎችን መመዝገብ እና ዕጣ ማውጣት የሚችለው አስተባባሪው ብቻ ነው።',

    // Draw Check & Plain Language
    enterDrawCode: 'ባለ 6-ፊደል የዕጣ ኮድ ያስገቡ',
    wasDrawFair: 'ዕጣው ፍትሐዊ ነበር?',
    drawWasFair: 'ይህ ዕጣ ፍትሐዊ ነበር።',
    everyoneIncluded: 'የሁሉም ሰው ስም በዕጣው ውስጥ ነበረ፣ ውጤቱም አልተለወጠም።',
    copiedLink: 'ሊንኩ ተቀድቷል!',
    copyDrawLink: 'ሊንኩን ቅዳ',
    drawMismatch: 'አንድ ነገር አልተዛመደም። አስተባባሪውን ይጠይቁ።',
    forExpertsTitle: 'ለባለሙያዎች፡ የሒሳብ ማረጋገጫውን ይመልከቱ',
    copyRawJson: 'የ JSON ኮድ ቅዳ',
    howWorksStep1: 'ዕጣው ከመውጣቱ በፊት ኮምፒውተሩ ሚስጥራዊ የዘፈቀደ ቁጥር ይቆልፋል።',
    howWorksStep2: 'ዕጣው በሚወጣበት ጊዜ አባላት የየራሳቸውን ቁጥር ጨምረው ያደባልቁታል።',
    howWorksStep3: 'ከዕጣው በኋላ ማንም ሰው አሸናፊው በቅድሚያ ያልተመረጠና በፍትሐዊ መንገድ የወጣ መሆኑን ማረጋገጥ ይችላል።',
    newGroup: 'አዲስ እቁብ',

    // Member Emails & Group Notifications
    memberEmailNote: 'መልእክት እንዲደርሳቸው የተስማሙ አባላትን ኢሜይል ብቻ ያስገቡ።',
    optionalEmailPlaceholder: 'የኢሜይል አድራሻ (አስገዳጅ ያልሆነ)',
    emailScheduleSettings: 'የኢሜይል ማሳወቂያዎች ቅንብር',
    paymentRemindersToggle: 'የክፍያ ማስታወሻዎች',
    reminderScheduleDays: 'የማስታወሻ መላኪያ ቀናት',
    daysBefore3: '3 ቀን በፊት',
    daysBefore1: '1 ቀን በፊት',
    dueDay: 'በመክፈያው ቀን',
    daysOverdue2: '2 ቀን ካለፈ በኋላ',
    winnerAlertToggle: 'የአሸናፊ ማሳወቂያ ("ዕጣ ደርሶዎታል")',
    memberResultsToggle: 'የዕጣ ውጤት ለአባላት',
    monthlySummaryToggle: 'የወር ማጠቃለያ (በየወሩ በ1ኛው ቀን)',

    // Settings & Notifications
    notificationsSection: 'የኢሜይል ማሳወቂያዎች',
    sendMeEmailNotifications: 'የኢሜይል ማሳወቂያዎች እንዲደርሱኝ',
    blazePlanTitle: 'የ Firebase Blaze እቅድ ያስፈልጋል',
    blazePlanDesc: 'ራስ-ሰር ኢሜይሎችን እና የቀጠሮ ማስታወሻዎችን ለመላክ የ Firebase Blaze እቅድ እና Trigger Email ቅጥያ ያስፈልጋል።',
    sendTestEmailBtn: 'የሙከራ ኢሜይል ለአስተባባሪው ላክ',
    messagesSentLog: 'የተላኩ መልእክቶች መዝገብ',
    saveCopyOfData: 'የመረጃዬን ቅጂ አስቀምጥ',
    restoreMyData: 'መረጃዬን መልስ',

    // Technical & Modal labels
    proofModalTitle: 'የዕጣ ማረጋገጫ',
    commitmentHashLabel: 'የተቆለፈ የኮምፒውተር ሚስጥር',
    commitmentExplanation: 'አባላት የራሳቸውን ቁጥር ከማስገባታቸው በፊት ውጤቱ እንዳይለወጥ አስቀድሞ የተቆለፈ።',
    seedHashLabel: 'የተደባለቀ የዕጣ መነሻ',
    proofMathematicalDetails: 'የዕጣ ስሌት ዝርዝር',
    memberInputsRecorded: 'የተመዘገቡ የአባላት ግብዓቶች',
    eligibleTicketsAtDraw: 'በዕጣው ወቅት የነበሩ ዕጣዎች',
    recomputeAndVerify: 'ዕጣውን ፈትሽ',
    verifyPageTitle: 'ዕጣው ፍትሐዊ ነበር?',
    howFairDrawWorks: 'ይህ እንዴት ይሰራል?',
    fairDrawExplanation: 'ከዕጣው በፊት ኮምፒውተሩ ሚስጥራዊ ቁጥር ይቆልፋል። አባላት የራሳቸውን ቁጥር ያደባልቃሉ። ከዕጣው በኋላ ማንኛውም ሰው ውጤቱ ትክክል መሆኑን ማየት ይችላል።',
    pasteProofJson: 'የዕጣ ማረጋገጫ መረጃ አስገባ',
    pasteProofPlaceholder: 'የዕጣ ኮድ ወይም መረጃ እዚህ ያስገቡ...',
    verifyButton: 'ዕጣውን ፈትሽ',
    verificationPassed: 'ዕጣው ፍትሐዊ ነበር',
    verificationFailed: 'ውጤቱ አልተዛመደም',
    backupRestore: 'መረጃ አስቀምጥ / መልስ',
    exportData: 'የመረጃዬን ቅጂ አስቀምጥ',
    importData: 'መረጃዬን መልስ',
    navCurrentRound: 'ይህ ዙር'
  }
};

export function formatETB(amount: number, lang: Language): string {
  const formattedNumber = new Intl.NumberFormat('en-US').format(Math.round(amount));
  return lang === 'am' ? `${formattedNumber} ብር` : `${formattedNumber} ETB`;
}

export function formatDate(dateStr: string, lang: Language): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function generateTelegramSummary(
  groupName: string,
  roundNumber: number,
  winnerName: string,
  potAmount: number,
  method: DrawMethod,
  paidCount: number,
  totalMembers: number,
  drawCode?: string,
  lang: Language = 'en'
): string {
  const potFormatted = formatETB(potAmount, lang);
  const now = new Date().toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const checkLink = drawCode
    ? `${window.location.origin}?check=${drawCode}`
    : window.location.origin;

  if (lang === 'am') {
    const methodStr =
      method === 'lottery'
        ? '🎲 በፍትሐዊ ዕጣ'
        : method === 'group_decision'
        ? '🤝 በቡድን ውሳኔ'
        : '🔄 በተራ መለዋወጥ';

    return `🇪🇹 **የ${groupName} ዙር ${roundNumber} ማጠቃለያ**

📅 ቀን: ${now}
💰 የዙሩ ድምር: ${potFormatted}
🏆 አሸናፊ: **${winnerName}**
📋 የወጣበት መንገድ: ${methodStr}
👥 የከፈሉ አባላት: ${paidCount} ከ ${totalMembers}

${drawCode ? `🔍 ዕጣው ፍትሐዊ መሆኑን ለማረጋገጥ ይህንን ሊንክ ይጫኑ:\n👉 ${checkLink}\nየዕጣ ኮድ: \`${drawCode}\`` : ''}

📌 *ይህ መተግበሪያ ገንዘብ አያስተላልፍም። ክፍያዎን በቴሌብር፣ በጥሬ ገንዘብ ወይም በባንክ ያጠናቅቁ።*
#Equb #እቁብ #EqubDraw`;
  }

  const methodStr =
    method === 'lottery'
      ? '🎲 Fair Draw'
      : method === 'group_decision'
      ? '🤝 Approved Group Decision'
      : '🔄 Agreed Share Swap';

  return `🇪🇹 **${groupName} — Round ${roundNumber} Result**

📅 Date: ${now}
💰 Pot Size: ${potFormatted}
🏆 Winner: **${winnerName}**
📋 Draw Method: ${methodStr}
👥 Paid Status: ${paidCount} of ${totalMembers} members

${drawCode ? `🔍 Check if this draw was fair:\n👉 ${checkLink}\nDraw Code: \`${drawCode}\`` : ''}

📌 *Note: The app does not hold funds. Please settle payments via Telebirr, cash, or bank transfer directly.*
#Equb #EqubDraw #RotatingSavings`;
}
