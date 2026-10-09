import { Layout } from '../../components/Layout';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb';
import { Img } from '../../components/Img/Img';
import s from './ONas.module.less';

const STATS: [string, string][] = [
  ['41', 'rokov v dermatológii'],
  ['29', 'rokov vlastnej ambulancie v Galante'],
  ['3', 'atestácie, z toho jedna onkologická'],
  ['7', 'rokov na kožnom oddelení, neskôr ako primárka'],
];

const CAREER: [string, string][] = [
  ['1985', 'Promócia, Lekárska fakulta UPJŠ Košice'],
  ['1985-1992', 'Kožné oddelenie Šaľa, sekundárna lekárka, neskôr primárka'],
  ['1988', 'I. atestácia z dermatovenerológie'],
  ['1992', 'II. atestácia z dermatovenerológie'],
  ['1992-1994', 'Zahraničná misia v Líbyi'],
  ['1994-1997', 'Ambulancia klinickej onkológie'],
  ['1996', 'Nadstavbová atestácia z klinickej onkológie'],
  ['od 1997', 'Súkromná kožná ambulancia LEADERM, s.r.o., Galanta'],
];

const GALLERY: [string, string][] = [
  ['interier', 'Ambulancia'],
  ['konzultacia', 'Konzultácia v ordinácii'],
  ['laser', 'Laserové pracovisko'],
];

export default function ONas() {
  return (
    <Layout active="onas">
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.heroText}>
            <Breadcrumb current="O nás" />
            <h1 className={s.h1}>
              <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="80">Koži rozumie</span></span>
              <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="180"><em>od roku 1985.</em></span></span>
            </h1>
            <p className={s.lead} data-reveal="" data-d="300">MUDr. Iveta Kupcová je dermatovenerologička s dvoma atestáciami z dermatovenerológie a nadstavbovou atestáciou z klinickej onkológie. Od roku 1997 vedie vlastnú ambulanciu v Galante.</p>
          </div>
          <div className={s.heroImg} data-reveal="" data-d="200">
            <Img name="kupcova-portret" alt="MUDr. Iveta Kupcová" width={1200} height={1500} priority sizes="(min-width: 900px) 40vw, 100vw" className={s.portrait} />
          </div>
        </div>
      </section>

      <section className={s.statsWrap}>
        <dl className={s.stats}>
          {STATS.map(([n, label], i) => (
            <div key={n} className={s.stat} data-reveal="" data-d={String(i * 80)}>
              <dt className={s.statNum}>{n}</dt>
              <dd className={s.statLabel}>{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={s.darkWrap}>
        <div className={s.dark}>
          <div className={s.darkInner}>
            <div className={s.darkHead}>
              <div className={s.eyebrowLight} data-reveal="">Lekárka</div>
              <h2 className={s.h2Dark} data-reveal="">MUDr. Iveta <em>Kupcová</em></h2>
            </div>
            <ol className={s.career}>
              {CAREER.map(([y, t]) => (
                <li key={y + t} className={s.careerRow} data-reveal="">
                  <span className={s.year}>{y}</span>
                  <span className={s.careerText}>{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={s.nurse}>
        <div className={s.nurseInner}>
          <div className={s.nursePhoto} data-reveal="" aria-hidden="true">
            <span className={s.initials}>PF</span>
          </div>
          <div className={s.nurseText}>
            <div className={s.eyebrow} data-reveal="">Sestra</div>
            <h2 className={s.h2Big} data-reveal="">Bc. Patrícia <em>Francisciová</em></h2>
            <p className={s.nurseP} data-reveal="">Sestra dermatovenerologickej ambulancie LEADERM.</p>
          </div>
        </div>
      </section>

      <section className={s.clinic}>
        <div className={s.clinicInner}>
          <div className={s.clinicHead}>
            <h2 className={s.h2} data-reveal="">Ambulancia</h2>
            <p className={s.clinicP} data-reveal="">Areál zdravia v Galante. Zmluvné poisťovne Dôvera, VšZP a Union. Prevádzkovateľ LEADERM, s.r.o.</p>
          </div>
          <ul className={s.gallery}>
            {GALLERY.map(([name, alt], i) => (
              <li key={name} className={s.galleryItem} data-reveal="" data-d={String(i * 80)}>
                <Img name={name} alt={alt} width={1600} height={1067} sizes="(min-width: 900px) 33vw, 100vw" className={s.cover} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
}
