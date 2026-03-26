# TODOS

## SanghaMap

### Repurpose Google scraper as enrichment tool

**What:** Adapt the existing Playwright scraper to enrich OSM center records with Google-sourced data (reviews, phone, website, opening hours).

**Why:** OSM data lacks reviews, ratings, and opening hours. The scraper already extracts this data — it just needs to match against OSM records instead of being the primary source.

**Context:** The scraper covers 165 cities x 13 search terms (~2,145 searches). During CEO review, OSM was chosen as primary data source (108K+ centers vs scraper's ~5K-40K). The scraper is repositioned as an enrichment tool that adds Google-specific data to OSM records. Key challenge: matching scraped centers to OSM records by name/location proximity. Known scraper bugs (place_id extraction, country_code, headless:false) should be fixed as part of this work.

**Effort:** M
**Priority:** P3
**Depends on:** OSM data pipeline must be complete first

### Per-city SEO landing pages

**What:** Generate static landing pages for major cities (e.g., /sanghamap/melbourne, /sanghamap/london) optimized for "Buddhist temples in [city]" search queries.

**Why:** Organic search is the primary discovery channel for a tool like this. "Buddhist temple near me" and "Buddhist temple in [city]" are high-intent searches with low competition.

**Context:** Next.js `generateStaticParams()` can generate these at build time from the GeoJSON data. Each page would show a filtered map view for that city with structured data (Schema.org) for SEO. The city list can be derived from the OSM data itself (centers grouped by city). Start with cities that have 10+ centers for meaningful pages.

**Effort:** M
**Priority:** P2
**Depends on:** OSM data pipeline must be complete first

### Submit a Center form

**What:** Add a "Submit a Center" form that creates a GitHub issue with structured center data for manual review.

**Why:** Enables community contributions without requiring auth, a database, or a moderation system. Fills gaps in OSM data.

**Context:** The existing `CenterInput` type in `packages/types` defines the submission fields (name, tradition, address, website, phone, offerings). MVP path: form → GitHub issue via GitHub API (or mailto link as zero-infra fallback). Shane reviews and ingests manually. If volume exceeds solo capacity, consider community moderators or a simple approval workflow.

**Effort:** S
**Priority:** P2
**Depends on:** None
