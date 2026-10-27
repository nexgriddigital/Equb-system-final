/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  db,
  testConnection,
  createFirestoreGroup,
  updateFirestoreGroup,
  syncUserProfile,
  getUserLanguage,
  setMemberPaymentStatus,
  markAllPaymentsInFirestore,
  syncLocalGroupsToCloud,
  deleteGroupDocument
} from './services/firebase';
import { SyncState } from './components/CloudSyncBadge';
import { collection, query, where, onSnapshot, doc, getDocs } from 'firebase/firestore';
import { storageService } from './services/storage';
import { EqubGroup, Language, DrawProof, RoundHistory, AuditCorrection, Interval, Member } from './types/equb';
import { translations } from './i18n/translations';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { GroupDashboard } from './components/GroupDashboard';
import { GroupForm } from './components/GroupForm';
import { DrawRoom } from './components/DrawRoom';
import { ShareModal } from './components/ShareModal';
import { BackupModal } from './components/BackupModal';
import { AuthScreen } from './components/AuthScreen';
import { LanguageChoiceModal } from './components/LanguageChoiceModal';
import { JoinGroupModal } from './components/JoinGroupModal';
import { BottomTabBar, MainTab } from './components/BottomTabBar';
import { OfflineBanner } from './components/OfflineBanner';
import { PublicUnsubscribeScreen } from './components/PublicUnsubscribeScreen';
import { Logo } from './components/Logo';
import { Loader2, Coins, AlertCircle } from 'lucide-react';
import { initNativeApp, registerBackButtonHandler, exitNativeApp } from './services/native';

// Lazy-load heavier screens to keep initial JS bundle under 300KB for low-memory devices (1GB RAM)
const CheckDrawScreen = React.lazy(() =>
  import('./components/CheckDrawScreen').then(m => ({ default: m.CheckDrawScreen }))
);
const HistoryScreen = React.lazy(() =>
  import('./components/HistoryScreen').then(m => ({ default: m.HistoryScreen }))
);
const SettingsScreen = React.lazy(() =>
  import('./components/SettingsScreen').then(m => ({ default: m.SettingsScreen }))
);

export default function App() {
  // Language & First Launch
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('equb_lang');
      return saved === 'en' || saved === 'am' ? saved : 'am';
    } catch {
      return 'am';
    }
  });

  const [showLanguageChoice, setShowLanguageChoice] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('equb_lang_chosen');
    } catch {
      return false;
    }
  });

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation
  const [activeTab, setActiveTab] = useState<MainTab>('groups');
  const [currentScreen, setCurrentScreen] = useState<
    'main' | 'create_group' | 'edit_group' | 'draw_room' | 'check_draw'
  >('main');

  // Groups and selection
  const [groups, setGroups] = useState<EqubGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Cross-device Firebase sync state
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Modals & Check Draw State
  const [isJoinCodeOpen, setIsJoinCodeOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [activeCheckProof, setActiveCheckProof] = useState<DrawProof | null>(null);
  const [checkDrawInitialCode, setCheckDrawInitialCode] = useState<string>('');
  const [shareModalData, setShareModalData] = useState<{
    isOpen: boolean;
    historyItem?: RoundHistory | null;
  }>({ isOpen: false });

  // URL Public Routes (?check=CODE or ?unsub=1&gid=...&mid=...)
  const [publicCheckCode, setPublicCheckCode] = useState<string | null>(null);
  const [publicUnsub, setPublicUnsub] = useState<{ gid: string; mid: string } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Initialize Capacitor native plugins (StatusBar, SplashScreen) & Hardware Back Button
  useEffect(() => {
    initNativeApp();

    const cleanupBack = registerBackButtonHandler(() => {
      // 1. If Exit confirmation is already visible, dismiss it
      if (showExitConfirm) {
        setShowExitConfirm(false);
        return;
      }
      // 2. Close active modals if open
      if (isJoinCodeOpen) {
        setIsJoinCodeOpen(false);
        return;
      }
      if (isBackupOpen) {
        setIsBackupOpen(false);
        return;
      }
      if (shareModalData.isOpen) {
        setShareModalData({ isOpen: false });
        return;
      }
      // 3. If on a sub-screen (Draw Room, Group Form, Check Draw), return to main
      if (currentScreen !== 'main') {
        setCurrentScreen('main');
        setActiveCheckProof(null);
        setCheckDrawInitialCode('');
        return;
      }
      // 4. If on main screen but not on 'groups' tab, return to 'groups' tab
      if (activeTab !== 'groups') {
        setActiveTab('groups');
        return;
      }
      // 5. On the groups home screen: ask "Exit Equb Draw?" before closing
      setShowExitConfirm(true);
    });

    return () => {
      cleanupBack();
    };
  }, [showExitConfirm, isJoinCodeOpen, isBackupOpen, shareModalData.isOpen, currentScreen, activeTab]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('check');
      const isUnsub = params.get('unsub') === '1';
      const gid = params.get('gid');
      const mid = params.get('mid');

      if (isUnsub && gid && mid) {
        setPublicUnsub({ gid, mid });
      } else if (code) {
        setPublicCheckCode(code.toUpperCase());
        setCheckDrawInitialCode(code.toUpperCase());
        setCurrentScreen('check_draw');
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
  }, []);

  // 1. Connection check & Auth listener
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      if (currentUser) {
        const remoteLang = await getUserLanguage(currentUser.uid);
        if (remoteLang && (remoteLang === 'am' || remoteLang === 'en')) {
          setLang(remoteLang);
          document.documentElement.lang = remoteLang;
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1b. Online / offline status tracking for sync state
  useEffect(() => {
    const handleOnline = () => {
      if (user) {
        setSyncState('syncing');
        testConnection().then(() => {
          setSyncState('synced');
          setLastSyncedAt(new Date());
        });
      } else {
        setSyncState('local_only');
      }
    };
    const handleOffline = () => setSyncState('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // 2. Real-time Firestore sync for Groups when signed in
  useEffect(() => {
    if (!user) {
      const localGroups = storageService.getAll();
      setGroups(localGroups);
      if (localGroups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(localGroups[0].id);
      }
      setSyncState('local_only');
      return;
    }

    setSyncState('syncing');
    const groupsRef = collection(db, 'groups');
    const unsub = onSnapshot(
      groupsRef,
      async snapshot => {
        try {
          const fetchedGroups: EqubGroup[] = [];

          for (const groupDoc of snapshot.docs) {
            const data = groupDoc.data();
            const groupId = groupDoc.id;

            try {
              const membersSnap = await getDocs(collection(db, `groups/${groupId}/members`));
              const members: Member[] = [];
              let userIsMember = data.organizerUid === user.uid;

              membersSnap.forEach(mDoc => {
                const mData = mDoc.data();
                if (mData.uid === user.uid) userIsMember = true;
                members.push({
                  id: mDoc.id,
                  name: mData.displayName || 'Member',
                  shares: mData.shares || 1,
                  phone: mData.phone || undefined,
                  email: mData.email || undefined,
                  notificationPreferences: mData.notificationPreferences || undefined,
                  joinedAt: mData.joinedAt || new Date().toISOString()
                });
              });

              if (!userIsMember) continue;

              // Fetch payments for current round
              const currentRound = data.currentRound || 1;
              const paymentsSnap = await getDocs(collection(db, `groups/${groupId}/rounds/${currentRound}/payments`));
              const currentRoundPayments: Record<string, boolean> = {};
              paymentsSnap.forEach(pDoc => {
                currentRoundPayments[pDoc.id] = !!pDoc.data().paid;
              });

              // Fetch history
              const historySnap = await getDocs(collection(db, `groups/${groupId}/history`));
              const history: RoundHistory[] = [];
              historySnap.forEach(hDoc => {
                const hData = hDoc.data();
                history.push({
                  roundNumber: hData.roundNumber || 1,
                  drawCode: hData.drawCode || undefined,
                  date: hData.timestamp || new Date().toISOString(),
                  winnerMemberId: hData.winnerMemberId || '',
                  winnerMemberName: hData.winnerMemberName || '',
                  potAmount: hData.potAmount || 0,
                  method: hData.method || 'lottery',
                  drawProof: hData.drawProof || undefined,
                  note: hData.reason
                });
              });

              // Sort history by round number
              history.sort((a, b) => a.roundNumber - b.roundNumber);

              fetchedGroups.push({
                id: groupId,
                name: data.name || 'Equb',
                contributionAmount: data.contributionAmount || 2000,
                interval: data.interval || 'monthly',
                startDate: data.startDate || new Date().toISOString().split('T')[0],
                members,
                currentRound,
                payments: {
                  [currentRound]: currentRoundPayments
                },
                history,
                status: data.status || 'active',
                emailNotifications: data.emailNotifications || undefined,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString(),
                ...data
              } as any);
            } catch (e) {
              console.warn('Error reading subcollections for group', groupId, e);
            }
          }

          setGroups(fetchedGroups);
          setLastSyncedAt(new Date());
          setSyncState(navigator.onLine ? 'synced' : 'offline');

          if (fetchedGroups.length > 0 && !selectedGroupId) {
            setSelectedGroupId(fetchedGroups[0].id);
          }
        } catch (err) {
          console.error('Groups sync error:', err);
          setSyncState(navigator.onLine ? 'error' : 'offline');
        }
      },
      error => {
        console.error('Snapshot listener error:', error);
        setSyncState(navigator.onLine ? 'error' : 'offline');
      }
    );

    return () => unsub();
  }, [user]);

  // 3. Real-time subcollection listeners for active group (instant cross-device payments & member changes)
  const selectedGroup = groups.find(g => g.id === selectedGroupId) || groups[0] || null;

  useEffect(() => {
    if (!user || !selectedGroup || !selectedGroupId) return;

    const round = selectedGroup.currentRound;
    const paymentsPath = `groups/${selectedGroupId}/rounds/${round}/payments`;
    const membersPath = `groups/${selectedGroupId}/members`;
    const historyPath = `groups/${selectedGroupId}/history`;

    // 1. Instant cross-device payments sync
    const unsubPayments = onSnapshot(
      collection(db, paymentsPath),
      snapshot => {
        const updatedRoundPayments: Record<string, boolean> = {};
        snapshot.forEach(docSnap => {
          updatedRoundPayments[docSnap.id] = !!docSnap.data().paid;
        });

        setGroups(prev =>
          prev.map(g => {
            if (g.id !== selectedGroupId) return g;
            return {
              ...g,
              payments: {
                ...g.payments,
                [round]: updatedRoundPayments
              }
            };
          })
        );
        setLastSyncedAt(new Date());
      },
      err => console.warn('Payments sync warning:', err.message)
    );

    // 2. Instant cross-device members sync
    const unsubMembers = onSnapshot(
      collection(db, membersPath),
      snapshot => {
        const membersList: Member[] = [];
        snapshot.forEach(mDoc => {
          const mData = mDoc.data();
          membersList.push({
            id: mDoc.id,
            name: mData.displayName || 'Member',
            shares: mData.shares || 1,
            phone: mData.phone || undefined,
            email: mData.email || undefined,
            notificationPreferences: mData.notificationPreferences || undefined,
            joinedAt: mData.joinedAt || new Date().toISOString()
          });
        });

        if (membersList.length > 0) {
          setGroups(prev =>
            prev.map(g => {
              if (g.id !== selectedGroupId) return g;
              return { ...g, members: membersList };
            })
          );
          setLastSyncedAt(new Date());
        }
      },
      err => console.warn('Members sync warning:', err.message)
    );

    // 3. Instant cross-device history sync
    const unsubHistory = onSnapshot(
      collection(db, historyPath),
      snapshot => {
        const historyList: RoundHistory[] = [];
        snapshot.forEach(hDoc => {
          const hData = hDoc.data();
          historyList.push({
            roundNumber: hData.roundNumber || 1,
            drawCode: hData.drawCode || undefined,
            date: hData.timestamp || new Date().toISOString(),
            winnerMemberId: hData.winnerMemberId || '',
            winnerMemberName: hData.winnerMemberName || '',
            potAmount: hData.potAmount || 0,
            method: hData.method || 'lottery',
            drawProof: hData.drawProof || undefined,
            note: hData.reason
          });
        });
        historyList.sort((a, b) => a.roundNumber - b.roundNumber);

        setGroups(prev =>
          prev.map(g => {
            if (g.id !== selectedGroupId) return g;
            return { ...g, history: historyList };
          })
        );
        setLastSyncedAt(new Date());
      },
      err => console.warn('History sync warning:', err.message)
    );

    return () => {
      unsubPayments();
      unsubMembers();
      unsubHistory();
    };
  }, [user, selectedGroupId, selectedGroup?.currentRound]);

  // Language selection handler
  const handleSelectLanguage = (selectedLang: Language) => {
    setLang(selectedLang);
    document.documentElement.lang = selectedLang;
    try {
      localStorage.setItem('equb_lang', selectedLang);
      localStorage.setItem('equb_lang_chosen', 'true');
    } catch {
      // ignore
    }
    setShowLanguageChoice(false);
    if (user) {
      syncUserProfile(user, selectedLang);
    }
  };

  const isOrganizer = Boolean(user && selectedGroup && (selectedGroup as any).organizerUid === user.uid);

  // Group creation & editing handler
  const handleSaveGroup = async (groupData: {
    name: string;
    contributionAmount: number;
    interval: Interval;
    startDate: string;
    members: Array<{ id?: string; name: string; shares: 1 | 2; phone?: string; email?: string }>;
    emailNotifications?: any;
  }) => {
    if (currentScreen === 'edit_group' && selectedGroup && user) {
      // Update existing group
      await updateFirestoreGroup(selectedGroup.id, groupData);
      setCurrentScreen('main');
      return;
    }

    if (user) {
      const newId = await createFirestoreGroup(
        groupData.name,
        groupData.contributionAmount,
        groupData.interval,
        groupData.startDate,
        groupData.members,
        user,
        groupData.emailNotifications
      );
      if (newId) {
        setSelectedGroupId(newId);
        setCurrentScreen('main');
        setActiveTab('current_round');
      }
    } else {
      // Local storage fallback
      const localGroup: EqubGroup = {
        id: 'local_' + Date.now(),
        name: groupData.name,
        contributionAmount: groupData.contributionAmount,
        interval: groupData.interval,
        startDate: groupData.startDate,
        members: groupData.members.map((m, idx) => ({
          id: m.id || 'm_' + idx,
          name: m.name,
          shares: m.shares,
          email: m.email,
          joinedAt: new Date().toISOString()
        })),
        currentRound: 1,
        payments: { 1: {} },
        history: [],
        status: 'active',
        emailNotifications: groupData.emailNotifications,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      storageService.save(localGroup);
      setGroups(storageService.getAll());
      setSelectedGroupId(localGroup.id);
      setCurrentScreen('main');
      setActiveTab('current_round');
    }
  };

  // Toggle member payment
  const handleTogglePayment = async (memberId: string) => {
    if (!selectedGroup || !user) return;
    const currentStatus = !!(selectedGroup.payments[selectedGroup.currentRound] || {})[memberId];
    const newStatus = !currentStatus;

    await setMemberPaymentStatus(
      selectedGroup.id,
      selectedGroup.currentRound,
      memberId,
      newStatus,
      user.uid
    );

    setGroups(prev =>
      prev.map(g => {
        if (g.id !== selectedGroup.id) return g;
        return {
          ...g,
          payments: {
            ...g.payments,
            [g.currentRound]: {
              ...(g.payments[g.currentRound] || {}),
              [memberId]: newStatus
            }
          }
        };
      })
    );
  };

  const handleMarkAllPayments = async (paid: boolean) => {
    if (!selectedGroup || !user) return;
    const memberIds = selectedGroup.members.map(m => m.id);

    // Optimistic local state update
    const updatedRoundPayments: Record<string, boolean> = {};
    memberIds.forEach(id => {
      updatedRoundPayments[id] = paid;
    });

    setGroups(prev =>
      prev.map(g => {
        if (g.id !== selectedGroup.id) return g;
        return {
          ...g,
          payments: {
            ...g.payments,
            [g.currentRound]: updatedRoundPayments
          }
        };
      })
    );

    // Multi-device sync to Firestore
    await markAllPaymentsInFirestore(
      selectedGroup.id,
      selectedGroup.currentRound,
      memberIds,
      paid,
      user.uid
    );
  };

  // Manual trigger for cross-device sync
  const handleSyncNow = async () => {
    if (!user) return;
    setSyncState('syncing');
    try {
      await testConnection();
      const groupsSnap = await getDocs(collection(db, 'groups'));
      const fetched: EqubGroup[] = [];
      for (const gDoc of groupsSnap.docs) {
        const data = gDoc.data();
        const groupId = gDoc.id;

        const membersSnap = await getDocs(collection(db, `groups/${groupId}/members`));
        const members: Member[] = [];
        let userIsMember = data.organizerUid === user.uid;

        membersSnap.forEach(md => {
          const mdData = md.data();
          if (mdData.uid === user.uid) userIsMember = true;
          members.push({
            id: md.id,
            name: mdData.displayName || 'Member',
            shares: mdData.shares || 1,
            phone: mdData.phone || undefined,
            email: mdData.email || undefined,
            notificationPreferences: mdData.notificationPreferences || undefined,
            joinedAt: mdData.joinedAt || new Date().toISOString()
          });
        });

        if (!userIsMember) continue;

        const round = data.currentRound || 1;
        const paymentsSnap = await getDocs(collection(db, `groups/${groupId}/rounds/${round}/payments`));
        const currentRoundPayments: Record<string, boolean> = {};
        paymentsSnap.forEach(p => {
          currentRoundPayments[p.id] = !!p.data().paid;
        });

        const histSnap = await getDocs(collection(db, `groups/${groupId}/history`));
        const hist: RoundHistory[] = [];
        histSnap.forEach(h => {
          const hData = h.data();
          hist.push({
            roundNumber: hData.roundNumber || 1,
            drawCode: hData.drawCode || undefined,
            date: hData.timestamp || new Date().toISOString(),
            winnerMemberId: hData.winnerMemberId || '',
            winnerMemberName: hData.winnerMemberName || '',
            potAmount: hData.potAmount || 0,
            method: hData.method || 'lottery',
            drawProof: hData.drawProof || undefined,
            note: hData.reason
          });
        });
        hist.sort((a, b) => a.roundNumber - b.roundNumber);

        fetched.push({
          id: groupId,
          name: data.name || 'Equb',
          contributionAmount: data.contributionAmount || 2000,
          interval: data.interval || 'monthly',
          startDate: data.startDate || new Date().toISOString().split('T')[0],
          members,
          currentRound: round,
          payments: { [round]: currentRoundPayments },
          history: hist,
          status: data.status || 'active',
          emailNotifications: data.emailNotifications || undefined,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          ...data
        } as any);
      }
      setGroups(fetched);
      setLastSyncedAt(new Date());
      setSyncState(navigator.onLine ? 'synced' : 'offline');
    } catch (e) {
      console.error('Manual sync failed:', e);
      setSyncState(navigator.onLine ? 'error' : 'offline');
      throw e;
    }
  };

  const handleSyncLocalToCloud = async () => {
    if (!user) return;
    setSyncState('syncing');
    const local = storageService.getAll();
    const res = await syncLocalGroupsToCloud(user, local);
    if (res.error) {
      setSyncState('error');
      throw new Error(res.error);
    }
    await handleSyncNow();
  };

  const handleDeleteGroup = async (id: string) => {
    await deleteGroupDocument(id);
    setSelectedGroupId(null);
    setCurrentScreen('main');
    setActiveTab('groups');
  };

  // Seed demo group for 6-member acceptance check
  const handleLoadDemo = () => {
    const demo = storageService.seedDemoGroup();
    setGroups(storageService.getAll());
    setSelectedGroupId(demo.id);
    setCurrentScreen('main');
    setActiveTab('current_round');
  };

  // 1. PUBLIC ROUTE: Unsubscribe link clicked from email
  if (publicUnsub) {
    return (
      <PublicUnsubscribeScreen
        groupId={publicUnsub.gid}
        memberId={publicUnsub.mid}
        lang={lang}
        onGoToApp={() => {
          setPublicUnsub(null);
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  // 2. PUBLIC ROUTE: Check draw link opened without auth
  if (!user && (currentScreen === 'check_draw' || publicCheckCode)) {
    return (
      <div className="min-h-[100dvh] bg-stone-50 text-stone-900 flex flex-col font-sans pb-16">
        <Header
          lang={lang}
          onLanguageChange={handleSelectLanguage}
          onNavigateHome={() => {
            setPublicCheckCode(null);
            setCurrentScreen('main');
            window.history.replaceState({}, '', window.location.pathname);
          }}
        />
        <main className="flex-1">
          <CheckDrawScreen
            initialCode={publicCheckCode || checkDrawInitialCode}
            initialProof={activeCheckProof}
            lang={lang}
            onBack={() => {
              setPublicCheckCode(null);
              setCurrentScreen('main');
              window.history.replaceState({}, '', window.location.pathname);
            }}
          />
        </main>
      </div>
    );
  }

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-stone-50 text-stone-900">
        <div className="flex flex-col items-center gap-4">
          <Logo size={72} className="shadow-lg rounded-[16px] motion-safe:animate-pulse" />
          <Loader2 className="w-5 h-5 animate-spin text-[#0E3B2E]" />
        </div>
      </div>
    );
  }

  // Not signed in: show AuthScreen
  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-stone-50 text-stone-900 flex flex-col">
        <OfflineBanner lang={lang} />
        <Header
          lang={lang}
          onLanguageChange={handleSelectLanguage}
          onNavigateHome={() => {}}
        />

        <AuthScreen lang={lang} onSuccess={() => {}} />

        <LanguageChoiceModal
          isOpen={showLanguageChoice}
          onSelectLanguage={handleSelectLanguage}
        />
      </div>
    );
  }

  const t = translations[lang];

  return (
    <div className="min-h-[100dvh] bg-stone-50 text-stone-900 flex flex-col font-sans pb-16">
      {/* Offline Banner */}
      <OfflineBanner lang={lang} />

      {/* Top Header: App Name, Cloud Sync Status & Language Switch */}
      <Header
        lang={lang}
        onLanguageChange={handleSelectLanguage}
        onNavigateHome={() => {
          setCurrentScreen('main');
          setActiveTab('groups');
        }}
        user={user}
        syncState={syncState}
        lastSyncedAt={lastSyncedAt}
        localGroupCount={storageService.getAll().filter(g => g.id.startsWith('local_') || g.id.startsWith('demo_')).length}
        cloudGroupCount={groups.length}
        onSyncNow={handleSyncNow}
        onSyncLocalToCloud={handleSyncLocalToCloud}
      />

      {/* Main Body */}
      <main className="flex-1">
        {currentScreen === 'create_group' && (
          <GroupForm
            initialGroup={null}
            lang={lang}
            onSave={handleSaveGroup}
            onCancel={() => setCurrentScreen('main')}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentScreen === 'edit_group' && selectedGroup && (
          <GroupForm
            initialGroup={selectedGroup}
            lang={lang}
            onSave={handleSaveGroup}
            onCancel={() => setCurrentScreen('main')}
          />
        )}

        {currentScreen === 'draw_room' && selectedGroup && (
          <DrawRoom
            group={selectedGroup}
            user={user}
            isOrganizer={isOrganizer}
            lang={lang}
            onBack={() => setCurrentScreen('main')}
            onDrawCompleted={() => {
              setCurrentScreen('main');
              setActiveTab('history');
            }}
          />
        )}

        {currentScreen === 'check_draw' && (
          <React.Suspense fallback={<div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#0E3B2E]" /></div>}>
            <CheckDrawScreen
              initialCode={checkDrawInitialCode}
              initialProof={activeCheckProof}
              lang={lang}
              onBack={() => {
                setCurrentScreen('main');
                setActiveCheckProof(null);
                setCheckDrawInitialCode('');
              }}
            />
          </React.Suspense>
        )}

        {/* Tab 1: Groups Tab */}
        {currentScreen === 'main' && activeTab === 'groups' && (
          <HomeScreen
            groups={groups}
            user={user}
            lang={lang}
            onSelectGroup={g => {
              setSelectedGroupId(g.id);
              setActiveTab('current_round');
            }}
            onNewGroup={() => setCurrentScreen('create_group')}
            onOpenJoinCode={() => setIsJoinCodeOpen(true)}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {/* Tab 2: Current Round Dashboard Tab */}
        {currentScreen === 'main' && activeTab === 'current_round' && (
          selectedGroup ? (
            <GroupDashboard
              group={selectedGroup}
              isOrganizer={isOrganizer}
              lang={lang}
              onBack={() => setActiveTab('groups')}
              onEditGroup={() => setCurrentScreen('edit_group')}
              onDeleteGroup={handleDeleteGroup}
              onGoToDrawRoom={() => setCurrentScreen('draw_room')}
              onTogglePayment={handleTogglePayment}
              onMarkAllPayments={handleMarkAllPayments}
              onOpenProof={item => {
                if (item.drawProof) {
                  setActiveCheckProof(item.drawProof);
                  setCheckDrawInitialCode(item.drawProof.drawCode || item.drawCode || '');
                  setCurrentScreen('check_draw');
                }
              }}
              onOpenShare={item => setShareModalData({ isOpen: true, historyItem: item || null })}
              onAddAuditCorrection={() => {}}
            />
          ) : (
            <div className="py-12 px-4 text-center space-y-3 max-w-[560px] md:max-w-[720px] mx-auto">
              <Coins className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-700">
                {t.noActiveGroupSelected}
              </p>
              <button
                onClick={() => setActiveTab('groups')}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                {t.myGroups}
              </button>
            </div>
          )
        )}

        {/* Tab 3: History Tab */}
        {currentScreen === 'main' && activeTab === 'history' && (
          selectedGroup ? (
            <div className="py-4 px-3 sm:px-4 max-w-[560px] md:max-w-[720px] mx-auto">
              <React.Suspense fallback={<div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#0E3B2E]" /></div>}>
                <HistoryScreen
                  group={selectedGroup}
                  lang={lang}
                  onCheckDraw={proof => {
                    setActiveCheckProof(proof);
                    setCheckDrawInitialCode(proof.drawCode || '');
                    setCurrentScreen('check_draw');
                  }}
                  onOpenShare={item => setShareModalData({ isOpen: true, historyItem: item || null })}
                  onAddAuditCorrection={() => {}}
                />
              </React.Suspense>
            </div>
          ) : (
            <div className="py-12 px-4 text-center space-y-3 max-w-[560px] md:max-w-[720px] mx-auto">
              <p className="text-sm text-stone-500">{t.noActiveGroupSelected}</p>
            </div>
          )
        )}

        {/* Tab 4: Settings Tab */}
        {currentScreen === 'main' && activeTab === 'settings' && (
          <div className="max-w-[560px] md:max-w-[720px] mx-auto">
            <React.Suspense fallback={<div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#0E3B2E]" /></div>}>
              <SettingsScreen
                user={user}
                lang={lang}
                activeGroup={selectedGroup}
                onLanguageChange={handleSelectLanguage}
                onOpenCheckDraw={() => {
                  setActiveCheckProof(null);
                  setCheckDrawInitialCode('');
                  setCurrentScreen('check_draw');
                }}
                onOpenBackup={() => setIsBackupOpen(true)}
                onSyncNow={handleSyncNow}
                onSyncLocalToCloud={handleSyncLocalToCloud}
                localGroupCount={storageService.getAll().filter(g => g.id.startsWith('local_') || g.id.startsWith('demo_')).length}
                cloudGroupCount={groups.length}
                lastSyncedAt={lastSyncedAt}
              />
            </React.Suspense>
          </div>
        )}
      </main>

      {/* 4-Tab Bottom Navigation Bar */}
      {currentScreen === 'main' && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={tab => setActiveTab(tab)}
          lang={lang}
          hasActiveGroup={!!selectedGroup}
        />
      )}

      {/* Modals */}
      <LanguageChoiceModal
        isOpen={showLanguageChoice}
        onSelectLanguage={handleSelectLanguage}
      />

      <JoinGroupModal
        isOpen={isJoinCodeOpen}
        onClose={() => setIsJoinCodeOpen(false)}
        user={user}
        lang={lang}
        onJoined={newGroupId => {
          setSelectedGroupId(newGroupId);
          setActiveTab('current_round');
        }}
      />

      {shareModalData.isOpen && selectedGroup && (
        <ShareModal
          group={selectedGroup}
          historyItem={shareModalData.historyItem}
          isOpen={shareModalData.isOpen}
          onClose={() => setShareModalData({ isOpen: false })}
          lang={lang}
        />
      )}

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        lang={lang}
        onDataImported={() => {
          setGroups(storageService.getAll());
        }}
      />

      {/* Android Hardware Back Button Exit Confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-700 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 font-heading">
                  {lang === 'am' ? 'ከእቁብ መተግበሪያ መውጣት ይፈልጋሉ?' : 'Exit Equb Draw?'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === 'am'
                    ? 'መተግበሪያውን ለመዝጋት "ውጣ" የሚለውን ይጫኑ።'
                    : 'Are you sure you want to exit the app?'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl font-bold text-xs min-h-[48px] touch-target transition-colors"
              >
                {lang === 'am' ? 'ተመለስ' : 'Stay'}
              </button>
              <button
                type="button"
                onClick={() => exitNativeApp()}
                className="flex-1 py-3 px-4 bg-[#0E3B2E] hover:bg-[#07241C] text-[#FFF1CC] rounded-2xl font-bold text-xs min-h-[48px] touch-target shadow-xs transition-colors"
              >
                {lang === 'am' ? 'ውጣ' : 'Exit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
