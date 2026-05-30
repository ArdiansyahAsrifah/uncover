export const CYBERBULLYING_KEYWORDS = [
  // Kata kasar umum
  'jelek', 'bego', 'tolol', 'goblok', 'idiot', 'babi', 'anjing', 'bangsat',
  'kampret', 'bajingan', 'sialan', 'keparat',
  // Ancaman
  'mati aja', 'bunuh', 'hajar', 'gebuk',
  // Body shaming
  'gendut', 'kurus banget', 'jerawatan', 'item', 'pendek',
  // Sosial
  'cupu', 'kampungan', 'cringe', 'alay', 'sok asik', 'norak',
  'sampah', 'bocil', 'nggak ada gunanya', 'nyampah',
  // Singkatan/gaul
  'jir', 'jng', 'tai', 'kntl', 'bgs', 'pki',
];

export type RiskLevel = 'Aman' | 'Mencurigakan' | 'Berbahaya';

export function detectRisk(text: string): { level: RiskLevel; detectedWords: string[] } {
  const lower = text.toLowerCase();
  const detected = CYBERBULLYING_KEYWORDS.filter(kw => lower.includes(kw));

  let level: RiskLevel = 'Aman';
  if (detected.length >= 2) level = 'Berbahaya';
  else if (detected.length === 1) level = 'Mencurigakan';

  return { level, detectedWords: detected };
}