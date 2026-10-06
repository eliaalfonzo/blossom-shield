import { Eye, EyeOff, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { assessPassword, formatDuration } from '../core/entropy.ts';
import { BreachCheckError, checkPasswordBreach } from '../core/pwned.ts';
import type { BreachResult } from '../core/pwned.ts';
import { Callout, LEVEL_INFO, Meter } from '../ui/Feedback.tsx';
import type { View } from '../views.ts';

type CheckState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; result: BreachResult }
  | { status: 'error'; message: string };

export function BreachChecker({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<CheckState>({ status: 'idle' });
  const assessment = useMemo(() => assessPassword(password), [password]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password === '') return;
    setState({ status: 'loading' });
    try {
      setState({ status: 'done', result: await checkPasswordBreach(password) });
    } catch (error) {
      setState({ status: 'error', message: error instanceof BreachCheckError ? error.userMessage : 'No pudimos completar la revisión.' });
    }
  };

  const prefix = state.status === 'done' ? state.result.prefix : '5BAA6';
  const info = LEVEL_INFO[assessment.level];

  return (
    <div className="stack">
      <header className="tool-head">
        <h1>¿Me filtraron?</h1>
        <p>Comprueba si una contraseña ya apareció en filtraciones de datos reales. Se revisa sin enviar la contraseña.</p>
      </header>

      <form className="card" onSubmit={submit} autoComplete="off">
        <label className="field__label" htmlFor="pw">Escribe la contraseña que quieres revisar</label>
        <div className="input-row">
          <input
            id="pw"
            className="input input--mono"
            type={visible ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setState({ status: 'idle' });
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-lpignore="true"
            data-1p-ignore="true"
            placeholder="Escríbela aquí"
          />
          <button type="button" className="btn btn--icon" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={visible}>
            {visible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="btn-row">
          <button type="submit" className="btn btn--primary" disabled={password === '' || state.status === 'loading'}>
            <Search size={18} aria-hidden="true" /> {state.status === 'loading' ? 'Revisando…' : 'Revisar'}
          </button>
        </div>
        <p className="hint">Mejor usa una contraseña que ya no uses o que quieras verificar. Nunca se envía completa ni se guarda.</p>
      </form>

      <div aria-live="polite" className="stack">
        {state.status === 'done' && state.result.breached && (
          <Callout tone="bad" title={`Esta contraseña apareció ${state.result.count.toLocaleString('es')} ${state.result.count === 1 ? 'vez' : 'veces'} en filtraciones`}>
            <p>Cualquiera con esas listas puede probarla. No la uses, y cámbiala en cualquier cuenta donde la tengas.</p>
            <button type="button" className="link-btn" onClick={() => onNavigate('generator')}>Crear una contraseña nueva →</button>
          </Callout>
        )}
        {state.status === 'done' && !state.result.breached && (
          <Callout tone="ok" title="No apareció en filtraciones conocidas">
            <p>Buena señal, pero no es una garantía: una contraseña corta o predecible puede adivinarse aunque nunca se haya filtrado.</p>
          </Callout>
        )}
        {state.status === 'error' && <Callout tone="warn" title="No se pudo revisar">{state.message}</Callout>}
      </div>

      {password !== '' && (
        <section className="card" aria-labelledby="strength-title">
          <h2 id="strength-title" className="card__title">Qué tan difícil es adivinarla</h2>
          <div className="strength">
            <span className={`strength__label strength__label--${info.tone}`}>{info.label}</span>
            <Meter level={assessment.level} />
          </div>
          <dl className="facts">
            <div><dt>Largo</dt><dd>{assessment.length} caracteres</dd></div>
            <div><dt>Entropía estimada</dt><dd>{Math.round(assessment.bits)} bits</dd></div>
            <div><dt>Ataque en línea (100 intentos/s)</dt><dd>{formatDuration(assessment.onlineSeconds)}</dd></div>
            <div><dt>Ataque con la base de datos robada (10 mil millones/s)</dt><dd>{formatDuration(assessment.offlineSeconds)}</dd></div>
          </dl>
          <p className="hint">Es una estimación optimista: no detecta palabras ni patrones. Por eso la revisión de filtraciones es la prueba que más importa.</p>
        </section>
      )}

      <section className="card" aria-labelledby="how-title">
        <h2 id="how-title" className="card__title">¿Cómo la revisamos sin ver tu contraseña?</h2>
        <ol className="steps">
          <li><span className="steps__n">1</span><p>Tu navegador crea una <strong>huella digital</strong> (SHA-1) de la contraseña. La contraseña no sale de tu dispositivo.</p></li>
          <li><span className="steps__n">2</span><p>Solo se envían los <strong>primeros 5 caracteres</strong> de esa huella: <code>{prefix}</code>.</p></li>
          <li><span className="steps__n">3</span><p>El servicio responde con todas las huellas que empiezan igual{state.status === 'done' ? ` (${state.result.candidates.toLocaleString('es')} en este caso)` : ''}.</p></li>
          <li><span className="steps__n">4</span><p>Tu navegador busca la tuya en esa lista. <strong>El servicio nunca sabe cuál buscabas.</strong> A esto se le llama <em>k-anonymity</em>.</p></li>
        </ol>
      </section>
    </div>
  );
}
