export type StrengthLevel = 'very-weak' | 'weak' | 'fair' | 'strong' | 'very-strong';

export interface PasswordAssessment {
  readonly length: number;
  readonly poolSize: number;
  readonly bits: number;
  readonly level: StrengthLevel;
  /** Tiempo promedio para adivinarla si el atacante prueba 100 claves por segundo (ataque en línea). */
  readonly onlineSeconds: number;
  /** Tiempo promedio si el atacante tiene la base de datos y prueba 10 mil millones por segundo. */
  readonly offlineSeconds: number;
}

export const ONLINE_GUESSES_PER_SECOND = 100;
export const OFFLINE_GUESSES_PER_SECOND = 1e10;

export function poolSize(password: string): number {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/\d/.test(password)) pool += 10;
  if (/[!-/:-@[-`{-~]/.test(password)) pool += 32;
  if (/ /.test(password)) pool += 1;
  if (/[^\x00-\x7F]/.test(password)) pool += 32;
  return pool;
}

/**
 * Estimación optimista: largo × log2(alfabeto). Las repeticiones largas se recortan
 * para no premiar "aaaaaaaaaaaa". No detecta palabras ni patrones, por eso la revisión
 * de filtraciones es la prueba que más importa.
 */
export function estimateEntropyBits(password: string): number {
  if (password === '') return 0;
  const collapsed = password.replace(/(.)\1{2,}/gsu, '$1$1');
  return Array.from(collapsed).length * Math.log2(Math.max(2, poolSize(password)));
}

export function levelFromBits(bits: number): StrengthLevel {
  if (bits < 28) return 'very-weak';
  if (bits < 40) return 'weak';
  if (bits < 60) return 'fair';
  if (bits < 80) return 'strong';
  return 'very-strong';
}

/** Tiempo promedio (la mitad del espacio de búsqueda) para un número de bits dado. */
export function secondsToGuess(bits: number, guessesPerSecond: number): number {
  if (bits <= 0) return 0;
  if (bits > 1000) return Number.POSITIVE_INFINITY;
  return 2 ** (bits - 1) / guessesPerSecond;
}

const UNIVERSE_AGE_SECONDS = 4.35e17;

const UNITS: readonly { seconds: number; one: string; many: string }[] = [
  { seconds: 3_155_760_000, one: 'siglo', many: 'siglos' },
  { seconds: 31_557_600, one: 'año', many: 'años' },
  { seconds: 86_400, one: 'día', many: 'días' },
  { seconds: 3_600, one: 'hora', many: 'horas' },
  { seconds: 60, one: 'minuto', many: 'minutos' },
  { seconds: 1, one: 'segundo', many: 'segundos' },
];

/** Tiempo en palabras sencillas, en español. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds >= UNIVERSE_AGE_SECONDS) return 'más que la edad del universo';
  if (seconds < 1) return 'al instante';
  for (const unit of UNITS) {
    if (seconds >= unit.seconds) {
      const n = Math.floor(seconds / unit.seconds);
      return `${n.toLocaleString('es')} ${n === 1 ? unit.one : unit.many}`;
    }
  }
  return 'al instante';
}

export function assessPassword(password: string): PasswordAssessment {
  const bits = estimateEntropyBits(password);
  return {
    length: Array.from(password).length,
    poolSize: poolSize(password),
    bits,
    level: levelFromBits(bits),
    onlineSeconds: secondsToGuess(bits, ONLINE_GUESSES_PER_SECOND),
    offlineSeconds: secondsToGuess(bits, OFFLINE_GUESSES_PER_SECOND),
  };
}
