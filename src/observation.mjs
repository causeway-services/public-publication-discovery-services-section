const ENTITY = new Set(["exact","ambiguous","wrong-entity","missing","unknown"]);
const PROMINENCE = new Set(["primary","prominent","present","incidental","absent","unknown"]);
const FACTUALITY = new Set(["accurate","partly-accurate","materially-wrong","not-applicable","unknown"]);
const FRESHNESS = new Set(["current","stale","not-applicable","unknown"]);
const EVIDENCE_KIND = new Set(["url","citation","screenshot-ref","provider-export-ref","note"]);

function string(value) { return typeof value === "string" && value.trim().length > 0; }
function boolean(value) { return typeof value === "boolean"; }
function iso(value) { return string(value) && Number.isFinite(Date.parse(value)); }

export function observationViolations(value) {
  const errors=[];
  if (!value || typeof value !== "object" || Array.isArray(value)) return ["observation must be an object"];
  for (const key of ["publication","surface","surfaceMode","locale","query","intent"]) {
    if (!string(value[key])) errors.push(`${key} must be a non-empty string`);
  }
  if (!iso(value.observedAt)) errors.push("observedAt must be an ISO/date-time parseable string");
  if (!ENTITY.has(value.entityResolution)) errors.push("entityResolution is invalid");
  for (const key of ["retrieved","mentioned","cited"]) if (!boolean(value[key])) errors.push(`${key} must be boolean`);
  if (value.prominence !== undefined && !PROMINENCE.has(value.prominence)) errors.push("prominence is invalid");
  if (!FACTUALITY.has(value.factuality)) errors.push("factuality is invalid");
  if (value.freshness !== undefined && !FRESHNESS.has(value.freshness)) errors.push("freshness is invalid");
  if (!Array.isArray(value.evidence) || value.evidence.length === 0) errors.push("evidence must contain at least one item");
  else for (const [index,item] of value.evidence.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item) || !EVIDENCE_KIND.has(item.kind) || !string(item.value)) {
      errors.push(`evidence[${index}] must carry a valid kind and non-empty value`);
    }
  }
  if (value.cited === true && (!Array.isArray(value.citationUrls) || value.citationUrls.length === 0)) {
    errors.push("cited=true requires at least one citationUrls entry");
  }
  if (value.mentioned === false && value.cited === true) errors.push("cited=true cannot coexist with mentioned=false");
  if (value.retrieved === false && (value.mentioned === true || value.cited === true)) {
    errors.push("retrieved=false cannot coexist with mentioned/cited=true");
  }
  if (value.entityResolution === "wrong-entity" && value.factuality === "accurate") {
    errors.push("wrong-entity cannot be classified factuality=accurate for the target publication");
  }
  return errors;
}

export function assertObservation(value) {
  const errors=observationViolations(value);
  if (errors.length) throw new TypeError(errors.join("; "));
  return Object.freeze(structuredClone(value));
}
