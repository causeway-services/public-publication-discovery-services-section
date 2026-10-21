import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assertObservation } from "../src/observation.mjs";
import { summarizeObservedPanel } from "../src/analyze-observations.mjs";
import { locationContextKey } from "../src/location-context.mjs";

const panel=JSON.parse(readFileSync(new URL("../content/query-sets/northland-ai-visibility-qa.json",import.meta.url),"utf8"));
const rows=readFileSync(new URL("../content/observations/2026-10-21-northland-public-search.jsonl",import.meta.url),"utf8")
  .trim().split(/\r?\n/u).map(line=>assertObservation(JSON.parse(line)));

test("Duluth private QA receives two real geo-qualified public search samples, not a launch",()=>{
  assert.equal(panel.study.phase,"private-mock-client-qa");
  assert.equal(rows.length,2);
  assert.deepEqual(new Set(rows.map(r=>r.query)),
    new Set(["GEO services in Duluth MN","AI search consultant Duluth MN"]));
  assert.ok(rows.every(r=>r.observedAt.startsWith("2026-10-21T")));
  assert.ok(rows.every(r=>r.locationContext?.place.address.addressRegion==="US-MN"));
  assert.ok(rows.every(r=>r.locationContext?.mechanism==="query-text"));
  assert.equal(new Set(rows.map(r=>locationContextKey(r.locationContext))).size,1);
});

test("real sampled search snippets do not masquerade as answer-model retrieval, citation or conversion",()=>{
  for(const row of rows){
    assert.equal(row.surface,"ChatGPT Web public search (fast)");
    assert.equal(row.surfaceMode,"search");
    assert.equal(row.locale,"und");
    assert.equal(row.retrieved,null);
    assert.equal(row.cited,false);
    assert.equal(row.mentioned,false);
    assert.equal(row.referralObserved,null);
    assert.equal(row.conversionObserved,null);
    assert.ok(row.evidence.some(e=>e.kind==="url"&&e.value.startsWith("https://")));
    assert.match(row.notes,/not a generative-answer citation sample/u);
  }
});

test("GEO/GIS lexical collision retained as a market finding, not an index exclusion",()=>{
  const geo=rows.find(r=>r.query==="GEO services in Duluth MN");
  assert.ok(geo.evidence.some(e=>e.value==="https://www.tdsmn.com/"));
  assert.ok(geo.evidence.some(e=>e.value==="https://axiomai.uk/locations/duluth-us/"));
  assert.ok(geo.evidence.some(e=>e.kind==="note"&&e.value.includes("GIS/surveying")));
});

test("only sampled Duluth questions count; Georgia, Superior and near-me controls remain unobserved",()=>{
  const report=summarizeObservedPanel(panel,rows);
  assert.equal(report.totalObserved,2);
  assert.equal(report.observedDistinctQueries,2);
  assert.equal(report.expectedDistinctQueries,9);
  assert.equal(report.missingQueryContexts.length,7);
  assert.equal(report.outOfScopeLocationSamples,0);
  assert.equal(report.groups.length,1);
  assert.equal(report.groups[0].retrievalUnknown,2);
  assert.equal(report.groups[0].locationContext.place.address.addressRegion,"US-MN");
  assert.ok(report.missingQueryContexts.some(q=>q.locationContext?.place.address.addressRegion==="US-GA"));
  assert.ok(report.missingQueryContexts.some(q=>q.locationContext?.place.address.addressRegion==="US-WI"));
  assert.ok(report.missingQueryContexts.some(q=>q.query==="SEO audit near me"));
});
