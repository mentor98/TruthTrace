/**
 * TruthTrace: Source & Claim Analysis Tool
 * Main Application Root & State Controller
 */

import React, { useState, useEffect } from 'react';
import {
  InvestigationProject,
  Claim,
  Source,
  EvidencePassage,
  SourceComparison,
  ResearchReport,
  ActiveTab,
  EpistemicVerdict
} from './types';
import { INITIAL_INVESTIGATION_PROJECTS } from './data/initialData';
import { Header } from './components/Header';
import { ClaimOverviewTab } from './components/ClaimOverviewTab';
import { SourcesTab } from './components/SourcesTab';
import { EvidenceLedgerTab } from './components/EvidenceLedgerTab';
import { GraphViewTab } from './components/GraphViewTab';
import { SourceComparisonTab } from './components/SourceComparisonTab';
import { ReportGeneratorTab } from './components/ReportGeneratorTab';
import { SearchHistoryTab } from './components/SearchHistoryTab';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'truthtrace_projects_v1';

export const App: React.FC = () => {
  // Load initial projects from localStorage or default seed data
  const [projects, setProjects] = useState<InvestigationProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return INITIAL_INVESTIGATION_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || 'proj-grid-stability-2024';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('claim');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Sync projects to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage', e);
    }
  }, [projects]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];

  // Helper to update active project sub-state
  const updateActiveProject = (updater: (prev: InvestigationProject) => InvestigationProject) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === activeProject.id) {
          const updated = updater(p);
          return { ...updated, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  // --- Handlers for Claim ---
  const handleUpdateClaim = (updatedClaim: Claim) => {
    updateActiveProject((proj) => ({
      ...proj,
      claim: updatedClaim,
    }));
  };

  // AI Claim Decomposition
  const handleRunAiDecomposition = async () => {
    setIsAiLoading(true);
    setAiStatusMessage('Decomposing proposition into atomic falsifiable sub-claims with Gemini...');
    try {
      const response = await fetch('/api/ai/extract-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: `${activeProject.claim.title}\n\n${activeProject.claim.statement}\n\n${activeProject.claim.hypothesisNotes}`,
          domain: activeProject.claim.domain,
        }),
      });

      if (!response.ok) throw new Error('AI decomposition request failed');
      const data = await response.json();

      if (data.claims && Array.isArray(data.claims)) {
        const generatedSubClaims = data.claims.map((c: any, index: number) => ({
          id: `subclaim-ai-${Date.now()}-${index}`,
          claimId: activeProject.claim.id,
          text: c.statement || c.title,
          status: 'investigating' as const,
          notes: c.rationale ? `AI suggested: ${c.rationale}` : undefined,
        }));

        updateActiveProject((proj) => ({
          ...proj,
          claim: {
            ...proj.claim,
            subClaims: [...proj.claim.subClaims, ...generatedSubClaims],
          },
        }));

        showToast(`AI generated ${generatedSubClaims.length} atomic sub-claims for verification.`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('AI decomposition failed. Check your connection or API key.', 'error');
    } finally {
      setIsAiLoading(false);
      setAiStatusMessage(null);
    }
  };

  // --- Handlers for Sources ---
  const handleAddSource = (newSource: Source) => {
    updateActiveProject((proj) => ({
      ...proj,
      sources: [newSource, ...proj.sources],
    }));
    showToast(`Source "${newSource.title.substring(0, 30)}..." attached.`);
  };

  const handleRemoveSource = (sourceId: string) => {
    updateActiveProject((proj) => ({
      ...proj,
      sources: proj.sources.filter((s) => s.id !== sourceId),
      evidence: proj.evidence.filter((e) => e.sourceId !== sourceId),
    }));
    showToast('Source and linked evidence removed.');
  };

  // AI Extract Passages from Source
  const handleRunAiExtractPassages = async (source: Source) => {
    if (!source.rawContent) return;
    setIsAiLoading(true);
    setAiStatusMessage(`Extracting empirical passages from ${source.publication}...`);
    try {
      const response = await fetch('/api/ai/extract-passages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceContent: source.rawContent,
          claimStatement: activeProject.claim.statement,
          sourceTitle: source.title,
          subClaims: activeProject.claim.subClaims,
        }),
      });

      if (!response.ok) throw new Error('AI passage extraction failed');
      const data = await response.json();

      if (data.passages && Array.isArray(data.passages)) {
        const newEvidence: EvidencePassage[] = data.passages.map((p: any, idx: number) => ({
          id: `ev-ai-${Date.now()}-${idx}`,
          claimId: activeProject.claim.id,
          sourceId: source.id,
          subClaimId: p.subClaimId || undefined,
          quote: p.quote,
          pageOrSection: p.pageOrSection || 'Extracted passage',
          stance: p.stance || 'SUPPORTING',
          strength: p.strength || 'MODERATE',
          strengthRationale: p.strengthRationale || 'AI automated passage identification',
          verifiedByUser: false,
          aiGenerated: true,
          aiConfidenceScore: p.confidenceScore || 0.85,
          createdAt: new Date().toISOString(),
        }));

        updateActiveProject((proj) => ({
          ...proj,
          evidence: [...newEvidence, ...proj.evidence],
        }));

        showToast(`Extracted ${newEvidence.length} candidate evidence quotes.`);
        setActiveTab('evidence');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Passage extraction failed.', 'error');
    } finally {
      setIsAiLoading(false);
      setAiStatusMessage(null);
    }
  };

  // --- Handlers for Evidence ---
  const handleExtractEvidence = (passage: Omit<EvidencePassage, 'id' | 'createdAt'>) => {
    const newPassage: EvidencePassage = {
      ...passage,
      id: `ev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateActiveProject((proj) => ({
      ...proj,
      evidence: [newPassage, ...proj.evidence],
    }));
    showToast('Evidence quote added to ledger.');
  };

  const handleUpdateEvidence = (updated: EvidencePassage) => {
    updateActiveProject((proj) => ({
      ...proj,
      evidence: proj.evidence.map((e) => (e.id === updated.id ? updated : e)),
    }));
  };

  const handleDeleteEvidence = (id: string) => {
    updateActiveProject((proj) => ({
      ...proj,
      evidence: proj.evidence.filter((e) => e.id !== id),
    }));
    showToast('Evidence passage removed.');
  };

  // --- Handlers for Comparison ---
  const handleSaveComparison = (comp: SourceComparison) => {
    updateActiveProject((proj) => ({
      ...proj,
      comparisons: [comp, ...proj.comparisons.filter((c) => c.id !== comp.id)],
    }));
  };

  const handleRunAiComparison = async (selectedSources: Source[]) => {
    setIsAiLoading(true);
    setAiStatusMessage('Synthesizing methodological divergence & consensus across sources...');
    try {
      const response = await fetch('/api/ai/compare-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimStatement: activeProject.claim.statement,
          sources: selectedSources,
          evidence: activeProject.evidence.filter((e) =>
            selectedSources.some((s) => s.id === e.sourceId)
          ),
        }),
      });

      if (!response.ok) throw new Error('AI comparison synthesis failed');
      const data = await response.json();

      const newComp: SourceComparison = {
        id: `comp-${Date.now()}`,
        claimId: activeProject.claim.id,
        sourceIds: selectedSources.map((s) => s.id),
        synthesisTitle: data.synthesisTitle || 'Multi-Source Empirical Synthesis',
        consensusPoints: data.consensusPoints || [],
        divergencePoints: data.divergencePoints || [],
        methodologyComparison: data.methodologyComparison || '',
        epistemicGaps: data.epistemicGaps || [],
        aiGenerated: true,
        createdAt: new Date().toISOString(),
      };

      handleSaveComparison(newComp);
      showToast('Comparative synthesis compiled.');
    } catch (err: any) {
      console.error(err);
      showToast('Source comparison failed.', 'error');
    } finally {
      setIsAiLoading(false);
      setAiStatusMessage(null);
    }
  };

  // --- Handlers for Reports ---
  const handleSaveReport = (report: ResearchReport) => {
    updateActiveProject((proj) => ({
      ...proj,
      reports: [report, ...proj.reports.filter((r) => r.id !== report.id)],
    }));
  };

  const handleRunAiReportDraft = async (
    verdict: EpistemicVerdict,
    bounds: string
  ) => {
    setIsAiLoading(true);
    setAiStatusMessage('Drafting research report executive summary and empirical findings with Gemini...');
    try {
      const response = await fetch('/api/ai/generate-report-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: activeProject.claim,
          sources: activeProject.sources,
          evidence: activeProject.evidence,
          recommendedVerdict: verdict,
          confidenceBounds: bounds,
        }),
      });

      if (!response.ok) throw new Error('AI report draft failed');
      const data = await response.json();

      const newReport: ResearchReport = {
        id: `report-${Date.now()}`,
        claimId: activeProject.claim.id,
        epistemicVerdict: data.epistemicVerdict || verdict,
        confidenceBounds: data.confidenceBounds || bounds,
        verdictRationale: data.verdictRationale || '',
        executiveSummary: data.executiveSummary || '',
        keyFindings: data.keyFindings || [],
        limitationsStatement: data.limitationsStatement || '',
        aiDrafted: true,
        generatedAt: new Date().toISOString(),
      };

      handleSaveReport(newReport);
      showToast('Research report draft generated.');
    } catch (err: any) {
      console.error(err);
      showToast('Report drafting failed.', 'error');
    } finally {
      setIsAiLoading(false);
      setAiStatusMessage(null);
    }
  };

  // --- Project Creation & History ---
  const handleCreateNewProject = (
    title: string,
    statement: string,
    domain: string
  ) => {
    const newId = `proj-${Date.now()}`;
    const newClaimId = `claim-${Date.now()}`;
    const newProj: InvestigationProject = {
      id: newId,
      title,
      description: `Investigating: ${statement.substring(0, 80)}...`,
      claim: {
        id: newClaimId,
        title,
        statement,
        domain,
        priority: 'high',
        confidenceRating: 50,
        status: 'investigating',
        subClaims: [],
        hypothesisNotes: 'Initial working hypothesis: Assess primary empirical publications.',
        tags: [domain.split(' ')[0]],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      sources: [],
      evidence: [],
      comparisons: [],
      reports: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects([newProj, ...projects]);
    setActiveProjectId(newId);
    setActiveTab('claim');
    showToast(`New investigation "${title}" initiated.`);
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) {
      showToast('Cannot delete the last remaining investigation.', 'error');
      return;
    }
    setProjects(projects.filter((p) => p.id !== projectId));
    if (activeProjectId === projectId) {
      const remaining = projects.filter((p) => p.id !== projectId);
      setActiveProjectId(remaining[0].id);
    }
    showToast('Investigation removed from workspace.');
  };

  const handleExportAllProjects = () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TruthTrace-Workspace-Backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Workspace backup exported.');
  };

  const handleImportProjects = (imported: InvestigationProject[]) => {
    if (imported.length === 0) return;
    setProjects([...imported, ...projects]);
    setActiveProjectId(imported[0].id);
    showToast(`Imported ${imported.length} investigation projects.`);
  };

  const handleClearLocalData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProjects(INITIAL_INVESTIGATION_PROJECTS);
    setActiveProjectId(INITIAL_INVESTIGATION_PROJECTS[0].id);
  };

  const handleResetToDemoData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INVESTIGATION_PROJECTS));
    setProjects(INITIAL_INVESTIGATION_PROJECTS);
    setActiveProjectId(INITIAL_INVESTIGATION_PROJECTS[0].id);
    showToast('Reset to peer-reviewed demo investigations.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading / Status Bar when AI is running */}
        {isAiLoading && (
          <div className="mb-6 p-3.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center justify-between shadow-xs animate-pulse">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-xs sm:text-sm font-medium">
                {aiStatusMessage || 'Gemini AI reasoning engine in progress...'}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded shrink-0 hidden sm:inline">
              AI Analyzing
            </span>
          </div>
        )}

        {/* Tab Switching */}
        {activeTab === 'claim' && (
          <ClaimOverviewTab
            claim={activeProject.claim}
            onUpdateClaim={handleUpdateClaim}
            onRunAiDecomposition={handleRunAiDecomposition}
            isAiLoading={isAiLoading}
          />
        )}

        {activeTab === 'sources' && (
          <SourcesTab
            sources={activeProject.sources}
            claimStatement={activeProject.claim.statement}
            onAddSource={handleAddSource}
            onRemoveSource={handleRemoveSource}
            onExtractEvidence={handleExtractEvidence}
            onRunAiExtractPassages={handleRunAiExtractPassages}
            isAiLoading={isAiLoading}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceLedgerTab
            claim={activeProject.claim}
            sources={activeProject.sources}
            evidenceList={activeProject.evidence}
            onUpdateEvidence={handleUpdateEvidence}
            onDeleteEvidence={handleDeleteEvidence}
            onAddManualEvidence={handleExtractEvidence}
          />
        )}

        {activeTab === 'graph' && (
          <GraphViewTab
            claim={activeProject.claim}
            sources={activeProject.sources}
            evidenceList={activeProject.evidence}
            onUpdateEvidence={handleUpdateEvidence}
          />
        )}

        {activeTab === 'comparison' && (
          <SourceComparisonTab
            claim={activeProject.claim}
            sources={activeProject.sources}
            evidenceList={activeProject.evidence}
            comparisons={activeProject.comparisons}
            onSaveComparison={handleSaveComparison}
            onRunAiComparison={handleRunAiComparison}
            isAiLoading={isAiLoading}
          />
        )}

        {activeTab === 'report' && (
          <ReportGeneratorTab
            claim={activeProject.claim}
            sources={activeProject.sources}
            evidenceList={activeProject.evidence}
            reports={activeProject.reports}
            onSaveReport={handleSaveReport}
            onRunAiReportDraft={handleRunAiReportDraft}
            isAiLoading={isAiLoading}
          />
        )}

        {activeTab === 'history' && (
          <SearchHistoryTab
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={(pId) => {
              setActiveProjectId(pId);
              setActiveTab('claim');
            }}
            onCreateNewProject={handleCreateNewProject}
            onDeleteProject={handleDeleteProject}
            onExportAllProjects={handleExportAllProjects}
            onImportProjects={handleImportProjects}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          {toastMessage.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          {toastMessage.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearLocalData={handleClearLocalData}
        onResetToDemoData={handleResetToDemoData}
      />
    </div>
  );
};

export default App;

