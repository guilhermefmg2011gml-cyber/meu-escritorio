// @ts-nocheck
import { useState } from 'react'
import { refinarPeca } from '../services/api'

export function RefinarPeca() {
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [processoId, setProcessoId] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleRefinar = async () => {
    if (!texto.trim()) {
      setErro('Informe o texto da petição para refinamento.')
      return
    }

    setLoading(true)
    setErro('')
    setResultado('')
    try {
      const resposta = await refinarPeca({ texto, clienteId: clienteId.trim() || undefined, processoId: processoId.trim() || undefined })
      setResultado(resposta)
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível refinar o texto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--mm-accent)] text-[var(--mm-ink)]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--mm-serif)' }}>
          Refinar Peça Processual
        </h1>
        <p className="mt-3 text-sm text-[var(--mm-muted)]">
          Reforce um texto já existente utilizando a memória jurídica do escritório e o modelo inteligente. Informe o conteúdo
          atual da peça e, opcionalmente, os identificadores de cliente ou processo para personalizar o contexto recuperado.
        </p>

        <div className="mt-8 grid gap-4">
          <input
            type="text"
            placeholder="ID do cliente (opcional)"
            value={clienteId}
            onChange={(event) => setClienteId(event.target.value)}
            className="rounded-lg border border-[color:rgba(44,13,13,0.15)] px-3 py-2 text-base focus:border-[var(--mm-primary)] focus:outline-none"
          />

          <input
            type="text"
            placeholder="ID do processo (opcional)"
            value={processoId}
            onChange={(event) => setProcessoId(event.target.value)}
            className="rounded-lg border border-[color:rgba(44,13,13,0.15)] px-3 py-2 text-base focus:border-[var(--mm-primary)] focus:outline-none"
          />

          <textarea
            placeholder="Cole aqui o texto atual da petição que deseja aprimorar"
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            className="min-h-[240px] rounded-lg border border-[color:rgba(44,13,13,0.15)] px-3 py-2 text-base focus:border-[var(--mm-primary)] focus:outline-none"
          />

          <button
            type="button"
            onClick={handleRefinar}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--mm-primary)] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[var(--mm-primary-hover)] disabled:opacity-60"
          >
            {loading ? 'Refinando...' : 'Refinar texto'}
          </button>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          {resultado && (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
              <h2 className="text-lg font-semibold">Resultado refinado</h2>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--mm-ink)]">{resultado}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RefinarPeca