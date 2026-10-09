import { Layout } from '../../components/Layout';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb';
import { PriceList } from '../../components/PriceList/PriceList';
import { PRICE_A, PRICE_B, mailto } from '../../data/site';
import s from './Cennik.module.less';

export default function Cennik() {
  return (
    <Layout active="cennik">
      <section className={s.hero}>
        <div className={s.heroInner}>
          <Breadcrumb current="Cenník" />
          <div className={s.heroRow}>
            <h1 className={s.h1}>
              <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="80">Cenník<em>.</em></span></span>
            </h1>
            <p className={s.lead} data-reveal="" data-d="200">Liečba ochorení je pre poistencov Dôvery, VšZP a Union hradená z verejného zdravotného poistenia. Estetické zákroky a výkony na žiadosť pacienta sú spoplatnené podľa cenníka.</p>
          </div>
          <div className={s.jump}>
            <a className={s.jumpDark} href="#estetika" data-reveal="" data-d="260">Estetika a laser</a>
            <a className={s.jumpOutline} href="#nehradene" data-reveal="" data-d="300">Nehradené výkony</a>
          </div>
        </div>
      </section>

      <section id="estetika" className={s.blushWrap}>
        <div className={s.blush}>
          <div className={s.split}>
            <div className={s.side}>
              <span className={s.eyebrowTerra} data-reveal="">Cenník B</span>
              <h2 className={s.h2} data-reveal="">Estetika <em>a laser</em></h2>
              <a className={s.cta} href={mailto('Estetická konzultácia')} data-reveal="">Dohodnúť konzultáciu</a>
            </div>
            <div className={s.list}>
              <PriceList rows={PRICE_B} tone="surface" />
            </div>
          </div>
        </div>
      </section>

      <section id="nehradene" className={s.plain}>
        <div className={s.split}>
          <div className={s.side}>
            <span className={s.eyebrow} data-reveal="">Cenník A</span>
            <h2 className={s.h2} data-reveal="">Nehradené <em>výkony</em></h2>
            <p className={s.sideP} data-reveal="">Výkony, ktoré nehradí verejné zdravotné poistenie, a vyšetrenia nepoistených pacientov.</p>
          </div>
          <div className={s.list}>
            <PriceList rows={PRICE_A} tone="sand" />
          </div>
        </div>
      </section>
    </Layout>
  );
}
