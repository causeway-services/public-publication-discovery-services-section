import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileQueryPanel } from "../src/query-panel.mjs";

const source=JSON.parse(readFileSync(new URL("../content/query-sets/561-group.json",import.meta.url),"utf8"));
const opts={surfaces:["Bing search","ChatGPT Search"],locale:"en-US",runs:2};

test("real 561 Group source panel covers agentics, AI and mathematics with unbranded and control probes",()=>{
  const topics=new Set(source.queries.map(q=>q.topic));
  for(const topic of ["agentics","artificial-intelligence","mathematics"]) assert.ok(topics.has(topic),topic);
  for(const role of ["branded","unbranded","control"]) {
    assert.ok(source.queries.some(q=>q.role===role),"missing " + role + " question");
  }
});

test("panel compiles deterministic, rotated requests per declared surface and run",()=>{
  const first=compileQueryPanel(source,opts);
  const second=compileQueryPanel(source,opts);
  assert.deepEqual(first,second);
  assert.equal(first.length,source.queries.length*4);
  assert.equal(first[0].surface,"Bing search");
  assert.notEqual(first[0].query,first[source.queries.length].query);
  assert.notEqual(first[0].query,first[source.queries.length*2].query);
  assert.equal(first.filter(r=>r.run===1 && r.surface==="Bing search").length,source.queries.length);
});

test("requests cannot masquerade as observed citations, retrieval or deployment",()=>{
  const requests=compileQueryPanel(source,opts);
  for (const request of requests) {
    assert.equal(request.kind,"observation-request");
    assert.equal("cited" in request,false);
    assert.equal("retrieved" in request,false);
    assert.equal("mentioned" in request,false);
    assert.equal("factuality" in request,false);
    assert.equal("observedAt" in request,false);
    assert.equal("url" in request,false);
  }
});

test("refuses duplicates, unknown intents, invalid roles, and absent provider surfaces",()=>{
  const clone=structuredClone(source);
  clone.queries.push({...clone.queries[0],query:source.queries[0].query.toUpperCase()});
  assert.throws(()=>compileQueryPanel(clone,opts),/duplicate query/u);
  clone.queries.pop();
  clone.queries[0].intent="fabricated-answer";
  assert.throws(()=>compileQueryPanel(clone,opts),/valid intent/u);
  clone.queries[0].intent="navigational";
  clone.queries[0].role="guaranteed-citation";
  assert.throws(()=>compileQueryPanel(clone,opts),/valid optional role/u);
  assert.throws(()=>compileQueryPanel(source,{surfaces:[]}),/surfaces/u);
  assert.throws(()=>compileQueryPanel(source,{surfaces:["Search","search"]}),/surfaces/u);
  assert.throws(()=>compileQueryPanel(source,{surfaces:["Search"],runs:100}),/runs/u);
});

test("existing Koios.News queries remain consumable without changing identity model",()=>{
  const other=JSON.parse(readFileSync(new URL("../content/query-sets/koios-news.json",import.meta.url),"utf8"));
  const requests=compileQueryPanel(other,{surfaces:["Bing search"]});
  assert.equal(requests.length,other.queries.length);
  assert.ok(requests.every(request=>request.publication==="koios-news"));
});
