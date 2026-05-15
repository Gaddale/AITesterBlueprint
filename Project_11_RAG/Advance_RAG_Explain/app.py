"""
Advanced RAG — Test Case Explorer
Stack: BAAI/bge-large-en-v1.5 | Qdrant (local) | BM25 | Cross-Encoder | Groq
"""
import os, json, time, pickle, uuid
from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, request, render_template, Response, stream_with_context
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, CrossEncoder
from rank_bm25 import BM25Okapi
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────
QDRANT_PATH    = "qdrant_db"
COLLECTION     = "test_cases"
EMBED_MODEL    = "BAAI/bge-large-en-v1.5"
RERANK_MODEL   = "cross-encoder/ms-marco-MiniLM-L-6-v2"
QUERY_PREFIX   = "Represent this sentence for searching relevant passages: "
GROQ_MODEL     = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GROQ_KEY       = os.getenv("GROQ_API_KEY", "")
CHUNK_SIZE     = 1000
CHUNK_OVERLAP  = 150
UPLOADS_DIR    = "uploads"
CHUNKS_FILE    = "chunks.json"
BM25_FILE      = "bm25.pkl"

app = Flask(__name__)
CORS(app)

# ── Global state ──────────────────────────────────────────────────────────────
state = {"chunks": [], "bm25_index": None, "bm25_corpus": [], "ready": False}

print("=" * 60)
print("  Advanced RAG — Test Case Explorer  (port 5012)")
print("=" * 60)
print("\n[1/3] Loading BAAI/bge-large-en-v1.5  (~335 MB first run)...")
embed_model = SentenceTransformer(EMBED_MODEL)
print("      ✓ BGE-large ready")
print("[2/3] Loading cross-encoder re-ranker...")
cross_enc = CrossEncoder(RERANK_MODEL)
print("      ✓ Cross-encoder ready")
print("[3/3] Connecting to Qdrant (local) + Groq...")
qdrant = QdrantClient(path=QDRANT_PATH)
groq_client = Groq(api_key=GROQ_KEY)
print("      ✓ Qdrant + Groq ready")

# Restore previous session if files exist
if os.path.exists(CHUNKS_FILE):
    with open(CHUNKS_FILE, encoding="utf-8") as fh:
        state["chunks"] = json.load(fh)
    print(f"      ✓ Restored {len(state['chunks'])} chunks from disk")
if os.path.exists(BM25_FILE):
    with open(BM25_FILE, "rb") as fh:
        bm25_data = pickle.load(fh)
    state["bm25_corpus"] = bm25_data["corpus"]
    state["bm25_index"] = BM25Okapi(state["bm25_corpus"])
    state["ready"] = True
    print("      ✓ Restored BM25 index from disk")

os.makedirs(UPLOADS_DIR, exist_ok=True)
print("\n" + "=" * 60)

# ── Helpers ───────────────────────────────────────────────────────────────────

def make_chunks(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    text = text.strip()
    if not text or len(text) < 10:
        return []
    if len(text) <= size:
        return [text]
    chunks, start = [], 0
    while start < len(text):
        end = start + size
        if end >= len(text):
            chunks.append(text[start:])
            break
        seg = text[start:end]
        for sep in [". ", "\n\n", "\n", "; "]:
            pos = seg.rfind(sep, size // 2)
            if pos != -1:
                end = start + pos + len(sep)
                break
        chunks.append(text[start:end].strip())
        start = end - overlap
    return [c for c in chunks if len(c.strip()) > 20]


def rrf(lists: list[list[dict]], k: int = 60) -> list[dict]:
    scores: dict[str, float] = {}
    id_map: dict[str, dict] = {}
    for lst in lists:
        for rank, item in enumerate(lst):
            cid = item["id"]
            scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank + 1)
            id_map[cid] = item
    return [{"rrf_score": round(scores[cid], 6), **id_map[cid]}
            for cid in sorted(scores, key=scores.__getitem__, reverse=True)]


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/upload", methods=["POST"])
def api_upload():
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "No file"}), 400
    ext = Path(f.filename).suffix.lower()
    if ext not in (".csv", ".xlsx", ".xls"):
        return jsonify({"error": f"Unsupported format '{ext}'. Use CSV, XLSX, or XLS."}), 400

    fid = str(uuid.uuid4())
    path = os.path.join(UPLOADS_DIR, f"{fid}{ext}")
    f.save(path)

    try:
        df = pd.read_csv(path) if ext == ".csv" else pd.read_excel(path)
        df = df.fillna("")
    except Exception as e:
        return jsonify({"error": f"Parse error: {e}"}), 400

    cols = list(df.columns)
    kw = ["id", "title", "name", "step", "expect", "result", "desc", "precond",
          "priority", "tag", "label", "component", "summary", "action"]
    suggested = [c for c in cols if any(k in c.lower() for k in kw)] or cols[:5]

    return jsonify({
        "file_id": fid, "file_path": path, "filename": f.filename,
        "row_count": len(df), "columns": cols, "suggested_columns": suggested,
        "preview": df.head(5).to_dict("records"),
    })


@app.route("/api/ingest", methods=["POST"])
def api_ingest():
    payload       = request.get_json(force=True)
    file_path     = payload["file_path"]
    columns       = payload["columns"]
    chunk_size    = int(payload.get("chunk_size", CHUNK_SIZE))
    chunk_overlap = int(payload.get("chunk_overlap", CHUNK_OVERLAP))
    append_mode   = bool(payload.get("append", False))   # True = add to existing data

    def generate():
        try:
            # ── 1. Parse ──────────────────────────────────────────
            yield f"data: {json.dumps({'t':'step','s':'parse','st':'run','m':'Parsing file...'})}\n\n"
            ext = Path(file_path).suffix.lower()
            df = pd.read_csv(file_path) if ext == ".csv" else pd.read_excel(file_path)
            df = df.fillna("")
            rows = len(df)
            yield f"data: {json.dumps({'t':'step','s':'parse','st':'ok','m':f'Parsed {rows} test cases','rows':rows,'cols':list(df.columns)})}\n\n"

            # ── 2. Chunk ──────────────────────────────────────────
            yield f"data: {json.dumps({'t':'step','s':'chunk','st':'run','m':'Creating chunks...','p':0})}\n\n"
            # In append mode, offset IDs so new chunks don't collide with existing ones
            existing_count = len(state["chunks"]) if append_mode else 0
            row_offset = max((c["source_row"] for c in state["chunks"]), default=0) if append_mode else 0
            chunks = []
            for idx, row in df.iterrows():
                parts = [f"{c}: {str(row[c]).strip()}" for c in columns
                         if c in df.columns and str(row.get(c, "")).strip()]
                doc = "\n".join(parts)
                if not doc.strip():
                    continue
                row_chunks = make_chunks(doc, chunk_size, chunk_overlap)
                n = len(row_chunks)
                for ci, ct in enumerate(row_chunks):
                    chunks.append({
                        "id":          f"r{row_offset+idx+1}_c{ci+1}",
                        "source_row":  int(row_offset + idx + 1),
                        "chunk_index": ci + 1,
                        "total_chunks": n,
                        "text":        ct,
                        "char_count":  len(ct),
                        "word_count":  len(ct.split()),
                        "overlap_in":  min(chunk_overlap, len(ct)) if ci > 0 else 0,
                        "overlap_out": min(chunk_overlap, len(ct)) if ci < n - 1 else 0,
                        "meta":        {c: str(row.get(c, ""))[:80]
                                        for c in columns[:3] if str(row.get(c, "")).strip()},
                    })
                if (idx + 1) % 100 == 0 or idx + 1 == rows:
                    pct = int((idx + 1) / rows * 100)
                    yield f"data: {json.dumps({'t':'step','s':'chunk','st':'run','m':f'Chunked {idx+1}/{rows} rows → {len(chunks)} chunks','p':pct})}\n\n"

            avg_chars = round(sum(c["char_count"] for c in chunks) / max(len(chunks), 1))
            multi = sum(1 for c in chunks if c["total_chunks"] > 1)
            yield f"data: {json.dumps({'t':'step','s':'chunk','st':'ok','m':f'{len(chunks)} chunks · avg {avg_chars} chars · {multi} chunks from multi-chunk rows','n':len(chunks),'avg':avg_chars,'multi':multi})}\n\n"

            # ── 3. Embed ──────────────────────────────────────────
            yield f"data: {json.dumps({'t':'step','s':'embed','st':'run','m':'Generating BGE-large embeddings...','p':0})}\n\n"
            BATCH = 32
            all_embs = []
            for i in range(0, len(chunks), BATCH):
                texts = [c["text"] for c in chunks[i:i + BATCH]]
                all_embs.extend(embed_model.encode(texts, show_progress_bar=False).tolist())
                pct = int(min(i + BATCH, len(chunks)) / len(chunks) * 100)
                yield f"data: {json.dumps({'t':'step','s':'embed','st':'run','m':f'Embedded {min(i+BATCH,len(chunks))}/{len(chunks)}','p':pct})}\n\n"

            dims = len(all_embs[0])
            yield f"data: {json.dumps({'t':'step','s':'embed','st':'ok','m':f'{len(all_embs)} vectors · {dims}-dim · BAAI/bge-large-en-v1.5','dims':dims})}\n\n"

            # ── 4. Qdrant ─────────────────────────────────────────
            mode_label = "Appending to" if append_mode else "Creating"
            yield f"data: {json.dumps({'t':'step','s':'qdrant','st':'run','m':f'{mode_label} Qdrant collection...','p':0})}\n\n"
            if not append_mode:
                try:
                    qdrant.delete_collection(COLLECTION)
                except Exception:
                    pass
                qdrant.create_collection(COLLECTION, vectors_config=VectorParams(size=dims, distance=Distance.COSINE))
            else:
                # Ensure collection exists; create if missing
                try:
                    qdrant.get_collection(COLLECTION)
                except Exception:
                    qdrant.create_collection(COLLECTION, vectors_config=VectorParams(size=dims, distance=Distance.COSINE))

            # Point IDs must be globally unique integers — offset by existing count
            points = [
                PointStruct(id=existing_count + i, vector=all_embs[i],
                            payload={"chunk_id": chunks[i]["id"],
                                     "source_row": chunks[i]["source_row"],
                                     "chunk_idx": chunks[i]["chunk_index"],
                                     "text": chunks[i]["text"],
                                     **chunks[i]["meta"]})
                for i in range(len(chunks))
            ]
            UB = 256
            for i in range(0, len(points), UB):
                qdrant.upsert(COLLECTION, points=points[i:i + UB])
                pct = int(min(i + UB, len(points)) / len(points) * 100)
                yield f"data: {json.dumps({'t':'step','s':'qdrant','st':'run','m':f'Stored {min(i+UB,len(points))}/{len(points)} vectors','p':pct})}\n\n"

            yield f"data: {json.dumps({'t':'step','s':'qdrant','st':'ok','m':f'{len(points)} vectors stored · cosine similarity · local persistent'})}\n\n"

            # ── 5. BM25 ───────────────────────────────────────────
            # In append mode, merge new chunks with existing ones for BM25
            all_chunks_merged = (state["chunks"] + chunks) if append_mode else chunks
            yield f"data: {json.dumps({'t':'step','s':'bm25','st':'run','m':f'Building BM25 index over {len(all_chunks_merged)} total documents...'})}\n\n"
            corpus = [c["text"].lower().split() for c in all_chunks_merged]
            bm25_obj = BM25Okapi(corpus)
            with open(BM25_FILE, "wb") as fh:
                pickle.dump({"corpus": corpus}, fh)
            yield f"data: {json.dumps({'t':'step','s':'bm25','st':'ok','m':f'BM25 index ready · {len(corpus)} total documents'})}\n\n"

            # ── Save merged state ──────────────────────────────────
            with open(CHUNKS_FILE, "w", encoding="utf-8") as fh:
                json.dump(all_chunks_merged, fh, indent=2, ensure_ascii=False)

            state["chunks"]      = all_chunks_merged
            state["bm25_index"]  = bm25_obj
            state["bm25_corpus"] = corpus
            state["ready"]       = True

            total = len(all_chunks_merged)
            action = "appended" if append_mode else "ingested"
            yield f"data: {json.dumps({'t':'done','m':f'Ingestion complete — {len(chunks)} new chunks {action} · {total} total','chunks':total,'rows':rows})}\n\n"

        except Exception as exc:
            import traceback
            yield f"data: {json.dumps({'t':'error','m':str(exc),'trace':traceback.format_exc()[-500:]})}\n\n"

    return Response(
        stream_with_context(generate()),
        content_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


@app.route("/api/chunks")
def api_chunks():
    return jsonify(state["chunks"])


@app.route("/api/stats")
def api_stats():
    vcount = 0
    try:
        info = qdrant.get_collection(COLLECTION)
        vcount = info.vectors_count or 0
    except Exception:
        pass
    return jsonify({
        "ready": state["ready"],
        "chunk_count": len(state["chunks"]),
        "vector_count": vcount,
        "collection": COLLECTION,
        "embed_model": EMBED_MODEL,
        "rerank_model": RERANK_MODEL,
        "llm_model": GROQ_MODEL,
    })


@app.route("/api/chat", methods=["POST"])
def api_chat():
    if not state["ready"]:
        return jsonify({"error": "No data ingested yet. Upload a CSV/Excel file first."}), 400

    body        = request.get_json(force=True)
    query       = (body.get("query") or "").strip()
    top_dense   = int(body.get("top_dense", 20))
    top_bm25    = int(body.get("top_bm25", 20))
    top_rerank  = int(body.get("top_rerank", 5))

    if not query:
        return jsonify({"error": "query is required"}), 400

    out = {"query": query, "steps": {}, "answer": "", "total_ms": 0}
    t0 = time.time()

    # 1 · Embed query
    t = time.time()
    q_vec = embed_model.encode(QUERY_PREFIX + query, show_progress_bar=False).tolist()
    out["steps"]["embedding"] = {
        "model": EMBED_MODEL, "prefix": QUERY_PREFIX,
        "dims": len(q_vec), "ms": round((time.time() - t) * 1000, 1),
    }

    # 2 · Dense retrieval (Qdrant)
    t = time.time()
    hits = qdrant.search(COLLECTION, query_vector=q_vec, limit=top_dense)
    dense = [{"id": h.payload.get("chunk_id", str(h.id)),
               "score": round(h.score, 4),
               "source_row": h.payload.get("source_row"),
               "text": h.payload.get("text", "")} for h in hits]
    out["steps"]["dense"] = {
        "retrieved": len(dense), "top_score": dense[0]["score"] if dense else 0,
        "ms": round((time.time() - t) * 1000, 1), "results": dense[:8],
    }

    # 3 · BM25 retrieval
    t = time.time()
    sparse = []
    if state["bm25_index"]:
        bm25_scores = state["bm25_index"].get_scores(query.lower().split())
        top_idx = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)[:top_bm25]
        sparse = [{"id": state["chunks"][i]["id"],
                   "score": round(float(bm25_scores[i]), 4),
                   "source_row": state["chunks"][i]["source_row"],
                   "text": state["chunks"][i]["text"]}
                  for i in top_idx if bm25_scores[i] > 0]
    out["steps"]["bm25"] = {
        "retrieved": len(sparse), "top_score": sparse[0]["score"] if sparse else 0,
        "ms": round((time.time() - t) * 1000, 1), "results": sparse[:8],
    }

    # 4 · RRF Fusion
    t = time.time()
    fused = rrf([dense, sparse])
    out["steps"]["rrf"] = {
        "input_dense": len(dense), "input_bm25": len(sparse),
        "output_unique": len(fused), "ms": round((time.time() - t) * 1000, 1),
        "results": fused[:8],
    }

    # 5 · Re-ranking
    t = time.time()
    pool = fused[:max(top_rerank * 4, 20)]
    ce_scores = cross_enc.predict([(query, c["text"]) for c in pool]).tolist()
    reranked = sorted(zip(pool, ce_scores), key=lambda x: x[1], reverse=True)
    final = [c for c, _ in reranked[:top_rerank]]
    out["steps"]["rerank"] = {
        "model": RERANK_MODEL,
        "input_count": len(pool), "output_count": len(final),
        "ms": round((time.time() - t) * 1000, 1),
        "before": [{"rank": i + 1, "id": c["id"], "rrf_score": c.get("rrf_score", 0)}
                   for i, c in enumerate(pool[:top_rerank])],
        "after":  [{"rank": i + 1, "id": c["id"], "ce_score": round(float(s), 4)}
                   for i, (c, s) in enumerate(reranked[:top_rerank])],
    }

    # 6 · LLM
    t = time.time()
    ctx = "\n\n---\n\n".join(
        f"[Test Case — Row {c.get('source_row','?')}]\n{c['text']}" for c in final
    )
    sys_p = ("You are an expert QA assistant for app.vwo.com. "
             "Answer questions about test cases using ONLY the provided context. "
             "When generating new test cases, follow the exact format of the examples. "
             "Be precise, structured, and helpful.")
    llm_r = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "system", "content": sys_p},
                  {"role": "user",   "content": f"Context:\n\n{ctx}\n\n---\nQuery: {query}\n\nResponse:"}],
        max_tokens=900, temperature=0.1,
    )
    answer = llm_r.choices[0].message.content.strip()
    out["steps"]["llm"] = {
        "model": GROQ_MODEL,
        "prompt_tokens": llm_r.usage.prompt_tokens,
        "completion_tokens": llm_r.usage.completion_tokens,
        "context_chunks": len(final),
        "ms": round((time.time() - t) * 1000, 1),
    }

    out["answer"] = answer
    out["context_chunks"] = [{"id": c["id"], "text": c["text"],
                               "source_row": c.get("source_row")} for c in final]
    out["total_ms"] = round((time.time() - t0) * 1000, 1)
    return jsonify(out)


if __name__ == "__main__":
    print("\n  Open: http://localhost:5012\n")
    app.run(debug=False, port=5012, host="0.0.0.0", threaded=True)
