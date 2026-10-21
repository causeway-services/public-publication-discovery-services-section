import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileQueryPanel } from "../src/query-panel.mjs";
import { assertObservation } from "../src/observation.mjs";
import { summarizeObservedPanel } from "../src/analyze-observations.mjs";
import { checkedQueryLocation, locationContextKey } from "../src/location-context.mjs";

const northland = JSON.parse(readFileSync(new URL("../content/query-sets/northland-ai-visibility-qa.json", import.meta.url), "utf8"));
const nearMe = northland.queries.filter((query) => query.query === "SEO audit near me");
const location = (locality, region, mechanism = "provider-setting") => ({
  place: {
    "@type": "Place",
    address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: region, addressLocality: locality }
  },
  mechanism
});

function recorded(request, locationContext = request.locationContext) {
  return {
    publication: northland.publication,
    query: request.query,
    intent: request.intent,
    surface: "Example Search Fixture",
    surfaceMode: "search",
    locale: "en-US",
    observedAt: "2026-10-21T16:00:00Z",
    locationContext,
    entityResolution: "unknown",
    retrieved: null,
    mentioned: false,
    cited: false,
    factuality: "not-applicable",
    evidence: [{ kind: "note", value: "TEST FIXTURE ONLY: no external answer observation" }]
  };
}

test("Northland query requests preserve typed locations but never claim actual answers", () => {
  const requests = compileQueryPanel(northland, { surfaces: ["Bing Search", "ChatGPT Search"], runs: 2 });
  assert.equal(requests.length, northland.queries.length * 4);
  assert.equal(requests.filter((request) => request.query === "SEO audit near me").length, 8);
  assert.ok(requests.some((request) => request.locationContext?.place.address.addressRegion === "US-WI"));
  assert.ok(requests.some((request) => request.locationContext?.place.address.addressRegion === "US-GA"));
  for (const request of requests) {
    assert.equal(request.kind, "observation-request");
    assert.equal("cited" in request, false);
    assert.equal("observedAt" in request, false);
    assert.equal("ranking" in request, false);
  }
});

test("same near-me text at two places stays two distinct question identities", () => {
  assert.equal(nearMe.length, 2);
  assert.notEqual(locationContextKey(nearMe[0].locationContext), locationContextKey(nearMe[1].locationContext));
  const localPanel = {
    publication: northland.publication,
    version: northland.version,
    queries: nearMe.map((query) => ({ ...query, role: "unbranded", topic: "same-intent" }))
  };
  assert.equal(compileQueryPanel(localPanel, { surfaces: ["Fixture"] }).length, 2);
  const first = recorded(localPanel.queries[0]);
  const second = recorded(localPanel.queries[1]);
  const report = summarizeObservedPanel(localPanel, [first, second]);
  assert.equal(report.totalObserved, 2);
  assert.equal(report.observedDistinctQueries, 2);
  assert.equal(report.groups.length, 2, "geographically different samples were pooled");
  assert.deepEqual(new Set(report.groups.map((group) => group.locationContext.place.address.addressRegion)),
    new Set(["US-MN", "US-GA"]));
  assert.equal(report.outOfScopeLocationSamples, 0);
  assert.throws(() => summarizeObservedPanel(localPanel, [first, first]), /duplicate observation/u);
});

test("unknown and mismatched locations are missing measurements, not wrong-location negatives", () => {
  const localPanel = { publication: northland.publication, version: northland.version, queries: nearMe };
  const superior = recorded(nearMe[0], location("Superior", "US-WI"));
  const report = summarizeObservedPanel(localPanel, [superior, recorded(nearMe[0])]);
  assert.equal(report.totalObserved, 1);
  assert.equal(report.observedDistinctQueries, 1);
  assert.equal(report.missingQueryContexts.length, 1);
  assert.equal(report.missingQueryContexts[0].locationContext.place.address.addressRegion, "US-GA");
  assert.equal(report.outOfScopeLocationSamples, 1);
  assert.equal(report.groups[0].locationContext.place.address.addressRegion, "US-MN");
});

test("near-me responses without an applied location cannot be asserted", () => {
  const without = { ...nearMe[0] };
  delete without.locationContext;
  assert.throws(() => compileQueryPanel({ publication: northland.publication, version: 1, queries: [without] }, { surfaces: ["Fixture"] }), /near me/u);
  assert.throws(() => assertObservation(recorded(nearMe[0], null)), /near me/u);
  assert.throws(() => checkedQueryLocation("near me", location("Duluth", "US-MN", "query-text")), /near me/u);
});

test("explicit query geography rejects wrong state or missing locality; ISO region codes are enforced", () => {
  const textQuery = northland.queries.find((query) => query.query === "GEO services in Duluth MN");
  assert.ok(textQuery);
  assert.equal(checkedQueryLocation(textQuery.query, textQuery.locationContext).place.address.addressRegion, "US-MN");
  assert.throws(() => checkedQueryLocation(textQuery.query, location("Duluth", "US-GA", "query-text")), /subdivision code/u);
  assert.throws(() => checkedQueryLocation(textQuery.query, location("Superior", "US-MN", "query-text")), /locality/u);
  assert.throws(() => checkedQueryLocation(textQuery.query, location("Duluth", "CA-ON", "query-text")), /subdivision does not belong/u);
  assert.throws(() => checkedQueryLocation(textQuery.query, { ...textQuery.locationContext, place: { ...textQuery.locationContext.place, address: { ...textQuery.locationContext.place.address, addressCountry: "USA" } } }), /ISO country/u);
});

test("historical location-unspecified observations remain compatible", () => {
  const historical = JSON.parse(readFileSync(new URL("../content/observations/2026-10-03-public-search-baseline.jsonl", import.meta.url), "utf8").split("\n")[0]);
  assert.equal(assertObservation(historical).locationContext, undefined);
});
