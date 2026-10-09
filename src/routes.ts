import type { ComponentType } from 'react';
import type { RouteKey } from './data/site';
import Home from './pages/Home/Home';
import Liecba from './pages/Liecba/Liecba';
import Estetika from './pages/Estetika/Estetika';
import Objednanie from './pages/Objednanie/Objednanie';
import ONas from './pages/ONas/ONas';
import Cennik from './pages/Cennik/Cennik';
import Kontakt from './pages/Kontakt/Kontakt';
import Gdpr from './pages/Gdpr/Gdpr';
import NotFound from './pages/NotFound/NotFound';

export type PageKey = RouteKey | 'notfound';

export const PAGES: Record<PageKey, ComponentType> = {
  home: Home,
  liecba: Liecba,
  estetika: Estetika,
  objednanie: Objednanie,
  onas: ONas,
  cennik: Cennik,
  kontakt: Kontakt,
  gdpr: Gdpr,
  notfound: NotFound,
};
