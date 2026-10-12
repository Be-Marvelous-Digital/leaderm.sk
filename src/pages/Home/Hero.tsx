import { useEffect, useRef, useState } from 'react';
import { CONTACT, ECAKAREN, MARQUEE, mailto } from '../../data/site';
import { Img } from '../../components/Img/Img';
import { pageReady } from '../../hooks/usePageReady';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import s from './Home.module.less';

const LINES: [string, number, boolean][] = [
  ['Vaša koža v rukách,', 1000, false],
  ['ktoré ju poznajú', 1100, false],
  ['štyri desaťročia.', 1200, true],
];

function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const m = ref.current;
    if (!m || reduced) return;
    let x = 0;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      x -= (now - last) * 0.04;
      const half = m.scrollWidth / 2;
      if (-x >= half) x += half;
      m.style.transform = `translateX(${x}px)`;
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      m.style.transform = '';
    };
  }, [reduced]);
  return (
    <div className={s.marqueeWrap} aria-hidden="true">
      <div className={s.marqueeBand}>
        <div ref={ref} className={s.marquee}>
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className={s.marqueeItem}><span>{m}</span><span className={s.marqueeStar}>✳</span></span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const frame = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setIntro(2);
      return;
    }
    let dead = false;
    const timers: number[] = [];
    pageReady().then(() => {
      if (dead) return;
      timers.push(window.setTimeout(() => setIntro(1), 250));
      timers.push(window.setTimeout(() => setIntro(2), 2100));
    });
    return () => {
      dead = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  useEffect(() => {
    const h = frame.current;
    if (!h || reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.9)));
      h.style.transform = `scale(${1 - p * 0.05})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      h.style.transform = '';
    };
  }, [reduced]);

  return (
    <section id="top" className={s.hero}>
      <div className={s.heroStage}>
        <div ref={frame} className={`${s.heroFrame} ${s[`intro${intro}`]}`}>
          <div className={s.heroImgs}>
            <img src="/img/kupcova-portret-blur.webp" alt="" aria-hidden="true" className={s.heroBlur} fetchPriority="high" />
            <Img name="kupcova-portret" alt="MUDr. Iveta Kupcová" width={1200} height={1500} priority sizes="(min-width: 900px) 60vw, 100vw" className={s.heroImg} />
          </div>
          <div className={s.heroShade} />
        </div>
        <div className={s.heroContent}>
          <div data-reveal="" data-d="900" className={s.heroTop}>
            <span>Kožná ambulancia · Galanta</span>
            <span>Dermatológia od 1985</span>
          </div>
          <div className={s.heroBottom}>
            <div className={s.heroTitleCol}>
              <h1 className={s.heroTitle}>
                {LINES.map(([t, d, em]) => (
                  <span key={t} className={s.maskLine}>
                    <span data-reveal="" data-mask="" data-d={d} className={s.maskInner}>{em ? <em>{t}</em> : t}</span>
                  </span>
                ))}
              </h1>
            </div>
            <div className={s.heroSide}>
              <p data-reveal="" data-d="1350" className={s.heroLead}>MUDr. Iveta Kupcová, dermatovenerológ s atestáciou z klinickej onkológie. Liečba kože, vlasov a nechtov pre deti aj dospelých. Estetika a laser.</p>
              <div data-reveal="" data-d="1450" className={s.heroCtas}>
                <a href={ECAKAREN.profile} target="_blank" rel="noopener" className={s.heroCtaMain}>Prihlásiť sa do poradia →</a>
                <a href={mailto('Dopyt z webu')} className={`${s.heroCtaSub} ${s.heroCtaMail}`}>Napísať e-mail</a>
                <a href={`tel:${CONTACT.tel}`} className={`${s.heroCtaSub} ${s.heroCtaTel}`}>Zavolať</a>
              </div>
              <div data-reveal="" data-d="1550" className={s.heroTags}>
                <span>Dôvera · VšZP · Union</span><span>Deti aj dospelí</span><span>Do poradia už z domu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Marquee />
    </section>
  );
}
