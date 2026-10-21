import { CONTACT, ECAKAREN, FAQ_HOME, PATHS, SITE_URL, type RouteKey } from './site';

type Seo = { title: string; description: string; crumb?: string; noindex?: boolean };

export const SEO: Record<RouteKey | 'notfound', Seo> = {
  home: {
    title: 'Dermatológ Galanta – MUDr. Iveta Kupcová | Leaderm',
    description: 'Kožná ambulancia v Areáli zdravia Galanta. Liečba kože detí aj dospelých, kontrola znamienok, laser a estetika. Do poradia online cez eČakáreň.',
  },
  liecba: {
    title: 'Liečba kožných ochorení Galanta – znamienka, akné | Leaderm',
    description: 'Diagnostika a liečba ochorení kože, vlasov a nechtov pre deti aj dospelých. Kožné nádory, znamienka, akné. Hradené z verejného poistenia.',
    crumb: 'Liečba',
  },
  estetika: {
    title: 'Estetika a laser Galanta – botox, výplne, peeling | Leaderm',
    description: 'Kyselina hyalurónová, botulotoxín, chemický peeling a laser na znamienka, žilky a pigmentácie. Zákroky robí lekárka-dermatologička.',
    crumb: 'Estetika a laser',
  },
  objednanie: {
    title: 'Objednanie k dermatológovi cez eČakáreň | Leaderm Galanta',
    description: 'Ako sa prihlásiť do poradia z domu alebo po ceste a ako sa objednať na konkrétny termín v kožnej ambulancii MUDr. Ivety Kupcovej cez eČakáreň.',
    crumb: 'Ako sa objednať',
  },
  onas: {
    title: 'O nás – MUDr. Iveta Kupcová, Galanta | Leaderm',
    description: 'Primárka s praxou od roku 1985 a atestáciou z dermatovenerológie a onkológie. Spoznajte tím a ambulanciu v Areáli zdravia Galanta.',
    crumb: 'O nás',
  },
  cennik: {
    title: 'Cenník – dermatológ a estetika Galanta | Leaderm',
    description: 'Aktuálny cenník kožnej ambulancie Leaderm v Galante: estetické zákroky, laser, potvrdenia a výkony mimo zdravotného poistenia.',
    crumb: 'Cenník',
  },
  kontakt: {
    title: 'Kontakt a ordinačné hodiny, dermatológ Galanta | Leaderm',
    description: 'Kpt. Nálepku 727/13, Galanta. Telefón 0948 956 353, email leadermsro@gmail.com. Ordinačné hodiny a mapa.',
    crumb: 'Kontakt',
  },
  gdpr: {
    title: 'Ochrana osobných údajov | Leaderm',
    description: 'Informácie o spracúvaní osobných údajov na webe kožnej ambulancie LEADERM, s.r.o. v Galante.',
    crumb: 'Ochrana osobných údajov',
  },
  notfound: {
    title: 'Stránka nenájdená | Leaderm',
    description: 'Hľadaná stránka neexistuje.',
    noindex: true,
  },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const clinic = {
  '@type': 'MedicalClinic',
  '@id': `${SITE_URL}/#ambulancia`,
  name: 'LEADERM, s.r.o. – Kožná ambulancia MUDr. Iveta Kupcová',
  url: `${SITE_URL}/`,
  telephone: CONTACT.tel,
  email: CONTACT.email,
  image: `${SITE_URL}/og.jpg`,
  medicalSpecialty: 'Dermatology',
  priceRange: '€€',
  address: { '@type': 'PostalAddress', streetAddress: CONTACT.street, addressLocality: 'Galanta', postalCode: '924 01', addressCountry: 'SK' },
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '07:00', closes: '14:30' }],
  employee: { '@type': 'Physician', name: 'MUDr. Iveta Kupcová', medicalSpecialty: 'Dermatology' },
  sameAs: [ECAKAREN.profile],
  potentialAction: { '@type': 'ReserveAction', target: ECAKAREN.profile },
};

export function renderHead(key: RouteKey | 'notfound'): string {
  const s = SEO[key];
  const path = key === 'notfound' ? '/404.html' : PATHS[key];
  const url = `${SITE_URL}${path}`;
  const graph: object[] = [clinic];
  if (key !== 'notfound') {
    graph.push({
      '@type': 'WebPage', '@id': url, url, name: s.title, description: s.description, inLanguage: 'sk-SK',
      isPartOf: { '@type': 'WebSite', url: `${SITE_URL}/`, name: 'Leaderm' },
      about: { '@id': clinic['@id'] },
    });
  }
  if (s.crumb) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Domov', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: s.crumb, item: url },
      ],
    });
  }
  if (key === 'home') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: FAQ_HOME.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    });
  }
  const jsonld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return [
    `<title>${esc(s.title)}</title>`,
    `<meta name="description" content="${esc(s.description)}">`,
    s.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">\n<meta name="robots" content="index,follow,max-image-preview:large">`,
    '<meta name="theme-color" content="#F7F1EA">',
    '<meta property="og:type" content="website"><meta property="og:locale" content="sk_SK"><meta property="og:site_name" content="Leaderm">',
    `<meta property="og:title" content="${esc(s.title)}"><meta property="og:description" content="${esc(s.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE_URL}/og.jpg">`,
    '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Leaderm, kožná ambulancia MUDr. Ivety Kupcovej v Galante">',
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${jsonld}</script>`,
  ].join('\n');
}
