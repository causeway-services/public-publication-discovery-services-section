import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const LAYERS = Object.freeze({
  crawl: Object.freeze({
    required: ["publicHome","canonicalUrls","robots","sitemap"],
    recommended: ["indexingConsole","freshnessNotification"],
  }),
  entity: Object.freeze({
    required: ["canonicalEntityName","canonicalEntityUrl","entityType","publisherOrOwner"],
    recommended: ["structuredEntity","authorEntities","sameAsEvidence","crossPropertyRelations"],
  }),
  content: Object.freeze({
    required: ["descriptiveTitles","descriptions","semanticHeadings","stablePublicUrls"],
    recommended: ["articleOrProductSemantics","publishedModifiedDates","sectionsTopics","preferredImages"],
  }),
  evidence: Object.freeze({
    required: ["claimSourceBoundary"],
    recommended: ["citations","correctionPolicy","provenance","originalDataOrExperience"],
  }),
  distribution: Object.freeze({
    required: [],
    recommended: ["rssOrAtom","jsonFeed","topicGraph","structuredSyndication","socialMetadata"],
  }),
  retrieval: Object.freeze({
    required: ["querySet"],
    recommended: ["intentSet","topicSet","entityDisambiguationQueries","comparativeQueries"],
  }),
  measurement: Object.freeze({
    required: ["observationLedger"],
    recommended: ["searchConsole","bingWebmaster","bingAiPerformance","citationObservations","referralAnalytics","conversionObservations"],
  }),
});

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
