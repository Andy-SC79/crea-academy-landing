import { getBootcampQuote, PaymentError } from "./bootcamp-payment-core.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  try {
    const body = parseBody(req);
    const quote = await getBootcampQuote(body.people, { env: process.env });

    return res.status(200).json({ ok: true, quote });
  } catch (error) {
    if (error instanceof PaymentError) {
      return res.status(error.status).json({
        error: error.message,
        details: error.details,
      });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : "No se pudo calcular la cotización.",
    });
  }
}
