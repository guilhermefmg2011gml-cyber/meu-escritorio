# ===========================================================
# Moura Martins Advogados - Backend Jurídico Inteligente
# ===========================================================
import os
import json
import sqlite3
import datetime
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any

from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pydantic import BaseModel, Field, ValidationError
from werkzeug.utils import secure_filename
from openai import OpenAI

# módulos internos
from pipeline_juridico import pipeline_gerar_peca, DOCS_DIR
from services.prompt_juridico import get_prompt_by_area

# ===========================================================
# CONFIGURAÇÕES INICIAIS
# ===========================================================
load_dotenv()
APP_DIR = Path(__file__).parent.resolve()
STORAGE = APP_DIR / "storage"
UPLOADS = STORAGE / "uploads"
DOCS = STORAGE / "docs"
for p in (STORAGE, UPLOADS, DOCS):
    p.mkdir(parents=True, exist_ok=True)

DB_PATH = APP_DIR / "memoria.sqlite3"
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-turbo")
PORT = int(os.getenv("PORT", "5000"))

# Caminhos do projeto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
DIST_DIR = os.path.join(ROOT_DIR, "dist")
ADMIN_DIR = os.path.join(ROOT_DIR, "public", "admin")

app = Flask(
    __name__,
    static_folder=DIST_DIR,
    static_url_path="/"
)


# --- Rotas do site institucional (frontend React) ---
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_front(path):
    if path != "" and os.path.exists(os.path.join(DIST_DIR, path)):
        return send_from_directory(DIST_DIR, path)
    else:
        return send_from_directory(DIST_DIR, "index.html")


# --- Rotas do painel administrativo ---
@app.route("/admin/<path:filename>")
def serve_admin(filename):
    return send_from_directory(ADMIN_DIR, filename)


# --- Exemplo de rota da API ---
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "Moura Martins Backend"})

CORS(app, resources={r"/api/*": {"origins": "*"}})

# ===========================================================
# BANCO DE DADOS (MEMÓRIA)
# ===========================================================
def db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    with db() as con:
        con.execute(
            """
        CREATE TABLE IF NOT EXISTS memoria (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cliente_id TEXT,
          processo_id TEXT,
          mensagens TEXT,
          ultima_peca TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )"""
        )


init_db()

# ===========================================================
# SCHEMAS (Pydantic)
# ===========================================================
class Anexo(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    url: Optional[str] = None
    size: Optional[int] = None


class Contexto(BaseModel):
    tipoPeca: str = Field(default="Petição inicial")
    area: Optional[str] = None
    clienteId: Optional[str] = None
    processoId: Optional[str] = None
    documentos: List[str] = Field(default_factory=list)
    anexos: List[Anexo] = Field(default_factory=list)


class Mensagem(BaseModel):
    role: str
    content: str
    meta: Optional[str] = None


class ReqGerar(BaseModel):
    contexto: Contexto
    historico: List[Mensagem] = Field(default_factory=list)
    prompt: str


class ReqRefinar(BaseModel):
    contexto: Contexto
    historico: List[Mensagem] = Field(default_factory=list)
    textoBase: str
    instrucao: str


# ===========================================================
# HELPERS
# ===========================================================
def url_for_doc(filename: str) -> str:
    return f"/api/files/{filename}"


# ===========================================================
# ROTA DE SAÚDE
# ===========================================================
@app.get("/api/health")
def health():
    return jsonify(ok=True, model=OPENAI_MODEL)


# ===========================================================
# /api/pecas/gerar  →  pipeline completo
# ===========================================================
@app.post("/api/pecas/gerar")
def api_gerar():
    try:
        data = ReqGerar(**request.get_json(force=True))
    except ValidationError as e:
        return (
            jsonify({"error": "payload inválido", "detail": json.loads(e.json())}),
            400,
        )

    # coleta fatos e pedidos do histórico
    facts, pedidos = "", ""
    for m in data.historico:
        if m.role == "user" and (m.meta == "fatos" or not facts):
            facts = m.content
            break
    for m in data.historico[::-1]:
        if m.role == "user" and (m.meta == "pedidos" or "Pedidos:" in m.content):
            pedidos = m.content
            break

    facts = facts or data.prompt or "—"
    pedidos = pedidos or "a) Citação da parte ré; b) Procedência; c) Custas e honorários."

    # chamada do pipeline jurídico completo
    out = pipeline_gerar_peca(
        tipo_peca=data.contexto.tipoPeca,
        facts=facts,
        pedidos=pedidos,
        documentos=data.contexto.documentos,
        cliente_id=data.contexto.clienteId,
        processo_id=data.contexto.processoId,
        area=data.contexto.area,
    )

    # salva memória
    with db() as con:
        con.execute(
            """
        INSERT INTO memoria (cliente_id, processo_id, mensagens, ultima_peca, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
            (
                data.contexto.clienteId,
                data.contexto.processoId,
                json.dumps([m.dict() for m in data.historico], ensure_ascii=False),
                out["texto"],
                datetime.datetime.utcnow().isoformat() + "Z",
            ),
        )

    return jsonify({"texto": out["texto"], "downloadUrl": url_for_doc(out["docx"])})


# ===========================================================
# /api/pecas/refinar
# ===========================================================
@app.post("/api/pecas/refinar")
def api_refinar():
    try:
        data = ReqRefinar(**request.get_json(force=True))
    except ValidationError as e:
        return (
            jsonify({"error": "payload inválido", "detail": json.loads(e.json())}),
            400,
        )

    # system prompt conforme área
    prompt_base = get_prompt_by_area(data.contexto.area)
    messages = [
        {"role": "system", "content": prompt_base},
        {
            "role": "user",
            "content": f"Refine a peça abaixo:\n\n{data.textoBase}\n\nInstrução: {data.instrucao}",
        },
    ]

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=messages,
        temperature=0.3,
    )
    texto = resp.choices[0].message.content.strip()

    # salva como novo docx
    from pipeline_juridico import docx_formatar

    fname = docx_formatar(texto, data.contexto.clienteId, data.contexto.processoId)
    return jsonify({"texto": texto, "downloadUrl": url_for_doc(fname)})


# ===========================================================
# /api/memoria/listar
# ===========================================================
@app.get("/api/memoria/listar")
def mem_listar():
    cid = request.args.get("clienteId")
    pid = request.args.get("processoId")
    with db() as con:
        cur = con.execute(
            """
        SELECT mensagens, ultima_peca FROM memoria
        WHERE (cliente_id = ? OR ? IS NULL) AND (processo_id = ? OR ? IS NULL)
        ORDER BY id DESC LIMIT 1
        """,
            (cid, cid, pid, pid),
        )
        row = cur.fetchone()
        if not row:
            return jsonify({"mensagens": [], "ultimaPeca": None})
        return jsonify(
            {
                "mensagens": json.loads(row["mensagens"]) if row["mensagens"] else [],
                "ultimaPeca": row["ultima_peca"],
            }
        )


# ===========================================================
# /api/memoria/salvar
# ===========================================================
@app.post("/api/memoria/salvar")
def mem_salvar():
    payload = request.get_json(force=True)
    cid = payload.get("clienteId")
    pid = payload.get("processoId")
    mensagens = payload.get("mensagens", [])
    ultima = payload.get("ultimaPeca", None)
    with db() as con:
        con.execute(
            """
        INSERT INTO memoria (cliente_id, processo_id, mensagens, ultima_peca, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
            (
                cid,
                pid,
                json.dumps(mensagens, ensure_ascii=False),
                ultima,
                datetime.datetime.utcnow().isoformat() + "Z",
            ),
        )
    return jsonify({"ok": True})


# ===========================================================
# /api/documentos/upload
# ===========================================================
@app.post("/api/documentos/upload")
def upload():
    clienteId = request.form.get("clienteId")
    processoId = request.form.get("processoId")
    files = request.files.getlist("file")
    items: List[Dict[str, Any]] = []

    cliente_slug = secure_filename(clienteId) if clienteId else "tmp"
    cliente_slug = cliente_slug or "tmp"
    processo_slug = secure_filename(processoId) if processoId else "semproc"
    processo_slug = processo_slug or "semproc"
    cli_folder = UPLOADS / f"{cliente_slug}_{processo_slug}"
    cli_folder.mkdir(parents=True, exist_ok=True)

    for f in files:
        fname = secure_filename(f.filename)
        if not fname:
            fname = "arquivo"
        out = cli_folder / f"{uuid.uuid4().hex}_{fname}"
        f.save(out)
        items.append(
            {
                "id": out.stem,
                "name": fname,
                "size": out.stat().st_size,
                "url": f"/api/files/{out.relative_to(UPLOADS).as_posix()}",
            }
        )
    return jsonify({"items": items, "clienteId": clienteId, "processoId": processoId})


# ===========================================================
# /api/files/<fname>
# ===========================================================
@app.get("/api/files/<path:fname>")
def files(fname):
    f1 = DOCS / fname
    f2 = UPLOADS / fname
    if f1.exists():
        return send_from_directory(DOCS, fname, as_attachment=True)
    if f2.exists():
        return send_from_directory(UPLOADS, fname, as_attachment=True)
    return "Not found", 404


# ===========================================================
# /api/tavily/search (opcional)
# ===========================================================
@app.post("/api/tavily/search")
def tavily_search():
    from services.prompt_juridico import buscar_jurisprudencia

    payload = request.get_json(force=True)
    q = payload.get("query", "")
    area = payload.get("area", "")
    res = buscar_jurisprudencia(q, area)
    return jsonify({"query": q, "results": res})


# ===========================================================
# MAIN
# ===========================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)