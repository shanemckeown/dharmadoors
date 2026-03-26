import { chromium } from 'playwright';
import db from './db.js';
import { SEARCH_TERMS, GLOBAL_CITIES } from './cities.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * SanghaMap Scraper - Buddhist Temples & Meditation Centers
 *
 * Key improvement over basic scraping: clicks into each listing
 * to extract FULL address details, not just what's in the list view.
 */
class SanghaMapScraper {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.testMode = options.testMode || false;
    this.stats = {
      totalSearches: 0,
      totalFound: 0,
      totalSaved: 0,
      totalDuplicates: 0,
      totalErrors: 0,
    };
  }

  async init() {
    console.log('🙏 Initializing SanghaMap scraper...');
    console.log('   Mode:', this.testMode ? 'TEST (limited searches)' : 'FULL');
    console.log('');

    this.browser = await chromium.launch({
      headless: false, // Visible so you can monitor overnight
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    this.page = await context.newPage();
    console.log('✓ Browser initialized');
  }

  async searchAndExtract(searchTerm, city, country) {
    const query = `${searchTerm} in ${city}, ${country}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

    console.log(`\n📍 Searching: "${query}"`);

    try {
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      await sleep(3000);

      // Handle cookie consent
      try {
        const acceptBtn = await this.page.$('button:has-text("Accept all")');
        if (acceptBtn) {
          await acceptBtn.click();
          await sleep(1000);
        }
      } catch (e) {
        // No cookie popup
      }

      await sleep(2000);

      // Scroll results panel to load more
      await this.scrollResultsPanel();

      // Get all listing links
      const listings = await this.getListingLinks();
      console.log(`   Found ${listings.length} listings`);

      const centers = [];

      // Click into each listing to get full details
      for (let i = 0; i < listings.length; i++) {
        try {
          const center = await this.extractCenterDetails(listings[i], i + 1, listings.length);
          if (center) {
            center.search_term = searchTerm;
            center.search_location = `${city}, ${country}`;
            centers.push(center);
          }
        } catch (error) {
          console.log(`   ⚠️ Error extracting listing ${i + 1}:`, error.message);
          this.stats.totalErrors++;
        }

        // Small delay between listings
        await sleep(1500);
      }

      return centers;
    } catch (error) {
      console.error(`❌ Search failed:`, error.message);
      return [];
    }
  }

  async scrollResultsPanel() {
    try {
      await this.page.evaluate(() => {
        const panel =
          document.querySelector('[role="feed"]') ||
          document.querySelector('.m6QErb.DxyBCb.kA9KIf.dS8AEf');

        if (panel) {
          let scrolls = 0;
          const interval = setInterval(() => {
            panel.scrollTop += 500;
            scrolls++;
            if (scrolls >= 8) clearInterval(interval);
          }, 800);
        }
      });

      await sleep(7000);
    } catch (error) {
      console.log('   Could not scroll results');
    }
  }

  async getListingLinks() {
    return await this.page.evaluate(() => {
      const links = [];
      const seen = new Set();

      // Find all listing links
      document.querySelectorAll('a[href*="/maps/place/"]').forEach((el) => {
        const href = el.href;
        if (!seen.has(href) && href.includes('/maps/place/')) {
          seen.add(href);
          links.push(href);
        }
      });

      return links;
    });
  }

  async extractCenterDetails(placeUrl, index, total) {
    console.log(`   [${index}/${total}] Extracting details...`);

    await this.page.goto(placeUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await sleep(2500);

    // Extract all details from the place page
    const details = await this.page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : null;
      };

      const getAttr = (selector, attr) => {
        const el = document.querySelector(selector);
        return el ? el.getAttribute(attr) : null;
      };

      // Name - usually in h1 or specific class
      const name =
        getText('h1.DUwDvf') ||
        getText('h1[data-attrid="title"]') ||
        getText('.qBF1Pd.fontHeadlineLarge');

      // Full address - look for the address button/link
      let fullAddress = null;
      const addressBtn = document.querySelector('button[data-item-id="address"]');
      if (addressBtn) {
        fullAddress = addressBtn.textContent.trim();
      } else {
        // Try other selectors
        const addressEl = document.querySelector('[data-item-id*="address"]');
        if (addressEl) fullAddress = addressEl.textContent.trim();
      }

      // Phone
      let phone = null;
      const phoneBtn = document.querySelector('button[data-item-id*="phone"]');
      if (phoneBtn) {
        phone = phoneBtn.textContent.replace(/[^0-9+\-\s()]/g, '').trim();
      }

      // Website
      let website = null;
      const websiteLink = document.querySelector('a[data-item-id="authority"]');
      if (websiteLink) {
        website = websiteLink.href;
      }

      // Rating
      let rating = null;
      let reviewCount = null;
      const ratingEl = document.querySelector('.F7nice span[aria-hidden="true"]');
      if (ratingEl) {
        const ratingMatch = ratingEl.textContent.match(/(\d+\.?\d*)/);
        if (ratingMatch) rating = parseFloat(ratingMatch[1]);
      }
      const reviewEl = document.querySelector('.F7nice span:last-child');
      if (reviewEl) {
        const reviewMatch = reviewEl.textContent.match(/\(([\d,]+)\)/);
        if (reviewMatch) reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
      }

      // Opening hours
      let openingHours = null;
      const hoursTable = document.querySelector('table.eK4R0e');
      if (hoursTable) {
        openingHours = {};
        hoursTable.querySelectorAll('tr').forEach((row) => {
          const day = row.querySelector('td:first-child')?.textContent.trim();
          const hours = row.querySelector('td:last-child')?.textContent.trim();
          if (day && hours) openingHours[day] = hours;
        });
      }

      // Place ID from URL
      let placeId = null;
      const urlMatch = window.location.href.match(/place\/([^/]+)/);
      if (urlMatch) {
        placeId = decodeURIComponent(urlMatch[1]).replace(/\+/g, ' ');
      }

      // Lat/lng from URL
      let latitude = null;
      let longitude = null;
      const coordMatch = window.location.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        latitude = parseFloat(coordMatch[1]);
        longitude = parseFloat(coordMatch[2]);
      }

      return {
        name,
        fullAddress,
        phone,
        website,
        rating,
        reviewCount,
        openingHours,
        placeId,
        latitude,
        longitude,
        url: window.location.href,
      };
    });

    if (!details.name) {
      console.log(`   ⚠️ Could not extract name, skipping`);
      return null;
    }

    // Parse address into components
    const addressParts = this.parseAddress(details.fullAddress);

    // Detect tradition and affiliation from name
    const tradition = this.detectTradition(details.name);
    const centerType = this.detectCenterType(details.name);
    const { affiliation, concernStatus } = this.detectAffiliation(details.name, details.website);

    console.log(`   ✓ ${details.name}`);
    if (details.fullAddress) {
      console.log(`     📫 ${details.fullAddress}`);
    }
    if (affiliation) {
      console.log(`     🏷️ ${affiliation}${concernStatus ? ' ⚠️' : ''}`);
    }

    return {
      name: details.name,
      google_place_id: details.placeId,
      full_address: details.fullAddress,
      street_address: addressParts.street,
      city: addressParts.city,
      state_province: addressParts.state,
      postal_code: addressParts.postalCode,
      country: addressParts.country,
      country_code: addressParts.countryCode,
      latitude: details.latitude,
      longitude: details.longitude,
      phone: details.phone,
      website: details.website,
      google_rating: details.rating,
      review_count: details.reviewCount,
      google_maps_url: details.url,
      detected_tradition: tradition,
      detected_type: centerType,
      affiliation: affiliation,
      concern_status: concernStatus,
      opening_hours: details.openingHours,
    };
  }

  parseAddress(fullAddress) {
    if (!fullAddress) return {};

    // Basic parsing - this is imperfect but catches most cases
    const parts = fullAddress.split(',').map((p) => p.trim());

    // Usually: street, city, state/postal, country
    const result = {
      street: parts[0] || null,
      city: parts.length > 2 ? parts[parts.length - 3] : null,
      state: null,
      postalCode: null,
      country: parts[parts.length - 1] || null,
      countryCode: null,
    };

    // Try to extract postal code (various formats)
    const postalMatch = fullAddress.match(/\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}|\d{5}(-\d{4})?|\d{4,6})\b/i);
    if (postalMatch) {
      result.postalCode = postalMatch[1];
    }

    return result;
  }

  detectTradition(name) {
    const lower = name.toLowerCase();

    if (lower.includes('theravada') || lower.includes('vipassana') || lower.includes('insight')) {
      return 'theravada';
    }
    if (lower.includes('tibetan') || lower.includes('vajrayana') || lower.includes('gelug') ||
        lower.includes('kagyu') || lower.includes('nyingma') || lower.includes('sakya') ||
        lower.includes('fpmt') || lower.includes('kadampa') || lower.includes('shambhala')) {
      return 'vajrayana';
    }
    if (lower.includes('zen') || lower.includes('chan') || lower.includes('seon') ||
        lower.includes('rinzai') || lower.includes('soto')) {
      return 'zen';
    }
    if (lower.includes('pure land') || lower.includes('jodo') || lower.includes('shin')) {
      return 'pure_land';
    }
    if (lower.includes('nichiren') || lower.includes('sgi') || lower.includes('soka')) {
      return 'nichiren';
    }
    if (lower.includes('mahayana') || lower.includes('chinese') || lower.includes('vietnamese') ||
        lower.includes('korean') || lower.includes('fo guang') || lower.includes('hsi lai')) {
      return 'mahayana';
    }
    if (lower.includes('secular') || lower.includes('mbsr') || lower.includes('mindfulness')) {
      return 'secular';
    }

    return null; // Unknown - needs manual review
  }

  detectCenterType(name) {
    const lower = name.toLowerCase();

    if (lower.includes('monastery') || lower.includes('wat ') || lower.includes('vihara')) {
      return 'monastery';
    }
    if (lower.includes('temple')) {
      return 'temple';
    }
    if (lower.includes('center') || lower.includes('centre')) {
      return 'center';
    }
    if (lower.includes('sangha') || lower.includes('community')) {
      return 'community';
    }
    if (lower.includes('retreat')) {
      return 'retreat';
    }

    return 'center'; // Default
  }

  /**
   * Detect organizational affiliation from name and website.
   * Returns { affiliation, concernStatus }
   *
   * concernStatus values:
   * - 'documented': Legitimate Buddhism with documented ethical concerns
   * - 'not_buddhism': Uses Buddhist imagery but is not recognized as Buddhism
   * - 'resolved': Had concerns but has implemented reforms
   * - null: No known concerns
   */
  detectAffiliation(name, website = '') {
    const lower = (name + ' ' + (website || '')).toLowerCase();

    // =========================================================================
    // NOT BUDDHISM - New Religious Movements using Buddhist imagery
    // These appear first because they should be clearly distinguished
    // =========================================================================
    if (lower.includes('falun') || lower.includes('falun gong') || lower.includes('falun dafa')) {
      return { affiliation: 'falun_gong', concernStatus: 'not_buddhism' };
    }
    if (lower.includes('supreme master') || lower.includes('ching hai') || lower.includes('suma ching hai') ||
        lower.includes('quan yin method') || lower.includes('loving hut')) {
      return { affiliation: 'ching_hai', concernStatus: 'not_buddhism' };
    }
    if (lower.includes('true buddha') || lower.includes('lu sheng-yen') || lower.includes('grand master lu') ||
        lower.includes('真佛宗')) {
      return { affiliation: 'true_buddha', concernStatus: 'not_buddhism' };
    }
    if (lower.includes('happy science') || lower.includes('ryuho okawa') || lower.includes('el cantare') ||
        lower.includes('幸福の科学')) {
      return { affiliation: 'happy_science', concernStatus: 'not_buddhism' };
    }
    if (lower.includes('i-kuan tao') || lower.includes('i kuan tao') || lower.includes('yiguandao') ||
        lower.includes('一貫道')) {
      return { affiliation: 'i_kuan_tao', concernStatus: 'not_buddhism' };
    }

    // =========================================================================
    // Buddhist organizations with documented concerns (hidden by default)
    // =========================================================================
    if (lower.includes('shambhala')) {
      return { affiliation: 'shambhala', concernStatus: 'documented' };
    }
    if (lower.includes('rigpa') && !lower.includes('dzogchen')) {
      // Be careful - "rigpa" is also a Dzogchen term
      return { affiliation: 'rigpa', concernStatus: 'documented' };
    }
    if (lower.includes('kadampa') || lower.includes('nkt') || lower.includes('new kadampa')) {
      return { affiliation: 'nkt', concernStatus: 'documented' };
    }
    if (lower.includes('diamond way') || lower.includes('ole nydahl')) {
      return { affiliation: 'diamond_way', concernStatus: 'documented' };
    }
    if (lower.includes('triratna') || lower.includes('fwbo') || lower.includes('western buddhist order')) {
      return { affiliation: 'triratna', concernStatus: 'documented' };
    }
    if (lower.includes('dhammakaya') || lower.includes('wat phra dhammakaya') || lower.includes('dhammachayo')) {
      return { affiliation: 'dhammakaya', concernStatus: 'documented' };
    }

    // =========================================================================
    // Buddhist organizations without documented concerns
    // =========================================================================
    if (lower.includes('fpmt') || lower.includes('foundation for the preservation')) {
      return { affiliation: 'fpmt', concernStatus: null };
    }
    if (lower.includes('plum village') || lower.includes('thich nhat hanh') || lower.includes('thay')) {
      return { affiliation: 'plum_village', concernStatus: null };
    }
    if (lower.includes('goenka') || lower.includes('vipassana.dhamma')) {
      return { affiliation: 'goenka', concernStatus: null };
    }
    if (lower.includes('spirit rock')) {
      return { affiliation: 'spirit_rock', concernStatus: null };
    }
    if (lower.includes('insight meditation society') || lower.includes('ims barre')) {
      return { affiliation: 'ims', concernStatus: null };
    }
    if (lower.includes('tergar') || lower.includes('mingyur rinpoche')) {
      return { affiliation: 'tergar', concernStatus: null };
    }
    if (lower.includes('sgi') || lower.includes('soka gakkai')) {
      return { affiliation: 'sgi', concernStatus: null };
    }
    if (lower.includes('dzogchen community') || lower.includes('namkhai norbu')) {
      return { affiliation: 'dzogchen', concernStatus: null };
    }

    return { affiliation: null, concernStatus: null };
  }

  async scrape() {
    try {
      await db.connect();
      await this.init();

      const logId = await db.startScrapeLog();
      const searchTerms = this.testMode ? SEARCH_TERMS.slice(0, 2) : SEARCH_TERMS;
      const cities = this.testMode ? GLOBAL_CITIES.slice(0, 3) : GLOBAL_CITIES;

      const totalSearches = searchTerms.length * cities.length;
      let searchCount = 0;

      console.log(`\n🎯 Planning ${totalSearches} searches`);
      console.log(`   ${searchTerms.length} search terms × ${cities.length} cities`);
      console.log(`   Estimated time: ${Math.round((totalSearches * 20) / 60)} minutes`);
      console.log('─'.repeat(60));

      // Queue all searches
      for (const term of searchTerms) {
        for (const { city, country } of cities) {
          await db.markSearchPending(term, city, country);
        }
      }

      // Process searches
      for (const term of searchTerms) {
        for (const { city, country } of cities) {
          searchCount++;
          this.stats.totalSearches = searchCount;

          // Check if already completed (for resume capability)
          const completed = await db.isSearchCompleted(term, city, country);
          if (completed) {
            console.log(`\n[${searchCount}/${totalSearches}] ⏭️ Skipping (already done): ${term} in ${city}`);
            continue;
          }

          console.log(`\n[${searchCount}/${totalSearches}] (${Math.round((searchCount / totalSearches) * 100)}%)`);

          await db.markSearchStarted(term, city, country);

          try {
            const centers = await this.searchAndExtract(term, city, country);
            this.stats.totalFound += centers.length;

            // Save each center
            for (const center of centers) {
              try {
                const result = await db.saveCenter(center);
                if (result.isDuplicate) {
                  this.stats.totalDuplicates++;
                } else {
                  this.stats.totalSaved++;
                }
              } catch (error) {
                console.log(`   ⚠️ Error saving:`, error.message);
                this.stats.totalErrors++;
              }
            }

            await db.markSearchCompleted(term, city, country, centers.length);
          } catch (error) {
            console.error(`   ❌ Search error:`, error.message);
            await db.markSearchError(term, city, country, error.message);
            this.stats.totalErrors++;
          }

          // Rate limiting
          console.log('   ⏳ Rate limiting (5s)...');
          await sleep(5000);
        }
      }

      // Update log
      await db.updateScrapeLog(logId, {
        ...this.stats,
        status: 'completed',
      });

      this.printSummary();
    } catch (error) {
      console.error('❌ Scraping failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  printSummary() {
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('🙏 SanghaMap Scraping Complete!');
    console.log('═'.repeat(60));
    console.log(`   Searches completed: ${this.stats.totalSearches}`);
    console.log(`   Centers found:      ${this.stats.totalFound}`);
    console.log(`   New centers saved:  ${this.stats.totalSaved}`);
    console.log(`   Duplicates:         ${this.stats.totalDuplicates}`);
    console.log(`   Errors:             ${this.stats.totalErrors}`);
    console.log('═'.repeat(60));
    console.log('');
    console.log('Run `npm run stats` to see breakdown by country/tradition');
    console.log('Run `npm run export` to export to CSV for import to PostgreSQL');
  }

  async cleanup() {
    console.log('\n🎬 Closing browser...');
    await sleep(2000);

    if (this.browser) {
      await this.browser.close();
    }
    await db.close();
  }
}

// CLI entry point
const isTestMode = process.argv.includes('--test');
const scraper = new SanghaMapScraper({ testMode: isTestMode });
scraper.scrape().catch(console.error);
