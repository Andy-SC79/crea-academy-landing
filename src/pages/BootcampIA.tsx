import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  CalendarDays,
  Calculator,
  Check,
  Clock3,
  Code2,
  CreditCard,
  Download,
  FileText,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Presentation,
  Rocket,
  Send,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import infinitePrism from "@/assets/infinite-prism-dark.webp";
import ImpactedCompaniesSection from "@/components/landing/ImpactedCompaniesSection";
import WhatsAppWidget from "@/components/landing/WhatsAppButton";
import Footer from "@/components/layout/Footer";
import Header from "@/components/landing/tour/Header";
import { Button } from "@/components/ui/button";
import { openI365PaymentWidget } from "@/lib/i365-widget";
import { cn } from "@/lib/utils";
import "@/styles/tour-ambient.css";

const WHATSAPP_URL =
  "https://wa.me/573106014893?text=Hola%2C%20quiero%20informaci%C3%B3n%20del%20Bootcamp%20de%20IA";
const MAILTO_URL =
  "mailto:jeisonperez@ingenieria365.com?cc=eliza@ingenieria365.com,info@ingenieria365.com&subject=Cotizar%20Bootcamp%20de%20IA";
const QUOTE_EMAIL_ENDPOINT = "/api/send-quote";
const BOOTCAMP_PRICING_ENDPOINT = "/api/bootcamp-pricing";
const BOOTCAMP_PAYMENT_ENDPOINT = "/api/create-bootcamp-payment";
const DEFAULT_I365_WIDGET_APP_ID = "298f0727-6901-4d98-88e0-785576041b20";
const I365_WIDGET_APP_ID =
  import.meta.env.VITE_I365_PAYMENT_APP_ID || DEFAULT_I365_WIDGET_APP_ID;
const I365_BOOTCAMP_PLAN_ID =
  import.meta.env.VITE_I365_BOOTCAMP_PLAN_ID?.trim() || "";
const QUOTE_ASSETS = {
  creaLogo: "/crea-academy-logo.png",
  i365Logo: "/i365-plus-logo.png",
};
const LEGAL_ENTITY = {
  name: "Ingeniería 365",
  nit: "901290421-9",
  email: "info@ingenieria365.com",
  website: "www.ingenieria365.com",
};
const EXECUTIVE_CONTACTS = [
  {
    name: "Jeison Pérez",
    role: "CEO",
    email: "jeisonperez@ingenieria365.com",
    phone: "3016933713",
  },
  {
    name: "Elizabeth Navarrete",
    role: "Co-CEO",
    email: "eliza@ingenieria365.com",
    phone: "3005296040",
  },
];
const CITIES = ["Medellín", "Bogotá", "Cali", "Barranquilla", "Cartagena", "Bucaramanga"];
const PRICE_PER_PERSON = 1150000;
const TEAM_DISCOUNT = 0.1;
const TEAM_MIN_PEOPLE = 5;
const TEAM_PRICE_PER_PERSON = Math.round(PRICE_PER_PERSON * (1 - TEAM_DISCOUNT));
const TEAM_BASE_TOTAL = PRICE_PER_PERSON * TEAM_MIN_PEOPLE;
const TEAM_TOTAL = TEAM_PRICE_PER_PERSON * TEAM_MIN_PEOPLE;
const TEAM_SAVINGS = TEAM_BASE_TOTAL - TEAM_TOTAL;
const BOOTCAMP_SESSION_SELECT_EVENT = "bootcamp-session-select";
const BOOTCAMP_SESSIONS = [
  {
    id: "medellin-2026-05-22",
    status: "available",
    planId: "79d33e26-5076-4057-8eb0-326c2b19a937",
    shortLabel: "22 de mayo de 2026",
    dateLabel: "Viernes 22 de mayo de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Medellín",
    venue: "Auditorio del Centro Comercial San Diego",
    address: "Centro Comercial San Diego, Medellín",
    venueConfirmed: true,
    selectLabel: "22 de mayo de 2026 · Medellín · Centro Comercial San Diego",
    map: { x: 81.3, y: 139.8, labelX: -10, labelY: 4, anchor: "end" },
  },
  {
    id: "bogota-2026-05-29",
    status: "available",
    planId: "810ee2d2-720f-44b3-8377-4dfa2f689b1b",
    shortLabel: "29 de mayo de 2026",
    dateLabel: "Viernes 29 de mayo de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Bogotá",
    venue: "Sede por confirmar",
    address: "Dirección por confirmar",
    venueConfirmed: false,
    selectLabel: "29 de mayo de 2026 · Bogotá · sede por confirmar",
    map: { x: 108.9, y: 168.1, labelX: 10, labelY: 2, anchor: "start" },
  },
  {
    id: "cali-2026-06-12",
    status: "available",
    planId: "baa0c7c8-b226-4f55-92e6-37aedb4c598b",
    shortLabel: "12 de junio de 2026",
    dateLabel: "Viernes 12 de junio de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Cali",
    venue: "Sede por confirmar",
    address: "Dirección por confirmar",
    venueConfirmed: false,
    selectLabel: "12 de junio de 2026 · Cali · sede por confirmar",
    map: { x: 63.5, y: 191.4, labelX: -10, labelY: 8, anchor: "end" },
  },
  {
    id: "barranquilla-2026-07-10",
    status: "available",
    planId: "252ac806-8779-4cbf-9f5b-07f493e8e9ef",
    shortLabel: "10 de julio de 2026",
    dateLabel: "Viernes 10 de julio de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Barranquilla",
    venue: "Sede por confirmar",
    address: "Dirección por confirmar",
    venueConfirmed: false,
    selectLabel: "10 de julio de 2026 · Barranquilla · sede por confirmar",
    map: { x: 95.4, y: 52.5, labelX: 10, labelY: -8, anchor: "start" },
  },
  {
    id: "cartagena-2026-07-17",
    status: "available",
    planId: "d5ba71a2-b12d-4434-b67d-5b6cd28f4784",
    shortLabel: "17 de julio de 2026",
    dateLabel: "Viernes 17 de julio de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Cartagena",
    venue: "Sede por confirmar",
    address: "Dirección por confirmar",
    venueConfirmed: false,
    selectLabel: "17 de julio de 2026 · Cartagena · sede por confirmar",
    map: { x: 82.9, y: 63.1, labelX: -10, labelY: 3, anchor: "end" },
  },
  {
    id: "bucaramanga-2026-07-24",
    status: "available",
    planId: "2d9990b7-b1d3-4997-b6f4-98a4cb8e460e",
    shortLabel: "24 de julio de 2026",
    dateLabel: "Viernes 24 de julio de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Bucaramanga",
    venue: "Sede por confirmar",
    address: "Dirección por confirmar",
    venueConfirmed: false,
    selectLabel: "24 de julio de 2026 · Bucaramanga · sede por confirmar",
    map: { x: 126.6, y: 123.5, labelX: 10, labelY: 0, anchor: "start" },
  },
] as const;
const ACTIVE_BOOTCAMP_SESSION = BOOTCAMP_SESSIONS[0];

type BootcampSession = (typeof BOOTCAMP_SESSIONS)[number];

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type QuoteForm = {
  company: string;
  nit: string;
  contactName: string;
  contactRole: string;
  phone: string;
  city: string;
  sessionId: string;
  people: string;
  email: string;
};

type QuoteHtmlOptions = {
  form: QuoteForm;
  people: number;
  pricePerPerson: number;
  subtotal: number;
  discountValue: number;
  total: number;
  autoPrint?: boolean;
};

type PaymentMode = "checkout" | null;

type BootcampPaymentResponse = {
  ok?: boolean;
  error?: string;
  datos_widget?: {
    currency: string;
    amountInCents: number;
    reference: string;
    publicKey: string;
    signature: string;
    redirectUrl?: string;
  };
};

type BootcampQuote = {
  people: number;
  sessionId?: string;
  currency?: string;
  planId?: string | null;
  planName?: string | null;
  priceSource?: string;
  basePricePerPerson: number;
  pricePerPerson: number;
  baseSubtotal: number;
  subtotal: number;
  planDiscountPercentage: number;
  planDiscountValue: number;
  groupDiscountPercentage: number;
  groupDiscountValue: number;
  totalDiscountValue: number;
  total: number;
  amountInCents: number;
};

type BootcampPricingResponse = {
  ok?: boolean;
  error?: string;
  quote?: BootcampQuote;
};

function getBootcampSession(sessionId: string): BootcampSession {
  return BOOTCAMP_SESSIONS.find((session) => session.id === sessionId) ?? ACTIVE_BOOTCAMP_SESSION;
}

const STATS = [
  { value: "+6.000", label: "profesionales formados" },
  { value: "6", label: "ciudades confirmadas" },
  { value: "mayo-julio", label: "gira Colombia 2026" },
  { value: "1 día", label: "experiencia presencial" },
];

const PROBLEMS: Feature[] = [
  {
    icon: Clock3,
    title: "El equipo no tiene tiempo",
    description: "La adopción de IA se queda en charlas inspiradoras y nunca llega al proceso real.",
  },
  {
    icon: Workflow,
    title: "Los procesos siguen manuales",
    description: "Reportes, aprobaciones y seguimiento se repiten cada semana sin automatización.",
  },
  {
    icon: Lightbulb,
    title: "Hay ideas, pero no prototipos",
    description: "El Bootcamp lleva cada caso a una solución usable, visible y validable el mismo día.",
  },
];

const PHASES = [
  {
    label: "Antes",
    title: "Diagnóstico y foco",
    items: [
      "Levantamos retos reales del equipo.",
      "Priorizamos casos con impacto visible.",
      "Preparamos ejemplos y herramientas para la jornada.",
    ],
  },
  {
    label: "Durante",
    title: "Bootcamp presencial",
    items: [
      "Aprendizaje guiado con expertos de i365.",
      "Retos aplicados a procesos de la empresa.",
      "Construcción de prototipos con IA, low-code y automatización.",
    ],
  },
  {
    label: "Después",
    title: "Impacto continuo",
    items: [
      "Material digital y comunidad de aprendizaje.",
      "Rutas de profundización para equipos.",
      "Certificado de participación emitido por Ingeniería 365.",
    ],
  },
];

const MODULES: Feature[] = [
  {
    icon: Sparkles,
    title: "Prompt Engineering",
    description: "Comunicación efectiva con IA para producir respuestas útiles, verificables y accionables.",
  },
  {
    icon: Code2,
    title: "Vibe Coding",
    description: "Creación de aplicaciones y herramientas internas sin partir de código tradicional.",
  },
  {
    icon: Workflow,
    title: "Automatización con IA",
    description: "Flujos para reducir tareas repetitivas, seguimiento manual y fricción operativa.",
  },
  {
    icon: Presentation,
    title: "Analítica asistida",
    description: "Lectura de datos, generación de insights y toma de decisiones con apoyo de IA.",
  },
  {
    icon: Bot,
    title: "Agentes de IA",
    description: "Diseño de asistentes que ejecutan tareas específicas dentro del contexto del negocio.",
  },
  {
    icon: Rocket,
    title: "MVP en producción",
    description: "Cierre con una solución demostrable, no con una presentación que nadie vuelve a abrir.",
  },
];

const AGENDA = [
  { time: "8:00 AM", title: "Networking", description: "Conexión entre líderes y equipos participantes." },
  { time: "9:00 AM", title: "Fundamentos aplicados", description: "IA generativa y oportunidades reales de productividad." },
  { time: "11:00 AM", title: "Retos del negocio", description: "Trabajo sobre casos propios con acompañamiento experto." },
  { time: "2:00 PM", title: "Construcción", description: "Automatizaciones, asistentes y prototipos funcionales." },
  { time: "5:00 PM", title: "Demo Day", description: "Presentación de soluciones, feedback y próximos pasos." },
  { time: "6:00 PM", title: "Cierre", description: "Certificación y ruta de continuidad para el equipo." },
];

const INCLUDED = [
  "Todos los módulos prácticos",
  "Material digital exclusivo",
  "Acceso a comunidad i365",
  "Certificado de participación",
  "Sesión de diagnóstico previo para empresas",
  "Factura electrónica disponible",
  "Networking con líderes del sector",
  "Soporte post-bootcamp",
];

function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={cn("mb-10 max-w-3xl", centered && "mx-auto text-center")}>
      <p className="mb-3 inline-flex rounded-full border border-brand-neon/25 bg-brand-neon/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#0d8b5c] dark:text-brand-neon">
        {eyebrow}
      </p>
      <h2 className="font-display text-[clamp(2rem,5vw,4.6rem)] font-black leading-[1.02] tracking-tight text-[color:var(--tour-text-strong)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-7 text-[color:var(--tour-text-default)] dark:text-white/70 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <article className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-6 shadow-[var(--tour-shadow-soft)]">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-xl font-black text-[color:var(--tour-text-strong)]">
        {feature.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
        {feature.description}
      </p>
    </article>
  );
}

function scrollToBootcampSession(sessionId: string) {
  window.dispatchEvent(
    new CustomEvent(BOOTCAMP_SESSION_SELECT_EVENT, {
      detail: { sessionId },
    }),
  );
  document.getElementById("cotizador")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function TourRouteSection() {
  const routePoints = BOOTCAMP_SESSIONS.map((session) => `${session.map.x},${session.map.y}`).join(" ");

  return (
    <section id="gira-colombia" className="border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] px-4 py-16 dark:border-white/10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Gira Colombia 2026"
              title="Seis ciudades para llevar la IA del discurso a la operación."
              description="La ruta combina formación presencial, casos reales y pago por fecha. Medellín ya tiene auditorio confirmado; las demás ciudades quedan abiertas para reservar mientras cerramos sede."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-brand-neon/25 bg-brand-neon/10 p-4">
                <p className="font-display text-3xl font-black text-[color:var(--tour-text-strong)]">6</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#0d8b5c] dark:text-brand-neon">
                  ciudades
                </p>
              </div>
              <div className="rounded-lg border border-brand-cyan/25 bg-brand-cyan/10 p-4">
                <p className="font-display text-3xl font-black text-[color:var(--tour-text-strong)]">64</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-brand-cyan">
                  días de gira
                </p>
              </div>
              <div className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-4">
                <p className="font-display text-3xl font-black text-[color:var(--tour-text-strong)]">1</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">
                  día intensivo
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[440px] overflow-hidden rounded-lg border border-[color:var(--tour-border-standard)] bg-[linear-gradient(145deg,rgba(2,5,13,0.94),rgba(7,18,37,0.9))] p-5 shadow-[var(--tour-shadow-elevated)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(4,255,141,0.18),transparent_34%),radial-gradient(circle_at_82%_22%,rgba(0,210,255,0.18),transparent_32%),radial-gradient(circle_at_70%_82%,rgba(123,44,191,0.18),transparent_36%)]" />
            <svg
              viewBox="0 0 260 360"
              role="img"
              aria-label="Mapa de Colombia con la ruta del Bootcamp IA 2026"
              className="relative mx-auto h-[390px] w-full max-w-[420px]"
            >
              <defs>
                <linearGradient id="colombiaMapFill" x1="45" y1="20" x2="214" y2="342" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#10233f" />
                  <stop offset="0.48" stopColor="#0d3554" />
                  <stop offset="1" stopColor="#092018" />
                </linearGradient>
                <linearGradient id="tourRouteStroke" x1="90" y1="320" x2="155" y2="85" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#04FF8D" />
                  <stop offset="0.5" stopColor="#00D2FF" />
                  <stop offset="1" stopColor="#9D00FF" />
                </linearGradient>
                <filter id="pinGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M84.9 258.1L77 253.7L67.9 247.6L62.6 250.5L47 247.9L42.4 240L39 240.3L20.5 229.7L18 224L24.9 222.6L24.1 213.3L28.4 206.6L37.6 205.4L45.4 193.8L52.5 184.1L45.6 179.7L49.1 168.9L45 152L48.9 147.2L46 131.5L38.5 121.7L40.9 112.7L46.8 114L50.3 108.5L46 97.6L48.3 94.9L57.8 95.5L71.7 82.6L79.3 80.6L79.5 74.5L82.9 58.9L93.5 50.3L105.2 50L106.6 46.1L121.1 47.7L135.7 38.3L142.9 34.2L151.8 25.3L158.4 26.4L163.2 31.3L159.6 37.5L147.7 40.6L143.1 49.8L135.9 55.1L130.5 62L128.3 75.2L123.1 86L132.7 87.3L135.1 95.8L139.1 99.8L140.6 107.3L138.4 114.1L139 118L143.6 119.5L148 126L171.8 124.2L182.5 126.5L195.5 142.5L203 140.5L216.3 141.5L226.9 139.4L233.4 142.5L230.1 152.5L225.9 158.7L224.5 172L228.2 184.3L233.5 189.7L234.1 193.9L224.7 203.1L231.4 207.2L236.4 213.6L242 232.1L238.5 234.4L234.9 223.4L229.8 217.6L223.7 224L187.6 223.5L187.9 235.1L198.7 237L198.1 244.1L194.4 242.2L184 245.2L183.9 258.7L192.1 265.4L195 276L194.5 284L186.2 334.7L177 324.9L171.4 324.5L183.4 305.6L169.2 297L158.1 298.6L151.4 295.4L141.2 300.3L127.5 297.9L116.6 278.6L108 273.8L102.1 265.1L89.8 256.3L84.9 258.1Z"
                fill="url(#colombiaMapFill)"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="2"
              />
              <path
                d="M80 59C93 80 91 104 81 130C69 162 57 192 76 224C92 252 125 276 164 300"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
                strokeDasharray="6 8"
              />
              <polyline
                points={routePoints}
                fill="none"
                stroke="url(#tourRouteStroke)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
              {BOOTCAMP_SESSIONS.map((session, index) => (
                <g key={session.id} filter="url(#pinGlow)">
                  <circle cx={session.map.x} cy={session.map.y} r="11" fill="#02050d" stroke="#04FF8D" strokeWidth="2" />
                  <circle cx={session.map.x} cy={session.map.y} r="4" fill={session.venueConfirmed ? "#04FF8D" : "#00D2FF"} />
                  <text
                    x={session.map.x}
                    y={session.map.y + 4}
                    textAnchor="middle"
                    className="fill-white text-[9px] font-black"
                  >
                    {index + 1}
                  </text>
                  <text
                    x={session.map.x + session.map.labelX}
                    y={session.map.y + session.map.labelY}
                    textAnchor={session.map.anchor}
                    className="fill-white text-[10px] font-black tracking-normal"
                  >
                    {session.city}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {BOOTCAMP_SESSIONS.map((session, index) => (
            <article
              key={session.id}
              className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-5 shadow-[var(--tour-shadow-soft)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-cyan">
                    Parada {index + 1}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-black text-[color:var(--tour-text-strong)]">
                    {session.city}
                  </h3>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em]",
                    session.venueConfirmed
                      ? "border-brand-neon/25 bg-brand-neon/10 text-[#0d8b5c] dark:text-brand-neon"
                      : "border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-200",
                  )}
                >
                  {session.venueConfirmed ? "Sede confirmada" : "Sede por confirmar"}
                </span>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
                <p className="flex gap-3">
                  <CalendarDays className="mt-1 h-4 w-4 shrink-0 text-brand-cyan" />
                  <span>
                    <strong className="text-[color:var(--tour-text-strong)]">{session.shortLabel}</strong>
                    <br />
                    {session.timeLabel}
                  </span>
                </p>
                <p className="flex gap-3">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand-neon" />
                  <span>
                    <strong className="text-[color:var(--tour-text-strong)]">{session.venue}</strong>
                    <br />
                    {session.address}
                  </span>
                </p>
              </div>
              <Button
                type="button"
                onClick={() => scrollToBootcampSession(session.id)}
                className="mt-5 w-full rounded-full bg-brand-neon font-black text-black hover:bg-brand-neon/90"
              >
                Reservar esta ciudad
                <ArrowRight className="h-4 w-4" />
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function absoluteAssetUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;

  const configuredBase = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined;
  const runtimeBase = typeof window !== "undefined" ? window.location.origin : "";
  const baseUrl = configuredBase || runtimeBase;

  if (!baseUrl) return path;

  return new URL(path, baseUrl).toString();
}

async function parsePaymentResponse(response: Response) {
  return (await response.json().catch(() => null)) as BootcampPaymentResponse | null;
}

function buildPaymentCheckoutUrl(widgetData: NonNullable<BootcampPaymentResponse["datos_widget"]>) {
  const checkoutUrl = new URL("https://checkout.wompi.co/p/");
  checkoutUrl.searchParams.set("public-key", widgetData.publicKey);
  checkoutUrl.searchParams.set("currency", widgetData.currency);
  checkoutUrl.searchParams.set("amount-in-cents", String(widgetData.amountInCents));
  checkoutUrl.searchParams.set("reference", widgetData.reference);
  checkoutUrl.searchParams.set("signature:integrity", widgetData.signature);

  if (widgetData.redirectUrl) {
    checkoutUrl.searchParams.set("redirect-url", widgetData.redirectUrl);
  }

  return checkoutUrl.toString();
}

function slugifyPaymentIdentityPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildSyntheticPaymentId(prefix: string, ...parts: string[]) {
  const normalized = parts.map(slugifyPaymentIdentityPart).filter(Boolean).join("-");
  return `${prefix}-${normalized || "cliente"}`.slice(0, 120);
}

function buildBootcampPaymentIdentity(form: QuoteForm) {
  const companyAnchor = form.nit || form.company || "empresa";

  return {
    userId: buildSyntheticPaymentId(
      "bootcamp-user",
      form.email,
      form.contactName || form.company,
      companyAnchor,
    ),
    companyId: buildSyntheticPaymentId("bootcamp-company", companyAnchor),
  };
}

function buildLocalFallbackQuote(
  peopleInput: number,
  session: BootcampSession = ACTIVE_BOOTCAMP_SESSION,
): BootcampQuote {
  const safePeople = Math.max(peopleInput, 0);
  const basePricePerPerson = PRICE_PER_PERSON;
  const pricePerPerson = basePricePerPerson;
  const baseSubtotal = safePeople * basePricePerPerson;
  const subtotal = safePeople * pricePerPerson;
  const groupDiscountPercentage = safePeople >= TEAM_MIN_PEOPLE ? Math.round(TEAM_DISCOUNT * 100) : 0;
  const groupDiscountValue = groupDiscountPercentage > 0 ? Math.round(subtotal * TEAM_DISCOUNT) : 0;
  const total = Math.max(subtotal - groupDiscountValue, 0);

  return {
    people: safePeople,
    sessionId: session.id,
    currency: "COP",
    planId: session.planId || null,
    planName: null,
    priceSource: "fallback",
    basePricePerPerson,
    pricePerPerson,
    baseSubtotal,
    subtotal,
    planDiscountPercentage: 0,
    planDiscountValue: 0,
    groupDiscountPercentage,
    groupDiscountValue,
    totalDiscountValue: groupDiscountValue,
    total,
    amountInCents: Math.round(total * 100),
  };
}

function generateQuoteHtml({
  form,
  people,
  pricePerPerson,
  subtotal,
  discountValue,
  total,
  autoPrint = false,
}: QuoteHtmlOptions) {
  const date = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const ref = `I365-${Date.now().toString().slice(-6)}`;
  const company = escapeHtml(form.company || "Empresa");
  const nit = escapeHtml(form.nit || "N/A");
  const contactName = escapeHtml(form.contactName || "Contacto por definir");
  const contactRole = escapeHtml(form.contactRole || "Rol por definir");
  const phone = escapeHtml(form.phone || "No registrado");
  const email = escapeHtml(form.email || "No registrado");
  const city = escapeHtml(form.city);
  const selectedSession = getBootcampSession(form.sessionId);
  const sessionDate = escapeHtml(selectedSession.dateLabel);
  const sessionTime = escapeHtml(selectedSession.timeLabel);
  const sessionCity = escapeHtml(selectedSession.city);
  const sessionVenue = escapeHtml(selectedSession.venue);
  const sessionAddress = escapeHtml(selectedSession.address);
  const creaLogoUrl = absoluteAssetUrl(QUOTE_ASSETS.creaLogo);
  const i365LogoUrl = absoluteAssetUrl(QUOTE_ASSETS.i365Logo);
  const paymentUrl = absoluteAssetUrl("/bootcamp-ia#cotizador");
  const printScript = autoPrint
    ? "<script>window.onload = function() { window.print(); };</script>"
    : "";
  const includedItems = INCLUDED.map(
    (item) => `<div class="feature"><span>&#10003;</span>${escapeHtml(item)}</div>`,
  ).join("");
  const executiveCards = EXECUTIVE_CONTACTS.map(
    (contact) => `
      <article class="contact-card">
        <strong>${escapeHtml(contact.name)}</strong>
        <span>${escapeHtml(contact.role)}</span>
        <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>
        <small>Cel. ${escapeHtml(contact.phone)}</small>
      </article>
    `,
  ).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Cotización Bootcamp de IA - ${company}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #061322; background: #edf7fb; }
  a { color: inherit; }
  .page { max-width: 920px; margin: 0 auto; padding: 42px; }
  .sheet { overflow: hidden; border: 1px solid #d5e7f0; border-radius: 24px; background: #ffffff; box-shadow: 0 24px 80px rgba(3, 18, 33, .12); }
  .hero { padding: 34px 36px 30px; color: #ffffff; background: #061322; }
  .brand-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 34px; }
  .crea-logo { width: 190px; max-height: 68px; object-fit: contain; background: #ffffff; border-radius: 16px; padding: 10px; }
  .i365-logo { width: 130px; max-height: 76px; object-fit: contain; background: #ffffff; border-radius: 16px; padding: 10px; }
  .kicker { margin: 0 0 10px; color: #03f28f; font-size: 12px; font-weight: 900; letter-spacing: 1.8px; text-transform: uppercase; }
  h1 { max-width: 650px; margin: 0; font-size: 40px; line-height: 1.05; letter-spacing: -.02em; }
  .subtitle { max-width: 680px; margin: 16px 0 0; color: rgba(255,255,255,.78); font-size: 16px; line-height: 1.6; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 28px; }
  .meta div { border: 1px solid rgba(255,255,255,.14); border-radius: 14px; padding: 13px 14px; background: rgba(255,255,255,.06); }
  .meta small, .cell small { display: block; margin-bottom: 6px; color: #6f8797; font-size: 10px; font-weight: 900; letter-spacing: 1.2px; text-transform: uppercase; }
  .meta strong { color: #ffffff; font-size: 15px; }
  .section { padding: 28px 36px; border-top: 1px solid #e2eef4; }
  .label { margin: 0 0 16px; color: #2f3289; font-size: 12px; font-weight: 900; letter-spacing: 1.6px; text-transform: uppercase; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .cell { min-height: 82px; border: 1px solid #dbeaf1; border-radius: 14px; padding: 16px; background: #f8fbfd; }
  .cell strong { display: block; overflow-wrap: anywhere; color: #061322; font-size: 17px; line-height: 1.35; }
  .summary { border-radius: 18px; padding: 24px; color: #ffffff; background: linear-gradient(135deg, #061322 0%, #102a43 100%); }
  .row { display: flex; justify-content: space-between; gap: 20px; padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,.13); }
  .row:last-child { border-bottom: 0; }
  .row span { color: rgba(255,255,255,.72); }
  .total { margin-top: 8px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.26); font-size: 24px; font-weight: 900; }
  .green { color: #03f28f; }
  .features { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .feature { display: flex; gap: 9px; align-items: flex-start; border: 1px solid #dbeaf1; border-radius: 12px; padding: 12px 14px; background: #f8fbfd; color: #203141; font-size: 14px; line-height: 1.4; }
  .feature span { color: #02b876; font-weight: 900; }
  .payment-box { display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: center; border: 1px solid #b8f5d6; border-radius: 18px; padding: 20px; background: #effdf6; }
  .payment-box strong { display: block; color: #061322; font-size: 18px; }
  .payment-box p { margin: 6px 0 0; color: #425466; font-size: 14px; line-height: 1.5; }
  .payment-box a { display: inline-block; border-radius: 999px; padding: 12px 18px; background: #03f28f; color: #061322; font-size: 13px; font-weight: 900; text-decoration: none; white-space: nowrap; }
  .contacts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .contact-card { border: 1px solid #dbeaf1; border-radius: 16px; padding: 18px; background: #ffffff; }
  .contact-card strong, .contact-card span, .contact-card a, .contact-card small { display: block; }
  .contact-card strong { color: #061322; font-size: 18px; }
  .contact-card span { margin-top: 4px; color: #2f3289; font-weight: 800; }
  .contact-card a { margin-top: 10px; color: #0076a8; font-size: 14px; text-decoration: none; }
  .contact-card small { margin-top: 6px; color: #657687; font-size: 13px; }
  .note { border: 1px solid #b8f5d6; border-radius: 16px; padding: 18px; background: #effdf6; color: #203141; font-size: 14px; line-height: 1.6; }
  .footer { display: flex; justify-content: space-between; gap: 18px; padding: 20px 36px 30px; color: #657687; font-size: 12px; }
  @media (max-width: 720px) {
    .page { padding: 18px; }
    .hero, .section { padding: 24px; }
    .brand-row, .footer { align-items: flex-start; flex-direction: column; }
    .meta, .grid, .features, .contacts, .payment-box { grid-template-columns: 1fr; }
    h1 { font-size: 30px; }
  }
  @media print {
    body { background: #ffffff; }
    .page { max-width: none; padding: 0; }
    .sheet { border: 0; border-radius: 0; box-shadow: none; }
  }
</style>
</head>
<body>
  <main class="page">
    <section class="sheet">
      <header class="hero">
        <div class="brand-row">
          <img class="crea-logo" src="${creaLogoUrl}" alt="Crea Academy" />
          <img class="i365-logo" src="${i365LogoUrl}" alt="Ingeniería 365" />
        </div>
        <p class="kicker">Cotización empresarial</p>
        <h1>Bootcamp de Inteligencia Artificial para ${company}</h1>
        <p class="subtitle">
          Propuesta personalizada para formar ${people} participante${people === 1 ? "" : "s"} en IA aplicada,
          automatización, agentes y construcción de prototipos útiles para el negocio.
        </p>
        <div class="meta">
          <div><small>Cotización</small><strong>${date}</strong></div>
          <div><small>Referencia</small><strong>${ref}</strong></div>
          <div><small>Cohorte</small><strong>${sessionDate}</strong></div>
        </div>
      </header>

      <section class="section">
        <p class="label">Datos del cliente</p>
        <div class="grid">
          <div class="cell"><small>Empresa</small><strong>${company}</strong></div>
          <div class="cell"><small>NIT</small><strong>${nit}</strong></div>
          <div class="cell"><small>Contacto</small><strong>${contactName}</strong></div>
          <div class="cell"><small>Rol</small><strong>${contactRole}</strong></div>
          <div class="cell"><small>Correo</small><strong>${email}</strong></div>
          <div class="cell"><small>Teléfono</small><strong>${phone}</strong></div>
        </div>
      </section>

      <section class="section">
        <p class="label">Cohorte seleccionada</p>
        <div class="grid">
          <div class="cell"><small>Fecha</small><strong>${sessionDate}</strong></div>
          <div class="cell"><small>Horario</small><strong>${sessionTime}</strong></div>
          <div class="cell"><small>Ciudad</small><strong>${sessionCity}</strong></div>
          <div class="cell"><small>Lugar</small><strong>${sessionVenue}</strong></div>
          <div class="cell"><small>Dirección</small><strong>${sessionAddress}</strong></div>
          <div class="cell"><small>Ciudad de cotización</small><strong>${city}</strong></div>
        </div>
      </section>

      <section class="section">
        <p class="label">Datos legales del proveedor</p>
        <div class="grid">
          <div class="cell"><small>Persona jurídica</small><strong>${escapeHtml(LEGAL_ENTITY.name)}</strong></div>
          <div class="cell"><small>NIT</small><strong>${escapeHtml(LEGAL_ENTITY.nit)}</strong></div>
          <div class="cell"><small>Correo corporativo</small><strong>${escapeHtml(LEGAL_ENTITY.email)}</strong></div>
          <div class="cell"><small>Sitio web</small><strong>${escapeHtml(LEGAL_ENTITY.website)}</strong></div>
        </div>
      </section>

      <section class="section">
        <p class="label">Resumen financiero</p>
        <div class="summary">
          <div class="row"><span>Participantes</span><strong>${people}</strong></div>
          <div class="row"><span>Precio por persona</span><strong>${formatCurrency(pricePerPerson)}</strong></div>
          <div class="row"><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
          <div class="row"><span>Descuentos aplicados</span><strong class="green">-${formatCurrency(discountValue)}</strong></div>
          <div class="row total"><span>Total estimado</span><strong class="green">${formatCurrency(total)}</strong></div>
        </div>
      </section>

      <section class="section">
        <p class="label">Pago seguro</p>
        <div class="payment-box">
          <div>
            <strong>Pago en línea con el portal i365</strong>
            <p>
              Para pagar esta cotización, ingresa al cotizador oficial y usa "Pagar ahora".
              El monto se recalcula en servidor antes de abrir el portal de pagos.
            </p>
          </div>
          <a href="${paymentUrl}">Pagar en línea</a>
        </div>
      </section>

      <section class="section">
        <p class="label">Incluido en el Bootcamp</p>
        <div class="features">${includedItems}</div>
      </section>

      <section class="section">
        <p class="label">Contactos principales</p>
        <div class="contacts">${executiveCards}</div>
      </section>

      <section class="section">
        <div class="note">
          Esta cotización tiene validez de 15 días calendario. Los valores están expresados en pesos colombianos
          y pueden formalizarse mediante factura electrónica, orden de compra o confirmación comercial. La reserva
          de cupos se confirma con el acuerdo de pago aprobado por Ingeniería 365.
        </div>
      </section>

      <footer class="footer">
        <span>Crea Academy by Ingeniería 365</span>
        <span>${escapeHtml(LEGAL_ENTITY.website)} - ${escapeHtml(LEGAL_ENTITY.email)}</span>
      </footer>
    </section>
  </main>
  ${printScript}
</body>
</html>`;
}

function CorporateQuoter() {
  const [form, setForm] = useState<QuoteForm>({
    company: "",
    nit: "",
    contactName: "",
    contactRole: "",
    phone: "",
    city: ACTIVE_BOOTCAMP_SESSION.city,
    sessionId: ACTIVE_BOOTCAMP_SESSION.id,
    people: String(TEAM_MIN_PEOPLE),
    email: "",
  });
  const [sentMessage, setSentMessage] = useState("");
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(null);
  const [pricing, setPricing] = useState<BootcampQuote>(() => buildLocalFallbackQuote(TEAM_MIN_PEOPLE));

  const people = Math.max(Number.parseInt(form.people, 10) || 0, 0);
  const missingForDiscount = Math.max(TEAM_MIN_PEOPLE - people, 0);
  const selectedSession = getBootcampSession(form.sessionId);
  const canPaySelectedSession = selectedSession.status === "available";
  const paymentIdentity = buildBootcampPaymentIdentity(form);
  const selectedPlanId = selectedSession.planId || I365_BOOTCAMP_PLAN_ID;
  const usesEmbeddedI365Widget = Boolean(selectedPlanId) && people === 1;
  const effectivePricing =
    pricing.people === people && pricing.sessionId === selectedSession.id
      ? pricing
      : buildLocalFallbackQuote(people, selectedSession);
  const pricePerPerson = effectivePricing.pricePerPerson;
  const subtotal = effectivePricing.baseSubtotal;
  const total = effectivePricing.total;
  const totalDiscountValue = effectivePricing.totalDiscountValue;
  const hasDiscount = totalDiscountValue > 0;
  const hasPlanDiscount = effectivePricing.planDiscountPercentage > 0;
  const hasGroupDiscount = effectivePricing.groupDiscountPercentage > 0;

  const updateForm = (field: keyof QuoteForm, value: string) => {
    if (field === "email" && paymentMessage) {
      setPaymentMessage("");
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateSession = (sessionId: string) => {
    const nextSession = getBootcampSession(sessionId);
    setForm((current) => ({
      ...current,
      sessionId: nextSession.id,
      city: nextSession.city,
    }));
  };

  useEffect(() => {
    const pricingSession = getBootcampSession(form.sessionId);
    const fallbackQuote = buildLocalFallbackQuote(people, pricingSession);

    if (people < 1) return;

    const controller = new AbortController();

    void fetch(BOOTCAMP_PRICING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ people, sessionId: pricingSession.id }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as BootcampPricingResponse | null;

        if (!response.ok || !data?.quote) {
          throw new Error(data?.error || "No se pudo sincronizar el precio del Bootcamp con i365.");
        }

        setPricing(data.quote);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setPricing(fallbackQuote);
      });

    return () => controller.abort();
  }, [people, form.sessionId]);

  useEffect(() => {
    const handleSessionSelect = (event: Event) => {
      const nextSessionId = (event as CustomEvent<{ sessionId?: string }>).detail?.sessionId;
      if (nextSessionId) {
        updateSession(nextSessionId);
      }
    };

    window.addEventListener(BOOTCAMP_SESSION_SELECT_EVENT, handleSessionSelect);
    return () => window.removeEventListener(BOOTCAMP_SESSION_SELECT_EVENT, handleSessionSelect);
  }, []);

  const validatePaymentFields = () => {
    if (!canPaySelectedSession) {
      setPaymentMessage("Esta fecha aún no está disponible para pago.");
      return false;
    }

    if (people < 1) {
      setPaymentMessage("Agrega al menos una persona para iniciar el pago.");
      return false;
    }

    if (!form.email.trim()) {
      setPaymentMessage("Agrega el correo del cliente para asociar el pago.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setPaymentMessage("Agrega un correo válido para asociar el pago.");
      return false;
    }

    return true;
  };

  const handleDownloadQuote = () => {
    const quoteWindow = window.open("", "_blank");
    if (!quoteWindow) return;

    quoteWindow.document.write(
      generateQuoteHtml({
        form,
        people,
        pricePerPerson,
        subtotal,
        discountValue: totalDiscountValue,
        total,
        autoPrint: true,
      }),
    );
    quoteWindow.document.close();
  };

  const openMailFallback = () => {
    const subject = encodeURIComponent(`Cotización Bootcamp de IA - ${form.company || "Empresa"}`);
    const body = encodeURIComponent(
      `Hola, quiero recibir la cotización del Bootcamp de IA.\n\nEmpresa: ${form.company || "N/A"}\nNIT: ${form.nit || "N/A"}\nContacto: ${form.contactName || "N/A"}\nRol: ${form.contactRole || "N/A"}\nFecha: ${selectedSession.dateLabel}\nLugar: ${selectedSession.venue}, ${selectedSession.city}\nCiudad de cotización: ${form.city}\nParticipantes: ${people}\nTotal estimado: ${formatCurrency(total)}`,
    );

    window.location.href = `mailto:${form.email}?cc=jeisonperez@ingenieria365.com,eliza@ingenieria365.com&subject=${subject}&body=${body}`;
  };

  const createPaymentIntent = async () => {
    const response = await fetch(BOOTCAMP_PAYMENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: form.company,
        nit: form.nit,
        contactName: form.contactName,
        contactRole: form.contactRole,
        phone: form.phone,
        city: form.city,
        sessionId: selectedSession.id,
        sessionDate: selectedSession.dateLabel,
        sessionTime: selectedSession.timeLabel,
        sessionVenue: selectedSession.venue,
        sessionAddress: selectedSession.address,
        people,
        email: form.email.trim(),
        userId: paymentIdentity.userId,
        companyId: paymentIdentity.companyId,
      }),
    });
    const data = await parsePaymentResponse(response);

    if (response.ok && data?.datos_widget) {
      return data;
    }

    throw new Error(data?.error || "No se pudo crear el pago en el portal i365.");
  };

  const handleEmailQuote = async () => {
    if (!form.email) {
      setSentMessage("Agrega un correo para enviar la cotización.");
      return;
    }

    setIsSendingQuote(true);
    setSentMessage("");

    const quoteHtml = generateQuoteHtml({
      form,
      people,
      pricePerPerson,
      subtotal,
      discountValue: totalDiscountValue,
      total,
      autoPrint: false,
    });

    try {
      const response = await fetch(QUOTE_EMAIL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.email,
          quote: {
            company: form.company,
            nit: form.nit,
            contactName: form.contactName,
            contactRole: form.contactRole,
            phone: form.phone,
            city: form.city,
            sessionId: selectedSession.id,
            sessionDate: selectedSession.dateLabel,
            sessionTime: selectedSession.timeLabel,
            sessionVenue: selectedSession.venue,
            sessionAddress: selectedSession.address,
            people,
            pricePerPerson,
            subtotal,
            discountValue: totalDiscountValue,
            total,
          },
          html: quoteHtml,
        }),
      });

      if (!response.ok) {
        throw new Error(`No se pudo enviar la cotización (${response.status}).`);
      }

      setSentMessage(`Cotización enviada a ${form.email}.`);
    } catch {
      openMailFallback();
      setSentMessage("No pude enviarla automáticamente; abrí tu correo como respaldo.");
    } finally {
      setIsSendingQuote(false);
    }
  };

  const handleSecurePayment = async () => {
    if (!validatePaymentFields()) return;

    setPaymentMode("checkout");
    if (usesEmbeddedI365Widget) {
      setPaymentMessage("Cargando el widget de pagos i365...");

      try {
        let widgetCompleted = false;

        await openI365PaymentWidget({
          appId: I365_WIDGET_APP_ID,
          planId: selectedPlanId,
          userId: paymentIdentity.userId,
          companyId: paymentIdentity.companyId,
          userEmail: form.email.trim(),
          userName: form.contactName.trim() || form.company.trim() || "Cliente Bootcamp IA",
          onSuccess: () => {
            widgetCompleted = true;
            setPaymentMode(null);
            setPaymentMessage("Pago aprobado en i365. Cierra el widget para continuar.");
          },
          onError: (error) => {
            widgetCompleted = true;
            setPaymentMode(null);
            setPaymentMessage(
              error instanceof Error
                ? error.message
                : error.message || "El widget i365 reportó un error al procesar el pago.",
            );
          },
          onClose: () => {
            setPaymentMode(null);
            if (!widgetCompleted) {
              setPaymentMessage("El widget i365 se cerró antes de completar el pago.");
            }
          },
        });

        setPaymentMessage("Widget i365 abierto. Completa el pago para confirmar la reserva.");
      } catch (error) {
        setPaymentMode(null);
        setPaymentMessage(
          error instanceof Error
            ? error.message
            : "No se pudo abrir el widget de pagos i365.",
        );
      }

      return;
    }

    setPaymentMessage("Preparando el portal de pagos i365...");

    try {
      const data = await createPaymentIntent();
      const widgetData = data.datos_widget;
      const checkoutUrl = buildPaymentCheckoutUrl(widgetData);

      setPaymentMessage(`Referencia ${widgetData.reference} lista. Abriendo el portal de pagos i365...`);
      window.location.assign(checkoutUrl);
    } catch (error) {
      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar el portal de pagos i365.",
      );
    } finally {
      setPaymentMode(null);
    }
  };

  return (
    <section id="cotizador" className="border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] px-4 py-16 dark:border-white/10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-brand-cyan">
            <Calculator className="h-3.5 w-3.5" />
            Cotizador empresarial
          </div>
          <h2 className="mt-5 font-display text-[clamp(2rem,5vw,4.4rem)] font-black leading-[1.02] tracking-tight text-[color:var(--tour-text-strong)]">
            Elige ciudad, calcula y paga tu cupo.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--tour-text-default)] dark:text-white/70">
            Selecciona la parada de la gira, ingresa el correo, confirma el número de personas y abre el portal de pagos i365. Si necesitas apoyo, WhatsApp queda disponible como soporte.
          </p>
          <div className="mt-6 max-w-xl rounded-lg border border-brand-neon/25 bg-brand-neon/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0d8b5c] dark:text-brand-neon">
              Cohorte seleccionada
            </p>
            <p className="mt-3 font-display text-2xl font-black text-[color:var(--tour-text-strong)]">
              {selectedSession.dateLabel} · {selectedSession.city}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
              {selectedSession.venue}. {selectedSession.address}.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-5 shadow-[var(--tour-shadow-elevated)] sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">Empresa</span>
              <input
                value={form.company}
                onChange={(event) => updateForm("company", event.target.value)}
                placeholder="Ej: Bancolombia S.A."
                className="h-12 w-full rounded-lg border border-[color:var(--tour-border-standard)] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-cyan dark:bg-[#071225] dark:text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">NIT</span>
              <input
                value={form.nit}
                onChange={(event) => updateForm("nit", event.target.value)}
                placeholder="Ej: 890.903.938-8"
                className="h-12 w-full rounded-lg border border-[color:var(--tour-border-standard)] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-cyan dark:bg-[#071225] dark:text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">Contacto</span>
              <input
                value={form.contactName}
                onChange={(event) => updateForm("contactName", event.target.value)}
                placeholder="Ej: Laura Gómez"
                className="h-12 w-full rounded-lg border border-[color:var(--tour-border-standard)] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-cyan dark:bg-[#071225] dark:text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">Cargo</span>
              <input
                value={form.contactRole}
                onChange={(event) => updateForm("contactRole", event.target.value)}
                placeholder="Ej: Directora de talento"
                className="h-12 w-full rounded-lg border border-[color:var(--tour-border-standard)] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-cyan dark:bg-[#071225] dark:text-white"
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">Fecha y lugar</span>
              <select
                value={form.sessionId}
                onChange={(event) => updateSession(event.target.value)}
                className="h-12 w-full rounded-lg border border-[color:var(--tour-border-standard)] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-cyan dark:bg-[#071225] dark:text-white"
              >
                {BOOTCAMP_SESSIONS.map((session) => (
                  <option key={session.id} value={session.id} disabled={session.status !== "available"}>
                    {session.selectLabel}
                    {session.status !== "available" ? " · aún no disponible" : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2 rounded-lg border border-brand-cyan/25 bg-brand-cyan/10 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand-cyan" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-cyan">
                      Fecha disponible
                    </p>
                    <p className="mt-1 text-sm font-black text-[color:var(--tour-text-strong)]">
                      {selectedSession.dateLabel}
                    </p>
                    <p className="text-sm text-[color:var(--tour-text-default)] dark:text-white/70">
                      {selectedSession.timeLabel}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-neon" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-neon">
                      Lugar
                    </p>
                    <p className="mt-1 text-sm font-black text-[color:var(--tour-text-strong)]">
                      {selectedSession.venue}
                    </p>
                    <p className="text-sm text-[color:var(--tour-text-default)] dark:text-white/70">
                      {selectedSession.address}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-3 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-xs font-bold text-[color:var(--tour-text-default)] dark:text-white/70">
                {selectedSession.venueConfirmed
                  ? "Sede confirmada. Puedes reservar cupo individual o cotizar varios participantes ahora."
                  : "Fecha confirmada y disponible para reserva. La sede y dirección final se compartirán al cerrar el venue de la ciudad."}
              </p>
            </div>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">Ciudad de contacto</span>
              <select
                value={form.city}
                onChange={(event) => updateForm("city", event.target.value)}
                className="h-12 w-full rounded-lg border border-[color:var(--tour-border-standard)] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-cyan dark:bg-[#071225] dark:text-white"
              >
                {CITIES.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">Número de personas</span>
              <input
                type="number"
                min="1"
                value={form.people}
                onChange={(event) => updateForm("people", event.target.value)}
                className="h-12 w-full rounded-lg border border-[color:var(--tour-border-standard)] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-cyan dark:bg-[#071225] dark:text-white"
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">Teléfono de contacto</span>
              <input
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
                placeholder="Ej: 300 000 0000"
                className="h-12 w-full rounded-lg border border-[color:var(--tour-border-standard)] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-cyan dark:bg-[#071225] dark:text-white"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-3 rounded-lg bg-[#071225] p-4 text-white sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Personas</p>
              <p className="mt-2 font-display text-3xl font-black">{people}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Subtotal</p>
              <p className={cn("mt-2 font-display text-2xl font-black", hasDiscount && "text-white/45 line-through")}>
                {formatCurrency(subtotal)}
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Total final</p>
              <p className="mt-2 font-display text-2xl font-black text-brand-neon">
                {formatCurrency(total)}
              </p>
            </div>
          </div>

          {hasDiscount ? (
            <p className="mt-3 rounded-lg border border-brand-neon/25 bg-brand-neon/10 px-4 py-3 text-sm font-bold text-[#0d8b5c] dark:text-brand-neon">
              {hasPlanDiscount && hasGroupDiscount
                ? `Descuento del plan i365 (${effectivePricing.planDiscountPercentage}%) y descuento grupal del ${effectivePricing.groupDiscountPercentage}% aplicados automáticamente.`
                : hasPlanDiscount
                  ? `Descuento del plan i365 (${effectivePricing.planDiscountPercentage}%) aplicado automáticamente.`
                  : `Descuento grupal del ${effectivePricing.groupDiscountPercentage}% aplicado automáticamente.`}
            </p>
          ) : (
            <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-700 dark:text-amber-200">
              {hasPlanDiscount
                ? `Descuento del plan i365 (${effectivePricing.planDiscountPercentage}%) activo. Agrega ${missingForDiscount} persona${missingForDiscount === 1 ? "" : "s"} más para activar el ${Math.round(TEAM_DISCOUNT * 100)}% de descuento grupal.`
                : `Agrega ${missingForDiscount} persona${missingForDiscount === 1 ? "" : "s"} más para activar el ${Math.round(TEAM_DISCOUNT * 100)}% de descuento grupal.`}
            </p>
          )}

          <div className="mt-6 rounded-lg border border-brand-neon/35 bg-brand-neon/10 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-[color:var(--tour-text-strong)]">
              <CreditCard className="h-4 w-4 text-brand-neon" />
              Paga en línea
            </div>
            <p className="mb-4 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
              {usesEmbeddedI365Widget
                ? "Ingresa el correo del participante para asociar el pago y abrir el widget seguro de i365."
                : `Reserva cupos para ${selectedSession.shortLabel} en ${selectedSession.venue}. Para equipos validamos el total en servidor usando el plan base de i365 antes de abrir el portal.`}
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="correo para asociar el pago"
                autoComplete="email"
                className="h-12 w-full rounded-lg border border-[color:var(--tour-border-standard)] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-cyan dark:bg-[#071225] dark:text-white"
              />
              <Button
                type="button"
                onClick={handleSecurePayment}
                disabled={paymentMode !== null || !canPaySelectedSession}
                className="rounded-full bg-brand-neon px-7 font-black text-black hover:bg-brand-neon/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentMode === "checkout" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {paymentMode === "checkout" ? "Abriendo..." : "Pagar ahora"}
              </Button>
            </div>
            {paymentMessage ? (
              <p className="mt-3 text-sm font-bold text-[color:var(--tour-text-default)] dark:text-white/75">
                {paymentMessage}
              </p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button type="button" variant="outline" onClick={handleDownloadQuote} className="tour-secondary-button rounded-full">
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleEmailQuote}
              disabled={isSendingQuote}
              className="tour-secondary-button rounded-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {isSendingQuote ? "Enviando..." : "Enviar cotización"}
            </Button>
            <Button asChild variant="outline" className="tour-secondary-button rounded-full">
              <a href={MAILTO_URL}>
                <Mail className="h-4 w-4" />
                Factura
              </a>
            </Button>
            <Button asChild variant="outline" className="tour-secondary-button rounded-full">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Ayuda
              </a>
            </Button>
          </div>
          {sentMessage ? (
            <p className="mt-3 text-sm font-bold text-[color:var(--tour-text-default)] dark:text-white/70">
              {sentMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function BootcampIA() {
  useEffect(() => {
    document.title = "Bootcamp IA Gira Colombia 2026 | Ingeniería 365";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="tour-ambient-shell relative min-h-screen overflow-x-hidden text-slate-900 dark:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="tour-ambient-base absolute inset-0" />
        <div className="tour-ambient-vignette absolute inset-0" />
      </div>

      <Header />

      <main className="relative z-10 pt-[72px]">
        <section className="relative isolate min-h-[calc(100dvh-72px)] overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
          <img
            src={infinitePrism}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-22 mix-blend-luminosity dark:opacity-34"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.86)_45%,rgba(248,250,252,0.98))] dark:bg-[linear-gradient(180deg,rgba(2,5,13,0.76),rgba(2,5,13,0.9)_48%,rgba(2,5,13,0.98))]" />

          <div className="relative mx-auto grid min-h-[calc(100dvh-160px)] max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Link
                to="/"
                className="mb-8 inline-flex items-center gap-2 text-sm font-black text-[color:var(--tour-text-default)] transition-colors hover:text-brand-neon"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Crea Academy
              </Link>
              <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-brand-neon/25 bg-brand-neon/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#0d8b5c] dark:text-brand-neon">
                <span>Gira Colombia 2026</span>
                <span className="h-1 w-1 rounded-full bg-current" />
                <span>1 día intensivo</span>
              </div>
              <h1 className="max-w-5xl font-display text-[clamp(2.8rem,8vw,7.6rem)] font-black leading-[0.94] tracking-tight text-[color:var(--tour-text-strong)]">
                Bootcamp IA para equipos que quieren implementar, ciudad por ciudad.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[color:var(--tour-text-default)] dark:text-white/72">
                De mayo a julio recorremos Colombia con una experiencia presencial para aprender IA aplicada, construir soluciones reales y salir con un prototipo que el equipo puede seguir mejorando.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="xl"
                  className="rounded-full bg-brand-neon px-7 text-base font-black text-black hover:bg-brand-neon/90"
                >
                  <a href="#cotizador">
                    Ver fechas y pagar
                    <CreditCard className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="tour-secondary-button rounded-full px-7 text-base font-black"
                >
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] p-5 shadow-[var(--tour-shadow-elevated)] backdrop-blur-xl">
              <div className="grid gap-3 sm:grid-cols-2">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-[color:var(--tour-border-subtle)] bg-[var(--tour-surface-soft)] p-5"
                  >
                    <p className="font-display text-4xl font-black text-[color:var(--tour-text-strong)]">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-brand-cyan/25 bg-brand-cyan/10 p-5">
                <div className="flex items-center gap-3 text-brand-cyan">
                  <MapPin className="h-5 w-5" />
                  <p className="font-display text-lg font-black">Medellín · Bogotá · Cali · Barranquilla · Cartagena · Bucaramanga</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/72">
                  Seis paradas confirmadas con pago por ciudad. Medellín tiene auditorio cerrado y las demás sedes se publicarán en cuanto quede definida la dirección.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TourRouteSection />

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="El problema"
              title="El reto no es conocer herramientas. Es convertirlas en trabajo real."
              description="La formación está diseñada para que personas no técnicas puedan automatizar, prototipar y tomar mejores decisiones con IA desde el primer día."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {PROBLEMS.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        <section id="metodologia" className="border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] px-4 py-16 dark:border-white/10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Metodología"
              title="Antes, durante y después del Bootcamp."
              description="La jornada no vive aislada. Se prepara con foco, se ejecuta con práctica y continúa con recursos para sostener la adopción."
            />
            <div className="grid overflow-hidden rounded-lg border border-[color:var(--tour-border-standard)] md:grid-cols-3">
              {PHASES.map((phase, index) => (
                <article
                  key={phase.label}
                  className={cn(
                    "bg-[var(--tour-panel-gradient)] p-7",
                    index > 0 && "border-t border-[color:var(--tour-border-standard)] md:border-l md:border-t-0",
                  )}
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-cyan">
                    {phase.label}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-black text-[color:var(--tour-text-strong)]">
                    {phase.title}
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {phase.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/72">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-brand-neon" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="modulos" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Módulos"
              title="Cinco módulos, un MVP y cero relleno."
              description="Cada bloque está conectado con una habilidad práctica que el equipo puede aplicar al salir de la sala."
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {MODULES.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] px-4 py-16 dark:border-white/10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Agenda"
              title="Un día diseñado para transformar."
              description="Cada momento tiene un propósito: aprender lo necesario, construir con acompañamiento y cerrar con una solución demostrable."
            />
            <div className="grid gap-3 lg:grid-cols-6">
              {AGENDA.map((step) => (
                <article
                  key={step.time}
                  className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-5"
                >
                  <p className="text-sm font-black text-brand-cyan">{step.time}</p>
                  <h3 className="mt-3 font-display text-lg font-black text-[color:var(--tour-text-strong)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="precios" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow="Inversión"
              title={`Precio actual: ${formatCurrency(PRICE_PER_PERSON)} COP por cupo.`}
              description={`Desde ${TEAM_MIN_PEOPLE} participantes aplicamos ${Math.round(TEAM_DISCOUNT * 100)}% de descuento automático: ${formatCurrency(TEAM_PRICE_PER_PERSON)} COP por persona. El cotizador valida el precio final del plan de cada ciudad antes del pago.`}
              centered
            />
            <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
              <article className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-7 shadow-[var(--tour-shadow-soft)]">
                <p className="inline-flex rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-brand-cyan">
                  Cupo individual
                </p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display text-5xl font-black text-[color:var(--tour-text-strong)]">
                    {formatCurrency(PRICE_PER_PERSON)}
                  </span>
                  <span className="pb-2 text-sm font-bold text-[color:var(--tour-text-muted)]">COP</span>
                </div>
                <p className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">
                  valor vigente por participante
                </p>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
                  {["Pago directo por ciudad", "Bootcamp presencial de 8:00 AM a 6:00 PM", "Material, comunidad y certificado incluidos"].map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-brand-neon" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-7 w-full rounded-full bg-brand-neon font-black text-black hover:bg-brand-neon/90">
                  <a href="#cotizador">
                    Elegir ciudad y pagar
                    <CreditCard className="h-4 w-4" />
                  </a>
                </Button>
              </article>

              <article className="rounded-lg border border-brand-neon/45 bg-brand-neon/10 p-7 shadow-[0_24px_60px_rgba(4,255,141,0.10)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex rounded-full border border-brand-neon/25 bg-brand-neon/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0d8b5c] dark:text-brand-neon">
                    Equipo empresa
                  </p>
                  <span className="rounded-full bg-[#071225] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-brand-neon">
                    Ahorras {formatCurrency(TEAM_SAVINGS)}
                  </span>
                </div>
                <div className="mt-5">
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">
                    Desde {TEAM_MIN_PEOPLE} personas
                  </p>
                  <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
                    <span className="font-display text-5xl font-black text-[color:var(--tour-text-strong)]">
                      {formatCurrency(TEAM_PRICE_PER_PERSON)}
                    </span>
                    <span className="pb-2 text-sm font-bold text-[color:var(--tour-text-muted)]">COP/persona</span>
                  </div>
                </div>
                <div className="mt-5 border-y border-brand-neon/25 py-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[color:var(--tour-text-muted)]">Antes por {TEAM_MIN_PEOPLE} cupos</span>
                    <span className="font-bold text-[color:var(--tour-text-muted)] line-through">
                      {formatCurrency(TEAM_BASE_TOTAL)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="font-black text-[color:var(--tour-text-strong)]">Total actual equipo</span>
                    <span className="font-display text-2xl font-black text-[#0d8b5c] dark:text-brand-neon">
                      {formatCurrency(TEAM_TOTAL)}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
                  Incluye diagnóstico previo, descuento grupal, factura electrónica y reserva de cupos en la ciudad seleccionada.
                </p>
                <Button asChild className="mt-7 w-full rounded-full bg-brand-neon font-black text-black hover:bg-brand-neon/90">
                  <a href="#cotizador">
                    Cotizar equipo
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </article>
            </div>
            <div className="mx-auto mt-4 grid max-w-6xl gap-3 rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] p-4 text-sm font-bold text-[color:var(--tour-text-default)] shadow-[var(--tour-shadow-soft)] md:grid-cols-3">
              <p className="flex gap-3">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-brand-neon" />
                El pago individual usa el plan exacto de la ciudad elegida.
              </p>
              <p className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-neon" />
                El descuento de equipo se aplica automáticamente desde {TEAM_MIN_PEOPLE} participantes.
              </p>
              <p className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
                Las fechas están confirmadas; algunas sedes siguen en cierre de dirección.
              </p>
            </div>
          </div>
        </section>

        <CorporateQuoter />

        <section className="border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] px-4 py-16 dark:border-white/10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <SectionHeader
              eyebrow="Recursos"
              title="Todo lo necesario para seguir avanzando."
              description="El Bootcamp deja materiales, acceso y soporte para que la adopción no se apague al día siguiente."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {INCLUDED.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-4 text-sm font-bold text-[color:var(--tour-text-default)] dark:text-white/72"
                >
                  <BadgeCheck className="h-5 w-5 shrink-0 text-brand-neon" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <ImpactedCompaniesSection compact className="border-t-0" />

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-lg border border-brand-cyan/25 bg-[linear-gradient(135deg,rgba(0,210,255,0.14),rgba(4,255,141,0.10),rgba(123,44,191,0.12))] p-8 text-center shadow-[var(--tour-shadow-elevated)] sm:p-12">
            <FileText className="mx-auto h-10 w-10 text-brand-cyan" />
            <h2 className="mt-5 font-display text-[clamp(2rem,5vw,4rem)] font-black leading-[1.02] text-[color:var(--tour-text-strong)]">
              Este no es un curso. Es una transformación operativa.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[color:var(--tour-text-default)] dark:text-white/72">
              Agenda una conversación y armamos la cohorte ideal para tu equipo, tu ciudad y tus retos de negocio.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" className="rounded-full bg-brand-neon px-7 font-black text-black hover:bg-brand-neon/90">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  Hablar por WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="xl" variant="outline" className="tour-secondary-button rounded-full px-7 font-black">
                <a href={MAILTO_URL}>
                  Solicitar propuesta
                  <CalendarDays className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppWidget phoneNumber="573106014893" message="Hola, vengo del sitio web de Crea Academy y quiero información del Bootcamp de IA." />
    </div>
  );
}
