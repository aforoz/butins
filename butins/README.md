# Butins — Satış Takip CRM

## StackBlitz'te açma
1. https://stackblitz.com → giriş yap.
2. "Create new project" yerine **proje klasörünü stackblitz.com sayfasına sürükle-bırak** (en kolay yol).
3. StackBlitz `npm install`'ı otomatik çalıştırır.
4. Açılan terminalde gerekirse: `npm run dev`.

## Lokal çalıştırma (alternatif)
```bash
npm install
npm run dev
```

## Yapı
- `src/App.jsx` — uygulama kabuğu (giriş → işletme → IG bağlama → panel/paywall)
- `src/firebase.js` — Firebase yapılandırması (gerçek proje: butins-97e29)
- `src/*.jsx` — ekranlar
- `src/firestore/` — Firestore veri katmanı (kiracıya göre kapsamlı)
- `src/lib/parser.js` — Türkçe DM ayıklama motoru
