/**
 * TruthTrace: Claim Overview & Sub-claims Decomposition Tab
 */

import React, { useState } from 'react';
import {
  Claim,
  SubClaim,
  ClaimStatus,
  PriorityLevel
} from '../types';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Scale,
  Clock,
  Tag,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { AiAdvisoryBadge, AiDisclaimerBanner } from './AiAdvisoryBadge';

interface ClaimOverviewTabProps {
  claim: Claim;
  onUpdateClaim: (updated: Claim) => void;
  onRunAiDecomposition: () => Promise<void>;
  isAiLoading: boolean;
}

export const ClaimOverviewTab: React.FC<ClaimOverviewTabProps> = ({
  claim,
  onUpdateClaim,
  onRunAiDecomposition,
  isAiLoading,
}) => {
  const [newSubClaimText, setNewSubClaimText] = useState('');
  const [newTagText, setNewTagText] = useState('');
  const [isEditingStatement, setIsEditingStatement] = useState(false);

  const statusConfigs: Record<
    ClaimStatus,
    { label: string; bg: string; text: string; icon: any; border: string }
  > = {
    investigating: {
      label: 'Under Investigation',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: Clock,
    },
    strongly_supported: {
      label: 'Strongly Supported',
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
    },
    mixed_contested: {
      label: 'Mixed / Contested',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Scale,
    },
    refuted: {
      label: 'Empirically Refuted',
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
    },
    inconclusive: {
      label: 'Inconclusive / Insufficient Data',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: HelpCircle,
    },
  };

  const handleAddSubClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubClaimText.trim()) return;

    const newSub: SubClaim = {
      id: `subclaim-${Date.now()}`,
      claimId: claim.id,
      text: newSubClaimText.trim(),
      status: 'investigating',
    };

    onUpdateClaim({
      ...claim,
      subClaims: [...claim.subClaims, newSub],
      updatedAt: new Date().toISOString(),
    });
    setNewSubClaimText('');
  };

  const handleRemoveSubClaim = (id: string) => {
    onUpdateClaim({
      ...claim,
      subClaims: claim.subClaims.filter((s) => s.id !== id),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleUpdateSubClaimStatus = (id: string, status: ClaimStatus) => {
    onUpdateClaim({
      ...claim,
      subClaims: claim.subClaims.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagText.trim()) return;
    const tag = newTagText.trim();
    if (!claim.tags.includes(tag)) {
      onUpdateClaim({
        ...claim,
        tags: [...claim.tags, tag],
        updatedAt: new Date().toISOString(),
      });
    }
    setNewTagText('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateClaim({
      ...claim,
      tags: claim.tags.filter((t) => t !== tagToRemove),
      updatedAt: new Date().toISOString(),
    });
  };

  const currentStatusConfig = statusConfigs[claim.status] || statusConfigs.investigating;
  const StatusIcon = currentStatusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Top Banner / Master Proposition Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Primary Master Claim
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {claim.domain || 'Uncategorized'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {claim.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Status Selector */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 font-medium">Status:</label>
              <select
                value={claim.status}
                onChange={(e) =>
                  onUpdateClaim({
                    ...claim,
                    status: e.target.value as ClaimStatus,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border}`}
              >
                {Object.entries(statusConfigs).map(([key, cfg]) => (
                  <option key={key} value={key} className="bg-white text-slate-800">
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Decomposition button */}
            <button
              onClick={onRunAiDecomposition}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 text-xs font-medium transition-colors shadow-xs cursor-pointer"
              title="Decompose proposition into testable atomic sub-claims with AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiLoading ? 'Analyzing...' : 'AI Decompose'}</span>
            </button>
          </div>
        </div>

        {/* Falsifiable Statement Box */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Falsifiable Proposition Statement
            </span>
            <button
              onClick={() => setIsEditingStatement(!isEditingStatement)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              {isEditingStatement ? 'Done' : 'Edit'}
            </button>
          </div>

          {isEditingStatement ? (
            <textarea
              value={claim.statement}
              onChange={(e) =>
                onUpdateClaim({
                  ...claim,
                  statement: e.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              rows={3}
              className="w-full text-sm p-2.5 rounded-md border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <p className="text-slate-800 text-base sm:text-lg italic leading-relaxed">
              "{claim.statement}"
            </p>
          )}
        </div>

        {/* Confidence & Priority Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Confidence Slider */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-slate-600">
                Evidentiary Confidence
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                {claim.confidenceRating}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={claim.confidenceRating}
              onChange={(e) =>
                onUpdateClaim({
                  ...claim,
                  confidenceRating: Number(e.target.value),
                  updatedAt: new Date().toISOString(),
                })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>Unverified</span>
              <span>Moderate</span>
              <span>Empirical Consensus</span>
            </div>
          </div>

          {/* Domain & Priority */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-600 mb-1">
              Research Priority
            </span>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as PriorityLevel[]).map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    onUpdateClaim({
                      ...claim,
                      priority: p,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className={`flex-1 text-xs py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                    claim.priority === p
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs font-medium text-slate-600 mb-1.5 block">
              Topic Tags
            </span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {claim.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Add tag..."
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md w-full focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded-md font-medium text-slate-700 cursor-pointer"
              >
                +
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Epistemic Advisory Notice */}
      <AiDisclaimerBanner
        title="Epistemological Framework"
        description="TruthTrace enforces strict evidentiary decomposition: evaluate testable propositions against primary empirical sources. Sub-claims must be verified with cited passages."
      />

      {/* Sub-Claims Decomposition Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Sub-Claims Decomposition</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {claim.subClaims.length} propositions
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Decompose complex hypotheses into atomic, verifiable sub-claims that can be evaluated individually with extracted evidence.
            </p>
          </div>
        </div>

        {/* Sub-claims List */}
        <div className="space-y-3">
          {claim.subClaims.map((sc, index) => {
            const scConfig = statusConfigs[sc.status] || statusConfigs.investigating;

            return (
              <div
                key={sc.id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900 leading-snug">
                      {sc.text}
                    </p>
                    {sc.notes && (
                      <p className="text-xs text-slate-500 italic">
                        {sc.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <select
                    value={sc.status}
                    onChange={(e) =>
                      handleUpdateSubClaimStatus(sc.id, e.target.value as ClaimStatus)
                    }
                    className={`text-xs font-medium px-2.5 py-1 rounded-md border cursor-pointer ${scConfig.bg} ${scConfig.text} ${scConfig.border}`}
                  >
                    {Object.entries(statusConfigs).map(([key, cfg]) => (
                      <option key={key} value={key} className="bg-white text-slate-800">
                        {cfg.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleRemoveSubClaim(sc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    title="Remove sub-claim"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {claim.subClaims.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
              <p className="text-xs text-slate-500">
                No sub-claims added yet. Add atomic sub-propositions or click "AI Decompose".
              </p>
            </div>
          )}
        </div>

        {/* Add Sub-Claim Form */}
        <form onSubmit={handleAddSubClaim} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add a new testable sub-claim proposition..."
            value={newSubClaimText}
            onChange={(e) => setNewSubClaimText(e.target.value)}
            className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Sub-Claim
          </button>
        </form>
      </div>

      {/* Hypothesis & Epistemic Notes */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Investigator's Working Hypothesis & Prior Knowledge
        </h2>
        <textarea
          value={claim.hypothesisNotes}
          onChange={(e) =>
            onUpdateClaim({
              ...claim,
              hypothesisNotes: e.target.value,
              updatedAt: new Date().toISOString(),
            })
          }
          rows={4}
          placeholder="Document initial hypotheses, potential confirmation bias risks, and key boundary conditions to investigate..."
          className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
        />
      </div>
    </div>
  );
};
