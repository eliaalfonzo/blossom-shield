import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cryptoRandomSource, pickChar, randomInt, shuffle } from './random.ts';

describe('randomInt', () => {
  it('descarta valores que causarían sesgo de módulo (muestreo por rechazo)', () => {
    const sequence = [4_294_967_295, 4_294_967_291, 7];
    let i = 0;
    assert.equal(randomInt(10, () => sequence[i++]), 7);
    assert.equal(i, 3);
  });

  it('devuelve siempre valores dentro del rango', () => {
    for (let n = 0; n < 2000; n++) {
      const v = randomInt(7);
      assert.ok(v >= 0 && v < 7);
    }
  });

  it('es aproximadamente uniforme', () => {
    const counts = new Array<number>(6).fill(0);
    for (let n = 0; n < 12000; n++) counts[randomInt(6)]++;
    for (const c of counts) assert.ok(c > 1700 && c < 2300, `conteo fuera de lo esperado: ${c}`);
  });

  it('rechaza rangos inválidos', () => {
    assert.throws(() => randomInt(0), RangeError);
    assert.throws(() => randomInt(1.5), RangeError);
  });

  it('shuffle conserva los elementos', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    assert.deepEqual([...shuffle(input, cryptoRandomSource)].sort(), input);
  });

  it('pickChar elige de la cadena dada', () => {
    assert.ok('abc'.includes(pickChar('abc')));
  });
});
