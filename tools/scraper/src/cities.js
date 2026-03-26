/**
 * Search terms for Buddhist temples & meditation centers
 * Order matters - more specific terms first for better tradition detection
 */
export const SEARCH_TERMS = [
  // Specific traditions (better for classification)
  'theravada buddhist temple',
  'tibetan buddhist center',
  'zen meditation center',
  'vipassana meditation',
  'pure land buddhist temple',
  'nichiren buddhist',

  // General terms (catch-all)
  'buddhist temple',
  'buddhist monastery',
  'buddhist meditation center',
  'dharma center',
  'meditation center buddhist',

  // Type-specific
  'buddhist retreat center',
  'buddhist sangha',
];

/**
 * Global cities list - organized by region
 * Focus on: (1) Buddhist-majority countries, (2) Large diaspora populations, (3) Major metros
 *
 * ~200 cities = ~2400 searches (12 terms × 200 cities)
 * At 20 sec/search = ~13 hours for full run
 * Each search yields 5-20 results = potentially 12,000-48,000 temples
 */
export const GLOBAL_CITIES = [
  // ============================================
  // ASIA - Buddhist Heartland (most temples here)
  // ============================================

  // Thailand (Theravada hub)
  { city: 'Bangkok', country: 'Thailand' },
  { city: 'Chiang Mai', country: 'Thailand' },
  { city: 'Chiang Rai', country: 'Thailand' },
  { city: 'Phuket', country: 'Thailand' },
  { city: 'Nakhon Ratchasima', country: 'Thailand' },
  { city: 'Udon Thani', country: 'Thailand' },

  // Japan (Zen, Pure Land, Nichiren)
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Kyoto', country: 'Japan' },
  { city: 'Osaka', country: 'Japan' },
  { city: 'Nara', country: 'Japan' },
  { city: 'Kamakura', country: 'Japan' },
  { city: 'Nagoya', country: 'Japan' },
  { city: 'Fukuoka', country: 'Japan' },
  { city: 'Hiroshima', country: 'Japan' },

  // China (Mahayana, Chan)
  { city: 'Beijing', country: 'China' },
  { city: 'Shanghai', country: 'China' },
  { city: 'Hangzhou', country: 'China' },
  { city: 'Xian', country: 'China' },
  { city: 'Chengdu', country: 'China' },
  { city: 'Guangzhou', country: 'China' },
  { city: 'Shenzhen', country: 'China' },
  { city: 'Luoyang', country: 'China' },

  // Taiwan (Mahayana hub)
  { city: 'Taipei', country: 'Taiwan' },
  { city: 'Kaohsiung', country: 'Taiwan' },
  { city: 'Taichung', country: 'Taiwan' },
  { city: 'Hualien', country: 'Taiwan' },

  // South Korea (Seon/Zen)
  { city: 'Seoul', country: 'South Korea' },
  { city: 'Busan', country: 'South Korea' },
  { city: 'Gyeongju', country: 'South Korea' },
  { city: 'Daegu', country: 'South Korea' },

  // Vietnam (Mahayana, Theravada)
  { city: 'Ho Chi Minh City', country: 'Vietnam' },
  { city: 'Hanoi', country: 'Vietnam' },
  { city: 'Hue', country: 'Vietnam' },
  { city: 'Da Nang', country: 'Vietnam' },

  // Myanmar (Theravada)
  { city: 'Yangon', country: 'Myanmar' },
  { city: 'Mandalay', country: 'Myanmar' },
  { city: 'Bagan', country: 'Myanmar' },

  // Sri Lanka (Theravada)
  { city: 'Colombo', country: 'Sri Lanka' },
  { city: 'Kandy', country: 'Sri Lanka' },
  { city: 'Anuradhapura', country: 'Sri Lanka' },

  // Cambodia (Theravada)
  { city: 'Phnom Penh', country: 'Cambodia' },
  { city: 'Siem Reap', country: 'Cambodia' },

  // Laos (Theravada)
  { city: 'Vientiane', country: 'Laos' },
  { city: 'Luang Prabang', country: 'Laos' },

  // Nepal (Vajrayana, Theravada)
  { city: 'Kathmandu', country: 'Nepal' },
  { city: 'Lumbini', country: 'Nepal' },
  { city: 'Pokhara', country: 'Nepal' },

  // India (Birthplace of Buddhism)
  { city: 'Bodh Gaya', country: 'India' },
  { city: 'Dharamsala', country: 'India' },
  { city: 'Mumbai', country: 'India' },
  { city: 'Delhi', country: 'India' },
  { city: 'Bangalore', country: 'India' },
  { city: 'Pune', country: 'India' },
  { city: 'Kolkata', country: 'India' },
  { city: 'Varanasi', country: 'India' },
  { city: 'Sarnath', country: 'India' },

  // Bhutan (Vajrayana)
  { city: 'Thimphu', country: 'Bhutan' },
  { city: 'Paro', country: 'Bhutan' },

  // Mongolia (Vajrayana)
  { city: 'Ulaanbaatar', country: 'Mongolia' },

  // Singapore
  { city: 'Singapore', country: 'Singapore' },

  // Malaysia
  { city: 'Kuala Lumpur', country: 'Malaysia' },
  { city: 'Penang', country: 'Malaysia' },
  { city: 'Ipoh', country: 'Malaysia' },

  // Indonesia
  { city: 'Jakarta', country: 'Indonesia' },
  { city: 'Surabaya', country: 'Indonesia' },
  { city: 'Yogyakarta', country: 'Indonesia' },

  // Hong Kong
  { city: 'Hong Kong', country: 'Hong Kong' },

  // Philippines
  { city: 'Manila', country: 'Philippines' },
  { city: 'Cebu', country: 'Philippines' },

  // ============================================
  // OCEANIA
  // ============================================

  // Australia
  { city: 'Sydney', country: 'Australia' },
  { city: 'Melbourne', country: 'Australia' },
  { city: 'Brisbane', country: 'Australia' },
  { city: 'Perth', country: 'Australia' },
  { city: 'Adelaide', country: 'Australia' },
  { city: 'Canberra', country: 'Australia' },
  { city: 'Gold Coast', country: 'Australia' },
  { city: 'Hobart', country: 'Australia' },

  // New Zealand
  { city: 'Auckland', country: 'New Zealand' },
  { city: 'Wellington', country: 'New Zealand' },
  { city: 'Christchurch', country: 'New Zealand' },

  // ============================================
  // NORTH AMERICA
  // ============================================

  // USA - Major metros
  { city: 'New York', country: 'USA' },
  { city: 'Los Angeles', country: 'USA' },
  { city: 'San Francisco', country: 'USA' },
  { city: 'Seattle', country: 'USA' },
  { city: 'Chicago', country: 'USA' },
  { city: 'Boston', country: 'USA' },
  { city: 'Washington DC', country: 'USA' },
  { city: 'Miami', country: 'USA' },
  { city: 'Houston', country: 'USA' },
  { city: 'Phoenix', country: 'USA' },
  { city: 'Denver', country: 'USA' },
  { city: 'Portland', country: 'USA' },
  { city: 'San Diego', country: 'USA' },
  { city: 'Atlanta', country: 'USA' },
  { city: 'Philadelphia', country: 'USA' },
  { city: 'Dallas', country: 'USA' },
  { city: 'Austin', country: 'USA' },
  { city: 'Minneapolis', country: 'USA' },
  { city: 'Honolulu', country: 'USA' },
  { city: 'Boulder', country: 'USA' }, // Shambhala HQ

  // Canada
  { city: 'Toronto', country: 'Canada' },
  { city: 'Vancouver', country: 'Canada' },
  { city: 'Montreal', country: 'Canada' },
  { city: 'Calgary', country: 'Canada' },
  { city: 'Ottawa', country: 'Canada' },
  { city: 'Edmonton', country: 'Canada' },

  // Mexico
  { city: 'Mexico City', country: 'Mexico' },
  { city: 'Guadalajara', country: 'Mexico' },

  // ============================================
  // EUROPE
  // ============================================

  // UK
  { city: 'London', country: 'United Kingdom' },
  { city: 'Manchester', country: 'United Kingdom' },
  { city: 'Birmingham', country: 'United Kingdom' },
  { city: 'Edinburgh', country: 'United Kingdom' },
  { city: 'Bristol', country: 'United Kingdom' },
  { city: 'Glasgow', country: 'United Kingdom' },
  { city: 'Leeds', country: 'United Kingdom' },
  { city: 'Cambridge', country: 'United Kingdom' },
  { city: 'Oxford', country: 'United Kingdom' },

  // Germany
  { city: 'Berlin', country: 'Germany' },
  { city: 'Munich', country: 'Germany' },
  { city: 'Hamburg', country: 'Germany' },
  { city: 'Frankfurt', country: 'Germany' },
  { city: 'Cologne', country: 'Germany' },

  // France
  { city: 'Paris', country: 'France' },
  { city: 'Lyon', country: 'France' },
  { city: 'Marseille', country: 'France' },
  { city: 'Bordeaux', country: 'France' },

  // Netherlands
  { city: 'Amsterdam', country: 'Netherlands' },
  { city: 'Rotterdam', country: 'Netherlands' },

  // Belgium
  { city: 'Brussels', country: 'Belgium' },

  // Switzerland
  { city: 'Zurich', country: 'Switzerland' },
  { city: 'Geneva', country: 'Switzerland' },
  { city: 'Bern', country: 'Switzerland' },

  // Austria
  { city: 'Vienna', country: 'Austria' },

  // Italy
  { city: 'Rome', country: 'Italy' },
  { city: 'Milan', country: 'Italy' },
  { city: 'Florence', country: 'Italy' },

  // Spain
  { city: 'Madrid', country: 'Spain' },
  { city: 'Barcelona', country: 'Spain' },
  { city: 'Valencia', country: 'Spain' },

  // Portugal
  { city: 'Lisbon', country: 'Portugal' },
  { city: 'Porto', country: 'Portugal' },

  // Ireland
  { city: 'Dublin', country: 'Ireland' },

  // Scandinavia
  { city: 'Stockholm', country: 'Sweden' },
  { city: 'Copenhagen', country: 'Denmark' },
  { city: 'Oslo', country: 'Norway' },
  { city: 'Helsinki', country: 'Finland' },

  // Poland
  { city: 'Warsaw', country: 'Poland' },
  { city: 'Krakow', country: 'Poland' },

  // Czech Republic
  { city: 'Prague', country: 'Czech Republic' },

  // Russia
  { city: 'Moscow', country: 'Russia' },
  { city: 'St Petersburg', country: 'Russia' },
  { city: 'Elista', country: 'Russia' }, // Kalmykia - Buddhist republic

  // Greece
  { city: 'Athens', country: 'Greece' },

  // ============================================
  // SOUTH AMERICA
  // ============================================

  { city: 'Sao Paulo', country: 'Brazil' },
  { city: 'Rio de Janeiro', country: 'Brazil' },
  { city: 'Buenos Aires', country: 'Argentina' },
  { city: 'Santiago', country: 'Chile' },
  { city: 'Lima', country: 'Peru' },
  { city: 'Bogota', country: 'Colombia' },
  { city: 'Medellin', country: 'Colombia' },

  // ============================================
  // AFRICA
  // ============================================

  { city: 'Cape Town', country: 'South Africa' },
  { city: 'Johannesburg', country: 'South Africa' },
  { city: 'Nairobi', country: 'Kenya' },

  // ============================================
  // MIDDLE EAST
  // ============================================

  { city: 'Tel Aviv', country: 'Israel' },
  { city: 'Dubai', country: 'UAE' },
];

// Quick count
console.log(`📊 Configured: ${SEARCH_TERMS.length} search terms × ${GLOBAL_CITIES.length} cities = ${SEARCH_TERMS.length * GLOBAL_CITIES.length} total searches`);
