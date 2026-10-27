import React, { useState, useEffect } from 'react';
import { User, signOut, deleteUser, reauthenticateWithPopup } from 'firebase/auth';
import { auth, updateUserLanguage, db, googleProvider, deleteUserAccount } from '../services/firebase';
import { doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { Language, EqubGroup, NotificationLog } from '../types/equb';
import { translations } from '../i18n/translations';
import { sendTestEmailsToOrganizer, getGroupNotificationLogs } from '../services/notifications';
import {
  Globe,
  User as UserIcon,
  LogOut,
  Trash2,
  ShieldCheck,
  HardDriveDownload,
  Upload,
  AlertTriangle,
  Check,
  Loader2,
  Mail,
  Send,
  Info,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Cloud,
  CloudCheck,
  RefreshCw,
  Smartphone,
  Laptop,
  Tablet
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsScreenProps {
  user: User;
  lang: Language;
  activeGroup?: EqubGroup | null;
  onLanguageChange: (newLang: Language) => void;
  onOpenCheckDraw: () => void;
  onOpenBackup: () => void;
  onSyncNow?: () => Promise<void>;
  onSyncLocalToCloud?: () => Promise<void>;
  localGroupCount?: number;
  cloudGroupCount?: number;
  lastSyncedAt?: Date | null;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  lang,
  activeGroup,
  onLanguageChange,
  onOpenCheckDraw,
  onOpenBackup,
  onSyncNow,
  onSyncLocalToCloud,
  localGroupCount = 0,
  cloudGroupCount = 0,
  lastSyncedAt = null
}) => {
  const t = translations[lang];

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Email notifications preferences
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [savingEmailPref, setSavingEmailPref] = useState(false);

  // Test email state
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Notification logs for active group
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Load user profile email notifications preference
  useEffect(() => {
    let isMounted = true;
    async function loadUserProfile() {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && isMounted) {
          const data = userDoc.data();
          if (data.emailNotifications !== undefined) {
            setEmailEnabled(Boolean(data.emailNotifications));
          }
        }
      } catch (err) {
        console.warn('Could not read user profile email settings:', err);
      }
    }
    loadUserProfile();
    return () => {
      isMounted = false;
    };
  }, [user.uid]);

  // Load notification logs if active group exists
  useEffect(() => {
    if (!activeGroup) return;
    let isMounted = true;
    setLoadingLogs(true);
    getGroupNotificationLogs(activeGroup.id).then(fetchedLogs => {
      if (isMounted) {
        setLogs(fetchedLogs);
        setLoadingLogs(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeGroup?.id]);

  const handleLanguageSelect = async (selected: Language) => {
    onLanguageChange(selected);
    await updateUserLanguage(user.uid, selected);
  };

  const handleToggleEmailNotifications = async (enabled: boolean) => {
    setEmailEnabled(enabled);
    setSavingEmailPref(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        emailNotifications: enabled,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Error saving email notification preference', e);
    } finally {
      setSavingEmailPref(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!user.email || !activeGroup) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendTestEmailsToOrganizer(
        user.email,
        user.displayName || 'Organizer',
        activeGroup,
        lang
      );
      if (res.success) {
        setTestResult({
          success: true,
          message:
            lang === 'am'
              ? `የሙከራ መልእክቶች ወደ ${user.email} ተልከዋል!`
              : `Sample test emails sent to ${user.email}!`
        });
        // Refresh logs
        const updated = await getGroupNotificationLogs(activeGroup.id);
        setLogs(updated);
      } else {
        setTestResult({
          success: false,
          message: res.error || (lang === 'am' ? 'መልእክት መላክ አልተቻለም' : 'Failed to send test email')
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Error sending test email'
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e: any) {
      setError(e?.message || 'Logout failed');
    }
  };

  const isPasswordUser = user.providerData.some(p => p.providerId === 'password');
  const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');

  const handleDeleteWithPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!deletePassword) {
      setDeleteError(lang === 'am' ? 'እባክዎ የይለፍ ቃልዎን ያስገቡ' : 'Please enter your password');
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteUserAccount(user, deletePassword);
      if (!result.success) {
        if (result.error === 'wrong-password') {
          setDeleteError(t.deleteAccountWrongPassword);
        } else {
          setDeleteError(result.error || (lang === 'am' ? 'መለያውን መሰረዝ አልተቻለም' : 'Failed to delete account'));
        }
        setIsDeleting(false);
      }
    } catch (err: any) {
      setDeleteError(err?.message || (lang === 'am' ? 'ስህተት አጋጥሟል' : 'Error deleting account'));
      setIsDeleting(false);
    }
  };

  const handleGoogleReauthAndDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      try {
        await reauthenticateWithPopup(user, googleProvider);
      } catch (popupErr: any) {
        if (popupErr?.code === 'auth/popup-closed-by-user') {
          setIsDeleting(false);
          return;
        }
        if (popupErr?.code === 'auth/popup-blocked') {
          setDeleteError(
            lang === 'am'
              ? 'የብሮውዘር ፖፕአፕ ተዘግቷል። እባክዎ Popups ፈቅደው እንደገና ይሞክሩ።'
              : 'Popup blocked by browser. Please allow popups and try again.'
          );
          setIsDeleting(false);
          return;
        }
        throw popupErr;
      }
      const result = await deleteUserAccount(user);
      if (!result.success) {
        setDeleteError(result.error || (lang === 'am' ? 'መለያውን መሰረዝ አልተቻለም' : 'Failed to delete account'));
        setIsDeleting(false);
      }
    } catch (err: any) {
      setDeleteError(err?.message || (lang === 'am' ? 'ስህተት አጋጥሟል' : 'Error deleting account'));
      setIsDeleting(false);
    }
  };

  const handleDeleteDirect = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteUserAccount(user);
      if (!result.success) {
        if (result.error === 'requires-recent-login') {
          setDeleteError(t.deleteAccountReauthRequired);
        } else {
          setDeleteError(result.error || (lang === 'am' ? 'መለያውን መሰረዝ አልተቻለም' : 'Failed to delete account'));
        }
        setIsDeleting(false);
      }
    } catch (err: any) {
      setDeleteError(err?.message || (lang === 'am' ? 'ስህተት አጋጥሟል' : 'Error deleting account'));
      setIsDeleting(false);
    }
  };

  const isOrganizer = Boolean(activeGroup && activeGroup.organizerUid === user.uid);

  return (
    <div className="py-5 px-3 sm:px-4 max-w-[560px] mx-auto space-y-5 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading">
          {t.settingsTitle}
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {lang === 'am' ? 'ቋንቋ፣ ማሳወቂያዎች እና የመለያ መረጃ' : 'Preferences, notifications, and backup'}
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* PWA Install App Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div>
          <h2 className="text-sm font-bold text-stone-900 font-heading">
            {lang === 'am' ? 'መተግበሪያውን ስልክ ላይ መጫን' : 'Install Equb Draw'}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {lang === 'am'
              ? 'ከመነሻ ገጽ በቀላሉ ለመክፈትና ያለ በይነመረብ ለመጠቀም'
              : 'Add to your home screen for fast one-tap access and offline use'}
          </p>
        </div>
        <PWAInstallButton lang={lang} className="w-full" />
      </div>

      {/* Language Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <h2 className="text-xs uppercase tracking-wider font-bold text-stone-500 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-700" />
          <span>{lang === 'am' ? 'ቋንቋ (Language)' : 'Language'}</span>
        </h2>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleLanguageSelect('am')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all touch-target flex items-center justify-between ${
              lang === 'am'
                ? 'bg-amber-50/80 border-amber-400 text-stone-950 font-bold shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
            }`}
          >
            <div>
              <span className="text-base font-bold block font-heading-amharic">አማርኛ</span>
              <span className="text-[11px] text-stone-500">Amharic</span>
            </div>
            {lang === 'am' && <Check className="w-4 h-4 text-amber-800 stroke-[3]" />}
          </button>

          <button
            type="button"
            onClick={() => handleLanguageSelect('en')}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all touch-target flex items-center justify-between ${
              lang === 'en'
                ? 'bg-amber-50/80 border-amber-400 text-stone-950 font-bold shadow-xs'
                : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'
            }`}
          >
            <div>
              <span className="text-base font-bold block font-heading">English</span>
              <span className="text-[11px] text-stone-500">English</span>
            </div>
            {lang === 'en' && <Check className="w-4 h-4 text-amber-800 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Cross-Device Sync (Google Firebase) Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-heading">
                {t.crossDeviceSyncTitle}
              </h2>
              <span className="text-xs text-stone-500 block">
                {t.connectedToFirebase}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
            <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.syncStatusSynced}</span>
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          {t.crossDeviceSyncDesc}
        </p>

        {/* Device Sync Matrix Diagram */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-around text-center text-xs text-stone-600">
          <div className="flex flex-col items-center gap-1">
            <Smartphone className="w-5 h-5 text-emerald-700" />
            <span className="text-[11px] font-semibold">Android Phone</span>
          </div>
          <span className="text-stone-300 font-bold">⇄</span>
          <div className="flex flex-col items-center gap-1">
            <Tablet className="w-5 h-5 text-emerald-700" />
            <span className="text-[11px] font-semibold">Tablet</span>
          </div>
          <span className="text-stone-300 font-bold">⇄</span>
          <div className="flex flex-col items-center gap-1">
            <Laptop className="w-5 h-5 text-emerald-700" />
            <span className="text-[11px] font-semibold">Web Browser</span>
          </div>
        </div>

        {/* Sync Info Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              {t.lastSynced}
            </span>
            <span className="font-semibold text-stone-900">
              {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : t.justNow}
            </span>
          </div>
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">
              {lang === 'am' ? 'የክላውድ ዕቁቦች' : 'Cloud Equbs'}
            </span>
            <span className="font-bold text-emerald-800">
              {cloudGroupCount} {lang === 'am' ? 'ቡድኖች' : 'active'}
            </span>
          </div>
        </div>

        {/* Local Unsynced Groups Alert */}
        {localGroupCount > 0 && onSyncLocalToCloud && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {lang === 'am'
                  ? `${localGroupCount} ያልተመሳሰለ የመሳሪያ ዕቁብ አለ`
                  : `${localGroupCount} local group(s) not yet synced to cloud`}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                setIsSyncing(true);
                try {
                  await onSyncLocalToCloud();
                  setSyncFeedback(t.syncLocalSuccess);
                } catch {
                  setSyncFeedback(t.syncStatusError);
                } finally {
                  setIsSyncing(false);
                  setTimeout(() => setSyncFeedback(null), 3000);
                }
              }}
              disabled={isSyncing}
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl transition-colors touch-target"
            >
              {t.syncLocalToCloud}
            </button>
          </div>
        )}

        {syncFeedback && (
          <div className="p-2.5 bg-emerald-50 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Sync Now button */}
        {onSyncNow && (
          <button
            type="button"
            onClick={async () => {
              setIsSyncing(true);
              setSyncFeedback(null);
              try {
                await onSyncNow();
                setSyncFeedback(lang === 'am' ? 'ከፋየርቤዝ ጋር ተመሳስሏል' : 'Synced with Firebase');
              } catch {
                setSyncFeedback(lang === 'am' ? 'ማመሳሰል አልተሳካም' : 'Sync failed');
              } finally {
                setIsSyncing(false);
                setTimeout(() => setSyncFeedback(null), 3000);
              }
            }}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-2 py-3 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs sm:text-sm font-bold rounded-xl transition-colors touch-target border border-stone-200"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{t.syncNow}</span>
          </button>
        )}
      </div>

      {/* Email Notifications Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-stone-500 flex items-center gap-2">
          <Mail className="w-4 h-4 text-emerald-700" />
          <span>{t.notificationsSection}</span>
        </h2>

        {/* Toggle: Send me email notifications */}
        <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl">
          <div>
            <span className="text-sm font-bold text-stone-900 block">
              {t.sendMeEmailNotifications}
            </span>
            <span className="text-[11px] text-stone-500">
              {lang === 'am'
                ? 'የክፍያ ማስታወሻዎች እና የዕጣ ውጤቶች በኢሜይል እንዲደርሱኝ'
                : 'Receive reminders and draw results by email'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailEnabled}
              onChange={e => handleToggleEmailNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Organizer Section: Test email & blaze plan notice */}
        {isOrganizer && (
          <div className="space-y-3 pt-2 border-t border-stone-100">
            {/* Blaze plan note banner */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">{t.blazePlanTitle}:</span>
                <span className="text-amber-800 leading-relaxed block mt-0.5">
                  {t.blazePlanDesc}
                </span>
              </div>
            </div>

            {/* Test Email Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTest || !user.email}
                className="w-full flex items-center justify-center gap-2 p-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold transition-colors touch-target"
              >
                {sendingTest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-amber-300" />
                )}
                <span>{t.sendTestEmailBtn}</span>
              </button>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Messages sent log */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t.messagesSentLog} ({logs.length})</span>
                </span>
                <span className="text-[10px] text-stone-400">{activeGroup?.name}</span>
              </div>

              {logs.length === 0 ? (
                <div className="p-3 bg-stone-50 rounded-xl text-center text-xs text-stone-400">
                  {lang === 'am' ? 'እስካሁን የተላከ መልእክት የለም' : 'No messages logged yet'}
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {logs.slice(0, 5).map(log => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-stone-900 block">
                          {log.type === 'winner'
                            ? lang === 'am' ? 'የአሸናፊ መልእክት' : 'Winner Alert'
                            : log.type === 'draw_result'
                            ? lang === 'am' ? 'የዕጣ ውጤት' : 'Draw Result'
                            : log.type === 'test'
                            ? lang === 'am' ? 'የሙከራ መልእክት' : 'Test Email'
                            : lang === 'am' ? 'የክፍያ ማስታወሻ' : 'Payment Reminder'}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          To: {log.recipientEmail} ({log.memberName})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 shrink-0">
                        {new Date(log.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tools & Backup Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <h2 className="text-xs uppercase tracking-wider font-bold text-stone-500 flex items-center gap-2">
          <HardDriveDownload className="w-4 h-4 text-emerald-700" />
          <span>{lang === 'am' ? 'መረጃ እና መሳሪያዎች' : 'Data & Tools'}</span>
        </h2>

        {/* Check a draw tool button */}
        <button
          type="button"
          onClick={onOpenCheckDraw}
          className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 rounded-2xl text-stone-800 text-xs sm:text-sm font-bold transition-colors touch-target"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.wasDrawFair}</span>
          </div>
          <span className="text-xs text-stone-400 font-mono">→</span>
        </button>

        {/* Save a copy of my data (Backup) */}
        <button
          type="button"
          onClick={onOpenBackup}
          className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 rounded-2xl text-stone-800 text-xs sm:text-sm font-bold transition-colors touch-target"
        >
          <div className="flex items-center gap-2.5">
            <HardDriveDownload className="w-4 h-4 text-stone-600" />
            <span>{t.saveCopyOfData}</span>
          </div>
          <span className="text-xs text-stone-400 font-mono">JSON</span>
        </button>

        {/* Restore my data */}
        <button
          type="button"
          onClick={onOpenBackup}
          className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 rounded-2xl text-stone-800 text-xs sm:text-sm font-bold transition-colors touch-target"
        >
          <div className="flex items-center gap-2.5">
            <Upload className="w-4 h-4 text-stone-600" />
            <span>{t.restoreMyData}</span>
          </div>
          <span className="text-xs text-stone-400 font-mono">→</span>
        </button>
      </div>

      {/* Account Info Section */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <h2 className="text-xs uppercase tracking-wider font-bold text-stone-500 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-emerald-700" />
          <span>{t.myAccount}</span>
        </h2>

        <div className="p-3 bg-stone-50 rounded-2xl space-y-1">
          <div className="text-sm font-bold text-stone-900">
            {user.displayName || 'Equb Member'}
          </div>
          <div className="text-xs text-stone-500">
            {user.email}
          </div>
        </div>

        {/* Log Out */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm rounded-2xl transition-colors touch-target"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.logoutBtn}</span>
        </button>

        {/* Delete Account */}
        <div className="pt-2 border-t border-stone-100">
          {!deleteConfirmOpen ? (
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmOpen(true);
                setDeleteError(null);
                setDeletePassword('');
              }}
              className="w-full text-center py-2 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors touch-target"
            >
              {t.deleteAccountBtn}
            </button>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5">
                <Trash2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-900">
                    {t.deleteAccountConfirm}
                  </p>
                  <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                    {t.deleteAccountWarning}
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="p-2.5 bg-red-100 border border-red-300 rounded-xl text-xs text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              {isPasswordUser ? (
                <form onSubmit={handleDeleteWithPassword} className="space-y-2.5 pt-1">
                  <label className="text-[11px] font-bold text-stone-700 block">
                    {t.deleteAccountPasswordPrompt}
                  </label>
                  <div className="relative">
                    <input
                      type={showDeletePassword ? 'text' : 'password'}
                      value={deletePassword}
                      onChange={e => {
                        setDeletePassword(e.target.value);
                        setDeleteError(null);
                      }}
                      placeholder={lang === 'am' ? 'የይለፍ ቃልዎን ያስገቡ' : 'Enter your password'}
                      className="w-full pl-3 pr-10 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showDeletePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmOpen(false);
                        setDeletePassword('');
                        setDeleteError(null);
                      }}
                      disabled={isDeleting}
                      className="px-3 py-2 bg-white text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 touch-target"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={isDeleting || !deletePassword.trim()}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl touch-target flex items-center gap-1.5 shadow-xs"
                    >
                      {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{t.deleteAccountConfirmBtn}</span>
                    </button>
                  </div>
                </form>
              ) : isGoogleUser ? (
                <div className="space-y-2.5 pt-1">
                  <p className="text-xs text-stone-600">
                    {t.deleteAccountGooglePrompt}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmOpen(false);
                        setDeleteError(null);
                      }}
                      disabled={isDeleting}
                      className="px-3 py-2 bg-white text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 touch-target"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleReauthAndDelete}
                      disabled={isDeleting}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl touch-target flex items-center gap-1.5 shadow-xs"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>{t.deleteAccountVerifyGoogleBtn}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmOpen(false);
                      setDeleteError(null);
                    }}
                    disabled={isDeleting}
                    className="px-3 py-2 bg-white text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 touch-target"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteDirect}
                    disabled={isDeleting}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl touch-target flex items-center gap-1.5 shadow-xs"
                  >
                    {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{t.deleteAccountConfirmBtn}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
