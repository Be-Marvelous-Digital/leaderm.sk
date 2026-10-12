import { useEffect, useRef, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Img } from '../../components/Img/Img';
import { Faq } from '../../components/Faq/Faq';
import { Map } from '../../components/Map/Map';
import { CAREER, CONTACT, ECAKAREN, FAQ_HOME, PATHS, mailto } from '../../data/site';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import { Hero } from './Hero';
import { Explainer } from './Explainer';
import { PriceTabs } from './PriceTabs';
import { HoursList } from './HoursList';
import s from './Home.module.less';

const TRUST: [string, string][] = [
  ['41 rokov', 'v dermatológii, od promócie v roku 1985. Bývalá primárka kožného oddelenia.'],
  ['Onkológia', 'nadstavbová atestácia z klinickej onkológie, pre istotu pri znamienkach a nádoroch kože.'],
  ['Deti aj dospelí', 'starostlivosť o kožu detí, mladistvých aj dospelých u jednej lekárky.'],
  ['3 poisťovne', 'zmluvy s Dôverou, VšZP a Union. Liečba ochorení je hradená z poistenia.'],
];

const CARE: [string, string][] = [
  ['Kožné a pohlavné ochorenia', 'Diagnostika a liečba u detí, mladistvých aj dospelých.'],
  ['Kožné nádory a znamienka', 'Diagnostika a liečba kožných nádorov vo všetkých vekových skupinách.'],
  ['Vlasy a nechty', 'Ochorenia vlasov a nechtov, nechtové infekcie a zápaly okolo nechtov.'],
  ['Rany a zápaly', 'Chronické rany, preležaniny, dermatitídy.'],
];

const AESTHETIC: [string, string, string][] = [
  ['Botulotoxín', 'Vrásky a nadmerné potenie', 'od 100 €'],
  ['Kyselina hyalurónová', 'Výplň vrások, hydratácia', 'od 200 €'],
  ['Chemický peeling', 'TCA, tvár, dekolt', '50 €'],
  ['Laser', 'Výrastky, žilky, pigmentácie, akné, omladenie', 'od 50 €'],
  ['Výrastky a žilky', 'Kryalizácia, elektrokauter, sklerotizácia varixov', 'od 10 €'],
];

const QUOTE = [
  'Od roku 1985 sa MUDr. Kupcová venuje jedinému orgánu, koži.',
  ' Ako primárka kožného oddelenia v Šali,',
  ' v ambulancii klinickej onkológie, na zahraničnej misii v Líbyi.',
  ' A od roku 1997 vo vlastnej ambulancii v Galante.',
];

const PRICES: [string, string, string][] = [
  ['Estetická konzultácia', '30', 'priceDark'],
  ['Kontrola znamienok', '50', 'priceBlush'],
  ['Laser, 1 útvar', '50', 'priceSurface'],
];

function Quote() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [q, setQ] = useState(4);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) {
      setQ(4);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3);
      setQ(Math.max(0, Math.min(4, Math.floor(p * 5))));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  return (
    <p ref={ref} className={s.quote}>
      {QUOTE.map((t, i) => (
        <span key={i} className={`${s.quotePart} ${q > i ? '' : s.quoteDim} ${i === 3 ? s.quoteAccent : ''}`}>{t}</span>
      ))}
    </p>
  );
}

export default function Home() {
  return (
    <Layout active="home" fixedNav footerOnDark>
      <Hero />

      <section className={s.trust}>
        <div className={s.trustHead}>
          <h2 className={s.trustTitle}>Prečo práve <em>Leaderm</em></h2>
          <p className={s.trustLead}>Skúsenosť primárky, istota onkologickej atestácie a ambulancia pre celú rodinu.</p>
        </div>
        <ul className={s.trustGrid}>
          {TRUST.map(([t, d], i) => (
            <li key={t} data-reveal="" data-d={i ? i * 100 : undefined} className={s.trustCell}>
              <div className={s.trustBig}>{t}</div>
              <div className={s.trustText}>{d}</div>
            </li>
          ))}
        </ul>
      </section>

      <section id="liecba" className={s.paths}>
        <div className={s.container}>
          <div data-reveal="" className={s.pathsHead}>
            <div className={s.eyebrow}>S čím vám pomôžeme</div>
            <h2 className={s.pathsTitle}>Dve cesty. Jedna lekárka.</h2>
            <p className={s.pathsLead}>Či prichádzate s vyrážkou, znamienkom alebo vráskou, vyšetruje a ošetruje vás atestovaná dermatologička, nie kozmetický salón.</p>
          </div>
          <div className={s.pathsGrid}>
            <article data-reveal="" className={`${s.card} ${s.cardCare}`}>
              <div className={s.cardTop}>
                <span className={s.cardKicker}>Liečebná dermatológia</span>
                <span className={s.cardBadge}>Hradené z poistenia</span>
              </div>
              <h3 className={s.cardTitle}>Choroby kože, vlasov a nechtov</h3>
              <ul className={s.cardList}>
                {CARE.map(([t, d]) => (
                  <li key={t} className={s.cardRow}>
                    <div className={s.cardRowTitle}>{t}</div>
                    <div className={s.cardRowText}>{d}</div>
                  </li>
                ))}
              </ul>
              <a href={ECAKAREN.profile} target="_blank" rel="noopener" className={s.cardCtaDark}>Prihlásiť sa na vyšetrenie →</a>
              <a href={PATHS.liecba} className={s.cardLink}>Všetko o liečbe</a>
            </article>
            <article id="estetika" data-reveal="" data-d="120" className={`${s.card} ${s.cardAesthetic}`}>
              <div className={s.cardTop}>
                <span className={s.cardKicker}>Korektívna a estetická dermatológia</span>
                <span className={s.cardBadge}>Konzultácia 30 €</span>
              </div>
              <h3 className={s.cardTitle}>Estetika a laser</h3>
              <ul className={s.cardList}>
                {AESTHETIC.map(([t, d, p]) => (
                  <li key={t} className={`${s.cardRow} ${s.cardRowPrice}`}>
                    <div>
                      <div className={s.cardRowTitle}>{t}</div>
                      <div className={s.cardRowText}>{d}</div>
                    </div>
                    <div className={s.cardPrice}>{p}</div>
                  </li>
                ))}
              </ul>
              <a href={mailto('Estetická konzultácia')} className={s.cardCtaTerra}>Dohodnúť konzultáciu →</a>
              <a href={PATHS.estetika} className={s.cardLink}>Všetky zákroky a laser</a>
            </article>
          </div>
        </div>
      </section>

      <section className={s.moles}>
        <div className={s.molesGrid}>
          <div>
            <div data-reveal="" className={s.eyebrowLight}>Prevencia</div>
            <h2 data-reveal="" data-d="100" className={s.molesTitle}>Znamienka skontroluje lekárka s&nbsp;<em>onkologickou</em> atestáciou.</h2>
            <p data-reveal="" data-d="200" className={s.molesLead}>MUDr. Kupcová pracovala tri roky v ambulancii klinickej onkológie. Ponúkame preventívne vyšetrenie melanocytových névov.</p>
            <div data-reveal="" data-d="300" className={s.molesStats}>
              <div><div className={s.molesNum}>50 €</div><div className={s.molesNote}>preventívne vyšetrenie névov</div></div>
              <div><div className={s.molesNum}>50 €</div><div className={s.molesNote}>laserové odstránenie 1 ks</div></div>
            </div>
          </div>
          <div data-reveal="" data-d="150" className={s.molesImgBox}>
            <Img name="znamienka" alt="Vyšetrenie znamienok na koži" width={1600} height={1067} sizes="(min-width: 900px) 50vw, 100vw" className={s.cover} />
          </div>
        </div>
      </section>

      <Explainer />

      <section id="ambulancia" className={s.team}>
        <div className={s.container}>
          <Quote />
          <div className={s.teamGrid}>
            <div data-reveal="" className={s.teamPhoto}>
              <Img name="kupcova-portret" alt="MUDr. Iveta Kupcová" width={1200} height={1500} sizes="(min-width: 900px) 50vw, 100vw" className={`${s.cover} ${s.teamImg}`} />
            </div>
            <div data-reveal="" data-d="120" className={s.teamInfo}>
              <div>
                <div className={s.eyebrow}>Lekárka · dermatovenerológ</div>
                <h3 className={s.teamName}>MUDr. Iveta Kupcová</h3>
              </div>
              <ul className={s.career}>
                {CAREER.map(([y, t]) => (
                  <li key={y} className={s.careerRow}><span className={s.careerYear}>{y}</span><span>{t}</span></li>
                ))}
              </ul>
              <div className={s.nurse}>
                <div className={s.nurseAvatar}>
                  <Img name="sestra" alt="Bc. Patrícia Francisciová" width={1024} height={1536} sizes="88px" className={`${s.cover} ${s.nurseImg}`} />
                </div>
                <div>
                  <div className={s.nurseRole}>Zdravotná sestra</div>
                  <div className={s.nurseName}>Bc. Patrícia Francisciová</div>
                  <p className={s.nurseBio}>Ošetrovateľstvo na UKF v Nitre, skúsenosti z Nemocnice sv. Lukáša v Galante. Kurzy kineziologického tejpovania a biodermálnych nití.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cennik" className={s.pricing}>
        <div className={s.pricingInner}>
          <div className={s.pricingHead}>
            <h2 data-reveal="" className={s.pricingTitle}>Cenník<em>.</em></h2>
            <p data-reveal="" data-d="100" className={s.pricingLead}>Liečba ochorení je pre poistencov Dôvery, VšZP a Union hradená. Estetické zákroky a výkony nehradené z poistenia sú spoplatnené podľa cenníka.</p>
          </div>
          <div className={s.priceCards}>
            {PRICES.map(([l, v, tone], i) => (
              <div key={l} data-reveal="" data-d={i ? i * 100 : undefined} className={`${s.priceCard} ${s[tone]}`}>
                <span className={s.priceLabel}>{l}</span>
                <span className={s.priceValue}>{v}<span className={s.priceEur}>€</span></span>
              </div>
            ))}
          </div>
          <div data-reveal="">
            <PriceTabs />
          </div>
        </div>
      </section>

      <section className={s.faq}>
        <div className={s.faqPanel}>
          <div className={s.faqInner}>
            <div className={s.faqAside}>
              <div data-reveal="">
                <div className={s.eyebrow}>Časté otázky</div>
                <h2 className={s.faqTitle}>Skôr než <em>prídete.</em></h2>
              </div>
              <a data-reveal="" data-d="100" href={mailto('Otázka z webu')} className={s.faqCard}>
                <span className={s.faqCardTitle}>Nenašli ste odpoveď?</span>
                <span className={s.faqCardText}>Napíšte nám alebo zavolajte na {CONTACT.phone}.</span>
                <span className={s.faqCardLink}>{CONTACT.email} →</span>
              </a>
            </div>
            <div className={s.faqList}>
              <Faq items={FAQ_HOME} />
            </div>
          </div>
        </div>
      </section>

      <section id="kontakt" className={s.contact}>
        <div className={s.contactGrid}>
          <div className={s.contactCol}>
            <div data-reveal="">
              <div className={s.eyebrowLight}>Kontakt</div>
              <h2 className={s.contactTitle}>Nájdete nás v&nbsp;Areáli zdravia.</h2>
            </div>
            <ol data-reveal="" data-d="100" className={s.dirs}>
              {CONTACT.directions.map((d, i) => (
                <li key={d} className={s.dir}><div className={s.dirNum}>{i + 1}</div><div className={s.dirText}>{d}</div></li>
              ))}
            </ol>
            <div data-reveal="" data-d="150" className={s.address}>
              {CONTACT.street}, {CONTACT.city}<br />
              <a href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a> · <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </div>
            <div data-reveal="" data-d="200">
              <h3 className={s.hoursTitle}>Ordinačné hodiny</h3>
              <HoursList />
            </div>
          </div>
          <div data-reveal="" data-d="120" className={s.contactSide}>
            <Map className={s.map} />
            <a href={CONTACT.mapDirections} target="_blank" rel="noopener" className={s.navLink}>Navigovať do ambulancie →</a>
            <a href={mailto('Dopyt z webu')} className={s.mailCard}>
              <span className={s.mailEyebrow}>Napíšte nám</span>
              <span className={s.mailAddr}>{CONTACT.email}</span>
              <span className={s.mailText}>Estetické konzultácie, laser, otázky k cenám. Na vyšetrenie sa prosím prihláste cez eČakáreň.</span>
              <span className={s.mailBtn}>Napísať e-mail →</span>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
