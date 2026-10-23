import React, { useRef, useState } from 'react';
import { Language } from '../types/equb';
import { translations } from '../i18n/translations';
import { storageService } from '../services/storage';
import { HardDriveDownload, Download, Upload, Check, AlertTriangle, X } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onDataImported: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  lang,
  onDataImported
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const jsonStr = storageService.exportBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `equb_draw_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        text: lang === 'am' ? 'የመጠባበቂያ ፋይሉ ወርዷል!' : 'Backup JSON file exported successfully!',
        isError: false
      });
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Export error',
        isError: true
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const res = storageService.importBackup(content);
      if (res.success) {
        setStatusMessage({
          text: `${t.importSuccess} (${res.count} ${t.groups})`,
          isError: false
        });
        onDataImported();
      } else {
        setStatusMessage({
          text: `${t.importFailed}: ${res.error}`,
          isError: true
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
            <HardDriveDownload className="w-5 h-5 text-amber-600" />
            <span>{t.backupRestore}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            {lang === 'am'
              ? 'የሁሉንም የእቁብ ቡድኖች፣ የክፍያ እና የዕጣ ታሪክ ወደ አንድ የ JSON ፋይል ያውጡ ወይም ከሌላ ስልክ ያስገቡ።'
              : 'Safely backup all Equb groups, payment ledgers, and cryptographic proofs into a single JSON file, or restore onto another device.'}
          </p>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.isError
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {statusMessage.isError ? (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              ) : (
                <Check className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Boxes */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl transition-colors min-h-[48px]"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                    {t.exportData}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {lang === 'am' ? 'ሁሉንም መረጃ በ JSON ፋይል አውርድ' : 'Download all data as JSON file'}
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl transition-colors min-h-[48px]"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                    {t.importData}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {lang === 'am' ? 'ከቀድሞ የ JSON ፋይል መልስ' : 'Restore from existing JSON backup'}
                  </span>
                </div>
              </div>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
