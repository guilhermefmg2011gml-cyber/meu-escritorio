# ===========================================================
# ingest_docs.py
# Indexa peças, modelos e documentos antigos no ChromaDB
# ===========================================================
import os
import uuid
from pathlib import Path

from docx import Document
from PyPDF2 import PdfReader

from pipeline_juridico import (
    upsert_peca,
    upsert_modelo,
    upsert_juris,
    upsert_doc_cliente,
)

# ===========================================================
# CONFIG
# ===========================================================
INGEST_DIR = Path("./storage/ingest").resolve()
if not INGEST_DIR.exists():
    INGEST_DIR.mkdir(parents=True)
    print(f"[+] Pasta criada: {INGEST_DIR}")
    print("Coloque aqui seus arquivos .pdf, .docx ou .txt para indexação.")
    raise SystemExit(0)

print(f"[•] Lendo arquivos em: {INGEST_DIR}")


# ===========================================================
# LEITORES DE ARQUIVOS
# ===========================================================
def read_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def read_docx(path: Path) -> str:
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)


def read_pdf(path: Path) -> str:
    texto = ""
    with open(path, "rb") as f:
        reader = PdfReader(f)
        for page in reader.pages:
            texto += page.extract_text() or ""
    return texto


# ===========================================================
# DETECÇÃO AUTOMÁTICA DE ÁREA JURÍDICA
# ===========================================================
def detectar_area(texto: str) -> str:
    texto_l = texto.lower()
    padroes = {
        "civil": ["obrigação", "contrato", "indenização", "cpc"],
        "consumidor": ["consumidor", "fornecedor", "cdc", "produto", "serviço"],
        "empresarial": ["sociedade", "falência", "recuperação judicial", "empresa", "título de crédito"],
        "trabalho": ["clt", "empregado", "empregador", "trabalhista", "rescisão"],
        "penal": ["crime", "pena", "denúncia", "prisão", "cpp", "reclusão"],
        "remedios_constitucionais": [
            "mandado de segurança",
            "habeas corpus",
            "habeas data",
            "injunção",
        ],
    }
    for area, termos in padroes.items():
        if any(t in texto_l for t in termos):
            return area
    return "geral"


# ===========================================================
# CATEGORIZAÇÃO PELO NOME DO ARQUIVO
# ===========================================================
def detectar_tipo(nome: str) -> str:
    nome_l = nome.lower()
    if "modelo" in nome_l or "minuta" in nome_l:
        return "modelo"
    if "juris" in nome_l or "acórdão" in nome_l or "ementa" in nome_l:
        return "juris"
    if "proc" in nome_l or "doc" in nome_l or "anexo" in nome_l:
        return "doc"
    return "peca"


# ===========================================================
# PROCESSAMENTO
# ===========================================================
count = 0
for file in INGEST_DIR.iterdir():
    if file.suffix.lower() not in {".pdf", ".docx", ".txt"}:
        continue

    print(f"\n[→] Lendo: {file.name}")
    try:
        if file.suffix.lower() == ".pdf":
            texto = read_pdf(file)
        elif file.suffix.lower() == ".docx":
            texto = read_docx(file)
        else:
            texto = read_txt(file)
    except Exception as e:
        print(f"[x] Erro ao ler {file.name}: {e}")
        continue

    if not texto.strip():
        print("[!] Arquivo vazio ou ilegível, ignorado.")
        continue

    tipo = detectar_tipo(file.name)
    area = detectar_area(texto)

    try:
        if tipo == "modelo":
            upsert_modelo(texto, assunto=area)
            print(f"[✓] Modelo indexado ({area})")
        elif tipo == "juris":
            upsert_juris(texto, origem=area)
            print(f"[✓] Jurisprudência indexada ({area})")
        elif tipo == "doc":
            upsert_doc_cliente(texto, nome=file.name)
            print("[✓] Documento indexado")
        else:
            upsert_peca(texto)
            print(f"[✓] Peça processual indexada ({area})")
        count += 1
    except Exception as e:
        print(f"[x] Falha ao indexar {file.name}: {e}")

print(f"\n[✔] Ingestão concluída: {count} arquivos processados.")