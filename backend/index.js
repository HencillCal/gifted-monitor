const config = require("./config");
const app = require("./lib/server");
const { initDB } = require("./lib/db");
const { startPingEngine } = require("./lib/ping");

let server;

function shutdown(signal) {
  console.log(`\n🛑 Stopping... (${signal})`);
  if (server) {
    server.close(() => {
      console.log("✅ Server closed.");
      process.exit(0);
    });
    // Force-kill after 8s if connections keep it open
    setTimeout(() => { console.warn("⚠️  Force shutdown after timeout"); process.exit(0); }, 8000).unref();
  } else {
    process.exit(0);
  }
}

process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

async function start() {
  await initDB();
  server = app.listen(config.PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Gifted Monitor API live on port ${config.PORT}`);
    console.log(`🔁 Ping check every ${config.PING_CHECK_INTERVAL_SECS}s`);
    console.log(`📌 Min ping interval: ${config.MIN_PING_INTERVAL_MINS} mins\n`);
    startPingEngine();
  });
}

start().catch((err) => {
  console.error("❌ Startup failed:", err.message);
  process.exit(1);
});
