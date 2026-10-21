/**
 * Search locale (en-US) is a language preference, NOT an observed geography.
 * A geographical sample must name a real test place and how that place was
 * supplied to the search/answer surface. No location is invented by default.
 *
 * The location itself uses schema.org Place / PostalAddress field names and
 * ISO 3166-1 alpha-2 country plus ISO 3166-2 region identifiers.
 * The surrounding mechanism describes the *search test*, not a Place property.
 */
const METHODS = new Set(["query-text", "provider-setting", "device-location"]);
const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const string = (v) => typeof v === "string" && v.trim() !== "";
const collapse = (v) => v.trim().replace(/\s+/gu, " ");

export function normalizeLocationContext(value) {
  if (value === undefined || value === null) return null;
  if (!object(value) || !object(value.place) ||
      value.place["@type"] !== "Place" ||
      !object(value.place.address) ||
      value.place.address["@type"] !== "PostalAddress" ||
      !METHODS.has(value.mechanism)) {
    throw new TypeError("locationContext requires a schema.org Place/PostalAddress and a supported search mechanism");
  }
  const address = value.place.address;
  if (!string(address.addressCountry) || !/^[A-Za-z]{2}$/u.test(address.addressCountry.trim()) ||
      !string(address.addressRegion) || !/^[A-Za-z]{2}-[A-Za-z0-9]{1,4}$/u.test(address.addressRegion.trim()) ||
      !string(address.addressLocality)) {
    throw new TypeError("locationContext requires ISO country and subdivision codes plus a locality");
  }
  const country = address.addressCountry.trim().toUpperCase();
  const region = address.addressRegion.trim().toUpperCase();
  if (!region.startsWith(country + "-")) {
    throw new TypeError("locationContext subdivision does not belong to the stated country");
  }
  const locality = collapse(address.addressLocality);
  if (locality.length > 128) throw new TypeError("locationContext locality is too long");
  return Object.freeze({
    place: Object.freeze({
      "@type": "Place",
      address: Object.freeze({
        "@type": "PostalAddress",
        addressCountry: country,
        addressRegion: region,
        addressLocality: locality
      })
    }),
    mechanism: value.mechanism
  });
}

export function checkedQueryLocation(query, value) {
  const location = normalizeLocationContext(value);
  if (typeof query !== "string") throw new TypeError("search query must be text");
  if (/\bnear\s+me\b/iu.test(query) &&
      (!location || location.mechanism === "query-text")) {
    throw new TypeError('"near me" requires an explicit provider-setting or device-location context');
  }
  if (location && location.mechanism === "query-text") {
    const address = location.place.address;
    const tokens = query.toUpperCase().split(/[^A-Z0-9]+/u).filter(Boolean);
    const regionSuffix = address.addressRegion.split("-").slice(1).join("");
    if (!query.toLocaleLowerCase("en").includes(address.addressLocality.toLocaleLowerCase("en")) ||
        !tokens.includes(regionSuffix)) {
      throw new TypeError("query-text locationContext must name the locality and subdivision code in the literal query");
    }
  }
  return location;
}

export function locationContextKey(value) {
  const normalized = normalizeLocationContext(value);
  if (!normalized) return "unspecified";
  const { addressCountry, addressRegion, addressLocality } = normalized.place.address;
  return JSON.stringify([addressCountry, addressRegion, addressLocality.toLocaleLowerCase("en"), normalized.mechanism]);
}
