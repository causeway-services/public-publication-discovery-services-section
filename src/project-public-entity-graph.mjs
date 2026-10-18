const SCHEMA_TYPES = new Set(["Organization","NewsMediaOrganization","Person"]);
// Only what the Group owns or publicly federates is ever published as part of it. A personal surface
// or an operated persona stays internal (the Group keeps no public link to its founder, and discloses
// a persona's operation only where a platform or law requires it); a node without an authority is
// not published.
const PUBLIC_AUTHORITIES = new Set(["561-owned","561-federated-public-enterprise"]);

export function projectPublicEntityGraph(record) {
  if (!record || typeof record!=="object" || !Array.isArray(record.nodes)) throw new TypeError("entity graph with nodes is required");
  const graph=record.nodes
    .filter((node)=>PUBLIC_AUTHORITIES.has(node.authority) && SCHEMA_TYPES.has(node.kind) && typeof node.id==="string" && typeof node.name==="string" && typeof node.canonicalUrl==="string")
    .map((node)=>Object.freeze({
      "@type":node.kind,
      "@id":node.id,
      name:node.name,
      url:node.canonicalUrl,
    }));
  return Object.freeze({
    "@context":"https://schema.org",
    "@graph":Object.freeze(graph),
  });
}

export function projectPublicEntityGraphJson(record) {
  return JSON.stringify(projectPublicEntityGraph(record),null,2)+"\n";
}
