import test from "node:test";
import assert from "node:assert/strict";
import { admitPaidDiscoveryReport, computePaidDiscoveryReport } from "../src/paid-discovery.mjs";

function request() {
 return {
  dataClassification:"public-only",
  manifest:{id:"example-publication",canonicalEntityName:"Example Publication",
    canonicalEntityUrl:"https://example.org/",entityType:"Organization",
    publisherOrOwner:"Illustrative test",authority:"synthetic-test-fixture",
    capabilities:{publicHome:true,querySet:true,observationLedger:true},
    nextActions:["Inspect the original public canonical page before any SEO action"]},
  panel:{publication:"example-publication",version:1,queries:[
   {query:"Example Publication",role:"branded",topic:"entity",intent:"navigational"}]},
  observations:[],
  sources:{manifest:"https://example.org/manifest.json",panel:"https://example.org/panel.json",
    observations:"https://example.org/observations.jsonl"},
 };
}
function observation() {
 return {publication:"example-publication",surface:"Public search sample",surfaceMode:"search",
   locale:"en-US",query:"Example Publication",intent:"navigational",observedAt:"2026-10-22T05:00:00.000Z",
   entityResolution:"exact",retrieved:null,mentioned:false,cited:false,
   factuality:"unknown",evidence:[{kind:"url",value:"https://example.org/search-evidence"}]};
}
test("one bounded source-owned report is useful without fabricating search results",()=>{
 const r=computePaidDiscoveryReport(request());
 assert.equal(r.kind,"assist.publication-discovery-reading/v1");
 assert.equal(r.observedPanel.totalObserved,0);
 assert.equal(r.observedPanel.missingQueries.length,1);
 assert.equal(r.declaredAudit.disposition,"remediation-required");
 assert.equal(r.independentReceiving.liveCrawl,"not-assessed");
 assert.equal(r.inputClass,"caller-declared-public-data");
 assert.equal(r.independentSourceVerification,"not-performed");
 assert.equal(r.x402Payment,"handled-only-by-original-market");
 assert.equal(r.customerSearchOutcome,"not-assessed");
});
test("typed public witnessed answer stays distinct from model retrieval and customer sale",()=>{
 const input=request();input.observations=[observation()];
 const r=computePaidDiscoveryReport(input);
 assert.equal(r.observedPanel.totalObserved,1);
 assert.equal(r.observedPanel.observedDistinctQueries,1);
 assert.equal(r.observedPanel.groups[0].cited,0);
 assert.equal(r.observedPanel.groups[0].retrievalUnknown,1);
 assert.equal(r.independentReceiving.customerReferralsAndConversions,"not-assessed");
});
test("only public URL evidence may enter an external paid request",()=>{
 const s=request();s.observations=[observation()];
 s.observations[0].evidence=[{kind:"provider-export-ref",value:"private:account-export"}];
 assert.throws(()=>admitPaidDiscoveryReport(s),/public HTTPS/u);
 s.observations[0].evidence=[{kind:"url",value:"https://example.org/valid"}];
 s.observations[0].citationUrls=["private:extracted"];
 assert.throws(()=>admitPaidDiscoveryReport(s),/public HTTPS/u);
});
test("price admission refuses missing classification, overlarge panel and mismatched source",()=>{
 const a=request();delete a.dataClassification;
 assert.throws(()=>admitPaidDiscoveryReport(a),/public manifest/u);
 const b=request();b.panel.queries=Array.from({length:33},(_,i)=>({query:"Q"+i,role:"branded",topic:"x"}));
 assert.throws(()=>admitPaidDiscoveryReport(b),/bounded/u);
 const d=request();d.panel.publication="another";
 assert.throws(()=>admitPaidDiscoveryReport(d),/same named publication/u);
 const e=request();e.sources.manifest="file:///root/private";
 assert.throws(()=>admitPaidDiscoveryReport(e),/public manifest/u);
});
test("duplicate observations refuse and never become a score",()=>{
 const x=request();x.observations=[observation(),observation()];
 assert.throws(()=>computePaidDiscoveryReport(x),/duplicate observation/u);
});
