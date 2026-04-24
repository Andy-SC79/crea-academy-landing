const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM_EMAIL = "Ingeniería 365 <cotizaciones@ingenieria365.com>";
const INTERNAL_RECIPIENTS = [
  "jeisonperez@ingenieria365.com",
  "eliza@ingenieria365.com",
];

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
    `Ciudad: ${city}`,
    `Participantes: ${people}`,
    `Total estimado: ${total}`,
    "",
    "Proveedor: Ingeniería 365",
    "NIT: 901290421-9",
    "Contactos: Jeison Pérez (CEO) y Elizabeth Navarrete (Co-CEO)",
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "RESEND_API_KEY no está configurada." });
  }

  try {
    const { to, html, quote } = getRequestBody(req);

    if (!to || !isValidEmail(to)) {
      return res.status(400).json({ error: "Correo de destino inválido." });
    }

    if (!html || typeof html !== "string") {
      return res.status(400).json({ error: "HTML de cotización inválido." });
    }

    const company = quote?.company || "empresa";
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
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
      return res.status(response.status).json({
        error: "Resend no pudo enviar la cotización.",
        details: payload,
      });
    }

    return res.status(200).json({ ok: true, id: payload.id });
  } catch (error) {
    return res.status(500).json({
      error: "No se pudo procesar la cotización.",
      details: error instanceof Error ? error.message : "Error desconocido.",
    });
  }
}
