import { getCurrentTrm, PaymentError } from "./bootcamp-payment-core.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Metodo no permitido." });
  }

  try {
    const trm = await getCurrentTrm({ env: process.env });
    return res.status(200).json({ ok: true, trm });
  } catch (error) {
    if (error instanceof PaymentError) {
      return res.status(error.status).json({
        error: error.message,
        details: error.details,
      });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : "No se pudo consultar la TRM.",
    });
  }
}
