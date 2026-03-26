/**
 * Ethical concerns data for Buddhist organizations and non-Buddhist groups.
 * Re-declared locally to avoid workspace resolution issues with @dharmadoors/types.
 * Source of truth: packages/types/src/index.ts
 */

export const ORGANIZATIONS_WITH_CONCERNS: Record<string, {
  affiliation: string;
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
    ],
  },
  diamond_way: {
    affiliation: 'diamond_way',
    summary: "Concerns about Ole Nydahl's political statements, personality cult dynamics, and deviation from traditional Karma Kagyu teachings.",
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
    summary: 'Thai Buddhist movement with financial controversies. Former abbot Dhammachayo faced embezzlement charges. Unconventional teachings about Nirvana criticized by Thai Sangha authorities.',
    sources: [
      'https://www.bbc.com/news/world-asia-39012039',
    ],
  },
};

export const NON_BUDDHIST_GROUPS: Record<string, {
  affiliation: string;
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
    ],
  },
  ching_hai: {
    affiliation: 'ching_hai',
    summary: 'Supreme Master Ching Hai leads a syncretic new religious movement combining Buddhism, Christianity, Islam, and other traditions. Not recognized as Buddhism by Buddhist federations.',
    selfDescription: 'Quan Yin Method / Suma Ching Hai International Association',
    sources: [
      'https://culteducation.com/group/1289-supreme-master-ching-hai.html',
    ],
  },
  true_buddha: {
    affiliation: 'true_buddha',
    summary: 'True Buddha School founded by Lu Sheng-yen claims he is a living Buddha. Rejected by major Buddhist federations including the Buddhist Association of the Republic of China.',
    selfDescription: 'True Buddha School / Grand Master Lu',
    sources: [
      'https://en.wikipedia.org/wiki/True_Buddha_School',
    ],
  },
  happy_science: {
    affiliation: 'happy_science',
    summary: 'Japanese new religious movement founded by Ryuho Okawa in 1986. Claims Okawa is the reincarnation of Buddha, Jesus, and other figures. Not recognized as Buddhism.',
    selfDescription: 'Happy Science / El Cantare',
    sources: [
      'https://en.wikipedia.org/wiki/Happy_Science',
    ],
  },
  i_kuan_tao: {
    affiliation: 'i_kuan_tao',
    summary: 'Chinese syncretic religion incorporating Confucianism, Taoism, and Buddhism. A distinct religious tradition, not a Buddhist school.',
    selfDescription: 'I-Kuan Tao / Way of Former Heaven',
    sources: [
      'https://en.wikipedia.org/wiki/I-Kuan_Tao',
    ],
  },
};
