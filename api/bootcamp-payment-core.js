const FALLBACK_PRICE_PER_PERSON = 1150000;
const TEAM_DISCOUNT = 0.1;
const MIN_PEOPLE = 1;
const DEFAULT_PAYMENT_API_URL = "https://widget-i365-pagos-574077189410.us-central1.run.app";
const DEFAULT_PAYMENT_APP_ID = "6015d948-0a6d-4c66-b94d-830eeeb441bb";
const DEFAULT_BOOTCAMP_PLAN_ID = "ff64a816-c6d9-47ac-a298-7ece16c486cb";
const DEFAULT_SESSION_ID = "medellin-2026-05-22";
const BOOTCAMP_SESSIONS = {
  [DEFAULT_SESSION_ID]: {
    id: DEFAULT_SESSION_ID,
    dateLabel: "Viernes 22 de mayo de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Medellín",
    venue: "Auditorio del Centro Comercial San Diego",
    address: "Centro Comercial San Diego, Medellín",
  },
};

export class PaymentError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "PaymentError";
    this.status = status;
    this.details = details;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeText(value, fallback = "") {
  return String(value ?? fallback).trim().slice(0, 180);
}

function slugifyIdentifier(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function buildExternalId(prefix, ...parts) {
  const normalized = parts.map(slugifyIdentifier).filter(Boolean).join("-");
  return `${prefix}-${normalized || "cliente"}`.slice(0, 180);
}

function parseDiscountDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getActivePlanDiscountPercentage(plan, now = new Date()) {
  const rawDiscount = Number(plan?.discount_percentage ?? 0);
  if (!Number.isFinite(rawDiscount) || rawDiscount <= 0) {
    return 0;
  }

  const startsAt = parseDiscountDate(plan?.discount_start_at);
  const endsAt = parseDiscountDate(plan?.discount_end_at);

  if (plan?.discount_start_at && !startsAt) return 0;
  if (plan?.discount_end_at && !endsAt) return 0;
  if (startsAt && startsAt > now) return 0;
  if (endsAt && now > endsAt) return 0;

  return Math.min(100, Math.max(0, rawDiscount));
}

function getPlanFinalPriceCents(plan, now = new Date()) {
  const basePriceCents = Number(plan?.price_cents ?? 0);
  if (!Number.isFinite(basePriceCents) || basePriceCents < 0) {
    return 0;
  }

  const discountPercentage = getActivePlanDiscountPercentage(plan, now);
  return Math.max(0, Math.round(basePriceCents * (1 - discountPercentage / 100)));
}

function resolveSession(sessionId) {
  const session = BOOTCAMP_SESSIONS[sanitizeText(sessionId, DEFAULT_SESSION_ID)];

  if (!session) {
    throw new PaymentError("La fecha seleccionada aún no está disponible para pago.", 400);
  }

  return session;
}

function normalizeWidgetData(widgetData) {
  if (!widgetData || typeof widgetData !== "object") return null;

  const signature =
    typeof widgetData.signature === "string"
      ? widgetData.signature
      : widgetData.signature?.integrity;

  if (!signature) return null;

  return {
    ...widgetData,
    signature,
  };
}

function parsePeople(peopleInput) {
  const people = Math.max(Number.parseInt(String(peopleInput ?? ""), 10) || 0, 0);

  if (people < MIN_PEOPLE) {
    throw new PaymentError("La cotización debe tener al menos una persona.", 400);
  }

  return people;
}

function resolvePaymentConfig(envInput = {}) {
  const env = envInput || {};

  return {
    env,
    paymentApiBaseUrl: sanitizeText(
      env.I365_PAYMENT_API_URL || env.VITE_I365_WIDGET_URL || DEFAULT_PAYMENT_API_URL,
      DEFAULT_PAYMENT_API_URL,
    ).replace(/\/widget\.js$/, "").replace(/\/$/, ""),
    appId: sanitizeText(
      env.I365_PAYMENT_APP_ID || env.VITE_I365_PAYMENT_APP_ID,
      DEFAULT_PAYMENT_APP_ID,
    ),
    bootcampPlanId: sanitizeText(
      env.I365_BOOTCAMP_PLAN_ID || env.VITE_I365_BOOTCAMP_PLAN_ID,
      DEFAULT_BOOTCAMP_PLAN_ID,
    ),
  };
}

async function fetchBootcampBasePlan(config) {
  if (!config.bootcampPlanId) return null;

  const search = new URLSearchParams({ app_id: config.appId });
  const response = await fetch(`${config.paymentApiBaseUrl}/api/planes?${search.toString()}`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.ok === false || !Array.isArray(payload?.plans)) {
    throw new PaymentError(
      payload?.error || "No se pudo consultar el plan base del Bootcamp en i365.",
      response.status || 502,
      payload,
    );
  }

  const plan = payload.plans.find((item) => sanitizeText(item?.id) === config.bootcampPlanId);

  if (!plan) {
    throw new PaymentError(
      `No se encontró el plan base del Bootcamp en i365 (${config.bootcampPlanId}).`,
      502,
      payload,
    );
  }

  return plan;
}

async function resolveBootcampUnitPricing(config, now = new Date()) {
  const plan = await fetchBootcampBasePlan(config);

  if (!plan) {
    return {
      plan: null,
      priceSource: "fallback",
      currency: "COP",
      planId: null,
      planName: null,
      basePricePerPerson: FALLBACK_PRICE_PER_PERSON,
      pricePerPerson: FALLBACK_PRICE_PER_PERSON,
      planDiscountPercentage: 0,
    };
  }

  const basePricePerPerson = Math.round(Number(plan.price_cents || 0) / 100);
  const planDiscountPercentage = getActivePlanDiscountPercentage(plan, now);
  const pricePerPerson = Math.round(getPlanFinalPriceCents(plan, now) / 100);

  if (!Number.isFinite(basePricePerPerson) || basePricePerPerson <= 0) {
    throw new PaymentError("El precio base del plan Bootcamp IA es inválido en i365.", 502, plan);
  }

  return {
    plan,
    priceSource: "i365_plan",
    currency: sanitizeText(plan.currency, "COP"),
    planId: sanitizeText(plan.id) || null,
    planName: sanitizeText(plan.name) || null,
    basePricePerPerson,
    pricePerPerson: pricePerPerson > 0 ? pricePerPerson : basePricePerPerson,
    planDiscountPercentage,
  };
}

export async function getBootcampQuote(peopleInput, options = {}) {
  const config = resolvePaymentConfig(options.env || process.env);
  const people = parsePeople(peopleInput);
  const unitPricing = await resolveBootcampUnitPricing(config, options.now || new Date());

  const baseSubtotal = unitPricing.basePricePerPerson * people;
  const subtotal = unitPricing.pricePerPerson * people;
  const planDiscountValue = Math.max(baseSubtotal - subtotal, 0);
  const groupDiscountPercentage = people >= 5 ? Math.round(TEAM_DISCOUNT * 100) : 0;
  const groupDiscountValue = groupDiscountPercentage > 0 ? Math.round(subtotal * TEAM_DISCOUNT) : 0;
  const total = Math.max(subtotal - groupDiscountValue, 0);

  return {
    people,
    currency: unitPricing.currency,
    planId: unitPricing.planId,
    planName: unitPricing.planName,
    priceSource: unitPricing.priceSource,
    basePricePerPerson: unitPricing.basePricePerPerson,
    pricePerPerson: unitPricing.pricePerPerson,
    baseSubtotal,
    subtotal,
    planDiscountPercentage: unitPricing.planDiscountPercentage,
    planDiscountValue,
    groupDiscountPercentage,
    groupDiscountValue,
    totalDiscountValue: planDiscountValue + groupDiscountValue,
    total,
    amountInCents: Math.round(total * 100),
  };
}

export async function createBootcampPayment(body, options = {}) {
  const config = resolvePaymentConfig(options.env || process.env);
  const email = sanitizeText(body.email).toLowerCase();

  if (!isValidEmail(email)) {
    throw new PaymentError("Correo de cliente inválido.", 400);
  }

  const quote = await getBootcampQuote(body.people, options);
  const company = sanitizeText(body.company, "Cliente Bootcamp IA");
  const nit = sanitizeText(body.nit, "N/A");
  const contactName = sanitizeText(body.contactName, company);
  const contactRole = sanitizeText(body.contactRole);
  const phone = sanitizeText(body.phone);
  const identityAnchor = nit !== "N/A" ? nit : company;
  const fallbackCompanyId = buildExternalId("bootcamp-company", identityAnchor);
  const fallbackUserId = buildExternalId("bootcamp-user", email, contactName, identityAnchor);
  const userId = sanitizeText(body.userId || body.user_id, fallbackUserId);
  const companyId = sanitizeText(body.companyId || body.company_id, fallbackCompanyId);
  const session = resolveSession(body.sessionId);
  const city = sanitizeText(body.city, session.city);
  const customerLegalId = nit !== "N/A" ? nit : undefined;
  const redirectUrl =
    config.env.BOOTCAMP_PAYMENT_REDIRECT_URL ||
    (options.origin ? `${options.origin}/bootcamp-ia?payment=return#cotizador` : undefined);

  const paymentResponse = await fetch(`${config.paymentApiBaseUrl}/api/crear-pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: config.appId,
      user_id: userId,
      company_id: companyId,
      precio_centavos: quote.amountInCents,
      email,
      customer_name: contactName,
      customer_legal_id: customerLegalId,
      customer_legal_id_type: customerLegalId ? "NIT" : undefined,
      datos_curso: {
        nombre: "Bootcamp de Inteligencia Artificial - Crea Academy by i365",
        id: "bootcamp-ia-crea-academy",
        tipo: "bootcamp_ia",
        empresa: company,
        nit,
        contacto: contactName,
        cargo: contactRole,
        telefono: phone,
        ciudad: city,
        session_id: session.id,
        fecha: session.dateLabel,
        horario: session.timeLabel,
        ciudad_bootcamp: session.city,
        lugar: session.venue,
        direccion: session.address,
        participantes: quote.people,
        precio_base_persona: quote.basePricePerPerson,
        precio_final_persona: quote.pricePerPerson,
        subtotal_base: quote.baseSubtotal,
        subtotal: quote.subtotal,
        descuento_plan_porcentaje: quote.planDiscountPercentage,
        descuento_plan_valor: quote.planDiscountValue,
        descuento_grupal_porcentaje: quote.groupDiscountPercentage,
        descuento_grupal_valor: quote.groupDiscountValue,
        descuento_total: quote.totalDiscountValue,
        total: quote.total,
      },
      metadata: {
        payment_context: "bootcamp_quote",
        quote_scope: "company",
        bootcamp_plan_id: quote.planId,
        bootcamp_plan_name: quote.planName,
        bootcamp_price_source: quote.priceSource,
        plan_discount_percentage: quote.planDiscountPercentage,
        group_discount_percentage: quote.groupDiscountPercentage,
      },
      redirect_url: redirectUrl,
    }),
  });

  const payload = await paymentResponse.json().catch(() => ({}));
  const datosWidget = normalizeWidgetData(payload?.datos_widget);

  if (!paymentResponse.ok || payload?.ok === false || !datosWidget) {
    throw new PaymentError(
      payload?.error || payload?.message || "No se pudo crear el pago en el portal i365.",
      paymentResponse.status || 502,
      payload,
    );
  }

  return {
    ok: true,
    quote,
    session,
    payment: payload,
    datos_widget: datosWidget,
  };
}
