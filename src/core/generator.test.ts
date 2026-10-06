import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_PASSPHRASE_OPTIONS,
  DEFAULT_PASSWORD_OPTIONS,
  generatePassphrase,
  generatePassword,
  passphraseEntropyBits,
  passwordEntropyBits,
} from './generator.ts';
import { WORDS } from './wordlist.ts';

describe('lista de palabras', () => {
  it('no tiene duplicados ni acentos y es suficientemente grande', () => {
    assert.equal(new Set(WORDS).size, WORDS.length);
    assert.ok(WORDS.length >= 250, `solo ${WORDS.length} palabras`);
    assert.ok(WORDS.every((w) => /^[a-z]+$/.test(w)));
  });
});

describe('generatePassword', () => {
  it('respeta el largo e incluye al menos un carácter de cada tipo elegido', () => {
    for (let n = 0; n < 200; n++) {
      const pw = generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 12 });
      assert.equal(pw.length, 12);
      assert.match(pw, /[a-z]/);
      assert.match(pw, /[A-Z]/);
      assert.match(pw, /\d/);
      assert.match(pw, /[^A-Za-z0-9]/);
    }
  });

  it('evita caracteres ambiguos cuando se pide', () => {
    for (let n = 0; n < 200; n++) {
      assert.doesNotMatch(generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 40 }), /[O0oIl1|]/);
    }
  });

  it('solo usa los tipos elegidos', () => {
    const pw = generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, uppercase: false, symbols: false, length: 30 });
    assert.match(pw, /^[a-z0-9]+$/);
  });

  it('limita el largo al rango permitido y exige al menos un tipo', () => {
    assert.equal(generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, length: 1000 }).length, 64);
    assert.throws(
      () => generatePassword({ ...DEFAULT_PASSWORD_OPTIONS, lowercase: false, uppercase: false, digits: false, symbols: false }),
      RangeError,
    );
  });

  it('calcula la entropía según el alfabeto', () => {
    const bits = passwordEntropyBits({ ...DEFAULT_PASSWORD_OPTIONS, avoidAmbiguous: false, length: 10 });
    assert.ok(Math.abs(bits - 10 * Math.log2(26 + 26 + 10 + 16)) < 1e-9);
  });
});

describe('generatePassphrase', () => {
  it('genera el número de palabras pedido, con mayúsculas y número final', () => {
    const phrase = generatePassphrase(DEFAULT_PASSPHRASE_OPTIONS);
    const parts = phrase.split('-');
    assert.equal(parts.length, 6);
    assert.match(parts[0], /^[A-Z][a-z]+$/);
    assert.match(parts[5], /^\d{2}$/);
  });

  it('es determinista con una fuente conocida', () => {
    const phrase = generatePassphrase({ words: 3, separator: ' ', capitalize: false, addNumber: false }, () => 0);
    assert.equal(phrase, `${WORDS[0]} ${WORDS[0]} ${WORDS[0]}`);
  });

  it('calcula la entropía: palabras × log2(lista) + número', () => {
    const bits = passphraseEntropyBits({ words: 5, separator: '-', capitalize: true, addNumber: true });
    assert.ok(Math.abs(bits - (5 * Math.log2(WORDS.length) + Math.log2(100))) < 1e-9);
  });
});
