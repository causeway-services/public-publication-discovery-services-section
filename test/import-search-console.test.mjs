import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSearchConsole } from "../src/import-search-console.mjs";

test("normalizes existing content-demand-pull output without pretending it is AI citation data",()=>{
  const rows=normalizeSearchConsole({
    property:"sc-domain:koios.news",
    startDate:"2026-09-01",
    endDate:"2026-09-28",
    queries:[{query:"koios news",clicks:2,impressions:40,ctr:0.05,position:7.2}]
  },{publication:"koios-news",importedAt:"2026-10-03T17:00:00Z"});
  assert.deepEqual(rows,[{
    kind:"traditional-search-performance",
    publication:"koios-news",
    provider:"google-search-console",
    property:"sc-domain:koios.news",
    startDate:"2026-09-01",
    endDate:"2026-09-28",
    importedAt:"2026-10-03T17:00:00Z",
    query:"koios news",
    clicks:2,
    impressions:40,
    ctr:0.05,
    position:7.2
  }]);
  assert.equal("citations" in rows[0],false);
  assert.equal("retrieved" in rows[0],false);
});
