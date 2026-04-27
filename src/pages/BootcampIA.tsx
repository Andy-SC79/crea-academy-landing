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
import { IMPACTED_COMPANY_COUNT } from "@/data/impacted-companies";
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
const DEFAULT_I365_WIDGET_APP_ID = "6015d948-0a6d-4c66-b94d-830eeeb441bb";
const DEFAULT_I365_BOOTCAMP_PLAN_ID = "ff64a816-c6d9-47ac-a298-7ece16c486cb";
const I365_WIDGET_APP_ID =
  import.meta.env.VITE_I365_PAYMENT_APP_ID || DEFAULT_I365_WIDGET_APP_ID;
const I365_BOOTCAMP_PLAN_ID =
  import.meta.env.VITE_I365_BOOTCAMP_PLAN_ID?.trim() || DEFAULT_I365_BOOTCAMP_PLAN_ID;
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
const CITIES = ["Medellín", "Bogotá", "Cali", "Barranquilla"];
const PRICE_PER_PERSON = 1150000;
const TEAM_DISCOUNT = 0.1;
const BOOTCAMP_SESSIONS = [
  {
    id: "medellin-2026-05-22",
    status: "available",
    shortLabel: "22 de mayo de 2026",
    dateLabel: "Viernes 22 de mayo de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Medellín",
    venue: "Auditorio del Centro Comercial San Diego",
    address: "Centro Comercial San Diego, Medellín",
    selectLabel: "22 de mayo de 2026 · Medellín · Centro Comercial San Diego",
  },
  {
    id: "future-dates",
    status: "coming_soon",
    shortLabel: "Próximas fechas",
    dateLabel: "Próximas fechas por confirmar",
    timeLabel: "Horario por confirmar",
    city: "Por confirmar",
    venue: "Lugar por confirmar",
    address: "Por confirmar",
    selectLabel: "Próximas fechas por confirmar",
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
  { value: `+${IMPACTED_COMPANY_COUNT}`, label: "organizaciones impactadas" },
  { value: "22 mayo", label: "fecha disponible" },
  { value: "San Diego", label: "auditorio en Medellín" },
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

function buildLocalFallbackQuote(peopleInput: number): BootcampQuote {
  const safePeople = Math.max(peopleInput, 0);
  const basePricePerPerson = PRICE_PER_PERSON;
  const pricePerPerson = basePricePerPerson;
  const baseSubtotal = safePeople * basePricePerPerson;
  const subtotal = safePeople * pricePerPerson;
  const groupDiscountPercentage = safePeople >= 5 ? Math.round(TEAM_DISCOUNT * 100) : 0;
  const groupDiscountValue = groupDiscountPercentage > 0 ? Math.round(subtotal * TEAM_DISCOUNT) : 0;
  const total = Math.max(subtotal - groupDiscountValue, 0);

  return {
    people: safePeople,
    currency: "COP",
    planId: null,
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
    people: "5",
    email: "",
  });
  const [sentMessage, setSentMessage] = useState("");
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(null);
  const [pricing, setPricing] = useState<BootcampQuote>(() => buildLocalFallbackQuote(5));

  const people = Math.max(Number.parseInt(form.people, 10) || 0, 0);
  const missingForDiscount = Math.max(5 - people, 0);
  const selectedSession = getBootcampSession(form.sessionId);
  const canPaySelectedSession = selectedSession.status === "available";
  const paymentIdentity = buildBootcampPaymentIdentity(form);
  const usesEmbeddedI365Widget = Boolean(I365_BOOTCAMP_PLAN_ID) && people === 1;
  const pricePerPerson = pricing.pricePerPerson;
  const subtotal = pricing.baseSubtotal;
  const total = pricing.total;
  const totalDiscountValue = pricing.totalDiscountValue;
  const hasDiscount = totalDiscountValue > 0;
  const hasPlanDiscount = pricing.planDiscountPercentage > 0;
  const hasGroupDiscount = pricing.groupDiscountPercentage > 0;

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
      city: nextSession.status === "available" ? nextSession.city : current.city,
    }));
  };

  useEffect(() => {
    const fallbackQuote = buildLocalFallbackQuote(people);
    setPricing(fallbackQuote);

    if (people < 1) return;

    const controller = new AbortController();

    void fetch(BOOTCAMP_PRICING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ people }),
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
  }, [people]);

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
          planId: I365_BOOTCAMP_PLAN_ID,
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
            Calcula y paga tu cupo.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--tour-text-default)] dark:text-white/70">
            Ingresa el correo, confirma el número de personas y abre el portal de pagos i365. Si necesitas apoyo, WhatsApp queda disponible como soporte.
          </p>
          <div className="mt-6 max-w-xl rounded-lg border border-brand-neon/25 bg-brand-neon/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0d8b5c] dark:text-brand-neon">
              Cohorte disponible
            </p>
            <p className="mt-3 font-display text-2xl font-black text-[color:var(--tour-text-strong)]">
              Viernes 22 de mayo de 2026
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
              Auditorio del Centro Comercial San Diego, Medellín. Las próximas fechas se publicarán cuando estén confirmadas.
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
                Las demás fechas todavía están por confirmar. Cuando estén disponibles aparecerán aquí para cotizar y pagar.
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
                ? `Descuento del plan i365 (${pricing.planDiscountPercentage}%) y descuento grupal del ${pricing.groupDiscountPercentage}% aplicados automáticamente.`
                : hasPlanDiscount
                  ? `Descuento del plan i365 (${pricing.planDiscountPercentage}%) aplicado automáticamente.`
                  : `Descuento grupal del ${pricing.groupDiscountPercentage}% aplicado automáticamente.`}
            </p>
          ) : (
            <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-700 dark:text-amber-200">
              {hasPlanDiscount
                ? `Descuento del plan i365 (${pricing.planDiscountPercentage}%) activo. Agrega ${missingForDiscount} persona${missingForDiscount === 1 ? "" : "s"} más para activar el ${Math.round(TEAM_DISCOUNT * 100)}% de descuento grupal.`
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
    document.title = "Bootcamp IA | Ingeniería 365";
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
                <span>Bootcamp presencial</span>
                <span className="h-1 w-1 rounded-full bg-current" />
                <span>1 día intensivo</span>
              </div>
              <h1 className="max-w-5xl font-display text-[clamp(2.8rem,8vw,7.6rem)] font-black leading-[0.94] tracking-tight text-[color:var(--tour-text-strong)]">
                Bootcamp IA para equipos que necesitan implementar.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[color:var(--tour-text-default)] dark:text-white/72">
                En este Bootcamp no aprendes IA como teoría. La aplicas en tu trabajo, construyes soluciones reales y sales con un prototipo que tu equipo puede seguir mejorando.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="xl"
                  className="rounded-full bg-brand-neon px-7 text-base font-black text-black hover:bg-brand-neon/90"
                >
                  <a href="#cotizador">
                    Pagar ahora
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
                  <p className="font-display text-lg font-black">Viernes 22 de mayo de 2026 · Medellín</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/72">
                  Cohorte abierta en el Auditorio del Centro Comercial San Diego. Las demás fechas aún están por confirmar.
                </p>
              </div>
            </div>
          </div>
        </section>

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
              title="Precio claro para personas y equipos."
              description="La fecha disponible actual es el viernes 22 de mayo de 2026 en el Auditorio del Centro Comercial San Diego, Medellín. Para empresas, desde cinco participantes se activa precio preferencial y diagnóstico previo."
              centered
            />
            <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
              <article className="rounded-lg border border-[color:var(--tour-border-standard)] bg-[var(--tour-panel-gradient)] p-7 shadow-[var(--tour-shadow-soft)]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--tour-text-muted)]">
                  Individual
                </p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display text-5xl font-black text-[color:var(--tour-text-strong)]">$1.150.000</span>
                  <span className="pb-2 text-sm font-bold text-[color:var(--tour-text-muted)]">COP</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
                  Acceso completo para una persona. Incluye módulos, material, comunidad y certificado.
                </p>
                <Button asChild className="mt-7 w-full rounded-full bg-brand-neon font-black text-black hover:bg-brand-neon/90">
                  <a href="#cotizador">
                    Pagar ahora
                    <CreditCard className="h-4 w-4" />
                  </a>
                </Button>
              </article>

              <article className="rounded-lg border border-brand-neon/45 bg-brand-neon/10 p-7 shadow-[0_24px_60px_rgba(4,255,141,0.10)]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0d8b5c] dark:text-brand-neon">
                  Empresa
                </p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display text-5xl font-black text-[color:var(--tour-text-strong)]">$1.035.000</span>
                  <span className="pb-2 text-sm font-bold text-[color:var(--tour-text-muted)]">COP/persona</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-[color:var(--tour-text-default)] dark:text-white/70">
                  Desde cinco personas. Incluye diagnóstico, descuento grupal y factura electrónica.
                </p>
                <Button asChild className="mt-7 w-full rounded-full bg-brand-neon font-black text-black hover:bg-brand-neon/90">
                  <a href="#cotizador">
                    Cotizar y pagar
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </article>
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
