# Project 11 — RAG Systems (Basic & Advanced)

Two progressive RAG (Retrieval-Augmented Generation) implementations built for **app.vwo.com** QA and product intelligence.

---

## Projects

### [`Basic_RAG_Explain/`](./Basic_RAG_Explain/README.md) — Basic RAG · Port 5011

A single-PDF RAG explorer using ChromaDB, Nomic Embed, and Groq. Ingests the VWO Login Dashboard PRD and answers questions about it with a visual pipeline UI.

| Stack | |
|-------|-|
| Embedding | Nomic Embed Text v1 (768-dim) |
| Vector DB | ChromaDB (local) |
| LLM | Groq llama-3.1-8b-instant |

```bash
cd Basic_RAG_Explain && python3 ingest.py && python3 app.py
# → http://localhost:5011
```

---

### [`Advance_RAG_Explain/`](./Advance_RAG_Explain/README.md) — Advanced RAG · Port 5012

A full 6-stage Advanced RAG system for test case intelligence. Upload any CSV/Excel, ingest via hybrid search pipeline, and chat with step-by-step retrieval visibility. Includes 5,000 VWO test cases.

| Stack | |
|-------|-|
| Embedding | BAAI/bge-large-en-v1.5 (1024-dim) |
| Vector DB | Qdrant (local, hybrid search) |
| Sparse retrieval | BM25 (rank_bm25) |
| Fusion | Reciprocal Rank Fusion |
| Re-ranker | cross-encoder/ms-marco-MiniLM-L-6-v2 |
| LLM | Groq llama-3.1-8b-instant |

```bash
cd Advance_RAG_Explain && python3 app.py
# → http://localhost:5012
# Upload testcases_vwo.csv to get started
```

---

## Basic vs Advanced — Quick Comparison

| | Basic RAG | Advanced RAG |
|-|-----------|--------------|
| Data source | PDF | CSV / Excel (any file, multi-upload) |
| Retrieval | Dense only | Dense + BM25 + RRF fusion |
| Re-ranking | None | Cross-encoder |
| Chunks visible | Yes | Yes + overlap highlighting |
| Retrieval steps shown | Summary | Full step-by-step (Dense → BM25 → RRF → Rerank) |
| Multi-file support | No | Yes (Append or Replace mode) |
