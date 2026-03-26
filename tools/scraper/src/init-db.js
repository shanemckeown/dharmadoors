import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'data', 'sanghamap.db');
const sqlite = sqlite3.verbose();

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('✓ Connected to database:', dbPath);
});

const schema = `
-- Buddhist Centers table with full address details
CREATE TABLE IF NOT EXISTS centers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Basic info
  name TEXT NOT NULL,
  google_place_id TEXT UNIQUE,

  -- Full address (what we really need!)
  full_address TEXT,
  street_address TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,
  country_code TEXT,

  -- Coordinates (for map display)
  latitude REAL,
  longitude REAL,

  -- Contact
  phone TEXT,
  website TEXT,

  -- Google Maps data
  google_rating REAL,
  review_count INTEGER,
  google_maps_url TEXT,

  -- Classification
  detected_tradition TEXT,
  detected_type TEXT,  -- temple, monastery, center, etc.
  affiliation TEXT,    -- shambhala, rigpa, nkt, fpmt, etc.
  concern_status TEXT, -- 'documented' | 'resolved' | null

  -- Opening hours (JSON)
  opening_hours TEXT,

  -- Scraping metadata
  search_term TEXT,
  search_location TEXT,
  source TEXT DEFAULT 'GoogleMaps',
  scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- For manual review
  needs_review INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 0,
  notes TEXT
);

-- Index for deduplication and fast lookups
CREATE INDEX IF NOT EXISTS idx_centers_place_id ON centers(google_place_id);
CREATE INDEX IF NOT EXISTS idx_centers_country ON centers(country);
CREATE INDEX IF NOT EXISTS idx_centers_tradition ON centers(detected_tradition);
CREATE INDEX IF NOT EXISTS idx_centers_affiliation ON centers(affiliation);
CREATE INDEX IF NOT EXISTS idx_centers_concern ON centers(concern_status);
CREATE INDEX IF NOT EXISTS idx_centers_coords ON centers(latitude, longitude);

-- Scraping progress tracking (for overnight runs)
CREATE TABLE IF NOT EXISTS scrape_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  search_term TEXT,
  city TEXT,
  country TEXT,
  status TEXT DEFAULT 'pending',  -- pending, completed, error
  results_found INTEGER DEFAULT 0,
  started_at DATETIME,
  completed_at DATETIME,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_progress_status ON scrape_progress(status);

-- Scraping logs
CREATE TABLE IF NOT EXISTS scrape_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  total_searches INTEGER,
  total_found INTEGER,
  total_saved INTEGER,
  total_duplicates INTEGER,
  total_errors INTEGER,
  duration_seconds INTEGER,
  status TEXT
);
`;

db.exec(schema, (err) => {
  if (err) {
    console.error('Error creating schema:', err);
    process.exit(1);
  }

  console.log('✓ Database schema created successfully');
  console.log('');
  console.log('Tables created:');
  console.log('  • centers - Buddhist temples and meditation centers');
  console.log('  • scrape_progress - Tracks which searches are done (for resume)');
  console.log('  • scrape_logs - Overall scraping session logs');

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('');
      console.log('✓ Database ready at:', dbPath);
    }
  });
});
