import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { sha1Hex } from './sha1.ts';

describe('sha1Hex', () => {
  it('coincide con vectores conocidos', async () => {
    assert.equal(await sha1Hex('password'), '5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8');
    assert.equal(await sha1Hex(''), 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709');
  });
});
