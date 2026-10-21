#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const INTENTS = new Set(["navigational", "informational", "comparative", "commercial", "scholarly", "technical"]);
const ROLES = new Set(["branded", "unbranded", "control"]);
const text = (value) => typeof value === "string" && value.trim() !== "";
const plainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Construct an auditable request panel, never a claim that a search/answer was
 * actually performed. Results belong in the existing observation ledger.
 *
 * Query order is deterministically rotated across repetitions and surfaces.
 * No provider access or answer content is simulated.
 */
export function compileQueryPanel(panel, { surfaces, locale = "en-US", runs = 1 } = {}) {
  if (!plainObject(panel) || !text(panel.publication) ||
      !Number.isInteger(panel.version) || panel.version < 1 ||
      !Array.isArray(panel.queries) || panel.queries.length === 0) {
    throw new TypeError("a versioned, nonempty publication query panel is required");
  }
  if (!Array.isArray(surfaces) || surfaces.length === 0 ||
      surfaces.some((surface) => !text(surface)) ||
      new Set(surfaces.map((surface) => surface.trim().toLowerCase())).size !== surfaces.length) {
    throw new TypeError("supply distinct named search/answer surfaces");
  }
  if (!text(locale) || !Number.isInteger(runs) || runs < 1 || runs > 20) {
    throw new TypeError("a locale and between 1 and 20 runs are required");
  }

  const seen = new Set();
  const queries = panel.queries.map((entry, index) => {
    if (!plainObject(entry) || !text(entry.query) || !text(entry.topic) ||
        !text(entry.expected) || !INTENTS.has(entry.intent) ||
        (entry.role !== undefined && !ROLES.has(entry.role))) {
      throw new TypeError("queries[" + index + "] requires query, valid intent, topic, expectation and valid optional role");
    }
    const normalized = entry.query.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en");
    if (seen.has(normalized)) throw new TypeError("duplicate query: " + entry.query);
    seen.add(normalized);
    return Object.freeze({
      query: entry.query,
      intent: entry.intent,
      topic: entry.topic,
      role: entry.role ?? "branded",
      expected: entry.expected,
    });
  });

  const requests = [];
  for (let run = 1; run <= runs; run++) {
    for (let surfaceIndex = 0; surfaceIndex < surfaces.length; surfaceIndex++) {
      for (let step = 0; step < queries.length; step++) {
        const index = (step + run - 1 + surfaceIndex) % queries.length;
        const query = queries[index];
        requests.push(Object.freeze({
          kind: "observation-request",
          publication: panel.publication,
          panelVersion: panel.version,
          run,
          surface: surfaces[surfaceIndex],
          locale,
          queryIndex: index,
          query: query.query,
          intent: query.intent,
          topic: query.topic,
          role: query.role,
          expected: query.expected,
        }));
      }
    }
  }
  return Object.freeze(requests);
}

function optionsFromArgs(args) {
  const options = { surfaces: [] };
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (!["--surface", "--locale", "--runs"].includes(flag) || index + 1 >= args.length) {
      throw new TypeError("use --surface NAME (repeatable), --locale LOCALE, --runs NUMBER");
    }
    const value = args[++index];
    if (flag === "--surface") options.surfaces.push(value);
    if (flag === "--locale") options.locale = value;
    if (flag === "--runs") options.runs = Number(value);
  }
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [filename, ...args] = process.argv.slice(2);
    if (!filename) throw new TypeError("usage: node src/query-panel.mjs <query-set.json> --surface NAME [--surface NAME] [--locale en-US] [--runs 2]");
    const panel = JSON.parse(readFileSync(resolve(filename), "utf8"));
    const requests = compileQueryPanel(panel, optionsFromArgs(args));
    for (const request of requests) process.stdout.write(JSON.stringify(request) + "\n");
  } catch (error) {
    process.stderr.write((error instanceof Error ? error.message : String(error)) + "\n");
    process.exitCode = 2;
  }
}
