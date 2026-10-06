import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assessPassword, estimateEntropyBits, formatDuration, levelFromBits, poolSize, secondsToGuess } from './entropy.ts';

describe('entropía', () => {
  it('calcula el tamaño del alfabeto', () => {
    assert.equal(poolSize('abc'), 26);
    assert.equal(poolSize('abcDEF123'), 62);
    assert.equal(poolSize('abc!'), 58);
  });

  it('estima bits = largo × log2(alfabeto)', () => {
    assert.ok(Math.abs(estimateEntropyBits('abcdefgh') - 8 * Math.log2(26)) < 1e-9);
    assert.equal(estimateEntropyBits(''), 0);
  });

  it('no premia repeticiones largas', () => {
    assert.ok(estimateEntropyBits('aaaaaaaaaaaaaaaa') < estimateEntropyBits('abcdefgh'));
  });

  it('asigna niveles por bits', () => {
    assert.equal(levelFromBits(10), 'very-weak');
    assert.equal(levelFromBits(35), 'weak');
    assert.equal(levelFromBits(50), 'fair');
    assert.equal(levelFromBits(70), 'strong');
    assert.equal(levelFromBits(100), 'very-strong');
  });

  it('el tiempo para adivinar crece con los bits y es menor offline que en línea', () => {
    assert.ok(secondsToGuess(60, 100) > secondsToGuess(40, 100));
    const a = assessPassword('Tr0ub4dor&3xyz');
    assert.ok(a.offlineSeconds < a.onlineSeconds);
  });

  it('formatea duraciones en español', () => {
    assert.equal(formatDuration(0.2), 'al instante');
    assert.match(formatDuration(90), /minuto/);
    assert.match(formatDuration(3600 * 5), /horas/);
    assert.match(formatDuration(86400 * 400), /año/);
    assert.equal(formatDuration(Number.POSITIVE_INFINITY), 'más que la edad del universo');
  });
});
