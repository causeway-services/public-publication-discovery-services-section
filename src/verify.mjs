#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { auditEstate } from "./audit-estate.mjs";
import { assertObservation } from "./observation.mjs";
import { compileQueryPanel } from "./query-panel.mjs";
import { locationContextKey } from "./location-context.mjs";
import { summarizeObservedPanel } from "./analyze-observations.mjs";
import { projectPublicEntityGraph } from "./project-public-entity-graph.mjs";

const HERE=dirname(fileURLToPath(import.meta.url));
const ROOT=resolve(HERE,"..");

function readJson(relative) {
  return JSON.parse(readFileSync(resolve(ROOT,relative),"utf8"));
}

function verifyJsonl(relative,validator) {
  const text=readFileSync(resolve(ROOT,relative),"utf8");
  const rows=text.split(/\r?\n/u).filter((line)=>line.trim()!=="").map((line,index)=>{
    try { return validator(JSON.parse(line)); }
    catch(error) { throw new Error(`${relative} line ${index+1}: ${error instanceof Error?error.message:String(error)}`); }
  });
  return rows.length;
}

const estate=auditEstate(resolve(ROOT,"content","publications"));
const graph=readJson("content/entity-graph/561-public-entity-graph.json");
const projected=projectPublicEntityGraph(graph);
const observationCount=verifyJsonl("content/observations/2026-10-03-public-search-baseline.jsonl",assertObservation);
const live=readJson("content/baselines/2026-10-03-live-access.json");
const patch=readJson("content/patches/561-group-corporate-discovery-bridge.json");
const querySet=readJson("content/query-sets/561-group.json");
const panelRequests=compileQueryPanel(querySet,{surfaces:["Bing search","ChatGPT Search"],runs:2});
const topicSet=new Set(panelRequests.map((request)=>request.topic));
const northland=readJson("content/query-sets/northland-ai-visibility-qa.json");
const northlandRequests=compileQueryPanel(northland,{surfaces:["Bing Search"],runs:1});
const nearMeRequests=northlandRequests.filter((request)=>request.query==="SEO audit near me");
if (northland.study?.phase!=="private-mock-client-qa" || northlandRequests.length<8 || nearMeRequests.length!==2 ||
    new Set(nearMeRequests.map((request)=>locationContextKey(request.locationContext))).size!==2 ||
    !northlandRequests.some((request)=>request.locationContext?.place.address.addressRegion==="US-WI") ||
    !northlandRequests.some((request)=>request.locationContext?.place.address.addressRegion==="US-GA")) {
  throw new Error("Northland GEO study must preserve private QA and cross-place controls");
}
if (![ "agentics", "artificial-intelligence", "mathematics" ].every(topic=>topicSet.has(topic))) throw new Error("three scientific search domains must be represented");
if (!panelRequests.some((request)=>request.role==="control") || !panelRequests.some((request)=>request.role==="unbranded")) throw new Error("scientific search panel missing negative or unbranded controls");
if (panelRequests.some((request)=>"cited" in request || "retrieved" in request || "factuality" in request)) throw new Error("query plan must never fabricate search outcomes");
const historicalRows=readFileSync(resolve(ROOT,"content/observations/2026-10-03-public-search-baseline.jsonl"),"utf8").trim().split(/\r?\n/u).map((line)=>JSON.parse(line));
const historicalSummary=summarizeObservedPanel(querySet,historicalRows);
if (historicalSummary.totalObserved!==1 || historicalSummary.observedDistinctQueries!==1) throw new Error("dated historical search observation was lost or fabricated");
const observedFile="content/observations/2026-10-21-branded-public-search.jsonl";
const recentCount=verifyJsonl(observedFile,assertObservation);
const recentRows=readFileSync(resolve(ROOT,observedFile),"utf8").trim().split(/\r?\n/u).map((line)=>JSON.parse(line));
const recentGroup=summarizeObservedPanel(querySet,recentRows);
const recentKoios=summarizeObservedPanel(readJson("content/query-sets/koios-news.json"),recentRows);
if (recentCount!==3 || recentGroup.totalObserved!==2 || recentGroup.observedDistinctQueries!==2 ||
    recentKoios.totalObserved!==1 || recentKoios.observedDistinctQueries!==1 ||
    recentRows.some((row)=>row.retrieved!==null || row.cited!==false || row.mentioned!==false ||
      row.surface!=="ChatGPT Web public search (slow)" || row.locale!=="und" || !row.evidence?.some((item)=>item.kind==="url"))) {
  throw new Error("October 21 sampled branded-search evidence lost or falsely elevated into answer-engine metrics");
}

const northlandSampleFile="content/observations/2026-10-21-northland-public-search.jsonl";
const northlandSampleCount=verifyJsonl(northlandSampleFile,assertObservation);
const northlandRows=readFileSync(resolve(ROOT,northlandSampleFile),"utf8").trim().split(/\r?\n/u).map(line=>JSON.parse(line));
const northlandSummary=summarizeObservedPanel(northland,northlandRows);
if(northlandSampleCount!==2 || northlandSummary.totalObserved!==2 || northlandSummary.observedDistinctQueries!==2 ||
    northlandSummary.outOfScopeLocationSamples!==0 || northlandSummary.missingQueryContexts.length!==northland.queries.length-2 ||
    northlandRows.some(row=>row.retrieved!==null || row.cited!==false || row.mentioned!==false ||
      row.locale!=="und" || row.surface!=="ChatGPT Web public search (fast)" ||
      row.locationContext?.place.address.addressRegion!=="US-MN" ||
      row.locationContext?.mechanism!=="query-text" ||
      !row.evidence?.some(item=>item.kind==="url"))) {
  throw new Error("Duluth GEO public-search samples must retain real source, location method and missing-query distinctions");
}


if (estate.publicationCount < 4) throw new Error("publication inventory unexpectedly shrank below founding baseline");
if (projected["@graph"].length < 2) throw new Error("public entity projection unexpectedly empty");
if (observationCount < 2) throw new Error("search baseline unexpectedly empty");
if (!Array.isArray(live.surfaces) || live.surfaces.length < 3) throw new Error("live-access baseline incomplete");
if (patch.status !== "ready-but-write-blocked") throw new Error("corporate bridge patch status changed without verifier update");
if (!patch.files?.["public/index.html"] || !patch.files?.["public/robots.txt"] || !patch.files?.["public/sitemap.xml"]) throw new Error("corporate bridge patch missing required crawl artifacts");

process.stdout.write(JSON.stringify({
  ok:true,
  publications:estate.publicationCount,
  remediationRequired:estate.remediationCount,
  publicEntities:projected["@graph"].length,
  baselineObservations:observationCount,
  corporateBridge:patch.status,
  scientificQueryRequests:panelRequests.length,
  northlandPrivateQueryRequests:northlandRequests.length,
  witnessedNorthlandPublicSearchSamples:northlandSampleCount,
  observedNorthlandPrivateQaQueries:northlandSummary.observedDistinctQueries,
  historicalCorporateObservations:historicalSummary.totalObserved,
  witnessedOctober21SearchSamples:recentCount,
  observedOctober21CorporateQueries:recentGroup.observedDistinctQueries,
  observedOctober21KoiosQueries:recentKoios.observedDistinctQueries,
  scientificTopics:[...topicSet].filter((topic)=>["agentics","artificial-intelligence","mathematics"].includes(topic))
},null,2)+"\n");
