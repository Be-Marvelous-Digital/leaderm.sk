import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/fonts';
import './styles/base.less';
import { PAGES, type PageKey } from './routes';
import { PATHS } from './data/site';

const root = document.getElementById('root')!;
const declared = root.dataset.route as PageKey | undefined;

if (declared && declared in PAGES) {
  const Page = PAGES[declared];
  hydrateRoot(root, <StrictMode><Page /></StrictMode>);
} else {
  const match = (Object.entries(PATHS).find(([, p]) => p === location.pathname)?.[0] ?? 'notfound') as PageKey;
  const Page = PAGES[match];
  createRoot(root).render(<StrictMode><Page /></StrictMode>);
}
