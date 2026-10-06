import { sha1Hex } from './sha1.ts';

export const PWNED_RANGE_URL = 'https://api.pwnedpasswords.com/range/';
export const PREFIX_LENGTH = 5;

/** Lo mínimo que necesitamos de `fetch` (permite probarlo sin red). */
export interface MinimalResponse {
  readonly ok: boolean;
  readonly status: number;
  text(): Promise<string>;
}
export type Fetcher = (url: string, init: { headers: Record<string, string> }) => Promise<MinimalResponse>;

export interface BreachResult {
  readonly breached: boolean;
  /** Veces que apareció en filtraciones conocidas. */
  readonly count: number;
  /** Los 5 caracteres que se enviaron al servicio (lo único que sale del navegador). */
  readonly prefix: string;
  /** Cuántos hashes parecidos devolvió el servicio (incluye relleno). */
  readonly candidates: number;
}

export type BreachErrorKind = 'network' | 'http';

export class BreachCheckError extends Error {
  readonly kind: BreachErrorKind;
  readonly userMessage: string;

  constructor(kind: BreachErrorKind, userMessage: string) {
    super(userMessage);
    this.name = 'BreachCheckError';
    this.kind = kind;
    this.userMessage = userMessage;
  }
}

export function splitHash(hash: string): { prefix: string; suffix: string } {
  return { prefix: hash.slice(0, PREFIX_LENGTH), suffix: hash.slice(PREFIX_LENGTH) };
}

/** Convierte la respuesta "SUFIJO:CANTIDAD" (una por línea) en un mapa. */
export function parseRange(body: string): Map<string, number> {
  const entries = new Map<string, number>();
  for (const line of body.split(/\r?\n/)) {
    const [suffix, rawCount] = line.trim().split(':');
    if (suffix === undefined || rawCount === undefined || suffix === '') continue;
    const count = Number.parseInt(rawCount, 10);
    if (Number.isFinite(count)) entries.set(suffix.toUpperCase(), count);
  }
  return entries;
}

const defaultFetcher: Fetcher = (url, init) =>
  fetch(url, {
    headers: init.headers,
    cache: 'no-store',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  });

/**
 * Revisa una contraseña con el modelo k-anonymity de Have I Been Pwned:
 *  1. Se calcula el SHA-1 en el navegador.
 *  2. Solo se envían los primeros 5 caracteres del hash.
 *  3. El servicio devuelve todos los sufijos que empiezan igual.
 *  4. La comparación final se hace aquí: el servicio nunca sabe cuál buscábamos.
 * `Add-Padding` agrega entradas falsas para ocultar cuántas coincidencias reales hay.
 */
export async function checkPasswordBreach(
  password: string,
  fetcher: Fetcher = defaultFetcher,
): Promise<BreachResult> {
  if (password === '') throw new RangeError('La contraseña no puede estar vacía');

  const { prefix, suffix } = splitHash(await sha1Hex(password));

  let response: MinimalResponse;
  try {
    response = await fetcher(`${PWNED_RANGE_URL}${prefix}`, { headers: { 'Add-Padding': 'true' } });
  } catch {
    throw new BreachCheckError('network', 'No pudimos conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.');
  }
  if (!response.ok) {
    throw new BreachCheckError('http', `El servicio respondió con un error (${response.status}). Inténtalo en unos minutos.`);
  }

  const range = parseRange(await response.text());
  const count = range.get(suffix) ?? 0; // las entradas de relleno traen 0
  return { breached: count > 0, count, prefix, candidates: range.size };
}
