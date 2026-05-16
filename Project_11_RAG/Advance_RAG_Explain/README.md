# Project 11 — Advanced RAG Explorer (Test Cases)

A production-grade **Retrieval-Augmented Generation** system for QA test case intelligence. Upload any CSV or Excel file of test cases, watch the 6-stage Advanced RAG pipeline ingest and index them, then query with a chat interface that shows every retrieval step — dense search, keyword search, RRF fusion, cross-encoder re-ranking, and LLM generation.

Built for **app.vwo.com** test case management. Includes a pre-generated dataset of **5,000 VWO test cases** in Jira format.

---

## Quick Start

```bash
# 1. Install dependencies
cd Project_11_RAG/Advance_RAG_Explain
pip install -r requirements.txt

# 2. Add your Groq API key
echo "GROQ_API_KEY=your_key_here" > .env
echo "GROQ_MODEL=llama-3.1-8b-instant" >> .env

# 3. Start the server
python3 app.py
```

> **Note:** First startup downloads `BAAI/bge-large-en-v1.5` (~335 MB) and the cross-encoder (~22 MB) from HuggingFace. Subsequent starts are instant.

Open **http://localhost:5012** in your browser — if you previously ingested data, the Explorer loads automatically. Otherwise, drag-drop `testcases_vwo.csv` to begin.

---

## Architecture — 6-Stage Advanced RAG Pipeline

```
INGESTION
CSV/Excel ──► Chunking (1000 chars / 150 overlap) ──► BGE-large Embeddings (1024-dim)
                                                             │
                                              ┌──────────────┴─────────────────┐
                                              │  Qdrant (dense vectors)        │
                                              │  BM25 Index (keyword/sparse)   │
                                              └────────────────────────────────┘

QUERY PIPELINE
User Query
    │
    ▼
[1] BGE-large Embed   →  1024-dim query vector
    │
    ▼
[2] Dense Retrieval   →  Qdrant cosine similarity → Top-20 chunks
    │
[3] BM25 Retrieval    →  Okapi BM25 keyword match  → Top-20 chunks
    │
    ▼
[4] RRF Fusion        →  Reciprocal Rank Fusion (k=60) → 25–30 unique chunks
    │
    ▼
[5] Cross-Encoder     →  ms-marco-MiniLM re-ranks each (query, chunk) pair → Top-5
    │
    ▼
[6] Groq LLM          →  llama-3.1-8b-instant generates grounded answer
```

---

## What Makes This "Advanced" vs Basic RAG

| Feature | Basic RAG | Advanced RAG |
|---------|-----------|--------------|
| Data source | PDF (fixed) | CSV / Excel upload (any file) |
| Chunking | Fixed character size | Sentence-aware boundary detection |
| Embedding | Nomic Embed v1 (768-dim) | **BAAI/bge-large-en-v1.5 (1024-dim)** |
| Vector DB | ChromaDB | **Qdrant (hybrid search support)** |
| Retrieval | Dense only | **Dense + BM25 sparse + RRF fusion** |
| Re-ranking | None | **Cross-encoder (ms-marco-MiniLM-L-6-v2)** |
| Multi-file | No | **Yes — Upload More with Append/Replace mode** |
| UI insight | Pipeline diagram + chunk scores | **Step-by-step: Dense → BM25 → RRF → Re-rank before/after** |

---

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Embedding** | `BAAI/bge-large-en-v1.5` | Top MTEB English benchmark, 1024-dim, fully local |
| **Vector DB** | Qdrant (local path mode) | Native hybrid search, production-ready, no Docker needed |
| **Sparse retrieval** | `rank_bm25` (BM25Okapi) | Keyword matching catches exact test case IDs and terms |
| **Fusion** | Reciprocal Rank Fusion (RRF) | Merges dense + sparse ranked lists without score normalisation |
| **Re-ranker** | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Scores each (query, chunk) pair — far more accurate than cosine alone |
| **LLM** | Groq `llama-3.1-8b-instant` | Sub-500ms generation, free tier, grounded answers |
| **Backend** | Flask 3 + SSE streaming | Real-time ingestion progress via Server-Sent Events |
| **Frontend** | Vanilla HTML/CSS/JS (Claude theme) | Zero dependencies, instant load |

---

## Project Structure

```
Advance_RAG_Explain/
├── Data/                         # Optional: additional source files
├── templates/
│   └── index.html                # Claude-themed Advanced RAG Explorer UI
├── app.py                        # Flask server — upload, SSE ingest, hybrid search, chat
├── requirements.txt              # Python dependencies
├── testcases_vwo.csv             # 5,000 VWO test cases in Jira CSV format
├── .env                          # Groq API key (not committed)
└── .gitignore
```

> `qdrant_db/`, `chunks.json`, `bm25.pkl`, and `uploads/` are auto-generated at runtime.

---

## Setup & Run

### 1. Install dependencies

```bash
cd Project_11_RAG/Advance_RAG_Explain
pip install -r requirements.txt
```

> First run downloads two models from HuggingFace:
> - `BAAI/bge-large-en-v1.5` — ~335 MB (embedding model)
> - `cross-encoder/ms-marco-MiniLM-L-6-v2` — ~22 MB (re-ranker)

### 2. Configure API key

Create `.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

Get a free key at [console.groq.com](https://console.groq.com).

### 3. Start the server

```bash
python3 app.py
```

Open **http://localhost:5012**

---

## Using the Explorer

### Stage 1 — Upload & Ingest
1. Drag-drop `testcases_vwo.csv` (or any CSV/Excel) onto the upload zone
2. Select which columns to embed (auto-suggested based on column names)
3. Adjust chunk size / overlap sliders (defaults: 1000 chars / 150 chars)
4. Click **⚡ Run Ingestion** — watch 5 animated steps complete in real-time:
   - 📄 Parse → row count
   - ✂️ Chunk → overlap visualization
   - 🔢 BGE Embed → vector generation
   - 💾 Qdrant → vector storage
   - 🔑 BM25 → keyword index

### Stage 2 — Explore Chunks
The **Chunk Explorer** (left panel) shows every chunk with:
- **Amber highlight** = incoming overlap (text shared with previous chunk)
- **Purple highlight** = outgoing overlap (text shared with next chunk)
- Word count, char count, source row number
- Searchable/filterable — type any keyword to filter
- After a query: retrieved chunks float to the top with rank badges (🥇🥈🥉) and similarity bars

### Stage 3 — Chat & Query
Type any question in the chat panel (right side):
- Each response shows **6 expandable step panels**:
  1. 🔢 Query embedding (model, dimensions, prefix used)
  2. 🎯 Dense retrieval (Qdrant scores per chunk)
  3. 🔑 BM25 keyword matches (BM25 scores)
  4. ⚡ RRF fusion (how many unique chunks, merged scores)
  5. 🏆 Re-ranking (before vs after order comparison with cross-encoder scores)
  6. 🤖 LLM generation (model, token counts, duration)
- Full timing breakdown per stage

### Upload More Data
Click **➕ Upload More** (header button, visible after ingestion):
- **Append mode** — adds new chunks to existing Qdrant collection, rebuilds BM25 over all data
- **Replace mode** — clears everything and re-ingests the new file fresh

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /` | GET | HTML Explorer UI |
| `POST /api/upload` | POST | Upload CSV/Excel, returns column list + preview |
| `POST /api/ingest` | POST (SSE) | Streaming ingestion pipeline (5 steps via SSE) |
| `GET /api/chunks` | GET | All chunks as JSON |
| `GET /api/stats` | GET | DB stats + model info |
| `POST /api/chat` | POST | Full 6-stage RAG query |

### Example chat request

```bash
curl -X POST http://localhost:5012/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Find high-priority login test cases", "top_dense": 20, "top_bm25": 20, "top_rerank": 5}'
```

### Example chat response (structure)

```json
{
  "query": "Find high-priority login test cases",
  "answer": "The following high-priority login test cases were found...",
  "steps": {
    "embedding": { "model": "BAAI/bge-large-en-v1.5", "dims": 1024, "ms": 45 },
    "dense":     { "retrieved": 20, "top_score": 0.87, "ms": 4 },
    "bm25":      { "retrieved": 18, "top_score": 12.4, "ms": 2 },
    "rrf":       { "input_dense": 20, "input_bm25": 18, "output_unique": 28, "ms": 1 },
    "rerank":    { "input_count": 20, "output_count": 5, "ms": 210, "before": [...], "after": [...] },
    "llm":       { "model": "llama-3.1-8b-instant", "prompt_tokens": 1840, "completion_tokens": 320, "ms": 380 }
  },
  "total_ms": 642
}
```

---

## Test Case Dataset — `testcases_vwo.csv`

5,000 Jira-format test cases for app.vwo.com across 17 categories:

| Category | Count | Topics |
|----------|-------|--------|
| A/B Testing | 600 | Campaign creation, goals, traffic split, multivariate, lifecycle |
| Login / Auth | 500 | Email/password, SSO, MFA, session, forgot password, logout |
| Reports | 400 | Statistical significance, confidence intervals, export |
| Dashboard | 400 | Widgets, date filters, charts, responsive layout |
| Heatmaps | 300 | Click/scroll/move heatmaps, filters, export |
| Session Recordings | 300 | Playback, filters, privacy masking |
| Funnels | 300 | Creation, segmentation, trends |
| User Segmentation | 300 | Segment rules, boolean logic, dynamic segments |
| Security | 300 | XSS, CSRF, SQL injection, rate limiting, GDPR |
| Accessibility | 200 | WCAG 2.1, keyboard nav, screen reader, ARIA |
| Forms Analysis | 200 | Field tracking, drop-off, hesitation |
| Push Notifications | 200 | Campaign creation, opt-in/out |
| Account Management | 200 | Roles, API keys, billing |
| Performance | 200 | Load testing, API SLA |
| Integrations & API | 200 | GA, Segment, REST API |
| Cross-browser / Mobile | 200 | Chrome/Firefox/Safari, iOS/Android |
| Data & Privacy | 200 | GDPR deletion, data portability |

**CSV columns:** Issue ID · Issue Type · Summary · Description · Steps to Reproduce · Expected Result · Priority · Labels · Component · Status · Test Type · Preconditions

---

## Cost Analysis — 5,000 Test Cases

Approximate token count: 5,000 rows × 300 tokens = **~1.5M tokens** (one-time ingestion)

| Component | This Project (Open Source) | Paid Alternative |
|-----------|---------------------------|-----------------|
| Embedding (ingestion) | **$0.00** (BGE-large local) | $0.03 (OpenAI small) / $0.20 (OpenAI large) |
| Vector DB (5K vectors) | **$0.00** (Qdrant local) | $0.00 (Qdrant Cloud free tier) |
| Re-ranker (per query) | **$0.00** (cross-encoder local) | $2.00/1K queries (Cohere Rerank) |
| LLM (per 1K queries) | **~$0.05** (Groq) | ~$3–5 (GPT-4o) |
| **Total ingestion** | **$0.00** | ~$0.03–0.20 |
| **Per 1K queries** | **~$0.05** | ~$3–7 |

---

## Key RAG Concepts Demonstrated

- **Hybrid Search** — dense vectors capture semantic meaning; BM25 catches exact keyword matches (e.g. test case IDs like `VWO-TC-123`)
- **RRF Fusion** — merges two ranked lists without normalising incompatible score scales; `score = Σ 1/(k + rank)`
- **Cross-Encoder Re-ranking** — unlike bi-encoders (embed separately), cross-encoders jointly process `(query, document)` for far higher precision
- **Append vs Replace ingestion** — supports incremental data addition without reprocessing existing vectors
- **Overlap Visualization** — amber/purple highlights show exact character ranges shared between consecutive chunks
- **SSE Streaming** — ingestion progress pushed to browser in real-time without polling
