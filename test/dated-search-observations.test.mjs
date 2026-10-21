import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assertObservation } from "../src/observation.mjs";
import { summarizeObservedPanel } from "../src/analyze-observations.mjs";

const rows = readFileSync(new URL("../content/observations/2026-10-21-branded-public-search.jsonl", import.meta.url),"utf8")
  .trim().split(/\r?\n/u).map(line => assertObservation(JSON.parse(line)));
const group = JSON.parse(readFileSync(new URL("../content/query-sets/561-group.json",import.meta.url),"utf8"));
const koios = JSON.parse(readFileSync(new URL("../content/query-sets/koios-news.json",import.meta.url),"utf8"));

test("three actual dated search-result samples retain source URLs, time, query and bounded surface provenance", () => {
  assert.equal(rows.length,3);
  assert.deepEqual(new Set(rows.map(row => row.query)),new Set(["561 Group","What is the 561 Group?","Koios News"]));
  assert.ok(rows.every(row=>row.observedAt.startsWith("2026-10-21T")));
  assert.ok(rows.every(row=>row.surface==="ChatGPT Web public search (slow)" && row.surfaceMode==="search"));
  assert.ok(rows.every(row=>row.evidence.some(item=>item.kind==="url" && item.value.startsWith("https://"))));
});

test("limited public search-result snapshots cannot masquerade as provider rankings, AI retrieval or citations", () => {
  for(const row of rows) {
    assert.equal(row.retrieved,null);
    assert.equal(row.cited,false);
    assert.equal(row.mentioned,false);
    assert.equal(row.factuality,"not-applicable");
    assert.equal(row.locale,"und");
    assert.equal(row.locationContext,undefined);
    assert.equal(row.referralObserved,null);
    assert.equal(row.conversionObserved,null);
    assert.ok(row.notes.includes("sample") || row.notes.includes("Sample"));
  }
});

test("current branded collisions remain separately observed from historical October 3 samples", () => {
  const corporate=summarizeObservedPanel(group,rows);
  const newspaper=summarizeObservedPanel(koios,rows);
  assert.equal(corporate.totalObserved,2);
  assert.equal(corporate.observedDistinctQueries,2);
  assert.equal(corporate.expectedDistinctQueries,16);
  assert.equal(corporate.missingQueries.length,14);
  assert.equal(newspaper.totalObserved,1);
  assert.equal(newspaper.observedDistinctQueries,1);
  assert.equal(newspaper.missingQueries.length,4);
  assert.ok(corporate.groups.every(g=>g.retrievalUnknown===g.observedAnswers && g.cited===0));
  assert.ok(newspaper.groups.every(g=>g.retrievalUnknown===g.observedAnswers && g.cited===0));
});

test("sample statuses cannot prove site outage or index removal", () => {
  assert.ok(rows.some(row=>row.publication==="koios-news" && row.evidence.some(item=>item.value.includes("same date"))));
  assert.ok(rows.every(row=>!row.notes.includes("proves deindexing") && !row.notes.includes("confirmed 404")));
});
