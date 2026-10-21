#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { assertObservation } from "./observation.mjs";
import { locationContextKey, normalizeLocationContext } from "./location-context.mjs";

const normalize = (value) => value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en");
const queryIdentity = (query, locationContext) => JSON.stringify([normalize(query), locationContextKey(locationContext)]);

export function summarizeObservedPanel(panel, rows) {
  if (!panel || typeof panel !== "object" || !Array.isArray(panel.queries) ||
      typeof panel.publication !== "string" || !Array.isArray(rows)) {
    throw new TypeError("source query panel and an observation list are required");
  }
  const queries = new Map(panel.queries.map((query) => [queryIdentity(query.query, query.locationContext), query]));
  if (queries.size !== panel.queries.length) throw new TypeError("query panel must have unique query/location pairs");
  const queryTexts = new Set(panel.queries.map((query) => normalize(query.query)));
  let outOfScopeLocationSamples = 0;
  const seen = new Set();
  const observedQueries = new Set();
  const aggregates = new Map();
  const dates = [];

  for (const candidate of rows) {
    const row = assertObservation(candidate);
    if (row.publication !== panel.publication) continue;
    const key = queryIdentity(row.query, row.locationContext);
    const query = queries.get(key);
    if (!query) {
      if (queryTexts.has(normalize(row.query))) outOfScopeLocationSamples++;
      continue;
    }
    const eventId = [row.surface, row.surfaceMode, row.locale, key, row.observedAt].join("\u001f");
    if (seen.has(eventId)) throw new TypeError("duplicate observation for the same surface, query, locale and instant");
    seen.add(eventId);
    observedQueries.add(key);
    dates.push(row.observedAt);
    const role = query.role ?? "branded";
    const groupKey = JSON.stringify([query.topic, role, row.surface, row.surfaceMode, row.locale, locationContextKey(row.locationContext)]);
    if (!aggregates.has(groupKey)) {
      aggregates.set(groupKey, {
        topic:query.topic,role,surface:row.surface,surfaceMode:row.surfaceMode,locale:row.locale,
        locationContext:normalizeLocationContext(row.locationContext),
        observedAnswers:0, cited:0, mentioned:0, exactEntity:0,
        accurate:0, partlyAccurate:0, materiallyWrong:0,
        retrievalTrue:0, retrievalFalse:0, retrievalUnknown:0,
      });
    }
    const group = aggregates.get(groupKey);
    group.observedAnswers++;
    if (row.cited) group.cited++;
    if (row.mentioned) group.mentioned++;
    if (row.entityResolution==="exact") group.exactEntity++;
    if (row.factuality==="accurate") group.accurate++;
    if (row.factuality==="partly-accurate") group.partlyAccurate++;
    if (row.factuality==="materially-wrong") group.materiallyWrong++;
    if (row.retrieved===true) group.retrievalTrue++;
    else if (row.retrieved===false) group.retrievalFalse++;
    else group.retrievalUnknown++;
  }

  const groups=[...aggregates.values()].sort((a,b)=>
    JSON.stringify([a.topic,a.role,a.surface,a.surfaceMode,a.locale,locationContextKey(a.locationContext)]).localeCompare(JSON.stringify([b.topic,b.role,b.surface,b.surfaceMode,b.locale,locationContextKey(b.locationContext)]))
  ).map((group)=>Object.freeze({
    ...group,
    citationFraction:group.cited/group.observedAnswers,
    mentionFraction:group.mentioned/group.observedAnswers,
    exactEntityFraction:group.exactEntity/group.observedAnswers,
    observedRetrievalFraction:group.retrievalTrue+group.retrievalFalse > 0
      ? group.retrievalTrue/(group.retrievalTrue+group.retrievalFalse):null,
  }));
  const missing = panel.queries.filter(query => !observedQueries.has(queryIdentity(query.query, query.locationContext)));
  const missingQueries = missing.map(query => query.query);
  const missingQueryContexts = missing.map(query => Object.freeze({query:query.query,locationContext:normalizeLocationContext(query.locationContext)}));
  const totalObserved=groups.reduce((sum,group)=>sum+group.observedAnswers,0);
  return Object.freeze({
    kind:"observed-panel-summary",
    publication:panel.publication,
    panelVersion:panel.version,
    totalObserved,
    expectedDistinctQueries:panel.queries.length,
    observedDistinctQueries:observedQueries.size,
    missingQueries:Object.freeze(missingQueries),
    missingQueryContexts:Object.freeze(missingQueryContexts),
    outOfScopeLocationSamples,
    observationWindow:dates.length
      ? Object.freeze({earliest:[...dates].sort()[0],latest:[...dates].sort().at(-1)})
      : null,
    groups:Object.freeze(groups),
    qualifications:Object.freeze([
      "Fractions describe recorded answer observations, not search rankings or provider citation totals.",
      "Groups are stratified by topic, query role, engine surface, mode, locale, and verified reported geographic context. Locale is not location.",
      "Missing query/location pairs never count as negative responses; location-unqualified answers are excluded from geographically specified panels.",
      "Repeated or clustered answers may not be independent. Fractions carry no causal, sampling-error, or population representativeness claim.",
      "Retrieval unknown is preserved and excluded only from the observed-retrieval fraction denominator.",
      "An observed citation is neither an assertion of correct attribution nor a verified actual model fetch."
    ]),
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [panelPath, observationsPath] = process.argv.slice(2);
    if (!panelPath || !observationsPath) throw new TypeError("usage: node src/analyze-observations.mjs <query-set.json> <observations.jsonl>");
    const panel = JSON.parse(readFileSync(resolve(panelPath),"utf8"));
    const rows = readFileSync(resolve(observationsPath),"utf8").split(/\r?\n/u).filter(line=>line.trim()).map((line,index)=>{
      try {return JSON.parse(line);} catch(error){throw new TypeError("invalid observations JSONL line "+(index+1)+": "+error.message);}
    });
    process.stdout.write(JSON.stringify(summarizeObservedPanel(panel,rows),null,2)+"\n");
  } catch(error) {
    process.stderr.write((error instanceof Error?error.message:String(error))+"\n");
    process.exitCode=2;
  }
}
