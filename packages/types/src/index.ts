// DharmaDoors Shared Types

// =============================================================================
// Traditions
// =============================================================================

export type Tradition =
  | 'theravada'
  | 'mahayana'
  | 'vajrayana'
  | 'zen'
  | 'pure_land'
  | 'nichiren'
  | 'secular'
  | 'multi_tradition'
  | 'other';

export const TRADITIONS: Record<Tradition, { label: string; subTraditions: string[] }> = {
  theravada: {
    label: 'Theravada',
    subTraditions: ['Thai Forest', 'Burmese', 'Sri Lankan', 'Western Insight'],
  },
  mahayana: {
    label: 'Mahayana',
    subTraditions: ['Chinese', 'Vietnamese', 'Korean'],
  },
  vajrayana: {
    label: 'Vajrayana/Tibetan',
    subTraditions: ['Gelug', 'Kagyu', 'Nyingma', 'Sakya', 'Rimé'],
  },
  zen: {
    label: 'Zen/Chan/Seon',
    subTraditions: ['Soto', 'Rinzai', 'Sanbo Kyodan', 'Korean Seon'],
  },
  pure_land: {
    label: 'Pure Land',
    subTraditions: ['Jodo Shinshu', 'Jodo Shu', 'Chinese Pure Land'],
  },
  nichiren: {
    label: 'Nichiren',
    subTraditions: ['SGI', 'Nichiren Shu', 'Nichiren Shoshu'],
  },
  secular: {
    label: 'Secular/Non-sectarian',
    subTraditions: ['MBSR', 'Secular Buddhism'],
  },
  multi_tradition: {
    label: 'Multi-tradition',
    subTraditions: [],
  },
  other: {
    label: 'Other',
    subTraditions: [],
  },
};

// =============================================================================
// Offerings
// =============================================================================

export type Offering =
  | 'meditation_sits'
  | 'dharma_talks'
  | 'retreats'
  | 'classes'
  | 'online_programs'
  | 'monastic_training'
  | 'family_programs'
  | 'recovery_programs'
  | 'interfaith'
  | 'community_events';

export const OFFERINGS: Record<Offering, string> = {
  meditation_sits: 'Meditation Sessions',
  dharma_talks: 'Dharma Talks',
  retreats: 'Retreats',
  classes: 'Classes/Courses',
  online_programs: 'Online Programs',
  monastic_training: 'Monastic Training',
  family_programs: 'Family Programs',
  recovery_programs: 'Recovery Programs',
  interfaith: 'Interfaith Activities',
  community_events: 'Community Events',
};

// =============================================================================
// Affiliations & Ethical Concerns
// =============================================================================

/**
 * Known organizational affiliations.
 * Some organizations have documented ethical concerns - these are flagged
 * to help users make informed decisions, not to censor.
 */
export type Affiliation =
  // Buddhist organizations with ethical concerns
  | 'shambhala'
  | 'rigpa'
  | 'nkt'           // New Kadampa Tradition
  | 'diamond_way'   // Ole Nydahl
  | 'triratna'      // Formerly FWBO
  | 'dhammakaya'    // Thai movement with financial controversies
  // Buddhist organizations (no major concerns)
  | 'sgi'           // Soka Gakkai International
  | 'fpmt'          // Foundation for the Preservation of the Mahayana Tradition
  | 'plum_village'  // Thich Nhat Hanh
  | 'goenka'        // S.N. Goenka Vipassana
  | 'spirit_rock'
  | 'ims'           // Insight Meditation Society
  | 'dzogchen'
  | 'tergar'        // Mingyur Rinpoche
  // NOT BUDDHISM - New Religious Movements using Buddhist imagery
  | 'falun_gong'    // Explicitly states it's not Buddhism
  | 'ching_hai'     // Supreme Master Ching Hai
  | 'true_buddha'   // Lu Sheng-yen - rejected by Buddhist federations
  | 'happy_science' // Ryuho Okawa
  | 'i_kuan_tao'    // Syncretic religion
  | 'other'
  | null;

/**
 * Concern status for centers:
 * - 'documented': Legitimate Buddhism but has documented ethical concerns
 * - 'not_buddhism': Uses Buddhist imagery but is not a recognized Buddhist tradition
 * - 'resolved': Had concerns but has implemented reforms
 * - null: No known concerns
 */
export type ConcernStatus = 'documented' | 'not_buddhism' | 'resolved' | null;

/**
 * Organizations with documented ethical concerns.
 * Criteria: Published journalism, legal findings, or formal investigations.
 * This is not a judgment on practitioners - many wonderful people practice
 * in these traditions. It's transparency for informed choice.
 */
export const ORGANIZATIONS_WITH_CONCERNS: Record<string, {
  affiliation: Affiliation;
  summary: string;
  sources: string[];
}> = {
  shambhala: {
    affiliation: 'shambhala',
    summary: 'Sexual misconduct allegations against Sakyong Mipham Rinpoche documented in Buddhist Project Sunshine reports (2018-2019). Organization underwent leadership changes.',
    sources: [
      'https://www.lionsroar.com/buddhist-project-sunshine-releases-phase-3-report/',
      'https://www.nytimes.com/2018/07/11/nyregion/shambhala-sexual-misconduct.html',
    ],
  },
  rigpa: {
    affiliation: 'rigpa',
    summary: 'Physical and sexual abuse by Sogyal Rinpoche documented in open letter by eight senior students (2017) and independent investigation (2018).',
    sources: [
      'https://www.theguardian.com/world/2017/jul/21/buddhist-teacher-sogyal-rinpoche-accused-of-abuse',
      'https://www.lionsroar.com/rigpa-sangha-releases-findings-of-investigation/',
    ],
  },
  nkt: {
    affiliation: 'nkt',
    summary: 'Concerns about cult-like practices, suppression of dissent, Shugden controversy, and allegations of high-pressure tactics. Disputed by the organization.',
    sources: [
      'https://www.theguardian.com/commentisfree/belief/2012/jul/16/new-kadampa-tradition-accusations',
      'https://newkadampatradition-controversy.info/',
    ],
  },
  diamond_way: {
    affiliation: 'diamond_way',
    summary: 'Concerns about Ole Nydahl\'s political statements, personality cult dynamics, and deviation from traditional Karma Kagyu teachings.',
    sources: [
      'https://www.lionsroar.com/ole-nydahl-the-karma-kagyu-and-the-controversy/',
    ],
  },
  triratna: {
    affiliation: 'triratna',
    summary: 'Historical allegations of sexual exploitation by founder Sangharakshita (Dennis Lingwood). Organization has acknowledged past harm and implemented safeguarding.',
    sources: [
      'https://www.theguardian.com/world/2019/sep/21/sangharakshita-triratna-buddhist-founder-abuse-allegations',
    ],
  },
  dhammakaya: {
    affiliation: 'dhammakaya',
    summary: 'Thai Buddhist movement with financial controversies. Former abbot Dhammachayo faced embezzlement charges. Unconventional teachings about Nirvana have been criticized by Thai Sangha authorities.',
    sources: [
      'https://www.bbc.com/news/world-asia-39012039',
      'https://www.nytimes.com/2017/02/16/world/asia/thailand-buddhist-temple-wat-dhammakaya.html',
    ],
  },
};

/**
 * Groups that use Buddhist imagery or terminology but are not recognized
 * as Buddhist traditions by mainstream Buddhist federations.
 * This is not a judgment on individual practitioners - it's transparency
 * for people specifically seeking Buddhist practice.
 */
export const NON_BUDDHIST_GROUPS: Record<string, {
  affiliation: Affiliation;
  summary: string;
  selfDescription: string;
  sources: string[];
}> = {
  falun_gong: {
    affiliation: 'falun_gong',
    summary: 'Spiritual practice founded by Li Hongzhi in 1992. While incorporating Buddhist terminology and imagery, Li Hongzhi has explicitly stated Falun Gong is not Buddhism.',
    selfDescription: 'Falun Gong is not a religion... Falun Gong is not Buddhism.',
    sources: [
      'https://en.wikipedia.org/wiki/Falun_Gong#Relationship_with_Buddhism',
      'https://www.bbc.com/news/world-asia-china-35993423',
    ],
  },
  ching_hai: {
    affiliation: 'ching_hai',
    summary: 'Supreme Master Ching Hai (Suma Ching Hai) leads a syncretic new religious movement combining Buddhism, Christianity, Islam, and other traditions. Not recognized as Buddhism by Buddhist federations.',
    selfDescription: 'Quan Yin Method / Suma Ching Hai International Association',
    sources: [
      'https://culteducation.com/group/1289-supreme-master-ching-hai.html',
      'https://www.vice.com/en/article/the-vegan-cult-supreme-master-ching-hai/',
    ],
  },
  true_buddha: {
    affiliation: 'true_buddha',
    summary: 'True Buddha School founded by Lu Sheng-yen claims he is a living Buddha. Rejected by major Buddhist federations including the Buddhist Association of the Republic of China.',
    selfDescription: 'True Buddha School / Grand Master Lu',
    sources: [
      'https://en.wikipedia.org/wiki/True_Buddha_School',
      'https://www.bbc.com/zhongwen/trad/chinese-news-42407095',
    ],
  },
  happy_science: {
    affiliation: 'happy_science',
    summary: 'Japanese new religious movement founded by Ryuho Okawa in 1986. While using Buddhist concepts, claims Okawa is the reincarnation of Buddha, Jesus, and other figures. Not recognized as Buddhism.',
    selfDescription: 'Happy Science / El Cantare',
    sources: [
      'https://en.wikipedia.org/wiki/Happy_Science',
      'https://www.theguardian.com/world/2017/oct/13/happy-science-cult-film-japan',
    ],
  },
  i_kuan_tao: {
    affiliation: 'i_kuan_tao',
    summary: 'Chinese syncretic religion incorporating Confucianism, Taoism, and Buddhism. While respecting Buddhist elements, it is a distinct religious tradition, not a Buddhist school.',
    selfDescription: 'I-Kuan Tao / Way of Former Heaven',
    sources: [
      'https://en.wikipedia.org/wiki/I-Kuan_Tao',
    ],
  },
};

// =============================================================================
// Center
// =============================================================================

export interface Center {
  id: string;
  name: string;
  slug: string;

  // Location
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;

  // Contact
  website?: string;
  email?: string;
  phone?: string;

  // Details
  description?: string;
  tradition: Tradition;
  subTradition?: string;
  affiliation?: Affiliation;
  concernStatus?: ConcernStatus;
  languages: string[];
  offerings: Offering[];

  // Accessibility
  wheelchairAccessible: boolean;
  hearingLoop: boolean;
  signLanguage: boolean;

  // Media
  photoUrl?: string;

  // Support (V2)
  needsSupport: boolean;
  supportDescription?: string;
  donationUrl?: string;

  // Meta
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface CenterInput {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  website?: string;
  email?: string;
  phone?: string;
  description?: string;
  tradition: Tradition;
  subTradition?: string;
  affiliation?: Affiliation;
  languages?: string[];
  offerings?: Offering[];
  wheelchairAccessible?: boolean;
  hearingLoop?: boolean;
  signLanguage?: boolean;
  photoUrl?: string;
}

// =============================================================================
// API
// =============================================================================

export interface CentersSearchParams {
  lat?: number;
  lng?: number;
  radius?: number; // km
  tradition?: Tradition;
  affiliation?: Affiliation;
  offerings?: Offering[];
  country?: string;
  q?: string; // text search
  includeConcerns?: boolean; // false by default - must opt-in to see centers with documented concerns
  limit?: number;
  offset?: number;
}

export interface CentersSearchResponse {
  centers: Center[];
  total: number;
  hasMore: boolean;
}
