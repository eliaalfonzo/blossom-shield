export interface Brand {
  readonly name: string;
  /** Nombre usado en el dominio, en minúsculas (ej. "paypal"). */
  readonly key: string;
  /** Dominios oficiales conocidos. */
  readonly domains: readonly string[];
}

export const BRANDS: readonly Brand[] = [
  { name: 'Google', key: 'google', domains: ['google.com', 'google.es', 'google.com.mx', 'google.com.ar', 'google.cl', 'google.com.co'] },
  { name: 'Gmail', key: 'gmail', domains: ['gmail.com'] },
  { name: 'Facebook', key: 'facebook', domains: ['facebook.com'] },
  { name: 'Instagram', key: 'instagram', domains: ['instagram.com'] },
  { name: 'WhatsApp', key: 'whatsapp', domains: ['whatsapp.com', 'whatsapp.net'] },
  { name: 'PayPal', key: 'paypal', domains: ['paypal.com'] },
  { name: 'Apple', key: 'apple', domains: ['apple.com'] },
  { name: 'iCloud', key: 'icloud', domains: ['icloud.com'] },
  { name: 'Microsoft', key: 'microsoft', domains: ['microsoft.com'] },
  { name: 'Outlook', key: 'outlook', domains: ['outlook.com', 'outlook.live.com'] },
  { name: 'Amazon', key: 'amazon', domains: ['amazon.com', 'amazon.es', 'amazon.com.mx', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.it'] },
  { name: 'Netflix', key: 'netflix', domains: ['netflix.com'] },
  { name: 'Spotify', key: 'spotify', domains: ['spotify.com'] },
  { name: 'TikTok', key: 'tiktok', domains: ['tiktok.com'] },
  { name: 'LinkedIn', key: 'linkedin', domains: ['linkedin.com'] },
  { name: 'GitHub', key: 'github', domains: ['github.com'] },
  { name: 'Mercado Libre', key: 'mercadolibre', domains: ['mercadolibre.com', 'mercadolibre.com.mx', 'mercadolibre.com.ar', 'mercadolibre.cl', 'mercadolibre.com.co'] },
  { name: 'Santander', key: 'santander', domains: ['santander.com', 'santander.com.mx', 'santander.es'] },
  { name: 'BBVA', key: 'bbva', domains: ['bbva.com', 'bbva.es', 'bbva.mx'] },
  { name: 'Binance', key: 'binance', domains: ['binance.com'] },
  { name: 'Coinbase', key: 'coinbase', domains: ['coinbase.com'] },
  { name: 'DHL', key: 'dhl', domains: ['dhl.com'] },
  { name: 'FedEx', key: 'fedex', domains: ['fedex.com'] },
];

export const SHORTENERS: ReadonlySet<string> = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'cutt.ly', 'rb.gy', 'buff.ly', 'shorturl.at', 'tiny.cc',
]);

export const SUSPICIOUS_TLDS: ReadonlySet<string> = new Set([
  'zip', 'mov', 'xyz', 'top', 'click', 'tk', 'gq', 'ml', 'cf', 'ga', 'work', 'support', 'rest', 'country', 'kim', 'icu', 'cyou',
]);

/** Sufijos de dos niveles frecuentes (aproximación simple, sin la lista pública completa). */
export const TWO_LEVEL_SUFFIXES: ReadonlySet<string> = new Set([
  'co.uk', 'org.uk', 'com.mx', 'org.mx', 'gob.mx', 'com.ar', 'com.br', 'com.co', 'com.pe', 'com.ve', 'com.ec',
  'com.cl', 'com.es', 'com.au', 'co.nz', 'co.jp', 'co.in', 'com.uy', 'com.bo', 'com.py',
]);

export const SCAM_KEYWORDS: readonly string[] = [
  'login', 'signin', 'verify', 'verificar', 'verificacion', 'secure', 'seguro', 'update', 'actualizar', 'account',
  'cuenta', 'password', 'clave', 'contrasena', 'bank', 'banco', 'wallet', 'billing', 'pago', 'suspend', 'suspendida',
  'premio', 'gratis', 'confirm', 'confirmar', 'bloqueada',
];
