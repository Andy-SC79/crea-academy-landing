import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import {
  createBootcampPayment,
  getBootcampQuote,
  PaymentError,
} from "./api/bootcamp-payment-core.js";
import { QuoteEmailError, sendQuoteEmail } from "./api/send-quote.js";

function readJsonBody(req: import("node:http").IncomingMessage) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    let rawBody = "";

    req.on("data", (chunk) => {
      rawBody += chunk;
    });

    req.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function sendJson(
  res: import("node:http").ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>,
) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/framer-motion")) return "framer-motion";
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-router-dom/")
            ) {
              return "react-vendor";
            }
            if (
              id.includes("node_modules/i18next/") ||
              id.includes("node_modules/react-i18next/")
            ) {
              return "i18n-vendor";
            }
            if (id.includes("node_modules/lucide-react/")) return "lucide";
          },
        },
      },
    },
    plugins: [
      react(),
      {
        name: "local-bootcamp-apis",
        configureServer(server) {
          server.middlewares.use("/api/bootcamp-pricing", async (req, res) => {
            if (req.method !== "POST") {
              res.setHeader("Allow", "POST");
              sendJson(res, 405, { error: "Método no permitido." });
              return;
            }

            try {
              const body = await readJsonBody(req);
              const quote = await getBootcampQuote(body.people, { env });
              sendJson(res, 200, { ok: true, quote });
            } catch (error) {
              if (error instanceof PaymentError) {
                sendJson(res, error.status, {
                  error: error.message,
                  details: error.details,
                });
                return;
              }

              sendJson(res, 500, {
                error: error instanceof Error ? error.message : "No se pudo calcular la cotización.",
              });
            }
          });

          server.middlewares.use("/api/create-bootcamp-payment", async (req, res) => {
            if (req.method !== "POST") {
              res.setHeader("Allow", "POST");
              sendJson(res, 405, { error: "Método no permitido." });
              return;
            }

            try {
              const body = await readJsonBody(req);
              const protocol = req.headers["x-forwarded-proto"] || "http";
              const host = req.headers.host || "localhost:5173";
              const payload = await createBootcampPayment(body, {
                origin: `${protocol}://${host}`,
                env,
              });

              sendJson(res, 200, payload);
            } catch (error) {
              if (error instanceof PaymentError) {
                sendJson(res, error.status, {
                  error: error.message,
                  details: error.details,
                });
                return;
              }

              sendJson(res, 500, {
                error: error instanceof Error ? error.message : "No se pudo crear el pago.",
              });
            }
          });

          server.middlewares.use("/api/send-quote", async (req, res) => {
            if (req.method !== "POST") {
              res.setHeader("Allow", "POST");
              sendJson(res, 405, { error: "Método no permitido." });
              return;
            }

            try {
              const body = await readJsonBody(req);
              const payload = await sendQuoteEmail(body, env);
              sendJson(res, 200, payload);
            } catch (error) {
              if (error instanceof QuoteEmailError) {
                sendJson(res, error.status, {
                  error: error.message,
                  details: error.details,
                });
                return;
              }

              sendJson(res, 500, {
                error: error instanceof Error ? error.message : "No se pudo enviar la cotización.",
              });
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
