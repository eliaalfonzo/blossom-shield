import { Check, Copy } from 'lucide-react';
import { useId, useState } from 'react';

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch__track" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  valueLabel: string;
}

export function Slider({ label, value, min, max, onChange, valueLabel }: SliderProps) {
  const id = useId();
  return (
    <div className="field">
      <div className="field__row">
        <label htmlFor={id} className="field__label">{label}</label>
        <span className="field__value">{valueLabel}</span>
      </div>
      <input id={id} className="slider" type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button key={option.id} type="button" role="radio" aria-checked={option.id === value} className="segmented__item" onClick={() => onChange(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CopyButton({ text, disabled = false }: { text: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" className="btn btn--soft" onClick={copy} disabled={disabled}>
      {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
      {copied ? '¡Copiado!' : 'Copiar'}
    </button>
  );
}
