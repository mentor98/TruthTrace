/**
 * TruthTrace: Evidence Ledger & Stance Classification Tab
 */

import React, { useState } from 'react';
import {
  EvidencePassage,
  EvidenceStance,
  EvidenceStrength,
  Source,
  Claim
} from '../types';
import {
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Quote,
  Trash2,
  Sparkles,
  ShieldCheck,
  Layers,
  ChevronDown
} from 'lucide-react';
import { AiAdvisoryBadge } from './AiAdvisoryBadge';

interface EvidenceLedgerTabProps {
  claim: Claim;
  sources: Source[];
  evidenceList: EvidencePassage[];
  onUpdateEvidence: (updated: EvidencePassage) => void;
  onDeleteEvidence: (id: string) => void;
  onAddManualEvidence: (newEv: Omit<EvidencePassage, 'id' | 'createdAt'>) => void;
}

export const EvidenceLedgerTab: React.FC<EvidenceLedgerTabProps> = ({
  claim,
  sources,
  evidenceList,
  onUpdateEvidence,
  onDeleteEvidence,
  onAddManualEvidence,
}) => {
  const [filterStance, setFilterStance] = useState<string>('ALL');
  const [filterStrength, setFilterStrength] = useState<string>('ALL');
  const [filterSourceId, setFilterSourceId] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Manual Add Form State
  const [formQuote, setFormQuote] = useState('');
  const [formSourceId, setFormSourceId] = useState(sources[0]?.id || '');
  const [formSubClaimId, setFormSubClaimId] = useState('');
  const [formStance, setFormStance] = useState<EvidenceStance>('SUPPORTING');
  const [formStrength, setFormStrength] = useState<EvidenceStrength>('HIGH');
  const [formRationale, setFormRationale] = useState('');
  const [formPage, setFormPage] = useState('');
  const [formStudyType, setFormStudyType] = useState('');
  const [formSampleSize, setFormSampleSize] = useState('');

  const stanceBadges: Record<
    EvidenceStance,
    { label: string; bg: string; text: string; border: string }
  > = {
    SUPPORTING: {
      label: 'Supports Claim',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
    CONTRADICTING: {
      label: 'Contradicts / Refutes',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
    },
    QUALIFYING: {
      label: 'Qualifies / Nuanced',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    NEUTRAL: {
      label: 'Neutral / Context',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
  };

  const strengthBadges: Record<
    EvidenceStrength,
    { label: string; bg: string }
  > = {
    HIGH: { label: 'High Rigor', bg: 'bg-emerald-100 text-emerald-900' },
    MODERATE: { label: 'Moderate Rigor', bg: 'bg-blue-100 text-blue-900' },
    WEAK: { label: 'Weak / Anecdotal', bg: 'bg-slate-100 text-slate-700' },
    FLAWED: { label: 'Methodologically Flawed', bg: 'bg-rose-100 text-rose-900' },
  };

  const filteredEvidence = evidenceList.filter((ev) => {
    if (filterStance !== 'ALL' && ev.stance !== filterStance) return false;
    if (filterStrength !== 'ALL' && ev.strength !== filterStrength) return false;
    if (filterSourceId !== 'ALL' && ev.sourceId !== filterSourceId) return false;
    return true;
  });

  const handleCreateManualEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuote.trim() || !formSourceId) return;

    onAddManualEvidence({
      claimId: claim.id,
      sourceId: formSourceId,
      subClaimId: formSubClaimId || undefined,
      quote: formQuote.trim(),
      pageOrSection: formPage.trim(),
      stance: formStance,
      strength: formStrength,
      strengthRationale: formRationale.trim() || 'Direct manual extraction',
      methodologyDetails: {
        studyType: formStudyType.trim(),
        sampleSize: formSampleSize.trim(),
      },
      verifiedByUser: true,
      aiGenerated: false,
    });

    setIsAddModalOpen(false);
    setFormQuote('');
    setFormRationale('');
    setFormPage('');
  };

  // Counts summary
  const supportingCount = evidenceList.filter((e) => e.stance === 'SUPPORTING').length;
  const opposingCount = evidenceList.filter((e) => e.stance === 'CONTRADICTING').length;
  const qualifyingCount = evidenceList.filter((e) => e.stance === 'QUALIFYING').length;

  return (
    <div className="space-y-6">
      {/* Top Ledger Metric Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Evidence Ledger & Stance Breakdown</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {evidenceList.length} total passages
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Classify empirical passages by evidentiary stance, methodological strength, and target sub-claim.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mini Stance Meter */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {supportingCount} Supporting
            </span>
            <span className="flex items-center gap-1 font-medium text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {opposingCount} Opposing
            </span>
            <span className="flex items-center gap-1 font-medium text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {qualifyingCount} Qualifying
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Evidence Passage
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filters:</span>
        </div>

        {/* Stance Filter */}
        <select
          value={filterStance}
          onChange={(e) => setFilterStance(e.target.value)}
          className="px-2.5 py-1 rounded-md border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer"
        >
          <option value="ALL">All Stances ({evidenceList.length})</option>
          <option value="SUPPORTING">Supporting ({supportingCount})</option>
          <option value="CONTRADICTING">Contradicting ({opposingCount})</option>
          <option value="QUALIFYING">Qualifying ({qualifyingCount})</option>
          <option value="NEUTRAL">Neutral / Context</option>
        </select>

        {/* Strength Filter */}
        <select
          value={filterStrength}
          onChange={(e) => setFilterStrength(e.target.value)}
          className="px-2.5 py-1 rounded-md border border-slate-300 bg-white font-medium text-slate-700 cursor-pointer"
        >
          <option value="ALL">All Strength Levels</option>
          <option value="HIGH">High Rigor</option>
          <option value="MODERATE">Moderate Rigor</option>
          <option value="WEAK">Weak / Anecdotal</option>
          <option value="FLAWED">Methodologically Flawed</option>
        </select>

        {/* Source Filter */}
        <select
          value={filterSourceId}
          onChange={(e) => setFilterSourceId(e.target.value)}
          className="px-2.5 py-1 rounded-md border border-slate-300 bg-white font-medium text-slate-700 max-w-xs truncate cursor-pointer"
        >
          <option value="ALL">All Sources ({sources.length})</option>
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.publication}: {s.title.substring(0, 40)}...
            </option>
          ))}
        </select>

        {(filterStance !== 'ALL' || filterStrength !== 'ALL' || filterSourceId !== 'ALL') && (
          <button
            onClick={() => {
              setFilterStance('ALL');
              setFilterStrength('ALL');
              setFilterSourceId('ALL');
            }}
            className="text-slate-500 hover:text-slate-800 underline font-medium text-[11px] cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Evidence Cards Grid */}
      <div className="space-y-4">
        {filteredEvidence.map((ev) => {
          const src = sources.find((s) => s.id === ev.sourceId);
          const matchedSubClaim = claim.subClaims.find((sc) => sc.id === ev.subClaimId);
          const stanceCfg = stanceBadges[ev.stance] || stanceBadges.NEUTRAL;
          const strengthCfg = strengthBadges[ev.strength] || strengthBadges.HIGH;

          return (
            <div
              key={ev.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Header Badges & Source Line */}
              <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Stance Selector Pill */}
                  <select
                    value={ev.stance}
                    onChange={(e) =>
                      onUpdateEvidence({
                        ...ev,
                        stance: e.target.value as EvidenceStance,
                      })
                    }
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md border cursor-pointer ${stanceCfg.bg} ${stanceCfg.text} ${stanceCfg.border}`}
                  >
                    <option value="SUPPORTING">Supporting</option>
                    <option value="CONTRADICTING">Contradicting / Refuting</option>
                    <option value="QUALIFYING">Qualifying / Contextual</option>
                    <option value="NEUTRAL">Neutral / Background</option>
                  </select>

                  {/* Strength Selector Pill */}
                  <select
                    value={ev.strength}
                    onChange={(e) =>
                      onUpdateEvidence({
                        ...ev,
                        strength: e.target.value as EvidenceStrength,
                      })
                    }
                    className={`text-[11px] font-medium px-2 py-1 rounded-md border border-slate-200 cursor-pointer ${strengthCfg.bg}`}
                  >
                    <option value="HIGH">High Rigor</option>
                    <option value="MODERATE">Moderate Rigor</option>
                    <option value="WEAK">Weak / Anecdotal</option>
                    <option value="FLAWED">Methodologically Flawed</option>
                  </select>

                  {/* AI Generated / Verified Status */}
                  {ev.aiGenerated && !ev.verifiedByUser ? (
                    <AiAdvisoryBadge
                      label="AI Draft Extraction"
                      size="sm"
                      confidenceScore={ev.aiConfidenceScore}
                    />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      Researcher Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {ev.aiGenerated && !ev.verifiedByUser && (
                    <button
                      onClick={() =>
                        onUpdateEvidence({
                          ...ev,
                          verifiedByUser: true,
                        })
                      }
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-900 text-white hover:bg-slate-800 font-medium transition-colors cursor-pointer"
                      title="Confirm this stance and quote as verified human researcher assessment"
                    >
                      Confirm Stance
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteEvidence(ev.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    title="Delete passage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Verbatim Quote Box */}
              <div className="relative pl-4 border-l-2 border-slate-300">
                <Quote className="w-4 h-4 text-slate-400 absolute -left-2 top-0 bg-white" />
                <blockquote className="text-slate-900 text-sm sm:text-base leading-relaxed italic">
                  "{ev.quote}"
                </blockquote>
                {ev.pageOrSection && (
                  <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                    📍 Locator: {ev.pageOrSection}
                  </span>
                )}
              </div>

              {/* Source Provenance & Methodological Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-600">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Source Provenance
                  </span>
                  <p className="font-medium text-slate-800">
                    {src ? src.publication : 'Unknown Publication'} (
                    {src?.publicationDate?.substring(0, 4) || 'n.d.'})
                  </p>
                  <p className="text-[11px] text-slate-500 truncate" title={src?.title}>
                    {src?.title}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Methodological Rationale
                  </span>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    {ev.strengthRationale || 'No rationale specified.'}
                  </p>
                  {ev.methodologyDetails?.studyType && (
                    <span className="text-[10px] font-mono text-slate-500 block">
                      Type: {ev.methodologyDetails.studyType}
                    </span>
                  )}
                </div>
              </div>

              {/* Linked Sub-Claim selector */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Decomposition Target:</span>
                  <select
                    value={ev.subClaimId || ''}
                    onChange={(e) =>
                      onUpdateEvidence({
                        ...ev,
                        subClaimId: e.target.value || undefined,
                      })
                    }
                    className="p-1 rounded-md border border-slate-200 bg-slate-50 text-slate-800 text-[11px] max-w-xs truncate cursor-pointer"
                  >
                    <option value="">Master Claim Proposition</option>
                    {claim.subClaims.map((sc, idx) => (
                      <option key={sc.id} value={sc.id}>
                        Sub-claim {idx + 1}: {sc.text.substring(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>

                {ev.userNotes && (
                  <span className="text-[11px] text-slate-500 italic truncate max-w-sm">
                    Note: {ev.userNotes}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredEvidence.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Quote className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">
              No evidence passages match the active filters.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Extract passages from the Sources tab or click "Add Evidence Passage" above.
            </p>
          </div>
        )}
      </div>

      {/* Manual Evidence Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Record Evidence Passage
                </h3>
                <p className="text-xs text-slate-500">
                  Transcribe verbatim quote and assign epistemological stance.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualEvidence} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Source Reference *
                </label>
                <select
                  required
                  value={formSourceId}
                  onChange={(e) => setFormSourceId(e.target.value)}
                  className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.publication}: {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Verbatim Passage / Quote *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste the exact quoted statement from the source document..."
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Evidentiary Stance
                  </label>
                  <select
                    value={formStance}
                    onChange={(e) => setFormStance(e.target.value as EvidenceStance)}
                    className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="SUPPORTING">Supporting</option>
                    <option value="CONTRADICTING">Contradicting / Refuting</option>
                    <option value="QUALIFYING">Qualifying / Contextual</option>
                    <option value="NEUTRAL">Neutral / Background</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Evidence Strength Level
                  </label>
                  <select
                    value={formStrength}
                    onChange={(e) => setFormStrength(e.target.value as EvidenceStrength)}
                    className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="HIGH">High Rigor (RCT, Large Cohort)</option>
                    <option value="MODERATE">Moderate Rigor (Observational)</option>
                    <option value="WEAK">Weak (Anecdote, Uncorroborated)</option>
                    <option value="FLAWED">Methodologically Flawed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Sub-Claim Target (Optional)
                  </label>
                  <select
                    value={formSubClaimId}
                    onChange={(e) => setFormSubClaimId(e.target.value)}
                    className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Master Claim Proposition</option>
                    {claim.subClaims.map((sc, i) => (
                      <option key={sc.id} value={sc.id}>
                        Sub-claim {i + 1}: {sc.text.substring(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Page / Section Locator
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. p. 1104, Section IV"
                    value={formPage}
                    onChange={(e) => setFormPage(e.target.value)}
                    className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Methodological Strength Rationale
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12-month double-arm randomized controlled human trial (N=139)..."
                  value={formRationale}
                  onChange={(e) => setFormRationale(e.target.value)}
                  className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-md text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors shadow-xs cursor-pointer"
                >
                  Save Passage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
