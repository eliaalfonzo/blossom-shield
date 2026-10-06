/**
 * SHA-1 en mayúsculas con Web Crypto.
 * Se usa solo porque el servicio de contraseñas filtradas publica sus datos por SHA-1;
 * aquí NO se usa para proteger nada.
 */
export async function sha1Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}
