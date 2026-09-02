/**
 * TruthTrace: Type Definitions
 * Epistemological Source & Claim Analysis
 */

export type ClaimStatus = 
  | 'investigating'
  | 'strongly_supported'
  | 'mixed_contested'
  | 'refuted'
  | 'inconclusive';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type SourceType = 
  | 'peer_reviewed_journal'
  | 'academic_preprint'
  | 'government_report'
  | 'news_outlet'
  | 'investigative_journalism'
  | 'opinion_editorial'
  | 'think_tank'
  | 'primary_archive'
  | 'social_media_blog';

export type TrustTier = 
  | 'Tier 1 (High Reliability)'
  | 'Tier 2 (Moderate Reliability)'
  | 'Tier 3 (Contextual/Variable)'
  | 'Tier 4 (Low/Speculative)';

export type EvidenceStance = 
  | 'SUPPORTING'
  | 'CONTRADICTING'
  | 'QUALIFYING'
  | 'NEUTRAL';

export type EvidenceStrength = 
  | 'HIGH'
  | 'MODERATE'
  | 'WEAK'
  | 'FLAWED';

export type EpistemicVerdict = 
  | 'STRONG_EVIDENTIARY_SUPPORT'
  | 'MODERATE_MIXED_SUPPORT'
  | 'CONTESTED_EVIDENCE'
  | 'STRONG_COUNTER_EVIDENCE'
  | 'INSUFFICIENT_EVIDENCE';

export interface SubClaim {
  id: string;
  claimId: string;
  text: string;
  status: ClaimStatus;
  notes?: string;
}

export interface Claim {
  id: string;
  title: string;
  statement: string;
  context?: string;
  domain: string;
  tags: string[];
  status: ClaimStatus;
  confidenceRating: number; // 0 - 100%
  priority: PriorityLevel;
  subClaims: SubClaim[];
  hypothesisNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceCredibility {
  peerReviewed: boolean;
  editorialOversight: boolean;
  fundingTransparency: string;
  declaredConflicts: string;
  biasOrientation: string;
  methodologyOverview?: string;
  overallTrustTier: TrustTier;
}

export interface Source {
  id: string;
  claimId: string;
  title: string;
  authors: string[];
  publication: string;
  publicationDate: string;
  url: string;
  doiOrIsbn?: string;
  sourceType: SourceType;
  credibility: SourceCredibility;
  rawContent?: string;
  notes?: string;
  addedAt: string;
}

export interface EvidencePassage {
  id: string;
  claimId: string;
  subClaimId?: string;
  sourceId: string;
  quote: string;
  pageOrSection?: string;
  stance: EvidenceStance;
  strength: EvidenceStrength;
  strengthRationale: string;
  methodologyDetails?: {
    sampleSize?: string;
    studyType?: string;
    keyLimitations?: string;
  };
  userNotes?: string;
  aiGenerated: boolean;
  aiConfidenceScore?: number;
  aiRationale?: string;
  verifiedByUser: boolean;
  createdAt: string;
}

export interface SourceComparison {
  id: string;
  claimId: string;
  sourceIds: string[];
  synthesisTitle?: string;
  consensusPoints: string[];
  divergencePoints: string[];
  methodologyComparison?: string;
  epistemicGaps?: string[];
  aiAssisted?: boolean;
  aiGenerated?: boolean;
  userEditedNotes?: string;
  createdAt: string;
}

export interface CitationItem {
  sourceId: string;
  citationApa: string;
  citationChicago: string;
  citationBibtex: string;
}

export interface ResearchReport {
  id: string;
  claimId: string;
  title?: string;
  executiveSummary: string;
  claimDecompositionSummary?: string;
  evidenceBreakdown?: {
    supportingCount: number;
    opposingCount: number;
    qualifyingCount: number;
    neutralCount: number;
    highStrengthCount: number;
    moderateStrengthCount: number;
    weakStrengthCount: number;
    flawedCount: number;
  };
  epistemicVerdict: EpistemicVerdict;
  verdictRationale: string;
  confidenceBounds: string;
  keyFindings: string[];
  bibliography?: CitationItem[];
  limitationsStatement: string;
  generatedAt: string;
  aiDrafted: boolean;
  markdownContent?: string;
}

export type HistoryActionType = 
  | 'CLAIM_CREATED'
  | 'CLAIM_UPDATED'
  | 'SOURCE_ADDED'
  | 'SOURCE_REMOVED'
  | 'EVIDENCE_EXTRACTED'
  | 'EVIDENCE_VERIFIED'
  | 'STANCE_MODIFIED'
  | 'AI_ANALYSIS_RUN'
  | 'REPORT_GENERATED';

export interface HistoryEvent {
  id: string;
  timestamp: string;
  actionType: HistoryActionType;
  description: string;
  targetId?: string;
}

export type ActiveTab =
  | 'claim'
  | 'sources'
  | 'evidence'
  | 'graph'
  | 'comparison'
  | 'report'
  | 'history';

export interface InvestigationProject {
  id: string;
  title?: string;
  description?: string;
  claim: Claim;
  sources: Source[];
  evidence: EvidencePassage[];
  comparisons: SourceComparison[];
  reports: ResearchReport[];
  history?: HistoryEvent[];
  createdAt?: string;
  updatedAt?: string;
}

export type Investigation = InvestigationProject;

export interface PrivacySettings {
  allowAiAnalysis: boolean;
  anonymizeQuotes: boolean;
  localStorageOnly: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'claim' | 'subclaim' | 'evidence' | 'source';
  stance?: EvidenceStance;
  strength?: EvidenceStrength;
  sourceType?: SourceType;
  details?: string;
  entityId: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  stance?: EvidenceStance;
  strength?: EvidenceStrength;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
