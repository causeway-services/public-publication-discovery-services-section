export function normalizeSearchConsole(reading,{publication,importedAt=null}={}) {
  if (!reading || typeof reading!=="object" || Array.isArray(reading)) throw new TypeError("Search Console reading must be an object");
  if (typeof publication!=="string" || publication.trim()==="") throw new TypeError("publication is required");
  for (const key of ["property","startDate","endDate"]) if (typeof reading[key]!=="string" || reading[key].trim()==="") throw new TypeError(`${key} is required`);
  if (!Array.isArray(reading.queries)) throw new TypeError("queries must be an array");
  return Object.freeze(reading.queries.map((row,index)=>{
    if (!row || typeof row!=="object" || Array.isArray(row)) throw new TypeError(`queries[${index}] must be an object`);
    if (typeof row.query!=="string" || row.query.trim()==="") throw new TypeError(`queries[${index}].query is required`);
    for (const metric of ["clicks","impressions","ctr","position"]) if (typeof row[metric]!=="number" || !Number.isFinite(row[metric])) throw new TypeError(`queries[${index}].${metric} must be finite number`);
    return Object.freeze({
      kind:"traditional-search-performance",
      publication,
      provider:"google-search-console",
      property:reading.property,
      startDate:reading.startDate,
      endDate:reading.endDate,
      importedAt,
      query:row.query,
      clicks:row.clicks,
      impressions:row.impressions,
      ctr:row.ctr,
      position:row.position,
    });
  }));
}
