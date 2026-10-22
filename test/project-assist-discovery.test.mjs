import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { projectAssistDiscovery } from "../src/project-assist-discovery.mjs";

const sourcePaths = Object.freeze({
  manifest: "content/publications/561-group.json",
  panel: "content/query-sets/561-group.json",
  observations: "content/observations/2026-10-03-public-search-baseline.jsonl",
});
const json = (path) => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const observations = () => readFileSync(new URL("../" + sourcePaths.observations, import.meta.url), "utf8")
  .split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line));
const baseline = () => ({
  manifest: json(sourcePaths.manifest),
  panel: json(sourcePaths.panel),
  observations: observations(),
  sources: sourcePaths,
});

test("projects real corporate baseline without pretending to measure unobserved queries", () => {
  const reading = projectAssistDiscovery(baseline());
  assert.equal(reading.kind, "assist.publication-discovery-reading/v1");
  assert.equal(reading.publication, "561-group-corporate");
  assert.equal(reading.canonicalEntityUrl, "https://561.group/");
  assert.equal(reading.observedPanel.totalObserved, 1);
  assert.equal(reading.observedPanel.expectedDistinctQueries, 16);
  assert.equal(reading.observedPanel.observedDistinctQueries, 1);
  assert.equal(reading.observedPanel.missingQueryContexts.length, 15);
  assert.ok(reading.declaredAudit.layers.crawl);
  assert.ok(reading.declaredAudit.layers.measurement);
  assert.ok(reading.verificationQueue.some((item) => item.layer === "crawl" &&
    item.kind === "verify-declared-capability" && item.source === sourcePaths.manifest));
  assert.ok(reading.originalOwnerNextActions.length > 0);
  assert.equal(reading.independentReceiving.customerReferralsAndConversions, "not-assessed");
  assert.equal(reading.independentReceiving.paidCampaign, "not-assessed");
  assert.ok(reading.qualifications.some((line) => line.includes("not an independent HTTP crawl")));
});

test("zero witnessed results stay missing rather than becoming false failures", () => {
  const reading = projectAssistDiscovery({ ...baseline(), observations: [] });
  assert.equal(reading.observedPanel.totalObserved, 0);
  assert.equal(reading.observedPanel.observedDistinctQueries, 0);
  assert.equal(reading.observedPanel.missingQueryContexts.length, 16);
  assert.deepEqual(reading.observedPanel.groups, []);
  assert.equal(reading.independentReceiving.liveCrawl, "not-assessed");
});

test("the source and publication boundaries fail closed", () => {
  const actual = baseline();
  assert.throws(() => projectAssistDiscovery({
    ...actual, manifest: { ...actual.manifest, id: "another-enterprise" },
  }), /same named publication/u);
  assert.throws(() => projectAssistDiscovery({ ...actual, sources: {} }), /source locations/u);
  assert.throws(() => projectAssistDiscovery({ ...actual, observations: [{ fabricated: true }] }),
    /must be a non-empty string/u);
});
