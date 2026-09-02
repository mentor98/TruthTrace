/**
 * TruthTrace: Global Search & Investigation History Manager Tab
 */

import React, { useState, useMemo } from 'react';
import {
  Claim,
  Source,
  EvidencePassage,
  InvestigationProject
} from '../types';
import {
  Search,
  Clock,
  Plus,
  Trash2,
  FolderOpen,
  Download,
  Upload,
  ArrowRight,
  Quote,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SearchHistoryTabProps {
  projects: InvestigationProject[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateNewProject: (title: string, statement: string, domain: string) => void;
  onDeleteProject: (projectId: string) => void;
  onExportAllProjects: () => void;
  onImportProjects: (imported: InvestigationProject[]) => void;
}

export const SearchHistoryTab: React.FC<SearchHistoryTabProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateNewProject,
  onDeleteProject,
  onExportAllProjects,
  onImportProjects,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStatement, setNewStatement] = useState('');
  const [newDomain, setNewDomain] = useState('Public Policy');

  // Search across all projects, claims, sources, and evidence quotes
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return null;
    const q = searchQuery.toLowerCase();

    const results: Array<{
      projectId: string;
      projectTitle: string;
      matchType: 'claim' | 'source' | 'evidence' | 'subclaim';
      title: string;
      snippet: string;
      meta?: string;
    }> = [];

    projects.forEach((proj) => {
      // Check Claim
      if (
        proj.claim.title.toLowerCase().includes(q) ||
        proj.claim.statement.toLowerCase().includes(q) ||
        proj.claim.hypothesisNotes?.toLowerCase().includes(q)
      ) {
        results.push({
          projectId: proj.id,
          projectTitle: proj.title,
          matchType: 'claim',
          title: proj.claim.title,
          snippet: proj.claim.statement,
          meta: `Domain: ${proj.claim.domain} · Status: ${proj.claim.status}`,
        });
      }

      // Check Subclaims
      proj.claim.subClaims.forEach((sc) => {
        if (sc.text.toLowerCase().includes(q) || sc.notes?.toLowerCase().includes(q)) {
          results.push({
            projectId: proj.id,
            projectTitle: proj.title,
            matchType: 'subclaim',
            title: `Sub-claim: ${sc.text}`,
            snippet: sc.notes || proj.claim.statement,
            meta: `Status: ${sc.status}`,
          });
        }
      });

      // Check Sources
      proj.sources.forEach((src) => {
        if (
          src.title.toLowerCase().includes(q) ||
          src.publication.toLowerCase().includes(q) ||
          src.authors.some((a) => a.toLowerCase().includes(q)) ||
          src.rawContent.toLowerCase().includes(q)
        ) {
          results.push({
            projectId: proj.id,
            projectTitle: proj.title,
            matchType: 'source',
            title: src.title,
            snippet: `${src.publication} (${src.publicationDate}) — ${src.authors.join(', ')}`,
            meta: `Tier: ${src.credibility.overallTrustTier}`,
          });
        }
      });

      // Check Evidence Quotes
      proj.evidence.forEach((ev) => {
        if (
          ev.quote.toLowerCase().includes(q) ||
          ev.strengthRationale.toLowerCase().includes(q) ||
          ev.userNotes?.toLowerCase().includes(q)
        ) {
          results.push({
            projectId: proj.id,
            projectTitle: proj.title,
            matchType: 'evidence',
            title: `Evidence Quote [${ev.stance}]`,
            snippet: `"${ev.quote}"`,
            meta: `Rigor: ${ev.strength} · Rationale: ${ev.strengthRationale}`,
          });
        }
      });
    });

    return results;
  }, [projects, searchQuery]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStatement.trim()) return;
    onCreateNewProject(newTitle.trim(), newStatement.trim(), newDomain);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewStatement('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportProjects(parsed);
        } else if (parsed.claim && parsed.sources) {
          onImportProjects([parsed]);
        }
      } catch (err) {
        console.error('Failed to parse imported JSON', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Universal Search & Investigation Archive</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {projects.length} investigations
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Query across all propositions, verbatim quotes, academic papers, and stance assessments.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Investigation
            </button>

            <button
              onClick={onExportAllProjects}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
              title="Backup all investigations as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              Export Archive
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-xs font-medium border border-slate-200 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search keywords, authors, journals, verbatim quotes, or propositions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-slate-800 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* If Search Query is Active: Show Search Results */}
      {searchResults !== null ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span>Search Results for "{searchQuery}"</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {searchResults.length} matches
            </span>
          </h3>

          <div className="space-y-3">
            {searchResults.map((res, i) => (
              <div
                key={i}
                onClick={() => onSelectProject(res.projectId)}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-white transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {res.matchType}
                  </span>
                  <span className="text-slate-500 font-medium">
                    Investigation: {res.projectTitle}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                  {res.title}
                </h4>

                <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                  {res.snippet}
                </p>

                {res.meta && (
                  <p className="text-[11px] text-slate-500 font-mono pt-1">
                    {res.meta}
                  </p>
                )}
              </div>
            ))}

            {searchResults.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs">
                No matching claims, passages, or sources found for "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Otherwise: Show All Investigations History Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const supporting = proj.evidence.filter((e) => e.stance === 'SUPPORTING').length;
            const opposing = proj.evidence.filter((e) => e.stance === 'CONTRADICTING').length;

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'border-indigo-600 bg-white shadow-xs ring-1 ring-indigo-500/20'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                      {proj.claim.domain}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-600 italic line-clamp-2 mt-1.5">
                    "{proj.claim.statement}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                    <span>{proj.sources.length} sources</span>
                    <span>{proj.evidence.length} passages</span>
                    <span className="text-emerald-700">+{supporting}</span>
                    <span className="text-rose-700">−{opposing}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {projects.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(proj.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Delete investigation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-indigo-600 font-medium flex items-center gap-1">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Investigation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Initiate New Investigation Case
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Investigation Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microplastics in Cardiovascular Plaques"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Primary Falsifiable Proposition *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="State the central hypothesis in clear, testable, and falsifiable language..."
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Research Domain
                </label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Public Policy & Governance">Public Policy & Governance</option>
                  <option value="Biomedical & Clinical Science">Biomedical & Clinical Science</option>
                  <option value="Energy & Environmental Engineering">Energy & Environmental Engineering</option>
                  <option value="Macroeconomics & Labor Markets">Macroeconomics & Labor Markets</option>
                  <option value="Computer Science & AI Safety">Computer Science & AI Safety</option>
                  <option value="Cognitive & Behavioral Science">Cognitive & Behavioral Science</option>
                  <option value="Investigative Journalism">Investigative Journalism</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-md text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Create Investigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
