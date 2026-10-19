import test from "node:test";
import assert from "node:assert/strict";
import { auditPublication, LAYERS } from "../src/audit-publication.mjs";
import discoveryContract from "../content/standards/publication-discovery-contract.json" with { type: "json" };

const base={
  id:"fixture",
  authority:"test",
  canonicalEntityName:"Fixture",
  canonicalEntityUrl:"https://example.test/",
  entityType:"Organization",
  publisherOrOwner:"Fixture",
  capabilities:{
    publicHome:true,canonicalUrls:true,robots:true,sitemap:true,
    descriptiveTitles:true,descriptions:true,semanticHeadings:true,stablePublicUrls:true,
    claimSourceBoundary:true,querySet:true,observationLedger:true,
  },
};

test("does not collapse layers into a single score",()=>{
  const result=auditPublication(base);
  assert.equal("score" in result,false);
  assert.equal(result.layers.crawl.status,"operable-with-residuals");
  assert.equal(result.layers.entity.status,"operable-with-residuals");
});

test("entity and retrieval gaps remain independent",()=>{
  const manifest=structuredClone(base);
  delete manifest.canonicalEntityName;
  manifest.capabilities.querySet=true;
  const result=auditPublication(manifest);
  assert.equal(result.layers.entity.status,"blocked");
  assert.notEqual(result.layers.retrieval.status,"blocked");
});

test("missing crawl requirements block crawl without erasing strong content",()=>{
  const manifest=structuredClone(base);
  manifest.capabilities.robots=false;
  manifest.capabilities.articleOrProductSemantics=true;
  manifest.capabilities.publishedModifiedDates=true;
  manifest.capabilities.sectionsTopics=true;
  manifest.capabilities.preferredImages=true;
  const result=auditPublication(manifest);
  assert.equal(result.layers.crawl.status,"blocked");
  assert.equal(result.layers.content.status,"settled");
  assert.ok(result.blockedLayers.includes("crawl"));
});

test("platform-dependent strings count as an observed capability rather than a fabricated boolean",()=>{
  const manifest=structuredClone(base);
  manifest.capabilities.robots="platform-dependent";
  const result=auditPublication(manifest);
  assert.notEqual(result.layers.crawl.status,"blocked");
});

test("the source-owned discovery contract is exactly the executable layer program",()=>{
  assert.deepEqual(Object.keys(LAYERS),Object.keys(discoveryContract.layers));
  for(const [key,record] of Object.entries(discoveryContract.layers)){
    assert.deepEqual(LAYERS[key].required,record.required);
    assert.deepEqual(LAYERS[key].recommended,record.recommended);
  }
});
