/**
 * TruthTrace: Privacy, Security & Data Sovereignty Settings Modal
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Database,
  Trash2,
  CheckCircle2,
  HardDrive,
  EyeOff,
  Cpu,
  RefreshCw
} from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearLocalData: () => void;
  onResetToDemoData: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  onClearLocalData,
  onResetToDemoData,
}) => {
  const [localPersistence, setLocalPersistence] = useState(true);
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all locally cached investigations?')) {
      onClearLocalData();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset workspace to the verified peer-reviewed demo investigations?')) {
      onResetToDemoData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Privacy, Epistemic Integrity & Security
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Local Sovereignty Banner */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Lock className="w-4 h-4 text-slate-700" />
            <span>Zero-Telemetry & Local Data Sovereignty</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            TruthTrace stores your investigative projects, extracted quotes, hypotheses, and reports strictly inside your browser's private storage (localStorage). No user dossiers, tracking cookies, or external behavioral analytics are recorded.
          </p>
        </div>

        {/* AI Transparency & Safety Statement */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <Cpu className="w-4 h-4 text-amber-700" />
            <span>AI Architecture & Epistemic Boundaries</span>
          </div>
          <ul className="space-y-1 text-slate-700 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span>All AI assistance runs via secure server-side proxy routes with zero client API key exposure.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span>AI output is strictly labeled as draft hypothesis assistance and never authoritative fact.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span>Primary evidence quotes require verbatim source text and human researcher stance confirmation.</span>
            </li>
          </ul>
        </div>

        {/* Actions & Storage Management */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Storage Maintenance
          </h4>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleResetDemo}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Reset Initial Demo Projects
            </button>

            <button
              onClick={handleClear}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 text-xs font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Local Storage
            </button>
          </div>

          {clearedNotice && (
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Local storage successfully cleared.
            </p>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
