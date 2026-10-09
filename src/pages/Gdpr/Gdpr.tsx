import { Layout } from '../../components/Layout';
import { Breadcrumb } from '../../components/Breadcrumb/Breadcrumb';
import { COMPANY, CONTACT, PATHS } from '../../data/site';
import s from './Gdpr.module.less';

const ext = { target: '_blank', rel: 'noopener' } as const;

export default function Gdpr() {
  return (
    <Layout active="gdpr">
      <section className={s.hero}>
        <div className={s.heroInner}>
          <Breadcrumb current="Ochrana osobných údajov" />
          <h1 className={s.h1}>
            <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="80">Ochrana osobných</span></span>
            <span className={s.maskLine}><span data-reveal="" data-mask="" data-d="180"><em>údajov</em></span></span>
          </h1>
        </div>
      </section>

      <article className={s.body}>
        <section className={s.sec}>
          <h2 className={s.h2}>1. Prevádzkovateľ</h2>
          <dl className={s.facts}>
            <div><dt>Názov</dt><dd>{COMPANY.name}</dd></div>
            <div><dt>Sídlo</dt><dd>{COMPANY.address}</dd></div>
            <div><dt>IČO</dt><dd>{COMPANY.ico}</dd></div>
            <div><dt>DIČ</dt><dd>{COMPANY.dic}</dd></div>
            <div><dt>Zápis</dt><dd>{COMPANY.register}</dd></div>
            <div><dt>Konatelia</dt><dd>{COMPANY.executives.join(', ')}</dd></div>
            <div>
              <dt>Kontakt</dt>
              <dd><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>, <a href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a></dd>
            </div>
          </dl>
        </section>

        <section className={s.sec}>
          <h2 className={s.h2}>2. Na čo slúži tento dokument</h2>
          <p>Tu nájdete informácie podľa čl. 13 Nariadenia Európskeho parlamentu a Rady (EÚ) 2016/679 (GDPR) a zákona č. 18/2018 Z. z. o ochrane osobných údajov o tom, ako spracúvame osobné údaje pri používaní webu www.leaderm.sk.</p>
          <p>Poskytovanie zdravotnej starostlivosti a vedenie zdravotnej dokumentácie sa riadi zákonom č. 576/2004 Z. z. o zdravotnej starostlivosti a nie je predmetom tohto dokumentu.</p>
        </section>

        <section className={s.sec}>
          <h2 className={s.h2}>3. Komunikácia e-mailom a telefonicky</h2>
          <p>Ak nás kontaktujete e-mailom alebo telefonicky, spracúvame údaje, ktoré nám sami poskytnete:</p>
          <ul>
            <li>meno a priezvisko,</li>
            <li>e-mailovú adresu alebo telefónne číslo,</li>
            <li>obsah správy.</li>
          </ul>
          <p><strong>Účel:</strong> vybavenie vášho dopytu.<br />
            <strong>Právny základ:</strong> opatrenia pred uzavretím zmluvy na vašu žiadosť a náš oprávnený záujem odpovedať na otázky (čl. 6 ods. 1 písm. b) a f) GDPR).<br />
            <strong>Doba uchovávania:</strong> po dobu potrebnú na vybavenie dopytu, najviac 1 rok od poslednej komunikácie, ak nevznikne iný zákonný dôvod.</p>
          <p className={s.note}>Do e-mailu prosím neposielajte citlivé zdravotné údaje. Zdravotný stav s vami radi preberieme osobne v ambulancii.</p>
        </section>

        <section className={s.sec}>
          <h2 className={s.h2}>4. Objednávanie cez eČakáreň</h2>
          <p>Objednávanie a prihlasovanie do poradia prebieha cez službu eČakáreň. Ide o službu tretej strany, ktorá je vo vzťahu k údajom, ktoré do nej zadáte, samostatným prevádzkovateľom. Platia jej podmienky a zásady ochrany osobných údajov zverejnené na <a href="https://www.ecakaren.sk" {...ext}>www.ecakaren.sk</a>.</p>
        </section>

        <section className={s.sec}>
          <h2 className={s.h2}>5. Technické údaje a hosting</h2>
          <p>Pri návšteve webu server automaticky spracúva v serverových logoch IP adresu, čas požiadavky, požadovanú stránku a typ prehliadača. Robíme to na zaistenie bezpečnosti a prevádzky webu na základe oprávneného záujmu (čl. 6 ods. 1 písm. f) GDPR).</p>
          <p>Sprostredkovateľom je poskytovateľ hostingu Websupport s.r.o., Karadžičova 12, 821 08 Bratislava. Logy sa uchovávajú podľa nastavení hostingu, spravidla niekoľko týždňov.</p>
        </section>

        <section className={s.sec}>
          <h2 className={s.h2}>6. Mapa Google</h2>
          <p>Na stránkach <a href={PATHS.home}>Domov</a> a <a href={PATHS.kontakt}>Kontakt</a> je vložená mapa Google Maps od spoločnosti Google Ireland Limited. Mapa sa načíta automaticky pri zobrazení stránky. Váš prehliadač pritom odošle spoločnosti Google najmä IP adresu a technické údaje o prehliadači.</p>
          <p>Môže dôjsť k prenosu údajov do USA, ktorý je založený na rámci ochrany údajov EÚ – USA (EU–US Data Privacy Framework). Viac informácií nájdete v <a href="https://policies.google.com/privacy?hl=sk" {...ext}>zásadách ochrany súkromia spoločnosti Google</a>.</p>
        </section>

        <section className={s.sec}>
          <h2 className={s.h2}>7. Úložisko v prehliadači</h2>
          <ul>
            <li>Web neukladá cookies na sledovanie ani analytiku.</li>
            <li>V úložisku prehliadača (localStorage) si pamätá iba to, že ste zavreli aktuálny oznam. Ide o technicky nevyhnutný údaj bez osobných údajov.</li>
            <li>Administrácia webu používa nevyhnutné session cookie iba pre prihláseného správcu.</li>
          </ul>
        </section>

        <section className={s.sec}>
          <h2 className={s.h2}>8. Vaše práva</h2>
          <p>V súvislosti so spracúvaním osobných údajov máte právo:</p>
          <ul>
            <li>na prístup k osobným údajom,</li>
            <li>na opravu nesprávnych údajov,</li>
            <li>na vymazanie údajov,</li>
            <li>na obmedzenie spracúvania,</li>
            <li>na prenosnosť údajov,</li>
            <li>namietať proti spracúvaniu založenému na oprávnenom záujme,</li>
            <li>kedykoľvek odvolať súhlas, ak sa spracúvanie zakladá na súhlase.</li>
          </ul>
          <p>Svoje práva môžete uplatniť e-mailom na <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>
          <p>Ak sa domnievate, že spracúvaním porušujeme predpisy, môžete podať návrh na začatie konania na Úrad na ochranu osobných údajov Slovenskej republiky, Hraničná 12, 820 07 Bratislava 27, <a href="https://www.dataprotection.gov.sk" {...ext}>www.dataprotection.gov.sk</a>.</p>
        </section>

        <section className={s.sec}>
          <h2 className={s.h2}>9. Účinnosť</h2>
          <p>Tieto informácie sú účinné od 1. 11. 2026.</p>
        </section>
      </article>
    </Layout>
  );
}
