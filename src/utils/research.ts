/**
 * TruthTrace Research & Epistemological Utilities
 */

import {
  Claim,
  Source,
  EvidencePassage,
  CitationItem,
  ResearchReport,
  EpistemicVerdict,
  TrustTier,
  GraphData,
  GraphNode,
  GraphLink
} from '../types';

/**
 * Generate standardized citation strings across multiple academic formats
 */
export function generateCitations(source: Source): CitationItem {
  const formatAuthorApa = (a: string) => {
    const clean = a.trim();
    if (clean.includes(',')) {
      return clean;
    }
    const parts = clean.split(/\s+/);
    if (parts.length > 1) {
      const lastName = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map(p => `${p[0]}.`).join(' ');
      return `${lastName}, ${initials}`;
    }
    return clean;
  };

  const authorStrApa = source.authors.length > 0
    ? source.authors.length === 1
      ? formatAuthorApa(source.authors[0])
      : source.authors.slice(0, -1).map(formatAuthorApa).join(', ') + ', & ' + formatAuthorApa(source.authors[source.authors.length - 1])
    : 'Unknown Author';

  const authorStrChicago = source.authors.length > 0
    ? source.authors.length === 1
      ? source.authors[0]
      : source.authors.slice(0, -1).join(', ') + ', and ' + source.authors[source.authors.length - 1]
    : 'Unknown Author';

  const year = source.publicationDate
    ? new Date(source.publicationDate).getFullYear() || source.publicationDate.substring(0, 4)
    : 'n.d.';

  const urlPart = source.url ? ` ${source.url}` : '';
  const doiPart = source.doiOrIsbn ? ` https://doi.org/${source.doiOrIsbn}` : '';

  // APA 7th Edition
  const citationApa = `${authorStrApa} (${year}). ${source.title}. *${source.publication}*.${doiPart || urlPart}`;

  // Chicago 17th Edition
  const citationChicago = `${authorStrChicago}. "${source.title}." *${source.publication}* (${year}).${doiPart || urlPart}`;

  // BibTeX
  const bibtexKey = `${(source.authors[0] || 'source').replace(/[^a-zA-Z]/g, '').toLowerCase()}${year}`;
  const citationBibtex = `@article{${bibtexKey},
  author = {${source.authors.join(' and ')}},
  title = {${source.title}},
  journal = {${source.publication}},
  year = {${year}},
  url = {${source.url || ''}}
}`;

  return {
    sourceId: source.id,
    citationApa,
    citationChicago,
    citationBibtex,
  };
}

/**
 * Calculate Trust Tier from credibility checklist
 */
export function calculateTrustTier(
  sourceType: Source['sourceType'],
  cred: Source['credibility']
): TrustTier {
  if (sourceType === 'peer_reviewed_journal' && cred.peerReviewed && cred.editorialOversight) {
    return 'Tier 1 (High Reliability)';
  }
  if (sourceType === 'academic_preprint' || sourceType === 'government_report' || sourceType === 'investigative_journalism') {
    if (cred.editorialOversight) {
      return 'Tier 2 (Moderate Reliability)';
    }
  }
  if (sourceType === 'news_outlet' || sourceType === 'think_tank' || sourceType === 'primary_archive') {
    return 'Tier 3 (Contextual/Variable)';
  }
  return 'Tier 4 (Low/Speculative)';
}

/**
 * Calculate evidence breakdown metrics and automated epistemic evaluation
 */
export function evaluateEvidenceDistribution(evidenceList: EvidencePassage[]): {
  breakdown: ResearchReport['evidenceBreakdown'];
  recommendedVerdict: EpistemicVerdict;
  verdictRationale: string;
  confidenceBounds: string;
} {
  const breakdown: ResearchReport['evidenceBreakdown'] = {
    supportingCount: 0,
    opposingCount: 0,
    qualifyingCount: 0,
    neutralCount: 0,
    highStrengthCount: 0,
    moderateStrengthCount: 0,
    weakStrengthCount: 0,
    flawedCount: 0,
  };

  let weightedSupportScore = 0;
  let weightedOpposeScore = 0;

  const strengthWeight = {
    HIGH: 3,
    MODERATE: 2,
    WEAK: 1,
    FLAWED: 0,
  };

  evidenceList.forEach((ev) => {
    // Stance counts
    if (ev.stance === 'SUPPORTING') {
      breakdown.supportingCount += 1;
      weightedSupportScore += strengthWeight[ev.strength];
    } else if (ev.stance === 'CONTRADICTING') {
      breakdown.opposingCount += 1;
      weightedOpposeScore += strengthWeight[ev.strength];
    } else if (ev.stance === 'QUALIFYING') {
      breakdown.qualifyingCount += 1;
      weightedSupportScore += strengthWeight[ev.strength] * 0.5;
    } else {
      breakdown.neutralCount += 1;
    }

    // Strength counts
    if (ev.strength === 'HIGH') breakdown.highStrengthCount += 1;
    else if (ev.strength === 'MODERATE') breakdown.moderateStrengthCount += 1;
    else if (ev.strength === 'WEAK') breakdown.weakStrengthCount += 1;
    else if (ev.strength === 'FLAWED') breakdown.flawedCount += 1;
  });

  const totalEvaluated = breakdown.supportingCount + breakdown.opposingCount + breakdown.qualifyingCount;

  let recommendedVerdict: EpistemicVerdict = 'INSUFFICIENT_EVIDENCE';
  let verdictRationale = 'Insufficient evidence extracted to reach an empirical verdict.';
  let confidenceBounds = 'Low Confidence (N < 2 sources)';

  if (totalEvaluated === 0) {
    return { breakdown, recommendedVerdict, verdictRationale, confidenceBounds };
  }

  const highQualityCount = breakdown.highStrengthCount + breakdown.moderateStrengthCount;

  if (weightedSupportScore > 0 && weightedOpposeScore === 0) {
    if (highQualityCount >= 2 && breakdown.highStrengthCount >= 1) {
      recommendedVerdict = 'STRONG_EVIDENTIARY_SUPPORT';
      verdictRationale = `Robust empirical support documented across ${breakdown.supportingCount} independent findings with high methodological rigor.`;
      confidenceBounds = 'High Confidence (85%–95% empirical agreement)';
    } else {
      recommendedVerdict = 'MODERATE_MIXED_SUPPORT';
      verdictRationale = `Favorable evidence trend observed, though limited by sample size or methodological tiers.`;
      confidenceBounds = 'Moderate Confidence (60%–75%)';
    }
  } else if (weightedOpposeScore > 0 && weightedSupportScore === 0) {
    if (highQualityCount >= 2) {
      recommendedVerdict = 'STRONG_COUNTER_EVIDENCE';
      verdictRationale = `Strong counter-evidence refutes the core proposition across verified studies.`;
      confidenceBounds = 'High Confidence (80%–95% counter-validation)';
    } else {
      recommendedVerdict = 'CONTESTED_EVIDENCE';
      verdictRationale = `Early counter-evidence identified, requiring further corroboration.`;
      confidenceBounds = 'Moderate Confidence (55%–70%)';
    }
  } else if (weightedSupportScore > 0 && weightedOpposeScore > 0) {
    const ratio = weightedSupportScore / (weightedSupportScore + weightedOpposeScore);
    if (ratio >= 0.7) {
      recommendedVerdict = 'MODERATE_MIXED_SUPPORT';
      verdictRationale = `Predominantly supporting evidence with notable dissenting or qualifying perspectives.`;
      confidenceBounds = 'Moderate Confidence with Disputed Boundary Conditions';
    } else if (ratio <= 0.3) {
      recommendedVerdict = 'STRONG_COUNTER_EVIDENCE';
      verdictRationale = `Substantial refuting evidence outweighs supporting documentation.`;
      confidenceBounds = 'Moderate-High Confidence Refutation';
    } else {
      recommendedVerdict = 'CONTESTED_EVIDENCE';
      verdictRationale = `Active scientific or investigative controversy. Studies present conflicting methodologies and divergent outcomes.`;
      confidenceBounds = 'Contested / Split Consensus (40%–60% equilibrium)';
    }
  }

  return {
    breakdown,
    recommendedVerdict,
    verdictRationale,
    confidenceBounds,
  };
}

/**
 * Generate Structured Research Report Markdown
 */
export function compileReportMarkdown(
  claim: Claim,
  sources: Source[],
  evidenceList: EvidencePassage[],
  verdict: EpistemicVerdict,
  verdictRationale: string,
  confidenceBounds: string,
  limitationsStatement: string,
  executiveSummary: string
): string {
  const citations = sources.map(s => generateCitations(s));
  const { breakdown } = evaluateEvidenceDistribution(evidenceList);

  const supportingPassages = evidenceList.filter(e => e.stance === 'SUPPORTING');
  const contradictingPassages = evidenceList.filter(e => e.stance === 'CONTRADICTING');
  const qualifyingPassages = evidenceList.filter(e => e.stance === 'QUALIFYING');

  const verdictLabelMap: Record<EpistemicVerdict, string> = {
    STRONG_EVIDENTIARY_SUPPORT: 'Strong Evidentiary Support (Affirmed)',
    MODERATE_MIXED_SUPPORT: 'Moderate / Qualified Support',
    CONTESTED_EVIDENCE: 'Contested & Actively Disputed Evidence',
    STRONG_COUNTER_EVIDENCE: 'Strong Counter-Evidence (Refuted)',
    INSUFFICIENT_EVIDENCE: 'Insufficient Empirical Evidence',
  };

  return `# TruthTrace Research Report
**Investigation Topic**: ${claim.title}
**Claim Statement**: "${claim.statement}"
**Investigation Domain**: ${claim.domain} | **Status**: ${claim.status.replace('_', ' ').toUpperCase()}
**Report Generated**: ${new Date().toISOString().split('T')[0]}

---

## 1. Executive Summary
${executiveSummary || 'This report evaluates the empirical validity of the investigated claim by decomposing supporting and counter-evidence across verified sources.'}

## 2. Epistemic Assessment & Verdict
- **Verdict**: **${verdictLabelMap[verdict]}**
- **Confidence Range**: ${confidenceBounds}
- **Assessment Rationale**: ${verdictRationale}

### Evidence Distribution Matrix
| Category | Count | Weighted Rigor |
| :--- | :--- | :--- |
| **Supporting Passages** | ${breakdown.supportingCount} | High: ${evidenceList.filter(e => e.stance === 'SUPPORTING' && e.strength === 'HIGH').length}, Mod: ${evidenceList.filter(e => e.stance === 'SUPPORTING' && e.strength === 'MODERATE').length} |
| **Contradicting / Refuting** | ${breakdown.opposingCount} | High: ${evidenceList.filter(e => e.stance === 'CONTRADICTING' && e.strength === 'HIGH').length}, Mod: ${evidenceList.filter(e => e.stance === 'CONTRADICTING' && e.strength === 'MODERATE').length} |
| **Qualifying / Contextual** | ${breakdown.qualifyingCount} | Moderate/High: ${evidenceList.filter(e => e.stance === 'QUALIFYING' && (e.strength === 'HIGH' || e.strength === 'MODERATE')).length} |
| **Total Sources Audited** | ${sources.length} | Peer-Reviewed: ${sources.filter(s => s.sourceType === 'peer_reviewed_journal').length} |

---

## 3. Sub-Claims Decomposition
${claim.subClaims.map((sc, i) => `${i + 1}. **[${sc.status.toUpperCase()}]** ${sc.text}`).join('\n') || '*No sub-claims defined.*'}

---

## 4. Key Evidence Passages

### A. Supporting Findings
${supportingPassages.length > 0 
  ? supportingPassages.map((ev, i) => {
      const src = sources.find(s => s.id === ev.sourceId);
      return `> "${ev.quote}"\n> — **${src ? src.publication : 'Source'}** (${src?.publicationDate?.substring(0, 4) || 'n.d.'}) | *Strength: ${ev.strength}*\n> *Rationale:* ${ev.strengthRationale}\n`;
    }).join('\n')
  : '*No supporting passages recorded.*'
}

### B. Contradicting & Counter-Evidence
${contradictingPassages.length > 0
  ? contradictingPassages.map((ev, i) => {
      const src = sources.find(s => s.id === ev.sourceId);
      return `> "${ev.quote}"\n> — **${src ? src.publication : 'Source'}** (${src?.publicationDate?.substring(0, 4) || 'n.d.'}) | *Strength: ${ev.strength}*\n> *Rationale:* ${ev.strengthRationale}\n`;
    }).join('\n')
  : '*No counter-evidence passages recorded.*'
}

### C. Qualifying & Contextual Nuance
${qualifyingPassages.length > 0
  ? qualifyingPassages.map((ev, i) => {
      const src = sources.find(s => s.id === ev.sourceId);
      return `> "${ev.quote}"\n> — **${src ? src.publication : 'Source'}** (${src?.publicationDate?.substring(0, 4) || 'n.d.'}) | *Strength: ${ev.strength}*\n> *Condition:* ${ev.strengthRationale}\n`;
    }).join('\n')
  : '*No qualifying passages recorded.*'
}

---

## 5. Methodological Limitations & Epistemic Boundaries
${limitationsStatement || 'Evidence collection reflects published literature captured up to the current date. Potential publication bias towards positive outcomes and variation in methodology across observational vs experimental designs must be taken into account.'}

---

## 6. Source Bibliography (Standardized Citations)

### APA 7th Edition
${citations.map((c, i) => `${i + 1}. ${c.citationApa}`).join('\n\n')}

### Chicago 17th Edition
${citations.map((c, i) => `${i + 1}. ${c.citationChicago}`).join('\n\n')}

---
*Notice: TruthTrace is an open-source epistemological analysis tool. AI-assisted extractions serve solely as investigative hypotheses and do not substitute for human peer review and independent empirical validation.*
`;
}

/**
 * Transform Investigation Data into Claim-Evidence Graph representation
 */
export function buildGraphData(
  claim: Claim,
  sources: Source[],
  evidenceList: EvidencePassage[]
): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Central Claim Node
  const claimNodeId = `claim-${claim.id}`;
  nodes.push({
    id: claimNodeId,
    label: claim.title || claim.statement,
    type: 'claim',
    details: claim.statement,
    entityId: claim.id,
  });

  // Subclaim Nodes
  claim.subClaims.forEach((sc) => {
    const scNodeId = `subclaim-${sc.id}`;
    nodes.push({
      id: scNodeId,
      label: sc.text,
      type: 'subclaim',
      details: `Status: ${sc.status}`,
      entityId: sc.id,
    });
    links.push({
      source: claimNodeId,
      target: scNodeId,
      label: 'decomposes into',
    });
  });

  // Source Nodes
  const sourceNodeMap = new Map<string, string>();
  sources.forEach((src) => {
    const srcNodeId = `source-${src.id}`;
    sourceNodeMap.set(src.id, srcNodeId);
    nodes.push({
      id: srcNodeId,
      label: src.publication || src.title,
      type: 'source',
      sourceType: src.sourceType,
      details: `${src.title} (${src.publicationDate?.substring(0, 4) || 'n.d.'})`,
      entityId: src.id,
    });
  });

  // Evidence Nodes & Links
  evidenceList.forEach((ev) => {
    const evNodeId = `evidence-${ev.id}`;
    nodes.push({
      id: evNodeId,
      label: ev.quote.length > 55 ? `${ev.quote.substring(0, 55)}...` : ev.quote,
      type: 'evidence',
      stance: ev.stance,
      strength: ev.strength,
      details: ev.quote,
      entityId: ev.id,
    });

    // Link Evidence to Claim or Subclaim
    if (ev.subClaimId) {
      const targetScNode = `subclaim-${ev.subClaimId}`;
      links.push({
        source: evNodeId,
        target: targetScNode,
        stance: ev.stance,
        strength: ev.strength,
        label: ev.stance,
      });
    } else {
      links.push({
        source: evNodeId,
        target: claimNodeId,
        stance: ev.stance,
        strength: ev.strength,
        label: ev.stance,
      });
    }

    // Link Source to Evidence
    const srcNodeId = sourceNodeMap.get(ev.sourceId);
    if (srcNodeId) {
      links.push({
        source: srcNodeId,
        target: evNodeId,
        label: 'extracts',
      });
    }
  });

  return { nodes, links };
}
