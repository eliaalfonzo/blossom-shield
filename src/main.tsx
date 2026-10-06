import '@fontsource-variable/fraunces';
import '@fontsource-variable/nunito';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles.css';

const root = document.getElementById('root');
if (root === null) throw new Error('No se encontró el elemento raíz');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
