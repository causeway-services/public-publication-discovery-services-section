#!/usr/bin/env node
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { assertObservation } from "./observation.mjs";

export function recordObservation(value,{output}={}) {
  const observed=assertObservation(value);
  if (output) {
    const path=resolve(output);
    mkdirSync(dirname(path),{recursive:true});
    appendFileSync(path,JSON.stringify(observed)+"\n","utf8");
  }
  return observed;
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const outputIndex=process.argv.indexOf("--out");
  const output=outputIndex===-1?undefined:process.argv[outputIndex+1];
  const raw=readFileSync(0,"utf8").trim();
  if (!raw) {
    process.stderr.write("one JSON observation is required on stdin\n");
    process.exitCode=2;
  } else {
    try {
      const result=recordObservation(JSON.parse(raw),{output});
      process.stdout.write(JSON.stringify({ok:true,observation:result})+"\n");
    } catch(error) {
      process.stderr.write((error instanceof Error?error.message:String(error))+"\n");
      process.exitCode=2;
    }
  }
}
