import test from "node:test";
import assert from "node:assert/strict";
import {summarizeObservedPanel} from "../src/analyze-observations.mjs";

const panel={publication:"561-group-corporate",version:2,queries:[
  {query:"How do agents hold offices?",topic:"agentics",role:"unbranded"},
  {query:"561 Group real estate",topic:"entity",role:"control"},
  {query:"561 Group Obsmetrologia",topic:"mathematics",role:"branded"},
]};
function observation(query, overrides={}) {
  return {
    publication:"561-group-corporate",surface:"Bing Search",surfaceMode:"search",
    locale:"en-US",query,observedAt:"2026-10-20T15:00:00Z",
    intent:"informational",topic:"agentics",entityResolution:"exact",
    retrieved:null,mentioned:false,cited:false,factuality:"unknown",
    evidence:[{kind:"url",value:"https://example.org/evidence"}],...overrides
  };
}

test("only witnessed responses affect fractions, and missing requests do not count as negatives",()=>{
 const report=summarizeObservedPanel(panel,[
   observation("How do agents hold offices?",{cited:true,citationUrls:["https://561.group/approach/"],mentioned:false}),
   observation("561 Group real estate",{entityResolution:"wrong-entity",retrieved:false}),
 ]);
 assert.equal(report.totalObserved,2);
 assert.equal(report.expectedDistinctQueries,3);
 assert.equal(report.observedDistinctQueries,2);
 assert.deepEqual(report.missingQueries,["561 Group Obsmetrologia"]);
 const agents=report.groups.find(row=>row.topic==="agentics");
 assert.equal(agents.citationFraction,1);
 assert.equal(agents.mentionFraction,0);
 assert.equal(agents.observedRetrievalFraction,null);
 assert.equal(agents.retrievalUnknown,1);
 const control=report.groups.find(row=>row.role==="control");
 assert.equal(control.exactEntityFraction,0);
 assert.equal(control.observedRetrievalFraction,0);
 assert.ok(report.qualifications.some(line=>line.includes("not search rankings")));
});

test("separates each platform and locale and validates external measurements",()=>{
 const report=summarizeObservedPanel(panel,[
   observation("How do agents hold offices?",{surface:"Bing Search",locale:"en-US"}),
   observation("How do agents hold offices?",{surface:"ChatGPT Search",locale:"zh-CN",observedAt:"2026-10-20T16:00:00Z"}),
 ]);
 assert.equal(report.groups.length,2);
 assert.equal(report.observedDistinctQueries,1);
 assert.throws(()=>summarizeObservedPanel(panel,[
   observation("How do agents hold offices?",{cited:true,citationUrls:[]})
 ]),/citationUrls/u);
});

test("refuses duplicate reported samples and preserves unobserved state",()=>{
 const one=observation("How do agents hold offices?");
 assert.throws(()=>summarizeObservedPanel(panel,[one,one]),/duplicate observation/u);
 const empty=summarizeObservedPanel(panel,[]);
 assert.equal(empty.totalObserved,0);
 assert.equal(empty.groups.length,0);
 assert.equal(empty.observationWindow,null);
 assert.equal(empty.missingQueries.length,3);
});

test("ignores different publications without treating them as negative results",()=>{
 const row=observation("How do agents hold offices?",{publication:"koios-news"});
 const report=summarizeObservedPanel(panel,[row]);
 assert.equal(report.totalObserved,0);
});
