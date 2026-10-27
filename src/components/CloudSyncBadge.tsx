import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { Cloud, CloudCheck, CloudOff, RefreshCw, CheckCircle2, AlertCircle, X, Smartphone, Laptop, Tablet } from 'lucide-react';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error' | 'local_only';

interface CloudSyncBadgeProps {
  syncState: SyncState;
  lastSyncedAt: Date | null;
  user: User | null;
  lang: Language;
  localGroupCount: number;
  cloudGroupCount: number;
  onSyncNow: () => Promise<void>;
  onSyncLocalToCloud: () => Promise<void>;
}

export const CloudSyncBadge: React.FC<CloudSyncBadgeProps> = ({
  syncState,
  lastSyncedAt,
  user,
  lang,
  localGroupCount,
  cloudGroupCount,
  onSyncNow,
  onSyncLocalToCloud
}) => {
  const t = translations[lang];
  const [modalOpen, setModalOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const formatLastSync = (date: Date | null) => {
    if (!date) return t.justNow;
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 30) return t.justNow;
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    return `${diffMin}m ago`;
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setSyncFeedback(null);
    try {
      await onSyncNow();
      setSyncFeedback(lang === 'am' ? 'በተሳካ ሁኔታ ተመሳስሏል' : 'Successfully synchronized with Firebase');
    } catch {
      setSyncFeedback(lang === 'am' ? 'የማመሳሰል ችግር ተፈጥሯል' : 'Failed to synchronize');
    } finally {
      setIsManualSyncing(false);
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  const handleUploadLocal = async () => {
    setIsManualSyncing(true);
    try {
      await onSyncLocalToCloud();
      setSyncFeedback(t.syncLocalSuccess);
    } catch {
      setSyncFeedback(t.syncStatusError);
    } finally {
      setIsManualSyncing(false);
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  return (
    <>
      {/* Header Compact Badge */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all touch-target ${
          syncState === 'synced'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
            : syncState === 'syncing' || isManualSyncing
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50 animate-pulse'
            : syncState === 'offline'
            ? 'bg-stone-800 border-stone-600 text-stone-300 hover:bg-stone-700'
            : 'bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/50'
        }`}
        title={t.crossDeviceSyncTitle}
        aria-label={t.crossDeviceSyncTitle}
      >
        {syncState === 'syncing' || isManualSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
        ) : syncState === 'offline' ? (
          <CloudOff className="w-3.5 h-3.5 text-stone-400" />
        ) : (
          <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <span className="hidden sm:inline text-[11px] font-medium">
          {syncState === 'syncing' || isManualSyncing
            ? (lang === 'am' ? 'እየተመሳሰለ...' : 'Syncing...')
            : syncState === 'offline'
            ? (lang === 'am' ? 'ከመስመር ውጭ' : 'Offline')
            : (lang === 'am' ? 'ተመሳስሏል' : 'Synced')}
        </span>
      </button>

      {/* Cloud Sync Status Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 text-stone-900 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 font-heading text-base sm:text-lg">
                    {t.crossDeviceSyncTitle}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {t.connectedToFirebase}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg touch-target"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sync explanation */}
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.crossDeviceSyncDesc}
            </p>

            {/* Device icons row */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-around text-center text-xs text-stone-600">
              <div className="flex flex-col items-center gap-1">
                <Smartphone className="w-5 h-5 text-emerald-700" />
                <span className="text-[11px]">Android App</span>
              </div>
              <span className="text-stone-300 font-bold">⇄</span>
              <div className="flex flex-col items-center gap-1">
                <Tablet className="w-5 h-5 text-emerald-700" />
                <span className="text-[11px]">Tablet</span>
              </div>
              <span className="text-stone-300 font-bold">⇄</span>
              <div className="flex flex-col items-center gap-1">
                <Laptop className="w-5 h-5 text-emerald-700" />
                <span className="text-[11px]">Computer</span>
              </div>
            </div>

            {/* Sync Status Card */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-stone-500">{t.lastSynced}</span>
                <span className="font-semibold text-stone-900">
                  {formatLastSync(lastSyncedAt)}
                </span>
              </div>

              {user && (
                <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-stone-500">{lang === 'am' ? 'መለያ' : 'Account'}</span>
                  <span className="font-mono text-stone-900 truncate max-w-[200px]">
                    {user.email || user.displayName || 'Google User'}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-stone-500">{lang === 'am' ? 'በክላውድ የተመዘገቡ እቁቦች' : 'Cloud Equbs'}</span>
                <span className="font-bold text-emerald-800">
                  {cloudGroupCount} {lang === 'am' ? 'ቡድኖች' : 'groups'}
                </span>
              </div>
            </div>

            {/* Unsynced local groups prompt */}
            {localGroupCount > 0 && user && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    {lang === 'am'
                      ? `${localGroupCount} ያልተመሳሰለ የዚህ መሳሪያ እቁብ አለ`
                      : `${localGroupCount} local group(s) not yet in cloud`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleUploadLocal}
                  disabled={isManualSyncing}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl transition-colors touch-target"
                >
                  {t.syncLocalToCloud}
                </button>
              </div>
            )}

            {syncFeedback && (
              <div className="p-2.5 bg-emerald-50 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isManualSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0E3B2E] hover:bg-[#07241C] text-[#FFF1CC] rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors touch-target"
              >
                <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin' : ''}`} />
                <span>{t.syncNow}</span>
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors touch-target"
              >
                {t.back}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
