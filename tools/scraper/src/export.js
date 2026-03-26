import { createObjectCsvWriter } from 'csv-writer';
import db from './db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function exportToCsv() {
  await db.connect();

  const centers = await db.all(`
    SELECT
      name,
      google_place_id,
      full_address,
      street_address,
      city,
      state_province,
      postal_code,
      country,
      country_code,
      latitude,
      longitude,
      phone,
      website,
      google_rating,
      review_count,
      google_maps_url,
      detected_tradition,
      detected_type,
      opening_hours,
      scraped_at
    FROM centers
    ORDER BY country, city, name
  `);

  if (centers.length === 0) {
    console.log('No centers to export');
    await db.close();
    return;
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const outputPath = join(__dirname, '..', 'data', `sanghamap_export_${timestamp}.csv`);

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: 'name', title: 'Name' },
      { id: 'google_place_id', title: 'Google Place ID' },
      { id: 'full_address', title: 'Full Address' },
      { id: 'street_address', title: 'Street Address' },
      { id: 'city', title: 'City' },
      { id: 'state_province', title: 'State/Province' },
      { id: 'postal_code', title: 'Postal Code' },
      { id: 'country', title: 'Country' },
      { id: 'country_code', title: 'Country Code' },
      { id: 'latitude', title: 'Latitude' },
      { id: 'longitude', title: 'Longitude' },
      { id: 'phone', title: 'Phone' },
      { id: 'website', title: 'Website' },
      { id: 'google_rating', title: 'Google Rating' },
      { id: 'review_count', title: 'Review Count' },
      { id: 'google_maps_url', title: 'Google Maps URL' },
      { id: 'detected_tradition', title: 'Tradition' },
      { id: 'detected_type', title: 'Type' },
      { id: 'opening_hours', title: 'Opening Hours (JSON)' },
      { id: 'scraped_at', title: 'Scraped At' },
    ],
  });

  await csvWriter.writeRecords(centers);

  console.log('');
  console.log('✓ Export complete!');
  console.log(`  Records: ${centers.length.toLocaleString()}`);
  console.log(`  Output: ${outputPath}`);
  console.log('');
  console.log('This CSV can be imported to PostgreSQL with:');
  console.log(`  COPY centers FROM '${outputPath}' WITH CSV HEADER;`);

  await db.close();
}

exportToCsv().catch(console.error);
