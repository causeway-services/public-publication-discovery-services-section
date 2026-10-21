# Publication Discovery Services Section

Publication Discovery Services is the 561 Group's internal control plane for
search, answer-engine, and agentic discovery across its public media estate.

The unit does **not** manufacture "GEO content." It makes existing public work
legible, attributable, retrievable, citeable, and measurable across ordinary
search and generative-answer systems.

Its internal customers are 561 Group publications, public research surfaces,
corporate/product sites, and persona publications. Causeway AI Visibility
Assurance may later commercialize the methods proven here, but external sales
are downstream of this internal operating capability.

## Operating model

Every publication is read across seven independent layers:

1. **crawl** — public accessibility, robots, sitemap, canonical URLs;
2. **entity** — publisher/author/product identity and cross-property relations;
3. **content** — titles, headings, dates, article/product/service semantics;
4. **evidence** — sources, citations, corrections, provenance, first-party data;
5. **distribution** — feeds, linked-data/topic graphs, social/media surfaces;
6. **retrieval** — query/intent/topic observations across supported search and
   answer systems;
7. **measurement** — Search Console, Bing Webmaster/AI Performance, referral,
   citation, factuality, and conversion observations.

There is deliberately no single "GEO score." A publication can be excellent
at crawl/indexing and poor at entity resolution, or frequently cited while
being represented inaccurately.

## Answer-surface observations

The `record:observation` operation accepts a typed observation with independent
`retrieved`, `mentioned`, and `cited` measurements. Set `retrieved: null`
when the answer engine's internal retrieval is unknown; citing an article does
not prove a witnessed fetch, and a source citation can appear without an
explicit publisher-name mention. The recorded citation URL and evidence source
remain required for a positive citation observation.

The seven executable publication layers are read from the original
`content/standards/publication-discovery-contract.json`, not maintained
in a second code-only capability registry.

## Current baseline

- **Koios.News** is the reference implementation: NewsArticle JSON-LD, feeds,
  sitemaps, robots, topic/coverage graph, public corrections and editorial
  evidence already exist. The missing layer is systematic AI-search telemetry
  and group-wide entity/discovery integration.
- **561.group** is the remediation priority: the corporate site is tiny and,
  in the 2026-10-03 sampled search, the canonical entity did not surface
  usefully among strong unrelated "561 Group" collisions.
- **Cassia Lorne / Routine Read** has historical third-party index presence
  through Hive/Ecency, while the planned Substack publication lacks a settled
  group-wide entity/discovery contract.
- **emsenn.net** is a strong public research corpus and an affiliated authority
  surface, but it is personal property and MUST NOT be mutated under this
  service without explicit owner authority. It is useful as an observation and
  linking surface, not an assumed 561-owned property.

Run the local manifest audit with:

```sh
node src/audit-publication.mjs content/publications/koios-news.json
```

The audit reports layer-by-layer residuals and never compresses them into a
proprietary score.


## Geographic search context: Northland private QA

Search **locale** is not the observer's **location**. The original query
compiler, answer recorder and summary now accept optional `locationContext`
with a typed schema.org `Place` / `PostalAddress` and a separate search
`mechanism`: `query-text`, `provider-setting`, or `device-location`.
Country and subdivision identifiers use ISO 3166 codes (for example `US`
and `US-MN`); the validator checks code format and country prefix, not a
complete authoritative worldwide subdivision registry.

- With `query-text`, the literal query must contain both locality and the
  region code (`Duluth MN` is unambiguous for this panel). A city name alone
  is insufficient to distinguish Duluth, MN from Duluth, GA.
- For `near me`, a planned `provider-setting` or `device-location` is
  mandatory. The generated request **does not prove that a search engine
  applied that location**. An observer must witness the actual setting and
  preserve the evidence when recording an answer. If the selected surface
  cannot apply/verify it, do not record that query as a geo-qualified result.
- A recorded location must match its versioned query/location pair to count
  against that panel. Location-unqualified and out-of-scope samples are not
  silently pooled, nor scored as negative findings. Use the structured
  `missingQueryContexts` and `outOfScopeLocationSamples` fields when the
  same literal query is requested in multiple places.
- The original October 3 observations remain location-unspecified, and remain
  valid for their historical panel. Do not retroactively attribute a
  geographic search setting to those records.

The [Northland AI Visibility Assurance query set](content/query-sets/northland-ai-visibility-qa.json)
is **private mock-client QA**, downstream of the existing
[Causeway offer/launch gate](https://github.com/causeway-services/public-services-section/issues/6).
It includes Duluth MN, Duluth GA contamination controls, Superior WI,
Two Harbors MN, and repeated `near me` requests across locations. It makes
no claim that Causeway currently sells this service, has a local storefront,
was observed in an answer, or can service an arbitrary surrounding town.

Compile deterministic **observation requests only** (no provider calls):

```sh
node src/query-panel.mjs content/query-sets/northland-ai-visibility-qa.json \
  --surface "Bing Search" --runs 2
```

Use the existing recorder and summary to analyze independently witnessed
responses after the test-location, provider mode and source are verified.
Keep real search responses, publisher release receipts and paying-customer
outcomes distinct. A query plan cannot satisfy any of those receiving gates.

## 2026-10-21: witnessed Northland query-text samples

The [Northland private-QA observation ledger](content/observations/2026-10-21-northland-public-search.jsonl)
now contains **two** exact public Web-search-result samples:
`GEO services in Duluth MN` and `AI search consultant Duluth MN`.
These are not nine observed results or a completed mock-client experiment.
The records retain the original panel's typed
`Place/PostalAddress` and `mechanism: query-text`; no search provider
geolocation setting, account locale, real booking, or customer conversion was
witnessed. Both records use `retrieved: null` and are excluded from
AI-answer-citation interpretation.

The first sample demonstrates an operational **lexical ambiguity**:
unqualified `GEO` may surface geographically oriented GIS/surveying work
alongside generative-engine optimization. Both searches also surfaced agency
landing pages asserting Duluth coverage, which is not evidence of a real
local office or completed local project. The Causeway offer remains **private
mock-client QA**, not a currently promoted merchant; do not build keyword
doorway pages in response.

The same original analyzer reports two observed distinct Duluth questions,
seven missing question/location combinations and zero witnessed answer-engine
retrievals. Missing is **not** a measured failure. Before any commercial
decision, independently witness relevant provider answer/search surfaces,
local provider identity, customer need and the existing mock-client acceptance
gate at [Causeway original Work #6](https://github.com/causeway-services/public-services-section/issues/6).

## Agentics, artificial intelligence, mathematics: research / technology / practice

The October 20, 2026 research priority is discoverability for **actual**
agentics, artificial-intelligence and mathematical work. Keep the original
seven-layer publication-discovery contract and observation ledger as authority:
this is an operating experiment on the original system, not a separate GEO
scanner, an invented publication platform or a ranking-success claim.

### Science: registered questions and falsifiable contrasts

The [561 Group query set](content/query-sets/561-group.json) contains 16
versioned questions: five previous corporate questions and 11 new agentics,
AI, mathematics and unrelated-entity probes. Preserve **branded**, **unbranded**
and **control** roles. The unit of observation is one real response to an
exact query on a named engine/surface at a recorded locale and time.

Test findability (correct canonical entity, actual source), attribution
(accurate author/institution/artifact/claim status), citation/retrieval
(distinct, separately witnessed), and usefulness (independent outside
reader can follow the actual publication and perform its task). Generic
scientific questions are not obligated to cite the Group. Unrelated numeric
entities must not be confused with the Group. Do not claim causal effects
from a few selected answer samples.

### Engineering: real repeatable query and observation operations

Produce requests without creating fictional results:

    npm run study:queries -- --surface "Bing Search" --surface "ChatGPT Search" --runs 2

With the current source this emits 64 JSONL observation **requests**, not
provider requests or observed answers. It performs no network access. For a
real manually witnessed public search or authorized answer experiment, record
the actual response date/time, named provider/surface mode, locale, exact
query, canonical entity, response/citation URL, and external evidence.
Distinguish retrieved (null if unknowable), mentioned, cited, factuality,
freshness and observed external referral/conversion. Feed one authentic JSON
observation to the existing recorder on stdin:

    node src/record-observation.mjs --out content/observations/YOUR-DATED-OBSERVATIONS.jsonl

Generate a descriptive summary from real ledger observations:

    npm run study:summary -- content/query-sets/561-group.json content/observations/2026-10-03-public-search-baseline.jsonl

This historical ledger supplies only **one** existing 561 Group observation;
the remaining 15 questions are **missing measurements**, not zero-success
responses. The analyzer reports each topic / role / provider / mode / locale
separately, and never invents ranking positions, GEO scores, retrieval
events, or citations. Before/after comparisons need a stable versioned
panel, comparable surfaces, dates, locales and declared sampling limits;
repeated answers are correlated and descriptive fractions are not proof of
population rates or causal attribution.

Google Search Console conventional search-performance metrics and Bing
Webmaster AI Performance topic/citation aggregates are **different kinds**
of telemetry from individual answer observations. Retain provider export
provenance and never recode approximate topical aggregates as personally
observed individual Boolean citations.

### Operations: improve the original producer through a received result

Use observed discovery defects to select an owned original public producer:
Lenticule Science accepts mathematical works and establishes scientific
status; Red Cup Engineering improves reusable semantic scholarly/article
publication machinery; Coesite / Causeway coordinate actual authorized
publication, web estate, provider access and independent public receiving.

The corporate source already has [merged original homepage work](https://github.com/561-group/561.group/pull/18),
but [apex issue #17](https://github.com/561-group/561.group/issues/17)
still lacks the installed full Play/PNPM production build, authorized
Cloudflare release, public readback and reader reception. Do not flip this
repository's 2026-10-03 manifest crawl flags on source merge alone or
publish a fabricated smaller stand-in. Reuse the actual
[Science-publication custody research](https://github.com/561-group/bare-cedar-fog/issues/255)
and [Public Web Actor receiving requirements](https://github.com/causeway-services/public-web-services-section/issues/14).
An accessible public garden carrier, an accepted scientific paper, and
a licensed reusable scientific artifact are distinct conditions. Affiliated
personal properties remain observation-only without their owner's
independent authorization.

### Industry reference evidence and qualifying boundaries

Google [AI features guidance](https://developers.google.com/search/docs/appearance/ai-features)
requires conventional crawlable, helpful, reliable, linked and accurately
structured content, not special AI markup or AI-only files.
For actually accepted mathematical papers, use
[Google Scholar inclusion guidance](https://scholar.google.com/intl/en/scholar/inclusion.html)
for crawlable HTML/PDF, visible author abstracts and bibliographic metadata.
[FAIR Signposting](https://signposting.org/FAIR/) applies when real
author/version/artifact/license relationships are available from the original
research release. Never invent DOI, license grant, review status or proof.
[Bing Topics Portfolio beta (October 13, 2026)](https://blogs.bing.com/webmaster/2026/10/introducing-topics-portfolio-beta-in-ai-performance/)
supplies approximate, AI-classified topic opportunities to eligible sites:
directional planning data, not an exact exposure ledger.

**Received success** requires: source-authorized production fix, native
tests, original release/install evidence, independent public readback,
and measured corrected source findability or improved real reader task.
A query plan, test pass, source merge, public deployment and user-visible
SEO/GEO effect are five different statuses.

## October 21, 2026: actual sampled branded discovery observations

Three genuinely witnessed public Web-search **result samples** are recorded
separately from the October 3 historical baselines at
[`content/observations/2026-10-21-branded-public-search.jsonl`](content/observations/2026-10-21-branded-public-search.jsonl).
They use the existing observation schema and are checked in the native verifier.

- Exact queries: `561 Group`, `What is the 561 Group?`, `Koios News`.
- Actual observed surface: a finite set of results returned by ChatGPT's
  **slow public Web search** interface on October 21. It is **not** a
  verified Google Search, Bing Webmaster, or AI-generated answer measurement.
  The underlying search provider, placement/rank, exhaustive hit set and
  geographic locale were not exposed. Record `locale: "und"` and
  `retrieved: null`; do not impute a device location.
- The two corporate samples did not resolve `https://561.group/` in their
  returned result snippets. The Koios sample instead returned unrelated
  Koios organizations. Those are *sample-level* disambiguation misses,
  not proven absence from an index, not provider-wide counts.
- Independently opening `https://koios.news/` with the public Web tool on
  the same date **succeeded**, so the Koios search miss must not be turned
  into an availability or deindexing claim. Attempted Web-tool opens of
  `https://561.group/`, `robots.txt`, `sitemap.xml`, and `llms.txt`
  did not produce accessible pages through that tool, but this also does
  not establish a real server outage or status code.

These results **do not establish a before/after change**: the October 3
baseline and the October 21 sample were not witnessed on a qualified
identical search provider, locale or ranking surface. No new search rank,
visibility score, real AI citation, actual model fetch, conversion or
indexing diagnosis can be inferred.

Read both types of original publication observations with:

```sh
node src/analyze-observations.mjs content/query-sets/561-group.json content/observations/2026-10-21-branded-public-search.jsonl
node src/analyze-observations.mjs content/query-sets/koios-news.json content/observations/2026-10-21-branded-public-search.jsonl
```

**Next useful effect:** original site/release owners should verify
`561.group` from an independent reachable network with HTTP/TLS status,
resolved IP, content hashes, robots/sitemap and CDN version; only then
attribute any reachable-page discrepancy to source or deployment. The
original Koios publication owner should check independent GSC/Bing index
data and search-engine-specific samples before selecting a canonical
identity remediation. Neither estate deserves manufactured AI-only markup
or uncontrolled SEO landing pages.
