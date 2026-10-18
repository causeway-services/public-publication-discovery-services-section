import test from "node:test";
import assert from "node:assert/strict";
import { assertObservation, observationViolations } from "../src/observation.mjs";

const base={
  publication:"koios-news",
  surface:"ChatGPT Search",
  surfaceMode:"search",
  observedAt:"2026-10-03T16:00:00Z",
  locale:"en-US",
  query:"What is Koios.News?",
  intent:"informational",
  topic:"entity",
  entityResolution:"exact",
  retrieved:true,
  mentioned:true,
  cited:true,
  citationUrls:["https://koios.news/about"],
  prominence:"primary",
  factuality:"accurate",
  freshness:"current",
  referralObserved:null,
  conversionObserved:null,
  evidence:[{kind:"citation",value:"https://koios.news/about"}],
  notes:null
};

test("admits a layer-separated observation",()=>{
  assert.equal(assertObservation(base).cited,true);
});

test("citation cannot exist without retrieval and mention",()=>{
  const value={...base,retrieved:false,mentioned:false};
  const violations=observationViolations(value).join(" ");
  assert.match(violations,/mentioned=false|retrieved=false/u);
});

test("wrong entity cannot be called accurate for the target",()=>{
  const violations=observationViolations({...base,entityResolution:"wrong-entity"}).join(" ");
  assert.match(violations,/wrong-entity/u);
});

test("cited observations retain citation URLs",()=>{
  const violations=observationViolations({...base,citationUrls:[]}).join(" ");
  assert.match(violations,/citationUrls/u);
});
