import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/fonts';
import '../styles/base.less';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
