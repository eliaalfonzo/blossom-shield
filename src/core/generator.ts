import { cryptoRandomSource, pickChar, pickItem, randomInt, shuffle } from './random.ts';
import type { RandomSource } from './random.ts';
import { WORDS } from './wordlist.ts';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%&*?-_+=.,;:';
const AMBIGUOUS = new Set(['O', '0', 'o', 'I', 'l', '1', '|']);

export const PASSWORD_LENGTH_RANGE = { min: 8, max: 64 } as const;
export const PASSPHRASE_WORDS_RANGE = { min: 3, max: 10 } as const;

export interface PasswordOptions {
  readonly length: number;
  readonly lowercase: boolean;
  readonly uppercase: boolean;
  readonly digits: boolean;
  readonly symbols: boolean;
  readonly avoidAmbiguous: boolean;
}

export interface PassphraseOptions {
  readonly words: number;
  readonly separator: string;
  readonly capitalize: boolean;
  readonly addNumber: boolean;
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  avoidAmbiguous: true,
};

export const DEFAULT_PASSPHRASE_OPTIONS: PassphraseOptions = {
  words: 5,
  separator: '-',
  capitalize: true,
  addNumber: true,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function activeSets(options: PasswordOptions): string[] {
  const candidates: string[] = [];
  if (options.lowercase) candidates.push(LOWER);
  if (options.uppercase) candidates.push(UPPER);
  if (options.digits) candidates.push(DIGITS);
  if (options.symbols) candidates.push(SYMBOLS);
  return candidates
    .map((set) => (options.avoidAmbiguous ? Array.from(set).filter((c) => !AMBIGUOUS.has(c)).join('') : set))
    .filter((set) => set.length > 0);
}

/** Contraseña aleatoria con al menos un carácter de cada tipo elegido. */
export function generatePassword(options: PasswordOptions, source: RandomSource = cryptoRandomSource): string {
  const sets = activeSets(options);
  if (sets.length === 0) throw new RangeError('Elige al menos un tipo de carácter');

  const length = clamp(options.length, PASSWORD_LENGTH_RANGE.min, PASSWORD_LENGTH_RANGE.max);
  const pool = sets.join('');
  const chars = sets.map((set) => pickChar(set, source));
  while (chars.length < length) chars.push(pickChar(pool, source));
  return shuffle(chars, source).join('');
}

export function passwordEntropyBits(options: PasswordOptions): number {
  const sets = activeSets(options);
  if (sets.length === 0) return 0;
  const length = clamp(options.length, PASSWORD_LENGTH_RANGE.min, PASSWORD_LENGTH_RANGE.max);
  return length * Math.log2(sets.join('').length);
}

const capitalizeWord = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

/** Frase de contraseña con palabras elegidas al azar. */
export function generatePassphrase(
  options: PassphraseOptions,
  source: RandomSource = cryptoRandomSource,
  list: readonly string[] = WORDS,
): string {
  const count = clamp(options.words, PASSPHRASE_WORDS_RANGE.min, PASSPHRASE_WORDS_RANGE.max);
  const words = Array.from({ length: count }, () => {
    const word = pickItem(list, source);
    return options.capitalize ? capitalizeWord(word) : word;
  });
  const parts = options.addNumber ? [...words, String(randomInt(100, source)).padStart(2, '0')] : words;
  return parts.join(options.separator);
}

export function passphraseEntropyBits(options: PassphraseOptions, listSize: number = WORDS.length): number {
  const count = clamp(options.words, PASSPHRASE_WORDS_RANGE.min, PASSPHRASE_WORDS_RANGE.max);
  return count * Math.log2(listSize) + (options.addNumber ? Math.log2(100) : 0);
}
