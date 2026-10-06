import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { analyzeUrl, getRegistrableDomain, levenshtein, normalizeLookalike } from './urlInspector.ts';

const ids = (url: string): string[] => analyzeUrl(url).findings.map((f) => f.id);

describe('utilidades', () => {
  it('obtiene el dominio registrable', () => {
    assert.equal(getRegistrableDomain('www.google.com'), 'google.com');
    assert.equal(getRegistrableDomain('a.b.mercadolibre.com.mx'), 'mercadolibre.com.mx');
    assert.equal(getRegistrableDomain('localhost'), 'localhost');
  });

  it('calcula distancia y normaliza imitaciones', () => {
    assert.equal(levenshtein('paypal', 'paypall'), 1);
    assert.equal(normalizeLookalike('g00gle'), 'google');
    assert.equal(normalizeLookalike('paypa1'), 'paypal');
  });
});

describe('analyzeUrl', () => {
  it('reconoce un dominio oficial con HTTPS como sin alarmas', () => {
    const result = analyzeUrl('https://www.google.com/search?q=gatos');
    assert.equal(result.verdict, 'looks-ok');
    assert.equal(result.registrableDomain, 'google.com');
    assert.ok(ids('https://www.google.com').includes('official-google'));
  });

  it('acepta enlaces sin esquema y dominios regionales legítimos', () => {
    assert.equal(analyzeUrl('amazon.es/dp/123').verdict, 'looks-ok');
    assert.equal(analyzeUrl('https://www.mercadolibre.com.mx').verdict, 'looks-ok');
  });

  it('detecta dominios que imitan marcas', () => {
    assert.equal(analyzeUrl('http://paypa1.com/login').verdict, 'suspicious');
    assert.ok(ids('https://paypa1.com').includes('lookalike-paypal'));
    assert.ok(ids('https://g00gle.com').includes('lookalike-google'));
    assert.ok(ids('https://facebock.com').includes('lookalike-facebook'));
  });

  it('detecta la marca escondida en un subdominio', () => {
    const result = analyzeUrl('https://paypal.com.verificar-cuenta.xyz/login');
    assert.equal(result.verdict, 'suspicious');
    assert.equal(result.registrableDomain, 'verificar-cuenta.xyz');
    assert.ok(ids('https://paypal.com.verificar-cuenta.xyz/login').includes('subdomain-paypal'));
  });

  it('detecta el truco del @', () => {
    const result = analyzeUrl('https://paypal.com@evil.example/');
    assert.equal(result.verdict, 'suspicious');
    assert.equal(result.hostname, 'evil.example');
    assert.ok(result.parts?.userinfo.startsWith('paypal.com'));
  });

  it('detecta IPs, punycode, acortadores, puertos y HTTP', () => {
    assert.ok(ids('http://192.168.0.1/admin').includes('ip'));
    assert.ok(ids('https://xn--pypal-4ve.com').includes('punycode'));
    assert.equal(analyzeUrl('https://bit.ly/abc').verdict, 'careful');
    assert.ok(ids('https://example.org:8443/').includes('port'));
    assert.ok(ids('http://example.org').includes('http'));
  });

  it('detecta enlaces que ejecutan código', () => {
    assert.equal(analyzeUrl('javascript:alert(1)').verdict, 'suspicious');
    assert.equal(analyzeUrl('data:text/html,<h1>hi</h1>').verdict, 'suspicious');
  });

  it('marca como inválido lo que no es un enlace', () => {
    assert.equal(analyzeUrl('').verdict, 'invalid');
    assert.equal(analyzeUrl('esto no es un enlace ::').verdict, 'invalid');
    assert.equal(analyzeUrl('ftp://example.com').verdict, 'invalid');
  });

  it('divide la dirección para mostrar el dominio real', () => {
    const parts = analyzeUrl('https://login.secure.example.com/a?b=1').parts;
    assert.equal(parts?.scheme, 'https://');
    assert.equal(parts?.subdomain, 'login.secure.');
    assert.equal(parts?.domain, 'example.com');
    assert.equal(parts?.rest, '/a?b=1');
  });

  it('no declara "seguro" a un enlace con muchas señales de alarma', () => {
    const result = analyzeUrl('http://secure-login-verify-account.top/update');
    assert.notEqual(result.verdict, 'looks-ok');
  });
});
