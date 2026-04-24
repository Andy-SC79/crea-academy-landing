const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM_EMAIL = "Ingeniería 365 <cotizaciones@ingenieria365.com>";
const INTERNAL_RECIPIENTS = [
  "jeisonperez@ingenieria365.com",
  "eliza@ingenieria365.com",
];

export class QuoteEmailError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "QuoteEmailError";
    this.status = status;
    this.details = details;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getRequestBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

function money(value) {
  return Number(value || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function buildTextSummary(quote = {}) {
  const company = quote.company || "Empresa sin registrar";
  const nit = quote.nit || "N/A";
  const contactName = quote.contactName || "N/A";
  const contactRole = quote.contactRole || "N/A";
  const phone = quote.phone || "N/A";
  const city = quote.city || "N/A";
  const sessionDate = quote.sessionDate || "N/A";
  const sessionTime = quote.sessionTime || "N/A";
  const sessionVenue = quote.sessionVenue || "N/A";
  const sessionAddress = quote.sessionAddress || "N/A";
  const people = quote.people || 0;
  const total = money(quote.total);

  return [
    "Cotización Bootcamp de Inteligencia Artificial",
    "",
    `Empresa: ${company}`,
    `NIT: ${nit}`,
    `Contacto: ${contactName}`,
    `Rol: ${contactRole}`,
    `Teléfono: ${phone}`,
    `Fecha bootcamp: ${sessionDate}`,
    `Horario: ${sessionTime}`,
    `Lugar: ${sessionVenue}`,
    `Dirección: ${sessionAddress}`,
    `Ciudad de cotización: ${city}`,
    `Participantes: ${people}`,
    `Total estimado: ${total}`,
    "",
    "Proveedor: Ingeniería 365",
    "NIT: 901290421-9",
    "Contactos: Jeison Pérez (CEO) y Elizabeth Navarrete (Co-CEO)",
  ].join("\n");
}

export async function sendQuoteEmail(body, env = process.env) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    throw new QuoteEmailError("RESEND_API_KEY no está configurada.", 503);
  }

  const { to, html, quote } = body || {};

  if (!to || !isValidEmail(to)) {
    throw new QuoteEmailError("Correo de destino inválido.", 400);
  }

  if (!html || typeof html !== "string") {
    throw new QuoteEmailError("HTML de cotización inválido.", 400);
  }

  const company = quote?.company || "empresa";
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
      to: [to],
      cc: INTERNAL_RECIPIENTS,
      reply_to: "jeisonperez@ingenieria365.com",
      subject: `Cotización Bootcamp de IA - ${company}`,
      html,
      text: buildTextSummary(quote),
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new QuoteEmailError("Resend no pudo enviar la cotización.", response.status, payload);
  }

  return { ok: true, id: payload.id };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  try {
    const payload = await sendQuoteEmail(getRequestBody(req), process.env);
    return res.status(200).json(payload);
  } catch (error) {
    if (error instanceof QuoteEmailError) {
      return res.status(error.status).json({
        error: error.message,
        details: error.details,
      });
    }

    return res.status(500).json({
      error: "No se pudo procesar la cotización.",
      details: error instanceof Error ? error.message : "Error desconocido.",
    });
  }
}
