// src/lib/parser.js
// Türkçe DM ayıklama motoru (backend parser.js ile birebir aynı mantık).
const TR_CITIES = ["adana","adıyaman","afyon","afyonkarahisar","ağrı","amasya","ankara","antalya","artvin","aydın","balıkesir","bilecik","bingöl","bitlis","bolu","burdur","bursa","çanakkale","çankırı","çorum","denizli","diyarbakır","edirne","elazığ","erzincan","erzurum","eskişehir","gaziantep","giresun","gümüşhane","hakkari","hatay","ısparta","isparta","mersin","istanbul","izmir","kars","kastamonu","kayseri","kırklareli","kırşehir","kocaeli","konya","kütahya","malatya","manisa","kahramanmaraş","maraş","mardin","muğla","muş","nevşehir","niğde","ordu","rize","sakarya","samsun","siirt","sinop","sivas","tekirdağ","tokat","trabzon","tunceli","şanlıurfa","urfa","uşak","van","yozgat","zonguldak","aksaray","bayburt","karaman","kırıkkale","batman","şırnak","bartın","ardahan","ığdır","yalova","karabük","kilis","osmaniye","düzce"];
const ADDR_KEYWORDS = ["mahalle","mahallesi","mah.","mah ","mh.","mh ","sokak","sokağı","sok.","sok ","sk.","sk ","cadde","caddesi","cad.","cad ","cd.","bulvar","bulvarı","blv","apartman","apt.","apt ","apartmanı","daire","dair.","daire no","no:","no :","no.","kat:","kat ","kat.","blok","site","sitesi","kapı","kapı no","plaza","rezidans","mevki","mevkii","köyü","beldesi","posta kodu"];
const NAME_PATTERNS = [
  /(?:ad[ıi]m|ben[İ]?m? ad[ıi]m|ismim|ad[ıi]m soyad[ıi]m|al[ıi]c[ıi]|isim soyisim|ad[\- ]soyad|ad\/soyad)\s*[:\-]?\s*([A-Za-zÇĞİıÖŞÜçğöşü]+(?:\s+[A-Za-zÇĞİıÖŞÜçğöşü]+){0,2})/i,
  /^ben\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)/m,
];

export function extractPhone(text) {
  if (!text) return null;
  const m = /(?:\+?90[\s.\-]?)?(?:\(?0\)?[\s.\-]?)?(5\d{2})[\s.\-]?(\d{3})[\s.\-]?(\d{2})[\s.\-]?(\d{2})/.exec(text);
  return m ? `0${m[1]} ${m[2]} ${m[3]} ${m[4]}` : null;
}
export function extractPostal(text) {
  if (!text) return null;
  const ms = [...text.matchAll(/\b(\d{5})\b/g)].map((m) => m[1]);
  for (const c of ms) { const il = parseInt(c.slice(0, 2), 10); if (il >= 1 && il <= 81) return c; }
  return null;
}
export function extractCity(text) {
  if (!text) return null;
  const low = text.toLocaleLowerCase("tr");
  const f = TR_CITIES.filter((c) => new RegExp(`(^|[^a-zçğıöşü])${c}([^a-zçğıöşü]|$)`).test(low));
  if (!f.length) return null;
  f.sort((a, b) => b.length - a.length);
  const c = f[0];
  return c.charAt(0).toLocaleUpperCase("tr") + c.slice(1);
}
export function extractAddress(text) {
  if (!text) return null;
  const low = text.toLocaleLowerCase("tr");
  const hasKw = ADDR_KEYWORDS.some((k) => low.includes(k));
  const city = extractCity(text);
  if (!hasKw && !city) return null;
  const phone = extractPhone(text);
  const segs = text.split(/[\n\r]+|(?<=[.])\s+/).map((s) => s.trim()).filter(Boolean);
  const parts = segs.filter((s) => {
    const sl = s.toLocaleLowerCase("tr");
    const isAddr = ADDR_KEYWORDS.some((k) => sl.includes(k)) || (city && sl.includes(city.toLocaleLowerCase("tr")));
    return isAddr && !/^(ad[ıi]m|ben|ismim)/i.test(s);
  });
  let addr = parts.join(" ").replace(/\s+/g, " ").trim();
  if (!addr && city) addr = city;
  if (!addr) return null;
  if (phone) addr = addr.replace(/(?:\+?90[\s.\-]?)?(?:\(?0\)?[\s.\-]?)?5\d{2}[\s.\-]?\d{3}[\s.\-]?\d{2}[\s.\-]?\d{2}/g, "").trim();
  addr = addr.replace(/^[,\-\s]+|[,\-\s]+$/g, "");
  return addr.length > 5 ? addr : (city || null);
}
export function extractName(text, fb) {
  if (text) {
    for (const re of NAME_PATTERNS) {
      const m = re.exec(text);
      if (m && m[1]) {
        const c = m[1].trim().replace(/\s+/g, " ");
        if (/^[A-Za-zÇĞİıÖŞÜçğöşü ]{2,40}$/.test(c)) return c.replace(/\b\w/g, (x) => x.toLocaleUpperCase("tr"));
      }
    }
  }
  return fb ? fb.replace(/^@/, "") : null;
}
export function parseMessage(text, username) {
  return {
    name: extractName(text, username),
    phone: extractPhone(text),
    city: extractCity(text),
    postal: extractPostal(text),
    address: extractAddress(text),
  };
}
