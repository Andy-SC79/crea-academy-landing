import { createBootcampPayment, PaymentError } from "./bootcamp-payment-core.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

function resolveOrigin(req) {
  const host = req.headers.host;
  if (!host) return "";
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  try {
    const payload = await createBootcampPayment(parseBody(req), {
      origin: resolveOrigin(req),
      env: process.env,
    });

    return res.status(200).json(payload);
  } catch (error) {
    if (error instanceof PaymentError) {
      return res.status(error.status).json({
        error: error.message,
        details: error.details,
      });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : "No se pudo crear el pago.",
    });
  }
}
