import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { createBootcampPayment, PaymentError } from "./api/bootcamp-payment-core.js";
import { QuoteEmailError, sendQuoteEmail } from "./api/send-quote.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distRoot = resolve(__dirname, "dist");
const port = Number(process.env.PORT || 8080);
const JSON_LIMIT_BYTES = 1_000_000;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function getOrigin(req) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return host ? `${protocol}://${host}` : undefined;
}

function assertSafePath(filePath) {
  if (filePath !== distRoot && !filePath.startsWith(`${distRoot}${sep}`)) {
    const error = new Error("Ruta no permitida.");
    error.statusCode = 403;
    throw error;
  }
}

async function readJsonBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let rawBody = "";

    req.on("data", (chunk) => {
      rawBody += chunk;

      if (Buffer.byteLength(rawBody) > JSON_LIMIT_BYTES) {
        req.destroy(new Error("El cuerpo de la solicitud es demasiado grande."));
      }
    });

    req.on("end", () => {
      if (!rawBody) {
        resolveBody({});
        return;
      }

      try {
        resolveBody(JSON.parse(rawBody));
      } catch {
        rejectBody(new Error("JSON inválido."));
      }
    });

    req.on("error", rejectBody);
  });
}

async function sendStaticFile(res, filePath) {
  assertSafePath(filePath);
  const file = await readFile(filePath);
  const contentType = contentTypes[extname(filePath)] || "application/octet-stream";

  res.statusCode = 200;
  res.setHeader("Content-Type", contentType);
  res.end(file);
}

async function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const requestedPath = resolve(distRoot, `.${pathname}`);
  assertSafePath(requestedPath);

  try {
    const fileStat = await stat(requestedPath);
    const filePath = fileStat.isDirectory() ? resolve(requestedPath, "index.html") : requestedPath;
    await sendStaticFile(res, filePath);
  } catch (error) {
    if (!extname(pathname)) {
      await sendStaticFile(res, resolve(distRoot, "index.html"));
      return;
    }

    res.statusCode = error?.statusCode || 404;
    res.end(res.statusCode === 403 ? "Forbidden" : "Not found");
  }
}

async function handleBootcampPayment(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Método no permitido." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const payload = await createBootcampPayment(body, {
      env: process.env,
      origin: getOrigin(req),
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
}

async function handleQuoteEmail(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Método no permitido." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const payload = await sendQuoteEmail(body, process.env);
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
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");

  try {
    if (url.pathname === "/api/create-bootcamp-payment") {
      await handleBootcampPayment(req, res);
      return;
    }

    if (url.pathname === "/api/send-quote") {
      await handleQuoteEmail(req, res);
      return;
    }

    await serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, error?.statusCode || 500, {
      error: error instanceof Error ? error.message : "Error inesperado.",
    });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Crea Academy server listening on ${port}`);
});
