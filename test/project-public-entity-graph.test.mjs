import test from "node:test";
import assert from "node:assert/strict";
import { projectPublicEntityGraph } from "../src/project-public-entity-graph.mjs";

test("projects only warranted schema.org entity facts, not internal relation semantics",()=>{
  const projected=projectPublicEntityGraph({
    nodes:[
      {id:"https://561.group/#organization",kind:"Organization",name:"The 561 Group",canonicalUrl:"https://561.group/",authority:"561-owned"},
      {id:"urn:internal",kind:"InternalControlPlane",name:"internal",canonicalUrl:"https://example.invalid/"}
    ],
    relations:[{subject:"a",predicate:"federates-with",object:"b"}]
  });
  assert.deepEqual(projected,{
    "@context":"https://schema.org",
    "@graph":[{
      "@type":"Organization",
      "@id":"https://561.group/#organization",
      name:"The 561 Group",
      url:"https://561.group/"
    }]
  });
  assert.equal(JSON.stringify(projected).includes("federates-with"),false);
});

test("never publishes a personal surface, an operated persona, or a node without an authority",()=>{
  const projected=projectPublicEntityGraph({
    nodes:[
      {id:"https://561.group/#organization",kind:"Organization",name:"The 561 Group",canonicalUrl:"https://561.group/",authority:"561-owned"},
      {id:"https://koios.news/#publication",kind:"NewsMediaOrganization",name:"Koios.News",canonicalUrl:"https://koios.news/",authority:"561-federated-public-enterprise"},
      {id:"https://persona.example/#author",kind:"Person",name:"Persona",canonicalUrl:"https://persona.example/",authority:"561-operated-persona-publication"},
      {id:"https://person.example/#person",kind:"Person",name:"Person",canonicalUrl:"https://person.example/",authority:"personal-observe-only"},
      {id:"https://unlabelled.example/",kind:"Organization",name:"Unlabelled",canonicalUrl:"https://unlabelled.example/"},
    ],
  });
  assert.deepEqual(projected["@graph"].map((node)=>node.name),["The 561 Group","Koios.News"]);
});
