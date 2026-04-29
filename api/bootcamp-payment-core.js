const FALLBACK_CURRENCY = "USD";
const FALLBACK_PRICE_PER_PERSON = 360;
const EARLY_PAYMENT_DISCOUNT_PERCENTAGE = 30;
const roundMoney = (value) => Number(Number(value || 0).toFixed(2));
const FALLBACK_EARLY_PAYMENT_PRICE_PER_PERSON = roundMoney(
  FALLBACK_PRICE_PER_PERSON * (1 - EARLY_PAYMENT_DISCOUNT_PERCENTAGE / 100),
);
const TEAM_DISCOUNT = 0.1;
const MIN_PEOPLE = 1;
const DEFAULT_PAYMENT_API_URL = "https://pagos.ingenieria365.com";
const DEFAULT_PAYMENT_APP_ID = "298f0727-6901-4d98-88e0-785576041b20";
const DEFAULT_BOOTCAMP_PLAN_ID = "79d33e26-5076-4057-8eb0-326c2b19a937";
const DEFAULT_SESSION_ID = "medellin-2026-05-22";
const BOOTCAMP_SESSIONS = {
  [DEFAULT_SESSION_ID]: {
    id: DEFAULT_SESSION_ID,
    planId: "79d33e26-5076-4057-8eb0-326c2b19a937",
    dateLabel: "Viernes 22 de mayo de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Medellín",
    venue: "Auditorio del Centro Comercial San Diego",
    address: "Centro Comercial San Diego, Medellín",
  },
  "bogota-2026-05-29": {
    id: "bogota-2026-05-29",
    planId: "810ee2d2-720f-44b3-8377-4dfa2f689b1b",
    dateLabel: "Viernes 29 de mayo de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Bogot\u00e1",
    venue: "Sede por confirmar",
    address: "Direcci\u00f3n por confirmar",
  },
  "cali-2026-06-12": {
    id: "cali-2026-06-12",
    planId: "baa0c7c8-b226-4f55-92e6-37aedb4c598b",
    dateLabel: "Viernes 12 de junio de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Cali",
    venue: "Sede por confirmar",
    address: "Direcci\u00f3n por confirmar",
  },
  "barranquilla-2026-07-10": {
    id: "barranquilla-2026-07-10",
    planId: "252ac806-8779-4cbf-9f5b-07f493e8e9ef",
    dateLabel: "Viernes 10 de julio de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Barranquilla",
    venue: "Sede por confirmar",
    address: "Direcci\u00f3n por confirmar",
  },
  "cartagena-2026-07-17": {
    id: "cartagena-2026-07-17",
    planId: "d5ba71a2-b12d-4434-b67d-5b6cd28f4784",
    dateLabel: "Viernes 17 de julio de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Cartagena",
    venue: "Sede por confirmar",
    address: "Direcci\u00f3n por confirmar",
  },
  "bucaramanga-2026-07-24": {
    id: "bucaramanga-2026-07-24",
    planId: "2d9990b7-b1d3-4997-b6f4-98a4cb8e460e",
    dateLabel: "Viernes 24 de julio de 2026",
    timeLabel: "8:00 AM a 6:00 PM",
    city: "Bucaramanga",
    venue: "Sede por confirmar",
    address: "Direcci\u00f3n por confirmar",
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
    useRemoteBootcampPricing: env.I365_BOOTCAMP_USE_REMOTE_PRICING === "true",
  };
}

async function fetchBootcampBasePlan(config, planId = config.bootcampPlanId) {
  const targetPlanId = sanitizeText(planId);
  if (!targetPlanId) return null;

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

  const plan = payload.plans.find((item) => sanitizeText(item?.id) === targetPlanId);

  if (!plan) {
    throw new PaymentError(
      `No se encontró el plan base del Bootcamp en i365 (${targetPlanId}).`,
      502,
      payload,
    );
  }

  return plan;
}

async function resolveBootcampUnitPricing(config, now = new Date(), session = null) {
  const targetPlanId = sanitizeText(session?.planId || config.bootcampPlanId);
  const fallbackPricing = () => ({
    plan: null,
    priceSource: "fallback_usd",
    currency: FALLBACK_CURRENCY,
    planId: targetPlanId || null,
    planName: null,
    basePricePerPerson: FALLBACK_PRICE_PER_PERSON,
    pricePerPerson: FALLBACK_EARLY_PAYMENT_PRICE_PER_PERSON,
    planDiscountPercentage: EARLY_PAYMENT_DISCOUNT_PERCENTAGE,
  });

  if (!config.useRemoteBootcampPricing) {
    return fallbackPricing();
  }

  const plan = await fetchBootcampBasePlan(config, targetPlanId);

  if (!plan) {
    return fallbackPricing();
  }

  const basePricePerPerson = roundMoney(Number(plan.price_cents || 0) / 100);
  const planDiscountPercentage = getActivePlanDiscountPercentage(plan, now);
  const pricePerPerson = roundMoney(getPlanFinalPriceCents(plan, now) / 100);

  if (!Number.isFinite(basePricePerPerson) || basePricePerPerson <= 0) {
    throw new PaymentError("El precio base del plan Bootcamp IA es inválido en i365.", 502, plan);
  }

  return {
    plan,
    priceSource: "i365_plan",
    currency: sanitizeText(plan.currency, FALLBACK_CURRENCY),
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
  const session = resolveSession(options.sessionId);
  const unitPricing = await resolveBootcampUnitPricing(config, options.now || new Date(), session);

  const baseSubtotal = roundMoney(unitPricing.basePricePerPerson * people);
  const subtotal = roundMoney(unitPricing.pricePerPerson * people);
  const planDiscountValue = Math.max(baseSubtotal - subtotal, 0);
  const groupDiscountPercentage = people >= 5 ? Math.round(TEAM_DISCOUNT * 100) : 0;
  const groupDiscountValue = groupDiscountPercentage > 0 ? roundMoney(subtotal * TEAM_DISCOUNT) : 0;
  const total = roundMoney(Math.max(subtotal - groupDiscountValue, 0));

  return {
    people,
    sessionId: session.id,
    currency: unitPricing.currency,
    planId: unitPricing.planId,
    planName: unitPricing.planName,
    priceSource: unitPricing.priceSource,
    basePricePerPerson: unitPricing.basePricePerPerson,
    pricePerPerson: unitPricing.pricePerPerson,
    baseSubtotal,
    subtotal,
    planDiscountPercentage: unitPricing.planDiscountPercentage,
    planDiscountValue: roundMoney(planDiscountValue),
    groupDiscountPercentage,
    groupDiscountValue,
    totalDiscountValue: roundMoney(planDiscountValue + groupDiscountValue),
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

  const session = resolveSession(body.sessionId);
  const quote = await getBootcampQuote(body.people, { ...options, sessionId: session.id });
  const clientType = sanitizeText(body.clientType || body.client_type, "company") === "person" ? "person" : "company";
  const rawContactName = sanitizeText(body.contactName || body.contact_name);
  const company = sanitizeText(
    body.company,
    clientType === "person" ? rawContactName || "Persona natural Bootcamp IA" : "Cliente Bootcamp IA",
  );
  const nit = sanitizeText(body.nit, "N/A");
  const contactName = rawContactName || company;
  const contactRole = sanitizeText(body.contactRole);
  const phone = sanitizeText(body.phone);
  const identityAnchor = nit !== "N/A" ? nit : company;
  const fallbackCompanyId = buildExternalId("bootcamp-company", identityAnchor);
  const fallbackUserId = buildExternalId("bootcamp-user", email, contactName, identityAnchor);
  const userId = sanitizeText(body.userId || body.user_id, fallbackUserId);
  const companyId = sanitizeText(body.companyId || body.company_id, fallbackCompanyId);
  const city = sanitizeText(body.city, session.city);
  const customerLegalId = nit !== "N/A" ? nit : undefined;
  const customerLegalIdType = customerLegalId ? (clientType === "company" ? "NIT" : "CC") : undefined;
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
      currency: quote.currency,
      moneda: quote.currency,
      email,
      customer_name: contactName,
      customer_legal_id: customerLegalId,
      customer_legal_id_type: customerLegalIdType,
      datos_curso: {
        nombre: "Bootcamp de Inteligencia Artificial - Crea Academy by i365",
        id: "bootcamp-ia-crea-academy",
        tipo: "bootcamp_ia",
        tipo_cliente: clientType === "company" ? "empresa_persona_juridica" : "persona_natural",
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
        moneda: quote.currency,
        precio_base_persona: quote.basePricePerPerson,
        precio_final_persona: quote.pricePerPerson,
        valores_antes_de_iva: false,
        iva_incluido: true,
        descuento_pronto_pago_porcentaje: quote.planDiscountPercentage,
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
        quote_scope: clientType,
        currency: quote.currency,
        bootcamp_plan_id: quote.planId,
        bootcamp_plan_name: quote.planName,
        bootcamp_price_source: quote.priceSource,
        plan_discount_percentage: quote.planDiscountPercentage,
        group_discount_percentage: quote.groupDiscountPercentage,
        early_payment_discount_percentage: quote.planDiscountPercentage,
        values_before_vat: false,
        vat_included: true,
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

  const widgetCurrency = sanitizeText(datosWidget.currency).toUpperCase();
  const widgetAmountInCents = Number(datosWidget.amountInCents);

  if (widgetCurrency && widgetCurrency !== quote.currency) {
    throw new PaymentError(
      `La pasarela devolvió moneda ${widgetCurrency}, pero la cotización está en ${quote.currency}.`,
      502,
      payload,
    );
  }

  if (Number.isFinite(widgetAmountInCents) && widgetAmountInCents !== quote.amountInCents) {
    throw new PaymentError(
      "La pasarela devolvió un monto distinto al total validado en servidor.",
      502,
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
