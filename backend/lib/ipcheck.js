"use strict";

const https = require("https");
const http  = require("http");

/**
 * Extract the real client IP from a request, respecting common proxy headers.
 * @param {import("express").Request} req
 * @returns {string|null}
 */
function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first) return first;
  }
  return (
    req.headers["x-real-ip"] ||
    req.headers["cf-connecting-ip"] ||
    req.socket?.remoteAddress ||
    null
  );
}

/**
 * Check whether an IP is a VPN / proxy / datacenter / Tor exit node.
 * Uses ip-api.com (free tier — 45 req/min, no key needed).
 *
 * @param {string} ip
 * @returns {Promise<{ blocked: boolean, reason?: string, raw?: object }>}
 */
function checkIpReputation(ip) {
  return new Promise((resolve, reject) => {
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return resolve({ blocked: false });
    }

    const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,proxy,hosting,query,isp,org`;
    const mod = url.startsWith("https") ? https : http;

    const req = mod.get(url, { timeout: 5000 }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try {
          const data = JSON.parse(body);
          if (data.status !== "success") return resolve({ blocked: false });
          if (data.proxy || data.hosting) {
            return resolve({
              blocked: true,
              reason: "Registrations from VPN, proxy, or datacenter IPs are not allowed.",
              raw: data,
            });
          }
          resolve({ blocked: false, raw: data });
        } catch (e) {
          resolve({ blocked: false });
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("ipcheck timeout")); });
  });
}

module.exports = { getClientIp, checkIpReputation };
