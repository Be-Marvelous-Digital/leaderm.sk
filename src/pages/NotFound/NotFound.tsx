import { Layout } from '../../components/Layout';
import { PATHS } from '../../data/site';
import s from './NotFound.module.less';

export default function NotFound() {
  return (
    <Layout active="home">
      <section className={s.wrap}>
        <div className={s.inner}>
          <h1 className={s.h1}>
            <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="80">4<em>0</em>4</span></span>
          </h1>
          <p className={s.text} data-reveal="" data-d="200">Stránku sme nenašli.</p>
          <div className={s.actions} data-reveal="" data-d="300">
            <a className={s.btn} href="/">Späť na úvod</a>
            <a className={s.link} href={PATHS.kontakt}>Kontaktujte nás →</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
