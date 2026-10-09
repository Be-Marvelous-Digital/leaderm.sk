import type { ReactNode } from 'react';
import type { RouteKey } from '../data/site';
import { useReveal } from '../hooks/useReveal';
import { Nav } from './Nav/Nav';
import { Footer } from './Footer/Footer';
import { FloatingCta } from './FloatingCta/FloatingCta';
import { AnnouncementHost } from './Announcement/AnnouncementHost';

type Props = { active: RouteKey; fixedNav?: boolean; footerOnDark?: boolean; children: ReactNode };

export function Layout({ active, fixedNav, footerOnDark, children }: Props) {
  useReveal();
  return (
    <>
      <a className="skip-link" href="#obsah">Preskočiť na obsah</a>
      <Nav active={active} fixed={fixedNav} />
      <main id="obsah" tabIndex={-1}>{children}</main>
      <Footer outerBg={footerOnDark ? 'dark' : 'light'} />
      <FloatingCta />
      <AnnouncementHost />
    </>
  );
}
