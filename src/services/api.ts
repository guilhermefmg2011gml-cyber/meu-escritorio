// @ts-nocheck

const DEFAULT_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:3000').replace(/\/+$/, '')

async function postJSON(path: string, body: unknown) {
  const url = `${DEFAULT_BASE}${path}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const message = (data && (data.error || data.message)) || `Erro HTTP ${response.status}`
    throw new Error(message)
  }

  return response.json()
}

async function getJSON(path: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim()) {
      search.append(key, value.trim())
    }
  })
  const query = search.toString()
  const url = `${DEFAULT_BASE}${path}${query ? `?${query}` : ''}`
  const response = await fetch(url)
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const message = (data && (data.error || data.message)) || `Erro HTTP ${response.status}`
    throw new Error(message)
  }
  return response.json()
}

export async function refinarPeca({
  texto,
  clienteId,
  processoId,
}: {
  texto: string
  clienteId?: string
  processoId?: string
}) {
  const payload: Record<string, string> = { texto }
  if (clienteId) payload.cliente_id = clienteId
  if (processoId) payload.processo_id = processoId
  const data = await postJSON('/peca/refinar', payload)
  return data?.texto_refinado as string
}

export async function buscarMemoria({
  query,
  clienteId,
  processoId,
}: {
  query: string
  clienteId?: string
  processoId?: string
}) {
  const data = await getJSON('/peca/memoria', {
    query,
    clienteId,
    processoId,
  })
  return (data?.resultados as string[]) || []
}