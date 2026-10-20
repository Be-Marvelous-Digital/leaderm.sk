import { useEffect, useRef, useState } from 'react';
import { ECAKAREN, CONTACT, NAV, PATHS, type RouteKey } from '../../data/site';
import { status } from '../../lib/hours';
import { useMounted } from '../../hooks/useMounted';
import { useScrollY } from '../../hooks/useScrollY';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import s from './Nav.module.less';

function Logo({ small }: { small?: boolean }) {
  return (
    <a href="/" className={`${s.logo} ${small ? s.logoSmall : ''}`}>
      <span className={s.logoMark} aria-hidden="true">L</span>
      <span className={s.logoText}>Leaderm</span>
    </a>
  );
}

function OpenStatus({ className }: { className?: string }) {
  const mounted = useMounted();
  if (!mounted) return null;
  const st = status(new Date());
  return (
    <a href={PATHS.kontakt} className={`${s.status} ${className ?? ''}`} title="Ordinačné hodiny">
      <span className={`${s.statusLabel} ${st.kind === 'open' ? s.statusOpen : ''}`}>{st.label}</span>
      <span className={s.statusTime}>{st.time}</span>
    </a>
  );
}

export function Nav({ active, fixed }: { active: RouteKey; fixed?: boolean }) {
  const y = useScrollY();
  const [menu, setMenuState] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const reduced = useReducedMotion();
  const setMenu = (open: boolean) => {
    setLeaving(!open && menu && !reduced);
    setMenuState(open);
  };
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrolled = y > 40;

  useEffect(() => {
    if (!menu) return;
    document.body.style.overflow = 'hidden';
    document.body.dataset.menu = '';
    menuRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        btnRef.current?.focus();
      }
    };
    addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      delete document.body.dataset.menu;
      removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const shell = `${s.shell} ${scrolled || menu ? s.scrolled : ''}`;

  return (
    <div className={`${s.wrap} ${fixed ? s.fixed : s.sticky}`}>
      <header className={s.desk}>
        <div className={shell}>
          <Logo />
          <nav aria-label="Hlavná navigácia" className={s.links}>
            {NAV.map((l) => (
              <a key={l.key} href={PATHS[l.key]} className={`${s.link} ${l.key === active ? s.active : ''}`} aria-current={l.key === active ? 'page' : undefined}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className={s.actions}>
            <OpenStatus />
            <a href={ECAKAREN.profile} target="_blank" rel="noopener" className={s.cta}>Objednať sa →</a>
          </div>
        </div>
      </header>

      <header className={s.mob}>
        <div className={`${shell} ${s.shellMob}`}>
          <Logo small />
          <div className={s.mobActions}>
            <a href={ECAKAREN.profile} target="_blank" rel="noopener" className={s.ctaMob}>Objednať</a>
            <button
              ref={btnRef}
              type="button"
              className={s.burger}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? 'Zavrieť menu' : 'Otvoriť menu'}
              onClick={() => setMenu(!menu)}
            >
              <span className={s.burgerLine} style={{ transform: menu ? 'translateY(3.25px) rotate(45deg)' : 'none' }} />
              <span className={s.burgerLine} style={{ transform: menu ? 'translateY(-3.25px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </div>
        <div
          id="mobile-menu"
          ref={menuRef}
          className={`${s.menu} ${menu ? s.menuIn : ''} ${leaving ? s.menuOut : ''}`}
          hidden={!menu && !leaving}
          inert={!menu}
          onAnimationEnd={(e) => { if (e.target === e.currentTarget && !menu) setLeaving(false); }}
        >
          <nav aria-label="Mobilná navigácia" className={s.menuLinks}>
            {NAV.map((l) => (
              <a key={l.key} href={PATHS[l.key]} className={`${s.menuLink} ${l.key === active ? s.menuActive : ''}`} aria-current={l.key === active ? 'page' : undefined} onClick={() => setMenu(false)}>
                {l.label}
              </a>
            ))}
          </nav>
          <OpenStatus className={s.menuStatus} />
          <div className={s.menuCtas}>
            <a href={ECAKAREN.profile} target="_blank" rel="noopener" className={s.menuCta}>Prihlásiť sa do poradia</a>
            <a href={`tel:${CONTACT.tel}`} className={s.menuCall}>Zavolať {CONTACT.phone}</a>
          </div>
        </div>
      </header>
    </div>
  );
}
