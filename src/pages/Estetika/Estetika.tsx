import { Layout } from '../../components/Layout';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb';
import { Img } from '../../components/Img/Img';
import { PATHS, mailto } from '../../data/site';
import s from './Estetika.module.less';

type Block = {
  num: string;
  title: string;
  text: string;
  img: string;
  alt: string;
  rows: [string, string][];
  reverse?: boolean;
  single?: boolean;
};

const BLOCKS: Block[] = [
  {
    num: '01',
    title: 'Kyselina hyalurónová',
    text: 'Prirodzená súčasť vašej pokožky, ktorá zadržiava vodu a udržiava ju pružnú. Jej množstvo vekom klesá, medzi 40. a 50. rokom telo stráca až polovicu. Výplňou vyhladíme vrásky a vrátime pleti svieži, hydratovaný vzhľad.',
    img: 'injekcia-brada',
    alt: 'Aplikácia kyseliny hyalurónovej',
    rows: [['Výplň vrások', 'od 200 €'], ['Profhilo, tvár / krk', '200 €'], ['Profhilo, dekolt / vnútorná strana ramien', '350 €']],
  },
  {
    num: '02',
    title: 'Botulotoxín',
    text: 'Vo veľmi nízkych dávkach zabráni zmršťovaniu mimických svalov, ktoré je hlavnou príčinou tvorby vrások. Používa sa aj na liečbu nadmerného potenia dlaní, podpazušia a chodidiel.',
    img: 'injekcia-celo',
    alt: 'Aplikácia botulotoxínu',
    rows: [['Korekcia vrások', 'od 100 €'], ['Nadmerné potenie, oblasť', 'od 300 €']],
    reverse: true,
  },
  {
    num: '03',
    title: 'Chemický peeling',
    text: 'Roztok kyseliny trichlóroctovej (TCA) uvoľní vrchné vrstvy pokožky. Počas niekoľkých dní sa koža obnoví a v hlbšej vrstve sa tvorí nový kolagén. Používame ho na odstránenie prejavov starnutia kože, vrások a pigmentových škvŕn.',
    img: 'peel-doctor',
    alt: 'Chemický peeling',
    rows: [['Tvár alebo dekolt', 'oblasť 50 €']],
    single: true,
  },
];

const LASER: [string, string][] = [
  ['Znamienka, kožné výrastky, lézie a névy', 'prvý kus 50 €'],
  ['Bradavice', 'prvý kus 50 €'],
  ['Cievne anomálie', '50–150 €'],
  ['Nežiaduce pigmentácie', '50–100 €'],
  ['Rejuvenizácia (omladenie), 2 × 5 min', '50 € / procedúra'],
  ['Cielená terapia akné', '50–100 €'],
  ['Nechtová pleseň', '50–150 €'],
  ['Rany, zápaly, dermatitídy, bakteriálna redukcia', '10–20 € / oblasť'],
];

const OTHER: [string, string][] = [
  ['Odstránenie útvarov kože kryalizáciou (tekutým dusíkom)', 'od 10 €'],
  ['Odstránenie útvarov kože elektrokauterom', 'od 10 €'],
  ['Sklerotizácia varixov dolných končatín', 'od 100 €'],
  ['Lokálna anestézia', '20 €'],
];

const STEPS: [string, string][] = [
  ['Konzultácia', 'Konzultácia k estetickým a korektívnym zákrokom stojí 30 €.'],
  ['Plán a cena', 'Ceny podľa cenníka, pri rozpätí podľa rozsahu ošetrenia.'],
  ['Zákrok', 'V ambulancii v Areáli zdravia Galanta.'],
];

export default function Estetika() {
  return (
    <Layout active="estetika">
      <section className={s.hero}>
        <div className={s.heroInner}>
          <Breadcrumb current="Estetika a laser" />
          <h1 className={s.h1}>
            <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="80">Estetika</span></span>
            <span className={s.maskLine}><span className={s.indent} data-reveal="" data-mask="" data-d="180"><em>od lekárky.</em></span></span>
          </h1>
          <div className={s.heroRow}>
            <p className={s.lead} data-reveal="" data-d="300">Korektívna a estetická dermatológia s rovnakou odbornosťou ako liečba. Pred zákrokom si môžete dohodnúť konzultáciu za 30 €.</p>
            <div className={s.ctas} data-reveal="" data-d="400">
              <a className={s.btnPrimary} href={mailto('Estetická konzultácia')}>Konzultácia, 30 €</a>
              <a className={s.btnOutline} href={PATHS.cennik}>Cenník</a>
            </div>
          </div>
          <div className={s.heroImg} data-reveal="" data-d="200">
            <Img name="skincare" alt="Ošetrenie pleti" width={1600} height={1067} priority sizes="(min-width: 1280px) 1240px, 100vw" className={s.cover} />
          </div>
        </div>
      </section>

      <section className={s.treatments}>
        <div className={s.treatmentsInner}>
          {BLOCKS.map((b) => (
            <div key={b.num} className={`${s.block} ${b.reverse ? s.blockReverse : ''}`}>
              <div className={`${s.blockImg} ${b.reverse ? s.archBottom : ''}`} data-reveal="">
                <Img name={b.img} alt={b.alt} width={1200} height={1500} sizes="(min-width: 900px) 45vw, 100vw" className={s.cover} />
              </div>
              <div className={s.blockText}>
                <span className={s.num} data-reveal="">{b.num}</span>
                <h2 className={s.blockH2} data-reveal="">{b.title}</h2>
                <p className={s.blockP} data-reveal="">{b.text}</p>
                {b.single ? (
                  <dl className={s.single} data-reveal="">
                    <dt>{b.rows[0][0]}</dt>
                    <dd>{b.rows[0][1]}</dd>
                  </dl>
                ) : (
                  <dl className={s.prices} data-reveal="">
                    {b.rows.map(([label, price]) => (
                      <div key={label} className={s.priceRow}>
                        <dt>{label}</dt>
                        <dd>{price}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={s.darkWrap}>
        <div className={s.dark}>
          <div className={s.darkInner}>
            <div className={s.darkHead}>
              <div className={s.darkTitle}>
                <span className={s.numLight} data-reveal="">04</span>
                <h2 className={s.laserH2} data-reveal="">Laser<em>.</em></h2>
              </div>
              <p className={s.darkLead} data-reveal="" data-d="100">Nové možnosti korektívnych aj liečebných zákrokov.</p>
            </div>
            <div className={s.laserBody}>
              <div className={s.laserImg} data-reveal="">
                <Img name="laser" alt="Laserové ošetrenie pokožky" width={1200} height={1500} sizes="(min-width: 900px) 40vw, 100vw" className={s.cover} />
              </div>
              <div className={s.laserCol}>
                <ol className={s.laserList}>
                  {LASER.map(([label, price], i) => (
                    <li key={label} className={s.laserRow} data-reveal="">
                      <span className={s.laserNum} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      <span className={s.laserLabel}>{label}</span>
                      <span className={s.laserPrice}>{price}</span>
                    </li>
                  ))}
                </ol>
                <p className={s.laserNote}>Každý ďalší kus pri tom istom sedení 30 €. Pri rozpätí závisí cena od rozsahu ošetrenia. Pri rejuvenizácii sú odporúčané 3 procedúry (150 €), pri akné a ranách 5 procedúr.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.more}>
        <div className={s.moreInner}>
          <div className={s.otherWrap}>
            <h2 className={s.moreH2} data-reveal="">Ďalšie zákroky</h2>
            <dl className={s.otherList}>
              {OTHER.map(([label, price]) => (
                <div key={label} className={s.otherRow} data-reveal="">
                  <dt>{label}</dt>
                  <dd>{price}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={s.howWrap}>
            <h2 className={s.moreH2} data-reveal="">Ako to prebieha</h2>
            <ol className={s.steps}>
              {STEPS.map(([title, text], i) => (
                <li key={title} className={`${s.step} ${i === 0 ? s.stepAccent : ''}`} data-reveal="" data-d={String(i * 80)}>
                  <span className={s.stepNum} aria-hidden="true">{i + 1}</span>
                  <div className={s.stepFoot}>
                    <h3 className={s.stepTitle}>{title}</h3>
                    <p className={s.stepText}>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </Layout>
  );
}
