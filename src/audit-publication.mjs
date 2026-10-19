import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import discoveryContract from "../content/standards/publication-discovery-contract.json" with { type: "json" };

// Executable layer selection consumes the existing canonical typed contract;
// individual capabilities must not be maintained as a second handwritten list.
export const LAYERS = Object.freeze(Object.fromEntries(
  Object.entries(discoveryContract.layers).map(([name, layer]) => [
    name, Object.freeze({
      required: Object.freeze([...layer.required]),
      recommended: Object.freeze([...layer.recommended]),
    }),
  ])
));

const present = (value) => value === true || (typeof value === "string" && !["", "false", "none", "unknown"].includes(value.toLowerCase()));

function lookup(manifest, key) {
  if (key in manifest) return manifest[key];
  return manifest.capabilities?.[key];
}

export function auditPublication(manifest) {
  if (!manifest || typeof manifest !== "object") throw new TypeError("publication manifest required");
  const layers = {};
  for (const [layer, contract] of Object.entries(LAYERS)) {
    const missingRequired = contract.required.filter((key) => !present(lookup(manifest,key)));
    const missingRecommended = contract.recommended.filter((key) => !present(lookup(manifest,key)));
    layers[layer] = Object.freeze({
      status: missingRequired.length ? "blocked" : (missingRecommended.length ? "operable-with-residuals" : "settled"),
      missingRequired:Object.freeze(missingRequired),
      missingRecommended:Object.freeze(missingRecommended),
    });
  }
  const blockedLayers=Object.entries(layers).filter(([,v])=>v.status==="blocked").map(([k])=>k);
  return Object.freeze({
    publication:manifest.id,
    authority:manifest.authority,
    disposition:blockedLayers.length ? "remediation-required" : "operable",
    blockedLayers:Object.freeze(blockedLayers),
    layers:Object.freeze(layers),
    nextActions:Object.freeze(manifest.nextActions ?? []),
  });
}

export function auditFile(path) {
  return auditPublication(JSON.parse(readFileSync(path,"utf8")));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path=process.argv[2];
  if (!path) {
    process.stderr.write("usage: node src/audit-publication.mjs <manifest.json>\n");
    process.exitCode=2;
  } else {
    process.stdout.write(JSON.stringify(auditFile(path),null,2)+"\n");
  }
}
