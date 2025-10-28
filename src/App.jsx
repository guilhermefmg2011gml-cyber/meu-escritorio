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
import { formatPhoneNumber, getDigitsOnly } from "./utils/phone";

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

const formattedWhatsappNumber = formatPhoneNumber(SITE.whatsappNumber);
const whatsappDigits = getDigitsOnly(SITE.whatsappNumber);
const waUrl = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  SITE.whatsappMsg,
)}`;
const mailtoLarissa = `mailto:${SITE.emails[0]}`;
const mailtoGuilherme = `mailto:${SITE.emails[1]}`;

function useReveal(){
  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in");
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Feature({ Icon: IconProp, title, text }) {
  const Icon = IconProp;
  return (
    <div className="reveal mm-card p-5">
      <div className="flex gap-4">
        <Icon className="h-6 w-6 text-[var(--mm-primary)]" />
        <div>
          <h3 className="font-semibold text-[var(--mm-ink)]">{title}</h3>
          <p className="mt-1 text-sm text-[var(--mm-muted)]">{text}</p>
        </div>
      </div>
    </div>
  );
}

function Header(){
  React.useEffect(() => {
    const h = document.getElementById("mm-header");
    const onScroll = () => {
      if (window.scrollY > 10) h?.classList.add("shadow-md", "backdrop-blur");
      else h?.classList.remove("shadow-md", "backdrop-blur");
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header id="mm-header" className="fixed inset-x-0 top-0 z-50 bg-[color:rgba(255,255,255,.6)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="#top" className="flex items-center gap-3">
          <img src="/logo-moura.svg" alt="Moura Martins" className="h-8 w-auto" />
          <span className="sr-only">Moura Martins Advogados</span>
        </a>
        <nav className="hidden gap-6 text-sm font-medium text-[var(--mm-ink)] sm:flex">
          <a href="#areas" className="hover:opacity-80">Áreas</a>
          <a href="#socios" className="hover:opacity-80">Sócios</a>
          <a href="#contato" className="hover:opacity-80">Contato</a>
        </nav>
        <a href={waUrl} className="mm-btn mm-btn-primary">WhatsApp</a>
      </div>
    </header>
  );
}

function Hero(){
  return (
    <section
      id="top"
      className="relative flex min-h-[80vh] items-center justify-center"
      style={{
        backgroundImage: 'url("/hero.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[color:rgba(0,0,0,.35)]" />
      <div className="relative z-10 mt-20 px-6 text-center text-white">
        <span className="mm-chip border border-white/30">Atendimento empresarial personalizado</span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold sm:text-5xl">
          Soluções jurídicas <span className="opacity-90">artesanais</span> e <span className="opacity-90">ágeis</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-white/90">
          Direito Empresarial, Societário e Contratos — estratégia de negócio com proximidade.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={waUrl} className="mm-btn mm-btn-primary">Entre em contato</a>
          <a href={mailtoLarissa} className="mm-btn mm-btn-ghost">Enviar e-mail</a>
        </div>
      </div>
      <div className="absolute bottom-[-24px] left-0 right-0 h-6 rounded-t-[40px] bg-[var(--mm-paper)]" />
    </section>
  );
}

function Areas(){
  useReveal();
  return (
    <section id="areas" className="-mt-8">
      <div className="mx-auto max-w-5xl rounded-3xl bg-[var(--mm-paper)] p-8 shadow-xl ring-1 ring-black/5">
        <div className="text-center">
          <p className="mm-chip bg-[var(--mm-accent)] text-[var(--mm-primary)]">Áreas de atuação</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Feature Icon={BriefcaseBusiness} title="Direito Empresarial" text="Contratos, concorrência, responsabilidade de sócios e estruturação." />
          <Feature Icon={Landmark} title="Direito Administrativo" text="Licitações, PADs, improbidade, MS e atuação nos Tribunais Superiores." />
          <Feature Icon={Gavel} title="Direito Sucessório" text="Inventários judiciais/extrajudiciais, partilhas e prevenção de conflitos familiares." />
          <Feature Icon={Building2} title="Direito Imobiliário" text="Regularização, due diligence de imóveis, contratos e resolução de disputas." />
          <Feature Icon={ShieldCheck} title="Penal Empresarial" text="Defesa em crimes econômicos e compliance, com atuação estratégica e sigilosa." />
          <Feature Icon={BookOpenCheck} title="Tribunais Superiores" text="Recursos especiais/extraordinários, memoriais e sustentações orais." />
        </div>
      </div>
    </section>
  );
}

function Socios({ socios }){
  useReveal();
  return (
    <section id="socios" className="mx-auto mt-20 max-w-6xl px-6">
      <div className="text-center">
        <p className="mm-chip bg-[var(--mm-accent)] text-[var(--mm-primary)]">Nosso escritório</p>
        <h2 className="mt-3 text-3xl font-bold text-[var(--mm-ink)]">Sócios</h2>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--mm-muted)]">
          Técnica, proximidade e comunicação clara para decisões melhores de negócio.
        </p>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {socios.map((s) => (
          <article key={s.nome} className="reveal mm-card p-6">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <img
                src={s.imagem}
                alt={s.nome}
                className="h-24 w-24 rounded-full object-cover ring-1 ring-black/5"
                loading="lazy"
              />
              <div>
                <h3 className="font-semibold text-[var(--mm-ink)]">{s.nome}</h3>
                <p className="text-sm text-[var(--mm-primary)]">{s.cargo}</p>
                <p className="text-xs text-[var(--mm-muted)]">{s.oab}</p>
                <p className="mt-2 text-sm text-[var(--mm-muted)]">{s.bio}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function Cta(){
  return (
    <section className="mt-20 bg-[var(--mm-bg)]">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Pronto para conversar?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/90">
          Atendimento ágil e personalizado. Fale conosco pelo WhatsApp ou e-mail.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={waUrl} className="mm-btn mm-btn-primary">WhatsApp</a>
          <a href={mailtoGuilherme} className="mm-btn mm-btn-ghost">{SITE.emails[1]}</a>
        </div>
      </div>
    </section>
  );
}

function Footer(){
  return (
    <footer id="contato" className="bg-[var(--mm-paper)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-[var(--mm-ink)]">Contatos</h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--mm-muted)]">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href={`tel:${whatsappDigits}`} className="hover:underline">
                {formattedWhatsappNumber}
              </a>
            </li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /><a href={mailtoLarissa} className="hover:underline">{SITE.emails[0]}</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /><a href={mailtoGuilherme} className="hover:underline">{SITE.emails[1]}</a></li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />{SITE.enderecoCurto}</li>
            <li className="mt-2">Documentação societária em registro.</li>
          </ul>
        </div>
        <div className="text-sm text-[var(--mm-muted)]">
          <p>Atendimento remoto em todo o Brasil e presença dedicada em Goiânia e região.</p>
          <p className="mt-2">Horário: segunda a sexta, 9h às 18h.</p>
        </div>
      </div>
      <p className="border-t border-slate-200 py-6 text-center text-xs text-[var(--mm-muted)]">
        © {new Date().getFullYear()} {SITE.nome}. Todos os direitos reservados.
      </p>
    </footer>
  );
}

function WhatsAppFloat(){
  return (
    <a href={waUrl} target="_blank" rel="noopener" className="fixed bottom-5 right-5 z-40 mm-btn mm-btn-primary shadow-lg">
      WhatsApp
    </a>
  );
}

export default function App(){
  return (
    <div className="bg-[color:var(--mm-accent)] text-[var(--mm-ink)]">
      <Header />
      <main className="pt-[64px]">
        <Hero />
        <Areas />
        <Socios socios={SITE.socios} />
        <Cta />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
