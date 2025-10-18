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
  // WhatsApp: só números com DDI+DDD (Brasil = 55). Ajustei como você passou.
  whatsappNumber: "556293973568",
  whatsappMsg: "Olá! Gostaria de falar com o escritório.",
  emails: [
    "larissamoura@mouramartinsadvogados.com.br",
    "guilherme@mouramartinsadvogados.com.br",
  ],
  socios: [
    { nome: "Larissa Moura dos Santos", oab: "OAB/GO 74.180" },
    { nome: "Guilherme Martins Lopes", oab: "OAB/GO 76.350" },
  ],
  enderecoCurto: "Goiás / GO",
};
// Helpers
const waUrl = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMsg)}`;
const mailtoLarissa = `mailto:${SITE.emails[0]}`;
const mailtoGuilherme = `mailto:${SITE.emails[1]}`;

export default function LawFirmLanding() {
  return (
    <div className="min-h-screen text-slate-900">
      <Header />
      <Hero />
      <PracticeAreas />
      <About />
      <HowWeWork />
      <BottomCTA />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <div className="size-9 rounded-md bg-emerald-900 text-white grid place-items-center font-bold">MM</div>
          <div className="leading-tight">
            <p className="font-semibold">Moura Martins Advogados</p>
            <p className="text-xs text-slate-500">Soluções jurídicas artesanais e ágeis</p>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a className="hover:text-emerald-700" href="#areas">Áreas de atuação</a>
          <a className="hover:text-emerald-700" href="#about">O escritório</a>
          <a className="hover:text-emerald-700" href="#como">Como atuamos</a>
          <a className="hover:text-emerald-700" href="#contato">Contato</a>
        </nav>
        <a href="#contato" className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 text-white px-4 py-2 text-sm shadow-sm hover:bg-emerald-800 transition">
          <Phone className="size-4" /> Entre em contato
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2070&auto=format&fit=crop)",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-black/50" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-28 sm:py-36">
        <div className="bg-white/95 rounded-2xl shadow-xl p-6 sm:p-8 text-center">
          <p className="text-sm uppercase tracking-widest text-emerald-900 font-semibold">Nosso escritório</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold leading-snug">
            A união do <span className="text-emerald-900">tradicional</span> com o <span className="text-emerald-900">moderno</span> para oferecer
            soluções jurídicas artesanais e ágeis aos nossos clientes.
          </h1>
          <a href={waUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-5 py-3 text-sm font-medium shadow hover:bg-emerald-600 transition">
  Falar no WhatsApp
</a>
        </div>
      </div>
    </section>
  );
}

function PracticeAreas() {
  const items = [
    {
      icon: <BriefcaseBusiness className="size-5 text-emerald-900" />,
      title: "Direito Empresarial",
      desc:
        "Contratos, governança, compliance, reestruturações, negociações e resolução estratégica de conflitos empresariais.",
    },
    {
      icon: <Landmark className="size-5 text-emerald-900" />,
      title: "Direito Administrativo",
      desc:
        "Licitações, contratos públicos, improbidade, defesas em TCs, regulação e relações com o Poder Público.",
    },
    {
      icon: <ShieldCheck className="size-5 text-emerald-900" />,
      title: "Direito Sucessório",
      desc:
        "Inventários, partilhas, planejamento sucessório, holdings familiares e soluções para disputas hereditárias.",
    },
    {
      icon: <Building2 className="size-5 text-emerald-900" />,
      title: "Direito Imobiliário",
      desc:
        "Contratos, registros, due diligence, incorporações, loteamentos, locações e contencioso imobiliário.",
    },
    {
      icon: <Gavel className="size-5 text-emerald-900" />,
      title: "Direito Penal Empresarial",
      desc:
        "Atuação penal estratégica, investigações defensivas e gestão de crises com foco em riscos corporativos.",
    },
    {
      icon: <Scale className="size-5 text-emerald-900" />,
      title: "Atuação em Tribunais Superiores",
      desc:
        "Sustentações orais, memoriais, recursos excepcionais e estratégia de precedentes (STF/STJ).",
    },
  ];

  return (
    <section id="areas" className="bg-slate-50 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-widest text-emerald-900 font-semibold">Confira as nossas</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Áreas de atuação</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{it.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg">{it.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{it.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Sobre o escritório</h2>
          <p className="mt-4 text-slate-700 leading-relaxed">
            Atuamos com excelência e foco no resultado, unindo experiência no setor público e na
            iniciativa privada. Oferecemos um serviço artesanal, personalizado e estrategicamente
            orientado, sempre com atendimento próximo e comunicação clara.
          </p>
          <div className="mt-6 space-y-4">
            <Feature line="Atendimento personalizado e sob medida para cada cliente." />
            <Feature line="Equipe com vivência em Tribunais e órgãos de controle." />
            <Feature line="Compromisso com soluções práticas, ágeis e seguras." />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <TeamCard
            name="André Santa Cruz"
            role="Consultor – Direito Empresarial"
            img="https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1780&auto=format&fit=crop"
          />
          <TeamCard
            name="Jaylton Lopes"
            role="Sócio – Direito Processual Civil"
            img="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1780&auto=format&fit=crop"
          />
          <TeamCard
            name="Samer Aql"
            role="Consultor – Direito Penal"
            img="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1780&auto=format&fit=crop"
          />
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop"
              alt="Escritório"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ line }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="size-5 text-emerald-900 shrink-0" />
      <p className="text-slate-700">{line}</p>
    </div>
  );
}

function TeamCard({ name, role, img }) {
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <img src={img} alt={name} className="h-40 w-full object-cover" />
      <div className="p-4">
        <p className="font-semibold">{name}</p>
        <p className="text-xs text-slate-600 mt-1">{role}</p>
      </div>
    </div>
  );
}

function HowWeWork() {
  return (
    <section id="como" className="py-16 sm:py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-start">
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2069&auto=format&fit=crop"
            alt="Reunião no escritório"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Como atuamos e no que acreditamos</h2>
          <p className="mt-4 text-slate-700 leading-relaxed">
            Somos um escritório que combina tradição e modernidade. Trabalhamos com planejamento,
            prevenção e execução eficientes, sempre em busca do melhor resultado dentro dos parâmetros
            legais e éticos.
          </p>
          <ul className="mt-6 space-y-3 text-slate-700">
            <li className="flex gap-3"><BookOpenCheck className="size-5 text-emerald-900" /> Pesquisa jurídica profunda e estratégia de precedentes.</li>
            <li className="flex gap-3"><Hammer className="size-5 text-emerald-900" /> Contencioso com foco em performance e gestão de risco.</li>
            <li className="flex gap-3"><Users className="size-5 text-emerald-900" /> Comunicação clara, humana e próxima do cliente.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section id="contato" className="py-14">
      <div className="max-w-3xl mx-auto px-4">
        <div className="rounded-2xl bg-emerald-950 text-white p-6 sm:p-8 text-center shadow-lg">
          <div className="mx-auto size-10 grid place-items-center rounded-full bg-white/10 mb-2">
            <MessageCircle className="size-5" />
          </div>
          <h3 className="text-xl font-semibold">Entre em contato com nosso escritório</h3>
          <p className="mt-2 text-sm text-emerald-200">Atendimento remoto e presencial. Resposta rápida.</p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/5562999999999"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-emerald-950 px-5 py-3 text-sm font-medium shadow hover:bg-emerald-50 transition"
            >
              <Phone className="size-4" /> WhatsApp
            </a>
            <a
              href="mailto:contato@seuescritorio.adv.br"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-medium hover:bg-white/10 transition"
            >
              <Mail className="size-4" /> contato@seuescritorio.adv.br
            </a>
          </div>
          <p className="mt-4 text-xs text-emerald-200">Endereço: Av. Exemplo, 123 — Goiânia/GO</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6 text-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-emerald-900 text-white grid place-items-center font-bold">MM</div>
            <p className="font-semibold">Moura Martins Advogados</p>
          </div>
          <p className="text-slate-600 mt-2">CNPJ 00.000.000/0001-00 · OAB/GO 00000</p>
        </div>
        <div>
          <p className="font-semibold">Contato</p>
          <ul className="mt-2 space-y-1 text-slate-600">
            <li className="flex items-center gap-2"><Phone className="size-4" />(62) 99999-9999</li>
            <li className="flex items-center gap-2"><Mail className="size-4" />contato@seuescritorio.adv.br</li>
            <li className="flex items-center gap-2"><MapPin className="size-4" />Av. Exemplo, 123 — Goiânia/GO</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Links</p>
          <ul className="mt-2 space-y-1 text-slate-600">
            <li><a href="#areas" className="hover:text-emerald-900">Áreas de atuação</a></li>
            <li><a href="#about" className="hover:text-emerald-900">O escritório</a></li>
            <li><a href="#como" className="hover:text-emerald-900">Como atuamos</a></li>
            <li><a href="#contato" className="hover:text-emerald-900">Contato</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-slate-500 pb-6">© {new Date().getFullYear()} Moura Martins Advogados. Todos os direitos reservados.</div>
    </footer>
  );
}

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5562999999999"
      target="_blank"
      className="fixed right-4 bottom-5 size-12 sm:size-14 rounded-full bg-emerald-500 shadow-lg grid place-items-center hover:bg-emerald-600 transition"
      aria-label="Fale no WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-white size-7">
        <path d="M20.52 3.48A11.78 11.78 0 0 0 1.64 16.3L1 22l5.84-1.53A11.78 11.78 0 0 0 12 23.75h.01A11.76 11.76 0 0 0 24 11.99a11.7 11.7 0 0 0-3.48-8.51ZM12 21.5h-.01a9.95 9.95 0 0 1-5.07-1.39l-.36-.21-3.46.9.92-3.37-.24-.35A10 10 0 1 1 12 21.5Zm5.47-7.53c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.2-.24-.58-.48-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.52 0 1.49 1.08 2.94 1.23 3.15.15.2 2.12 3.23 5.13 4.44.72.31 1.28.49 1.72.62.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
