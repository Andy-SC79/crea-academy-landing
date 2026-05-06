import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Building2,
  CalendarDays,
  Calculator,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  CreditCard,
  Download,
  FileText,
  Heart,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Presentation,
  Rocket,
  Send,
  Sparkles,
  Sprout,
  Target,
  UserRound,
  Workflow,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import infinitePrism from "@/assets/infinite-prism-dark.webp";
import resultAutomation from "@/assets/results/automation.png";
import resultProductivity from "@/assets/results/productivity.png";
import resultSolution from "@/assets/results/solution.png";
import resultOpportunities from "@/assets/results/opportunities.png";
import resultScaling from "@/assets/results/scaling.png";
import ImpactedCompaniesSection from "@/components/landing/ImpactedCompaniesSection";
import WhatsAppWidget from "@/components/landing/WhatsAppButton";
import Footer from "@/components/layout/Footer";
import Header from "@/components/landing/tour/Header";
import { Button } from "@/components/ui/button";
import { openI365PaymentWidget, type I365WidgetConfig } from "@/lib/i365-widget";
import { cn } from "@/lib/utils";
import SceneTestimonies from "@/components/landing/tour/scenes/SceneTestimonies";
import { SceneHeadline, type SceneHeadlinePart, parseHeadline } from "@/components/landing/tour/scenes/shared";
import "@/styles/tour-ambient.css";

const WHATSAPP_URL =
  "https://wa.me/573106014893?text=Hola%2C%20quiero%20informaci%C3%B3n%20del%20Bootcamp%20de%20IA";
const MAILTO_URL =
  "mailto:jeisonperez@ingenieria365.com?cc=eliza@ingenieria365.com,info@ingenieria365.com&subject=Cotizar%20Bootcamp%20de%20IA";
const QUOTE_EMAIL_ENDPOINT = "/api/send-quote";
const BOOTCAMP_PRICING_ENDPOINT = "/api/bootcamp-pricing";
const BOOTCAMP_PAYMENT_ENDPOINT = "/api/create-bootcamp-payment";
const I365_PAYMENT_APP_ID =
  (import.meta.env.VITE_I365_PAYMENT_APP_ID as string | undefined) ||
  "298f0727-6901-4d98-88e0-785576041b20";
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
const BOOTCAMP_CURRENCY = "COP";
const BOOTCAMP_TAX_LABEL = "IVA incluido";
const PRICE_PER_PERSON = 1_308_600;
const EARLY_PAYMENT_DISCOUNT = 0.3;
const TEAM_DISCOUNT = 0.1;
const TEAM_MIN_PEOPLE = 5;
const roundMoney = (value: number) => Number(value.toFixed(2));
const EARLY_PAYMENT_PRICE_PER_PERSON = roundMoney(PRICE_PER_PERSON * (1 - EARLY_PAYMENT_DISCOUNT));
const TEAM_PRICE_PER_PERSON = roundMoney(EARLY_PAYMENT_PRICE_PER_PERSON * (1 - TEAM_DISCOUNT));
const TEAM_BASE_TOTAL = roundMoney(PRICE_PER_PERSON * TEAM_MIN_PEOPLE);
const TEAM_TOTAL = roundMoney(TEAM_PRICE_PER_PERSON * TEAM_MIN_PEOPLE);
const TEAM_SAVINGS = roundMoney(TEAM_BASE_TOTAL - TEAM_TOTAL);
const BOOTCAMP_SESSION_SELECT_EVENT = "bootcamp-session-select";
const BOOTCAMP_ROUTE_VIDEO_URL = "https://www.youtube-nocookie.com/embed/fa6WnQCYJVY?rel=0&modestbranding=1&playsinline=1";
const BOOTCAMP_SESSIONS = [
  {
    id: "medellin-2026-06-05",
    status: "available",
    planId: "79d33e26-5076-4057-8eb0-326c2b19a937",
    shortLabel: "05 de junio de 2026",
    dateLabel: "Viernes 05 de junio de 2026",
    timeLabel: "8:00 AM a 4:00 PM",
    city: "Medellín",
    venue: "Auditorio del Centro Comercial San Diego",
    address: "Centro Comercial San Diego, Medellín",
    venueConfirmed: true,
    selectLabel: "05 de junio de 2026 · Medellín · Centro Comercial San Diego",
    map: { x: 81.3, y: 139.8, labelX: -10, labelY: 4, anchor: "end" },
  },
  {
    id: "bogota-2026-07-24",
    status: "available",
    planId: "810ee2d2-720f-44b3-8377-4dfa2f689b1b",
    shortLabel: "24 de julio de 2026",
    dateLabel: "Viernes 24 de julio de 2026",
    timeLabel: "8:00 AM a 4:00 PM",
    city: "Bogotá",
    venue: "Sede por confirmar",
    address: "Dirección por confirmar",
    venueConfirmed: false,
    selectLabel: "24 de julio de 2026 · Bogotá · sede por confirmar",
    map: { x: 108.9, y: 168.1, labelX: 10, labelY: 2, anchor: "start" },
  },
  {
    id: "cali-2026-08-28",
    status: "available",
    planId: "baa0c7c8-b226-4f55-92e6-37aedb4c598b",
    shortLabel: "28 de agosto de 2026",
    dateLabel: "Viernes 28 de agosto de 2026",
    timeLabel: "8:00 AM a 4:00 PM",
    city: "Cali",
    venue: "Sede por confirmar",
    address: "Dirección por confirmar",
    venueConfirmed: false,
    selectLabel: "28 de agosto de 2026 · Cali · sede por confirmar",
    map: { x: 63.5, y: 191.4, labelX: -10, labelY: 8, anchor: "end" },
  },
  {
    id: "barranquilla-2026-09-25",
    status: "available",
    planId: "252ac806-8779-4cbf-9f5b-07f493e8e9ef",
    shortLabel: "25 de septiembre de 2026",
    dateLabel: "Viernes 25 de septiembre de 2026",
    timeLabel: "8:00 AM a 4:00 PM",
    city: "Barranquilla",
    venue: "Sede por confirmar",
    address: "Dirección por confirmar",
    venueConfirmed: false,
    selectLabel: "25 de septiembre de 2026 · Barranquilla · sede por confirmar",
    map: { x: 95.4, y: 52.5, labelX: 10, labelY: -8, anchor: "start" },
  },
  {
    id: "cartagena-2026-10-23",
    status: "available",
    planId: "d5ba71a2-b12d-4434-b67d-5b6cd28f4784",
    shortLabel: "23 de octubre de 2026",
    dateLabel: "Viernes 23 de octubre de 2026",
    timeLabel: "8:00 AM a 4:00 PM",
    city: "Cartagena",
    venue: "Sede por confirmar",
    address: "Dirección por confirmar",
    venueConfirmed: false,
    selectLabel: "23 de octubre de 2026 · Cartagena · sede por confirmar",
    map: { x: 82.9, y: 63.1, labelX: -10, labelY: 3, anchor: "end" },
  },
  {
    id: "bucaramanga-2026-11-27",
    status: "available",
    planId: "2d9990b7-b1d3-4997-b6f4-98a4cb8e460e",
    shortLabel: "27 de noviembre de 2026",
    dateLabel: "Viernes 27 de noviembre de 2026",
    timeLabel: "8:00 AM a 4:00 PM",
    city: "Bucaramanga",
    venue: "Sede por confirmar",
    address: "Dirección por confirmar",
    venueConfirmed: false,
    selectLabel: "27 de noviembre de 2026 · Bucaramanga · sede por confirmar",
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

type QuoteFlow = "person" | "company" | "inhouse";

type QuoteHtmlOptions = {
  form: QuoteForm;
  flow: QuoteFlow;
  people: number;
  pricePerPerson: number;
  subtotal: number;
  discountValue: number;
  total: number;
  totalCop?: number | null;
  exchangeRate?: number | null;
  exchangeRateDate?: string | null;
  autoPrint?: boolean;
};

type PaymentMode = "checkout" | null;

type BootcampQuote = {
  people: number;
  sessionId?: string;
  currency?: string;
  paymentCurrency?: string;
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
  exchangeRate?: number | null;
  exchangeRatePair?: string | null;
  exchangeRateSource?: string | null;
  exchangeRateDate?: string | null;
  exchangeRateValidTo?: string | null;
  copCurrency?: string | null;
  baseSubtotalCop?: number | null;
  subtotalCop?: number | null;
  totalDiscountCop?: number | null;
  totalCop?: number | null;
  amountInCents: number;
};

type BootcampPricingResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  quote?: BootcampQuote;
};

type BootcampPaymentResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  details?: unknown;
  quote?: BootcampQuote;
  widget_config?: I365WidgetConfig;
};

function getBootcampSession(sessionId: string): BootcampSession {
  return BOOTCAMP_SESSIONS.find((session) => session.id === sessionId) ?? ACTIVE_BOOTCAMP_SESSION;
}

const STATS = [
  { value: "60+", label: "Eventos realizados" },
  { value: "6.000+", label: "Personas formadas" },
  { value: "99,6%", label: "Ve aplicación real" },
  { value: "90,0%", label: "Sale seguro para replicar" },
];

const IMPACT_RESULTS = [
  {
    value: "99,6%",
    label: "Aplicabilidad",
    description: "Personas que conectan lo aprendido con procesos reales de su empresa o trabajo.",
  },
  {
    value: "90,0%",
    label: "Confianza",
    description: "Participantes seguros o muy seguros de replicar lo aprendido después del Bootcamp.",
  },
  {
    value: "408 h",
    label: "Tiempo liberable",
    description: "Estimación semanal conservadora reportada en la submuestra de impacto profundo 2026.",
  },
  {
    value: "9,49/10",
    label: "Recomendación",
    description: "Promedio de recomendación en la medición consolidada de experiencia.",
  },
];



const RESULT_ITEMS = [
  { id: "01", text: "Automatizar tareas reales desde el día 1", image: resultAutomation },
  { id: "02", text: "Multiplicar productividad desde la primera hora", image: resultProductivity },
  { id: "03", text: "Construir una solución funcional con IA", image: resultSolution },
  { id: "04", text: "Identificar y priorizar oportunidades de automatización", image: resultOpportunities },
  { id: "05", text: "Definir cómo escalar IA en toda la organización", image: resultScaling },
];

const WHY_EXECUTION_FEATURES: Feature[] = [
  {
    icon: Target,
    title: "Tu reto, desde el día 1",
    description: "Trabajamos casos de estudio. Trabajamos el problema real de tu organización y todo el bootcamp gira en torno a resolverlo con IA.",
  },
  {
    icon: Zap,
    title: "Sales con algo funcionando",
    description: "Una solución funcional real construida y validada el mismo día. No solo conocimiento: una solución que puedes empezar a escalar mañana.",
  },
  {
    icon: Wrench,
    title: "En tu ecosistema, no en uno ajeno",
    description: "Para resolver los retos priorizamos tus herramientas corporativas.",
  },
  {
    icon: Sprout,
    title: "Replicadores del conocimiento",
    description: "Los participantes se convierten en ciudadanos desarrolladores que replican y escalan soluciones sin depender de externos.",
  },
  {
    icon: BarChart3,
    title: "Impacto medido",
    description: "Evaluamos antes y después con métricas reales de productividad. Hay evidencia tangible del progreso individual y colectivo.",
  },
  {
    icon: Heart,
    title: "Acompañamiento post-Bootcamp",
    description: "2 horas de seguimiento virtual incluidas 1-2 semanas después para resolver dudas y ajustar el plan de implementación.",
  },
];

const BOOTCAMP_DETAILED_MODULES = [
  {
    id: "01",
    time: "45 min",
    title: "Panorama de IA 2026",
    description: "Qué es real, qué es ruido y cómo elegir la herramienta correcta. Límites reales de la IA, gobernanza y el rol humano como decisor final.",
  },
  {
    id: "02",
    time: "60 min",
    title: "Prompts estratégicos",
    description: "Instrucciones que multiplican resultados. Estructura por rol, plantillas reutilizables y aplicación inmediata al trabajo real de cada participante.",
  },
  {
    id: "03",
    time: "60 min",
    title: "Herramientas usadas en tu entorno corporativo",
    description: "Aplicación práctica de IA dentro de los flujos reales de trabajo del equipo. Los participantes aprenden a intervenir procesos internos mediante asistentes inteligentes, automatización de tareas repetitivas, análisis de información y generación acelerada de contenido operativo y ejecutivo.",
  },
  {
    id: "04",
    time: "45 min",
    title: "Contenido audiovisual",
    description: "Uso práctico de IA para crear, transformar y acelerar contenido audiovisual dentro de los procesos de la organización.",
  },
  {
    id: "05",
    time: "60 min",
    title: "Ruta práctica a elegir — diferencial exclusivo",
    description: "El equipo elige el enfoque más útil para su contexto y nivel de madurez digital.",
    options: [
      { label: "Agentes de IA", desc: "Tu primer empleado digital. Tareas autónomas 24/7." },
      { label: "Vibe Coding", desc: "Apps, dashboards y flujos funcionales sin saber programar. No-code con IA." },
    ],
  },
  {
    id: "06",
    time: "80 min",
    title: "Construcción del reto real — en vivo",
    description: "Los equipos trabajan sobre un desafío real de la organización y construyen una solución funcional durante el bootcamp.Cada grupo es acompañado por expertos durante todo el proceso de diseño, validación y construcción del MVP.",
  },
  {
    id: "07",
    time: "10 min",
    title: "Presentación de soluciones y retroalimentación experta",
    description: "Cada equipo presenta su solución mínima viable frente a los facilitadores y recibe retroalimentación estratégica, técnica y operativa para su escalamiento dentro de la organización.",
  },
  {
    id: "+",
    time: "2h virtual",
    title: "Seguimiento virtual post-bootcamp",
    description: "Revisión de avances y resolución de dudas reales 1–2 semanas después. Incluido, sin costo adicional.",
    isBonus: true,
  },
];



const DELIVERABLES = [
  "Solución funcional construido durante el bootcamp",
  "Plantillas, prompts y guías listas para usar",
  "Certificación digital verificable",
  "Grabación del bootcamp",
  "Acceso a CREA Academy con licencia Creadores por un mes",
  "Diagnóstico de impacto antes/después",
  "Guía rápida de uso de herramientas de IA",
  "Retroalimentación experta de soluciones presentadas",
  "Política de uso de IA adaptada a la empresa",
];

const FORMAT_FEATURES = [
  "1 día intensivo — 8 horas presenciales en vivo",
  "2 horas virtuales de seguimiento (1–2 semanas después)",
  "7 módulos prácticos + Hackathon de cierre",
  "Priorización de entornos corporativos",
  "Cuando el bootcamp es contratado para una sola organización, realizamos una sesión previa de alineación para asegurar una experiencia totalmente personalizada y enfocada en su realidad.",
];

const FORM_LABEL_CLASS =
  "text-[var(--text-xs)] font-black uppercase leading-5 tracking-[0.08em] text-[color:var(--tour-text-default)]";
const FORM_FIELD_CLASS = "tour-form-field h-12 w-full rounded-lg px-4 text-base font-semibold outline-none";

function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
  titleClassName?: string;
}) {
  const parts = parseHeadline(title);

  return (
    <div className={cn("mb-10 max-w-3xl", centered && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="mb-3 inline-flex rounded-full border border-brand-neon/25 bg-brand-neon/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#0d8b5c] dark:text-brand-neon">
          {eyebrow}
        </p>
      )}
      <SceneHeadline
        as="h2"
        variant="section"
        typewriter={false}
        parts={parts}
        className={cn(
          "max-w-none",
          "font-display text-[var(--text-h1)] font-black leading-[1.02] tracking-tight text-[color:var(--tour-text-strong)]",
          centered && "justify-center",
          titleClassName
        )}
      />
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
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-2xl border border-[color:var(--tour-border-standard)] bg-white/70 dark:bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:border-brand-neon/40 hover:shadow-[0_20px_50px_rgba(4,255,141,0.12)]"
    >
      <div className="absolute top-0 left-0 h-[3px] w-full scale-x-0 bg-gradient-to-r from-brand-neon via-brand-cyan to-purple-500 transition-transform duration-500 origin-left group-hover:scale-x-100" />

      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan transition-transform group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-xl font-black text-[color:var(--tour-text-strong)]">
        {feature.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
        {feature.description}
      </p>
    </motion.article>
  );
}

function scrollToBootcampSession(sessionId: string) {
  window.dispatchEvent(
    new CustomEvent(BOOTCAMP_SESSION_SELECT_EVENT, {
      detail: { sessionId },
    }),
  );
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
              title="La {ventaja} ahora está en quién [aprende a implementar] {IA} primero."
              description="Bootcamp práctico donde equipos y profesionales construyen soluciones reales sobre retos de su organización.
Ahora llevaremos esta experiencia por diferentes ciudades de Colombia para acelerar la adopción real de IA en empresas y equipos de todo el país."
            />

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

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {BOOTCAMP_SESSIONS.map((session, i) => (
            <motion.div
              key={session.id}
              initial="initial"
              whileHover="hover"
              whileInView="visible"
              viewport={{ once: true }}
              onClick={() => scrollToBootcampSession(session.id)}
              className="relative group overflow-hidden rounded-[24px] p-[2px] transition-all cursor-pointer"
            >
              {/* Animated Border Wrapper - Only visible on hover */}
              <motion.div
                variants={{
                  initial: { opacity: 0, scale: 1 },
                  hover: { opacity: 1, scale: 1.02 }
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-0"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,#00d2ff,#9d00ff,#ff0055,#00d2ff)]"
                />
              </motion.div>

              {/* Entrance Animation Wrapper */}
              <motion.div
                variants={{
                  initial: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ delay: i * 0.1 }}
                className="relative h-full"
              >
                {/* Card Content */}
                <article className="relative flex h-full flex-col rounded-[22px] bg-white/95 p-6 backdrop-blur-xl dark:bg-slate-950/95 z-10 border border-transparent group-hover:border-transparent transition-colors shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-3xl font-black tracking-tight text-[color:var(--tour-text-strong)] dark:text-white">
                      {session.city}
                    </h3>
                    <div className="rounded-full bg-brand-neon/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-neon">
                      Parada {i + 1}
                    </div>
                  </div>
                  <div className="mt-6 flex-grow space-y-4 text-sm leading-relaxed text-[color:var(--tour-text-default)] dark:text-white/70">
                    <p className="flex gap-4">
                      <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand-cyan" />
                      <span>
                        <strong className="block text-base font-black text-[color:var(--tour-text-strong)] dark:text-white">
                          {session.shortLabel}
                        </strong>
                        <span className="text-xs font-bold uppercase tracking-wider">{session.timeLabel}</span>
                      </span>
                    </p>
                    <p className="flex gap-4">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-neon" />
                      <span>
                        <strong className="block text-base font-black text-[color:var(--tour-text-strong)] dark:text-white">
                          {session.venue}
                        </strong>
                        <span className="text-xs font-medium leading-relaxed">{session.address}</span>
                      </span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => scrollToBootcampSession(session.id)}
                    className="mt-8 w-full rounded-full bg-brand-neon py-6 text-sm font-black text-black hover:bg-brand-neon/90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-neon/20"
                  >
                    Reservar esta ciudad
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </article>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative w-full overflow-hidden rounded-[28px] p-[2px] shadow-[0_20px_60px_-15px_rgba(4,255,141,0.2)]"
          >
            {/* Animated Multicolor Border */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,#04ff8d,#00d2ff,#7b2cbf,#04ff8d)]"
            />
            
            {/* Inner Content Container */}
            <div className="relative z-10 flex w-full flex-row items-center justify-center gap-6 overflow-hidden rounded-[26px] bg-white px-8 py-10 dark:bg-white sm:gap-10 sm:px-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(4,255,141,0.1),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(0,210,255,0.1),transparent_40%)]" />
              
              <div className="relative z-20 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-neon/10 text-brand-neon shadow-[0_0_20px_rgba(4,255,141,0.25)] sm:h-16 sm:w-16">
                <Sparkles className="h-8 w-8 animate-pulse sm:h-10 sm:w-10" />
              </div>
              
              <p className="relative z-20 font-display text-lg font-black leading-tight text-[color:var(--tour-text-strong)] sm:text-2xl lg:text-3xl">
                Los <span className="bg-gradient-to-r from-brand-neon via-brand-cyan to-purple-500 bg-clip-text text-transparent">cupos son limitados</span> para garantizar una experiencia intensiva y personalizada.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-24 grid gap-5 rounded-lg border border-brand-cyan/25 bg-[linear-gradient(135deg,rgba(4,255,141,0.10),rgba(0,210,255,0.08),rgba(7,18,37,0.78))] p-5 shadow-[var(--tour-shadow-soft)] lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,1.08fr)] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-neon/25 bg-brand-neon/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0d8b5c] dark:text-brand-neon">
              <Sparkles className="h-3.5 w-3.5" />

            </div>
            <SceneHeadline
              as="h3"
              variant="section"
              typewriter={false}
              parts={parseHeadline("{Networking} estratégico y conexiones de [valor].")}
              className="mt-4 font-display text-[var(--text-h2)] font-black leading-tight text-[color:var(--tour-text-strong)]"
            />
            <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--tour-text-default)] dark:text-white/74">
              Durante todo el bootcamp se generan espacios de conexión entre participantes para compartir experiencias, mostrar proyectos, crear alianzas estratégicas y generar oportunidades reales de colaboración y negocio alrededor de IA y transformación digital.
            </p>
          </div>

          <div className="relative aspect-video w-full rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(4,255,141,0.34),rgba(0,210,255,0.24),rgba(157,0,255,0.24))] p-[1px] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="relative h-full w-full overflow-hidden rounded-[7px] bg-slate-950 shadow-[inset_0_0_28px_rgba(0,0,0,0.72)]">
              <iframe
                src={BOOTCAMP_ROUTE_VIDEO_URL}
                title="Mensaje Bootcamp IA Gira Colombia"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StudyImpactSection() {
  return (
    <section id="resultados-impacto" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Resultados reales"
              title="Van porque ya hay {evidencia de impacto}."
              description="El estudio consolidado de Ingeniería 365 muestra que el Bootcamp no se queda en inspiración: la gente entiende, aplica y sale con confianza para mover procesos reales."
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("gira-colombia");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                size="xl"
                className="rounded-full bg-brand-neon px-7 text-base font-black text-black hover:bg-brand-neon/90"
              >
                Elegir ciudad
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="tour-secondary-button rounded-full px-7 text-base font-black"
              >
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  Hablar con i365
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="mt-5 text-sm font-bold leading-7 text-[color:var(--tour-text-muted)] dark:text-white/75">
              Base del estudio: 1.656 respuestas válidas entre 2024-08-22 y 2026-04-29. Productividad y bienestar corresponden a la submuestra de impacto profundo 2026.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {IMPACT_RESULTS.map((result, i) => (
              <motion.article
                key={result.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group rounded-2xl border border-[color:var(--tour-border-standard)] bg-white/70 dark:bg-white/5 backdrop-blur-md p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:border-brand-neon/40 hover:shadow-[0_20px_50px_rgba(4,255,141,0.12)]"
              >
                <p className="font-display text-5xl font-black leading-none tracking-tight text-[color:var(--tour-text-strong)] transition-colors group-hover:text-brand-neon sm:text-6xl">
                  {result.value}
                </p>
                <h3 className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-brand-neon">
                  {result.label}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--tour-text-default)] dark:text-white/70">
                  {result.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatCurrency(value: number, currency = BOOTCAMP_CURRENCY) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const hasDecimals = Math.abs(safeValue % 1) > 0;
  const isCop = currency.toUpperCase() === "COP";
  const formatted = safeValue.toLocaleString(isCop ? "es-CO" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: isCop ? 0 : hasDecimals ? 2 : 0,
    maximumFractionDigits: isCop ? 0 : 2,
  });

  if (currency.toUpperCase() === "USD") return `${formatted} USD`;
  if (isCop) return `${formatted} COP`;
  return formatted;
}

function formatExchangeRate(value?: number | null) {
  if (!value || !Number.isFinite(value)) return null;

  return value.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTrmDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);

  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
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

const BOOTCAMP_PAYMENT_ERROR_MESSAGES: Record<string, string> = {
  BOOTCAMP_PLAN_APP_MISMATCH:
    "No pudimos abrir el pago porque esta fecha necesita un ajuste de configuración. No se hizo ningún cobro. Escríbenos por WhatsApp y te ayudamos a reservar el cupo.",
  BOOTCAMP_PLAN_LOOKUP_FAILED:
    "No pudimos validar el plan de pago en este momento. Intenta de nuevo en unos minutos o escríbenos por WhatsApp para reservar el cupo.",
};

function getBootcampPaymentErrorMessage(data: BootcampPaymentResponse | null) {
  if (data?.code && BOOTCAMP_PAYMENT_ERROR_MESSAGES[data.code]) {
    return BOOTCAMP_PAYMENT_ERROR_MESSAGES[data.code];
  }

  return data?.error || "No se pudo crear el pago seguro de i365.";
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
  const companyAnchor = form.nit || form.company || form.contactName || "cliente";

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
  const pricePerPerson = EARLY_PAYMENT_PRICE_PER_PERSON;
  const baseSubtotal = roundMoney(safePeople * basePricePerPerson);
  const subtotal = roundMoney(safePeople * pricePerPerson);
  const groupDiscountPercentage = safePeople >= TEAM_MIN_PEOPLE ? Math.round(TEAM_DISCOUNT * 100) : 0;
  const groupDiscountValue = groupDiscountPercentage > 0 ? roundMoney(subtotal * TEAM_DISCOUNT) : 0;
  const planDiscountValue = roundMoney(Math.max(baseSubtotal - subtotal, 0));
  const total = roundMoney(Math.max(subtotal - groupDiscountValue, 0));

  return {
    people: safePeople,
    sessionId: session.id,
    currency: BOOTCAMP_CURRENCY,
    paymentCurrency: BOOTCAMP_CURRENCY,
    copCurrency: "COP",
    planId: session.planId || null,
    planName: null,
    priceSource: "fallback",
    basePricePerPerson,
    pricePerPerson,
    baseSubtotal,
    subtotal,
    planDiscountPercentage: Math.round(EARLY_PAYMENT_DISCOUNT * 100),
    planDiscountValue,
    groupDiscountPercentage,
    groupDiscountValue,
    totalDiscountValue: roundMoney(planDiscountValue + groupDiscountValue),
    total,
    exchangeRate: null,
    exchangeRatePair: "USD/COP",
    exchangeRateSource: null,
    exchangeRateDate: null,
    exchangeRateValidTo: null,
    baseSubtotalCop: null,
    subtotalCop: null,
    totalDiscountCop: null,
    totalCop: null,
    amountInCents: Math.round(total * 100),
  };
}

function generateQuoteHtml({
  form,
  flow,
  people,
  pricePerPerson,
  subtotal,
  discountValue,
  total,
  totalCop,
  exchangeRate,
  exchangeRateDate,
  autoPrint = false,
}: QuoteHtmlOptions) {
  const date = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const ref = `I365-${Date.now().toString().slice(-6)}`;
  const isCompanyQuote = flow === "company";
  const clientName = escapeHtml(
    isCompanyQuote ? form.company || "Empresa" : form.contactName || "Participante",
  );
  const clientLabel = isCompanyQuote ? "Empresa" : "Persona natural";
  const documentLabel = isCompanyQuote ? "NIT" : "Documento";
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
  const trmLabel = formatExchangeRate(exchangeRate);
  const trmDateLabel = formatTrmDate(exchangeRateDate);
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
<title>Cotización Bootcamp de IA - ${clientName}</title>
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
        <p class="kicker">${isCompanyQuote ? "Cotización empresarial" : "Cotización persona natural"}</p>
        <h1>Bootcamp de Inteligencia Artificial para ${clientName}</h1>
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
          <div class="cell"><small>${clientLabel}</small><strong>${clientName}</strong></div>
          <div class="cell"><small>${documentLabel}</small><strong>${nit}</strong></div>
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
          ${totalCop
      ? `<div class="row total"><span>Equivalente estimado en COP</span><strong class="green">${formatCurrency(totalCop, "COP")}</strong></div>`
      : ""
    }
          ${trmLabel
      ? `<div class="row"><span>TRM aplicada</span><strong>${trmLabel} COP/USD${trmDateLabel ? ` - ${trmDateLabel}` : ""}</strong></div>`
      : ""
    }
        </div>
        <p class="note" style="margin-top:14px">
          Valores en pesos colombianos, ${BOOTCAMP_TAX_LABEL.toLowerCase()}. El pago se abre en el checkout seguro de i365.
        </p>
      </section>

      <section class="section">
        <p class="label">Pago seguro</p>
        <div class="payment-box">
          <div>
            <strong>Pago en línea con checkout seguro de i365</strong>
            <p>
              Para pagar esta cotización, ingresa al cotizador oficial y usa "Pagar ahora".
              El pago se realiza desde el checkout seguro de i365.
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
          Esta cotizaci&oacute;n tiene validez de 15 d&iacute;as calendario. Los valores est&aacute;n expresados en pesos colombianos
          e incluyen IVA. Pueden formalizarse mediante factura electr&oacute;nica, orden de compra o confirmaci&oacute;n comercial. La reserva
          de cupos se confirma con el acuerdo de pago aprobado por Ingenier&iacute;a 365.
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

function CorporateQuoter({
  initialSessionId,
  initialFlow = "person",
}: {
  initialSessionId?: string;
  initialFlow?: QuoteFlow;
}) {
  const isBajoPedidoMode = initialFlow === "inhouse";
  const initialSession = getBootcampSession(initialSessionId || ACTIVE_BOOTCAMP_SESSION.id);
  const [quoteFlow, setQuoteFlow] = useState<QuoteFlow>(isBajoPedidoMode ? "company" : initialFlow);
  const [form, setForm] = useState<QuoteForm>({
    company: "",
    nit: "",
    contactName: "",
    contactRole: "",
    phone: "",
    city: initialSession.city,
    sessionId: initialSession.id,
    people: "1",
    email: "",
  });

  useEffect(() => {
    if (initialSessionId && initialSessionId !== form.sessionId) {
      updateSession(initialSessionId);
    }
  }, [initialSessionId]);

  const [sentMessage, setSentMessage] = useState("");
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(null);
  const [pricing, setPricing] = useState<BootcampQuote>(() => buildLocalFallbackQuote(1));

  const people = Math.max(Number.parseInt(form.people, 10) || 0, 0);
  const missingForDiscount = Math.max(TEAM_MIN_PEOPLE - people, 0);
  const selectedSession = getBootcampSession(form.sessionId);
  const canPaySelectedSession = selectedSession.status === "available";
  const requiresQuoteForPayment = people > 1;
  const paymentIdentity = buildBootcampPaymentIdentity(form);
  const isCompanyFlow = quoteFlow === "company";
  const effectivePricing =
    pricing.people === people && pricing.sessionId === selectedSession.id
      ? pricing
      : buildLocalFallbackQuote(people, selectedSession);
  const pricePerPerson =
    effectivePricing.subtotalCop && people > 0
      ? roundMoney(effectivePricing.subtotalCop / people)
      : effectivePricing.pricePerPerson;
  const subtotal = effectivePricing.baseSubtotalCop ?? effectivePricing.baseSubtotal;
  const total = effectivePricing.totalCop ?? effectivePricing.total;
  const totalCop = null;
  const trmLabel = formatExchangeRate(effectivePricing.exchangeRate);
  const trmDateLabel = formatTrmDate(effectivePricing.exchangeRateDate);
  const totalDiscountValue = effectivePricing.totalDiscountCop ?? effectivePricing.totalDiscountValue;
  const hasDiscount = totalDiscountValue > 0;
  const hasPlanDiscount = effectivePricing.planDiscountPercentage > 0;
  const hasGroupDiscount = effectivePricing.groupDiscountPercentage > 0;

  const updateQuoteFlow = (nextFlow: QuoteFlow) => {
    if (nextFlow === quoteFlow) return;

    const nextPeople = nextFlow === "company" ? Math.max(people, 2) : 1;
    setQuoteFlow(nextFlow);
    setPaymentMessage("");
    setSentMessage("");
    setForm((current) => ({ ...current, people: String(nextPeople) }));
    setPricing(buildLocalFallbackQuote(nextPeople, selectedSession));
  };

  const updateForm = (field: keyof QuoteForm, value: string) => {
    if (field === "email" && paymentMessage) {
      setPaymentMessage("");
    }
    if (field === "people") {
      const nextPeople = Math.max(Number.parseInt(value, 10) || 0, 0);
      setPricing(buildLocalFallbackQuote(nextPeople, selectedSession));
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  const isInHouseFlow = isBajoPedidoMode;

  const updateSession = (sessionId: string) => {
    const nextSession = getBootcampSession(sessionId);
    setPaymentMessage("");
    setForm((current) => ({
      ...current,
      sessionId: nextSession.id,
      city: nextSession.city,
    }));
  };

  const openCompanyQuotePanel = () => {
    const nextPeople = Math.max(people, 2);
    setQuoteFlow("company");
    setPaymentMessage("");
    setSentMessage("");
    setForm((current) => ({ ...current, people: String(nextPeople) }));
    setPricing(buildLocalFallbackQuote(nextPeople, selectedSession));
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
          throw new Error(data?.error || "No se pudo sincronizar el precio en COP del Bootcamp.");
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

    if (requiresQuoteForPayment) {
      setPaymentMessage("Para varios cupos usamos cotización o factura, así evitamos cobrar un solo plan individual.");
      openCompanyQuotePanel();
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

  const validateQuoteEmail = () => {
    if (!form.email.trim()) {
      setSentMessage("Agrega un correo para enviar la cotización.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setSentMessage("Agrega un correo válido para enviar la cotización.");
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
        flow: quoteFlow,
        people,
        pricePerPerson,
        subtotal,
        discountValue: totalDiscountValue,
        total,
        totalCop,
        exchangeRate: effectivePricing.exchangeRate,
        exchangeRateDate: effectivePricing.exchangeRateDate,
        autoPrint: true,
      }),
    );
    quoteWindow.document.close();
  };

  const openMailFallback = () => {
    const clientName = isCompanyFlow ? form.company || "Empresa" : form.contactName || "Persona natural";
    const subject = encodeURIComponent(`Cotización Bootcamp de IA - ${clientName}`);
    const body = encodeURIComponent(
      `Hola, quiero recibir la cotización del Bootcamp de IA.\n\nTipo de cliente: ${isCompanyFlow ? "Empresa / persona jurídica" : "Persona natural"}\nEmpresa: ${form.company || "N/A"}\nNIT/documento: ${form.nit || "N/A"}\nContacto: ${form.contactName || "N/A"}\nRol: ${form.contactRole || "N/A"}\nFecha: ${selectedSession.dateLabel}\nLugar: ${selectedSession.venue}, ${selectedSession.city}\nCiudad de cotización: ${form.city}\nParticipantes: ${people}\nTotal comercial (${BOOTCAMP_TAX_LABEL}): ${formatCurrency(total)}\nNota: aplica 30% por pronto pago (aplica 5 días calendario antes del evento) y 10% adicional para equipos desde ${TEAM_MIN_PEOPLE} personas.`,
    );

    window.location.href = `mailto:${form.email}?cc=jeisonperez@ingenieria365.com,eliza@ingenieria365.com&subject=${subject}&body=${body}`;
  };

  const handleEmailQuote = async () => {
    if (!validateQuoteEmail()) return;

    setIsSendingQuote(true);
    setSentMessage("");

    const quoteHtml = generateQuoteHtml({
      form,
      flow: quoteFlow,
      people,
      pricePerPerson,
      subtotal,
      discountValue: totalDiscountValue,
      total,
      totalCop,
      exchangeRate: effectivePricing.exchangeRate,
      exchangeRateDate: effectivePricing.exchangeRateDate,
      autoPrint: false,
    });

    try {
      const response = await fetch(QUOTE_EMAIL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.email,
          quote: {
            clientType: quoteFlow,
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
            totalCop,
            exchangeRate: effectivePricing.exchangeRate,
            exchangeRateDate: effectivePricing.exchangeRateDate,
            currency: BOOTCAMP_CURRENCY,
            paymentCurrency: "COP",
            taxLabel: BOOTCAMP_TAX_LABEL,
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
    setPaymentMessage("Validando el plan en i365...");

    try {
      const response = await fetch(BOOTCAMP_PAYMENT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          people,
          sessionId: selectedSession.id,
          clientType: quoteFlow,
          company: form.company,
          nit: form.nit,
          contactName: form.contactName,
          contactRole: form.contactRole,
          phone: form.phone,
          city: form.city,
          userId: paymentIdentity.userId,
          companyId: paymentIdentity.companyId,
        }),
      });
      const data = await parsePaymentResponse(response);
      const widgetConfig = data?.widget_config;

      if (!response.ok || !widgetConfig) {
        throw new Error(getBootcampPaymentErrorMessage(data));
      }

      const validatedTotal = Number(data.quote?.totalCop ?? data.quote?.total);

      if (Number.isFinite(validatedTotal) && Math.round(validatedTotal * 100) !== Math.round(total * 100)) {
        throw new Error(
          `i365 validó ${formatCurrency(validatedTotal)} y la reserva espera ${formatCurrency(total)}. No abrí el pago para evitar un cobro inconsistente.`,
        );
      }

      setPaymentMessage("Plan validado. Abriendo el widget seguro de i365...");
      await openI365PaymentWidget({
        ...widgetConfig,
        appId: widgetConfig.appId || I365_PAYMENT_APP_ID,
        userId: widgetConfig.userId || paymentIdentity.userId,
        companyId: widgetConfig.companyId || paymentIdentity.companyId,
        userEmail: widgetConfig.userEmail || form.email.trim().toLowerCase(),
        userName:
          widgetConfig.userName ||
          form.contactName.trim() ||
          form.company.trim() ||
          "Cliente Bootcamp IA",
        planId: widgetConfig.planId || selectedSession.planId,
        onSuccess: (payload) => {
          const reference = payload.reference ? ` Referencia: ${payload.reference}.` : "";
          setPaymentMessage(`Pago confirmado por i365.${reference}`);
        },
        onError: (error) => {
          setPaymentMessage(error?.message || "No se pudo completar el pago en i365.");
        },
        onClose: () => {
          setPaymentMessage("Widget de pago cerrado.");
        },
      });
    } catch (error) {
      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "No se pudo abrir el pago seguro de i365.",
      );
    } finally {
      setPaymentMode(null);
    }
  };

  return (
    <section id="cotizador" className="px-4 py-8 dark:border-white/10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-5 shadow-[var(--tour-shadow-elevated)] sm:p-7">
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              aria-pressed={quoteFlow === "person"}
              onClick={() => updateQuoteFlow("person")}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                quoteFlow === "person"
                  ? "border-brand-neon/45 bg-brand-neon/10 text-[color:var(--tour-text-strong)]"
                  : "border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-soft)] text-[color:var(--tour-text-default)] hover:border-brand-neon/35",
              )}
            >
              <UserRound className="tour-readable-green mt-0.5 h-5 w-5 shrink-0" />
              <span>
                <span className="block text-sm font-black">Persona natural</span>
                <span className="mt-1 block text-xs leading-5 text-[color:var(--tour-text-muted)]">
                  Cupo individual, cotización simple o pago inmediato.
                </span>
              </span>
            </button>
            <button
              type="button"
              aria-pressed={quoteFlow === "company"}
              onClick={() => updateQuoteFlow("company")}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                quoteFlow === "company"
                  ? "border-brand-neon/45 bg-brand-neon/10 text-[color:var(--tour-text-strong)]"
                  : "border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-soft)] text-[color:var(--tour-text-default)] hover:border-brand-neon/35",
              )}
            >
              <Building2 className="tour-readable-cyan mt-0.5 h-5 w-5 shrink-0" />
              <span>
                <span className="block text-sm font-black">Empresa / persona jurídica</span>
                <span className="mt-1 block text-xs leading-5 text-[color:var(--tour-text-muted)]">
                  Cotiza varios participantes, factura y reserva de cupos.
                </span>
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {quoteFlow === "company" || quoteFlow === "inhouse" ? (
              <>
                <label className="block w-full space-y-2">
                  <span className={FORM_LABEL_CLASS}>Empresa</span>
                  <input
                    value={form.company}
                    onChange={(event) => updateForm("company", event.target.value)}
                    placeholder="Ej: Bancolombia S.A."
                    className={FORM_FIELD_CLASS}
                  />
                </label>
                <label className="block w-full space-y-2">
                  <span className={FORM_LABEL_CLASS}>NIT</span>
                  <input
                    value={form.nit}
                    onChange={(event) => updateForm("nit", event.target.value)}
                    placeholder="Ej: 890.903.938-8"
                    className={FORM_FIELD_CLASS}
                  />
                </label>
                <label className="block w-full space-y-2">
                  <span className={FORM_LABEL_CLASS}>Contacto</span>
                  <input
                    value={form.contactName}
                    onChange={(event) => updateForm("contactName", event.target.value)}
                    placeholder="Ej: Laura Gómez"
                    className={FORM_FIELD_CLASS}
                  />
                </label>
                <label className="block w-full space-y-2">
                  <span className={FORM_LABEL_CLASS}>Cargo</span>
                  <input
                    value={form.contactRole}
                    onChange={(event) => updateForm("contactRole", event.target.value)}
                    placeholder="Ej: Directora de talento"
                    className={FORM_FIELD_CLASS}
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block w-full space-y-2">
                  <span className={FORM_LABEL_CLASS}>Nombre completo</span>
                  <input
                    value={form.contactName}
                    onChange={(event) => updateForm("contactName", event.target.value)}
                    placeholder="Ej: Laura Gómez"
                    className={FORM_FIELD_CLASS}
                  />
                </label>
                <label className="block w-full space-y-2">
                  <span className={FORM_LABEL_CLASS}>Documento (opcional)</span>
                  <input
                    value={form.nit}
                    onChange={(event) => updateForm("nit", event.target.value)}
                    placeholder="Ej: CC 1.000.000.000"
                    className={FORM_FIELD_CLASS}
                  />
                </label>
              </>
            )}
            <div className="rounded-lg border border-brand-cyan/25 bg-brand-cyan/10 p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[color:var(--tour-text-strong)]">
                    Detalles de tu reserva
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[color:var(--tour-text-default)] dark:text-white/80">
                    Información de la parada seleccionada en {selectedSession.city}.
                  </p>
                </div>
                <select
                  value={form.sessionId}
                  onChange={(e) => updateSession(e.target.value)}
                  className="rounded-full border border-brand-cyan/25 bg-[var(--tour-surface-soft)] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[color:var(--tour-text-strong)] hover:bg-brand-cyan/10 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-brand-cyan/20 dark:bg-[#071225]"
                >
                  {BOOTCAMP_SESSIONS.map((session) => (
                    <option key={session.id} value={session.id} className="bg-[var(--tour-surface-elevated)] text-sm">
                      {session.city} · {session.shortLabel}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3">
                  <CalendarDays className="tour-readable-cyan mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="tour-readable-cyan text-xs font-black uppercase tracking-[0.14em]">
                      Fecha confirmada
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
                  <MapPin className="tour-readable-green mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="tour-readable-green text-xs font-black uppercase tracking-[0.14em]">
                      Sede del evento
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
              <p className="mt-4 rounded-lg border border-[color:var(--tour-border-subtle)] bg-[var(--tour-surface-soft)] px-3 py-2 text-xs font-bold text-[color:var(--tour-text-default)] dark:text-white/70">
                {selectedSession.venueConfirmed
                  ? "Sede confirmada. Puedes reservar cupo individual o cotizar varios participantes ahora."
                  : "Fecha confirmada y disponible para reserva. La sede final se compartirá al cerrar el venue."}
              </p>
            </div>
            <label className="block w-full space-y-2">
              <span className={FORM_LABEL_CLASS}>Ciudad de contacto / facturación</span>
              <select
                value={form.city}
                onChange={(event) => updateForm("city", event.target.value)}
                className={FORM_FIELD_CLASS}
              >
                {CITIES.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </label>
            <label className="block w-full space-y-2">
              <span className={FORM_LABEL_CLASS}>Número de personas</span>
              <input
                type="number"
                min="1"
                value={form.people}
                onChange={(event) => updateForm("people", event.target.value)}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                className={FORM_FIELD_CLASS}
              />
            </label>
            <label className="block w-full space-y-2">
              <span className={FORM_LABEL_CLASS}>WhatsApp (opcional)</span>
              <input
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
                placeholder="Ej: 300 000 0000"
                className={FORM_FIELD_CLASS}
              />
            </label>
            <label className="block w-full space-y-2">
              <span className={FORM_LABEL_CLASS}>Correo para confirmación de pago</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="correo@empresa.com"
                autoComplete="email"
                className={FORM_FIELD_CLASS}
              />
            </label>
          </div>

          <div className="tour-quote-summary mt-6 grid gap-3 rounded-lg p-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="tour-quote-summary-muted text-xs font-black uppercase tracking-[0.14em]">Personas</p>
              <p className="mt-2 font-display text-3xl font-black">{people}</p>
            </div>
            <div>
              <p className="tour-quote-summary-muted text-xs font-black uppercase tracking-[0.14em]">Precio lista</p>
              <p className={cn("mt-2 font-display text-2xl font-black", hasDiscount && "tour-quote-summary-muted line-through")}>
                {formatCurrency(subtotal)}
              </p>
            </div>
            <div>
              <p className="tour-quote-summary-muted text-xs font-black uppercase tracking-[0.14em]">Ahorro</p>
              <p className="tour-readable-green mt-2 font-display text-2xl font-black">
                {formatCurrency(totalDiscountValue)}
              </p>
            </div>
            <div>
              <p className="tour-quote-summary-muted text-xs font-black uppercase tracking-[0.14em]">Total COP</p>
              <p className="tour-readable-green mt-2 font-display text-2xl font-black">
                {formatCurrency(total)}
              </p>
            </div>
          </div>

          <p className="mt-3 rounded-lg border border-[color:var(--tour-border-subtle)] bg-[var(--tour-surface-soft)] px-4 py-3 text-xs font-bold text-[color:var(--tour-text-default)] dark:text-white/70">
            Precio y pago en COP con IVA incluido. {trmLabel ? `Referencia TRM ${trmLabel} COP/USD${trmDateLabel ? ` (${trmDateLabel})` : ""}.` : "Los valores se muestran en pesos colombianos."}
          </p>

          {hasDiscount ? (
            <p className="tour-readable-green mt-3 rounded-lg border border-brand-neon/25 bg-brand-neon/10 px-4 py-3 text-sm font-bold">
              {hasPlanDiscount && hasGroupDiscount
                ? `Descuento por pronto pago del ${effectivePricing.planDiscountPercentage}% (aplica 5 días calendario antes del evento) y descuento de equipo del ${effectivePricing.groupDiscountPercentage}% aplicados automáticamente. ${BOOTCAMP_TAX_LABEL}.`
                : hasPlanDiscount
                  ? `Descuento por pronto pago del ${effectivePricing.planDiscountPercentage}% (aplica 5 días calendario antes del evento) aplicado automáticamente. ${BOOTCAMP_TAX_LABEL}.`
                  : `Descuento de equipo del ${effectivePricing.groupDiscountPercentage}% aplicado automáticamente. ${BOOTCAMP_TAX_LABEL}.`}
            </p>
          ) : (
            <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-700 dark:text-amber-200">
              {hasPlanDiscount
                ? `Descuento por pronto pago del ${effectivePricing.planDiscountPercentage}% (aplica 5 días calendario antes del evento) activo. Agrega ${missingForDiscount} persona${missingForDiscount === 1 ? "" : "s"} más para activar el ${Math.round(TEAM_DISCOUNT * 100)}% de descuento de equipo. ${BOOTCAMP_TAX_LABEL}.`
                : `Agrega ${missingForDiscount} persona${missingForDiscount === 1 ? "" : "s"} más para activar el ${Math.round(TEAM_DISCOUNT * 100)}% de descuento de equipo. ${BOOTCAMP_TAX_LABEL}.`}
            </p>
          )}

          <div className="mt-6 grid gap-4">
            {isInHouseFlow && (
              <div className="order-2 rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-soft)] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-[color:var(--tour-text-strong)]">
                  <FileText className="tour-readable-cyan h-4 w-4" />
                  Quiero cotizar
                </div>
                <p className="mb-4 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
                  Abre este flujo solo si necesitas PDF, correo, factura u orden de compra.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
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
                    {isSendingQuote ? "Enviando..." : "Enviar"}
                  </Button>
                </div>
                {sentMessage ? (
                  <p className="mt-3 text-sm font-bold text-[color:var(--tour-text-default)] dark:text-white/70">
                    {sentMessage}
                  </p>
                ) : null}
              </div>
            )}

            {!isInHouseFlow && (
              <div className="order-1 rounded-lg border border-brand-neon/35 bg-brand-neon/10 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-[color:var(--tour-text-strong)]">
                  <CreditCard className="tour-readable-green h-4 w-4" />
                  Quiero pagar ahora
                </div>
                <p className="mb-4 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
                  {requiresQuoteForPayment
                    ? "Para varios cupos abrimos cotización o factura y el equipo comercial valida la reserva."
                    : "Validamos el plan en servidor y abrimos el widget seguro de i365 en pesos colombianos."}
                </p>
                <Button
                  type="button"
                  onClick={requiresQuoteForPayment ? openCompanyQuotePanel : handleSecurePayment}
                  disabled={paymentMode !== null || (!requiresQuoteForPayment && !canPaySelectedSession)}
                  className="w-full rounded-full bg-brand-neon px-7 font-black text-black hover:bg-brand-neon/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentMode === "checkout" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  {paymentMode === "checkout" ? "Abriendo..." : "Pagar"}
                </Button>
                {paymentMessage ? (
                  <p className="mt-3 text-sm font-bold text-[color:var(--tour-text-default)] dark:text-white/75">
                    {paymentMessage}
                  </p>
                ) : null}
              </div>
            )}
          </div>


        </div>
      </div>
    </section>
  );
}

function PricingAccordion({ benefits, title }: { benefits: string[]; title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mt-4 border-t border-[color:var(--tour-border-subtle)] pt-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-wider text-[color:var(--tour-text-muted)] hover:text-[color:var(--tour-text-strong)] transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="mt-3 space-y-2 pb-1 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
              {benefits.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-brand-neon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PricingCards({ onPagarClick }: { onPagarClick?: (flow: QuoteFlow) => void }) {
  return (
    <div className="mx-auto grid max-w-none gap-4 md:grid-cols-3">
      <article className="flex flex-col rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-7 shadow-[var(--tour-shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="tour-readable-cyan inline-flex rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
            Cupo individual
          </p>
          <span className="tour-readable-green rounded-full border border-brand-neon/25 bg-brand-neon/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em]">
            30% pronto pago (5 días antes)
          </span>
        </div>
        <p className="mt-5 text-sm font-bold text-[color:var(--tour-text-muted)]">
          Precio base: <span className="line-through">{formatCurrency(PRICE_PER_PERSON)}</span>
        </p>
        <div className="mt-4 flex items-end gap-1">
          <span className="font-display text-4xl font-black text-[color:var(--tour-text-strong)]">
            {formatCurrency(EARLY_PAYMENT_PRICE_PER_PERSON)}
          </span>
          <span className="pb-1 text-sm font-bold text-[color:var(--tour-text-muted)]">{BOOTCAMP_TAX_LABEL}</span>
        </div>
        <p className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">
          Valor con pronto pago (5 días antes)
        </p>

        <PricingAccordion
          title="Ver beneficios"
          benefits={[
            "Acompañamiento personalizado por expertos",
            "Certificado digital de participación",
            "Refrigerio y almuerzo incluidos",
            "Espacios de networking y conexión profesional",
            "Entrega de recursos digitales complementarios",
            "Acceso durante un mes a Crea Academy",
          ]}
        />

        <div className="mt-auto pt-7">
          <Button onClick={() => onPagarClick?.("person")} className="w-full rounded-full bg-brand-neon font-black text-black hover:bg-brand-neon/90">
            Pagar
            <CreditCard className="h-4 w-4" />
          </Button>
        </div>
      </article>

      <article className="flex flex-col rounded-lg border border-brand-neon/45 bg-[linear-gradient(180deg,rgba(236,253,245,0.72),rgba(240,253,250,0.54))] p-7 shadow-[0_24px_60px_rgba(4,255,141,0.10)] dark:bg-none dark:bg-brand-neon/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="tour-readable-green inline-flex rounded-full border border-brand-neon/25 bg-brand-neon/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
            Equipo empresa
          </p>
          <span className="tour-readable-green rounded-full border border-brand-neon/25 bg-brand-neon/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] dark:bg-[#071225]">
            Ahorras {formatCurrency(TEAM_SAVINGS)} vs. lista
          </span>
        </div>
        <div className="mt-5">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">
            Desde {TEAM_MIN_PEOPLE} personas
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
            <span className="font-display text-4xl font-black text-[color:var(--tour-text-strong)]">
              {formatCurrency(TEAM_PRICE_PER_PERSON)}
            </span>
            <span className="pb-1 text-sm font-bold text-[color:var(--tour-text-muted)]">{BOOTCAMP_TAX_LABEL}/persona</span>
          </div>
        </div>
        <div className="mt-5 border-y border-brand-neon/25 py-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[color:var(--tour-text-muted)]">Lista por {TEAM_MIN_PEOPLE} cupos</span>
            <span className="font-bold text-[color:var(--tour-text-muted)] line-through">
              {formatCurrency(TEAM_BASE_TOTAL)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <span className="font-black text-[color:var(--tour-text-strong)]">Total equipo con IVA</span>
            <span className="tour-readable-green font-display text-2xl font-black">
              {formatCurrency(TEAM_TOTAL)}
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
          Incluye 30% de pronto pago (aplica 5 días calendario antes del evento) y reserva de cupos en la ciudad seleccionada.
        </p>

        <PricingAccordion
          title="Ver beneficios"
          benefits={[
            "Acompañamiento personalizado por expertos",
            "Certificado digital de participación",
            "Refrigerio y almuerzo incluidos",
            "Espacios de networking y conexión profesional",
            "Entrega de recursos digitales complementarios",
            "Acceso durante un mes a Crea Academy",
          ]}
        />

        <div className="mt-auto pt-7">
          <Button onClick={() => onPagarClick?.("company")} className="w-full rounded-full bg-brand-neon font-black text-black hover:bg-brand-neon/90">
            Pagar
            <CreditCard className="h-4 w-4" />
          </Button>
        </div>
      </article>

      <article className="flex flex-col rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-7 shadow-[var(--tour-shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="tour-readable-cyan inline-flex rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
            Sesión In-house
          </p>
          <span className="tour-readable-cyan rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em]">
            Personalizado
          </span>
        </div>
        <div className="mt-5">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">
            Para equipos y empresas
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
            <span className="font-display text-4xl font-black text-[color:var(--tour-text-strong)]">
              Cotización
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-[color:var(--tour-text-muted)]">
          Cotización a medida
        </p>


        <div className="mt-auto pt-7">
          <Button onClick={() => onPagarClick?.("inhouse")} className="w-full rounded-full border border-brand-cyan/25 bg-brand-cyan/10 font-black text-brand-cyan hover:bg-brand-cyan/20">
            Solicitar cotización
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </article>
    </div>
  );
}



function WhyExecutionSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Por qué este Bootcamp"
          title="Esto no es un curso. Es {ejecución real}."
          description="El bootcamp está diseñado para que cada persona aprenda, construya y valide una solución aplicable a su entorno desde el primer día."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {WHY_EXECUTION_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultSection() {
  return (
    <section className="border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] px-4 py-16 dark:border-white/10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Resultado"
          title="Lo que tu equipo logra en {1 día}."
          description="Una experiencia diseñada para activar capacidades internas y acelerar la adopción real de inteligencia artificial en la organización."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {RESULT_ITEMS.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{
                y: -10,
                scale: 1.02,
              }}
              className="group relative h-[380px] overflow-hidden rounded-[32px] border border-[color:var(--tour-border-standard)] bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all hover:border-brand-neon/40 hover:shadow-[0_30px_60px_-12px_rgba(4,255,141,0.2)]"
            >
              {/* Multicolored Line */}
              <div className="absolute top-0 left-0 z-20 h-[4px] w-full scale-x-0 bg-gradient-to-r from-brand-neon via-brand-cyan to-purple-500 transition-transform duration-500 origin-left group-hover:scale-x-100" />

              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={item.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-end p-6">
                <span className="font-display text-5xl font-black text-white/10 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-brand-neon group-hover:via-brand-cyan group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent">
                  {item.id}
                </span>
                <p className="mt-2 text-lg font-black leading-tight text-white">
                  {item.text}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesDetailSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <SectionHeader
              eyebrow="Contenido"
              title="7 módulos de alto impacto en {1 día}."
              description="Módulos prácticos para entender, aplicar y construir con IA en contextos reales de trabajo."
              className="max-w-none"
            />
            <div className="mt-8 flex flex-wrap gap-2">
              {[].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-soft)] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[color:var(--tour-text-muted)] dark:text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {BOOTCAMP_DETAILED_MODULES.map((module, i) => (
              <motion.article
                key={module.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 10 }}
                className={cn(
                  "relative rounded-3xl border border-[color:var(--tour-border-standard)] bg-white/70 dark:bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:border-brand-neon/40 hover:shadow-[0_20px_50px_rgba(4,255,141,0.08)]",
                  module.isBonus && "border-dashed bg-white/40 dark:bg-white/10"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-black",
                      module.isBonus ? "bg-brand-cyan/10 text-brand-cyan" : "bg-brand-neon/10 text-brand-neon"
                    )}>
                      {module.id}
                    </span>
                    <h3 className="font-display text-lg font-black text-[color:var(--tour-text-strong)]">
                      {module.title}
                    </h3>
                  </div>
                  <span className="inline-flex rounded-full bg-black/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[color:var(--tour-text-muted)] dark:bg-white/5 dark:text-white/60">
                    {module.time}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[color:var(--tour-text-default)] dark:text-white/70">
                  {module.description}
                </p>

                {module.options && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {module.options.map((opt) => (
                      <div key={opt.label} className="rounded-2xl border border-[color:var(--tour-border-standard)] bg-white/80 p-4 shadow-sm dark:bg-white/10">
                        <p className="text-sm font-black text-[color:var(--tour-text-strong)]">{opt.label}</p>
                        <p className="mt-2 text-xs leading-relaxed text-[color:var(--tour-text-muted)] dark:text-white/60">
                          {opt.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DeliverablesSection() {
  return (
    <section className="border-y border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] px-4 py-16 dark:border-white/10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Entregables"
          title="Recursos [entregados] para continuar implementando IA después del {bootcamp}."
          description="Sales con esto, no solo con conocimiento"
          centered
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DELIVERABLES.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{
                scale: 1.03,
                backgroundColor: "rgba(255,255,255,0.05)"
              }}
              className="group relative overflow-hidden flex items-center gap-4 rounded-2xl border border-[color:var(--tour-border-standard)] bg-white/70 dark:bg-white/5 backdrop-blur-md p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:border-brand-neon/40 hover:shadow-[0_20px_50px_rgba(4,255,141,0.12)]"
            >
              <div className="absolute top-0 left-0 h-[3px] w-full scale-x-0 bg-gradient-to-r from-brand-neon via-brand-cyan to-purple-500 transition-transform duration-500 origin-left group-hover:scale-x-100" />
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-neon/10 text-brand-neon">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold leading-snug text-[color:var(--tour-text-strong)] dark:text-white/90">
                {item}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FormatSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-7xl"
      >
        <div className="overflow-hidden rounded-[32px] border border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] shadow-[var(--tour-shadow-elevated)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* Left side: Accent */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative flex flex-col justify-center overflow-hidden bg-slate-950 p-8 sm:p-12 lg:p-16"
            >
              <img
                src="https://assets-sam.mkt.dynamics.com/2be9f283-e2e5-40bf-b6a6-d1e8356bf9a7/digitalassets/images/22349fcf-7049-f111-bec7-000d3ac04e45?ts=639136852327272094"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="relative z-10">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-neon">
                  Experiencia
                </span>
                <h2 className="mt-4 font-display text-[clamp(3.5rem,8vw,6rem)] font-black leading-[0.8] tracking-tighter text-white">
                  8+2
                </h2>
                <p className="mt-6 font-display text-2xl font-black leading-tight text-white sm:text-3xl">
                  horas de experiencia práctica
                </p>
                <p className="mt-6 text-sm font-bold leading-relaxed text-white/80 sm:text-base">
                  Un día intensivo presencial seguido de una sesión virtual de seguimiento para asegurar avance real en tu organización.
                </p>
              </div>
            </motion.div>

            {/* Right side: Content */}
            <div className="flex flex-col justify-center bg-[var(--tour-panel-gradient)] p-8 sm:p-12 lg:p-16">
              <SectionHeader
                eyebrow="Formato"
                title="Diseñado para aprender {haciendo}."
                className="mb-8 max-w-none"
              />
              <ul className="space-y-4">
                {FORMAT_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-4 rounded-2xl border border-[color:var(--tour-border-standard)] bg-white/50 p-4 shadow-sm transition-all hover:border-brand-neon/30 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="h-2 w-2 shrink-0 rounded-full bg-brand-neon" />
                    <p className="text-sm font-bold text-[color:var(--tour-text-strong)] dark:text-white/90">
                      {feature}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function PricingFooter() {
  return (
    <div className="mx-auto mt-4 grid max-w-none gap-3 rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-elevated)] p-4 text-sm font-bold text-[color:var(--tour-text-default)] shadow-[var(--tour-shadow-soft)] md:grid-cols-3">
      <p className="flex gap-3">
        <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-brand-neon" />
        Todos los planes muestran precio con 30% de pronto pago (aplica 5 días calendario antes del evento).
      </p>
      <p className="flex gap-3">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-neon" />
        Equipos desde {TEAM_MIN_PEOPLE} participantes reciben 10% adicional.
      </p>
      <p className="flex gap-3">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
        Valores en COP con IVA incluido; algunas sedes siguen en cierre de dirección.
      </p>
    </div>
  );
}

export default function BootcampIA() {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [modalView, setModalView] = useState<"plans" | "checkout">("plans");

  const [selectedSessionId, setSelectedSessionId] = useState<string>(ACTIVE_BOOTCAMP_SESSION.id);

  const [selectedFlow, setSelectedFlow] = useState<QuoteFlow>("person");

  useEffect(() => {
    document.title = "Bootcamp IA Gira Colombia 2026 | Ingeniería 365";
    window.scrollTo({ top: 0, behavior: "instant" });

    const handleSessionSelect = (event: Event) => {
      const nextSessionId = (event as CustomEvent<{ sessionId?: string }>).detail?.sessionId;
      if (nextSessionId) {
        setSelectedSessionId(nextSessionId);
      }
      setShowPricingModal(true);
      setModalView("plans");
    };

    window.addEventListener(BOOTCAMP_SESSION_SELECT_EVENT, handleSessionSelect);
    return () => window.removeEventListener(BOOTCAMP_SESSION_SELECT_EVENT, handleSessionSelect);
  }, []);

  return (
    <div className="tour-ambient-shell relative min-h-screen overflow-x-hidden text-slate-900 dark:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="tour-ambient-base absolute inset-0" />
        <div className="tour-ambient-vignette absolute inset-0" />
      </div>

      <Header />

      <main className="relative z-10 pt-[72px]">
        <TourRouteSection />

        <FormatSection />

        <WhyExecutionSection />

        <ResultSection />

        <ModulesDetailSection />

        <DeliverablesSection />

        <StudyImpactSection />

        <SceneTestimonies />

        <ImpactedCompaniesSection compact className="border-t-0" />

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-lg border border-brand-cyan/25 bg-[linear-gradient(135deg,rgba(0,210,255,0.14),rgba(4,255,141,0.10),rgba(123,44,191,0.12))] p-8 text-center shadow-[var(--tour-shadow-elevated)] sm:p-12">
            <FileText className="mx-auto h-10 w-10 text-brand-cyan" />
            <SceneHeadline
              as="h2"
              variant="section"
              typewriter={false}
              parts={parseHeadline("Este no es un curso. Es una {transformación operativa}.")}
              className="mt-5 font-display text-[clamp(2rem,5vw,4rem)] font-black leading-[1.02] text-[color:var(--tour-text-strong)]"
              wrapperClassName="justify-center flex flex-wrap"
            />
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

      <AnimatePresence>
        {showPricingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPricingModal(false);
                setTimeout(() => setModalView("plans"), 300);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md dark:bg-slate-950/80"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative z-10 w-full max-w-screen-2xl max-h-[90vh] overflow-x-hidden overflow-y-auto rounded-[32px] border border-[color:var(--tour-border-standard)] bg-[var(--tour-canvas)] p-6 shadow-[var(--tour-shadow-elevated)] sm:p-10 lg:p-12 dark:bg-[#070c1a] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-neon/20 hover:[&::-webkit-scrollbar-thumb]:bg-brand-neon/40"
            >
              <button
                onClick={() => {
                  setShowPricingModal(false);
                  setTimeout(() => setModalView("plans"), 300);
                }}
                className="absolute right-6 top-6 rounded-full border border-[color:var(--tour-border-standard)] bg-[var(--tour-surface-soft)] p-2 text-[color:var(--tour-text-muted)] transition-colors hover:bg-[var(--tour-surface-elevated)] hover:text-[color:var(--tour-text-strong)]"
              >
                <X className="h-6 w-6" />
              </button>
              {modalView === "plans" ? (
                <>
                  <div className="mb-10">
                    <SectionHeader
                      title="Selecciona el plan ideal"
                      centered
                      className="max-w-none"
                      titleClassName="whitespace-nowrap"
                    />
                  </div>
                  <PricingCards onPagarClick={(flow) => {
                    setSelectedFlow(flow);
                    setModalView("checkout");
                  }} />
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <Button
                      variant="ghost"
                      onClick={() => setModalView("plans")}
                      className="flex items-center gap-2 hover:bg-white/5"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver a planes
                    </Button>
                  </div>
                  <CorporateQuoter initialSessionId={selectedSessionId} initialFlow={selectedFlow} />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
