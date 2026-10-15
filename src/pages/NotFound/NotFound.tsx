import { Layout } from '../../components/Layout';
import { CONTACT, PATHS, type RouteKey } from '../../data/site';
import s from './NotFound.module.less';

const LINKS: [RouteKey, string, string][] = [
  ['liecba', 'Liečba', 'Kožné ochorenia, znamienka, vlasy a nechty'],
  ['estetika', 'Estetika a laser', 'Botulotoxín, kyselina hyalurónová, laser'],
  ['objednanie', 'Objednanie', 'Ako sa dostať do poradia cez eČakáreň'],
  ['cennik', 'Cenník', 'Ceny výkonov a zákrokov'],
  ['onas', 'O nás', 'MUDr. Iveta Kupcová a ambulancia'],
  ['kontakt', 'Kontakt', 'Adresa, ordinačné hodiny a mapa'],
];

export default function NotFound() {
  return (
    <Layout active="home">
      <section className={s.wrap}>
        <div className={s.inner}>
          <div className={s.head}>
            <p className={s.code} aria-hidden="true">
              <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="80">4<em>0</em>4</span></span>
            </p>
            <div className={s.headText}>
              <h1 className={s.h1} data-reveal="" data-d="200">Túto stránku sme nenašli ani pod <em>dermatoskopom.</em></h1>
              <p className={s.text} data-reveal="" data-d="280">Odkaz je zrejme neplatný alebo stránka zmenila adresu. Skúste niektorú z týchto:</p>
            </div>
          </div>

          <ul className={s.links}>
            {LINKS.map(([key, label, desc], i) => (
              <li key={key} data-reveal="" data-d={String(320 + i * 60)}>
                <a className={s.card} href={PATHS[key]}>
                  <span className={s.cardLabel}>{label}<span className={s.arrow} aria-hidden="true">→</span></span>
                  <span className={s.cardDesc}>{desc}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className={s.actions} data-reveal="" data-d="700">
            <a className={s.btn} href="/">Späť na úvod</a>
            <a className={s.link} href={`tel:${CONTACT.tel}`}>Zavolať {CONTACT.phone}</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
