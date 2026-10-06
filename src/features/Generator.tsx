import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { OFFLINE_GUESSES_PER_SECOND, formatDuration, levelFromBits, secondsToGuess } from '../core/entropy.ts';
import {
  DEFAULT_PASSPHRASE_OPTIONS,
  DEFAULT_PASSWORD_OPTIONS,
  PASSPHRASE_WORDS_RANGE,
  PASSWORD_LENGTH_RANGE,
  generatePassphrase,
  generatePassword,
  passphraseEntropyBits,
  passwordEntropyBits,
} from '../core/generator.ts';
import type { PassphraseOptions, PasswordOptions } from '../core/generator.ts';
import { WORDS } from '../core/wordlist.ts';
import { CopyButton, Segmented, Slider, Switch } from '../ui/Controls.tsx';
import { Callout, LEVEL_INFO, Meter } from '../ui/Feedback.tsx';

type Mode = 'passphrase' | 'password';

const SEPARATORS: readonly { id: string; label: string }[] = [
  { id: '-', label: 'Guion' },
  { id: ' ', label: 'Espacio' },
  { id: '.', label: 'Punto' },
  { id: '_', label: 'Guion bajo' },
];

function safeGenerate(mode: Mode, phrase: PassphraseOptions, pass: PasswordOptions): string {
  try {
    return mode === 'passphrase' ? generatePassphrase(phrase) : generatePassword(pass);
  } catch {
    return '';
  }
}

export function Generator() {
  const [mode, setMode] = useState<Mode>('passphrase');
  const [phrase, setPhrase] = useState<PassphraseOptions>(DEFAULT_PASSPHRASE_OPTIONS);
  const [pass, setPass] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [nonce, setNonce] = useState(0);
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(safeGenerate(mode, phrase, pass));
  }, [mode, phrase, pass, nonce]);

  const noTypes = !pass.lowercase && !pass.uppercase && !pass.digits && !pass.symbols;
  const bits = mode === 'passphrase' ? passphraseEntropyBits(phrase) : passwordEntropyBits(pass);
  const level = levelFromBits(bits);
  const info = LEVEL_INFO[level];

  return (
    <div className="stack">
      <header className="tool-head">
        <h1>Generador</h1>
        <p>Crea contraseñas con aleatoriedad criptográfica real. Se generan en tu dispositivo y no se guardan.</p>
      </header>

      <section className="card">
        <Segmented<Mode>
          label="Tipo"
          value={mode}
          onChange={setMode}
          options={[
            { id: 'passphrase', label: 'Frase (recomendada)' },
            { id: 'password', label: 'Contraseña aleatoria' },
          ]}
        />

        <div className="output" aria-live="polite">
          {noTypes && mode === 'password' ? <span className="output__empty">Elige al menos un tipo de carácter</span> : <span className="output__text">{value}</span>}
        </div>

        <div className="btn-row">
          <button type="button" className="btn btn--primary" onClick={() => setNonce((n) => n + 1)}>
            <RefreshCw size={18} aria-hidden="true" /> Generar otra
          </button>
          <CopyButton text={value} disabled={value === ''} />
        </div>
      </section>

      <section className="card" aria-label="Opciones">
        {mode === 'passphrase' ? (
          <div className="stack stack--tight">
            <Slider label="Número de palabras" value={phrase.words} min={PASSPHRASE_WORDS_RANGE.min} max={PASSPHRASE_WORDS_RANGE.max} onChange={(words) => setPhrase((p) => ({ ...p, words }))} valueLabel={`${phrase.words} palabras`} />
            <Segmented<string> label="Separador" value={phrase.separator} onChange={(separator) => setPhrase((p) => ({ ...p, separator }))} options={SEPARATORS} />
            <Switch label="Primera letra en mayúscula" checked={phrase.capitalize} onChange={(capitalize) => setPhrase((p) => ({ ...p, capitalize }))} />
            <Switch label="Agregar un número al final" checked={phrase.addNumber} onChange={(addNumber) => setPhrase((p) => ({ ...p, addNumber }))} />
          </div>
        ) : (
          <div className="stack stack--tight">
            <Slider label="Largo" value={pass.length} min={PASSWORD_LENGTH_RANGE.min} max={PASSWORD_LENGTH_RANGE.max} onChange={(length) => setPass((p) => ({ ...p, length }))} valueLabel={`${pass.length} caracteres`} />
            <Switch label="Minúsculas (a-z)" checked={pass.lowercase} onChange={(lowercase) => setPass((p) => ({ ...p, lowercase }))} />
            <Switch label="Mayúsculas (A-Z)" checked={pass.uppercase} onChange={(uppercase) => setPass((p) => ({ ...p, uppercase }))} />
            <Switch label="Números (0-9)" checked={pass.digits} onChange={(digits) => setPass((p) => ({ ...p, digits }))} />
            <Switch label="Símbolos (!@#…)" checked={pass.symbols} onChange={(symbols) => setPass((p) => ({ ...p, symbols }))} />
            <Switch label="Evitar caracteres que se confunden (O, 0, l, 1)" checked={pass.avoidAmbiguous} onChange={(avoidAmbiguous) => setPass((p) => ({ ...p, avoidAmbiguous }))} />
          </div>
        )}
        {noTypes && mode === 'password' && <Callout tone="warn" title="Falta un tipo de carácter">Activa al menos una opción para poder generar la contraseña.</Callout>}
      </section>

      {!(noTypes && mode === 'password') && (
        <section className="card" aria-labelledby="gen-strength">
          <h2 id="gen-strength" className="card__title">Qué tan segura es</h2>
          <div className="strength">
            <span className={`strength__label strength__label--${info.tone}`}>{info.label}</span>
            <Meter level={level} />
          </div>
          <dl className="facts">
            <div><dt>Entropía</dt><dd>{Math.round(bits)} bits</dd></div>
            <div><dt>Tiempo para adivinarla (10 mil millones de intentos/s)</dt><dd>{formatDuration(secondsToGuess(bits, OFFLINE_GUESSES_PER_SECOND))}</dd></div>
          </dl>
          {mode === 'passphrase' && (
            <p className="hint">Calculado asumiendo que el atacante conoce la lista de {WORDS.length} palabras que usamos. Más palabras = mucho más segura.</p>
          )}
        </section>
      )}
    </div>
  );
}
