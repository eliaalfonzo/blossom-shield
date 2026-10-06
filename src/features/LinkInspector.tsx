import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { analyzeUrl } from '../core/urlInspector.ts';
import type { FindingSeverity, UrlAnalysis, UrlParts, Verdict } from '../core/urlInspector.ts';
import { Callout, StatusIcon } from '../ui/Feedback.tsx';
import type { Tone } from '../ui/Feedback.tsx';

const EXAMPLES: readonly { label: string; url: string }[] = [
  { label: 'Imitación de PayPal', url: 'http://paypa1-seguro.com/login' },
  { label: 'Marca escondida', url: 'https://paypal.com.verificar-cuenta.xyz/login' },
  { label: 'Truco del @', url: 'https://google.com@sitio-raro.example/premio' },
  { label: 'Enlace normal', url: 'https://www.google.com/search?q=gatos' },
];

const VERDICTS: Record<Verdict, { tone: Tone; title: string; text: string }> = {
  'looks-ok': { tone: 'ok', title: 'No vemos señales de alarma', text: 'Aun así, no hay garantía. Si el enlace llegó de forma inesperada, entra escribiendo tú misma la dirección oficial.' },
  careful: { tone: 'warn', title: 'Ve con cuidado', text: 'Hay señales que merecen una segunda mirada antes de abrirlo o de escribir datos.' },
  suspicious: { tone: 'bad', title: 'Parece sospechoso', text: 'No lo abras ni escribas datos. Si crees que viene de un servicio real, entra escribiendo su dirección oficial.' },
  invalid: { tone: 'info', title: 'Eso no parece un enlace', text: 'Revisa que esté completo y sin espacios.' },
};

const SEVERITY_TONE: Record<FindingSeverity, Tone> = { ok: 'ok', info: 'info', warn: 'warn', danger: 'bad' };

function Breakdown({ parts }: { parts: UrlParts }) {
  return (
    <div className="breakdown">
      <p className="breakdown__label">Así se lee la dirección</p>
      <p className="breakdown__url" aria-label="Dirección dividida en partes">
        <span className="u u--muted">{parts.scheme}</span>
        {parts.userinfo !== '' && <span className="u u--bad">{parts.userinfo}</span>}
        {parts.subdomain !== '' && <span className="u u--sub">{parts.subdomain}</span>}
        <span className="u u--domain">{parts.domain}</span>
        <span className="u u--muted">{parts.rest}</span>
      </p>
      <ul className="legend">
        <li><span className="dot dot--domain" /> Dominio real: el sitio al que llegarías</li>
        <li><span className="dot dot--sub" /> Subdominio: puede ser un adorno para despistar</li>
        {parts.userinfo !== '' && <li><span className="dot dot--bad" /> Antes del @: no cuenta, es un truco</li>}
      </ul>
    </div>
  );
}

export function LinkInspector() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<UrlAnalysis | null>(null);

  const run = (value: string) => setAnalysis(analyzeUrl(value));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    run(text);
  };

  const verdict = analysis === null ? null : VERDICTS[analysis.verdict];
  const findings = analysis === null ? [] : analysis.findings.filter((f) => f.severity !== 'ok' || analysis.verdict !== 'invalid');

  return (
    <div className="stack">
      <header className="tool-head">
        <h1>Detector de enlaces</h1>
        <p>Pega un enlace y revisamos las señales típicas de phishing. <strong>No lo abrimos</strong>: solo analizamos su texto, en tu navegador.</p>
      </header>

      <form className="card" onSubmit={submit}>
        <label className="field__label" htmlFor="url">Enlace a revisar</label>
        <input id="url" className="input input--mono" type="text" inputMode="url" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="https://…" />
        <div className="btn-row">
          <button type="submit" className="btn btn--primary" disabled={text.trim() === ''}>
            <ShieldCheck size={18} aria-hidden="true" /> Analizar
          </button>
        </div>
        <div className="examples">
          <span className="hint">Prueba con un ejemplo:</span>
          {EXAMPLES.map((example) => (
            <button key={example.url} type="button" className="chip" onClick={() => { setText(example.url); run(example.url); }}>
              {example.label}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite" className="stack">
        {analysis !== null && verdict !== null && (
          <>
            <Callout tone={verdict.tone} title={verdict.title}>
              <p>{verdict.text}</p>
            </Callout>

            {analysis.parts !== null && (
              <section className="card">
                <Breakdown parts={analysis.parts} />
              </section>
            )}

            {findings.length > 0 && (
              <section className="card" aria-labelledby="findings-title">
                <h2 id="findings-title" className="card__title">Lo que encontramos</h2>
                <ul className="findings">
                  {findings.map((finding) => (
                    <li key={finding.id} className="finding">
                      <span className={`finding__icon finding__icon--${SEVERITY_TONE[finding.severity]}`}>
                        <StatusIcon tone={SEVERITY_TONE[finding.severity]} />
                      </span>
                      <div>
                        <p className="finding__title">{finding.title}</p>
                        <p className="finding__detail">{finding.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      <p className="hint">Esta herramienta usa reglas simples y no sustituye al sentido común: ninguna revisión detecta todas las estafas.</p>
    </div>
  );
}
