import { useMemo, useState } from "react";

const DEFAULT_PARTE = { nome: "", papel: "autor" };
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

function createEmptyParte() {
  return { ...DEFAULT_PARTE };
}

export default function NovaPeca() {
  const [tipoPeca, setTipoPeca] = useState("peticao_inicial");
  const [resumo, setResumo] = useState("");
  const [partes, setPartes] = useState([createEmptyParte()]);
  const [pedidos, setPedidos] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [processoId, setProcessoId] = useState("");
  const [resposta, setResposta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = useMemo(() => {
    if (!tipoPeca) return false;
    if (!resumo.trim()) return false;
    return partes.some((parte) => parte.nome.trim());
  }, [tipoPeca, resumo, partes]);

  const addParte = () => {
    setPartes((prev) => [...prev, createEmptyParte()]);
  };

  const updateParte = (index, field, value) => {
    setPartes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeParte = (index) => {
    setPartes((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const gerarPeca = async () => {
    setLoading(true);
    setError(null);
    setResposta(null);

    try {
      const payload = {
        tipo_peca: tipoPeca,
        resumo_fatico: resumo,
        partes: partes.filter((parte) => parte.nome.trim()),
      };

      if (pedidos.trim()) {
        payload.pedidos = pedidos.trim();
      }

      if (clienteId.trim()) {
        payload.cliente_id = clienteId.trim();
      }

      if (processoId.trim()) {
        payload.processo_id = processoId.trim();
      }

      const response = await fetch(`${API_BASE_URL}/peca/gerar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = data?.message || data?.error || "Falha ao gerar peça";
        throw new Error(message);
      }

      const data = await response.json();
      setResposta(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--mm-accent)] text-[var(--mm-ink)]">
      <header className="border-b border-[color:rgba(44,13,13,0.1)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo-moura.svg" alt="Moura Martins" className="h-8 w-auto" />
            <span className="text-sm font-semibold uppercase tracking-wide">Moura Martins Advogados</span>
          </a>
          <nav className="hidden gap-6 text-sm font-semibold sm:flex">
            <a href="/" className="transition-colors hover:text-[var(--mm-primary)]">
              Institucional
            </a>
            <a href="#form" className="transition-colors hover:text-[var(--mm-primary)]">
              Gerador IA
            </a>
            <a href="#resultado" className="transition-colors hover:text-[var(--mm-primary)]">
              Resultado
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 md:py-16">
        <section className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5">
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--mm-serif)" }}>
            Gerador de Peças Processuais Inteligente
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-[var(--mm-muted)]">
            A inteligência artificial estrutura automaticamente narrativa, fundamentação e pedidos finais. Informe o tipo de peça,
            um resumo fático e os envolvidos para receber um rascunho completo, com verificação de artigos de lei e exportação
            imediata em .docx.
          </p>
        </section>

        <section id="form" className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5">
          <div className="flex flex-col gap-6">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Tipo da peça
                <select
                  value={tipoPeca}
                  onChange={(event) => setTipoPeca(event.target.value)}
                  className="rounded-lg border border-[color:rgba(44,13,13,0.15)] px-3 py-2 text-base focus:border-[var(--mm-primary)] focus:outline-none"
                >
                  <option value="peticao_inicial">Petição Inicial</option>
                  <option value="contestacao">Contestação</option>
                  <option value="replica">Réplica</option>
                  <option value="tutela_urgencia">Tutela de Urgência</option>
                  <option value="agravo_instrumento">Agravo de Instrumento</option>
                  <option value="manifestacao">Manifestação</option>
                  <option value="apelacao">Apelação</option>
                </select>
              </label>


            <label className="flex flex-col gap-2 text-sm font-medium">
              Orientações sobre pedidos (opcional)
              <textarea
                value={pedidos}
                onChange={(event) => setPedidos(event.target.value)}
                rows={3}
                className="min-h-[120px] rounded-lg border border-[color:rgba(44,13,13,0.15)] px-3 py-2 text-base focus:border-[var(--mm-primary)] focus:outline-none"
                placeholder="Diretrizes específicas sobre pedidos ou cautelas que a IA deve considerar."
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Identificador do cliente (opcional)
              <input
                type="text"
                value={clienteId}
                onChange={(event) => setClienteId(event.target.value)}
                className="rounded-lg border border-[color:rgba(44,13,13,0.15)] px-3 py-2 text-base focus:border-[var(--mm-primary)] focus:outline-none"
                placeholder="Código interno ou referência do cliente"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium">
              Identificador do processo (opcional)
              <input
                type="text"
                value={processoId}
                onChange={(event) => setProcessoId(event.target.value)}
                className="rounded-lg border border-[color:rgba(44,13,13,0.15)] px-3 py-2 text-base focus:border-[var(--mm-primary)] focus:outline-none"
                placeholder="Número ou referência interna do processo"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium">
            Resumo fático
            <textarea
              value={resumo}
                onChange={(event) => setResumo(event.target.value)}
                rows={8}
                className="min-h-[180px] rounded-lg border border-[color:rgba(44,13,13,0.15)] px-3 py-2 text-base focus:border-[var(--mm-primary)] focus:outline-none"
                placeholder="Descreva os principais fatos e contexto do caso."
              />
            </label>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Partes envolvidas</h2>
                <button
                  type="button"
                  onClick={addParte}
                  className="text-sm font-semibold text-[var(--mm-primary)] transition-colors hover:text-[var(--mm-primary-hover)]"
                >
                  ➕ Adicionar parte
                </button>
              </div>
              <p className="mt-1 text-xs text-[var(--mm-muted)]">
                Informe ao menos uma parte com nome e papel processual.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                {partes.map((parte, index) => (
                  <div
                    key={`parte-${index}`}
                    className="grid gap-3 rounded-2xl border border-[color:rgba(44,13,13,0.12)] bg-[color:rgba(250,248,246,0.7)] p-4 md:grid-cols-[minmax(0,1fr)_180px_40px]"
                  >
                    <input
                      type="text"
                      value={parte.nome}
                      onChange={(event) => updateParte(index, "nome", event.target.value)}
                      placeholder="Nome completo"
                      className="rounded-lg border border-[color:rgba(44,13,13,0.15)] px-3 py-2 text-base focus:border-[var(--mm-primary)] focus:outline-none"
                    />

                    <select
                      value={parte.papel}
                      onChange={(event) => updateParte(index, "papel", event.target.value)}
                      className="rounded-lg border border-[color:rgba(44,13,13,0.15)] px-3 py-2 text-base focus:border-[var(--mm-primary)] focus:outline-none"
                    >
                      <option value="autor">Autor</option>
                      <option value="reu">Réu</option>
                      <option value="terceiro">Terceiro</option>
                    </select>

                    <button
                      type="button"
                      className="rounded-lg border border-transparent px-2 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                      onClick={() => removeParte(index)}
                      disabled={partes.length <= 1}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!canSubmit || loading}
                onClick={gerarPeca}
                className="mm-btn mm-btn-primary disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? "Gerando peça..." : "⚖️ Gerar Peça"}
              </button>

              <a href="/" className="mm-btn mm-btn-ghost">
                Voltar ao site
              </a>
            </div>
          </div>
        </section>

        {resposta && (
          <section id="resultado" className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5">
            <div className="flex flex-col gap-4">
              <header>
                <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--mm-serif)" }}>
                  Peça gerada
                </h2>
                <p className="text-sm text-[var(--mm-muted)]">
                  Estrutura com pedidos finais, marcações de artigos e jurisprudências sugeridas.
                </p>
              </header>

              {resposta.artigos_validados?.length ? (
                <div className="rounded-2xl border border-[color:rgba(44,13,13,0.12)] bg-[color:rgba(250,248,246,0.7)] p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--mm-primary)]">
                    Artigos verificados
                  </h3>
                  <ul className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                    {resposta.artigos_validados.map((artigo) => (
                      <li key={artigo.artigo} className="rounded-lg border border-[color:rgba(44,13,13,0.08)] bg-white px-3 py-2">
                        <div className="font-medium text-[var(--mm-ink)]">{artigo.artigo}</div>
                        <div className="text-xs text-[var(--mm-muted)]">
                          {artigo.confirmado ? "✔️ Confirmado" : "⚠️ Não confirmado"}
                          {artigo.referencia ? (
                            <>
                              {" • "}
                              <a
                                href={artigo.referencia}
                                target="_blank"
                                rel="noreferrer"
                                className="underline decoration-dotted underline-offset-2"
                              >
                                Referência
                              </a>
                            </>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <article className="rounded-2xl border border-[color:rgba(44,13,13,0.12)] bg-[color:rgba(250,248,246,0.6)] p-4">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--mm-ink)]">
                  {resposta.texto_gerado}
                </pre>
              </article>

              {resposta.jurisprudencias_sugeridas?.length ? (
                <div className="rounded-2xl border border-[color:rgba(44,13,13,0.12)] bg-white p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--mm-primary)]">
                    Jurisprudências sugeridas
                  </h3>
                  <ul className="mt-3 space-y-3 text-sm">
                    {resposta.jurisprudencias_sugeridas.map((item, index) => (
                      <li key={`juris-${index}`} className="rounded-xl border border-[color:rgba(44,13,13,0.08)] bg-[color:rgba(250,248,246,0.6)] p-3">
                        <div className="font-semibold text-[var(--mm-ink)]">{item.titulo || "Jurisprudência"}</div>
                        {item.resumo ? (
                          <p className="mt-1 text-xs text-[var(--mm-muted)]">{item.resumo}</p>
                        ) : null}
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-xs font-semibold text-[var(--mm-primary)] underline decoration-dotted underline-offset-2"
                          >
                            Acessar
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`${API_BASE_URL}/peca/exportar/${resposta.id}`}
                  className="mm-btn mm-btn-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  📥 Baixar Word
                </a>

                <button
                  type="button"
                  className="mm-btn mm-btn-ghost"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  Voltar ao topo
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}