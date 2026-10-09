import { Layout } from '../../components/Layout';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb';
import { Img } from '../../components/Img/Img';
import { ECAKAREN, PATHS } from '../../data/site';
import s from './Liecba.module.less';

const AREAS: [string, string, string, string[]][] = [
  ['01', 'Kožné ochorenia', 'Diagnostika a liečba kožných ochorení detí, mladistvých aj dospelých.', ['Akné', 'Dermatitídy', 'Keratózy', 'Bradavice']],
  ['02', 'Kožné nádory a znamienka', 'Diagnostika a liečba kožných nádorov vo všetkých vekových skupinách. Preventívne prehliadky znamienok s onkologickým zázemím lekárky.', ['Prehliadka névov', 'Diagnostika nádorov', 'Odstránenie útvarov']],
  ['03', 'Pohlavné ochorenia', 'Diagnostika a liečba pohlavných ochorení.', []],
  ['04', 'Vlasy a nechty', 'Ochorenia vlasov a nechtov, nechtové infekcie a zápaly okolo nechtov.', ['Ochorenia vlasov', 'Nechtová pleseň', 'Zápaly okolo nechtov']],
  ['05', 'Rany a zápaly', 'Chronické rany, preležaniny a dermatitídy. Pri liečbe môžeme využiť aj laser na bakteriálnu redukciu.', []],
];

const MOLES: [string, string, string, number][] = [
  ['Preventívne vyšetrenie melanocytových névov', '50 €', 'konvenčný dermatoskop', 0],
  ['Celotelové vyšetrenie melanocytových névov', '100 €', 'digitálny dermatoskop', 40],
  ['Vyšetrenie névov pred odstránením z kozmetických dôvodov', '10 €', 'za 1 kus', 80],
  ['Laserové odstránenie znamienok, výrastkov, lézií a névov', 'od 50 €', 'prvý kus 50 €, každý ďalší pri tom istom sedení 30 €', 160],
  ['Odstránenie útvarov kože kryalizáciou alebo elektrokauterom', 'od 10 €', 'kryalizácia (tekutým dusíkom) aj elektrokauter od 10 €', 240],
];

const STEPS: [string, string][] = [
  ['Prihláste sa do poradia', 'Cez eČakáreň už z domu alebo cestou. Do čakárne prídete, keď sa blíži váš rad.'],
  ['Príďte do ambulancie', 'Areál zdravia, Kpt. Nálepku 727/13, Galanta. Budova vpravo, 2. vchod, 2. poschodie.'],
  ['Vyšetrenie a liečba', 'Vyšetrí vás MUDr. Iveta Kupcová, dermatovenerológ. Liečba je pre poistencov Dôvery, VšZP a Union hradená z poistenia.'],
];

export default function Liecba() {
  return (
    <Layout active="liecba">
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.heroText}>
            <Breadcrumb current="Liečba" />
            <h1 className={s.h1}>
              <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="80">Liečba kože,</span></span>
              <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="180">vlasov a <em>nechtov.</em></span></span>
            </h1>
            <p className={s.lead} data-reveal="" data-d="300">Diagnostika a liečba kožných a pohlavných ochorení detí, mladistvých aj dospelých. Pre poistencov Dôvery, VšZP a Union hradené z verejného zdravotného poistenia.</p>
            <div className={s.ctas} data-reveal="" data-d="400">
              <a className={s.btnPrimary} href={ECAKAREN.profile} target="_blank" rel="noopener">Prihlásiť sa do poradia →</a>
              <a className={s.btnOutline} href={PATHS.objednanie}>Ako sa objednať</a>
            </div>
          </div>
          <div className={s.heroImg} data-reveal="" data-d="200">
            <Img name="lupa" alt="Vyšetrenie pokožky" width={1200} height={1500} priority sizes="(min-width: 900px) 40vw, 100vw" className={s.cover} />
          </div>
        </div>
      </section>

      <section className={s.areas}>
        <div className={s.container}>
          <div className={s.areasHead} data-reveal="">
            <h2 className={s.h2}>S čím k nám prísť</h2>
            <span className={s.note}>5 oblastí, jedna lekárka</span>
          </div>
          <ul className={s.areaList}>
            {AREAS.map(([num, title, text, tags]) => (
              <li key={num} className={s.areaRow} data-reveal="">
                <div className={s.areaTitle}>
                  <span className={s.areaNum}>{num}</span>
                  <h3 className={s.h3}>{title}</h3>
                </div>
                <div className={s.areaBody}>
                  <p className={s.areaText}>{text}</p>
                  {tags.length > 0 && (
                    <ul className={s.tags}>
                      {tags.map((t) => <li key={t} className={s.tag}>{t}</li>)}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={s.darkWrap}>
        <div className={s.dark}>
          <div className={s.darkInner}>
            <div className={s.darkHead}>
              <h2 className={s.darkH2} data-reveal="">Kožné nádory <em>a znamienka.</em></h2>
              <p className={s.darkLead} data-reveal="" data-d="100">Diagnostika a liečba kožných nádorov u všetkých vekových skupín. MUDr. Kupcová má nadstavbovú atestáciu z klinickej onkológie.</p>
            </div>
            <ul className={s.cards}>
              {MOLES.map(([name, price, note, d]) => (
                <li key={name} className={s.card} data-reveal="" data-d={String(d)}>
                  <span className={s.cardName}>{name}</span>
                  <div className={s.cardFoot}>
                    <div className={s.cardPrice}>{price}</div>
                    <div className={s.cardNote}>{note}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className={s.darkFoot} data-reveal="">
              <a className={s.underLink} href={PATHS.cennik}>Celý cenník →</a>
              <a className={s.btnLight} href={ECAKAREN.profile} target="_blank" rel="noopener">Prihlásiť sa na kontrolu →</a>
            </div>
          </div>
        </div>
      </section>

      <section className={s.kids}>
        <div className={s.kidsInner}>
          <div className={s.kidsImg} data-reveal="">
            <Img name="deti" alt="Vyšetrenie dieťaťa s mamou" width={1600} height={1067} sizes="(min-width: 900px) 45vw, 100vw" className={s.cover} />
          </div>
          <div className={s.kidsText}>
            <div className={s.eyebrow} data-reveal="">Pre celú rodinu</div>
            <h2 className={s.kidsH2} data-reveal="" data-d="80">Kožné ochorenia detí, <em>mladistvých aj dospelých.</em></h2>
            <p className={s.kidsP} data-reveal="" data-d="160">Kvalifikovaná liečebno-preventívna starostlivosť o choroby kože, vlasov a nechtov pre deti aj dospelých.</p>
          </div>
        </div>
      </section>

      <section className={s.visit}>
        <div className={s.visitInner}>
          <h2 className={s.h2} data-reveal="">Ako prebieha návšteva</h2>
          <ol className={s.steps}>
            {STEPS.map(([title, text], i) => (
              <li key={title} className={s.step} data-reveal="" data-d={String(i * 100)}>
                <span className={s.stepNum} aria-hidden="true">{i + 1}</span>
                <div className={s.stepFoot}>
                  <h3 className={s.stepTitle}>{title}</h3>
                  <p className={s.stepText}>{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className={s.notice} data-reveal="">
            <span>Nepoistení pacienti a výkony na žiadosť (prehliadky, potvrdenia) sú spoplatnené.</span>
            <a href={PATHS.cennik}>Pozrieť cenník</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
