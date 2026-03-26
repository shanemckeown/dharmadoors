import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'data', 'sanghamap.db');
const sqlite = sqlite3.verbose();

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✓ Connected to database');
          resolve(this.db);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Save a Buddhist center
  async saveCenter(center) {
    // Check if already exists by place ID
    if (center.google_place_id) {
      const existing = await this.get(
        'SELECT id FROM centers WHERE google_place_id = ?',
        [center.google_place_id]
      );
      if (existing) {
        return { id: existing.id, isDuplicate: true };
      }
    }

    const sql = `
      INSERT INTO centers (
        name, google_place_id,
        full_address, street_address, city, state_province, postal_code, country, country_code,
        latitude, longitude,
        phone, website,
        google_rating, review_count, google_maps_url,
        detected_tradition, detected_type, affiliation, concern_status,
        opening_hours,
        search_term, search_location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      center.name,
      center.google_place_id,
      center.full_address,
      center.street_address,
      center.city,
      center.state_province,
      center.postal_code,
      center.country,
      center.country_code,
      center.latitude,
      center.longitude,
      center.phone,
      center.website,
      center.google_rating,
      center.review_count,
      center.google_maps_url,
      center.detected_tradition,
      center.detected_type,
      center.affiliation,
      center.concern_status,
      center.opening_hours ? JSON.stringify(center.opening_hours) : null,
      center.search_term,
      center.search_location,
    ];

    try {
      const result = await this.run(sql, params);
      return { id: result.id, isDuplicate: false };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        return { id: null, isDuplicate: true };
      }
      throw error;
    }
  }

  // Progress tracking for resumable runs
  async markSearchPending(searchTerm, city, country) {
    const sql = `
      INSERT OR IGNORE INTO scrape_progress (search_term, city, country, status)
      VALUES (?, ?, ?, 'pending')
    `;
    await this.run(sql, [searchTerm, city, country]);
  }

  async markSearchStarted(searchTerm, city, country) {
    const sql = `
      UPDATE scrape_progress
      SET status = 'running', started_at = CURRENT_TIMESTAMP
      WHERE search_term = ? AND city = ? AND country = ?
    `;
    await this.run(sql, [searchTerm, city, country]);
  }

  async markSearchCompleted(searchTerm, city, country, resultsFound) {
    const sql = `
      UPDATE scrape_progress
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP, results_found = ?
      WHERE search_term = ? AND city = ? AND country = ?
    `;
    await this.run(sql, [resultsFound, searchTerm, city, country]);
  }

  async markSearchError(searchTerm, city, country, errorMessage) {
    const sql = `
      UPDATE scrape_progress
      SET status = 'error', error_message = ?
      WHERE search_term = ? AND city = ? AND country = ?
    `;
    await this.run(sql, [errorMessage, searchTerm, city, country]);
  }

  async isSearchCompleted(searchTerm, city, country) {
    const row = await this.get(
      `SELECT status FROM scrape_progress WHERE search_term = ? AND city = ? AND country = ?`,
      [searchTerm, city, country]
    );
    return row && row.status === 'completed';
  }

  async getPendingSearches() {
    return await this.all(
      `SELECT search_term, city, country FROM scrape_progress WHERE status = 'pending' OR status = 'running'`
    );
  }

  // Logging
  async startScrapeLog() {
    const result = await this.run(
      `INSERT INTO scrape_logs (status) VALUES ('running')`
    );
    return result.id;
  }

  async updateScrapeLog(logId, stats) {
    const sql = `
      UPDATE scrape_logs SET
        completed_at = CURRENT_TIMESTAMP,
        total_searches = ?,
        total_found = ?,
        total_saved = ?,
        total_duplicates = ?,
        total_errors = ?,
        duration_seconds = (strftime('%s', 'now') - strftime('%s', started_at)),
        status = ?
      WHERE id = ?
    `;
    await this.run(sql, [
      stats.totalSearches,
      stats.totalFound,
      stats.totalSaved,
      stats.totalDuplicates,
      stats.totalErrors,
      stats.status,
      logId,
    ]);
  }

  // Stats
  async getStats() {
    const centers = await this.get(`SELECT COUNT(*) as count FROM centers`);
    const byCountry = await this.all(
      `SELECT country, COUNT(*) as count FROM centers GROUP BY country ORDER BY count DESC LIMIT 20`
    );
    const byTradition = await this.all(
      `SELECT detected_tradition, COUNT(*) as count FROM centers WHERE detected_tradition IS NOT NULL GROUP BY detected_tradition ORDER BY count DESC`
    );
    const byAffiliation = await this.all(
      `SELECT affiliation, COUNT(*) as count FROM centers WHERE affiliation IS NOT NULL GROUP BY affiliation ORDER BY count DESC`
    );
    const withConcerns = await this.get(
      `SELECT COUNT(*) as count FROM centers WHERE concern_status = 'documented'`
    );
    const searchProgress = await this.get(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM scrape_progress`
    );

    return {
      totalCenters: centers.count,
      byCountry,
      byTradition,
      byAffiliation,
      withConcerns: withConcerns.count,
      searchProgress,
    };
  }
}

const db = new Database();
export default db;
