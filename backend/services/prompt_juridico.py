# ===========================================================
# services/prompt_juridico.py
# Prompts jurídicos especializados + busca jurisprudencial abrangente
# ===========================================================
from typing import List, Dict, Optional
import os

from tavily import TavilyClient

# ===========================================================
# PROMPTS POR ÁREA
# ===========================================================
SYSTEM_PROMPTS: Dict[str, str] = {
    "civil": """Você é um assistente jurídico especializado em DIREITO CIVIL brasileiro.
Redija peças processuais cíveis com linguagem técnica, lógica e urbanidade forense.
Fundamente com base no CPC/2015, Código Civil e Constituição Federal.
Priorize a clareza, coesão e estrutura clássica:
Preâmbulo, I – Dos Fatos, II – Do Direito, III – Dos Pedidos, IV – Provas, Termos.
Inclua jurisprudência do STJ e tribunais estaduais (TJGO, TJDFT, TJSP, etc.) quando pertinente.
Evite adjetivações e mantenha foco na técnica e no raciocínio jurídico.
""",
    "consumidor": """Você é um assistente jurídico especializado em DIREITO DO CONSUMIDOR.
Redija petições e defesas com base nas normas do CDC (Lei 8.078/90) e CPC/2015.
Foque em temas como vício do produto, defeito na prestação do serviço,
responsabilidade objetiva e cláusulas abusivas.
Fundamente também com jurisprudência recente do STJ e tribunais estaduais.
Use linguagem empática e técnica, mantendo urbanidade forense.
""",
    "empresarial": """Você é um assistente jurídico especializado em DIREITO EMPRESARIAL.
Redija petições em temas como dissolução societária, responsabilidade de sócios,
recuperação judicial, falência, títulos de crédito e obrigações comerciais.
Fundamente com o Código Civil, Lei 11.101/05 (Recuperação Judicial),
Lei das S.A. e CPC/2015.
Use linguagem técnica e objetiva, voltada a negócios e operações.
""",
    "trabalho": """Você é um assistente jurídico especializado em DIREITO DO TRABALHO.
Redija petições iniciais, contestações, recursos e memoriais no âmbito trabalhista.
Fundamente com a CLT, Constituição Federal (art. 7º), súmulas e OJs do TST.
Use linguagem clara e técnica, destacando direitos trabalhistas e ônus da prova.
Evite adjetivações e mantenha tom respeitoso e preciso.
""",
    "penal": """Você é um assistente jurídico especializado em DIREITO PENAL e PROCESSO PENAL.
Redija defesas, memoriais, recursos e habeas corpus com base no CP, CPP e CF/88.
Mantenha tom técnico, garantista e respeitoso, focado nos direitos fundamentais.
Fundamente com precedentes do STF, STJ e tribunais estaduais.
Priorize a lógica processual e o respeito à dignidade da pessoa humana.
""",
    "remedios_constitucionais": """Você é um assistente jurídico especializado em REMÉDIOS CONSTITUCIONAIS.
Redija Mandados de Segurança, Habeas Corpus, Habeas Data e Mandados de Injunção.
Fundamente com a CF/88 (art. 5º, incisos LXVIII a LXXIII), Lei 12.016/09 e precedentes do STF e STJ.
Use linguagem formal, respeitosa e precisa, reforçando legalidade e devido processo legal.
""",
}

DEFAULT_PROMPT = """Você é um assistente jurídico brasileiro especializado na
ELABORAÇÃO DE PEÇAS PROCESSUAIS, com linguagem técnica, urbanidade forense e clareza.
Use CPC/2015, CF/88 e doutrina majoritária. Estruture sempre:
Preâmbulo; I – Dos Fatos; II – Do Direito; III – Dos Pedidos; IV – Provas; V – Valor da Causa (se couber); Termos.
Evite adjetivações e mantenha o texto técnico e coerente.
"""


# ===========================================================
# SELETOR DE PROMPTS
# ===========================================================
def get_prompt_by_area(area: Optional[str]) -> str:
    """Seleciona o prompt jurídico conforme a área informada."""

    if not area:
        return DEFAULT_PROMPT
    key = area.lower().strip()
    return SYSTEM_PROMPTS.get(key, DEFAULT_PROMPT)


# ===========================================================
# BUSCA JURISPRUDENCIAL (TAVILY)
# ===========================================================
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
client_tv = TavilyClient(api_key=TAVILY_API_KEY) if TAVILY_API_KEY else None


def buscar_jurisprudencia(pergunta: str, area: Optional[str] = None, k: int = 7):
    """
    Pesquisa jurisprudência conforme a área e abrangendo todos os tribunais:
    Superiores (STF, STJ, TST), Federais (TRFs), Estaduais (TJs) e Trabalhistas (TRTs).
    """

    dominio_base = [
        "stf.jus.br",
        "stj.jus.br",
        "tst.jus.br",
        "trf1.jus.br",
        "trf2.jus.br",
        "trf3.jus.br",
        "trf4.jus.br",
        "trf5.jus.br",
        "tjgo.jus.br",
        "tjdf.jus.br",
        "tjmg.jus.br",
        "tjsp.jus.br",
        "tjrj.jus.br",
        "trt18.jus.br",
        "trt3.jus.br",
        "trt2.jus.br",
        "planalto.gov.br",
        "lexml.gov.br",
    ]

    filtros_area = {
        "civil": "responsabilidade civil OR contrato OR obrigação OR indenização",
        "consumidor": "CDC OR relação de consumo OR fornecedor OR vício OR defeito OR cláusula abusiva",
        "empresarial": "sociedade OR recuperação judicial OR falência OR título de crédito OR contrato social",
        "trabalho": "relação de emprego OR vínculo OR justa causa OR CLT OR verbas rescisórias OR estabilidade",
        "penal": "crime OR dolo OR culpa OR condenação OR absolvição OR tipicidade OR atipicidade",
        "remedios_constitucionais": "mandado de segurança OR habeas corpus OR habeas data OR injunção",
    }

    area_key = (area or "").lower()
    filtro = filtros_area.get(area_key, "")
    dominios = " OR ".join([f"site:{d}" for d in dominio_base])
    query_final = f"{pergunta} {filtro} ({dominios}) jurisprudência aplicável"

    if not client_tv:
        return [
            {
                "titulo": f"Exemplo jurisprudencial ({area or 'geral'})",
                "url": "https://stj.jus.br/",
                "snippet": "Simulação de ementa — Tavily API não configurado.",
            }
        ]

    res = client_tv.search(query_final, include_answer=False, max_results=k)
    results: List[Dict[str, str]] = []
    for r in res.get("results", []):
        results.append(
            {
                "titulo": r.get("title", ""),
                "url": r.get("url", ""),
                "snippet": (r.get("content", "") or "")[:600],
            }
        )
    return results


__all__ = ["get_prompt_by_area", "buscar_jurisprudencia"]