const FALLBACK_CURRENCY = "COP";
const PAYMENT_CURRENCY = "COP";
const FALLBACK_PRICE_PER_PERSON = 1_308_600;
const EARLY_PAYMENT_DISCOUNT_PERCENTAGE = 30;
const roundMoney = (value) => Number(Number(value || 0).toFixed(2));
const roundCop = (value) => Math.max(0, Math.round(Number(value || 0)));
const FALLBACK_EARLY_PAYMENT_PRICE_PER_PERSON = roundCop(
  FALLBACK_PRICE_PER_PERSON * (1 - EARLY_PAYMENT_DISCOUNT_PERCENTAGE / 100),
);
const TEAM_DISCOUNT = 0.1;
const MIN_PEOPLE = 1;
const DEFAULT_PAYMENT_API_URL = "https://pagos.ingenieria365.com";
const DEFAULT_PAYMENT_APP_ID = "298f0727-6901-4d98-88e0-785576041b20";
const DEFAULT_BOOTCAMP_PLAN_ID = "79d33e26-5076-4057-8eb0-326c2b19a937";
const DEFAULT_SESSION_ID = "medellin-2026-05-22";
const DEFAULT_TRM_API_URL =
  "https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC";
const LEGACY_PAYMENT_APP_IDS = new Set(["6015d948-0a6d-4c66-b94d-830eeeb441bb"]);
const LEGACY_PAYMENT_API_URLS = new Set([
  "https://widget-i365-pagos-574077189410.us-central1.run.app",
]);
const TRM_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
let trmCache = null;
export const PAYMENT_ERROR_CODES = {
  BOOTCAMP_PLAN_APP_MISMATCH: "BOOTCAMP_PLAN_APP_MISMATCH",
  BOOTCAMP_PLAN_LOOKUP_FAILED: "BOOTCAMP_PLAN_LOOKUP_FAILED",
};
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
  constructor(message, status = 500, details = null, code = undefined) {
    super(message);
    this.name = "PaymentError";
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeText(value, fallback = "") {
  return String(value ?? fallback).trim().slice(0, 180);
}

function sanitizeUrl(value, fallback = "") {
  const text = sanitizeText(value, fallback);
  if (!text) return "";

  try {
    return new URL(text).toString();
  } catch {
    return "";
  }
}

function readPositiveNumber(value, fallback = 0) {
  const normalized = String(value ?? "")
    .replace(/\s/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveBootcampPaymentApiUrl(env) {
  const configured = sanitizeText(
    env.I365_PAYMENT_API_URL || env.VITE_I365_WIDGET_URL || DEFAULT_PAYMENT_API_URL,
    DEFAULT_PAYMENT_API_URL,
  )
    .replace(/\/widget\.js$/, "")
    .replace(/\/$/, "");

  return LEGACY_PAYMENT_API_URLS.has(configured) ? DEFAULT_PAYMENT_API_URL : configured;
}

function resolveBootcampPaymentAppId(env) {
  const configured = sanitizeText(
    env.I365_PAYMENT_APP_ID || env.VITE_I365_PAYMENT_APP_ID,
    DEFAULT_PAYMENT_APP_ID,
  );

  return LEGACY_PAYMENT_APP_IDS.has(configured) ? DEFAULT_PAYMENT_APP_ID : configured;
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

function readPositiveCents(...values) {
  for (const value of values) {
    const cents = Number(value ?? 0);
    if (Number.isFinite(cents) && cents > 0) {
      return Math.round(cents);
    }
  }

  return 0;
}

function resolveDiscountPercentageFromPrices(basePriceCents, finalPriceCents, fallbackPercentage) {
  if (basePriceCents > 0 && finalPriceCents > 0 && finalPriceCents < basePriceCents) {
    return Math.round((1 - finalPriceCents / basePriceCents) * 100);
  }

  return fallbackPercentage;
}

function resolveSession(sessionId) {
  const session = BOOTCAMP_SESSIONS[sanitizeText(sessionId, DEFAULT_SESSION_ID)];

  if (!session) {
    throw new PaymentError("La fecha seleccionada aún no está disponible para pago.", 400);
  }

  return session;
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
  const redirectUrl = sanitizeUrl(env.I365_PAYMENT_REDIRECT_URL || env.BOOTCAMP_PAYMENT_REDIRECT_URL);

  return {
    env,
    paymentApiBaseUrl: resolveBootcampPaymentApiUrl(env),
    appId: resolveBootcampPaymentAppId(env),
    bootcampPlanId: sanitizeText(
      env.I365_BOOTCAMP_PLAN_ID || env.VITE_I365_BOOTCAMP_PLAN_ID,
      DEFAULT_BOOTCAMP_PLAN_ID,
    ),
    useRemoteBootcampPricing: env.I365_BOOTCAMP_USE_REMOTE_PRICING === "true",
    paymentRedirectUrl: redirectUrl,
    trmApiUrl: sanitizeText(env.TRM_API_URL, DEFAULT_TRM_API_URL),
    trmFallbackCopPerUsd: readPositiveNumber(env.TRM_FALLBACK_COP_PER_USD),
    trmOverrideCopPerUsd: readPositiveNumber(env.TRM_OVERRIDE_COP_PER_USD),
  };
}

function parseTrmPayload(payload) {
  const record = Array.isArray(payload) ? payload[0] : payload;
  const value = readPositiveNumber(record?.valor || record?.valor_trm || record?.trm);

  if (!value) {
    throw new PaymentError("La respuesta de TRM no trajo un valor valido.", 502, payload);
  }

  return {
    value,
    currencyPair: "USD/COP",
    source: "datos.gov.co/superfinanciera",
    validFrom: sanitizeText(record?.vigenciadesde || record?.vigencia_desde || record?.fecha),
    validTo: sanitizeText(record?.vigenciahasta || record?.vigencia_hasta),
  };
}

async function fetchCurrentTrm(config, now = new Date()) {
  if (config.trmOverrideCopPerUsd) {
    return {
      value: config.trmOverrideCopPerUsd,
      currencyPair: "USD/COP",
      source: "env_override",
      validFrom: now.toISOString(),
      validTo: "",
    };
  }

  if (trmCache && now.getTime() - trmCache.cachedAt < TRM_CACHE_TTL_MS) {
    return trmCache.trm;
  }

  try {
    const response = await fetch(config.trmApiUrl, {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new PaymentError("No se pudo consultar la TRM publica.", response.status || 502, payload);
    }

    const trm = parseTrmPayload(payload);
    trmCache = { cachedAt: now.getTime(), trm };
    return trm;
  } catch (error) {
    if (config.trmFallbackCopPerUsd) {
      return {
        value: config.trmFallbackCopPerUsd,
        currencyPair: "USD/COP",
        source: "env_fallback",
        validFrom: now.toISOString(),
        validTo: "",
      };
    }

    if (error instanceof PaymentError) {
      throw error;
    }

    throw new PaymentError(
      "No se pudo consultar la TRM para convertir el pago a pesos colombianos.",
      502,
      error instanceof Error ? error.message : error,
    );
  }
}

function withCopPaymentValues(quote, trm) {
  const baseSubtotalCop = roundCop(quote.baseSubtotal * trm.value);
  const subtotalCop = roundCop(quote.subtotal * trm.value);
  const totalDiscountCop = roundCop(quote.totalDiscountValue * trm.value);
  const totalCop = roundCop(quote.total * trm.value);

  return {
    ...quote,
    paymentCurrency: PAYMENT_CURRENCY,
    copCurrency: PAYMENT_CURRENCY,
    exchangeRate: trm.value,
    exchangeRatePair: trm.currencyPair,
    exchangeRateSource: trm.source,
    exchangeRateDate: trm.validFrom || null,
    exchangeRateValidTo: trm.validTo || null,
    baseSubtotalCop,
    subtotalCop,
    totalDiscountCop,
    totalCop,
    amountCopInCents: totalCop * 100,
  };
}

function withNativeCopPaymentValues(quote) {
  const baseSubtotalCop = roundCop(quote.baseSubtotal);
  const subtotalCop = roundCop(quote.subtotal);
  const totalDiscountCop = roundCop(quote.totalDiscountValue);
  const totalCop = roundCop(quote.total);

  return {
    ...quote,
    paymentCurrency: PAYMENT_CURRENCY,
    copCurrency: PAYMENT_CURRENCY,
    exchangeRate: null,
    exchangeRatePair: null,
    exchangeRateSource: "native_cop",
    exchangeRateDate: null,
    exchangeRateValidTo: null,
    baseSubtotalCop,
    subtotalCop,
    totalDiscountCop,
    totalCop,
    amountInCents: totalCop * 100,
    amountCopInCents: totalCop * 100,
  };
}

export async function getCurrentTrm(options = {}) {
  const config = resolvePaymentConfig(options.env || process.env);
  return fetchCurrentTrm(config, options.now || new Date());
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
      PAYMENT_ERROR_CODES.BOOTCAMP_PLAN_LOOKUP_FAILED,
    );
  }

  const plan = payload.plans.find((item) => sanitizeText(item?.id) === targetPlanId);

  if (!plan) {
    throw new PaymentError(
      `El plan Bootcamp configurado (${targetPlanId}) no pertenece a la app de pagos ${config.appId}.`,
      502,
      {
        appId: config.appId,
        planId: targetPlanId,
        availablePlanIds: payload.plans.map((item) => sanitizeText(item?.id)).filter(Boolean),
      },
      PAYMENT_ERROR_CODES.BOOTCAMP_PLAN_APP_MISMATCH,
    );
  }

  return plan;
}

async function assertBootcampPaymentPlanBelongsToApp(config, quote) {
  const targetPlanId = sanitizeText(quote?.planId);

  if (!targetPlanId) {
    throw new PaymentError(
      "El plan de pago del Bootcamp no esta configurado.",
      500,
      { appId: config.appId },
      PAYMENT_ERROR_CODES.BOOTCAMP_PLAN_APP_MISMATCH,
    );
  }

  return fetchBootcampBasePlan(config, targetPlanId);
}

async function resolveBootcampUnitPricing(config, now = new Date(), session = null) {
  const targetPlanId = sanitizeText(session?.planId || config.bootcampPlanId);
  const fallbackPricing = () => ({
    plan: null,
    priceSource: "fallback_cop",
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

  const activeDiscountPercentage = getActivePlanDiscountPercentage(plan, now);
  const basePriceCents = readPositiveCents(plan.configured_price_cents, plan.base_price_cents, plan.price_cents);
  const finalPriceCents = readPositiveCents(
    plan.total_price_cents,
    plan.final_price_cents,
    plan.discounted_price_cents,
    plan.price_cents,
    getPlanFinalPriceCents({ ...plan, price_cents: basePriceCents }, now),
  );
  const basePricePerPerson = roundMoney(basePriceCents / 100);
  const pricePerPerson = roundMoney(finalPriceCents / 100);
  const planDiscountPercentage = resolveDiscountPercentageFromPrices(
    basePriceCents,
    finalPriceCents,
    activeDiscountPercentage,
  );

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
  const now = options.now || new Date();
  const unitPricing = await resolveBootcampUnitPricing(config, now, session);

  const baseSubtotal = roundMoney(unitPricing.basePricePerPerson * people);
  const subtotal = roundMoney(unitPricing.pricePerPerson * people);
  const planDiscountValue = Math.max(baseSubtotal - subtotal, 0);
  const groupDiscountPercentage = people >= 5 ? Math.round(TEAM_DISCOUNT * 100) : 0;
  const groupDiscountValue = groupDiscountPercentage > 0 ? roundMoney(subtotal * TEAM_DISCOUNT) : 0;
  const total = roundMoney(Math.max(subtotal - groupDiscountValue, 0));

  const quote = {
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

  const quoteCurrency = sanitizeText(unitPricing.currency).toUpperCase();
  if (quoteCurrency === PAYMENT_CURRENCY) {
    return withNativeCopPaymentValues(quote);
  }

  if (quoteCurrency !== "USD") {
    throw new PaymentError(
      "El Bootcamp debe cotizarse en COP o en USD convertible por TRM.",
      502,
      unitPricing,
    );
  }

  const trm = await fetchCurrentTrm(config, now);
  return withCopPaymentValues(quote, trm);
}

export async function createBootcampPayment(body, options = {}) {
  const config = resolvePaymentConfig(options.env || process.env);
  const email = sanitizeText(body.email).toLowerCase();

  if (!isValidEmail(email)) {
    throw new PaymentError("Correo de cliente inválido.", 400);
  }

  const session = resolveSession(body.sessionId);
  const quote = await getBootcampQuote(body.people, { ...options, sessionId: session.id });
  const paymentPlan = await assertBootcampPaymentPlanBelongsToApp(config, quote);
  const clientType = sanitizeText(body.clientType || body.client_type, "company") === "person" ? "person" : "company";
  const rawContactName = sanitizeText(body.contactName || body.contact_name);
  const company = sanitizeText(
    body.company,
    clientType === "person" ? rawContactName || "Persona natural Bootcamp IA" : "Cliente Bootcamp IA",
  );
  const nit = sanitizeText(body.nit, "N/A");
  const contactName = rawContactName || company;
  const identityAnchor = nit !== "N/A" ? nit : company;
  const fallbackCompanyId = buildExternalId("bootcamp-company", identityAnchor);
  const fallbackUserId = buildExternalId("bootcamp-user", email, contactName, identityAnchor);
  const userId = sanitizeText(body.userId || body.user_id, fallbackUserId);
  const companyId = sanitizeText(body.companyId || body.company_id, fallbackCompanyId);
  const redirectUrl =
    config.paymentRedirectUrl ||
    (options.origin ? `${options.origin}/bootcamp-ia?payment=return#cotizador` : undefined);
  const quoteWithPlan = {
    ...quote,
    planName: quote.planName || sanitizeText(paymentPlan?.name) || null,
  };

  return {
    ok: true,
    quote: quoteWithPlan,
    session,
    widget_config: {
      appId: config.appId,
      userId,
      companyId,
      userEmail: email,
      userName: contactName,
      role: "usuario",
      planId: quote.planId,
      redirectUrl,
    },
  };
}
