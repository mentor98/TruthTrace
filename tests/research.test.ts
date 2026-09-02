/**
 * TruthTrace Epistemological & Citation Logic Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateCitations,
  calculateTrustTier,
  evaluateEvidenceDistribution,
  buildGraphData,
  compileReportMarkdown
} from '../src/utils/research';
import { Source, EvidencePassage, Claim } from '../src/types';

describe('TruthTrace Research Utilities', () => {
  const mockSource: Source = {
    id: 'src-test-1',
    claimId: 'claim-test',
    title: 'Impact of Grid-Forming Inverters on Power Stability',
    authors: ['Kroposki, B.', 'Johnson, B.', 'Zhang, Y.'],
    publication: 'IEEE Transactions on Power Systems',
    publicationDate: '2023-04-15',
    url: 'https://doi.org/10.1109/TPWRS.2023.1234567',
    doiOrIsbn: '10.1109/TPWRS.2023.1234567',
    sourceType: 'peer_reviewed_journal',
    credibility: {
      peerReviewed: true,
      editorialOversight: true,
      fundingTransparency: 'National Science Foundation (NSF)',
      declaredConflicts: 'None declared',
      biasOrientation: 'Empirical Engineering',
      overallTrustTier: 'Tier 1 (High Reliability)',
    },
    rawContent: 'Sample excerpt text here...',
    addedAt: '2023-04-15T00:00:00Z',
  };

  const mockEvidence: EvidencePassage[] = [
    {
      id: 'ev-1',
      claimId: 'claim-test',
      sourceId: 'src-test-1',
      quote: 'Grid-forming inverters provide synthetic inertia equivalent to synchronous generators.',
      stance: 'SUPPORTING',
      strength: 'HIGH',
      strengthRationale: 'Hardware-in-the-loop experiment',
      verifiedByUser: true,
      aiGenerated: false,
      createdAt: '2023-04-15T00:00:00Z',
    },
    {
      id: 'ev-2',
      claimId: 'claim-test',
      sourceId: 'src-test-1',
      quote: 'Islanded operations require sub-second battery response reserves.',
      stance: 'QUALIFYING',
      strength: 'MODERATE',
      strengthRationale: 'Simulation model',
      verifiedByUser: true,
      aiGenerated: false,
      createdAt: '2023-04-15T00:00:00Z',
    },
  ];

  const mockClaim: Claim = {
    id: 'claim-test',
    title: 'Renewable Grids Can Maintain Frequency Stability',
    statement: 'Modern grid-forming inverter technology enables 100% renewable grids to remain stable without fossil spinning reserves.',
    domain: 'Energy Engineering',
    priority: 'high',
    confidenceRating: 85,
    status: 'strongly_supported',
    subClaims: [
      {
        id: 'sc-1',
        claimId: 'claim-test',
        text: 'Synthetic inertia from inverters matches rotational inertia.',
        status: 'strongly_supported',
      },
    ],
    hypothesisNotes: 'Test hypothesis notes',
    tags: ['Energy', 'Power'],
    createdAt: '2023-04-15T00:00:00Z',
    updatedAt: '2023-04-15T00:00:00Z',
  };

  describe('generateCitations', () => {
    it('formats correct APA 7th citation', () => {
      const citations = generateCitations(mockSource);
      expect(citations.citationApa).toContain('Kroposki, B., Johnson, B., & Zhang, Y.');
      expect(citations.citationApa).toContain('(2023)');
      expect(citations.citationApa).toContain('Impact of Grid-Forming Inverters on Power Stability');
      expect(citations.citationApa).toContain('IEEE Transactions on Power Systems');
    });

    it('formats correct Chicago 17th citation', () => {
      const citations = generateCitations(mockSource);
      expect(citations.citationChicago).toContain('Kroposki, B., Johnson, B., and Zhang, Y.');
      expect(citations.citationChicago).toContain('"Impact of Grid-Forming Inverters on Power Stability."');
    });
  });

  describe('calculateTrustTier', () => {
    it('assigns Tier 1 for peer-reviewed journal with oversight', () => {
      const tier = calculateTrustTier('peer_reviewed_journal', {
        peerReviewed: true,
        editorialOversight: true,
        fundingTransparency: 'Public grant',
        declaredConflicts: 'None',
        biasOrientation: 'Academic',
        overallTrustTier: 'Tier 1 (High Reliability)',
      });
      expect(tier).toBe('Tier 1 (High Reliability)');
    });

    it('assigns Tier 3 or 4 for social media / blogs', () => {
      const tier = calculateTrustTier('social_media_blog', {
        peerReviewed: false,
        editorialOversight: false,
        fundingTransparency: 'None',
        declaredConflicts: 'None',
        biasOrientation: 'Personal',
        overallTrustTier: 'Tier 4 (Low/Speculative)',
      });
      expect(tier).toBe('Tier 4 (Low/Speculative)');
    });
  });

  describe('evaluateEvidenceDistribution', () => {
    it('evaluates strong support when supporting passages outweigh opposing', () => {
      const result = evaluateEvidenceDistribution(mockEvidence);
      expect(result.breakdown.supportingCount).toBe(1);
      expect(result.breakdown.qualifyingCount).toBe(1);
      expect(result.recommendedVerdict).toBe('STRONG_EVIDENTIARY_SUPPORT');
    });

    it('evaluates insufficient evidence when evidence array is empty', () => {
      const result = evaluateEvidenceDistribution([]);
      expect(result.recommendedVerdict).toBe('INSUFFICIENT_EVIDENCE');
    });
  });

  describe('buildGraphData', () => {
    it('creates graph nodes and links for claims, subclaims, evidence, and sources', () => {
      const graph = buildGraphData(mockClaim, [mockSource], mockEvidence);
      expect(graph.nodes.some((n) => n.type === 'claim')).toBe(true);
      expect(graph.nodes.some((n) => n.type === 'subclaim')).toBe(true);
      expect(graph.nodes.some((n) => n.type === 'source')).toBe(true);
      expect(graph.nodes.some((n) => n.type === 'evidence')).toBe(true);
      expect(graph.links.length).toBeGreaterThan(0);
    });
  });

  describe('compileReportMarkdown', () => {
    it('generates structured markdown containing header, statement, matrix, and bibliography', () => {
      const md = compileReportMarkdown(
        mockClaim,
        [mockSource],
        mockEvidence,
        'STRONG_EVIDENTIARY_SUPPORT',
        'Empirical results confirm hypothesis.',
        'High [0.85 - 0.95]',
        'Literature bounds noted.',
        'Executive summary overview.'
      );

      expect(md).toContain('# TruthTrace Research Report');
      expect(md).toContain('## 2. Epistemic Assessment & Verdict');
      expect(md).toContain('### Evidence Distribution Matrix');
      expect(md).toContain('## 6. Source Bibliography (Standardized Citations)');
      expect(md).toContain('Kroposki, B.');
    });
  });
});
