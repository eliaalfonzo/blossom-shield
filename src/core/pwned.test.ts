import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BreachCheckError, checkPasswordBreach, parseRange, splitHash } from './pwned.ts';
import type { Fetcher } from './pwned.ts';

const BODY = [
  '0018A45C4D1DEF81644B54AB7F969B88D65:1',
  '1E4C9B93F3F0682250B6CF8331B7EE68FD8:10434004',
  '011053FD0102E94D6AE2F8B83D76FAA0A64:0',
].join('\r\n');

function fakeFetcher(body: string, calls: { url: string; headers: Record<string, string> }[] = []): Fetcher {
  return async (url, init) => {
    calls.push({ url, headers: init.headers });
    return { ok: true, status: 200, text: async () => body };
  };
}

describe('parseRange / splitHash', () => {
  it('lee sufijos y cantidades, ignorando líneas dañadas', () => {
    const map = parseRange(`${BODY}\r\nbasura\r\n:5\r\nABC:x`);
    assert.equal(map.get('1E4C9B93F3F0682250B6CF8331B7EE68FD8'), 10434004);
    assert.equal(map.size, 3);
  });

  it('separa prefijo (5) y sufijo (35)', () => {
    const { prefix, suffix } = splitHash('5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8');
    assert.equal(prefix, '5BAA6');
    assert.equal(suffix.length, 35);
  });
});

describe('checkPasswordBreach', () => {
  it('envía solo el prefijo de 5 caracteres, pide relleno y detecta la filtración', async () => {
    const calls: { url: string; headers: Record<string, string> }[] = [];
    const result = await checkPasswordBreach('password', fakeFetcher(BODY, calls));

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.pwnedpasswords.com/range/5BAA6');
    assert.equal(calls[0].headers['Add-Padding'], 'true');
    assert.equal(calls[0].url.replace('https://api.pwnedpasswords.com/range/', ''), '5BAA6'); // solo viaja el prefijo
    assert.ok(!calls[0].url.includes('1E4C9B93F3F0682250B6CF8331B7EE68FD8'));
    assert.deepEqual(result, { breached: true, count: 10434004, prefix: '5BAA6', candidates: 3 });
  });

  it('no marca como filtrada si no hay coincidencia o es relleno (conteo 0)', async () => {
    const none = await checkPasswordBreach('password', fakeFetcher('ABCDE:3'));
    assert.equal(none.breached, false);
    const padded = await checkPasswordBreach('password', fakeFetcher('1E4C9B93F3F0682250B6CF8331B7EE68FD8:0'));
    assert.equal(padded.breached, false);
  });

  it('traduce errores de red y de HTTP a mensajes claros', async () => {
    await assert.rejects(
      checkPasswordBreach('x', async () => { throw new Error('offline'); }),
      (e: unknown) => e instanceof BreachCheckError && e.kind === 'network',
    );
    await assert.rejects(
      checkPasswordBreach('x', async () => ({ ok: false, status: 503, text: async () => '' })),
      (e: unknown) => e instanceof BreachCheckError && e.kind === 'http',
    );
  });

  it('rechaza contraseñas vacías', async () => {
    await assert.rejects(checkPasswordBreach('', fakeFetcher(BODY)), RangeError);
  });
});
