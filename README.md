# TruthTrace — Source & Claim Analysis Tool

> **An open-source research and epistemological auditing platform designed to help investigators, analysts, journalists, and researchers distinguish claims, evidence, and primary sources.**

---

## 🔍 The Problem

When consuming information online, people constantly struggle to distinguish **unsubstantiated claims**, **empirical evidence**, and **primary source provenance**. Conflating opinion with data, missing methodological flaws, and over-relying on algorithmic summaries leads to rapid misinformation propagation and epistemic degradation.

**TruthTrace** addresses this by providing a rigorous epistemological workflow:
1. **Decompose master claims** into testable, falsifiable sub-propositions.
2. **Attach primary sources** with full metadata, peer-review status, and funding transparency audits.
3. **Extract verbatim evidence passages** directly from raw source texts.
4. **Classify evidence stances** (*Supporting*, *Contradicting*, *Qualifying*, *Neutral*) and evaluate methodological rigor (*High*, *Moderate*, *Weak*, *Flawed*).
5. **Map visual claim-evidence topologies** using an interactive network graph.
6. **Compare competing literature** side-by-side on methodology, sample sizes, and institutional bias.
7. **Generate structured, citation-rich research reports** with automated APA 7th / Chicago 17th bibliographies.

---

## ⚖️ Epistemic AI Advisory & Transparency Policy

TruthTrace includes AI-assisted summarization and claim decomposition powered by the modern `@google/genai` TypeScript SDK.

### **Core Principle: AI is an Analytical Assistant, NEVER an Authoritative Truth Arbiter**
- **Strict Labeling**: Every piece of AI-generated content (suggested sub-claims, extracted candidate passages, comparative syntheses, report drafts) is prominently tagged with clear AI advisory badges (`AI-Generated Draft Analysis`).
- **Human-in-the-Loop Verification**: AI-suggested passages and stances are treated as unconfirmed candidates until explicitly reviewed and confirmed by a human researcher.
- **No Hallucinated Truths**: AI outputs are strictly constrained to synthesizing and organizing human-provided source texts, never presented as settled empirical facts.

---

## 🏗️ Architecture

TruthTrace is built as a full-stack web application adhering to security and privacy standards:

```
├── server.ts                 # Express backend proxy for Gemini API & Vite middleware
├── src/
│   ├── types.ts              # Epistemological TypeScript interfaces & models
│   ├── data/
│   │   └── initialData.ts    # Peer-reviewed investigation seed datasets
│   ├── utils/
│   │   └── research.ts       # Citation formatting, evidence calculus & graph builders
│   ├── components/
│   │   ├── Header.tsx                 # Navigation & investigation switcher
│   │   ├── AiAdvisoryBadge.tsx        # Epistemic AI transparency indicators
│   │   ├── ClaimOverviewTab.tsx       # Proposition editor & sub-claim decomposition
│   │   ├── SourcesTab.tsx             # Source repository & highlight-to-quote reader
│   │   ├── EvidenceLedgerTab.tsx      # Stance classification & rigor ledger
│   │   ├── GraphViewTab.tsx           # Interactive claim-evidence topology graph
│   │   ├── SourceComparisonTab.tsx    # Multi-source comparison matrix & synthesis
│   │   ├── ReportGeneratorTab.tsx     # Structured report compiler, APA citations & export
│   │   ├── SearchHistoryTab.tsx       # Universal keyword search & project management
│   │   └── PrivacySettingsModal.tsx   # Local storage sovereignty & security controls
│   ├── App.tsx               # Main state controller & localStorage persistence
│   ├── main.tsx              # React entry point
│   └── index.css             # Tailwind styling & print stylesheet
└── tests/
    └── research.test.ts      # Automated unit tests for citations & epistemology logic
```

### **Backend Security & Secret Isolation**
- All Gemini API interactions occur strictly **server-side** in `server.ts` via `process.env.GEMINI_API_KEY`.
- Zero API keys are ever leaked to client-side bundles.
- Client interacts exclusively through structured REST endpoints (`/api/ai/*`).

---

## 🚀 Key Features

### 1. Master Proposition & Sub-Claims Decomposition
- Define falsifiable hypotheses with confidence sliders (0–100%) and priority ratings.
- Break multifaceted hypotheses into atomic sub-claims that can be evaluated individually.
- Use **AI Decompose** to draft candidate sub-claims.

### 2. Source Repository & Highlight-to-Quote Reader
- Catalog literature with bibliographic metadata (Authors, Journal, Date, URL, DOI/ISBN).
- Credibility audits: Peer-review referee process, editorial oversight, funding transparency, and declared conflicts of interest.
- Interactive Source Reader: Paste full document text and highlight any sentence to instantly extract it as a verbatim evidence passage with locator tracking.

### 3. Evidence Ledger & Stance Classification
- Multi-dimensional filtering across stances (*Supporting*, *Contradicting*, *Qualifying*, *Neutral*) and strength ratings (*High*, *Moderate*, *Weak*, *Flawed*).
- Methodological rationale documentation (e.g., sample sizes, experimental vs. observational controls).
- Human confirmation workflow for AI-extracted passages.

### 4. Interactive Claim-Evidence Graph
- Real-time visual network topology connecting master claims, sub-claims, evidence quotes, and primary sources.
- Color-coded stance edges: Green (Supporting), Red (Refuting), Amber (Qualifying), Slate (Neutral).
- Three layout algorithms: **Radial Cluster**, **Layered Flow**, and **Hierarchy Tree**.
- Node inspector drawer with direct stance editing and SVG vector export.

### 5. Multi-Source Comparative Matrix
- Compare 2 to 4 competing papers side-by-side on methodology, peer-review status, funding sources, and key findings.
- **AI Comparative Synthesis**: Identifies empirical consensus points, disputed findings, and unresolved gaps across competing literature.

### 6. Structured Scholarly Report & Citation Export
- Automatically compiles structured research syntheses with mathematical evidence distribution metrics.
- Standardized citation generation for **APA 7th Edition** and **Chicago 17th Edition**.
- Multi-format export: **Markdown (.md)**, **Raw JSON (.json)**, and **Print-Ready PDF**.

### 7. Universal Search & Local Privacy Sovereignty
- Real-time search across all claims, sub-claims, source metadata, and verbatim quotes.
- Zero-telemetry design: All projects and notes are stored strictly in private browser storage (`localStorage`).
- Import and export complete investigation workspaces.

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (version 18+)
- Gemini API Key (set as `GEMINI_API_KEY` in your environment or `.env`)

### Local Setup
```bash
# Clone the repository
git clone https://github.com/your-username/truthtrace.git
cd truthtrace

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Add your GEMINI_API_KEY inside .env

# Run development server (accessible at http://localhost:3000)
npm run dev

# Run automated unit tests
npm run test
```

### Production Build
```bash
npm run build
npm start
```

---

## 🧪 Testing

TruthTrace includes automated test suites powered by Vitest covering citation generation, trust tier evaluation, evidence distribution math, graph data generation, and markdown compilation:

```bash
npm run test
```

---

## 🔒 Security & Privacy

- **Data Sovereignty**: Investigation data remains strictly local in client storage. No analytics or tracking trackers.
- **Credential Protection**: Server proxy architecture protects the Gemini API credentials from browser visibility.
- **Sanitized Exports**: Exported Markdown and JSON files contain clean epistemological structures without extraneous tracking headers.

---

## 🤝 Contributing

We welcome contributions from epistemologists, data journalists, researchers, and developers!
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/epistemic-audit-metric`).
3. Commit your changes with clear messages.
4. Ensure all tests pass (`npm run test`).
5. Open a Pull Request.

---

## 📄 License

TruthTrace is released under the **MIT License**. See `LICENSE` for details.
