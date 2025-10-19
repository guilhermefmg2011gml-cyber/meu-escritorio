import React from "react";
import {
  BriefcaseBusiness,
  Landmark,
  Gavel,
  ShieldCheck,
  Building2,
  BookOpenCheck,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const SITE = {
  nome: "Moura Martins Advogados",
  whatsappNumber: "556293973568",
  whatsappMsg: "Olá! Gostaria de falar com o escritório.",
  emails: [
    "larissamoura@mouramartinsadvogados.com.br",
    "guilherme@mouramartinsadvogados.com.br",
  ],
  enderecoCurto: "Goiás / GO",
  socios: [
    {
      nome: "Larissa Moura dos Santos",
      cargo: "Sócia-fundadora",
      oab: "OAB/GO 74.180",
      bio: "Atuação consultiva e contenciosa em Direito Empresarial e Societário.",
      imagem:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=480&q=80",
    },
    {
      nome: "Guilherme Martins Lopes",
      cargo: "Sócio-fundador",
      oab: "OAB/GO 76.350",
      bio: "Contratos, estruturação societária e operações estratégicas.",
      imagem:
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=480&q=80",
    },
  ],
  };

const waUrl = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMsg)}`;
const mailtoLarissa = `mailto:${SITE.emails[0]}`;
const mailtoGuilherme = `mailto:${SITE.emails[1]}`;

function Feature({ Icon, title, text }) {
  return (
     <div className="flex gap-4">
      <div className="mt-1">
        <Icon className="h-6 w-6 text-emerald-600" aria-hidden />
      </div>
      <div>
        <h3 className="font-semibold text-emerald-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="bg-slate-50 text-emerald-950">
      {/* HERO */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1600&auto=format&fit=crop")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
          <p className="inline-block rounded-full border border-white/30 px-3 py-1 text-xs uppercase tracking-widest">
            Atendimento empresarial personalizado
          </p>
          <h1 className="mt-6 text-4xl font-bold sm:text-5xl">
            Soluções jurídicas artesanais e ágeis
          </h1>
          <p className="mt-4 text-emerald-100/90">
            Direito Empresarial, Societário e Contratos — com estratégia e proximidade.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-950 shadow hover:bg-emerald-50"
            >
              Entre em contato conosco
            </a>
            <a
              href={mailtoLarissa}
              className="rounded-xl border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              Enviar e-mail
            </a>
          </div>
        </div>
      </section>


      {/* CARD BRANCO - Áreas de atuação */}
      <section className="-mt-16">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">
              Confira as nossas
            </p>
            <h2 className="mt-2 text-2xl font-bold text-emerald-950">Áreas de atuação</h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <Feature
              Icon={BriefcaseBusiness}
              title="Direito Empresarial"
              text="Consultivo e contencioso empresarial: contratos, concorrência, responsabilidade de sócios e estruturação."
            />
            <Feature
              Icon={Landmark}
              title="Direito Administrativo"
              text="Licitações, PADs, improbidade, mandados de segurança e atuação perante Tribunais Superiores."
            />
            <Feature
              Icon={Gavel}
              title="Direito Sucessório"
              text="Inventários judiciais e extrajudiciais, partilhas, planejamento e solução de conflitos familiares."
            />
            <Feature
              Icon={Building2}
              title="Direito Imobiliário"
              text="Regularização, due dilligence de imóveis, contratos e resolução de disputas."
            />
            <Feature
              Icon={ShieldCheck}
              title="Penal Empresarial"
              text="Defesa em crimes econômicos e compliance, com atuação estratégica e sigilosa."
            />
            <Feature
              Icon={BookOpenCheck}
              title="Tribunais Superiores"
              text="Recursos especiais e extraordinários, memoriais e sustentações orais."
            />
          </div>
        </div>
      </section>
      {/* SÓCIOS */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[.3em] text-emerald-600">
            Nosso escritório
          </p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-950">Sócios</h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            Técnica, proximidade e comunicação clara para decisões melhores de negócio.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {SITE.socios.map((s) => (
            <article
              key={s.nome}
              className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-black/5"
            >
              <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                <img
                  src={s.imagem}
                  alt={s.nome}
                  className="h-36 w-36 rounded-full object-cover ring-1 ring-black/5"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-lg font-semibold">{s.nome}</h3>
                  <p className="text-sm text-emerald-700">{s.cargo}</p>
                  <p className="text-sm text-slate-500">{s.oab}</p>
                  <p className="mt-3 text-sm text-slate-600">{s.bio}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 bg-emerald-900">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-bold">Pronto para conversar?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-emerald-100/90">
            Atendimento ágil e personalizado. Fale conosco pelo WhatsApp ou e-mail.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-950 shadow hover:bg-emerald-50"
            >
              WhatsApp
            </a>
            <a
              href={mailtoGuilherme}
              className="rounded-xl border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              {SITE.emails[1]}
            </a>
          </div>
         </div>
      </section>

      {/* RODAPÉ */}
      <footer className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-emerald-950">Contatos</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4"/> (62) 9397-3568</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4"/><a href={mailtoLarissa} className="hover:underline">{SITE.emails[0]}</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4"/><a href={mailtoGuilherme} className="hover:underline">{SITE.emails[1]}</a></li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4"/>{SITE.enderecoCurto}</li>
              <li className="mt-2 text-slate-500">Documentação societária em registro.</li>
            </ul>
          </div>
          <div className="text-sm text-slate-600">
            <p>Atendimento remoto em todo o Brasil e presença dedicada em Goiânia e região.</p>
            <p className="mt-2">Horário: segunda a sexta, 9h às 18h.</p>
          </div>
        </div>
        <p className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {SITE.nome}. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}