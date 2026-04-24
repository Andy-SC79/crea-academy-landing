const PRICE_PER_PERSON = 1150000;
const TEAM_DISCOUNT = 0.1;
const MIN_PEOPLE = 1;
const DEFAULT_PAYMENT_API_URL = "https://pasarela-backend-548141860239.us-central1.run.app";
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

function calculateQuote(peopleInput) {
  const people = Math.max(Number.parseInt(String(peopleInput ?? ""), 10) || 0, 0);

  if (people < MIN_PEOPLE) {
    throw new PaymentError("La cotización debe tener al menos una persona.", 400);
  }

  const subtotal = people * PRICE_PER_PERSON;
  const discountValue = people >= 5 ? subtotal * TEAM_DISCOUNT : 0;
  const total = subtotal - discountValue;

  return {
    people,
    subtotal,
    discountValue,
    total,
    amountInCents: Math.round(total * 100),
  };
}

function resolveSession(sessionId) {
  const session = BOOTCAMP_SESSIONS[sanitizeText(sessionId, DEFAULT_SESSION_ID)];

  if (!session) {
    throw new PaymentError("La fecha seleccionada aún no está disponible para pago.", 400);
  }

  return session;
}

export async function createBootcampPayment(body, options = {}) {
  const env = options.env || process.env;
  const email = sanitizeText(body.email).toLowerCase();

  if (!isValidEmail(email)) {
    throw new PaymentError("Correo de cliente inválido.", 400);
  }

  const quote = calculateQuote(body.people);
  const company = sanitizeText(body.company, "Cliente Bootcamp IA");
  const nit = sanitizeText(body.nit, "N/A");
  const contactName = sanitizeText(body.contactName, company);
  const contactRole = sanitizeText(body.contactRole);
  const phone = sanitizeText(body.phone);
  const session = resolveSession(body.sessionId);
  const city = sanitizeText(body.city, session.city);
  const redirectUrl =
    env.BOOTCAMP_PAYMENT_REDIRECT_URL ||
    (options.origin ? `${options.origin}/bootcamp-ia?payment=return#cotizador` : undefined);
  const paymentApiBaseUrl = (
    env.I365_PAYMENT_API_URL || DEFAULT_PAYMENT_API_URL
  ).replace(/\/$/, "");

  const paymentResponse = await fetch(`${paymentApiBaseUrl}/api/crear-pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      precio_centavos: quote.amountInCents,
      email,
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
        subtotal: quote.subtotal,
        descuento: quote.discountValue,
        total: quote.total,
      },
      redirect_url: redirectUrl,
    }),
  });

  const payload = await paymentResponse.json().catch(() => ({}));

  if (!paymentResponse.ok || payload?.ok === false) {
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
    datos_widget: payload.datos_widget,
  };
}
