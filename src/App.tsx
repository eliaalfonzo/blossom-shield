import { Flower2, KeyRound, Link2, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { BreachChecker } from './features/BreachChecker.tsx';
import { Generator } from './features/Generator.tsx';
import { Home } from './features/Home.tsx';
import { LinkInspector } from './features/LinkInspector.tsx';
import { VIEWS } from './views.ts';
import type { View } from './views.ts';

const NAV: readonly { view: View; label: string; icon: ReactNode }[] = [
  { view: 'home', label: 'Inicio', icon: <Flower2 size={20} aria-hidden="true" /> },
  { view: 'breach', label: '¿Me filtraron?', icon: <KeyRound size={20} aria-hidden="true" /> },
  { view: 'generator', label: 'Generador', icon: <Sparkles size={20} aria-hidden="true" /> },
  { view: 'links', label: 'Enlaces', icon: <Link2 size={20} aria-hidden="true" /> },
];

function readView(): View {
  const name = window.location.hash.replace(/^#\/?/, '');
  return VIEWS.find((v) => v === name) ?? 'home';
}

export function App() {
  const [view, setView] = useState<View>(readView);

  useEffect(() => {
    const onHashChange = () => setView(readView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const navigate = useCallback((next: View) => {
    window.location.hash = next === 'home' ? '/' : `/${next}`;
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => navigate('home')} aria-label="Blossom Shield, ir al inicio">
          <span className="brand__mark"><Flower2 size={20} aria-hidden="true" /></span>
          <span className="brand__name">Blossom Shield</span>
        </button>
        <nav className="topnav" aria-label="Principal">
          {NAV.map((item) => (
            <button key={item.view} type="button" className="topnav__item" aria-current={view === item.view ? 'page' : undefined} onClick={() => navigate(item.view)}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {view === 'home' && <Home onNavigate={navigate} />}
        {view === 'breach' && <BreachChecker onNavigate={navigate} />}
        {view === 'generator' && <Generator />}
        {view === 'links' && <LinkInspector />}
      </main>

      <footer className="footer">
        <small>Desarrollado por Elia</small>
      </footer>

      <nav className="bottomnav" aria-label="Navegación móvil">
        {NAV.map((item) => (
          <button key={item.view} type="button" className="bottomnav__item" aria-current={view === item.view ? 'page' : undefined} onClick={() => navigate(item.view)}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
