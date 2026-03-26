# SanghaMap Scraper

Google Maps scraper for Buddhist temples and meditation centers worldwide.

## Features

- **Full address extraction**: Clicks into each listing to get complete addresses
- **Global coverage**: 180+ cities across all continents
- **Tradition detection**: Auto-classifies Theravada, Vajrayana, Zen, etc.
- **Resumable**: Progress tracking lets you stop and restart anytime
- **Rate limited**: 5 second delays to avoid detection
- **Overnight ready**: Run with `nohup` for 8+ hour scrapes

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Initialize the database
npm run init-db

# Test run (2 search terms × 3 cities)
npm run scrape:test

# Full run (~13 hours for all cities)
npm run scrape
```

## Overnight Run

```bash
# Start scraping in background (keeps running after terminal closes)
nohup npm run scrape > logs/scrape-$(date +%Y%m%d).log 2>&1 &

# Check progress
npm run stats

# Watch the log
tail -f logs/scrape-*.log
```

## Configuration

Edit `src/cities.js` to customize:

- **SEARCH_TERMS**: Buddhist-specific search queries
- **GLOBAL_CITIES**: Cities to search (currently ~180)

## Output

Data is stored in `data/sanghamap.db` (SQLite).

To export for PostgreSQL:

```bash
npm run export
# Creates data/sanghamap_export_YYYY-MM-DD.csv
```

## Schema

Each center includes:

| Field | Description |
|-------|-------------|
| name | Temple/center name |
| full_address | Complete street address |
| latitude, longitude | Map coordinates |
| phone, website | Contact info |
| google_rating | Star rating (1-5) |
| detected_tradition | theravada, vajrayana, zen, etc. |
| detected_type | temple, monastery, center, retreat |
| opening_hours | JSON of weekly hours |

## Estimated Yield

- 12 search terms × 180 cities = 2,160 searches
- Each search yields 5-20 results
- Expected: **10,000-40,000 Buddhist centers globally**
- Run time: ~13 hours (at 20 sec per search with rate limiting)
