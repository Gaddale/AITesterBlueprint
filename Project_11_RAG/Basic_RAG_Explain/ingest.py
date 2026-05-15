"""
RAG Ingestion Pipeline
Reads PDF → Chunks → Nomic Embed → ChromaDB
"""
import os
import sys
import json
import pypdf
import chromadb
from sentence_transformers import SentenceTransformer

PDF_PATH = os.path.join("Data", "Product Requirements Document_ VWO Login Dashboard.pdf")
CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "vwo_docs"
CHUNK_SIZE = 1000   # characters
CHUNK_OVERLAP = 150 # characters

print("=" * 60)
print("  VWO Login Dashboard - RAG Ingestion Pipeline")
print("=" * 60)

if not os.path.exists(PDF_PATH):
    print(f"ERROR: PDF not found at '{PDF_PATH}'")
    sys.exit(1)

print("\n[1/4] Loading Nomic Embed Text v1 model (downloads ~548MB first time)...")
embed_model = SentenceTransformer("nomic-ai/nomic-embed-text-v1", trust_remote_code=True)
print("      ✓ Nomic Embed model loaded")


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        # Try to break at a sentence boundary
        if end < len(text):
            last_period = chunk.rfind(". ")
            last_newline = chunk.rfind("\n")
            break_at = max(last_period, last_newline)
            if break_at > chunk_size // 2:
                chunk = text[start:start + break_at + 1]
                end = start + break_at + 1
        chunks.append(chunk.strip())
        start = end - overlap
    return [c for c in chunks if len(c.strip()) > 50]


def get_embeddings(texts: list[str], is_query: bool = False) -> list[list[float]]:
    prefix = "search_query: " if is_query else "search_document: "
    prefixed = [prefix + t for t in texts]
    return embed_model.encode(prefixed, show_progress_bar=False).tolist()


def ingest():
    print(f"\n[2/4] Extracting text from PDF...")
    reader = pypdf.PdfReader(PDF_PATH)
    total_pages = len(reader.pages)
    print(f"      ✓ Found {total_pages} pages")

    all_chunks = []
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        text = text.strip()
        if not text:
            continue

        page_chunks = chunk_text(text)
        for chunk_idx, chunk_text_content in enumerate(page_chunks):
            all_chunks.append({
                "id": f"p{page_num + 1}_c{chunk_idx + 1}",
                "text": chunk_text_content,
                "page": page_num + 1,
                "total_pages": total_pages,
                "chunk_idx": chunk_idx + 1,
                "total_chunks_on_page": len(page_chunks),
                "char_count": len(chunk_text_content),
                "word_count": len(chunk_text_content.split()),
            })

    print(f"      ✓ Created {len(all_chunks)} chunks across {total_pages} pages")

    print(f"\n[3/4] Generating Nomic embeddings and storing in ChromaDB...")
    client = chromadb.PersistentClient(path=CHROMA_DIR)

    # Reset collection if it exists
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"      ↻ Cleared existing collection '{COLLECTION_NAME}'")
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine", "description": "VWO Login Dashboard PRD"}
    )

    BATCH = 16
    for i in range(0, len(all_chunks), BATCH):
        batch = all_chunks[i: i + BATCH]
        texts = [c["text"] for c in batch]
        ids = [c["id"] for c in batch]
        metadatas = [{
            "page": c["page"],
            "chunk_idx": c["chunk_idx"],
            "char_count": c["char_count"],
            "word_count": c["word_count"],
            "total_pages": c["total_pages"],
        } for c in batch]

        embeddings = get_embeddings(texts)
        collection.add(ids=ids, documents=texts, embeddings=embeddings, metadatas=metadatas)
        print(f"      → Ingested chunks {i + 1}–{min(i + BATCH, len(all_chunks))} / {len(all_chunks)}")

    print(f"      ✓ ChromaDB collection '{COLLECTION_NAME}' ready")

    print(f"\n[4/4] Saving chunk metadata to chunks.json...")
    with open("chunks.json", "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)
    print(f"      ✓ chunks.json saved ({len(all_chunks)} chunks)")

    print("\n" + "=" * 60)
    print(f"  INGESTION COMPLETE")
    print(f"  Total chunks : {len(all_chunks)}")
    print(f"  ChromaDB path: {CHROMA_DIR}/")
    print(f"  Embed model  : nomic-ai/nomic-embed-text-v1")
    print("=" * 60)
    print("\nNext step: python3 app.py")


if __name__ == "__main__":
    ingest()
