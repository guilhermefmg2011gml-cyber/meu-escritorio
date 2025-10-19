import React from "react";
import { Phone, Mail, MapPin, Scale, Building2, Landmark, Gavel, ShieldCheck, BriefcaseBusiness, BookOpenCheck, Hammer, Users, CheckCircle2, MessageCircle } from "lucide-react";

/**
 * Single‑file React landing page for a law firm following the same visual layout as the provided reference.
 * TailwindCSS is available in this environment. No external CSS required.
 * Replace the placeholder texts, links, and images with your firm's details.
 */

// ====== Config do site (dados públicos) ======

const SITE = {
  nome: "Moura Martins Advogados",
  socios: [
    {
      nome: "Larissa Moura dos Santos",
      cargo: "Sócia-fundadora",
      oab: "OAB/GO 74.180",
      bio: "Atuação consultiva e contenciosa em Direito Empresarial e Societário.",
      imagem:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80",
    },
    {
      nome: "Guilherme Martins Lopes",
      cargo: "Sócio-fundador",
      oab: "OAB/GO 76.350",
      bio: "Contratos, estruturação societária e operações estratégicas.",
      imagem:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=320&q=80",
    },
  ],
  emails: [
    "larissamoura@mouramartinsadvogados.com.br",
    "guilherme@mouramartinsadvogados.com.br",
  ],
  enderecoCurto: "Goiás / GO",
  whatsappNumber: "556293973568", // 55 + DDD + número (só dígitos)
  whatsappMsg: "Olá! Gostaria de falar com o escritório.",
};

const waUrl = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  SITE.whatsappMsg
)}`;
const mailtoLarissa = `mailto:${SITE.emails[0]}`;
const mailtoGuilherme = `mailto:${SITE.emails[1]}`;

function App() {
  return (
    <div className="bg-emerald-50 text-emerald-950 min-h-screen">
      <header className="bg-emerald-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-24 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center rounded-full border border-emerald-300/40 bg-emerald-800/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100">
              Atendimento empresarial personalizado
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Soluções jurídicas para cada etapa do seu negócio
            </h1>
            <p className="max-w-2xl text-lg text-emerald-100/80">
              Entre em contato conosco e tenha o acompanhamento estratégico de uma equipe especializada em Direito Empresarial, Societário e Contratos.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-5 py-3 text-sm font-medium shadow hover:bg-emerald-600 transition"
              >
                Falar no WhatsApp
              </a>
              <a
                href={mailtoLarissa}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-medium hover:bg-white/10 transition"
              >
                Enviar e-mail
              </a>
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
              <ul className="space-y-4 text-sm text-emerald-100/80">
                <li>Consultoria societária completa</li>
                <li>Due diligence e auditoria jurídica</li>
                <li>Contratos e acordos de sócios</li>
                <li>Atendimento dedicado via WhatsApp e e-mail</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20 space-y-24">
        <section className="space-y-10">
          <div className="space-y-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">
              Nosso escritório
            </p>
            <h2 className="text-3xl font-bold text-emerald-950 sm:text-4xl">Sócios</h2>
            <p className="mx-auto max-w-2xl text-base text-slate-600">
              Atuação focada em empresas, sociedades e transações estratégicas, com comunicação clara e orientação de negócio.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {SITE.socios.map((socio) => (
              <article
                key={socio.nome}
                className="group rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-32 w-32 overflow-hidden rounded-full border border-emerald-100/60">
                    <img
                      src={socio.imagem}
                      alt={socio.nome}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-emerald-950">{socio.nome}</h3>
                    <p className="text-sm font-medium text-emerald-600">{socio.cargo}</p>
                    <p className="text-emerald-200/80">{socio.oab}</p>
                  </div>
                  <p className="text-sm text-slate-600">{socio.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-emerald-900 px-8 py-12 text-center text-white shadow-lg">
          <div className="mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold text-white">Pronto para conversar?</h2>
            <p className="text-base text-emerald-100/80">
              Estamos disponíveis para atender sua empresa com agilidade. Envie uma mensagem e retornaremos ainda no mesmo dia útil.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-950 px-5 py-3 text-sm font-medium shadow hover:bg-emerald-50 transition"
              >
                WhatsApp
              </a>
              <a
                href={mailtoGuilherme}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-medium hover:bg-white/10 transition"
              >
                {SITE.emails[1]}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h3 className="text-lg font-semibold text-emerald-950">Contatos</h3>
              <ul className="space-y-1 text-sm text-emerald-100/80">
                <li>WhatsApp: (62) 9397-3568</li>
                <li><a href={mailtoLarissa} className="hover:underline">{SITE.emails[0]}</a></li>
                <li><a href={mailtoGuilherme} className="hover:underline">{SITE.emails[1]}</a></li>
                <li>{SITE.enderecoCurto}</li>
                <li className="mt-2">Documentação societária em registro.</li>
              </ul>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                Atendimento remoto para todo o Brasil e presença dedicada para
                empresas em Goiânia e região metropolitana.
              </p>
              <p>Horário de atendimento: segunda a sexta, das 9h às 18h.</p>
            </div>
          </div>
          <p className="mt-10 text-xs text-slate-500">
            © {new Date().getFullYear()} {SITE.nome}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
