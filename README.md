# ACG TASARIM — Web Sitesi Varyasyon 3 (Soft Bento · ACG Modern)

Varyasyon 2'nin **mantığı** (rotalar, sepet, favoriler, arama, filtre/sıralama, mock veri, demo ödeme/üyelik) korunarak
**header mimarisi** ve **tüm görsel dil** baştan tasarlanmış alternatif. Palet: *ACG Modern*. Tasarım dili: **"Soft Bento"**.

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tip kontrolü + üretim çıktısı (dist/)
npm run preview
```

Yönlendirme `HashRouter` ile yapılır; `dist/` herhangi bir statik sunucuya olduğunu gibi yüklenebilir.

## V1 / V2 / V3 — görsel fark

| | V1 | V2 | **V3** |
|---|---|---|---|
| Dil | Yumuşak, blob hero | Keskin köşe, editoryal, ince başlık | **Büyük yuvarlak köşeler, kalın başlık, bento kartlar** |
| Yazı tipi | Plus Jakarta Sans | Manrope (400 başlık) | **Inter** (650–700 başlık, sıkı harf aralığı) |
| Köşe | 8–18 px | 2–6 px | **8 / 12 / 16 / 24 / 32 px + hap (999)** |
| Butonlar | Yuvarlak | Keskin, BÜYÜK HARF | **Hap, cümle yazımı** (Graphite → hover Coral) |
| Etiketler | — | BÜYÜK HARF + altın çizgi | **Light Blush hap + Coral nokta** |
| Header | Logo sol · menü orta · ikonlar sağ | Aynı, daha sade | **Utility bar → ortalı logo → ayrı kategori rail'i + compact dock** |
| Hero | Blob + kolaj | Tipografi + ofsetli blok | **Slider: yuvarlak banner, degrade üstünde başlık, hap CTA, ilerlemeli noktalar** |
| Kategoriler | 6 kolon yuvarlak görsel | Katalog satırları | **Bento ızgara** (2×2 + 2 kare + 1 geniş karo) |
| Ürün kartı | Çerçeveli, 2 buton | Çerçevesiz, hover çubuğu | **Beyaz yuvarlak kart, dairesel + butonu, "Hızlı bak" hapı** |
| Öne çıkanlar | Grid | Grid | **Yatay kayan ürün şeridi** (oklu) |
| Setler | Pudra bant | 2×2 yatay satır | **Sekmeli özellik paneli** (set seç → görsel, içerik, fiyat) |
| Yeni gelenler | Grid | Grid | **Vitrin karosu + 3 kart** |
| Kampanya | Koyu panel | Blush panel | **Blush panel + indirimli ürün kartları** |
| Footer | Koyu bant | Açık/beyaz | **Yüzen yuvarlak Graphite panel** |
| Filtre / ürün sayfası | Çizgili | Çizgisiz, keskin | **Yuvarlak kartlar, hap çip/sekme, dairesel düğmeler** |

## Tasarım dili (Soft Bento)

- **Şekil:** kartlar 24 px, büyük paneller/banner 32 px (mobilde 20–24 px), kontroller hap. Çizgi yerine yumuşak yüzey farkı ve gölge.
- **Yüzeyler:** Soft White zemin · beyaz kart · Light Blush panel · tek Graphite panel (bölüm başına en fazla bir koyu blok).
- **Tipografi:** Inter Variable. Başlıklar 650–700 ağırlık, `-0.04em` civarı harf aralığı. BÜYÜK HARF + geniş aralıklı etiket yok (yalnızca header'ın utility bar/rail'inde).
- **Renk:** Coral yalnızca dolgu, nokta ve hover çizgisi; küçük metin için `--color-brand-ink`. Altın yalnızca aktif rail çizgisi.
- Tüm değerler `src/styles/tokens.css` ve `src/styles/base.css` içindedir (radius, gölge, ağırlık, `.btn`, `.eyebrow`, `.text-link`, `.input`). Bileşenler yalnızca semantik tokenları kullanır.

## Ana sayfa

utility bar → header → **hero slider** → kategoriler (bento) → öne çıkan ürünler (şerit) → **modern feature** → başlangıç setleri (sekmeli) → yeni gelenler → kampanya → footer.

### Hero slider (`src/sections/HeroSlider.tsx`)

Yuvarlak köşeli büyük banner, solda koyu degrade üzerinde kalın başlık + hap CTA, altında noktalı sayfalama ve banner'ın altından
görünen yumuşak "sonraki kart" şeridi. **Slaytlar dosyanın başındaki `slides` listesindedir**; yeni kampanya için bir öğe eklemek yeter
(görsel anahtarı `src/data/images.ts`'ten).

- Otomatik geçiş 6,5 sn; üzerine gelince/odaklanınca durur, **duraklat düğmesi** vardır, "hareketi azalt" tercihinde hiç başlamaz.
- Aktif nokta uzun hap olur ve süre boyunca Coral ile dolar.
- Ok düğmeleri (hover), ok tuşları, dokunmatikte kaydırma; kaydırma sonrası yanlış tıklama bastırılır.
- Erişilebilirlik: `aria-roledescription="carousel"`, etkin olmayan slaytlar `inert`, geçiş durunca `aria-live="polite"`, sayfada tek `h1`.
- Mobilde metin altta, degrade aşağıdan yukarıya.

## Header

Üç katman: **Utility bar** (32 px, Graphite) → **marka satırı** (100 px, ortalı logo; solda *Menü*; sağda *Ne arıyorsun?* hapı · *Favoriler (n)* · *Sepet*) →
**kategori rail'i** (46 px, logodan ayrı, ince hairline altında). Logo yeniden çizilmedi; yalnızca `--logo-h` ile boyutlanır (stretch yok).

- **Mega menü** (`MegaMenu.tsx`): yüzen yuvarlak kart; üç kolon (Kalıplar · Hammaddeler · Başlangıç Setleri) + "Çok Satanlar" vitrin kartı. Hover'la açılır, tıklayınca sabitlenir, Esc kapatır ve odağı geri verir; bağlantılar hazır filtreli listelere gider (`src/data/taxonomy.ts` → `MEGA_COLUMNS`).
- **Kaydırma** (`useHeaderDock`): tam header yapışmaz; ilk ekran geçilince **compact dock** (menü · logo · ara + sepet) belirir, yukarı kaydırınca altına kategori rail'i açılır. Yapışkan paneller `--stick-top` token'ına yaslanır.
- **Mobil** (< 1024 px): ayrı düzen — Menü · logo · sepet / geniş arama / yatay kayan rail; menü soldan açılan çekmecedir.
- **Arama overlay'i:** büyük alt çizgili input, popüler/son aramalar, kategoriler, ürün önerileri.

## Palet (ACG Modern)

`index.html` içindeki `<html data-theme="acg-modern">`; diğer iki palet (`ivory-blush`, `soft-premium`) `tokens.css`'te korunur.

| Token | Değer | Rol |
|---|---|---|
| Soft White | `#FCFCFB` | Zemin |
| Graphite | `#292827` | Metin, utility bar, tek koyu panel |
| ACG Coral | `#EFA99D` | CTA dolgusu, hover çizgisi, nokta |
| Light Blush | `#F8D8D2` | Etiket/çip zemini, blush paneller |
| Warm Gray | `#77716D` | İkincil metin |
| Muted Gold | `#D0A85C` | Yalnızca aktif rail çizgisi |

Coral `#EFA99D` açık zeminde küçük metin olarak okunmaz (≈ 1,9:1); bu yüzden hover'da Coral çizgi çizilir, metin Graphite'e koyulaşır.

## Bu varyasyonda yok (bilinçli)

Akademi/rehber, hesaplayıcılar, referanslar, müşteri ürünleri, blog, Instagram akışı, topluluk.

## V2'den devralınan işlevler

Sepet, favoriler, son aramalar, arama, filtre/sıralama, demo ödeme ve demo üyelik aynen çalışır. Kargo: 3.000 TL altı sabit ücret (`STORE.shippingFee`).
Üyelik (`#/hesap`) utility bar'daki **Giriş yap / Hesabım** bağlantısından açılır.

## Yayın öncesi değiştirilecek placeholder'lar

- **Görseller:** `src/data/images.ts` — Unsplash stok fotoğrafları (önizleme). Hero slaytları, kategori karoları, Modern Feature ve mega menü kartı buradan beslenir.
- **Mağaza bilgileri:** `src/data/content.ts` → `STORE` (kargo eşiği, iletişim, sosyal medya).
- **Utility bağlantıları:** `src/data/taxonomy.ts` → `UTILITY_LINKS` (*Yardım* şimdilik SSS'ye gider; *İletişim* için ayrı içerik sayfası yok).
- **Ürün verisi:** `src/data/products.ts` — fiyat, stok, puan örnektir.
- **Ödeme logoları** (footer) ve **yorumlar** örnek alandır.
