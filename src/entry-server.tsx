import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { PAGES, type PageKey } from './routes';
import { renderHead } from './data/seo';

export { PATHS, SITE_URL } from './data/site';

export function render(key: PageKey) {
  const Page = PAGES[key];
  return { html: renderToString(<StrictMode><Page /></StrictMode>), head: renderHead(key) };
}
