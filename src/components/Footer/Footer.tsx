import { CONTACT, ECAKAREN, COMPANY, PATHS, mailto } from '../../data/site';
import s from './Footer.module.less';

const LINKS: [string, string][] = [
  ['Liečba', PATHS.liecba],
  ['Estetika a laser', PATHS.estetika],
  ['Ako sa objednať', PATHS.objednanie],
  ['Cenník', PATHS.cennik],
  ['O nás', PATHS.onas],
  ['Kontakt', PATHS.kontakt],
];

export function Footer({ outerBg }: { outerBg?: 'dark' | 'light' }) {
  return (
    <footer className={`${s.footer} ${outerBg === 'dark' ? s.onDark : ''}`}>
      <div className={s.panel}>
        <div className={s.inner}>
          <div data-reveal="" className={s.top}>
            <h2 className={s.claim}>Vaša koža si zaslúži <em>skúsené oko.</em></h2>
            <div className={s.ctas}>
              <a href={ECAKAREN.profile} target="_blank" rel="noopener" className={s.ctaMain}>Prihlásiť sa do poradia</a>
              <a href={mailto('Dopyt z webu')} className={s.ctaSub}>Napísať e-mail</a>
            </div>
          </div>
          <div className={s.cols}>
            <div>
              <h3 className={s.colTitle}>Ambulancia</h3>
              <p className={s.text}>{CONTACT.place}<br />{CONTACT.street}<br />{CONTACT.city}</p>
              <p className={s.small}>Budova vpravo, 2. vchod,<br />2. poschodie</p>
            </div>
            <div>
              <h3 className={s.colTitle}>Kontakt</h3>
              <ul className={s.list}>
                <li><a href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a></li>
                <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
                <li><a href={ECAKAREN.profile} target="_blank" rel="noopener">eČakáreň</a></li>
              </ul>
            </div>
            <div>
              <h3 className={s.colTitle}>Ordinujeme</h3>
              <dl className={s.hours}>
                <dt>Po – Št</dt><dd>7:00-14:30</dd>
                <dt>Pi – Ne</dt><dd>zatvorené</dd>
              </dl>
              <p className={s.small}>{CONTACT.insurers}</p>
            </div>
            <nav aria-label="Stránky">
              <h3 className={s.colTitle}>Stránky</h3>
              <ul className={s.list}>
                {LINKS.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}
              </ul>
            </nav>
          </div>
        </div>
        <div className={s.bottom}>
          <span>© {new Date().getFullYear()} {COMPANY.name}</span>
          <div className={s.bottomLinks}>
            <a href={PATHS.gdpr}>Ochrana osobných údajov</a>
            <a href="#obsah" className={s.toTop}>Späť hore ↑</a>
          </div>
        </div>
        <div data-reveal="" aria-hidden="true" className={s.wordmark}>Leader<em>m</em></div>
      </div>
    </footer>
  );
}
