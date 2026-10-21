#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { auditEstate } from "./audit-estate.mjs";
import { assertObservation } from "./observation.mjs";
import { compileQueryPanel } from "./query-panel.mjs";
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
if (![ "agentics", "artificial-intelligence", "mathematics" ].every(topic=>topicSet.has(topic))) throw new Error("three scientific search domains must be represented");
if (!panelRequests.some((request)=>request.role==="control") || !panelRequests.some((request)=>request.role==="unbranded")) throw new Error("scientific search panel missing negative or unbranded controls");
if (panelRequests.some((request)=>"cited" in request || "retrieved" in request || "factuality" in request)) throw new Error("query plan must never fabricate search outcomes");

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
  scientificTopics:[...topicSet].filter((topic)=>["agentics","artificial-intelligence","mathematics"].includes(topic))
},null,2)+"\n");
