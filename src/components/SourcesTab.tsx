/**
 * TruthTrace: Sources Management & Interactive Passage Reader Tab
 */

import React, { useState } from 'react';
import {
  Source,
  SourceType,
  TrustTier,
  EvidencePassage,
  EvidenceStance,
  EvidenceStrength
} from '../types';
import {
  Plus,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Trash2,
  Quote,
  Copy,
  Check,
  Shield,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { generateCitations, calculateTrustTier } from '../utils/research';
import { AiAdvisoryBadge } from './AiAdvisoryBadge';

interface SourcesTabProps {
  sources: Source[];
  claimStatement: string;
  onAddSource: (newSource: Source) => void;
  onRemoveSource: (sourceId: string) => void;
  onExtractEvidence: (passage: Omit<EvidencePassage, 'id' | 'createdAt'>) => void;
  onRunAiExtractPassages: (source: Source) => Promise<void>;
  isAiLoading: boolean;
}

export const SourcesTab: React.FC<SourcesTabProps> = ({
  sources,
  claimStatement,
  onAddSource,
  onRemoveSource,
  onExtractEvidence,
  onRunAiExtractPassages,
  isAiLoading,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>(sources[0]?.id || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);

  // Text selection highlight state for interactive extraction
  const [selectedText, setSelectedText] = useState('');
  const [showExtractPopover, setShowExtractPopover] = useState(false);
  const [quickStance, setQuickStance] = useState<EvidenceStance>('SUPPORTING');
  const [quickStrength, setQuickStrength] = useState<EvidenceStrength>('HIGH');
  const [quickRationale, setQuickRationale] = useState('');

  // New Source Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAuthors, setFormAuthors] = useState('');
  const [formPublication, setFormPublication] = useState('');
  const [formPubDate, setFormPubDate] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDoi, setFormDoi] = useState('');
  const [formType, setFormType] = useState<SourceType>('peer_reviewed_journal');
  const [formPeerReviewed, setFormPeerReviewed] = useState(true);
  const [formEditorialOversight, setFormEditorialOversight] = useState(true);
  const [formFunding, setFormFunding] = useState('');
  const [formConflicts, setFormConflicts] = useState('');
  const [formBias, setFormBias] = useState('Academic / Empirical');
  const [formContent, setFormContent] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const activeSource = sources.find((s) => s.id === selectedSourceId) || sources[0];

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 10) {
      setSelectedText(selection.toString().trim());
      setShowExtractPopover(true);
    }
  };

  const handleSaveExtractedQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedText || !activeSource) return;

    onExtractEvidence({
      claimId: activeSource.claimId,
      sourceId: activeSource.id,
      quote: selectedText,
      stance: quickStance,
      strength: quickStrength,
      strengthRationale: quickRationale || `Manual extraction from ${activeSource.publication}`,
      verifiedByUser: true,
      aiGenerated: false,
    });

    setShowExtractPopover(false);
    setSelectedText('');
    setQuickRationale('');
  };

  const handleCreateSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPublication.trim()) return;

    const cred = {
      peerReviewed: formPeerReviewed,
      editorialOversight: formEditorialOversight,
      fundingTransparency: formFunding.trim() || 'Undisclosed',
      declaredConflicts: formConflicts.trim() || 'None declared',
      biasOrientation: formBias.trim() || 'General',
      overallTrustTier: 'Tier 1 (High Reliability)' as TrustTier,
    };
    cred.overallTrustTier = calculateTrustTier(formType, cred);

    const newSrc: Source = {
      id: `src-${Date.now()}`,
      claimId: activeSource?.claimId || 'claim-current',
      title: formTitle.trim(),
      authors: formAuthors.split(',').map((a) => a.trim()).filter(Boolean),
      publication: formPublication.trim(),
      publicationDate: formPubDate || new Date().toISOString().split('T')[0],
      url: formUrl.trim(),
      doiOrIsbn: formDoi.trim(),
      sourceType: formType,
      credibility: cred,
      rawContent: formContent.trim(),
      notes: formNotes.trim(),
      addedAt: new Date().toISOString(),
    };

    onAddSource(newSrc);
    setSelectedSourceId(newSrc.id);
    setIsAddModalOpen(false);

    // Reset Form
    setFormTitle('');
    setFormAuthors('');
    setFormPublication('');
    setFormPubDate('');
    setFormUrl('');
    setFormDoi('');
    setFormContent('');
    setFormNotes('');
  };

  const copyCitation = (src: Source, format: 'apa' | 'chicago') => {
    const citations = generateCitations(src);
    const text = format === 'apa' ? citations.citationApa : citations.citationChicago;
    navigator.clipboard.writeText(text);
    setCopiedCitationId(src.id);
    setTimeout(() => setCopiedCitationId(null), 2000);
  };

  const sourceTypeLabels: Record<SourceType, string> = {
    peer_reviewed_journal: 'Peer-Reviewed Journal',
    academic_preprint: 'Academic Preprint (e.g. arXiv, bioRxiv)',
    government_report: 'Government / Institutional Report',
    news_outlet: 'Established News Agency',
    investigative_journalism: 'Investigative Journalism',
    opinion_editorial: 'Opinion / Editorial',
    think_tank: 'Think Tank / Policy Institute',
    primary_archive: 'Primary Historical Archive',
    social_media_blog: 'Social Media / Independent Blog',
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Sources Repository & Raw Text Ingestion</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {sources.length} attached
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Attach primary literature, evaluate institutional credibility, and extract verbatim quoted evidence.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Attach New Source
        </button>
      </div>

      {/* Sources List + Reader Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Source Cards */}
        <div className="lg:col-span-5 space-y-3">
          {sources.map((src) => {
            const isSelected = src.id === (activeSource?.id || selectedSourceId);
            const tierColor =
              src.credibility.overallTrustTier.includes('Tier 1')
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : src.credibility.overallTrustTier.includes('Tier 2')
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : src.credibility.overallTrustTier.includes('Tier 3')
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={src.id}
                onClick={() => setSelectedSourceId(src.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-600/10'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${tierColor}`}>
                    {src.credibility.overallTrustTier}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {src.publicationDate || 'n.d.'}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                  {src.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {src.authors.length > 0 ? src.authors.join(', ') : 'Unknown Author'} —{' '}
                  <span className="italic font-medium">{src.publication}</span>
                </p>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-500">
                    {sourceTypeLabels[src.sourceType] || src.sourceType}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCitation(src, 'apa');
                      }}
                      className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                      title="Copy APA 7th Citation"
                    >
                      {copiedCitationId === src.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      APA
                    </button>

                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title="Open external source URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {sources.length === 0 && (
            <div className="text-center py-10 bg-white border border-slate-200 rounded-xl p-4">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">No sources attached yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Attach papers, government reports, or articles to extract evidence.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Source Reader & Text Inspector */}
        <div className="lg:col-span-7">
          {activeSource ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full">
              {/* Reader Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 rounded-t-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {sourceTypeLabels[activeSource.sourceType]}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {activeSource.publication}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeSource.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onRunAiExtractPassages(activeSource)}
                    disabled={isAiLoading || !activeSource.rawContent}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 text-xs font-medium rounded-md transition-colors shadow-xs cursor-pointer"
                    title="Use Gemini AI to scan this text for passages supporting or contradicting the claim"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAiLoading ? 'Analyzing...' : 'AI Extract Passages'}</span>
                  </button>

                  <button
                    onClick={() => onRemoveSource(activeSource.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    title="Remove source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Credibility & Transparency Summary */}
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Peer Reviewed</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1">
                    {activeSource.credibility.peerReviewed ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                    )}
                    {activeSource.credibility.peerReviewed ? 'Yes (Refereed)' : 'Non-refereed'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Funding Source</span>
                  <span className="font-medium text-slate-800 truncate block" title={activeSource.credibility.fundingTransparency}>
                    {activeSource.credibility.fundingTransparency || 'Undisclosed'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Conflicts of Interest</span>
                  <span className="font-medium text-slate-800 truncate block" title={activeSource.credibility.declaredConflicts}>
                    {activeSource.credibility.declaredConflicts || 'None'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Trust Tier</span>
                  <span className="font-medium text-slate-900 font-mono text-[11px]">
                    {activeSource.credibility.overallTrustTier.split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Raw Text View with Selection Listener */}
              <div className="p-5 flex-1 relative">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Quote className="w-3.5 h-3.5 text-slate-400" />
                    Source Excerpt / Document Text
                  </span>
                  <span className="text-[11px] text-slate-400 italic">
                    💡 Tip: Highlight any sentence to extract it as verified evidence
                  </span>
                </div>

                {activeSource.rawContent ? (
                  <div
                    onMouseUp={handleSelection}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed text-sm max-h-[420px] overflow-y-auto select-text selection:bg-indigo-100 selection:text-indigo-900 font-sans"
                  >
                    {activeSource.rawContent}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg p-6 space-y-2">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-medium">
                      No raw text excerpt pasted for this source.
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Paste study abstracts or full article text in source settings to enable highlight-to-quote extraction.
                    </p>
                  </div>
                )}

                {/* Highlight Extraction Modal / Popover */}
                {showExtractPopover && (
                  <div className="mt-4 p-4 rounded-lg border border-indigo-200 bg-indigo-50/90 shadow-lg space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Quote className="w-3.5 h-3.5 text-indigo-600" />
                        Extract Highlighted Passage as Evidence
                      </span>
                      <button
                        onClick={() => setShowExtractPopover(false)}
                        className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs italic text-slate-800 bg-white p-2.5 rounded-md border border-indigo-200 max-h-24 overflow-y-auto">
                      "{selectedText}"
                    </p>

                    <form onSubmit={handleSaveExtractedQuote} className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] text-slate-600 font-medium mb-1">
                          Evidentiary Stance:
                        </label>
                        <select
                          value={quickStance}
                          onChange={(e) => setQuickStance(e.target.value as EvidenceStance)}
                          className="w-full text-xs p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"
                        >
                          <option value="SUPPORTING">Supporting</option>
                          <option value="CONTRADICTING">Contradicting / Refuting</option>
                          <option value="QUALIFYING">Qualifying / Contextual</option>
                          <option value="NEUTRAL">Neutral / Background</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-600 font-medium mb-1">
                          Evidence Strength:
                        </label>
                        <select
                          value={quickStrength}
                          onChange={(e) => setQuickStrength(e.target.value as EvidenceStrength)}
                          className="w-full text-xs p-1.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800"
                        >
                          <option value="HIGH">High (RCT, Empirical data)</option>
                          <option value="MODERATE">Moderate (Observational)</option>
                          <option value="WEAK">Weak (Anecdotal)</option>
                          <option value="FLAWED">Flawed / High Bias</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-600 font-medium mb-1">
                          Methodology / Strength Rationale:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Hardware-in-the-loop test with 120 disturbance runs..."
                          value={quickRationale}
                          onChange={(e) => setQuickRationale(e.target.value)}
                          className="w-full text-xs p-1.5 rounded-md border border-slate-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowExtractPopover(false)}
                          className="px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-200 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs shadow-xs cursor-pointer"
                        >
                          Confirm & Save to Evidence Ledger
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500">Select a source on the left to view document details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Attach New Source Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Attach New Research Source
                </h3>
                <p className="text-xs text-slate-500">
                  Provide bibliographic metadata and credibility parameters.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSourceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Document / Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grid-Forming Inverter Controls for High-Penetration Power Systems"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Authors (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B. Kroposki, A. Hoke, M. O’Malley"
                    value={formAuthors}
                    onChange={(e) => setFormAuthors(e.target.value)}
                    className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Publication / Journal / Outlet *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nature Energy, IEEE, NEJM, Reuters"
                    value={formPublication}
                    onChange={(e) => setFormPublication(e.target.value)}
                    className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={formPubDate}
                    onChange={(e) => setFormPubDate(e.target.value)}
                    className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Source Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as SourceType)}
                    className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  >
                    {Object.entries(sourceTypeLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    URL or DOI
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full p-2 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Credibility Checklist */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <span className="font-semibold text-slate-800 block text-xs">
                  Epistemological Credibility & Transparency Audit
                </span>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPeerReviewed}
                      onChange={(e) => setFormPeerReviewed(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700">Peer-Reviewed / Refereed Process</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEditorialOversight}
                      onChange={(e) => setFormEditorialOversight(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700">Formal Editorial Oversight</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">
                      Funding Transparency / Grants:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NIH grant, NSF, private corporate sponsor"
                      value={formFunding}
                      onChange={(e) => setFormFunding(e.target.value)}
                      className="w-full p-1.5 rounded-md border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">
                      Declared Conflicts of Interest:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Authors hold stock options, or None"
                      value={formConflicts}
                      onChange={(e) => setFormConflicts(e.target.value)}
                      className="w-full p-1.5 rounded-md border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Raw Excerpt Content */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Full Article Excerpt / Key Findings Text
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste study abstract, methods section, or key passages to enable interactive quote extraction..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans"
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
                  Save Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
