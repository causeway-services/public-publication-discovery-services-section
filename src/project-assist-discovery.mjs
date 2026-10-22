#!/usr/bin/env node
/**
 * Source-owned, read-only Publication Discovery reading for ASSIST consumers.
 *
 * This module projects the original seven-layer declaration audit and the
 * original witnessed answer-observation ledger. It is not a second crawler,
 * visibility score, provider connector, campaign executor, or authorization
 * source. The original publisher/customer controls every later intervention.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { auditPublication } from "./audit-publication.mjs";
import { summarizeObservedPanel } from "./analyze-observations.mjs";

const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
const SOURCE_NAMES = ["manifest", "panel", "observations"];

/**
 * Produce one evidence-preserving machine reading for an authorized ASSIST
 * consumer. Passing paths asserts only where inputs came from, not whether a
 * deployed site or search provider was contacted during this invocation.
 */
export function projectAssistDiscovery({ manifest, panel, observations, sources } = {}) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest) ||
      !nonempty(manifest.id) || !nonempty(panel?.publication) ||
      manifest.id !== panel.publication) {
    throw new TypeError("ASSIST discovery requires a manifest and query panel for the same named publication");
  }
  if (!sources || typeof sources !== "object" || Array.isArray(sources) ||
      SOURCE_NAMES.some((name) => !nonempty(sources[name]))) {
    throw new TypeError("ASSIST discovery requires manifest, panel and observations source locations");
  }

  const declaredAudit = auditPublication(manifest);
  const observedPanel = summarizeObservedPanel(panel, observations);
  const verificationQueue = Object.entries(declaredAudit.layers).flatMap(([layer, result]) =>
    [
      ...result.missingRequired.map((capability) => Object.freeze({
        kind: "verify-declared-capability",
        layer,
        capability,
        priorityClass: "required",
        basis: "publication-manifest-declaration",
        source: sources.manifest,
      })),
      ...result.missingRecommended.map((capability) => Object.freeze({
        kind: "verify-declared-capability",
        layer,
        capability,
        priorityClass: "recommended",
        basis: "publication-manifest-declaration",
        source: sources.manifest,
      })),
    ]
  );

  return Object.freeze({
    kind: "assist.publication-discovery-reading/v1",
    publication: manifest.id,
    canonicalEntityUrl: nonempty(manifest.canonicalEntityUrl) ? manifest.canonicalEntityUrl : null,
    sources: Object.freeze({
      manifest: sources.manifest,
      panel: sources.panel,
      observations: sources.observations,
    }),
    declaredAudit,
    observedPanel,
    verificationQueue: Object.freeze(verificationQueue),
    // These are instructions proposed by the publication's original owner,
    // not commands, authorization, or proof that the fixes are appropriate now.
    originalOwnerNextActions: Object.freeze([...(declaredAudit.nextActions ?? [])]),
    independentReceiving: Object.freeze({
      liveCrawl: "not-assessed",
      siteRelease: "not-assessed",
      ownerApproval: "not-assessed",
      providerAccountAccess: "not-assessed",
      customerMandate: "not-assessed",
      paidCampaign: "not-assessed",
      customerReferralsAndConversions: "not-assessed",
    }),
    qualifications: Object.freeze([
      "The publication audit reads declared capabilities, not an independent HTTP crawl of the live property.",
      "The answer panel contains only actual accepted observations; a missing prompt or location is unmeasured, not a failure.",
      "A citation, a provider retrieval, a site visit, a customer relationship, and a payment are distinct events.",
      "The verification queue proposes checks from source declarations; it confers no publisher, provider, tenant or spending authority.",
      "ASSIST must obtain original owner authorization and separately witnessed receiving before any content, campaign or payment mutation.",
    ]),
  });
}

function jsonl(path) {
  return readFileSync(path, "utf8").split(/\r?\n/u).filter((line) => line.trim() !== "").map((line, index) => {
    try { return JSON.parse(line); }
    catch (error) { throw new TypeError("invalid observations line " + (index + 1) + ": " + error.message); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [manifestPath, panelPath, observationsPath, extra] = process.argv.slice(2);
    if (!manifestPath || !panelPath || !observationsPath || extra) {
      throw new TypeError("usage: node src/project-assist-discovery.mjs <manifest.json> <query-panel.json> <observations.jsonl>");
    }
    const reading = projectAssistDiscovery({
      manifest: JSON.parse(readFileSync(manifestPath, "utf8")),
      panel: JSON.parse(readFileSync(panelPath, "utf8")),
      observations: jsonl(observationsPath),
      sources: { manifest: manifestPath, panel: panelPath, observations: observationsPath },
    });
    process.stdout.write(JSON.stringify(reading, null, 2) + "\n");
  } catch (error) {
    process.stderr.write((error instanceof Error ? error.message : String(error)) + "\n");
    process.exitCode = 2;
  }
}
