import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { auditEstate } from "../src/audit-estate.mjs";

function manifest(id,overrides={}) {
  return {
    id,authority:"test",canonicalEntityName:id,canonicalEntityUrl:`https://${id}.test/`,
    entityType:"Organization",publisherOrOwner:id,
    capabilities:{
      publicHome:true,canonicalUrls:true,robots:true,sitemap:true,
      descriptiveTitles:true,descriptions:true,semanticHeadings:true,stablePublicUrls:true,
      claimSourceBoundary:true,querySet:true,observationLedger:true,
      ...overrides,
    }
  };
}

test("estate audit preserves publication and layer identities",()=>{
  const dir=mkdtempSync(join(tmpdir(),"publication-estate-"));
  writeFileSync(join(dir,"a.json"),JSON.stringify(manifest("a",{robots:false})));
  writeFileSync(join(dir,"b.json"),JSON.stringify(manifest("b")));
  const result=auditEstate(dir);
  assert.equal(result.publicationCount,2);
  assert.equal(result.remediationCount,1);
  assert.deepEqual(result.blockedByLayer.crawl,["a"]);
  assert.equal("score" in result,false);
});
