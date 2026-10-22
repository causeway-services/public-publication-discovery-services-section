import { projectAssistDiscovery } from "./project-assist-discovery.mjs";

/**
 * One bounded original Publication Discovery computation, suitable for the
 * existing Networking x402 compute/validate binding. It consumes provided
 * source-declared public data ONLY. Neither operation crawls, scrapes private
 * Search Console/Bing accounts, promises ranking lift, nor transfers a wallet.
 *
 * This package owns the computation; the original merchant owns price,
 * payment, HTTP, buyer receiving, refunds, and any live sale authorization.
 */
const HTTPS = /^https:\/\/[^\s]+$/u;
const MAX_BYTES = 65536;

const text = (x, max = 1000) => typeof x === "string" && x.trim().length > 0 && x.length <= max;
const publicUrl = (s) => text(s, 2048) && HTTPS.test(s);
const normal = (a) => a && typeof a === "object" && !Array.isArray(a);

/** Refuse malformed or wrongly classified public-only requests before 402. */
export function admitPaidDiscoveryReport(request) {
  if (!normal(request) || Object.keys(request).some(k =>
    !["manifest","panel","observations","sources","dataClassification"].includes(k)) ||
    request.dataClassification !== "public-only" ||
    !normal(request.manifest) || !normal(request.panel) ||
    !Array.isArray(request.panel.queries) || request.panel.queries.length < 1 ||
    request.panel.queries.length > 32 ||
    !Array.isArray(request.observations) || request.observations.length > 128 ||
    !normal(request.sources) ||
    ["manifest","panel","observations"].some(k => !publicUrl(request.sources[k]))) {
    throw new TypeError("x402 discovery accepts one bounded, explicitly public manifest, query panel, observations and HTTPS source references");
  }
  let json;
  try { json = JSON.stringify(request); } catch {
    throw new TypeError("x402 discovery accepts a JSON request");
  }
  if (typeof json !== "string" || new TextEncoder().encode(json).byteLength > MAX_BYTES)
    throw new RangeError("x402 discovery JSON exceeds the 65536-byte public-only limit");
  // Never invite private raw answer-platform account exports or screenshots
  // into this public x402 product. Its older internal machinery still admits
  // those evidence kinds under independently governed private processing.
  for (const row of request.observations) {
    if (!Array.isArray(row?.evidence) || row.evidence.some(e =>
      !["url","citation"].includes(e?.kind) || !publicUrl(e.value)) ||
      (row.citationUrls !== undefined && (!Array.isArray(row.citationUrls) ||
        row.citationUrls.some(value => !publicUrl(value))))) {
      throw new TypeError("public x402 discovery observations require only public HTTPS URL/citation evidence");
    }
  }
  // The owning original reader validates the full seven-layer declaration,
  // each observation's type, query/location identity and duplicate readings.
  projectAssistDiscovery({
    manifest: request.manifest, panel: request.panel,
    observations: request.observations, sources: request.sources,
  });
  return true;
}

/** Reuse the exact same original source-owned service across x402, ASSIST and MetroPlat. */
export function computePaidDiscoveryReport(request) {
  admitPaidDiscoveryReport(request);
  const reading = projectAssistDiscovery({
    manifest: request.manifest, panel: request.panel,
    observations: request.observations, sources: request.sources,
  });
  return Object.freeze({
    ...reading,
    inputClass: "caller-declared-public-data",
    independentSourceVerification: "not-performed",
    x402Payment: "handled-only-by-original-market",
    // A 200 reading is a computation, not a verified search-engine position.
    customerSearchOutcome: "not-assessed",
  });
}
