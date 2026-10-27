import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Language,
  EqubGroup,
  Member,
  DrawProof,
  RoundHistory,
  Interval,
  PublicDrawRecord
} from '../types/equb';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with 10MB local cache limit for low-RAM Android devices (1GB RAM)
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentSingleTabManager({}),
      cacheSizeBytes: 10 * 1024 * 1024, // 10 MB limit to prevent OOM
    }),
  }, firebaseConfig.firestoreDatabaseId);
} catch {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = dbInstance;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline');
      return false;
    }
    return true;
  }
}

// Generate 6-character clean codes (no 0/O, 1/I)
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateDrawCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function syncUserProfile(user: User, preferredLanguage?: Language) {
  const userRef = doc(db, 'users', user.uid);
  try {
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || user.email?.split('@')[0] || 'Equb Member',
        email: user.email || '',
        language: preferredLanguage || 'am',
        createdAt: new Date().toISOString()
      });
    } else if (preferredLanguage) {
      await updateDoc(userRef, { language: preferredLanguage });
    }
  } catch (err) {
    console.warn('Could not sync user profile to Firestore (non-fatal):', err);
  }
}

export async function getUserLanguage(uid: string): Promise<Language | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data().language as Language;
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateUserLanguage(uid: string, lang: Language) {
  try {
    await updateDoc(doc(db, 'users', uid), { language: lang });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function createFirestoreGroup(
  name: string,
  contributionAmount: number,
  interval: Interval,
  startDate: string,
  members: Array<{ name: string; shares: 1 | 2; phone?: string; email?: string }>,
  organizerUser: User,
  emailNotifications?: {
    paymentReminders: boolean;
    winnerAlert: boolean;
    memberResults: boolean;
    monthlySummary: boolean;
    reminderDays: number[];
  }
): Promise<string> {
  const groupId = 'grp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const inviteCode = generateInviteCode();
  const groupRef = doc(db, 'groups', groupId);

  const defaultNotifications = {
    paymentReminders: true,
    winnerAlert: true,
    memberResults: true,
    monthlySummary: true,
    reminderDays: [-3, -1, 0, 2]
  };

  const groupData = {
    name: name.trim(),
    organizerUid: organizerUser.uid,
    organizerName: organizerUser.displayName || organizerUser.email?.split('@')[0] || 'Organizer',
    contributionAmount,
    interval,
    startDate,
    inviteCode,
    status: 'active',
    currentRound: 1,
    emailNotifications: emailNotifications || defaultNotifications,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(groupRef, groupData);

    const organizerMemberRef = doc(db, `groups/${groupId}/members`, organizerUser.uid);
    await setDoc(organizerMemberRef, {
      displayName: organizerUser.displayName || organizerUser.email?.split('@')[0] || 'Organizer',
      uid: organizerUser.uid,
      email: organizerUser.email || null,
      shares: 1,
      role: 'organizer',
      joinedAt: new Date().toISOString()
    });

    for (const m of members) {
      const memberId = 'm_' + Math.random().toString(36).substring(2, 9);
      const memberRef = doc(db, `groups/${groupId}/members`, memberId);
      await setDoc(memberRef, {
        displayName: m.name,
        uid: null,
        email: m.email?.trim() || null,
        shares: m.shares,
        phone: m.phone || null,
        role: 'member',
        joinedAt: new Date().toISOString()
      });
    }

    const round1Ref = doc(db, `groups/${groupId}/rounds`, '1');
    const totalShares = 1 + members.reduce((sum, m) => sum + m.shares, 0);
    await setDoc(round1Ref, {
      roundNumber: 1,
      date: startDate,
      potAmount: totalShares * contributionAmount,
      status: 'pending'
    });

    return groupId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `groups/${groupId}`);
    return '';
  }
}

export async function updateFirestoreGroup(
  groupId: string,
  data: {
    name: string;
    contributionAmount: number;
    interval: Interval;
    startDate: string;
    members: Array<{ id?: string; name: string; shares: 1 | 2; phone?: string; email?: string }>;
    emailNotifications?: any;
  }
): Promise<boolean> {
  try {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, {
      name: data.name.trim(),
      contributionAmount: data.contributionAmount,
      interval: data.interval,
      startDate: data.startDate,
      emailNotifications: data.emailNotifications || {
        paymentReminders: true,
        winnerAlert: true,
        memberResults: true,
        monthlySummary: true,
        reminderDays: [-3, -1, 0, 2]
      },
      updatedAt: new Date().toISOString()
    });

    // Update members
    for (const m of data.members) {
      const mId = m.id || ('m_' + Math.random().toString(36).substring(2, 9));
      const memberRef = doc(db, `groups/${groupId}/members`, mId);
      await setDoc(
        memberRef,
        {
          displayName: m.name,
          shares: m.shares,
          phone: m.phone || null,
          email: m.email?.trim() || null
        },
        { merge: true }
      );
    }
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `groups/${groupId}`);
    return false;
  }
}


export async function joinGroupByCode(inviteCode: string, user: User): Promise<{ success: boolean; groupId?: string; error?: string }> {
  try {
    const codeClean = inviteCode.trim().toUpperCase();
    const q = query(collection(db, 'groups'), where('inviteCode', '==', codeClean));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'invalid_code' };
    }

    const groupDoc = querySnapshot.docs[0];
    const groupId = groupDoc.id;

    const memberDocRef = doc(db, `groups/${groupId}/members`, user.uid);
    const existing = await getDoc(memberDocRef);

    if (existing.exists()) {
      return { success: true, groupId };
    }

    await setDoc(memberDocRef, {
      displayName: user.displayName || user.email?.split('@')[0] || 'Member',
      uid: user.uid,
      shares: 1,
      role: 'member',
      joinedAt: new Date().toISOString()
    });

    return { success: true, groupId };
  } catch (err: any) {
    return { success: false, error: err?.message || 'join_failed' };
  }
}

export async function setMemberPaymentStatus(
  groupId: string,
  roundNumber: number,
  memberId: string,
  paid: boolean,
  organizerUid: string
) {
  const path = `groups/${groupId}/rounds/${roundNumber}/payments/${memberId}`;
  try {
    await setDoc(doc(db, path), {
      paid,
      markedBy: organizerUid,
      markedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function submitMemberInput(
  groupId: string,
  roundNumber: number,
  uid: string,
  memberName: string,
  input: string
) {
  const path = `groups/${groupId}/rounds/${roundNumber}/inputs/${uid}`;
  try {
    await setDoc(doc(db, path), {
      input: input.trim().toLowerCase(),
      memberName,
      submittedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Finalize Draw Proof and publish public check record
export async function recordFinalDraw(
  groupId: string,
  groupName: string,
  roundNumber: number,
  drawProof: DrawProof,
  potAmount: number,
  isLastRoundInCycle: boolean
): Promise<string> {
  const drawCode = drawProof.drawCode || generateDrawCode();
  const drawPath = `groups/${groupId}/draws/${roundNumber}`;
  const historyPath = `groups/${groupId}/history/round_${roundNumber}`;
  const publicDrawPath = `public_draws/${drawCode}`;
  const groupPath = `groups/${groupId}`;

  try {
    const proofWithCode = {
      ...drawProof,
      drawCode
    };

    // 1. Save draw record in group
    await setDoc(doc(db, drawPath), {
      roundNumber,
      drawCode,
      commitmentHash: drawProof.commitmentHash,
      seed: drawProof.seedHash,
      winnerMemberId: drawProof.winnerMemberId,
      winnerMemberName: drawProof.winnerMemberName,
      eligibleList: JSON.stringify(drawProof.eligibleTickets),
      inputs: JSON.stringify(drawProof.memberInputs),
      type: 'lottery',
      note: drawProof.explanation,
      createdAt: new Date().toISOString()
    });

    // 2. Save public draw record for link & code check (accessible without login)
    await setDoc(doc(db, publicDrawPath), {
      drawCode,
      groupId,
      groupName,
      roundNumber,
      winnerName: drawProof.winnerMemberName,
      date: new Date().toISOString(),
      potAmount,
      type: 'lottery',
      eligibleNames: JSON.stringify(drawProof.eligibleTickets.map(t => t.memberName)),
      proofJson: JSON.stringify(proofWithCode),
      createdAt: new Date().toISOString()
    });

    // 3. Append history record
    await setDoc(doc(db, historyPath), {
      type: 'draw',
      roundNumber,
      drawCode,
      winnerMemberId: drawProof.winnerMemberId,
      winnerMemberName: drawProof.winnerMemberName,
      potAmount,
      method: 'lottery',
      seed: drawProof.seedHash,
      reason: `Draw for Round ${roundNumber}`,
      author: 'Provable Engine',
      drawProof: proofWithCode,
      timestamp: new Date().toISOString()
    });

    // 4. Mark round completed & advance
    await updateDoc(doc(db, `groups/${groupId}/rounds/${roundNumber}`), {
      status: 'completed',
      winnerMemberId: drawProof.winnerMemberId,
      winnerMemberName: drawProof.winnerMemberName,
      drawCode
    });

    const nextRound = roundNumber + 1;
    await updateDoc(doc(db, groupPath), {
      currentRound: nextRound,
      status: isLastRoundInCycle ? 'completed' : 'active'
    });

    if (!isLastRoundInCycle) {
      await setDoc(doc(db, `groups/${groupId}/rounds/${nextRound}`), {
        roundNumber: nextRound,
        date: new Date().toISOString().split('T')[0],
        potAmount,
        status: 'pending'
      });
    }

    return drawCode;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, drawPath);
    return drawCode;
  }
}

// Fetch public draw by 6-char code (works without login!)
export async function getPublicDrawByCode(code: string): Promise<PublicDrawRecord | null> {
  const cleanCode = code.trim().toUpperCase();
  try {
    const snap = await getDoc(doc(db, 'public_draws', cleanCode));
    if (snap.exists()) {
      const data = snap.data();
      let eligibleNames: string[] = [];
      try {
        eligibleNames = typeof data.eligibleNames === 'string' ? JSON.parse(data.eligibleNames) : data.eligibleNames;
      } catch {
        eligibleNames = [];
      }
      return {
        drawCode: cleanCode,
        groupId: data.groupId,
        groupName: data.groupName || 'Equb',
        roundNumber: data.roundNumber || 1,
        winnerName: data.winnerName || '',
        date: data.date || '',
        potAmount: data.potAmount || 0,
        type: data.type || 'lottery',
        eligibleNames,
        proofJson: data.proofJson || '',
        createdAt: data.createdAt || ''
      };
    }
    return null;
  } catch (e) {
    console.warn('Could not fetch public draw from Firestore:', e);
    return null;
  }
}

export async function recordEmergencyDecision(
  groupId: string,
  groupName: string,
  roundNumber: number,
  memberId: string,
  memberName: string,
  yesCount: number,
  noCount: number,
  reason: string,
  potAmount: number,
  isLastRound: boolean
) {
  const drawCode = generateDrawCode();
  const drawPath = `groups/${groupId}/draws/${roundNumber}`;
  const historyPath = `groups/${groupId}/history/round_${roundNumber}`;
  const publicDrawPath = `public_draws/${drawCode}`;

  try {
    await setDoc(doc(db, drawPath), {
      roundNumber,
      drawCode,
      commitmentHash: 'DECISION_' + Date.now(),
      seed: 'GROUP_VOTE_APPROVED',
      winnerMemberId: memberId,
      winnerMemberName: memberName,
      eligibleList: '[]',
      inputs: '[]',
      type: 'group_decision',
      note: `Approved by group vote: ${yesCount} Yes / ${noCount} No. Reason: ${reason}`,
      createdAt: new Date().toISOString()
    });

    await setDoc(doc(db, publicDrawPath), {
      drawCode,
      groupId,
      groupName,
      roundNumber,
      winnerName: memberName,
      date: new Date().toISOString(),
      potAmount,
      type: 'group_decision',
      eligibleNames: JSON.stringify([memberName]),
      proofJson: JSON.stringify({
        roundNumber,
        drawCode,
        winnerMemberName: memberName,
        explanation: `Group Decision: ${reason} (Votes: ${yesCount} Yes, ${noCount} No)`
      }),
      createdAt: new Date().toISOString()
    });

    await setDoc(doc(db, historyPath), {
      type: 'decision',
      roundNumber,
      drawCode,
      winnerMemberId: memberId,
      winnerMemberName: memberName,
      potAmount,
      method: 'group_decision',
      reason: `Emergency Queue-Jump: ${reason} (Votes: ${yesCount} Yes, ${noCount} No)`,
      author: 'Organizer',
      timestamp: new Date().toISOString()
    });

    const nextRound = roundNumber + 1;
    await updateDoc(doc(db, `groups/${groupId}`), {
      currentRound: nextRound,
      status: isLastRound ? 'completed' : 'active'
    });

    if (!isLastRound) {
      await setDoc(doc(db, `groups/${groupId}/rounds/${nextRound}`), {
        roundNumber: nextRound,
        date: new Date().toISOString().split('T')[0],
        potAmount,
        status: 'pending'
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, historyPath);
  }
}

export async function recordShareSwap(
  groupId: string,
  memberA: string,
  memberB: string,
  note: string
) {
  const historyPath = `groups/${groupId}/history/swap_${Date.now()}`;
  try {
    await setDoc(doc(db, historyPath), {
      type: 'swap',
      reason: `Agreed Turn Swap between ${memberA} and ${memberB}: ${note}`,
      author: 'Organizer',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, historyPath);
  }
}

export async function deleteGroupDocument(groupId: string) {
  try {
    await deleteDoc(doc(db, 'groups', groupId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `groups/${groupId}`);
  }
}

export interface DeleteAccountResult {
  success: boolean;
  error?: string;
  requiresPassword?: boolean;
  requiresGoogle?: boolean;
}

/**
 * Permanently deletes a user's account, user profile document,
 * any groups they organize, and signs them out.
 * Supports re-authentication for password and Google providers.
 */
export async function deleteUserAccount(
  user: User,
  password?: string
): Promise<DeleteAccountResult> {
  const isPasswordUser = user.providerData.some(p => p.providerId === 'password');
  const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');

  // 1. Re-authenticate with password if provided
  if (isPasswordUser && password) {
    if (!user.email) {
      return { success: false, error: 'missing-email' };
    }
    try {
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
    } catch (reauthErr: any) {
      if (reauthErr?.code === 'auth/wrong-password' || reauthErr?.code === 'auth/invalid-credential') {
        return { success: false, error: 'wrong-password' };
      }
      return { success: false, error: reauthErr?.message || 'Authentication failed' };
    }
  }

  // 2. Delete user profile document from Firestore
  try {
    await deleteDoc(doc(db, 'users', user.uid));
  } catch (firestoreErr) {
    console.warn('Could not delete user profile doc (non-fatal):', firestoreErr);
  }

  // 3. Clean up groups where this user is the organizer
  try {
    const q = query(collection(db, 'groups'), where('organizerUid', '==', user.uid));
    const groupsSnap = await getDocs(q);
    for (const gDoc of groupsSnap.docs) {
      await deleteDoc(gDoc.ref).catch(() => {});
    }
  } catch (cleanErr) {
    console.warn('Could not clean up organizer groups (non-fatal):', cleanErr);
  }

  // 4. Delete the Firebase Auth user
  try {
    await deleteUser(user);
    try {
      localStorage.removeItem('equb_groups_cache');
    } catch {}
    await signOut(auth).catch(() => {});
    return { success: true };
  } catch (deleteErr: any) {
    if (deleteErr?.code === 'auth/requires-recent-login') {
      return {
        success: false,
        requiresPassword: isPasswordUser,
        requiresGoogle: isGoogleUser,
        error: 'requires-recent-login'
      };
    }
    return { success: false, error: deleteErr?.message || 'Failed to delete account' };
  }
}

