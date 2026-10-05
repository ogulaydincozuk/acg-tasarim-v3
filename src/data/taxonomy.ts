import type { Badge, CraftCategory, MainCategory, Season, SizeGroup, Usage } from './types';

export const USAGE_LABEL: Record<Usage, string> = {
  mum: 'Mum',
  'kokulu-tas': 'Kokulu Taş',
  boyama: 'Boyama',
  dekorasyon: 'Dekorasyon',
};

export const USAGE_ORDER: Usage[] = ['mum', 'kokulu-tas', 'boyama', 'dekorasyon'];

export const CATEGORY_LABEL: Record<MainCategory, string> = {
  kaliplar: 'Kalıplar',
  hammaddeler: 'Hammaddeler',
  setler: 'Setler',
};

export const BADGE_LABEL: Record<Badge, string> = {
  yeni: 'Yeni',
  'cok-satan': 'Çok Satan',
  indirim: 'İndirim',
};

export const SIZE_LABEL: Record<SizeGroup, string> = {
  kucuk: 'Küçük (0–7 cm)',
  orta: 'Orta (7–12 cm)',
  buyuk: 'Büyük (12 cm +)',
};

export const THEMES = ['Minimal', 'Geometrik', 'Doğa & Botanik', 'Figür', 'Harf & Rakam', 'Mutfak', 'Yılbaşı'];

export const PRICE_RANGES: { id: string; label: string; min: number; max: number }[] = [
  { id: '0-250', label: '250 TL altı', min: 0, max: 250 },
  { id: '250-500', label: '250 – 500 TL', min: 250, max: 500 },
  { id: '500-1000', label: '500 – 1.000 TL', min: 500, max: 1000 },
  { id: '1000-99999', label: '1.000 TL üzeri', min: 1000, max: 99999 },
];

/** "Ne üretmek istiyorsun?" — 6 üretim kategorisi */
export const CRAFT_CATEGORIES: CraftCategory[] = [
  { usage: 'mum', name: 'Mum', hint: 'Kalıp, wax, fitil, esans', image: 'archCandle' },
  { usage: 'kokulu-tas', name: 'Kokulu Taş', hint: 'Taş tozu, kalıp, esans', image: 'leafStones' },
  { usage: 'boyama', name: 'Boyama', hint: 'Boya, fırça, pigment', image: 'watercolorFlowers' },
  { usage: 'dekorasyon', name: 'Dekorasyon', hint: 'Vazo, tepsi, mumluk', image: 'vaseCollection' },
];

/* --------------------------------------------------------------------------
   Navigasyon
   -------------------------------------------------------------------------- */

export interface NavLink {
  label: string;
  to: string;
}

export interface NavItem extends NavLink {
  accent?: boolean;
}

/** Utility bar (header'ın en üst katmanı): sakin, metin tabanlı yardım bağlantıları */
export const UTILITY_LINKS: NavLink[] = [
  { label: 'Yardım', to: '/sayfa/sss' },
  { label: 'İletişim', to: '/sayfa/iletisim' },
  { label: 'Kargo & Teslimat', to: '/sayfa/kargo-teslimat' },
];

export const MAIN_NAV: NavItem[] = [
  { label: 'Kalıplar', to: '/kategori/kaliplar' },
  { label: 'Hammaddeler', to: '/kategori/hammaddeler' },
  { label: 'Mum', to: '/kategori/mum' },
  { label: 'Kokulu Taş', to: '/kategori/kokulu-tas' },
  { label: 'Dekorasyon', to: '/kategori/dekorasyon' },
  { label: 'Setler', to: '/kategori/setler' },
  { label: 'Yeni Gelenler', to: '/kategori/yeni-gelenler' },
  { label: 'Yılbaşı', to: '/kategori/yilbasi', accent: true },
  { label: 'Kampanyalar', to: '/kategori/kampanyalar', accent: true },
];

/* --------------------------------------------------------------------------
   Mega menü (masaüstünde "MENU" tetikleyicisi): üç kolon + tek vitrin kartı
   -------------------------------------------------------------------------- */

export interface MegaColumn {
  title: string;
  to: string;
  links: NavLink[];
}

/** /kategori/<slug>?alt=… — alt kategori filtresi (virgülle ayrılır, URL'de güvenle kodlanır) */
const bySubcategory = (slug: string, ...subs: string[]) => `/kategori/${slug}?${new URLSearchParams({ alt: subs.join(',') })}`;
const byUsage = (slug: string, usage: Usage) => `/kategori/${slug}?${new URLSearchParams({ kullanim: usage })}`;

export const MEGA_COLUMNS: MegaColumn[] = [
  {
    title: 'Kalıplar',
    to: '/kategori/kaliplar',
    links: [
      { label: 'Mum', to: byUsage('kaliplar', 'mum') },
      { label: 'Kokulu Taş', to: byUsage('kaliplar', 'kokulu-tas') },
      { label: 'Dekoratif', to: byUsage('kaliplar', 'dekorasyon') },
      { label: 'Yılbaşı', to: bySubcategory('yilbasi', 'Silikon Mum Kalıbı', 'Silikon Dekor Kalıbı') },
      { label: 'Tüm kalıplar', to: '/kategori/kaliplar' },
    ],
  },
  {
    title: 'Hammaddeler',
    to: '/kategori/hammaddeler',
    links: [
      { label: 'Wax & Mum Bazı', to: bySubcategory('hammaddeler', 'Wax & Mum Bazı') },
      { label: 'Taş Tozu & Alçı', to: bySubcategory('hammaddeler', 'Taş Tozu & Alçı') },
      { label: 'Esans', to: bySubcategory('hammaddeler', 'Esans') },
      { label: 'Pigment & Boya', to: bySubcategory('hammaddeler', 'Pigment & Boya') },
      { label: 'Tüm hammaddeler', to: '/kategori/hammaddeler' },
    ],
  },
  {
    title: 'Başlangıç Setleri',
    to: '/kategori/setler',
    links: [
      { label: 'Mum seti', to: byUsage('setler', 'mum') },
      { label: 'Kokulu Taş seti', to: byUsage('setler', 'kokulu-tas') },
      { label: 'Dekorasyon seti', to: byUsage('setler', 'dekorasyon') },
      { label: 'Boyama seti', to: byUsage('setler', 'boyama') },
      { label: 'Tüm setler', to: '/kategori/setler' },
    ],
  },
];

/* --------------------------------------------------------------------------
   Listeleme sayfası tanımları (slug → başlık + temel filtre)
   -------------------------------------------------------------------------- */

export interface ListingDef {
  slug: string;
  title: string;
  description: string;
  category?: MainCategory;
  usage?: Usage;
  onlyNew?: boolean;
  onlyDiscount?: boolean;
  season?: Season;
  /** Üstteki hızlı geçiş çipleri */
  quickLinks?: NavLink[];
}

const usageQuickLinks = (base: string): NavLink[] =>
  USAGE_ORDER.filter((u) => u !== 'boyama').map((u) => ({
    label: USAGE_LABEL[u],
    to: `${base}?kullanim=${u}`,
  }));

export const LISTINGS: Record<string, ListingDef> = {
  kaliplar: {
    slug: 'kaliplar',
    title: 'Kalıplar',
    description: 'Üretimin için seçilmiş kalıplar',
    category: 'kaliplar',
    quickLinks: usageQuickLinks('/kategori/kaliplar'),
  },
  hammaddeler: {
    slug: 'hammaddeler',
    title: 'Hammaddeler',
    description: 'Wax, taş tozu, esans ve pigmentler — üretimin temel malzemeleri.',
    category: 'hammaddeler',
    quickLinks: USAGE_ORDER.map((u) => ({ label: USAGE_LABEL[u], to: `/kategori/hammaddeler?kullanim=${u}` })),
  },
  setler: {
    slug: 'setler',
    title: 'Başlangıç Setleri',
    description: 'İlk üretimin için gereken her şey tek kutuda.',
    category: 'setler',
  },
  'yeni-gelenler': {
    slug: 'yeni-gelenler',
    title: 'Yeni Gelenler',
    description: 'Koleksiyona son eklenen kalıp ve hammaddeler.',
    onlyNew: true,
  },
  yilbasi: {
    slug: 'yilbasi',
    title: 'Yılbaşı Koleksiyonu',
    description: 'Noel Baba, çam ağacı, kardan adam ve mumluk ev: yeni yıla özel kalıplar, esanslar ve setler.',
    season: 'yilbasi',
    quickLinks: [
      { label: 'Tümü', to: '/kategori/yilbasi' },
      { label: 'Kalıplar', to: '/kategori/yilbasi?alt=Silikon+Mum+Kal%C4%B1b%C4%B1%2CSilikon+Dekor+Kal%C4%B1b%C4%B1' },
      { label: 'Esanslar', to: '/kategori/yilbasi?alt=Esans' },
      { label: 'Setler', to: '/kategori/yilbasi?alt=Ba%C5%9Flang%C4%B1%C3%A7+Seti' },
    ],
  },
  kampanyalar: {
    slug: 'kampanyalar',
    title: 'Kampanyalar',
    description: 'Seçili kalıp, hammadde ve setlerde dönemsel fiyat avantajları.',
    onlyDiscount: true,
  },
  ...Object.fromEntries(
    USAGE_ORDER.map((u) => [
      u,
      {
        slug: u,
        title: USAGE_LABEL[u],
        description: `${USAGE_LABEL[u]} üretimi için kalıplar, hammaddeler ve setler.`,
        usage: u,
        quickLinks: [
          { label: `${USAGE_LABEL[u]} kalıpları`, to: `/kategori/kaliplar?kullanim=${u}` },
          { label: `${USAGE_LABEL[u]} hammaddeleri`, to: `/kategori/hammaddeler?kullanim=${u}` },
          { label: 'Başlangıç setleri', to: `/kategori/setler?kullanim=${u}` },
        ],
      } satisfies ListingDef,
    ]),
  ),
};

export const SEARCH_LISTING: ListingDef = {
  slug: 'arama',
  title: 'Arama sonuçları',
  description: '',
};
