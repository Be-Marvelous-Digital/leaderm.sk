import { Layout } from '../../components/Layout';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb';
import { Map } from '../../components/Map/Map';
import { CONTACT, ECAKAREN, WEEK_HOURS, mailto } from '../../data/site';
import { useMounted } from '../../hooks/useMounted';
import s from './Kontakt.module.less';

function Hours() {
  const mounted = useMounted();
  const now = mounted ? new Date() : null;
  const dow = now ? now.getDay() : -1;
  const mins = now ? now.getHours() * 60 + now.getMinutes() : -1;
  const closedToday = dow === 0 || dow >= 5;
  return (
    <ul className={s.hours}>
      {WEEK_HOURS.map(({ day, dow: n, time }) => {
        const td = n === dow;
        const open = td && mins >= 420 && mins < 870;
        const noLine = td || n + 1 === dow || (n === 4 && closedToday);
        return (
          <li key={n} className={`${s.row} ${td ? s.today : ''} ${noLine ? s.noLine : ''}`}>
            <span className={s.day}>
              {day}
              {td && (
                <span className={s.badge}>
                  <span className={`${s.dot} ${open ? s.dotOpen : ''}`} aria-hidden="true" />
                  {open ? 'Teraz otvorené' : 'Dnes'}
                </span>
              )}
            </span>
            <span className={s.time}>{time}</span>
          </li>
        );
      })}
      <li className={`${s.row} ${s.weekend} ${closedToday ? s.weekendToday : ''}`}>
        <span className={s.day}>
          Piatok – nedeľa
          {closedToday && (
            <span className={`${s.badge} ${s.badgeClosed}`}>
              <span className={`${s.dot} ${s.dotClosed}`} aria-hidden="true" />
              Dnes
            </span>
          )}
        </span>
        <span className={s.time}>zatvorené</span>
      </li>
    </ul>
  );
}

export default function Kontakt() {
  return (
    <Layout active="kontakt">
      <section className={s.hero}>
        <div className={s.heroInner}>
          <Breadcrumb current="Kontakt" />
          <h1 className={s.h1}>
            <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="80">Areál zdravia,</span></span>
            <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="180"><em>Galanta.</em></span></span>
          </h1>
          <ul className={s.cards}>
            <li data-reveal="" data-d="250">
              <a className={`${s.card} ${s.cardDark}`} href={`tel:${CONTACT.tel}`}>
                <span className={s.cardLabel}>Telefón</span>
                <span className={s.cardValue}>{CONTACT.phone}</span>
              </a>
            </li>
            <li data-reveal="" data-d="320">
              <a className={`${s.card} ${s.cardTerra}`} href={mailto('Dopyt z webu')}>
                <span className={s.cardLabel}>E-mail</span>
                <span className={`${s.cardValue} ${s.cardEmail}`}>{CONTACT.email}</span>
              </a>
            </li>
            <li data-reveal="" data-d="390">
              <a className={`${s.card} ${s.cardLight}`} href={ECAKAREN.profile} target="_blank" rel="noopener">
                <span className={s.cardLabel}>Objednanie</span>
                <span className={s.cardValue}>eČakáreň →</span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section className={s.darkWrap}>
        <div className={s.dark}>
          <div className={s.darkInner}>
            <div className={s.darkHead}>
              <h2 className={s.h2Dark} data-reveal="">Ako nás <em>nájdete</em></h2>
              <div className={s.address} data-reveal="">{CONTACT.street}, {CONTACT.city}</div>
            </div>
            <ol className={s.steps}>
              {CONTACT.directions.map((d, i) => (
                <li key={d} className={s.step} data-reveal="" data-d={String(i * 100)}>
                  <span className={s.stepNum} aria-hidden="true">{i + 1}</span>
                  <span className={s.stepLabel}>{d}</span>
                </li>
              ))}
            </ol>
            <div className={s.mapBox} data-reveal="">
              <Map className={s.map} />
            </div>
            <a className={s.navBtn} href={CONTACT.mapDirections} target="_blank" rel="noopener" data-reveal="">Navigovať do ambulancie →</a>
          </div>
        </div>
      </section>

      <section className={s.hoursSec}>
        <div className={s.split}>
          <div className={s.side}>
            <h2 className={s.h2} data-reveal="">Ordinačné <em>hodiny</em></h2>
            <p className={s.sideP} data-reveal="">Dovolenky a zmeny ordinačných hodín zverejňujeme na tomto webe a v aplikácii eČakáreň.</p>
          </div>
          <div className={s.hoursBox}>
            <Hours />
          </div>
        </div>
      </section>

      <section className={s.firmWrap}>
        <dl className={s.firm} data-reveal="">
          <div>
            <dt className={s.firmLabel}>Prevádzkovateľ</dt>
            <dd className={s.firmValue}>LEADERM, s.r.o.<br />Kožná ambulancia, dermatovenerológia</dd>
          </div>
          <div>
            <dt className={s.firmLabel}>Lekárka</dt>
            <dd className={s.firmValue}>MUDr. Iveta Kupcová</dd>
          </div>
          <div>
            <dt className={s.firmLabel}>Zmluvné poisťovne</dt>
            <dd className={s.firmValue}>{CONTACT.insurers}</dd>
          </div>
        </dl>
      </section>
    </Layout>
  );
}
