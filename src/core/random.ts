/** Fuente de números aleatorios de 32 bits (inyectable para poder probarla). */
export type RandomSource = () => number;

export const cryptoRandomSource: RandomSource = () => {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0];
};

/**
 * Entero uniforme en [0, maxExclusive).
 * Usa muestreo por rechazo: descarta los valores que causarían sesgo de módulo,
 * de modo que todos los resultados son igual de probables.
 */
export function randomInt(maxExclusive: number, source: RandomSource = cryptoRandomSource): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > 2 ** 32) {
    throw new RangeError('maxExclusive debe ser un entero entre 1 y 2^32');
  }
  const range = 2 ** 32;
  const limit = range - (range % maxExclusive);
  let value = source();
  while (value >= limit) value = source();
  return value % maxExclusive;
}

export function pickItem<T>(items: readonly T[], source: RandomSource = cryptoRandomSource): T {
  return items[randomInt(items.length, source)];
}

export function pickChar(chars: string, source: RandomSource = cryptoRandomSource): string {
  return chars[randomInt(chars.length, source)];
}

/** Mezcla Fisher–Yates con aleatoriedad criptográfica. */
export function shuffle<T>(items: readonly T[], source: RandomSource = cryptoRandomSource): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, source);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
