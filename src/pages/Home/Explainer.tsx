import { useEffect, useRef, useState } from 'react';
import { CONTACT, ECAKAREN } from '../../data/site';
import { useDesktop, useReducedMotion } from '../../hooks/useMediaQuery';
import s from './Home.module.less';

const STEPS: [string, string, string][] = [
  ['01', 'Prihláste sa do poradia', 'Počas ordinačných hodín sa zaradíte do radu v aplikácii eČakáreň alebo na webe, bez toho, aby ste prišli do čakárne. Na mieste to ide aj cez kiosk.'],
  ['02', 'Vidíte, koľko ešte počkáte', 'Aplikácia ukazuje vaše poradie a odhad čakania. Čas trávite doma, v práci alebo na káve, nie na chodbe.'],
  ['03', 'Príďte, keď sa blíži váš rad', 'Poradie vidíte v aplikácii, takže viete, kedy vyraziť. Prídete pripravení a v čakárni strávite len pár minút.'],
  ['Alebo', 'Objednajte sa na konkrétny termín', 'Vyberiete si deň a čas vopred. Termín zmeníte alebo zrušíte v sekcii Moje termíny.'],
];

function Phone({ step }: { step: number }) {
  const sc = (i: number) => `${s.screen} ${i === step ? s.screenOn : i < step ? s.screenPast : ''}`;
  return (
    <div className={s.phone} aria-hidden="true">
      <div className={s.phoneScreen}>
        <div className={s.notch} />
        <div className={sc(0)}>
          <div className={s.phSmall}>Kožná ambulancia · Galanta</div>
          <div className={s.phName}>MUDr. Iveta Kupcová</div>
          <div className={s.phToday}><span className={s.phDot} />Dnes ordinuje</div>
          <div className={s.phQueue}>
            <div className={s.phQueueLabel}>Virtuálny rad</div>
            <div className={s.phQueueText}>Zaraďte sa a čakajte, kde chcete.</div>
          </div>
          <div className={s.phBtnMain}>Prihlásiť sa do poradia</div>
          <div className={s.phBtnSub}>Objednať na termín</div>
        </div>
        <div className={`${sc(1)} ${s.screenCenter}`}>
          <div className={`${s.phSmall} ${s.mt24}`}>Vaše poradie</div>
          <div className={s.phBig}>4</div>
          <div className={s.phEstimate}>
            <div className={s.phSmall13}>Odhad čakania</div>
            <div className={s.phEstimateVal}>~ 35 min</div>
          </div>
          <div className={s.phFoot}>Poradie sledujete priamo v aplikácii.</div>
        </div>
        <div className={`${sc(2)} ${s.screenSand}`}>
          <div className={`${s.phSmall} ${s.mt16}`}>Ste v poradí</div>
          <div className={s.phGo}>Môžete vyraziť do ambulancie.</div>
          <div className={s.phPlace}>
            <div className={s.phPlaceLabel}>{CONTACT.place}, Galanta</div>
            <div className={s.phDirs}>
              {CONTACT.directions.map((d, i) => (
                <div key={d} className={s.phDir}><div className={s.phDirNum}>{i + 1}</div>{d}</div>
              ))}
            </div>
          </div>
        </div>
        <div className={sc(3)}>
          <div className={s.phName}>Vyberte termín</div>
          <div className={s.phDays}>
            {['Po 12', 'Ut 13', 'St 14', 'Št 15', 'Pi 16'].map((d) => {
              const [a, b] = d.split(' ');
              return <div key={d} className={`${s.phDay} ${a === 'Ut' ? s.phDayOn : ''}`}>{a}<br />{b}</div>;
            })}
          </div>
          <div className={s.phTimes}>
            {['08:30', '09:15', '11:00', '13:45'].map((t) => (
              <div key={t} className={`${s.phTime} ${t === '09:15' ? s.phTimeOn : ''}`}>{t}</div>
            ))}
          </div>
          <div className={s.phNote}>Termín nájdete v sekcii Moje termíny.</div>
        </div>
      </div>
    </div>
  );
}

export function Explainer() {
  const [step, setStep] = useState(0);
  const desk = useDesktop();
  const reduced = useReducedMotion();
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (desk) {
      let raf = 0;
      const update = () => {
        raf = 0;
        const items = list.current ? [...list.current.children] : [];
        let best = -1;
        let bd = Infinity;
        items.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - innerHeight / 2);
          if (d < bd) { bd = d; best = i; }
        });
        if (best >= 0) setStep(best);
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
    }
    if (reduced) return;
    const t = setInterval(() => setStep((v) => (v + 1) % STEPS.length), 2800);
    return () => clearInterval(t);
  }, [desk, reduced]);

  return (
    <section id="objednanie" className={s.explainer}>
      <div className={s.container}>
        <div data-reveal="" className={s.explainerHead}>
          <div className={s.eyebrow}>Ako sa k nám objednať</div>
          <h2 className={s.explainerTitle}>Čakajte doma. <em>Príďte, keď ste na rade.</em></h2>
          <p className={s.explainerLead}>Ambulancia funguje cez systém eČakáreň. Do poradia sa prihlásite z mobilu už z domu alebo cestou do práce. V čakárni potom nesedíte zbytočne dlho.</p>
        </div>
        <div className={s.explainerBody}>
          <div className={s.phoneCol}><Phone step={step} /></div>
          <ol ref={list} className={s.steps}>
            {STEPS.map(([n, t, p], i) => (
              <li key={t} className={`${s.step} ${i === step ? s.stepOn : ''}`}>
                <div className={s.stepNum}>{n}</div>
                <h3 className={s.stepTitle}>{t}</h3>
                <p className={s.stepText}>{p}</p>
              </li>
            ))}
          </ol>
        </div>
        <div data-reveal="" className={s.ready}>
          <div className={s.readyText}>
            <div className={s.readyTitle}>Pripravení? Prihlásenie zaberie minútu.</div>
            <div className={s.readySub}>Funguje na webe aj v mobilnej aplikácii eČakáreň (iOS, Android). Termíny nájdete v sekcii Moje termíny.</div>
          </div>
          <div className={s.readyCtas}>
            <a href={ECAKAREN.profile} target="_blank" rel="noopener" className={s.readyMain}>Otvoriť eČakáreň →</a>
            <a href={ECAKAREN.app} target="_blank" rel="noopener" className={s.readySub2}>Stiahnuť aplikáciu</a>
            <a href={ECAKAREN.account} target="_blank" rel="noopener" className={s.readySub2}>Moje termíny</a>
          </div>
        </div>
      </div>
    </section>
  );
}
