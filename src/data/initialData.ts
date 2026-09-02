/**
 * TruthTrace: Pre-loaded Demo Investigations
 * Rich, realistic epistemological datasets with verified sources, passages, and stance mappings
 */

import { Investigation } from '../types';

export const INITIAL_INVESTIGATIONS: Investigation[] = [
  {
    id: 'inv-renewable-grid',
    claim: {
      id: 'claim-grid-01',
      title: '100% Inverter-Based Renewable Grid Stability',
      statement: 'Modern electrical grids can maintain reliable voltage, frequency stability, and black-start capability under 100% variable renewable energy (wind and solar) without fossil-fuel baseload or synchronous peakers.',
      context: 'Energy transition debates center on whether synthetic inertia, grid-forming (GFM) inverters, and battery storage can replace synchronous physical inertia provided by heavy rotating turbines.',
      domain: 'Energy Systems & Applied Physics',
      tags: ['Grid Stability', 'Renewables', 'Synthetic Inertia', 'GFM Inverters', 'Power Systems'],
      status: 'mixed_contested',
      confidenceRating: 72,
      priority: 'high',
      hypothesisNotes: 'Grid-forming inverters with sub-cycle response times solve instantaneous rate-of-change-of-frequency (RoCoF) issues in simulation and microgrids, but multi-day dunkelflaute (low wind/solar) events still require massive chemical storage or long-duration thermal storage.',
      subClaims: [
        {
          id: 'subclaim-grid-1',
          claimId: 'claim-grid-01',
          text: 'Grid-forming (GFM) battery inverters can supply virtual synchronous inertia and primary frequency control faster than traditional mechanical governors.',
          status: 'strongly_supported',
          notes: 'Validated by NREL, AEMO South Australia trials, and IEEE tests.'
        },
        {
          id: 'subclaim-grid-2',
          claimId: 'claim-grid-01',
          text: 'Electrochemical lithium-ion storage is economically sufficient for seasonal multi-week dunkelflaute deficits.',
          status: 'refuted',
          notes: 'Storage costs scale linearly with duration, rendering 4-8 hr batteries inadequate for 14-day zero-wind events without hydrogen or nuclear.'
        },
        {
          id: 'subclaim-grid-3',
          claimId: 'claim-grid-01',
          text: 'Black-start restoration without synchronous diesel/gas generators is technically feasible using advanced GFM inverters.',
          status: 'mixed_contested',
          notes: 'Demonstrated in islanded microgrids (e.g., Hornsdale Power Reserve, Big Hill), but whole-interconnection cold restart remains unproven at continent scale.'
        }
      ],
      createdAt: '2026-08-15T09:00:00.000Z',
      updatedAt: '2026-08-28T14:30:00.000Z',
    },
    sources: [
      {
        id: 'src-nrel-2025',
        claimId: 'claim-grid-01',
        title: 'Grid-Forming Inverter Controls for High-Penetration Inverter-Based Resource Power Systems',
        authors: ['Benjamin Kroposki', 'Andy Hoke', 'Deepak Ramasubramanian', 'Mark O’Malley'],
        publication: 'IEEE Transactions on Power Systems & NREL Technical Report',
        publicationDate: '2025-03-12',
        url: 'https://doi.org/10.1109/TPWRS.2025.340192',
        doiOrIsbn: '10.1109/TPWRS.2025.340192',
        sourceType: 'peer_reviewed_journal',
        credibility: {
          peerReviewed: true,
          editorialOversight: true,
          fundingTransparency: 'Publicly funded by U.S. Department of Energy (DOE)',
          declaredConflicts: 'No commercial conflicts declared by national lab researchers',
          biasOrientation: 'Technical / Engineering Empirical',
          methodologyOverview: 'Hardware-in-the-loop (HIL) 10-megawatt dynamometer laboratory testing combined with empirical feeder data.',
          overallTrustTier: 'Tier 1 (High Reliability)'
        },
        rawContent: `Our tests demonstrate that grid-forming inverters (GFMIs) can react to frequency deviations within 8 to 16 milliseconds, compared to 500 to 2000 milliseconds for standard steam turbine governors. In an isolated 100% inverter-fed bus test, GFMIs successfully arrested RoCoF of 4.5 Hz/s and restored nominal 60Hz frequency without voltage collapse. However, high short-circuit current capability remains limited to 1.2-1.5x inverter rating versus 5-6x for synchronous machines, requiring redesign of overcurrent relay coordination schemes.`,
        notes: 'Landmark empirical reference on GFM inverter physical capabilities.',
        addedAt: '2026-08-16T10:15:00.000Z'
      },
      {
        id: 'src-nature-energy-2024',
        claimId: 'claim-grid-01',
        title: 'Geophysical constraints and long-duration storage economics for zero-carbon electricity grids',
        authors: ['Matthew Shaner', 'Steven J. Davis', 'Nathan S. Lewis', 'Ken Caldeira'],
        publication: 'Nature Energy',
        publicationDate: '2024-11-18',
        url: 'https://doi.org/10.1038/s41560-024-01642-w',
        doiOrIsbn: '10.1038/s41560-024-01642-w',
        sourceType: 'peer_reviewed_journal',
        credibility: {
          peerReviewed: true,
          editorialOversight: true,
          fundingTransparency: 'Academic peer review, NSF & Carnegie Institution for Science grants',
          declaredConflicts: 'None',
          biasOrientation: 'Academic Climatological / Energy Economics',
          methodologyOverview: 'Re-analysis of 42 years of hourly MERRA-2 solar/wind meteorological data across 36 countries.',
          overallTrustTier: 'Tier 1 (High Reliability)'
        },
        rawContent: `To achieve 100% reliability from wind and solar without dispatchable thermal generation or firm clean generation, a continent-scale grid requires between 200 and 400 hours of continuous storage capacity to survive cyclical decadal weather anomalies (Dunkelflaute). Current Li-ion battery costs ($120/kWh capital expenditure) make meeting the final 5-10% of demand cost-prohibitive, multiplying total levelized system electricity costs by a factor of 4.3x.`,
        notes: 'Crucial for subclaim 2 regarding seasonal storage constraints.',
        addedAt: '2026-08-17T11:20:00.000Z'
      },
      {
        id: 'src-aemo-2025',
        claimId: 'claim-grid-01',
        title: 'South Australia 100% Renewables Operational Real-Time Milestone Review',
        authors: ['Australian Energy Market Operator Engineering Operations Group'],
        publication: 'AEMO Operational Reports Series',
        publicationDate: '2025-06-04',
        url: 'https://aemo.com.au/reports/sa-100-percent-milestone-2025',
        sourceType: 'government_report',
        credibility: {
          peerReviewed: false,
          editorialOversight: true,
          fundingTransparency: 'Statutory government grid regulatory operator',
          declaredConflicts: 'System operator mandate with safety compliance accountability',
          biasOrientation: 'Operational & Empirical Grid Telemetry',
          methodologyOverview: 'Real-world supervisory control and data acquisition (SCADA) telemetry from 14-day continuous period where South Australia operated with >100% net renewable generation.',
          overallTrustTier: 'Tier 2 (Moderate Reliability)'
        },
        rawContent: `South Australia operated for 11 consecutive days with instantaneous wind and rooftop solar supplying 104% of state demand. Grid stability was maintained via four synchronous condensers operating alongside 450MW/700MWh of grid-forming battery energy storage systems (Hornsdale, Torrens Island, and Riverland). RoCoF remained below 0.25 Hz/s throughout three unexpected trip events of the Heywood interconnector.`,
        notes: 'Real-world proof that synchronized inverters + synchronous condensers maintain high reliability.',
        addedAt: '2026-08-18T14:40:00.000Z'
      },
      {
        id: 'src-fossil-institute-2024',
        claimId: 'claim-grid-01',
        title: 'The Inherent Fragility of Purely Inverter-Dominated Bulk Power Systems',
        authors: ['Arthur Vance', 'Evelyn Reed'],
        publication: 'Institute for Energy Reliability Policy Paper',
        publicationDate: '2024-09-02',
        url: 'https://energy-reliability-institute.org/reports/inverter-fragility',
        sourceType: 'think_tank',
        credibility: {
          peerReviewed: false,
          editorialOversight: false,
          fundingTransparency: 'Funded in part by thermal power plant operators and natural gas coalition',
          declaredConflicts: 'Funding ties to conventional thermal generation stakeholders',
          biasOrientation: 'Industry-Advocacy / Pro-Thermal Baseload',
          methodologyOverview: 'Literature review of grid disturbance event logs in Texas (ERCOT) and California (CAISO).',
          overallTrustTier: 'Tier 4 (Low/Speculative)'
        },
        rawContent: `Without mechanical rotating mass from gas turbines, the power grid loses fundamental thermodynamic damping. Software-defined inverters cannot replicate physical inertia during severe phase-angle jumps and are vulnerable to control interaction oscillations (sub-synchronous resonance). Any attempt to run a grid without minimum 30% rotating thermal baseload invites catastrophic cascading blackouts.`,
        notes: 'Think-tank paper with clear conflict of interest; contains rhetorical claims contradicted by recent GFM trials.',
        addedAt: '2026-08-19T16:00:00.000Z'
      }
    ],
    evidence: [
      {
        id: 'ev-grid-01',
        claimId: 'claim-grid-01',
        subClaimId: 'subclaim-grid-1',
        sourceId: 'src-nrel-2025',
        quote: 'GFMIs can react to frequency deviations within 8 to 16 milliseconds, compared to 500 to 2000 milliseconds for standard steam turbine governors. In an isolated 100% inverter-fed bus test, GFMIs successfully arrested RoCoF of 4.5 Hz/s and restored nominal 60Hz frequency without voltage collapse.',
        pageOrSection: 'Section IV: Sub-Cycle Transient Response, p. 7',
        stance: 'SUPPORTING',
        strength: 'HIGH',
        strengthRationale: 'Empirical hardware-in-the-loop laboratory measurements proving virtual inertia response speed exceeds mechanical thermal turbines.',
        methodologyDetails: {
          sampleSize: '10 MW HIL testbed with 120 simulated disturbance scenarios',
          studyType: 'Experimental Hardware-in-the-Loop',
          keyLimitations: 'Conducted on high-voltage test bus, not continent-wide transmission network.'
        },
        userNotes: 'Key quantitative proof that GFM inverters are fast enough.',
        aiGenerated: false,
        verifiedByUser: true,
        createdAt: '2026-08-16T11:00:00.000Z'
      },
      {
        id: 'ev-grid-02',
        claimId: 'claim-grid-01',
        subClaimId: 'subclaim-grid-2',
        sourceId: 'src-nature-energy-2024',
        quote: 'To achieve 100% reliability from wind and solar without dispatchable thermal generation or firm clean generation, a continent-scale grid requires between 200 and 400 hours of continuous storage capacity to survive cyclical decadal weather anomalies (Dunkelflaute). Current Li-ion battery costs make meeting the final 5-10% of demand cost-prohibitive.',
        pageOrSection: 'Results: Storage Duration Frontier, p. 1104',
        stance: 'CONTRADICTING',
        strength: 'HIGH',
        strengthRationale: 'Peer-reviewed 42-year multi-country climatological dataset demonstrating economic unviability of pure battery storage for multi-week weather deficits.',
        methodologyDetails: {
          sampleSize: '42 years of hourly meteorological MERRA-2 data across 36 nations',
          studyType: 'Large-scale computational re-analysis & cost modeling',
          keyLimitations: 'Assumes current commercial battery chemistry costs; does not account for future potential 10x battery cost reductions or green hydrogen breakthroughs.'
        },
        userNotes: 'Crucial counter-evidence showing battery duration economics limit 100% pure VRE without firm clean backup.',
        aiGenerated: false,
        verifiedByUser: true,
        createdAt: '2026-08-17T12:00:00.000Z'
      },
      {
        id: 'ev-grid-03',
        claimId: 'claim-grid-01',
        subClaimId: 'subclaim-grid-1',
        sourceId: 'src-aemo-2025',
        quote: 'South Australia operated for 11 consecutive days with instantaneous wind and rooftop solar supplying 104% of state demand. Grid stability was maintained via four synchronous condensers operating alongside 450MW/700MWh of grid-forming battery energy storage systems.',
        pageOrSection: 'Executive Summary, p. 3',
        stance: 'QUALIFYING',
        strength: 'MODERATE',
        strengthRationale: 'Real-world utility telemetry confirms 100%+ renewable operation is stable, but relied on synchronous condensers (spinning mechanical mass) in tandem with inverters.',
        methodologyDetails: {
          sampleSize: '11 days real-time high-resolution SCADA telemetry across 1.8M population grid',
          studyType: 'Empirical Observational Utility Data',
          keyLimitations: 'South Australia remains connected via interconnector to the Eastern Australia NEM grid.'
        },
        userNotes: 'Proves high penetration is possible today, but qualifies the claim because synchronous condensers were still required.',
        aiGenerated: false,
        verifiedByUser: true,
        createdAt: '2026-08-18T15:00:00.000Z'
      },
      {
        id: 'ev-grid-04',
        claimId: 'claim-grid-01',
        subClaimId: 'subclaim-grid-1',
        sourceId: 'src-fossil-institute-2024',
        quote: 'Without mechanical rotating mass from gas turbines, the power grid loses fundamental thermodynamic damping. Any attempt to run a grid without minimum 30% rotating thermal baseload invites catastrophic cascading blackouts.',
        pageOrSection: 'Section 2: Thermodynamic Fundamentals, p. 14',
        stance: 'CONTRADICTING',
        strength: 'FLAWED',
        strengthRationale: 'Asserts thermodynamic requirement for physical thermal mass without acknowledging synthetic inertia control loops proven in NREL and AEMO telemetry; authored by industry advocacy body with undisclosed funding.',
        methodologyDetails: {
          sampleSize: 'Qualitative editorial review',
          studyType: 'Policy Paper / Opinion',
          keyLimitations: 'No mathematical modeling or empirical HIL testing included.'
        },
        userNotes: 'Heavily biased source; contradicted by direct AEMO South Australia operations.',
        aiGenerated: false,
        verifiedByUser: true,
        createdAt: '2026-08-19T16:30:00.000Z'
      }
    ],
    comparisons: [
      {
        id: 'comp-grid-01',
        claimId: 'claim-grid-01',
        sourceIds: ['src-nrel-2025', 'src-nature-energy-2024', 'src-aemo-2025'],
        synthesisTitle: 'Frequency Stability vs. Seasonal Energy Adequacy',
        consensusPoints: [
          'All three rigorous studies agree that sub-second frequency control and voltage support can be achieved via grid-forming inverters and fast-responding battery storage.',
          'Synchronous condenser flywheels provide physical inertia complement without requiring fossil fuel combustion.'
        ],
        divergencePoints: [
          'NREL focuses on transient second-by-second electromagnetic stability (which is technically solved), while Nature Energy analyzes multi-week meteorological energy adequacy (which remains an unsolved economic bottleneck).',
          'AEMO demonstrates operational viability in a regional grid, but notes dependence on synchronous condensers, whereas some pure-inverter advocates argue synchronous condensers are unnecessary.'
        ],
        methodologyComparison: 'NREL uses experimental hardware dynamometers; Nature Energy conducts 42-year climatological meteorological optimization; AEMO supplies real-world grid SCADA logs.',
        epistemicGaps: [
          'Lack of continent-scale field experiments with zero synchronous machines online.',
          'Uncertain long-term reliability of power electronics under geomagnetic solar storm disturbances.'
        ],
        aiAssisted: true,
        userEditedNotes: 'Synthesized to distinguish second-level stability (solved) from multi-week resource adequacy (unsolved without firm clean power).',
        createdAt: '2026-08-20T10:00:00.000Z'
      }
    ],
    reports: [
      {
        id: 'rep-grid-01',
        claimId: 'claim-grid-01',
        title: 'Investigative Synthesis: 100% Inverter-Based Renewable Grid Viability',
        executiveSummary: 'This analysis separates the electrical engineering question of instantaneous transient frequency stability from the macro-economic question of multi-week resource adequacy. Peer-reviewed laboratory testing (NREL) and operational telemetry (AEMO) confirm that grid-forming inverters arrest frequency drops faster than thermal turbines. However, 42-year climatological analysis (Nature Energy) confirms that electrochemical battery storage alone cannot economically cover multi-week winter wind lulls without firm clean generation (nuclear, geothermal, or hydrogen).',
        claimDecompositionSummary: 'Subclaim 1 (Frequency control) is strongly supported. Subclaim 2 (100% battery seasonal storage) is refuted by climatological economics. Subclaim 3 (Islanded black-start) remains partially qualified.',
        evidenceBreakdown: {
          supportingCount: 1,
          opposingCount: 2,
          qualifyingCount: 1,
          neutralCount: 0,
          highStrengthCount: 2,
          moderateStrengthCount: 1,
          weakStrengthCount: 0,
          flawedCount: 1,
        },
        epistemicVerdict: 'CONTESTED_EVIDENCE',
        verdictRationale: 'Transient physical stability is achievable with grid-forming inverters and synchronous condensers, but full elimination of firm dispatchable generation is constrained by multi-week seasonal storage economics.',
        confidenceBounds: 'High Confidence on Transient Physics (90%), Moderate Confidence on Seasonal System Economics (70%)',
        keyFindings: [
          'Grid-forming inverters respond in 8–16ms, outperforming mechanical governors.',
          'Dunkelflaute events require 200–400 hours storage, making lithium-ion batteries economically insufficient on their own.',
          'Synchronous condensers provide an emission-free physical bridge for system strength.'
        ],
        bibliography: [
          {
            sourceId: 'src-nrel-2025',
            citationApa: 'Kroposki, B., Hoke, A., Ramasubramanian, D., & O’Malley, M. (2025). Grid-Forming Inverter Controls for High-Penetration Inverter-Based Resource Power Systems. IEEE Transactions on Power Systems. https://doi.org/10.1109/TPWRS.2025.340192',
            citationChicago: 'Benjamin Kroposki, Andy Hoke, Deepak Ramasubramanian, and Mark O’Malley. "Grid-Forming Inverter Controls for High-Penetration Inverter-Based Resource Power Systems." IEEE Transactions on Power Systems (2025). https://doi.org/10.1109/TPWRS.2025.340192',
            citationBibtex: '@article{kroposki2025, author = {Kroposki et al.}, title = {Grid-Forming Inverters}, year = {2025}}'
          }
        ],
        limitationsStatement: 'Cost projections depend on future capital expenditures for long-duration iron-air batteries and clean hydrogen electrolyzers.',
        generatedAt: '2026-08-21T14:00:00.000Z',
        aiDrafted: false,
        markdownContent: ''
      }
    ],
    history: [
      {
        id: 'hist-1',
        timestamp: '2026-08-15T09:00:00.000Z',
        actionType: 'CLAIM_CREATED',
        description: 'Initiated investigation: 100% Inverter-Based Renewable Grid Stability'
      },
      {
        id: 'hist-2',
        timestamp: '2026-08-16T10:15:00.000Z',
        actionType: 'SOURCE_ADDED',
        description: 'Attached Peer-Reviewed Source: NREL IEEE Transactions on Power Systems'
      },
      {
        id: 'hist-3',
        timestamp: '2026-08-16T11:00:00.000Z',
        actionType: 'EVIDENCE_EXTRACTED',
        description: 'Extracted Passage: GFM sub-cycle transient response (HIGH strength, SUPPORTING)'
      }
    ]
  },
  {
    id: 'inv-fasting-metabolism',
    claim: {
      id: 'claim-fasting-01',
      title: 'Time-Restricted Feeding (16:8) Superiority over Caloric Restriction',
      statement: 'Time-restricted feeding (16:8 intermittent fasting) produces metabolic benefits in insulin sensitivity, visceral fat loss, and autophagy markers independent of and superior to equivalent isocaloric continuous caloric restriction.',
      context: 'Popular health discourse frequently claims that restricting eating to an 8-hour window triggers unique hormonal fat burning and cellular repair even when total daily caloric intake and macronutrient ratios are identical.',
      domain: 'Biomedicine & Human Metabolism',
      tags: ['Nutrition', 'Intermittent Fasting', 'Insulin Sensitivity', 'Metabolism', 'Caloric Restriction'],
      status: 'mixed_contested',
      confidenceRating: 65,
      priority: 'medium',
      hypothesisNotes: 'In rodent models with circadian misalignment, time-restricted feeding shows dramatic independent benefits. However, rigorously controlled human isocaloric metabolic chamber trials show fat loss is primarily driven by net caloric deficit, with modest circadian benefits in early-day feeding windows.',
      subClaims: [
        {
          id: 'subclaim-fast-1',
          claimId: 'claim-fasting-01',
          text: 'Isocaloric 16:8 fasting causes significantly greater visceral fat loss than standard continuous calorie reduction in humans.',
          status: 'refuted',
          notes: 'Multiple human randomized controlled trials (NEJM, JAMA Internal Medicine) found no significant difference when calories were strictly matched.'
        },
        {
          id: 'subclaim-fast-2',
          claimId: 'claim-fasting-01',
          text: 'Early-day time-restricted eating (eTRF) improves 24-hour glycemic control and insulin sensitivity via circadian synchronization.',
          status: 'strongly_supported',
          notes: 'Consistent human metabolic ward trials show enhanced insulin sensitivity when the feeding window is aligned with morning cortisol/insulin peaks.'
        }
      ],
      createdAt: '2026-08-10T12:00:00.000Z',
      updatedAt: '2026-08-25T17:00:00.000Z',
    },
    sources: [
      {
        id: 'src-nejm-2022',
        claimId: 'claim-fasting-01',
        title: 'Calorie Restriction with or without Time-Restricted Eating in Weight Loss',
        authors: ['Deying Liu', 'Yan Huang', 'Cunjian Huang', 'Shuai Yang', 'et al.'],
        publication: 'New England Journal of Medicine (NEJM)',
        publicationDate: '2022-04-21',
        url: 'https://doi.org/10.1056/NEJMoa2114833',
        doiOrIsbn: '10.1056/NEJMoa2114833',
        sourceType: 'peer_reviewed_journal',
        credibility: {
          peerReviewed: true,
          editorialOversight: true,
          fundingTransparency: 'Funded by National Natural Science Foundation of China',
          declaredConflicts: 'No industry funding or commercial supplement ties declared',
          biasOrientation: 'Clinical Medical Research',
          methodologyOverview: '12-month randomized clinical trial of 139 patients with obesity randomized to calorie restriction alone vs calorie restriction with an 8:00 to 16:00 feeding window.',
          overallTrustTier: 'Tier 1 (High Reliability)'
        },
        rawContent: `Over the 12-month trial period, net weight loss was -8.0 kg (95% CI, -9.6 to -6.4) in the time-restriction group and -6.3 kg (95% CI, -7.8 to -4.7) in the daily calorie-restriction group (P = 0.11 for between-group difference). Reductions in body fat, visceral fat, blood pressure, fasting glucose, and lipid profiles were not significantly different between the two regimens.`,
        notes: 'Gold standard 12-month clinical RCT testing calorie-matched IF.',
        addedAt: '2026-08-11T09:30:00.000Z'
      },
      {
        id: 'src-cell-meta-2024',
        claimId: 'claim-fasting-01',
        title: 'Early Time-Restricted Feeding Improves 24-Hour Glycemic Profiles and Circadian Gene Expression in Pre-Diabetes',
        authors: ['Courtney M. Peterson', 'Kirsten A. Beyl', 'Eric Ravussin'],
        publication: 'Cell Metabolism',
        publicationDate: '2024-02-06',
        url: 'https://doi.org/10.1016/j.cmet.2024.01.008',
        doiOrIsbn: '10.1016/j.cmet.2024.01.008',
        sourceType: 'peer_reviewed_journal',
        credibility: {
          peerReviewed: true,
          editorialOversight: true,
          fundingTransparency: 'NIH / NIDDK grant funding',
          declaredConflicts: 'None',
          biasOrientation: 'Physiological / Circadian Biology',
          methodologyOverview: 'Randomized crossover isocaloric eucaloric controlled inpatient feeding trial in metabolic chamber.',
          overallTrustTier: 'Tier 1 (High Reliability)'
        },
        rawContent: `Under strictly eucaloric conditions (weight-stable), early time-restricted feeding (8:00 to 14:00) reduced mean 24-hour glucose levels by 4.2 mg/dL and lowered fasting insulin by 3.4 mU/L compared with a 12-hour feeding window, independently of weight changes. Morning insulin sensitivity was enhanced via upregulation of BMAL1 and CLOCK circadian clock genes.`,
        notes: 'Provides mechanistic proof that timing modulates insulin sensitivity even without weight loss.',
        addedAt: '2026-08-12T14:00:00.000Z'
      }
    ],
    evidence: [
      {
        id: 'ev-fast-01',
        claimId: 'claim-fasting-01',
        subClaimId: 'subclaim-fast-1',
        sourceId: 'src-nejm-2022',
        quote: 'Reductions in body fat, visceral fat, blood pressure, fasting glucose, and lipid profiles were not significantly different between the two regimens over 12 months.',
        pageOrSection: 'NEJM Results Section, p. 1540',
        stance: 'CONTRADICTING',
        strength: 'HIGH',
        strengthRationale: '12-month double-arm randomized controlled human trial (N=139) measuring visceral fat via DXA and MRI.',
        methodologyDetails: {
          sampleSize: '139 adults with obesity over 12 months',
          studyType: 'Randomized Controlled Clinical Trial (RCT)',
          keyLimitations: 'Both groups practiced caloric restriction; does not test ad-libitum IF without calorie counting.'
        },
        userNotes: 'Directly refutes the claim of fat-loss superiority over calorie restriction.',
        aiGenerated: false,
        verifiedByUser: true,
        createdAt: '2026-08-11T10:00:00.000Z'
      },
      {
        id: 'ev-fast-02',
        claimId: 'claim-fasting-01',
        subClaimId: 'subclaim-fast-2',
        sourceId: 'src-cell-meta-2024',
        quote: 'Under strictly eucaloric conditions (weight-stable), early time-restricted feeding reduced mean 24-hour glucose levels and lowered fasting insulin independently of weight changes.',
        pageOrSection: 'Cell Metabolism, p. 245',
        stance: 'SUPPORTING',
        strength: 'HIGH',
        strengthRationale: 'Metabolic chamber randomized crossover trial with strict weight-stability controls isolating circadian timing effects.',
        methodologyDetails: {
          sampleSize: 'Inpatient crossover trial',
          studyType: 'Inpatient Eucaloric Chamber Trial',
          keyLimitations: 'Small sample size, short duration (5 weeks).'
        },
        userNotes: 'Supports metabolic biomarker benefits for early-window eating.',
        aiGenerated: false,
        verifiedByUser: true,
        createdAt: '2026-08-12T15:00:00.000Z'
      }
    ],
    comparisons: [],
    reports: [],
    history: [
      {
        id: 'hist-f1',
        timestamp: '2026-08-10T12:00:00.000Z',
        actionType: 'CLAIM_CREATED',
        description: 'Initiated investigation: Time-Restricted Feeding (16:8) Superiority over Caloric Restriction'
      }
    ]
  },
  {
    id: 'inv-social-attention',
    claim: {
      id: 'claim-social-01',
      title: 'Short-Form Video Algorithms and Adolescent Sustained Attention Span',
      statement: 'Frequent daily consumption (≥2 hours/day) of algorithmic short-form video feeds (TikTok, Instagram Reels, YouTube Shorts) directly degrades neurological capacity for sustained focal attention in adolescents compared to long-form media.',
      context: 'Public debate on adolescent cognitive development focuses on whether rapid stimulus switching alters dopamine signaling and prefrontal executive function or whether observed correlations reflect reverse causality (ADHD traits seeking rapid stimulation).',
      domain: 'Cognitive Neuroscience & Developmental Psychology',
      tags: ['Neuroscience', 'Social Media', 'Attention Span', 'Dopamine', 'Adolescent Cognition'],
      status: 'mixed_contested',
      confidenceRating: 58,
      priority: 'high',
      hypothesisNotes: 'Longitudinal studies show moderate associations with self-reported distractibility, but direct objective neuro-imaging evidence of structural prefrontal degradation remains limited. Confounding factors such as sleep displacement and baseline executive function are major variables.',
      subClaims: [
        {
          id: 'subclaim-soc-1',
          claimId: 'claim-social-01',
          text: 'Algorithmic micro-content directly alters dopamine receptor sensitivity in the nucleus accumbens in developing brains.',
          status: 'inconclusive',
          notes: 'Rodent analogues exist, but human PET imaging data specific to short-form video is sparse.'
        },
        {
          id: 'subclaim-soc-2',
          claimId: 'claim-social-01',
          text: 'Sustained attention deficits are primarily mediated by sleep deprivation rather than intrinsic cognitive restructuring.',
          status: 'strongly_supported',
          notes: 'Multiple pediatric sleep studies demonstrate that when sleep duration is controlled for, cognitive deficits drop by >60%.'
        }
      ],
      createdAt: '2026-08-01T08:00:00.000Z',
      updatedAt: '2026-08-20T11:00:00.000Z',
    },
    sources: [
      {
        id: 'src-pediatrics-2024',
        claimId: 'claim-social-01',
        title: 'Longitudinal Trajectories of Screen Media Activity and Sustained Attention in the ABCD Study Cohort',
        authors: ['Jason M. Nagata', 'Chloe R. Cortina', 'Fiona C. Baker', 'et al.'],
        publication: 'JAMA Pediatrics & ABCD Study Consortium',
        publicationDate: '2024-05-13',
        url: 'https://doi.org/10.1001/jamapediatrics.2024.1102',
        doiOrIsbn: '10.1001/jamapediatrics.2024.1102',
        sourceType: 'peer_reviewed_journal',
        credibility: {
          peerReviewed: true,
          editorialOversight: true,
          fundingTransparency: 'National Institutes of Health (NIH) Adolescent Brain Cognitive Development Study',
          declaredConflicts: 'None',
          biasOrientation: 'Epidemiological / Pediatric Health',
          methodologyOverview: 'Multi-year prospective longitudinal cohort tracking 11,875 adolescents using NIH Toolbox Cognition Battery and fMRI.',
          overallTrustTier: 'Tier 1 (High Reliability)'
        },
        rawContent: `In this cohort of 11,875 children followed from age 9 to 13, each additional 1 hour of daily short-form video viewing was associated with a modest decrease in Flanker Inhibitory Control scores (beta = -0.04, 95% CI -0.07 to -0.01). However, when accounting for sleep duration and baseline maternal education, effect sizes were attenuated by 64%, indicating that sleep disruption is a primary mediating pathway.`,
        notes: 'Largest prospective adolescent neurological cohort to date.',
        addedAt: '2026-08-02T10:00:00.000Z'
      }
    ],
    evidence: [
      {
        id: 'ev-soc-01',
        claimId: 'claim-social-01',
        subClaimId: 'subclaim-soc-2',
        sourceId: 'src-pediatrics-2024',
        quote: 'When accounting for sleep duration and baseline maternal education, effect sizes were attenuated by 64%, indicating that sleep disruption is a primary mediating pathway.',
        pageOrSection: 'JAMA Pediatrics Discussion, p. 8',
        stance: 'QUALIFYING',
        strength: 'HIGH',
        strengthRationale: 'Prospective NIH longitudinal cohort (N=11,875) demonstrating that direct cognitive effects are predominantly mediated by indirect sleep loss rather than direct screen damage.',
        methodologyDetails: {
          sampleSize: '11,875 adolescents tracked across 21 US study sites',
          studyType: 'Prospective Longitudinal Cohort',
          keyLimitations: 'Screen time metrics relied partly on self-report / parent-report.'
        },
        userNotes: 'Qualifies direct causation claims by pinpointing sleep deprivation as the driving mediator.',
        aiGenerated: false,
        verifiedByUser: true,
        createdAt: '2026-08-02T11:30:00.000Z'
      }
    ],
    comparisons: [],
    reports: [],
    history: []
  }
];

export const INITIAL_INVESTIGATION_PROJECTS = INITIAL_INVESTIGATIONS;

