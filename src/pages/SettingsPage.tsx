import React, { useRef, useState } from 'react';
import { useMoneyFlow } from '../context/MoneyFlowContext';
import { AlertTriangle, Download, RefreshCw, Trash2, Upload, Database, Smartphone, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { exportData, importData, resetData, clearData, categories, sources, spends, transfers } = useMoneyFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importData(content);
      }
    };
    reader.readAsText(file);

    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-slate-400">PWA, data backup & app management</p>
      </div>

      {/* PWA & App Status Card */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {isStandalone ? 'Installed iPhone PWA' : 'Safari Browser View'}
            </div>
            <div className="text-[11px] text-slate-400">
              {isStandalone
                ? 'Running in iOS standalone app mode'
                : 'Tap Safari Share icon → "Add to Home Screen" to install'}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-800/50 p-2 rounded-xl flex items-center space-x-1.5 text-slate-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Offline Ready</span>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-xl flex items-center space-x-1.5 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>localStorage Sync</span>
          </div>
        </div>
      </div>

      {/* Database Stats */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Local Storage Records</div>
            <div className="text-[11px] text-slate-400">
              {categories.length} Categories · {sources.length} Sources · {spends.length} Spends · {transfers.length} Transfers
            </div>
          </div>
        </div>
      </div>

      {/* Data & Backup Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Data & Backup
        </h2>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
          {/* Export */}
          <button
            onClick={exportData}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Export JSON Backup</div>
                <div className="text-[11px] text-slate-400">
                  Save all categories, sources, spends, and transfers to JSON
                </div>
              </div>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition"
          >
            <div className="flex items-center space-x-3">
              <Upload className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">Import JSON Backup</div>
                <div className="text-[11px] text-slate-400">
                  Restore data from a previously exported backup file
                </div>
              </div>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider px-1">
          Danger Zone
        </h2>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
          {/* Reset to Sample Data */}
          {confirmReset ? (
            <div className="p-4 bg-amber-950/40 space-y-3">
              <div className="text-xs font-semibold text-amber-200">
                Reset all data back to original sample categories, sources, and transfers?
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    resetData();
                    setConfirmReset(false);
                  }}
                  className="flex-1 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl"
                >
                  Yes, Reset to Sample
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition"
            >
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-amber-300">Reset to Sample Data</div>
                  <div className="text-[11px] text-slate-400">
                    Replace current data with default construction categories & sources
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Clear All Data */}
          {confirmClear ? (
            <div className="p-4 bg-red-950/60 space-y-3">
              <div className="text-xs font-semibold text-red-200 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Clear all categories, sources, spends, and transfers permanently?</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    clearData();
                    setConfirmClear(false);
                  }}
                  className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
                >
                  Yes, Clear Everything
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition"
            >
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-red-400">Clear All Data</div>
                  <div className="text-[11px] text-slate-400">
                    Completely wipe all records from local storage
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
