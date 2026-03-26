import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'data', 'sanghamap.db');
const sqlite = sqlite3.verbose();

console.log('🔄 Running migrations...');

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Add new columns if they don't exist
const migrations = [
  `ALTER TABLE centers ADD COLUMN affiliation TEXT`,
  `ALTER TABLE centers ADD COLUMN concern_status TEXT`,
  `CREATE INDEX IF NOT EXISTS idx_centers_affiliation ON centers(affiliation)`,
  `CREATE INDEX IF NOT EXISTS idx_centers_concern ON centers(concern_status)`,
];

let completed = 0;

migrations.forEach((sql, i) => {
  db.run(sql, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log(`  ⚠️ Migration ${i + 1}: ${err.message}`);
    } else if (!err) {
      console.log(`  ✓ Migration ${i + 1} applied`);
    } else {
      console.log(`  ⏭️ Migration ${i + 1} already applied`);
    }

    completed++;
    if (completed === migrations.length) {
      db.close(() => {
        console.log('');
        console.log('✓ Migrations complete');
      });
    }
  });
});
