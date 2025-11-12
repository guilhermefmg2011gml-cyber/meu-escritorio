# ===========================================================
# inspecionar_chroma.py
# Auditoria e inspeção do banco vetorial ChromaDB
# ===========================================================
import os
from pathlib import Path

import chromadb
from chromadb.config import Settings

# ===========================================================
# CONFIG
# ===========================================================
CHROMA_DIR = os.getenv("CHROMA_DIR", "./storage/chroma")
if not Path(CHROMA_DIR).exists():
    print(f"[x] Diretório Chroma não encontrado em {CHROMA_DIR}")
    raise SystemExit(1)

client = chromadb.Client(Settings(persist_directory=CHROMA_DIR, anonymized_telemetry=False))

# ===========================================================
# LISTAR COLEÇÕES EXISTENTES
# ===========================================================
print(f"\n📂 Inspecionando base vetorial em: {CHROMA_DIR}\n")

collections = client.list_collections()
if not collections:
    print("[!] Nenhuma coleção encontrada.")
    raise SystemExit(0)

for col_meta in collections:
    name = col_meta.name
    col = client.get_collection(name)
    print(f"🔸 Coleção: {name}")
    print(f"    → {col.count()} vetores armazenados.")

    try:
        res = col.get(limit=5)
        docs = res.get("documents", [])
        metas = res.get("metadatas", [])
        ids = res.get("ids", [])

        if not docs:
            print("    (coleção vazia)")
            continue

        for i, txt in enumerate(docs):
            meta = metas[i] if metas and i < len(metas) else {}
            print(f"\n    🧩 ID: {ids[i]}")
            if meta:
                print(f"    📎 Meta: {meta}")
            trecho = (txt[:200].replace("\n", " ") + "...") if len(txt) > 200 else txt
            print(f"    📖 Trecho: {trecho}")
        print("\n" + "-" * 70)

    except Exception as e:
        print(f"    [x] Erro ao acessar coleção {name}: {e}")
        print("-" * 70)

# ===========================================================
# RESUMO GERAL
# ===========================================================
total = sum([client.get_collection(c.name).count() for c in collections])
print(f"\n✅ Total geral de vetores indexados: {total}")
print("🔍 Inspeção concluída.\n")