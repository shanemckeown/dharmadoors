// Tradition type from shared types package
type Tradition =
  | 'theravada'
  | 'mahayana'
  | 'vajrayana'
  | 'zen'
  | 'pure_land'
  | 'nichiren'
  | 'secular'
  | 'multi_tradition'
  | 'other';

export interface TraditionData {
  key: Tradition;
  label: string;
  color: string;
  description: string;
  firstVisitGuide: string;
}

/**
 * Single source of truth for tradition display data.
 * Colors from BRAND_GUIDELINES.md tradition color mapping.
 */
export const traditionsData: Record<Tradition, TraditionData> = {
  theravada: {
    key: 'theravada',
    label: 'Theravada',
    color: '#E97116', // Saffron Orange
    description:
      'The "Teaching of the Elders" — the oldest surviving Buddhist school, rooted in the Pali Canon. Emphasizes meditation, monastic discipline, and the original teachings of the historical Buddha. Predominant in Sri Lanka, Thailand, Myanmar, Cambodia, and Laos.',
    firstVisitGuide:
      'Remove your shoes before entering the meditation hall. Bow toward the Buddha statue when entering. Sit on a cushion or chair — cross-legged on the floor is traditional but not required. Stay silent during meditation periods. It\'s customary to offer a small donation (dana) but never expected.',
  },
  mahayana: {
    key: 'mahayana',
    label: 'Mahayana',
    color: '#168EE9', // Wisdom Blue
    description:
      'The "Great Vehicle" — emphasizes the bodhisattva ideal of seeking enlightenment for all beings. Includes Chinese, Vietnamese, and Korean Buddhist traditions. Rich in devotional practices, chanting, and philosophical study.',
    firstVisitGuide:
      'Remove your shoes at the entrance. You may see practitioners bowing or prostrating — this is optional for visitors. Incense is often offered; follow what others do or simply observe. Chanting may be in Chinese, Vietnamese, or Korean — following along is welcome but not required. Dress modestly and respectfully.',
  },
  vajrayana: {
    key: 'vajrayana',
    label: 'Vajrayana/Tibetan',
    color: '#DC4545', // Lotus Red
    description:
      'The "Diamond Vehicle" — Tibetan Buddhist traditions emphasizing tantric practices, visualization, mantra recitation, and the guru-student relationship. Includes Gelug, Kagyu, Nyingma, and Sakya schools. Rich in ritual, art, and philosophical debate.',
    firstVisitGuide:
      'Remove your shoes before entering the shrine room. Walk clockwise around the shrine (never counter-clockwise). Don\'t point your feet toward the shrine or teacher. If a lama or teacher is present, it\'s respectful to bow slightly. Meditation sessions often include guided visualization and mantra recitation — simply listen and follow along as you\'re comfortable.',
  },
  zen: {
    key: 'zen',
    label: 'Zen/Chan/Seon',
    color: '#22A55E', // Bamboo Green
    description:
      'Emphasizes direct experience through seated meditation (zazen) and mindful attention to daily life. Includes Japanese Zen (Soto, Rinzai), Chinese Chan, and Korean Seon. Known for simplicity, discipline, and the use of koans (paradoxical questions).',
    firstVisitGuide:
      'Arrive 10-15 minutes early for instruction on sitting posture. Remove your shoes. Bow when entering and leaving the zendo (meditation hall). Sit facing the wall (Soto) or facing in (Rinzai). Absolute silence during zazen. A bell marks the beginning and end of sitting periods. Walking meditation (kinhin) may follow — watch others and follow the pace.',
  },
  pure_land: {
    key: 'pure_land',
    label: 'Pure Land',
    color: '#3B82F6', // Sky Blue
    description:
      'Devotional Buddhist practice centered on Amitabha Buddha and rebirth in the Pure Land through faith and recitation of the nembutsu ("Namu Amida Butsu"). Includes Jodo Shinshu, Jodo Shu, and Chinese Pure Land traditions. Emphasizes gratitude and other-power (tariki).',
    firstVisitGuide:
      'Remove your shoes at the entrance. Services often include chanting the nembutsu (Namu Amida Butsu) — you\'re welcome to join in or simply listen. In Jodo Shinshu temples, you may receive a small booklet with the chants. Incense and a small bow toward the altar are customary. Services feel more like a gathering than silent meditation — expect hymns, a dharma talk, and community time afterward.',
  },
  nichiren: {
    key: 'nichiren',
    label: 'Nichiren',
    color: '#8B5CF6', // Royal Purple
    description:
      'Based on the teachings of the 13th-century Japanese monk Nichiren, emphasizing the Lotus Sutra and the chanting of "Nam-myoho-renge-kyo." Includes SGI (Soka Gakkai International), Nichiren Shu, and Nichiren Shoshu. Focuses on personal transformation through practice.',
    firstVisitGuide:
      'Meetings are often held in members\' homes or community centers. The main practice is chanting "Nam-myoho-renge-kyo" before a Gohonzon (scroll). You\'ll be given a chanting card with the words. Chanting sessions typically last 15-30 minutes. There\'s usually a discussion period afterward where people share experiences. The atmosphere is warm and welcoming to newcomers.',
  },
  secular: {
    key: 'secular',
    label: 'Secular/Non-sectarian',
    color: '#6B7280', // Neutral Gray
    description:
      'Buddhist-informed mindfulness and meditation practices without traditional religious elements. Includes MBSR (Mindfulness-Based Stress Reduction), secular Buddhism, and non-sectarian meditation groups. Focuses on practical application of Buddhist psychology and meditation techniques.',
    firstVisitGuide:
      'These groups are the most accessible for newcomers. Wear comfortable clothing. Sessions typically include guided meditation, sometimes a short talk or discussion. No religious ritual, bowing, or chanting required. Chairs are usually available alongside cushions. Many groups offer introductory sessions specifically for beginners — check their website for details.',
  },
  multi_tradition: {
    key: 'multi_tradition',
    label: 'Multi-tradition',
    color: '#EC4899', // Harmony Pink
    description:
      'Centers that offer teachings and practices from multiple Buddhist traditions. May host teachers from different schools, offer comparative study, or integrate practices from several lineages. Great for practitioners who want broad exposure.',
    firstVisitGuide:
      'Each session may follow different traditions, so check the schedule for what\'s offered. Dress comfortably and modestly. Arrive a few minutes early to orient yourself. The teachers and regulars are usually happy to explain the format. These centers are often the most welcoming to newcomers because they\'re used to people from diverse backgrounds.',
  },
  other: {
    key: 'other',
    label: 'Other/Unknown',
    color: '#6B7280', // Neutral Gray
    description:
      'Buddhist center whose specific tradition is not yet classified in our data. This may be a unique or regional tradition, or the tradition information is not available from OpenStreetMap.',
    firstVisitGuide:
      'Check the center\'s website for information about their tradition and practice style. When visiting any Buddhist center for the first time: remove your shoes at the entrance, dress modestly, arrive a few minutes early, and be prepared for periods of silence. Most centers are welcoming to newcomers — don\'t be afraid to ask questions before or after the session.',
  },
};

/** Get tradition data by key, with fallback to 'other' */
export function getTradition(key: string | null | undefined): TraditionData {
  if (key && key in traditionsData) {
    return traditionsData[key as Tradition];
  }
  return traditionsData.other;
}

/** All tradition keys for filter chips */
export const TRADITION_KEYS = Object.keys(traditionsData) as Tradition[];
