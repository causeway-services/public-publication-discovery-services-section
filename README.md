# Publication Discovery Services Section

> Code custody: this section's executable code lives in `red-cup-engineering/publication-discovery-engineering-services-section`. Commands below run it against this checkout: set `PUBLICATION_DISCOVERY_ROOT` to this repository's root (default: the current directory).

<!-- 561-group-standards:badges:start -->
[![Causeway Services](https://img.shields.io/badge/561%20Group-Causeway%20Services-115e69)](https://github.com/causeway-services)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-115e69)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/causeway-services/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

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
node red-cup-engineering/publication-discovery-engineering-services-section/src/audit-publication.mjs content/publications/koios-news.json
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
node red-cup-engineering/publication-discovery-engineering-services-section/src/query-panel.mjs content/query-sets/northland-ai-visibility-qa.json \
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

The [561 Group query set](content/query-sets/561-group.json) now holds 31
versioned questions: its original 16 corporate, agentics, AI and mathematics
questions, plus 15 distinct environmental, climate, institutional-resilience,
AI political-economy and crypto-commons questions added October 27. Preserve **branded**, **unbranded**
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

    npm --prefix red-cup-engineering/publication-discovery-engineering-services-section run study:queries -- --surface "Bing Search" --surface "ChatGPT Search" --runs 2

With the current 31-question panel this emits 124 JSONL observation **requests** (2 surfaces × 2 runs), not
provider requests or observed answers. It performs no network access. For a
real manually witnessed public search or authorized answer experiment, record
the actual response date/time, named provider/surface mode, locale, exact
query, canonical entity, response/citation URL, and external evidence.
Distinguish retrieved (null if unknowable), mentioned, cited, factuality,
freshness and observed external referral/conversion. Feed one authentic JSON
observation to the existing recorder on stdin:

    node red-cup-engineering/publication-discovery-engineering-services-section/src/record-observation.mjs --out content/observations/YOUR-DATED-OBSERVATIONS.jsonl

Generate a descriptive summary from real ledger observations:

    npm --prefix red-cup-engineering/publication-discovery-engineering-services-section run study:summary -- content/query-sets/561-group.json content/observations/2026-10-03-public-search-baseline.jsonl

This historical ledger supplies only **one** existing 561 Group observation;
the remaining 30 current-panel questions are **missing measurements**, not zero-success
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
node red-cup-engineering/publication-discovery-engineering-services-section/src/analyze-observations.mjs content/query-sets/561-group.json content/observations/2026-10-21-branded-public-search.jsonl
node red-cup-engineering/publication-discovery-engineering-services-section/src/analyze-observations.mjs content/query-sets/koios-news.json content/observations/2026-10-21-branded-public-search.jsonl
```

**Next useful effect:** original site/release owners should verify
`561.group` from an independent reachable network with HTTP/TLS status,
resolved IP, content hashes, robots/sitemap and CDN version; only then
attribute any reachable-page discrepancy to source or deployment. The
original Koios publication owner should check independent GSC/Bing index
data and search-engine-specific samples before selecting a canonical
identity remediation. Neither estate deserves manufactured AI-only markup
or uncontrolled SEO landing pages.


## ASSIST: source-qualified discovery reading (read-only)

The existing Publication Discovery owner can project **its own** declarative
seven-layer manifest audit and recorded search/answer observations into a
machine-readable reading for the proposed
[Enterprise ASSIST](https://github.com/red-cup-engineering/assist/issues/8).
This is a cross-service **evidence handoff**, not a new GEO scanner, an ASSIST
app runtime, a customer database, or authority to change public content.

Run it with the actual original corporate manifest, panel, and observation
ledger:

```sh
npm --prefix red-cup-engineering/publication-discovery-engineering-services-section run assist:discovery -- \
  content/publications/561-group.json \
  content/query-sets/561-group.json \
  content/observations/2026-10-03-public-search-baseline.jsonl
```


The `assist.publication-discovery-reading/v1` JSON output has:

- `declaredAudit`: the original seven-layer **source declaration**, not a fresh
  live crawl or independent proof of indexing;
- `observedPanel`: only witnessed, schema-checked observations, with missing
  query/location contexts, platforms, unknown retrievals and uncertainty
  preserved by the **existing** observation summarizer;
- `verificationQueue`: verification candidates derived from absent/false
  declarations in the original audit, not automatically authorized fixes;
- `originalOwnerNextActions`: the publisher's original proposed actions,
  never presented as executed work;
- `independentReceiving`: explicit `not-assessed` for site release, live
  crawl, approvals, provider access, campaigns and customer outcomes.

The Group corporate query panel now has 31 source-authored questions; the
historical 2026-10-03 ledger covers only one. The other 30 remain missing
observations. Run later baselines with the correct real observed ledger,
not fabricated answers or search-engine metrics. The output never equates a
citation with a witnessed model retrieval, a customer referral or a sale.

**ASSIST receiving gate.** The host or authorized client must explicitly
read this projection from the original Publication Discovery provider, qualify
the tenant/publication source and connect it to the original approved Work,
publisher/Actor and independent public receiving. A public roster page MUST
NOT expose a customer's private query observations, provider-account exports,
CRM records or campaign budgets. Any actual remediation, social publishing,
paid campaign, or x402 purchase remains behind original owner, customer and
provider grants. This producer never issues those rights.

Native checks: `npm --prefix red-cup-engineering/publication-discovery-engineering-services-section run check && npm --prefix red-cup-engineering/publication-discovery-engineering-services-section run verify`. The added test exercises
the existing 561 Group corpus, zero-observation semantics and wrong-entity
refusals. This producer update is not proof that Enterprise ASSIST is deployed
or that any search ranking, mention rate or customer conversion improved.

### Public-only data and disclosure boundary

An external x402 caller is not automatically a custodian of private search-console
exports, audience analytics, internal work, associate advertising screenshots or
an employee's commentary. Before an x402 payment is requested, the producer
rejects unrecognized extra fields. This is deliberately stricter than
Publication Discovery's internal observation ledger, which can contain
internal factuality notes, referral readings and licensed provider evidence.

The paid computation admits only a **sanitized public** manifest
(`id`, canonical publisher/entity identifiers, the seven-layer boolean/unknown
capability declarations and optionally public site URLs), a query panel with
bounded public prompts and verified location shapes, and source-constrained
public URL/citation observations. Free-form private `notes`, `study`,
`sourceStatus`, `nextActions`, conversion totals and unknown keys **must not**
cross that boundary. The validation rejects source/citation URLs with embedded
credentials, sensitive token query parameters, fragments or local/non-public
hosts. This is an input-surface reduction, not proof that a chosen public link
was independently verified or that all possible personal information is
automatically redacted.

Public-facing clients should provide a deliberate data-minimization step;
the original internal source remains intact and separately governed. Neither
the no-auth ASSIST roster nor the public Market x402 contract may act as a
private evidence export. All payable operations remain held until the proper
seller and recipient have independently received their original grants and
commercial rights.

## Reusable, bounded x402-visible computation (not yet for sale)

The original producer now exports `@561-group/publication-discovery-services-section/paid-discovery` with two ordinary source-owned Node 22+ functions: `admitPaidDiscoveryReport(body)` and `computePaidDiscoveryReport(body)`. These directly consume the existing seven-layer declared publication audit and the witnessed query panel summarizer. They do **not** create a second scanner, query engine, customer observations, payment rail, free-text inference claim or GEO score.

One caller submits `{ dataClassification: "public-only", manifest, panel, observations, sources }`: a public self-supplied publication manifest, a versioned panel of 1–32 questions, 0–128 typed observed answers and three HTTPS reference URLs naming the inputs. The x402-specific admission refuses a body above 64 KiB and refuses screenshot/provider-export/note evidence (only public HTTPS `url` and `citation` evidence are permitted). The original reader still validates query identity, geographic context and distinct provider observation instants. Its readout marks absent observations as missing, caller-provided source claims as **not independently verified**, and actual search/commerce effects as **not assessed**.

The original Networking x402 market can bind those two exports as a validation and compute pair. Any seller tariff, ledger payee, merchant, release, privacy policy, customer order, refund and live x402 transaction remains a **separate** authorized Causeway Market/Coesite operation. This repository still has `private: true` and is **not** evidence of an installed x402 route or service revenue. Source native checks: `npm --prefix red-cup-engineering/publication-discovery-engineering-services-section run check && npm --prefix red-cup-engineering/publication-discovery-engineering-services-section run verify` and `npm --prefix red-cup-engineering/publication-discovery-engineering-services-section run test:paid-discovery`. Do not publish a paid listing until the existing Market catalog, package forest and provider receiving have been independently verified.

An internal MetroPlat office and Enterprise ASSIST may call the very same pure producer under their original authenticated source/custody grants. External customers may pay a merchant for this bounded algorithm only after the seller separately receives truthful input/output schema, tariff, pricing and refund conditions. Private Search Console exports and associate-submitted advertisements belong to different consented services, never this public computation.


## Reuse discovered knowledge; stop doing a first SEO/GEO research pass in every app

The [original MAPE-K publication-discovery procedure](content/processes/publication-discovery-cycle.json)
now carries \`standingKnowledge\`: established findings with source references,
acceptance dates and **explicit witnessed change triggers**. The same knowledge
is reused by Enterprise ASSIST, TUFTE/public publishing receivers and authorized
operational apps. Merely invoking an app, revisiting Google's documentation, or
running a familiar query is **not** a new discovery or a reason to re-open a
settled practice. Superseding evidence triggers a targeted revalidation.

Red Cup Engineering owns the **single executable projector**
\`src/plan-discovery-work.mjs\` in the existing
[Publication Discovery engine](https://github.com/red-cup-engineering/publication-discovery-engineering-services-section).
The source-owned [561 contexts](content/query-sets/561-group-observation-contexts.json)
use only actually observed ChatGPT Web search interfaces, keeping fast/slow
and unknown locale separate; they are **not provider credentials**.
\`content/observations/\` remains the sole evidence ledger. On the current,
unreceived site release, the computed result must be \`held\`, not fabricated
search improvements. A source-qualified independent release enables a bounded
\`ready\` observation turn; a query already observed after that release becomes
\`settled\` until a genuinely newer release. The same input yields the same
stable work IDs, reusable facts, and no extra browsing.

The app-facing output is a pure versioned JSON contract, optionally composed
into \`projectAssistDiscovery(...)\`; consumers must admit publisher/tenant
scope before showing private data, preserve original Work and review authority,
and verify publication/reader/merchant outcomes independently. The candidate
engine source is not proof of an installed ASSIST, website or MetroPlat service.


## Software Fabrication ASSIST: source-first SEO and AI-answer discovery

The [Leader's full agentic SDLC / Software Mind requirement](https://github.com/red-cup-engineering/assist/issues/32) and [draft source-owned ASSIST product PR #33](https://github.com/red-cup-engineering/assist/pull/33) are **not a hosted public product** or an indexing-success claim. This original Publication Discovery service now owns a separate, focused [18-query Software Fabrication ASSIST panel](content/query-sets/software-fabrication-assist.json), rather than adding a second GEO scanner or editing the canonical corporate panel to advertise an unlaunched app.

The prelaunch panel contains five branded identity/technology questions, nine unbranded technical and commercial buyer-intent questions, and four independent control questions (DORA, Software Mind, GitLab, GitHub). Each has a declared intent, topic, role and falsifiable expected answer. For unbranded questions, an answer is **not required** to include 561 Group. Every provider response must be independently witnessed, dated and source-qualified; no request packet counts as a real search impression, citation, indexed page, generated-answer retrieval or signed customer conversion.

The already owned query-panel code can compile requests without network or imaginary answer observations:

```sh
node red-cup-engineering/publication-discovery-engineering-services-section/src/query-panel.mjs \
  content/query-sets/software-fabrication-assist.json --surface "Bing Search" --runs 2
```

That selection is **36 requested observations**, not 36 results. Keep provider-specific ChatGPT/Google AI surface and locale observations in distinct controls. Later add only real public observations to the original dated JSONL ledger through the original recorder; until then the count of witnessed ASSIST answer citations remains **unknown**, not zero. This panel is the source-side instrument for SEO/GEO measurement, separate from the original public publisher's right to release real product documentation and the original customer authority to publish case studies.

The first operational SEO gate is an independently responding, source-bound canonical public service page with an accurate title, crawl/robots/sitemap behavior, accessible original content, clear customer and security disclosures, and first-party links back to original technical work. The second is real search and answer findability, citation attribution and qualified visitor outcomes measured on fixed comparison panels. The third is real customer software received and, when applicable, settled. Do not infer any later gate from an earlier file, source test or structured data. This follows [Google's 2026 generative-search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), which retains ordinary SEO fundamentals and values genuine non-commodity content.
