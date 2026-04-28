const path = require("path");
const fs = require("fs");
const express = require("express");
const helmet = require("helmet");
const config = require("../config");

const app = express();
app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// ─── CORS ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = config.ALLOWED_ORIGINS;

  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (!origin) {
    // same-origin / server-to-server — allow through
  } else if (config.NODE_ENV !== "production") {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    return res.status(403).json({ error: "Origin not allowed" });
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Expose-Headers", "x-refresh-token");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ─── Body Parser ─────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));

// ─── API Routes ──────────────────────────────────────────────────────
app.use("/api", require("../routes"));

// ─── Static Frontend (production / built mode) ────────────────────────
const distPath = path.join(__dirname, "../../frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { maxAge: "1h" }));
  // SPA fallback — serve index.html for all non-API client routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Development mode — health check only
  app.get("/", (req, res) => {
    res.json({ service: "Gifted Monitor API", status: "running", uptime: Math.floor(process.uptime()) });
  });
  app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
  });
}

module.exports = app;
