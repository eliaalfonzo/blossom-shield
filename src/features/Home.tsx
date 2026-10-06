import { ArrowRight, KeyRound, Link2, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { ShieldIllustration } from '../ui/Illustration.tsx';
import type { View } from '../views.ts';

interface Tool {
  view: View;
  title: string;
  text: string;
  icon: ReactNode;
}

const TOOLS: readonly Tool[] = [
  { view: 'breach', title: '¿Me filtraron?', text: 'Descubre si una contraseña apareció en filtraciones reales, sin enviarla a nadie.', icon: <KeyRound size={22} aria-hidden="true" /> },
  { view: 'generator', title: 'Generador', text: 'Crea frases y contraseñas imposibles de adivinar, con aleatoriedad de verdad.', icon: <Sparkles size={22} aria-hidden="true" /> },
  { view: 'links', title: 'Detector de enlaces', text: 'Pega un enlace sospechoso y te mostramos las señales de estafa, sin abrirlo.', icon: <Link2 size={22} aria-hidden="true" /> },
];

const PROMISES: readonly { title: string; text: string }[] = [
  { title: 'Tu contraseña nunca sale completa', text: 'Solo se envían 5 caracteres de su huella digital. El resto se compara en tu navegador.' },
  { title: 'Nada se guarda', text: 'No hay cuentas, ni cookies, ni almacenamiento. Cierras la pestaña y todo desaparece.' },
  { title: 'Sin rastreadores', text: 'No hay analíticas ni anuncios. La única conexión externa es la revisión de filtraciones.' },
];

export function Home({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">Kit de seguridad digital</p>
          <h1>Protege tus cuentas sin complicarte la vida.</h1>
          <p className="hero__lead">
            Tres herramientas que funcionan de verdad, directo en tu navegador: revisa si tu contraseña fue filtrada, crea claves fuertes y descubre si un enlace es una trampa.
          </p>
          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={() => onNavigate('breach')}>
              Revisar mi contraseña <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="btn btn--soft" onClick={() => onNavigate('generator')}>Crear una clave</button>
          </div>
        </div>
        <div className="hero__art">
          <ShieldIllustration />
        </div>
      </section>

      <section aria-labelledby="tools-title">
        <h2 id="tools-title" className="section-title">Elige por dónde empezar</h2>
        <div className="grid-3">
          {TOOLS.map((tool) => (
            <button key={tool.view} type="button" className="tool-card" onClick={() => onNavigate(tool.view)}>
              <span className="tool-card__icon">{tool.icon}</span>
              <span className="tool-card__title">{tool.title}</span>
              <span className="tool-card__text">{tool.text}</span>
              <span className="tool-card__go">Abrir <ArrowRight size={16} aria-hidden="true" /></span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="privacy-title" className="promises">
        <h2 id="privacy-title" className="section-title">Tu privacidad primero</h2>
        <div className="grid-3">
          {PROMISES.map((p) => (
            <div key={p.title} className="promise">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
