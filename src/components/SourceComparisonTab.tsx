/**
 * TruthTrace: Multi-Source Comparison Matrix & Comparative Synthesis Tab
 */

import React, { useState } from 'react';
import {
  Source,
  Claim,
  EvidencePassage,
  SourceComparison
} from '../types';
import {
  Sparkles,
  Columns,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ExternalLink,
  Shield,
  HelpCircle,
  Edit3
} from 'lucide-react';
import { AiAdvisoryBadge, AiDisclaimerBanner } from './AiAdvisoryBadge';

interface SourceComparisonTabProps {
  claim: Claim;
  sources: Source[];
  evidenceList: EvidencePassage[];
  comparisons: SourceComparison[];
  onSaveComparison: (comp: SourceComparison) => void;
  onRunAiComparison: (selectedSources: Source[]) => Promise<void>;
  isAiLoading: boolean;
}

export const SourceComparisonTab: React.FC<SourceComparisonTabProps> = ({
  claim,
  sources,
  evidenceList,
  comparisons,
  onSaveComparison,
  onRunAiComparison,
  isAiLoading,
}) => {
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(
    sources.slice(0, 3).map((s) => s.id)
  );

  const toggleSourceSelection = (id: string) => {
    if (selectedSourceIds.includes(id)) {
      if (selectedSourceIds.length > 2) {
        setSelectedSourceIds(selectedSourceIds.filter((sId) => sId !== id));
      }
    } else {
      if (selectedSourceIds.length < 4) {
        setSelectedSourceIds([...selectedSourceIds, id]);
      }
    }
  };

  const selectedSources = sources.filter((s) => selectedSourceIds.includes(s.id));
  const activeComparison = comparisons.find((c) => c.claimId === claim.id) || comparisons[0];

  return (
    <div className="space-y-6">
      {/* Header & Comparison Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Multi-Source Comparative Matrix</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {selectedSources.length} selected for comparison
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit methodological divergence, sample sizes, and institutional biases across competing literature.
          </p>
        </div>

        <button
          onClick={() => onRunAiComparison(selectedSources)}
          disabled={isAiLoading || selectedSources.length < 2}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 text-xs font-medium rounded-md transition-colors shadow-xs shrink-0 cursor-pointer"
          title="Synthesize points of consensus and divergence across selected sources"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAiLoading ? 'Synthesizing...' : 'AI Comparative Synthesis'}</span>
        </button>
      </div>

      {/* Source Selector Chips */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
        <span className="text-xs font-semibold text-slate-700 block">
          Select 2 to 4 sources to compare side-by-side:
        </span>
        <div className="flex flex-wrap gap-2">
          {sources.map((src) => {
            const isChecked = selectedSourceIds.includes(src.id);
            return (
              <button
                key={src.id}
                onClick={() => toggleSourceSelection(src.id)}
                className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isChecked
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    src.credibility.overallTrustTier.includes('Tier 1')
                      ? 'bg-emerald-400'
                      : src.credibility.overallTrustTier.includes('Tier 2')
                      ? 'bg-blue-400'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="truncate max-w-[200px]">{src.publication}: {src.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200">
              <th className="p-3.5 font-bold text-slate-700 w-44 sticky left-0 bg-slate-100/90 backdrop-blur-xs">
                Comparison Dimension
              </th>
              {selectedSources.map((src) => (
                <th key={src.id} className="p-3.5 font-bold text-slate-900 min-w-[240px]">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">
                      {src.publication} ({src.publicationDate?.substring(0, 4) || 'n.d.'})
                    </span>
                    <span className="text-sm font-bold line-clamp-2">
                      {src.title}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Row: Source Type & Tier */}
            <tr>
              <td className="p-3.5 font-semibold text-slate-600 bg-slate-50/50 sticky left-0">
                Source Type & Trust Tier
              </td>
              {selectedSources.map((src) => (
                <td key={src.id} className="p-3.5">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700 border border-slate-200">
                      {src.credibility.overallTrustTier}
                    </span>
                    <span className="text-slate-500 text-[11px] block capitalize">
                      {src.sourceType.replace(/_/g, ' ')}
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row: Peer Review & Editorial Oversight */}
            <tr>
              <td className="p-3.5 font-semibold text-slate-600 bg-slate-50/50 sticky left-0">
                Peer Review & Oversight
              </td>
              {selectedSources.map((src) => (
                <td key={src.id} className="p-3.5 text-slate-800">
                  <div className="flex items-center gap-1.5 font-medium">
                    {src.credibility.peerReviewed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>
                      {src.credibility.peerReviewed ? 'Peer-Reviewed' : 'Non-refereed'}
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row: Funding Source & Conflicts */}
            <tr>
              <td className="p-3.5 font-semibold text-slate-600 bg-slate-50/50 sticky left-0">
                Funding Transparency & Conflicts
              </td>
              {selectedSources.map((src) => (
                <td key={src.id} className="p-3.5 text-slate-700 leading-relaxed">
                  <div className="space-y-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Funding</span>
                      <span className="text-[11px] font-medium">{src.credibility.fundingTransparency || 'Undisclosed'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Declared Conflicts</span>
                      <span className="text-[11px] text-slate-600">{src.credibility.declaredConflicts || 'None'}</span>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row: Methodological Approach */}
            <tr>
              <td className="p-3.5 font-semibold text-slate-600 bg-slate-50/50 sticky left-0">
                Methodology & Study Design
              </td>
              {selectedSources.map((src) => (
                <td key={src.id} className="p-3.5 text-slate-700 leading-relaxed text-[11px]">
                  {src.credibility.methodologyOverview || 'Standard empirical analysis / literature evaluation.'}
                </td>
              ))}
            </tr>

            {/* Row: Extracted Evidence Passages */}
            <tr>
              <td className="p-3.5 font-semibold text-slate-600 bg-slate-50/50 sticky left-0">
                Primary Extracted Findings
              </td>
              {selectedSources.map((src) => {
                const srcEvidence = evidenceList.filter((e) => e.sourceId === src.id);
                return (
                  <td key={src.id} className="p-3.5 space-y-2">
                    {srcEvidence.map((ev) => (
                      <div
                        key={ev.id}
                        className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                          ev.stance === 'SUPPORTING'
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            : ev.stance === 'CONTRADICTING'
                            ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                            : 'bg-amber-50/60 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className="font-sans font-bold text-[10px] mb-1 uppercase tracking-wider">
                          [{ev.stance}] · {ev.strength} Rigor
                        </div>
                        "{ev.quote.substring(0, 140)}..."
                      </div>
                    ))}
                    {srcEvidence.length === 0 && (
                      <span className="text-slate-400 italic text-[11px]">
                        No passages extracted yet.
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* AI Comparative Synthesis Section */}
      {activeComparison && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AiAdvisoryBadge label="AI Comparative Synthesis" size="md" />
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(activeComparison.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {activeComparison.synthesisTitle || 'Multi-Perspective Synthesis'}
              </h3>
            </div>
          </div>

          <AiDisclaimerBanner
            title="Comparative Epistemology Notice"
            description="Synthesis points below highlight areas of agreement and divergence identified across the selected literature. These are analytical summaries to assist human evaluation."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Consensus Points */}
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Points of Empirical Consensus
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-950/90 leading-relaxed">
                {activeComparison.consensusPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divergence Points */}
            <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-600" />
                Points of Divergence & Disputed Findings
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-950/90 leading-relaxed">
                {activeComparison.divergencePoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Methodology Comparison */}
          {activeComparison.methodologyComparison && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Methodological Trade-Offs & Contrast
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeComparison.methodologyComparison}
              </p>
            </div>
          )}

          {/* Epistemic Gaps */}
          {activeComparison.epistemicGaps?.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                Unresolved Questions & Epistemic Gaps
              </h4>
              <ul className="space-y-1 text-xs text-slate-700 leading-relaxed">
                {activeComparison.epistemicGaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold">?</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
