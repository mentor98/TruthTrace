/**
 * TruthTrace: Structured Research Report Generator & Export Tab
 */

import React, { useState, useMemo } from 'react';
import {
  Claim,
  Source,
  EvidencePassage,
  ResearchReport,
  EpistemicVerdict
} from '../types';
import {
  evaluateEvidenceDistribution,
  compileReportMarkdown,
  generateCitations
} from '../utils/research';
import {
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  BookOpen,
  Edit3
} from 'lucide-react';
import { AiAdvisoryBadge, AiDisclaimerBanner } from './AiAdvisoryBadge';

interface ReportGeneratorTabProps {
  claim: Claim;
  sources: Source[];
  evidenceList: EvidencePassage[];
  reports: ResearchReport[];
  onSaveReport: (report: ResearchReport) => void;
  onRunAiReportDraft: (verdict: EpistemicVerdict, bounds: string) => Promise<void>;
  isAiLoading: boolean;
}

export const ReportGeneratorTab: React.FC<ReportGeneratorTabProps> = ({
  claim,
  sources,
  evidenceList,
  reports,
  onSaveReport,
  onRunAiReportDraft,
  isAiLoading,
}) => {
  const [copiedBibliography, setCopiedBibliography] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // Auto calculate distribution and recommended verdict
  const evaluation = useMemo(
    () => evaluateEvidenceDistribution(evidenceList),
    [evidenceList]
  );

  const activeReport = reports.find((r) => r.claimId === claim.id) || reports[0];

  const [customExecutiveSummary, setCustomExecutiveSummary] = useState(
    activeReport?.executiveSummary ||
      'This empirical synthesis evaluates the validity of the investigated claim against peer-reviewed literature and verifiable datasets.'
  );
  const [customLimitations, setCustomLimitations] = useState(
    activeReport?.limitationsStatement ||
      'Evidence collection reflects published literature captured up to the current date. Potential publication bias towards positive outcomes and differences in experimental versus observational designs must be considered.'
  );

  const verdictConfigs: Record<
    EpistemicVerdict,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    STRONG_EVIDENTIARY_SUPPORT: {
      label: 'Strong Evidentiary Support (Affirmed)',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-300',
      icon: CheckCircle2,
    },
    MODERATE_MIXED_SUPPORT: {
      label: 'Moderate / Qualified Support',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-300',
      icon: CheckCircle2,
    },
    CONTESTED_EVIDENCE: {
      label: 'Contested & Actively Disputed Evidence',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-300',
      icon: Scale,
    },
    STRONG_COUNTER_EVIDENCE: {
      label: 'Strong Counter-Evidence (Refuted)',
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      border: 'border-rose-300',
      icon: XCircle,
    },
    INSUFFICIENT_EVIDENCE: {
      label: 'Insufficient Empirical Evidence',
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-300',
      icon: AlertTriangle,
    },
  };

  const currentVerdict = activeReport?.epistemicVerdict || evaluation.recommendedVerdict;
  const currentVerdictConfig = verdictConfigs[currentVerdict] || verdictConfigs.INSUFFICIENT_EVIDENCE;
  const VerdictIcon = currentVerdictConfig.icon;

  const citations = useMemo(() => sources.map((s) => generateCitations(s)), [sources]);

  const compiledMarkdown = useMemo(
    () =>
      compileReportMarkdown(
        claim,
        sources,
        evidenceList,
        currentVerdict,
        activeReport?.verdictRationale || evaluation.verdictRationale,
        activeReport?.confidenceBounds || evaluation.confidenceBounds,
        customLimitations,
        customExecutiveSummary
      ),
    [
      claim,
      sources,
      evidenceList,
      currentVerdict,
      activeReport,
      evaluation,
      customLimitations,
      customExecutiveSummary,
    ]
  );

  const handleDownloadMarkdown = () => {
    const blob = new Blob([compiledMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TruthTrace-Report-${claim.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const reportData = {
      claim,
      sources,
      evidence: evidenceList,
      evaluation,
      citations,
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        tool: 'TruthTrace Open Source Epistemological Analyzer',
      },
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TruthTrace-Investigation-${claim.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyBibliography = () => {
    const bibText = citations.map((c, i) => `${i + 1}. ${c.citationApa}`).join('\n\n');
    navigator.clipboard.writeText(bibText);
    setCopiedBibliography(true);
    setTimeout(() => setCopiedBibliography(false), 2000);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(compiledMarkdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar (No-Print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Structured Research Report</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Publication Ready
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Export standardized research syntheses with empirical breakdown, APA/Chicago citations, and epistemic boundaries.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onRunAiReportDraft(currentVerdict, evaluation.confidenceBounds)}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 text-xs font-medium rounded-md transition-colors shadow-xs cursor-pointer"
            title="Use Gemini AI to draft executive summary and key findings"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiLoading ? 'Drafting...' : 'AI Report Draft'}</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium rounded-md transition-colors border border-slate-200 cursor-pointer"
            title="Copy entire report in Markdown format"
          >
            {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Markdown</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium rounded-md transition-colors border border-slate-200 cursor-pointer"
            title="Download report as .md file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium rounded-md transition-colors border border-slate-200 cursor-pointer"
            title="Download full dataset as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium rounded-md transition-colors shadow-xs cursor-pointer"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Rendered Scholarly Report Document */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>TRUTHTRACE RESEARCH SYNTHESIS</span>
            <span>DATE: {new Date().toISOString().split('T')[0]}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {claim.title}
          </h1>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold mb-1">
              Investigated Falsifiable Proposition
            </span>
            <p className="text-slate-900 text-base italic leading-relaxed">
              "{claim.statement}"
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
            <span><strong>Domain:</strong> {claim.domain}</span>
            <span><strong>Audited Sources:</strong> {sources.length}</span>
            <span><strong>Extracted Passages:</strong> {evidenceList.length}</span>
            <span><strong>Priority:</strong> {claim.priority.toUpperCase()}</span>
          </div>
        </div>

        {/* Epistemic Verdict Box */}
        <div className={`p-5 rounded-xl border ${currentVerdictConfig.bg} ${currentVerdictConfig.border} space-y-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <VerdictIcon className={`w-5 h-5 ${currentVerdictConfig.text}`} />
              <span className={`text-sm font-bold uppercase tracking-wide ${currentVerdictConfig.text}`}>
                Epistemic Assessment: {currentVerdictConfig.label}
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-slate-700">
              {evaluation.confidenceBounds}
            </span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed">
            {activeReport?.verdictRationale || evaluation.verdictRationale}
          </p>
        </div>

        {/* Evidence Matrix Breakdown */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 pb-1 border-b border-slate-100">
            1. Evidentiary Distribution Matrix
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-2xl font-bold text-emerald-800">
                {evaluation.breakdown.supportingCount}
              </span>
              <span className="block text-[11px] font-medium text-emerald-900 mt-0.5">
                Supporting Passages
              </span>
            </div>

            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
              <span className="text-2xl font-bold text-rose-800">
                {evaluation.breakdown.opposingCount}
              </span>
              <span className="block text-[11px] font-medium text-rose-900 mt-0.5">
                Contradicting / Refuting
              </span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-2xl font-bold text-amber-800">
                {evaluation.breakdown.qualifyingCount}
              </span>
              <span className="block text-[11px] font-medium text-amber-900 mt-0.5">
                Qualifying / Nuanced
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
              <span className="text-2xl font-bold text-slate-800">
                {sources.filter((s) => s.sourceType === 'peer_reviewed_journal').length}
              </span>
              <span className="block text-[11px] font-medium text-slate-700 mt-0.5">
                Peer-Reviewed Studies
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              2. Executive Summary
            </h2>
            {activeReport?.aiDrafted && (
              <AiAdvisoryBadge label="AI Drafted Summary" size="sm" />
            )}
          </div>
          <textarea
            value={customExecutiveSummary}
            onChange={(e) => setCustomExecutiveSummary(e.target.value)}
            rows={4}
            className="w-full text-xs sm:text-sm leading-relaxed text-slate-800 bg-slate-50/50 p-3.5 rounded-lg border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
        </div>

        {/* Sub-claims Decomposition */}
        {claim.subClaims.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 pb-1 border-b border-slate-100">
              3. Sub-Claims Decomposition
            </h2>
            <div className="space-y-2">
              {claim.subClaims.map((sc, i) => (
                <div
                  key={sc.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{sc.text}</p>
                    {sc.notes && <p className="text-slate-500 italic mt-0.5">{sc.notes}</p>}
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                    {sc.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Extracted Findings */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 pb-1 border-b border-slate-100">
            4. Key Extracted Evidence Passages
          </h2>
          <div className="space-y-3">
            {evidenceList.map((ev) => {
              const src = sources.find((s) => s.id === ev.sourceId);
              return (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      [{ev.stance}] · {ev.strength} Rigor
                    </span>
                    <span className="text-slate-500 italic">
                      {src ? src.publication : 'Source'} ({src?.publicationDate?.substring(0, 4) || 'n.d.'})
                    </span>
                  </div>
                  <blockquote className="italic text-xs sm:text-sm text-slate-900 leading-relaxed pl-3 border-l-2 border-slate-400">
                    "{ev.quote}"
                  </blockquote>
                  <p className="text-[11px] text-slate-500">
                    <strong>Rationale:</strong> {ev.strengthRationale}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Methodological Limitations */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">
            5. Epistemic Limitations & Potential Biases
          </h2>
          <textarea
            value={customLimitations}
            onChange={(e) => setCustomLimitations(e.target.value)}
            rows={3}
            className="w-full text-xs leading-relaxed text-slate-800 bg-slate-50/50 p-3.5 rounded-lg border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-800"
          />
        </div>

        {/* Bibliography Section */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              6. Systematic Source Bibliography (APA 7th)
            </h2>
            <button
              onClick={handleCopyBibliography}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium no-print cursor-pointer"
            >
              {copiedBibliography ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy References</span>
            </button>
          </div>

          <div className="space-y-2 text-xs leading-relaxed text-slate-800 pl-4 border-l-2 border-slate-200">
            {citations.map((c, i) => (
              <p key={c.sourceId} className="pl-2">
                <span className="font-sans font-bold mr-1">{i + 1}.</span>
                {c.citationApa}
              </p>
            ))}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 space-y-1 font-sans">
          <p>
            <strong>Epistemological Disclaimer:</strong> TruthTrace is an open-source investigative tool for organizing and evaluating evidence. Generative AI assistance serves solely as a hypothesis formulation aid and does not substitute for independent peer review, empirical replication, or primary source audit.
          </p>
        </div>
      </div>
    </div>
  );
};
