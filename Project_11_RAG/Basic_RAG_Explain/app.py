"""
RAG Flask Server
Serves the HTML UI and provides API endpoints for chunk retrieval and LLM querying.
"""
import os
import json
import time
import chromadb
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "vwo_docs"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.2-1b-preview")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

app = Flask(__name__)
CORS(app)

print("=" * 60)
print("  VWO RAG System - Starting Flask Server")
print("=" * 60)

print("\n[1/3] Loading Nomic Embed Text v1...")
embed_model = SentenceTransformer("nomic-ai/nomic-embed-text-v1", trust_remote_code=True)
print("      ✓ Embed model ready")

print("[2/3] Connecting to ChromaDB...")
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
try:
    collection = chroma_client.get_collection(COLLECTION_NAME)
    print(f"      ✓ Collection '{COLLECTION_NAME}' loaded ({collection.count()} chunks)")
except Exception as e:
    print(f"      ✗ ERROR: {e}")
    print("      Run 'python3 ingest.py' first to ingest the PDF.")
    collection = None

print("[3/3] Initialising Groq client...")
groq_client = Groq(api_key=GROQ_API_KEY)
print(f"      ✓ Groq ready (model: {GROQ_MODEL})")
print("\n" + "=" * 60)


def get_query_embedding(text: str) -> list[float]:
    prefixed = "search_query: " + text
    return embed_model.encode([prefixed], show_progress_bar=False).tolist()[0]


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/chunks")
def api_chunks():
    if not os.path.exists("chunks.json"):
        return jsonify({"error": "chunks.json not found. Run ingest.py first."}), 500
    with open("chunks.json", encoding="utf-8") as f:
        chunks = json.load(f)
    return jsonify(chunks)


@app.route("/api/stats")
def api_stats():
    if collection is None:
        return jsonify({"error": "ChromaDB not ready"}), 500
    count = collection.count()
    chunks_on_disk = 0
    if os.path.exists("chunks.json"):
        with open("chunks.json") as f:
            chunks_on_disk = len(json.load(f))
    return jsonify({
        "chroma_count": count,
        "chunks_json": chunks_on_disk,
        "collection": COLLECTION_NAME,
        "chroma_dir": CHROMA_DIR,
        "embed_model": "nomic-ai/nomic-embed-text-v1",
        "llm_model": GROQ_MODEL,
    })


@app.route("/api/query", methods=["POST"])
def api_query():
    if collection is None:
        return jsonify({"error": "ChromaDB not ready. Run ingest.py first."}), 500

    data = request.get_json(force=True)
    user_query = (data.get("query") or "").strip()
    top_k = int(data.get("top_k", 3))

    if not user_query:
        return jsonify({"error": "query field is required"}), 400

    t0 = time.time()

    # Step 1 – embed the query
    query_embedding = get_query_embedding(user_query)
    embed_time = round((time.time() - t0) * 1000, 1)

    # Step 2 – retrieve from ChromaDB
    t1 = time.time()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"],
    )
    retrieve_time = round((time.time() - t1) * 1000, 1)

    retrieved_chunks = []
    context_parts = []

    for i, chunk_id in enumerate(results["ids"][0]):
        text = results["documents"][0][i]
        meta = results["metadatas"][0][i]
        distance = results["distances"][0][i]
        similarity = round(1 - distance, 4)

        retrieved_chunks.append({
            "id": chunk_id,
            "text": text,
            "page": meta.get("page"),
            "chunk_idx": meta.get("chunk_idx"),
            "char_count": meta.get("char_count"),
            "word_count": meta.get("word_count"),
            "similarity": similarity,
            "rank": i + 1,
        })
        context_parts.append(
            f"[Source: Page {meta.get('page')}, Chunk {meta.get('chunk_idx')}]\n{text}"
        )

    context = "\n\n---\n\n".join(context_parts)

    # Step 3 – generate answer with Groq
    system_prompt = (
        "You are a precise assistant analyzing the VWO Login Dashboard Product Requirements Document. "
        "Answer using ONLY the provided context. Be concise and factual. "
        "If the answer is not in the context, say so clearly."
    )
    user_prompt = f"""Context from the document:

{context}

---
Question: {user_query}

Answer:"""

    t2 = time.time()
    chat_response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=600,
        temperature=0.1,
    )
    llm_time = round((time.time() - t2) * 1000, 1)
    total_time = round((time.time() - t0) * 1000, 1)

    answer = chat_response.choices[0].message.content.strip()

    return jsonify({
        "query": user_query,
        "answer": answer,
        "retrieved_chunks": retrieved_chunks,
        "timing": {
            "embed_ms": embed_time,
            "retrieve_ms": retrieve_time,
            "llm_ms": llm_time,
            "total_ms": total_time,
        },
        "models": {
            "embed": "nomic-ai/nomic-embed-text-v1",
            "llm": GROQ_MODEL,
        },
    })


if __name__ == "__main__":
    print(f"\nStarting server at http://localhost:5011\n")
    app.run(debug=False, port=5011, host="0.0.0.0")
