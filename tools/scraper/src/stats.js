import db from './db.js';

async function showStats() {
  await db.connect();

  const stats = await db.getStats();

  console.log('');
  console.log('═'.repeat(60));
  console.log('🙏 SanghaMap Database Statistics');
  console.log('═'.repeat(60));
  console.log('');
  console.log(`Total Buddhist Centers: ${stats.totalCenters.toLocaleString()}`);
  console.log('');

  if (stats.searchProgress) {
    console.log('📍 Search Progress:');
    console.log(`   Total searches queued: ${stats.searchProgress.total}`);
    console.log(`   Completed: ${stats.searchProgress.completed}`);
    console.log(`   Pending: ${stats.searchProgress.pending}`);
    console.log('');
  }

  if (stats.byCountry && stats.byCountry.length > 0) {
    console.log('🌏 By Country (Top 20):');
    stats.byCountry.forEach(({ country, count }) => {
      console.log(`   ${country || 'Unknown'}: ${count.toLocaleString()}`);
    });
    console.log('');
  }

  if (stats.byTradition && stats.byTradition.length > 0) {
    console.log('☸️ By Tradition:');
    stats.byTradition.forEach(({ detected_tradition, count }) => {
      console.log(`   ${detected_tradition || 'Unknown'}: ${count.toLocaleString()}`);
    });
    console.log('');
  }

  if (stats.byAffiliation && stats.byAffiliation.length > 0) {
    console.log('🏷️ By Affiliation:');
    stats.byAffiliation.forEach(({ affiliation, count }) => {
      console.log(`   ${affiliation}: ${count.toLocaleString()}`);
    });
    console.log('');
  }

  if (stats.withConcerns > 0) {
    console.log(`⚠️ Centers with documented concerns: ${stats.withConcerns}`);
    console.log('   (Hidden by default in UI - requires opt-in to view)');
    console.log('');
  }

  console.log('═'.repeat(60));

  await db.close();
}

showStats().catch(console.error);
