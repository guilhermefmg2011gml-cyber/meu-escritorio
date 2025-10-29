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
import { useReveal } from "./hooks/useReveal";

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
const waUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
  SITE.whatsappMsg,
)}`;
const mailtoLarissa = `mailto:${SITE.emails[0]}`;
const mailtoGuilherme = `mailto:${SITE.emails[1]}`;

function Feature({ Icon: IconProp, title, text }) {
  const Icon = IconProp;
  return (
    <div className="reveal mm-card p-6">
      <div className="flex gap-4">
        <Icon className="h-6 w-6 text-[#b89b5a]" />
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
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

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
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[var(--mm-ink)] sm:flex">
          <a href="#areas" className="transition-colors hover:text-[var(--mm-primary)]">Núcleos</a>
          <a href="#socios" className="transition-colors hover:text-[var(--mm-primary)]">Sócios</a>
          <a href="#contato" className="transition-colors hover:text-[var(--mm-primary)]">Contato</a>
        </nav>
      </div>
    </header>
  );
}

function Hero(){
  return (
    <section
      id="top"
      className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden pb-20 pt-[4.5rem] text-center text-[var(--mm-accent)] sm:pb-24 sm:pt-[5.25rem]"
      style={{
        backgroundImage: "url('/hero-logo-full.jpg')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[color:rgba(32,8,6,0.55)]" aria-hidden />
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6">
        <h1
          id="hero-heading"
          className="mx-auto max-w-3xl text-4xl font-semibold leading-snug text-[var(--mm-accent)] sm:text-5xl"
          style={{ fontFamily: "var(--mm-serif)" }}
        >
          Soluções jurídicas artesanais e ágeis
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-[color:rgba(248,244,236,0.82)] sm:text-lg">
          Advocacia full service com atuação consultiva e contenciosa. Atendemos empresas e pessoas físicas em todas as áreas do
 Direito — com estratégia, técnica e discrição.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a href={waUrl} className="mm-btn mm-btn-primary">Entre em contato</a>
          <a href={mailtoLarissa} className="mm-btn mm-btn-ghost mm-btn-ghost--on-dark">Enviar e-mail</a>
        </div>
      </div>
    </section>
  );
}

function InstitutionalIntro(){
  return (
    <section className="bg-[#f3e8dc] text-center py-10 px-6">
      <p className="max-w-3xl mx-auto text-[#4a3425] text-[0.95rem] leading-relaxed font-medium">
        A <strong>Moura Martins Advogados</strong> é uma banca de advocacia full service, estruturada por núcleos especializados que atuam de forma integrada. Nosso modelo une técnica, experiência e proximidade para entregar soluções jurídicas completas e personalizadas.
      </p>
    </section>
  );
}

function Areas(){
  const containerRef = React.useRef(null);
  useReveal({ containerRef });
  return (
    <section ref={containerRef} id="areas" className="-mt-8 scroll-mt-28 sm:scroll-mt-32">
      <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-[var(--mm-paper)] p-8 shadow-xl ring-1 ring-black/5">
        <div className="text-center">
          <p className="mm-chip bg-[color:rgba(200,166,118,0.12)] text-[var(--mm-primary)]">Full service premium</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--mm-ink)]" style={{ fontFamily: "var(--mm-serif)" }}>
            Nossos Núcleos de Atuação
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--mm-muted)] sm:text-base">
            Atuação completa, coordenada e multidisciplinar — em todas as frentes jurídicas que impactam empresas, patrimônio e pessoas.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Feature
            Icon={BriefcaseBusiness}
            title="Núcleo Empresarial"
            text="Consultivo e contencioso empresarial: contratos, concorrência, responsabilidade de sócios, governança e estruturação de negócios."
          />
          <Feature
            Icon={Landmark}
            title="Núcleo Administrativo"
            text="Licitações, PADs e improbidade. Defesa técnica em processos disciplinares e atuação perante órgãos de controle e Tribunais Superiores."
          />
          <Feature
            Icon={Building2}
            title="Núcleo Imobiliário"
            text="Due diligence e regularização de imóveis; contratos de compra, locação e incorporação; gestão e resolução de disputas patrimoniais."
          />
          <Feature
            Icon={Gavel}
            title="Núcleo Sucessório e Patrimonial"
            text="Planejamento sucessório, acordos familiares, blindagem patrimonial e condução de inventários judiciais e extrajudiciais."
          />
          <Feature
            Icon={ShieldCheck}
            title="Núcleo Penal"
            text="Defesa em crimes econômicos, compliance e investigações internas. Atuação estratégica e sigilosa em casos de alta complexidade."
          />
          <Feature
            Icon={BookOpenCheck}
            title="Núcleo de Tribunais Superiores"
            text="Recursos especiais e extraordinários, memoriais e sustentações orais junto aos Tribunais Superiores."
          />
        </div>
      </div>
    </section>
  );
}

function Socios({ socios, onAddDevSocio }){
  const containerRef = React.useRef(null);
  useReveal({ containerRef, deps: socios });
  return (
    <section ref={containerRef} id="socios" className="mx-auto mt-20 max-w-6xl scroll-mt-28 px-6 sm:scroll-mt-32">
      <div className="text-center">
        <p className="mm-chip bg-[var(--mm-accent)] text-[var(--mm-primary)]">Nosso escritório</p>
        <h2 className="mt-3 text-3xl font-bold text-[var(--mm-ink)]">Sócios</h2>
        <p className="mx-auto mt-2 max-w-2xl text-[var(--mm-muted)]">
          Técnica, proximidade e comunicação clara para decisões melhores de negócio.
        </p>
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {socios.map((s) => (
          <article key={s.nome} className="reveal mm-card mm-card--warm p-6">
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
      {onAddDevSocio ? (
        <div className="mt-6 text-right">
          <button type="button" className="mm-btn mm-btn-ghost text-xs" onClick={onAddDevSocio}>
            Adicionar sócio de teste
          </button>
        </div>
      ) : null}
    </section>
  );
}
function Cta(){
  return (
    <section className="mt-24 bg-[var(--mm-bg)]">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center text-[var(--mm-accent)]">
        <h2 className="text-3xl font-semibold" style={{ fontFamily: "var(--mm-serif)" }}>
          Pronto para conversar?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[color:rgba(250,250,249,0.75)] sm:text-base">
          Atendimento ágil e personalizado. Fale conosco pelo WhatsApp ou e-mail.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a href={waUrl} className="mm-btn mm-btn-primary">WhatsApp</a>
          <a href={mailtoGuilherme} className="mm-btn mm-btn-ghost mm-btn-ghost--on-dark">{SITE.emails[1]}</a>
        </div>
      </div>
    </section>
  );
}

function Footer(){
  return (
    <footer id="contato" className="scroll-mt-28 bg-[var(--mm-bg)] text-[var(--mm-accent)] sm:scroll-mt-32">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold">Contatos</h3>
          <ul className="mt-4 space-y-3 text-sm text-[color:rgba(248,244,236,0.85)]">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[var(--mm-primary)]" />
              <a href={`tel:+${whatsappDigits}`} className="transition-colors hover:text-[var(--mm-primary)]">
                {formattedWhatsappNumber}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--mm-primary)]" />
              <a href={mailtoLarissa} className="transition-colors hover:text-[var(--mm-primary)]">{SITE.emails[0]}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--mm-primary)]" />
              <a href={mailtoGuilherme} className="transition-colors hover:text-[var(--mm-primary)]">{SITE.emails[1]}</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--mm-primary)]" />
              <span>{SITE.enderecoCurto}</span>
            </li>
            <li className="pt-1 text-[color:rgba(248,244,236,0.7)]">Documentação societária em registro.</li>
          </ul>
        </div>
        <div className="text-sm text-[color:rgba(248,244,236,0.78)]">
          <p>Atendimento remoto em todo o Brasil e presença dedicada em Goiânia e região.</p>
          <p className="mt-2">Horário: segunda a sexta, 9h às 18h.</p>
        </div>
      </div>
      <p className="border-t border-[color:rgba(248,244,236,0.18)] py-6 text-center text-xs text-[color:rgba(248,244,236,0.6)]">
        © {new Date().getFullYear()} {SITE.nome}. Todos os direitos reservados.
      </p>
    </footer>
  );
}

function WhatsAppFloat(){
  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 mm-btn mm-btn-primary shadow-lg"
    >
      WhatsApp
    </a>
  );
}

export default function App(){
  const [socios, setSocios] = React.useState(SITE.socios);
  const handleAddDevSocio = React.useCallback(() => {
    setSocios((prev) => [
      ...prev,
      {
        nome: "Sócio(a) Teste",
        cargo: "Demonstração (dev)",
        oab: "OAB/XX 00.000",
        bio: "Entrada adicionada em desenvolvimento para validar animações de revelação.",
        imagem:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=480&q=80",
      },
    ]);
  }, []);
  const onAddDevSocio = import.meta.env?.DEV ? handleAddDevSocio : undefined;
  return (
    <div className="bg-[color:var(--mm-accent)] text-[var(--mm-ink)]">
      <Header />
      <main>
        <Hero />
        <InstitutionalIntro />
        <Areas />
        <Socios socios={socios} onAddDevSocio={onAddDevSocio} />
        <Cta />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
