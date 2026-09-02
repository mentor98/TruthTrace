/**
 * TruthTrace Server: Express API + Vite Middleware + Server-side Gemini AI
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

/**
 * 1. AI Extract Claims: Extracts testable factual claims from raw text
 */
app.post('/api/ai/extract-claims', async (req, res) => {
  try {
    const { text, context } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the environment or secrets panel.',
      });
    }

    const systemInstruction = `You are TruthTrace Epistemology Assistant, an expert research assistant for claim analysis.
Extract testable, falsifiable factual claims from the provided text.
Break down complex assertions into atomic propositions.
For each claim, identify the domain, suggested priority, and a brief epistemic rationale.
CRITICAL MANDATE: Mark all outputs as draft hypotheses. Never present AI findings as verified truth.`;

    const prompt = `Context: ${context || 'General Research'}
Analyze the following text and extract candidate factual claims:
"""
${text.substring(0, 12000)}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            claims: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Short descriptive title for the claim' },
                  statement: { type: Type.STRING, description: 'Precise, falsifiable factual proposition' },
                  domain: { type: Type.STRING, description: 'Academic or practical domain (e.g. Biomedicine, Energy, Economics)' },
                  priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                  suggestedSubClaims: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Atomic decomposed sub-propositions'
                  },
                  rationale: { type: Type.STRING, description: 'Why this claim is significant and testable' }
                },
                required: ['title', 'statement', 'domain', 'priority', 'suggestedSubClaims', 'rationale']
              }
            },
            epistemicDisclaimer: { type: Type.STRING, description: 'Disclaimer acknowledging this is an AI draft requiring human validation' }
          },
          required: ['claims', 'epistemicDisclaimer']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/extract-claims:', error);
    return res.status(500).json({ error: error.message || 'Failed to extract claims with AI' });
  }
});

/**
 * 2. AI Extract Evidence Passages: Finds verbatim quotes and assesses stance/strength
 */
app.post('/api/ai/extract-passages', async (req, res) => {
  try {
    const { claimStatement, sourceTitle, sourceText, subClaims } = req.body;
    if (!claimStatement || !sourceText) {
      return res.status(400).json({ error: 'Claim statement and source text are required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY in the environment or secrets panel.',
      });
    }

    const systemInstruction = `You are TruthTrace Evidence Extraction Engine.
Analyze the provided source text in relation to the specified claim.
Identify direct, verbatim quotations that either SUPPORT, CONTRADICT, QUALIFY, or provide NEUTRAL context to the claim.
Assign an empirical strength rating (HIGH, MODERATE, WEAK, FLAWED) based on study methodology, sample size, or investigative rigor.
CRITICAL: Never alter or fabricate quotes. They must be exact passages from the source text.
All outputs are AI-suggested classifications requiring human researcher confirmation.`;

    const prompt = `Claim: "${claimStatement}"
${subClaims && subClaims.length > 0 ? `Sub-claims:\n${subClaims.map((s: string, i: number) => `${i+1}. ${s}`).join('\n')}` : ''}
Source Title: "${sourceTitle || 'Attached Source'}"

Source Text:
"""
${sourceText.substring(0, 15000)}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  quote: { type: Type.STRING, description: 'Exact verbatim excerpt from the source text' },
                  pageOrSection: { type: Type.STRING, description: 'Section or paragraph location if evident' },
                  stance: { type: Type.STRING, enum: ['SUPPORTING', 'CONTRADICTING', 'QUALIFYING', 'NEUTRAL'] },
                  strength: { type: Type.STRING, enum: ['HIGH', 'MODERATE', 'WEAK', 'FLAWED'] },
                  strengthRationale: { type: Type.STRING, description: 'Methodological justification for the assigned strength' },
                  studyType: { type: Type.STRING, description: 'e.g. Randomized Clinical Trial, Observational, Meta-analysis, Opinion' },
                  sampleSizeOrData: { type: Type.STRING, description: 'Sample size or key empirical parameters' },
                  aiConfidenceScore: { type: Type.NUMBER, description: 'Confidence in stance classification (0-100)' },
                  matchedSubClaimIndex: { type: Type.NUMBER, description: '0-based index of matched subclaim if applicable, or -1' }
                },
                required: ['quote', 'stance', 'strength', 'strengthRationale', 'aiConfidenceScore']
              }
            },
            sourceMethodologySummary: { type: Type.STRING, description: 'Brief summary of the source paper/article design' },
            epistemicAdvisory: { type: Type.STRING, description: 'Advisory disclaimer on AI evidence extraction' }
          },
          required: ['passages', 'epistemicAdvisory']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/extract-passages:', error);
    return res.status(500).json({ error: error.message || 'Failed to extract evidence passages with AI' });
  }
});

/**
 * 3. AI Compare Sources: Multi-source comparative synthesis
 */
app.post('/api/ai/compare-sources', async (req, res) => {
  try {
    const { claimStatement, sources } = req.body;
    if (!claimStatement || !sources || !Array.isArray(sources) || sources.length < 2) {
      return res.status(400).json({ error: 'Claim statement and at least 2 sources are required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured.',
      });
    }

    const systemInstruction = `You are TruthTrace Multi-Source Comparative Synthesizer.
Compare the perspectives, methodologies, empirical datasets, and conclusions of the provided sources regarding the given claim.
Identify:
1. Points of consensus (where sources agree).
2. Points of divergence or direct contradiction.
3. Methodological trade-offs (sample sizes, in vitro vs in vivo, model assumptions).
4. Potential bias or conflict of interest risks.
5. Epistemic blind spots / unanswered questions.
Label all outputs as advisory synthesis.`;

    const sourcesFormatted = sources.map((s: any, idx: number) => `
Source [${idx + 1}]: "${s.title}"
Authors: ${s.authors?.join(', ') || 'N/A'} | Publication: ${s.publication} (${s.publicationDate || 'n.d.'})
Type: ${s.sourceType} | Trust Tier: ${s.credibility?.overallTrustTier || 'N/A'}
Excerpt/Summary:
${(s.rawContent || s.notes || '').substring(0, 3000)}
`).join('\n---\n');

    const prompt = `Claim: "${claimStatement}"

Sources to Compare:
${sourcesFormatted}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synthesisTitle: { type: Type.STRING },
            consensusPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            divergencePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            methodologyComparison: { type: Type.STRING },
            biasAndFundingObservations: { type: Type.ARRAY, items: { type: Type.STRING } },
            epistemicGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['synthesisTitle', 'consensusPoints', 'divergencePoints', 'methodologyComparison', 'epistemicGaps']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/compare-sources:', error);
    return res.status(500).json({ error: error.message || 'Failed to compare sources' });
  }
});

/**
 * 4. AI Fact-Check & Epistemic Audit Advisory
 */
app.post('/api/ai/audit-advisory', async (req, res) => {
  try {
    const { claim, sources, evidence } = req.body;
    if (!claim) {
      return res.status(400).json({ error: 'Claim data is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const systemInstruction = `You are TruthTrace Epistemological Auditor.
Evaluate the overall research ledger for bias, blind spots, single-point-of-failure sources, and unbalanced evidence collection.
Provide actionable suggestions on what counter-evidence or alternative research designs to look for.
Maintain strict neutrality and explicit advisory labeling.`;

    const prompt = `Claim: "${claim.statement}"
Domain: ${claim.domain}
Current Status: ${claim.status}
Sources (${sources?.length || 0} attached):
${(sources || []).map((s: any) => `- [${s.sourceType}] ${s.title} (${s.credibility?.overallTrustTier})`).join('\n')}

Evidence Ledger (${evidence?.length || 0} passages):
${(evidence || []).map((e: any) => `- [${e.stance} | ${e.strength}] "${e.quote.substring(0, 100)}..."`).join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confirmationBiasRisk: { type: Type.STRING, enum: ['LOW', 'MODERATE', 'HIGH'] },
            biasRationale: { type: Type.STRING },
            unexploredCounterHypotheses: { type: Type.ARRAY, items: { type: Type.STRING } },
            sourceDiversityScore: { type: Type.NUMBER, description: 'Score 0-100 based on source variety' },
            methodologicalCritiques: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedSearchQueries: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['confirmationBiasRisk', 'biasRationale', 'unexploredCounterHypotheses', 'sourceDiversityScore', 'methodologicalCritiques', 'recommendedSearchQueries']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/audit-advisory:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate epistemic audit advisory' });
  }
});

/**
 * 5. AI Generate Structured Report Section Drafts
 */
app.post('/api/ai/generate-report-draft', async (req, res) => {
  try {
    const { claim, sources, evidence, verdict, confidenceBounds } = req.body;
    if (!claim) {
      return res.status(400).json({ error: 'Claim data is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const systemInstruction = `You are TruthTrace Report Synthesis Specialist.
Draft a scholarly, impartial executive summary, key findings list, and limitations statement for an empirical claim investigation.
Strictly adhere to the evidence provided; do not invent citations. Clearly delineate known empirical consensus from contested areas.`;

    const prompt = `Claim: "${claim.statement}" (${claim.domain})
Computed Verdict: ${verdict}
Confidence Bounds: ${confidenceBounds}
Sources count: ${sources?.length || 0}
Evidence count: ${evidence?.length || 0}
Key Evidence summary:
${(evidence || []).map((e: any) => `[${e.stance} - ${e.strength}]: ${e.quote}`).join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            claimDecompositionSummary: { type: Type.STRING },
            verdictRationale: { type: Type.STRING },
            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            limitationsStatement: { type: Type.STRING }
          },
          required: ['executiveSummary', 'claimDecompositionSummary', 'verdictRationale', 'keyFindings', 'limitationsStatement']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/generate-report-draft:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate report draft' });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TruthTrace server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
