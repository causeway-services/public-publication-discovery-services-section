import { LAYERS } from "./audit-publication.mjs";
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
const MAX_BYTES = 65536;
const named = (x,max=1000) => typeof x === "string" && x.trim().length>0 && x.length<=max;
const normal = (x) => x && typeof x === "object" && !Array.isArray(x);
const keysOnly = (value, allowed) => normal(value) &&
  Object.keys(value).every(k => allowed.includes(k));
const MANIFEST_KEYS = ["id","authority","canonicalEntityName","canonicalEntityUrl",
  "entityType","publisherOrOwner","surfaces","capabilities"];
const PANEL_KEYS = ["publication","version","queries"];
const QUESTION_KEYS = ["query","intent","topic","expected","role","locationContext"];
const OBSERVED_KEYS = ["publication","surface","surfaceMode","locale","query","intent",
  "observedAt","topic","entityResolution","retrieved","mentioned","cited",
  "factuality","freshness","prominence","citationUrls","evidence","locationContext"];
const SOURCE_KEYS = ["manifest","panel","observations"];
const CAPABILITIES = new Set(Object.values(LAYERS).flatMap(layer =>
  [...layer.required,...layer.recommended]));
const PRIVATE_QUERY_FIELD = /(?:^|[-_])(token|api[-_]?key|secret|password|session|auth|signature|jwt|access[-_]?key)(?:$|[-_])/iu;

/** Source links are pointers for an already supplied public snapshot, NEVER fetched. */
function publicUrl(text) {
  if(!named(text,2048))return false;
  let url;
  try {url=new URL(text);} catch {return false;}
  const host=url.hostname.toLowerCase();
  if(url.protocol!=="https:" || url.username || url.password || url.hash ||
      !host.includes(".") || host==="localhost" ||
      host.endsWith(".localhost") || host.endsWith(".local") ||
      host.endsWith(".lan") || host.endsWith(".internal") ||
      /^\d+\.\d+\.\d+\.\d+$/u.test(host) || host.includes(":") ||
      [...url.searchParams.keys()].some(key => PRIVATE_QUERY_FIELD.test(key)))return false;
  return true;
}

function publicLocation(value) {
  if (value === undefined || value === null) return true;
  return keysOnly(value,["place","mechanism"]) &&
    keysOnly(value.place,["@type","address"]) &&
    keysOnly(value.place.address,["@type","addressCountry","addressRegion","addressLocality"]);
}

/** Reject private/customer-only source fields rather than trusting a label. */
function publicOnlyShape(request) {
  if(!keysOnly(request,["manifest","panel","observations","sources","dataClassification"]) ||
      request.dataClassification!=="public-only" ||
      !keysOnly(request.manifest,MANIFEST_KEYS) ||
      !named(request.manifest.id,150) ||
      !publicUrl(request.manifest.canonicalEntityUrl) ||
      !keysOnly(request.manifest.capabilities??{},[...CAPABILITIES]) ||
      Object.values(request.manifest.capabilities??{}).some(v =>
        v!==true && v!==false && v!=="unknown") ||
      (request.manifest.surfaces!==undefined &&
        (!Array.isArray(request.manifest.surfaces) ||
          request.manifest.surfaces.length>20 ||
          !request.manifest.surfaces.every(publicUrl))) ||
      !keysOnly(request.panel,PANEL_KEYS) ||
      !named(request.panel.publication,150) ||
      !Array.isArray(request.panel.queries) || request.panel.queries.length<1 ||
      request.panel.queries.length>32 ||
      !request.panel.queries.every(q => keysOnly(q,QUESTION_KEYS) &&
        named(q.query,500) && named(q.intent,100) && named(q.topic,100) &&
        (q.expected===undefined || named(q.expected,700)) &&
        publicLocation(q.locationContext)) ||
      !Array.isArray(request.observations) ||
      request.observations.length>128 ||
      !request.observations.every(o => keysOnly(o,OBSERVED_KEYS) &&
        Array.isArray(o.evidence) && o.evidence.length>0 &&
        o.evidence.length<=20 && publicLocation(o.locationContext) &&
        o.evidence.every(e=>keysOnly(e,["kind","value"]) &&
          ["url","citation"].includes(e.kind) && publicUrl(e.value)) &&
        (o.citationUrls===undefined || (Array.isArray(o.citationUrls) &&
          o.citationUrls.length<=20 && o.citationUrls.every(publicUrl)))) ||
      !keysOnly(request.sources,SOURCE_KEYS) ||
      !SOURCE_KEYS.every(key => publicUrl(request.sources[key])))
    throw new TypeError("x402 discovery requires one bounded public-only manifest, panel, observations and HTTPS sources; private/extra input fields refuse");
}

/** Refuse malformed or wrongly classified public-only requests before 402. */
export function admitPaidDiscoveryReport(request) {
  publicOnlyShape(request);
  let json;
  try { json = JSON.stringify(request); } catch {
    throw new TypeError("x402 discovery accepts a JSON request");
  }
  if (typeof json !== "string" || new TextEncoder().encode(json).byteLength > MAX_BYTES)
    throw new RangeError("x402 discovery JSON exceeds the 65536-byte public-only limit");
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
