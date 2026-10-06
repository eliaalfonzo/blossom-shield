import { BRANDS, SCAM_KEYWORDS, SHORTENERS, SUSPICIOUS_TLDS, TWO_LEVEL_SUFFIXES } from './brands.ts';

export type FindingSeverity = 'ok' | 'info' | 'warn' | 'danger';
export type Verdict = 'looks-ok' | 'careful' | 'suspicious' | 'invalid';

export interface Finding {
  readonly id: string;
  readonly severity: FindingSeverity;
  readonly title: string;
  readonly detail: string;
  /** Aporte al puntaje de riesgo (0 si es informativo). */
  readonly weight: number;
}

/** La dirección dividida para mostrar qué parte es el dominio real. */
export interface UrlParts {
  readonly scheme: string;
  readonly userinfo: string;
  readonly subdomain: string;
  readonly domain: string;
  readonly rest: string;
}

export interface UrlAnalysis {
  readonly input: string;
  readonly verdict: Verdict;
  readonly score: number;
  readonly hostname: string | null;
  readonly registrableDomain: string | null;
  readonly parts: UrlParts | null;
  readonly findings: readonly Finding[];
}

export const CAREFUL_THRESHOLD = 15;
export const SUSPICIOUS_THRESHOLD = 40;

const DANGEROUS_SCHEMES = /^(javascript|data|vbscript|file|blob):/i;
const HAS_AUTHORITY_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

/** Dominio "registrable" aproximado: últimas 2 etiquetas (o 3 con sufijos como com.mx). */
export function getRegistrableDomain(hostname: string): string {
  const labels = hostname.split('.').filter((l) => l !== '');
  if (labels.length <= 2) return labels.join('.');
  const lastTwo = labels.slice(-2).join('.');
  return TWO_LEVEL_SUFFIXES.has(lastTwo) ? labels.slice(-3).join('.') : lastTwo;
}

function suffixOf(registrable: string): string {
  const labels = registrable.split('.');
  return TWO_LEVEL_SUFFIXES.has(labels.slice(-2).join('.')) ? labels.slice(-2).join('.') : labels[labels.length - 1];
}

function nameLabel(registrable: string): string {
  const labels = registrable.split('.');
  const suffixLength = suffixOf(registrable).split('.').length;
  return labels.slice(0, Math.max(1, labels.length - suffixLength)).join('.');
}

export function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = temp;
    }
  }
  return prev[b.length];
}

/** Deshace trucos comunes: g00gle → google, paypa1 → paypal, rn → m. */
export function normalizeLookalike(label: string): string {
  return label
    .toLowerCase()
    .replace(/-/g, '')
    .replace(/rn/g, 'm')
    .replace(/vv/g, 'w')
    .replace(/[0]/g, 'o')
    .replace(/[1|]/g, 'l')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't');
}

function fuzzyThreshold(keyLength: number): number {
  if (keyLength >= 9) return 2;
  if (keyLength >= 6) return 1;
  return 0;
}

function brandFindings(hostname: string, registrable: string): Finding[] {
  const findings: Finding[] = [];
  const label = nameLabel(registrable);
  const subdomain = hostname.slice(0, Math.max(0, hostname.length - registrable.length));
  const normalized = normalizeLookalike(label);
  let lookalikeReported = false;

  for (const brand of BRANDS) {
    const official = brand.domains.includes(registrable);
    if (official) {
      findings.push({ id: `official-${brand.key}`, severity: 'ok', title: `Es un dominio oficial de ${brand.name}`, detail: `${registrable} coincide con un dominio conocido de ${brand.name}.`, weight: 0 });
      continue;
    }

    if (subdomain.includes(brand.key) && brand.key.length >= 4) {
      findings.push({ id: `subdomain-${brand.key}`, severity: 'danger', title: `Usa "${brand.name}" para despistar`, detail: `El nombre ${brand.name} aparece al inicio, pero el sitio real es ${registrable}. Lo que importa es lo que va justo antes de la primera barra, leyendo de derecha a izquierda.`, weight: 50 });
      continue;
    }

    if (lookalikeReported) continue;

    const distance = levenshtein(normalized, brand.key);
    const imitates = label !== brand.key && distance <= fuzzyThreshold(brand.key.length);
    if (imitates) {
      lookalikeReported = true;
      findings.push({ id: `lookalike-${brand.key}`, severity: 'danger', title: `Se parece a ${brand.name}`, detail: `"${label}" imita a "${brand.key}" cambiando o agregando letras. Es un truco clásico de suplantación.`, weight: 55 });
      continue;
    }

    if (brand.key.length >= 5 && label.split('-').includes(brand.key) && label !== brand.key) {
      lookalikeReported = true;
      findings.push({ id: `token-${brand.key}`, severity: 'danger', title: `Usa el nombre de ${brand.name} sin ser oficial`, detail: `Contiene "${brand.key}" junto a otras palabras, pero ${registrable} no es un dominio conocido de ${brand.name}.`, weight: 45 });
      continue;
    }

    if (label === brand.key) {
      findings.push({ id: `brand-name-${brand.key}`, severity: 'warn', title: `Usa el nombre ${brand.name} con otra terminación`, detail: `${registrable} no está entre los dominios oficiales que conocemos. Verifica que sea el sitio correcto.`, weight: 25 });
    } else if (brand.key.length >= 5 && label.includes(brand.key)) {
      findings.push({ id: `contains-${brand.key}`, severity: 'info', title: `Contiene la palabra "${brand.key}"`, detail: 'Puede ser casualidad, pero conviene confirmar que sea el sitio que esperas.', weight: 10 });
    }
  }
  return findings;
}

function invalid(input: string, detail: string): UrlAnalysis {
  return {
    input,
    verdict: 'invalid',
    score: 0,
    hostname: null,
    registrableDomain: null,
    parts: null,
    findings: [{ id: 'invalid', severity: 'info', title: 'No parece un enlace válido', detail, weight: 0 }],
  };
}

/**
 * Analiza el TEXTO de un enlace con reglas explicables. No abre el enlace ni hace ninguna petición.
 * No es una garantía: sirve para detectar señales típicas de phishing.
 */
export function analyzeUrl(raw: string): UrlAnalysis {
  const input = raw.trim();
  if (input === '') return invalid(raw, 'Pega un enlace para analizarlo.');

  if (DANGEROUS_SCHEMES.test(input)) {
    return {
      input,
      verdict: 'suspicious',
      score: 100,
      hostname: null,
      registrableDomain: null,
      parts: null,
      findings: [{ id: 'scheme', severity: 'danger', title: 'Este tipo de enlace puede ejecutar código', detail: 'Los enlaces que empiezan con javascript:, data: u otros similares no llevan a una página: pueden ejecutar instrucciones. No los abras.', weight: 100 }],
    };
  }

  let url: URL;
  try {
    url = new URL(HAS_AUTHORITY_SCHEME.test(input) ? input : `https://${input}`);
  } catch {
    return invalid(input, 'No pudimos entender la dirección. Revisa que esté completa y sin espacios.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return invalid(input, 'Solo analizamos enlaces web (http o https).');
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (hostname === '') return invalid(input, 'La dirección no tiene un sitio web.');

  const findings: Finding[] = [];
  const isIpv4 = IPV4.test(hostname);
  const isIpv6 = hostname.startsWith('[');
  const registrable = isIpv4 || isIpv6 ? hostname : getRegistrableDomain(hostname);

  if (url.protocol === 'https:') {
    findings.push({ id: 'https', severity: 'ok', title: 'Usa HTTPS', detail: 'La conexión va cifrada. Eso NO significa que el sitio sea confiable: los estafadores también usan HTTPS.', weight: 0 });
  } else {
    findings.push({ id: 'http', severity: 'warn', title: 'No usa HTTPS', detail: 'La conexión no va cifrada. No escribas datos personales aquí.', weight: 20 });
  }

  if (url.username !== '' || url.password !== '') {
    findings.push({ id: 'userinfo', severity: 'danger', title: 'Tiene un @ que engaña', detail: `Lo que aparece antes del @ es solo un adorno. El sitio real al que llevaría es ${hostname}.`, weight: 60 });
  }

  if (isIpv4 || isIpv6) {
    findings.push({ id: 'ip', severity: 'danger', title: 'Usa números en lugar de un nombre', detail: 'Los sitios legítimos casi siempre usan un nombre de dominio, no una dirección numérica.', weight: 45 });
  }

  if (hostname.split('.').some((label) => label.startsWith('xn--'))) {
    findings.push({ id: 'punycode', severity: 'danger', title: 'Usa letras que imitan a otras', detail: 'El nombre contiene caracteres especiales que pueden parecerse a letras normales (por ejemplo una "а" cirílica en lugar de una "a").', weight: 40 });
  }

  if (!isIpv4 && !isIpv6) {
    findings.push(...brandFindings(hostname, registrable));

    const subdomainCount = hostname.split('.').length - registrable.split('.').length;
    if (subdomainCount >= 3) {
      findings.push({ id: 'subdomains', severity: 'warn', title: 'Tiene demasiados subdominios', detail: 'Muchas secciones antes del dominio real suelen usarse para esconderlo.', weight: 15 });
    }
    if (SHORTENERS.has(registrable)) {
      findings.push({ id: 'shortener', severity: 'warn', title: 'Es un enlace acortado', detail: 'Oculta el destino real. Si no esperabas este enlace, no lo abras.', weight: 30 });
    }
    const tld = suffixOf(registrable).split('.').pop() ?? '';
    if (SUSPICIOUS_TLDS.has(tld)) {
      findings.push({ id: 'tld', severity: 'warn', title: `Termina en .${tld}`, detail: 'Esta terminación es barata y muy usada en fraudes. No es una prueba, pero suma sospecha.', weight: 15 });
    }
    if ((hostname.match(/-/g) ?? []).length >= 3) {
      findings.push({ id: 'hyphens', severity: 'warn', title: 'Tiene muchos guiones', detail: 'Los nombres largos con guiones imitan sitios reales con frecuencia.', weight: 15 });
    }
  }

  if (url.port !== '') {
    findings.push({ id: 'port', severity: 'warn', title: 'Usa un puerto poco común', detail: `Se conecta al puerto ${url.port}, algo raro en sitios normales.`, weight: 15 });
  }

  if (/https?:\/\//i.test(url.search + url.hash)) {
    findings.push({ id: 'redirect', severity: 'warn', title: 'Lleva otro enlace escondido', detail: 'Dentro de la dirección hay otra dirección. Puede servir para redirigirte a otro sitio.', weight: 10 });
  }

  const haystack = `${hostname}${url.pathname}`.toLowerCase();
  const keywords = SCAM_KEYWORDS.filter((k) => haystack.includes(k));
  if (keywords.length >= 2) {
    findings.push({ id: 'keywords', severity: 'warn', title: 'Usa palabras típicas de fraudes', detail: `Aparecen términos como "${keywords.slice(0, 3).join('", "')}". Los estafadores los usan para generar urgencia.`, weight: 12 });
  } else if (keywords.length === 1) {
    findings.push({ id: 'keyword', severity: 'info', title: `Incluye la palabra "${keywords[0]}"`, detail: 'Es normal en sitios reales, pero fíjate si el resto de la dirección es coherente.', weight: 0 });
  }

  if (input.length > 120) {
    findings.push({ id: 'long', severity: 'info', title: 'La dirección es muy larga', detail: 'Las direcciones largas pueden esconder el dominio real entre muchos caracteres.', weight: 0 });
  }

  const score = Math.min(100, findings.reduce((sum, f) => sum + f.weight, 0));
  const verdict: Verdict = score >= SUSPICIOUS_THRESHOLD ? 'suspicious' : score >= CAREFUL_THRESHOLD ? 'careful' : 'looks-ok';

  const subdomain = isIpv4 || isIpv6 ? '' : hostname.slice(0, Math.max(0, hostname.length - registrable.length));
  const userinfo = url.username !== '' || url.password !== '' ? `${url.username}${url.password !== '' ? `:${url.password}` : ''}@` : '';
  const rest = `${url.port !== '' ? `:${url.port}` : ''}${url.pathname === '/' && !input.includes('/', input.indexOf('//') + 2) ? '' : url.pathname}${url.search}${url.hash}`;

  return {
    input,
    verdict,
    score,
    hostname,
    registrableDomain: registrable,
    parts: { scheme: `${url.protocol}//`, userinfo, subdomain, domain: registrable, rest },
    findings,
  };
}
