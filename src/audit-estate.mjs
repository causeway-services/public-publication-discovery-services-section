#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { auditPublication } from "./audit-publication.mjs";

const HERE=dirname(fileURLToPath(import.meta.url));
export const DEFAULT_PUBLICATIONS=resolve(HERE,"..","content","publications");

export function auditEstate(directory=DEFAULT_PUBLICATIONS) {
  const manifests=readdirSync(directory)
    .filter((name)=>name.endsWith(".json"))
    .sort()
    .map((name)=>JSON.parse(readFileSync(join(directory,name),"utf8")));
  const publications=manifests.map(auditPublication);
  const blockedByLayer={};
  for (const publication of publications) for (const layer of publication.blockedLayers) {
    (blockedByLayer[layer]??=[]).push(publication.publication);
  }
  return Object.freeze({
    publicationCount:publications.length,
    remediationCount:publications.filter((entry)=>entry.disposition==="remediation-required").length,
    blockedByLayer:Object.freeze(Object.fromEntries(Object.entries(blockedByLayer).map(([key,value])=>[key,Object.freeze(value.sort())]))),
    publications:Object.freeze(publications),
  });
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const directory=process.argv[2]?resolve(process.argv[2]):DEFAULT_PUBLICATIONS;
  process.stdout.write(JSON.stringify(auditEstate(directory),null,2)+"\n");
}
