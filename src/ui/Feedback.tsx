import type { ReactNode } from 'react';
import type { StrengthLevel } from '../core/entropy.ts';

export type Tone = 'ok' | 'warn' | 'bad' | 'info';

export function StatusIcon({ tone }: { tone: Tone }) {
  const paths: Record<Tone, ReactNode> = {
    ok: <path d="M5 12.5l4.5 4.5L19 7.5" />,
    bad: <path d="M6 6l12 12M18 6L6 18" />,
    warn: (
      <>
        <path d="M12 7.5v6" />
        <path d="M12 17h.01" />
      </>
    ),
    info: (
      <>
        <path d="M12 11v6" />
        <path d="M12 7.5h.01" />
      </>
    ),
  };
  return (
    <svg className={`status-icon status-icon--${tone}`} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[tone]}
    </svg>
  );
}

export function Callout({ tone, title, children }: { tone: Tone; title?: string; children?: ReactNode }) {
  return (
    <div className={`callout callout--${tone}`} role={tone === 'bad' || tone === 'warn' ? 'alert' : 'status'}>
      <span className="callout__icon">
        <StatusIcon tone={tone} />
      </span>
      <div>
        {title !== undefined && <p className="callout__title">{title}</p>}
        {children !== undefined && <div className="callout__body">{children}</div>}
      </div>
    </div>
  );
}

export const LEVEL_INFO: Record<StrengthLevel, { label: string; tone: Tone; filled: number }> = {
  'very-weak': { label: 'Muy débil', tone: 'bad', filled: 1 },
  weak: { label: 'Débil', tone: 'bad', filled: 2 },
  fair: { label: 'Aceptable', tone: 'warn', filled: 3 },
  strong: { label: 'Fuerte', tone: 'ok', filled: 4 },
  'very-strong': { label: 'Muy fuerte', tone: 'ok', filled: 5 },
};

export function Meter({ level }: { level: StrengthLevel }) {
  const info = LEVEL_INFO[level];
  return (
    <div className={`meter meter--${info.tone}`} role="img" aria-label={`Fortaleza: ${info.label}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= info.filled ? 'meter__seg meter__seg--on' : 'meter__seg'} />
      ))}
    </div>
  );
}
