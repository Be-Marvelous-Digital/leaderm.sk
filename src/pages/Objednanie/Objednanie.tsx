import { Layout } from '../../components/Layout';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb';
import { Faq } from '../../components/Faq/Faq';
import { CONTACT, ECAKAREN, FAQ_ORDER } from '../../data/site';
import s from './Objednanie.module.less';

const STEPS: [string, string][] = [
  ['Otvorte eČakáreň', 'Na webe alebo v mobilnej aplikácii eČakáreň (iOS, Android) vyhľadajte MUDr. Ivetu Kupcovú, Galanta.'],
  ['Prihláste sa do poradia', 'Počas ordinačných hodín sa zaradíte do radu. Môžete byť ešte doma, v práci alebo na ceste.'],
  ['Sledujte poradie', 'V aplikácii vidíte, koľko ľudí je pred vami. Podľa toho si naplánujete, kedy vyraziť.'],
  ['Príďte do ambulancie', 'Areál zdravia, Kpt. Nálepku 727/13, Galanta. Budova vpravo, 2. vchod, 2. poschodie.'],
];

export default function Objednanie() {
  return (
    <Layout active="objednanie">
      <section className={s.hero}>
        <div className={s.heroInner}>
          <div className={s.heroText}>
            <Breadcrumb current="Ako sa objednať" />
            <h1 className={s.h1}>
              <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="80">Do poradia</span></span>
              <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="180"><em>už z domu.</em></span></span>
            </h1>
            <p className={s.lead} data-reveal="" data-d="300">Ambulancia funguje cez systém eČakáreň. Do poradia sa prihlásite z mobilu alebo počítača, kým ste ešte doma alebo cestou do práce. V čakárni potom nestrávite celé dopoludnie.</p>
            <div className={s.ctas} data-reveal="" data-d="400">
              <a className={s.btnPrimary} href={ECAKAREN.profile} target="_blank" rel="noopener">Otvoriť eČakáreň →</a>
              <a className={s.btnOutline} href={ECAKAREN.app} target="_blank" rel="noopener">Stiahnuť aplikáciu</a>
            </div>
          </div>
          <div className={s.phoneWrap} data-reveal="" data-d="200" aria-hidden="true">
            <div className={s.phone}>
              <div className={s.screen}>
                <div className={s.notch} />
                <div className={s.phoneSmall}>Kožná ambulancia, Galanta</div>
                <div className={s.phoneName}>MUDr. Iveta Kupcová</div>
                <div className={s.queue}>
                  <div className={s.phoneSmall}>Vaše poradie</div>
                  <div className={s.queueNum}>4</div>
                </div>
                <div className={s.phoneBtn}>Prihlásiť sa do poradia</div>
                <div className={s.phoneBtnOutline}>Objednať na termín</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.options}>
        <div className={s.optionsInner}>
          <h2 className={s.h2} data-reveal="">Dve možnosti</h2>
          <div className={s.optionGrid}>
            <div className={s.optionDark} data-reveal="">
              <span className={s.optionEyebrow}>Počas ordinačných hodín</span>
              <h3 className={s.optionH3}>Prihlásenie do poradia</h3>
              <p className={s.optionP}>V deň, keď ordinujeme, sa zaradíte do virtuálneho radu. V aplikácii vidíte svoje poradie a vyrazíte, keď sa blíži.</p>
              <a className={s.optionBtn} href={ECAKAREN.profile} target="_blank" rel="noopener">Prihlásiť sa →</a>
            </div>
            <div className={s.optionLight} data-reveal="" data-d="100">
              <span className={s.optionEyebrow}>Vopred</span>
              <h3 className={s.optionH3}>Objednanie na termín</h3>
              <p className={s.optionP}>Vyberiete si deň a čas, ktorý vám vyhovuje. Ak sa vám plány zmenia, termín presuniete alebo zrušíte v sekcii Moje termíny.</p>
              <a className={s.optionBtnOutline} href={ECAKAREN.account} target="_blank" rel="noopener">Moje termíny</a>
            </div>
          </div>
        </div>
      </section>

      <section className={s.stepsSection}>
        <div className={s.stepsInner}>
          <div className={s.stepsHead} data-reveal="">
            <h2 className={s.h2}>Krok za krokom</h2>
            <span className={s.note}>Zaberie to minútu</span>
          </div>
          <ol className={s.steps}>
            {STEPS.map(([title, text], i) => (
              <li key={title} className={s.step} data-reveal="">
                <span className={s.stepNum} aria-hidden="true">{i + 1}</span>
                <div>
                  <h3 className={s.stepH3}>{title}</h3>
                  <p className={s.stepP}>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={s.faqWrap}>
        <div className={s.faqBox}>
          <div className={s.faqInner}>
            <div className={s.faqSide}>
              <h2 className={s.faqH2} data-reveal="">Otázky k <em>eČakárni</em></h2>
              <div className={s.phoneCard} data-reveal="" data-d="100">
                <span className={s.phoneCardTitle}>Nemáte smartfón?</span>
                <span className={s.phoneCardText}>Zavolajte nám počas ordinačných hodín.</span>
                <a className={s.phoneCardLink} href={`tel:${CONTACT.tel}`}>{CONTACT.phone} →</a>
              </div>
            </div>
            <div className={s.faqList}>
              <Faq items={FAQ_ORDER} defaultOpen={0} />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
