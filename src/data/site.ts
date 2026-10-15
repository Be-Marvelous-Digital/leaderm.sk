export const SITE_URL = 'https://www.leaderm.sk';

export const CONTACT = {
  phone: '0948 956 353',
  tel: '+421948956353',
  email: 'leadermsro@gmail.com',
  street: 'Kpt. Nálepku 727/13',
  city: '924 01 Galanta',
  place: 'Areál zdravia',
  directions: ['Budova vpravo', '2. vchod', '2. poschodie'],
  insurers: 'Dôvera, VšZP, Union',
  mapEmbed: 'https://maps.google.com/maps?q=Kpt.%20N%C3%A1lepku%20727%2F13%2C%20924%2001%20Galanta&z=16&output=embed',
  mapDirections: 'https://www.google.com/maps/dir/?api=1&destination=Kpt.+N%C3%A1lepku+727%2F13%2C+924+01+Galanta',
};

export const ECAKAREN = {
  profile: 'https://www.ecakaren.sk/lekari/iveta-kupcova/',
  app: 'https://www.ecakaren.sk/stiahnut-aplikaciu/',
  account: 'https://www.ecakaren.sk/mojekonto/',
};

export const mailto = (subject: string, body?: string) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ''}`;

export const COMPANY = {
  name: 'LEADERM, s.r.o.',
  address: 'kpt. Nálepku 727/13, 924 01 Galanta',
  ico: '36 286 371',
  dic: '2022178147',
  register: 'Obchodný register Okresného súdu Trnava, oddiel Sro, vložka č. 18268/T',
  executives: ['MUDr. Iveta Kupcová', 'Mgr. Lea Eliašová'],
};

export const SCHEDULE: Record<number, [number, number]> = {
  1: [420, 870],
  2: [420, 870],
  3: [420, 870],
  4: [420, 870],
};

export const WEEK_HOURS: { day: string; dow: number; time: string }[] = [
  { day: 'Pondelok', dow: 1, time: '7:00-14:30' },
  { day: 'Utorok', dow: 2, time: '7:00-14:30' },
  { day: 'Streda', dow: 3, time: '7:00-14:30' },
  { day: 'Štvrtok', dow: 4, time: '7:00-14:30' },
];

export type RouteKey = 'home' | 'liecba' | 'estetika' | 'objednanie' | 'onas' | 'cennik' | 'kontakt' | 'gdpr';

export const PATHS: Record<RouteKey, string> = {
  home: '/',
  liecba: '/liecba/',
  estetika: '/estetika/',
  objednanie: '/objednanie/',
  onas: '/o-nas/',
  cennik: '/cennik/',
  kontakt: '/kontakt/',
  gdpr: '/ochrana-osobnych-udajov/',
};

export const NAV: { key: RouteKey; label: string }[] = [
  { key: 'liecba', label: 'Liečba' },
  { key: 'estetika', label: 'Estetika a laser' },
  { key: 'objednanie', label: 'Objednanie' },
  { key: 'onas', label: 'O nás' },
  { key: 'cennik', label: 'Cenník' },
  { key: 'kontakt', label: 'Kontakt' },
];

export type PriceRow = [name: string, price: string];

export const PRICE_A: PriceRow[] = [
  ['Potvrdenie o zdravotnej spôsobilosti pred prácou v zahraničí', '20 €'],
  ['Potvrdenie o zdravotnej spôsobilosti (pred nástupom na špecializačný kurz, štúdium, na žiadosť zamestnávateľa, v súvislosti s výkonom povolania)', '10 €'],
  ['Ostatné výkony na žiadosť pacienta', 'od 10 €'],
  ['Prvé vyšetrenie nepoisteného pacienta', '50 €'],
  ['Kontrolné vyšetrenie nepoisteného pacienta s rovnakou diagnózou', '20 €'],
  ['Následné vyšetrenie nepoisteného pacienta s inou diagnózou', '40 €'],
  ['Vyšetrenie pre komerčné poisťovne', '100 €'],
  ['Výpis zo zdravotnej dokumentácie na žiadosť pacienta', '20 €'],
  ['Preventívne vyšetrenie melanocytových névov (konvenčný dermatoskop)', '50 €'],
  ['Celotelové vyšetrenie melanocytových névov (digitálny dermatoskop FotoFinder)', '100 €'],
  ['Vyšetrenie melanocytových névov pred odstránením z kozmetických dôvodov', '10 € / ks'],
];

export const PRICE_B: PriceRow[] = [
  ['Konzultácia pred korektívnymi zákrokmi', '30 €'],
  ['Korekcia vrások botulotoxínom', 'od 100 €'],
  ['Odstránenie nadmerného potenia botulotoxínom (dlane, podpažie, chodidlá)', 'od 300 € / oblasť'],
  ['Výplň vrások kyselinou hyalurónovou', 'od 200 €'],
  ['Profhilo (kys. hyalurónová), tvár / krk', '200 € / oblasť'],
  ['Profhilo, dekolt / vnútorná strana ramien', '350 € / oblasť'],
  ['Chemický peeling kyselinou trichlóroctovou (tvár, dekolt)', '50 € / oblasť'],
  ['Sklerotizácia varixov dolných končatín', 'od 100 €'],
  ['Lokálna anestézia', '20 €'],
  ['Laserové odstránenie znamienok, kožných výrastkov, lézií a névov', 'prvý kus 50 €, každý ďalší pri tom istom sedení 30 €'],
  ['Laserové odstránenie bradavíc', 'prvý kus 50 €, každý ďalší pri tom istom sedení 30 €'],
  ['Odstránenie nežiaducich pigmentácií (podľa rozsahu)', '50-100 €'],
  ['Odstránenie cievnych anomálií', '50-150 €'],
  ['Rejuvenizácia (omladenie) laserom, 1 procedúra (2 × 5 min), odporúčané 3 procedúry (150 €)', '50 € / procedúra'],
  ['Cielená terapia akné laserom (podľa rozsahu), odporúčaných 5 procedúr', '50-100 €'],
  ['Terapia nechtovej plesne laserom (podľa rozsahu)', '50-150 €'],
  ['Liečba rôznych druhov rán, zápalov, dermatitíd, bakteriálna redukcia (1-3 min), odporúčaných 5 procedúr', '10-20 € / oblasť'],
  ['Odstránenie útvarov kože elektrokauterom', 'od 10 €'],
  ['Odstránenie útvarov kože kryalizáciou (tekutým dusíkom)', 'od 10 €'],
];

export type Faq = [question: string, answer: string];

export const FAQ_HOME: Faq[] = [
  ['Ako sa objednám na vyšetrenie?', 'Počas ordinačných hodín sa prihláste do poradia cez eČakáreň (web alebo mobilná aplikácia), prípadne sa objednajte na konkrétny termín. Prihlásiť sa môžete už z domu alebo cestou.'],
  ['Ošetrujete aj deti?', 'Áno. Diagnostikujeme a liečime kožné ochorenia detí, mladistvých aj dospelých.'],
  ['S ktorými poisťovňami máte zmluvu?', 'S Dôverou, VšZP a Union. Vyšetrenie a liečba ochorení je hradená z verejného zdravotného poistenia.'],
  ['Koľko stojí estetická konzultácia?', 'Konzultácia k estetickým a korektívnym zákrokom stojí 30 €. Ceny jednotlivých zákrokov nájdete v cenníku vyššie.'],
  ['Nie som poistený na Slovensku. Môžem prísť?', 'Áno. Prvé vyšetrenie nepoisteného pacienta stojí 50 €, kontrolné s rovnakou diagnózou 20 €, následné s inou diagnózou 40 €. Vyšetrenie pre komerčné poisťovne stojí 100 €.'],
  ['Ako zmením alebo zruším termín?', 'V aplikácii eČakáreň alebo na webe v sekcii Moje termíny.'],
];

export const FAQ_ORDER: Faq[] = [
  ['Potrebujem aplikáciu?', 'Nie nevyhnutne. eČakáreň funguje aj cez web v prehliadači. Mobilná aplikácia pre iOS a Android je pohodlnejšia na sledovanie poradia.'],
  ['Kde zistím ordinačné hodiny?', 'V aplikácii na stránke ambulancie pod položkou Informácie. Dôležité oznamy, napríklad dovolenku, uvidíte hneď po otvorení.'],
  ['Ako zmením alebo zruším termín?', 'V aplikácii alebo na webe eČakárne v sekcii Moje termíny.'],
  ['Dá sa vždy objednať aj na konkrétny termín?', 'Nie vždy. Dostupnosť termínov závisí od kapacity ambulancie. Do poradia sa môžete prihlásiť počas ordinačných hodín.'],
  ['Čo ak prídem neskoro?', 'Sledujte svoje poradie v aplikácii a vyrazte s rezervou. Ak sa niečo zdrží, zavolajte nám.'],
];

export const MARQUEE = ['Kožné ochorenia', 'Znamienka', 'Kožné nádory', 'Laser', 'Botulotoxín', 'Vlasy a nechty', 'Kyselina hyalurónová', 'Akné', 'Chemický peeling', 'Žilky', 'Pigmentácie', 'Rejuvenizácia'];

export const CAREER: [string, string][] = [
  ['1985', 'Promócia, LF UPJŠ Košice'],
  ['1985-1992', 'Kožné oddelenie Šaľa, sekundárna lekárka, neskôr primárka'],
  ['1988 · 1992', 'I. a II. atestácia z dermatovenerológie'],
  ['1992-1994', 'Zahraničná misia v Líbyi'],
  ['1994-1997', 'Ambulancia klinickej onkológie'],
  ['1996', 'Nadstavbová atestácia z klinickej onkológie'],
  ['od 1997', 'Súkromná kožná ambulancia, LEADERM s.r.o.'],
];
