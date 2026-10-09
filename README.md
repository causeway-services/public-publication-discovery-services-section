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
