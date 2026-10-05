import { PRODUCTS } from '../data/products';
import { PRICE_RANGES, SIZE_LABEL, THEMES, USAGE_LABEL, USAGE_ORDER, type ListingDef } from '../data/taxonomy';
import type { Product, SizeGroup, Usage } from '../data/types';
import { searchProducts } from './search';

/**
 * Listeleme mantığı. Filtre durumu URL'de tutulur (paylaşılabilir, geri tuşuyla
 * uyumlu, SEO dostu). Facet sayıları "diğer filtreler uygulanmış" hâle göre
 * hesaplanır — büyük katalogda sıfır sonuçlu seçimleri önler.
 */

export type SortKey = 'onerilen' | 'yeni' | 'cok-satan' | 'fiyat-artan' | 'fiyat-azalan' | 'puan';

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'onerilen', label: 'Önerilen' },
  { id: 'cok-satan', label: 'En çok satan' },
  { id: 'yeni', label: 'En yeni' },
  { id: 'fiyat-artan', label: 'Fiyat: düşükten yükseğe' },
  { id: 'fiyat-azalan', label: 'Fiyat: yüksekten düşüğe' },
  { id: 'puan', label: 'En yüksek puan' },
];

export interface Filters {
  alt: string[];
  kullanim: Usage[];
  tema: string[];
  boyut: SizeGroup[];
  fiyat: string[];
  stok: boolean;
  yeni: boolean;
  coksatan: boolean;
}

export type FacetKey = 'alt' | 'kullanim' | 'tema' | 'boyut' | 'fiyat';
export type ToggleKey = 'stok' | 'yeni' | 'coksatan';

const list = (params: URLSearchParams, key: string) =>
  (params.get(key) ?? '').split(',').map((s) => s.trim()).filter(Boolean);

export function readFilters(params: URLSearchParams): Filters {
  return {
    alt: list(params, 'alt'),
    kullanim: list(params, 'kullanim') as Usage[],
    tema: list(params, 'tema'),
    boyut: list(params, 'boyut') as SizeGroup[],
    fiyat: list(params, 'fiyat'),
    stok: params.get('stok') === '1',
    yeni: params.get('yeni') === '1',
    coksatan: params.get('coksatan') === '1',
  };
}

export const readSort = (params: URLSearchParams): SortKey =>
  (SORT_OPTIONS.find((o) => o.id === params.get('sirala'))?.id ?? 'onerilen') as SortKey;

export function activeFilterCount(f: Filters) {
  return f.alt.length + f.kullanim.length + f.tema.length + f.boyut.length + f.fiyat.length + +f.stok + +f.yeni + +f.coksatan;
}

/** Listeleme tanımı + arama sorgusu → temel ürün kümesi */
export function baseProducts(def: ListingDef, query: string): Product[] {
  let items = query ? searchProducts(query) : PRODUCTS;
  if (def.category) items = items.filter((p) => p.category === def.category);
  if (def.usage) items = items.filter((p) => p.usage.includes(def.usage!));
  if (def.season) items = items.filter((p) => p.season === def.season);
  if (def.onlyNew) items = items.filter((p) => p.badge === 'yeni');
  if (def.onlyDiscount) items = items.filter((p) => p.oldPrice && p.oldPrice > p.price);
  return items;
}

function matches(p: Product, f: Filters, skip?: FacetKey): boolean {
  if (skip !== 'alt' && f.alt.length && !f.alt.includes(p.subcategory)) return false;
  if (skip !== 'kullanim' && f.kullanim.length && !f.kullanim.some((u) => p.usage.includes(u))) return false;
  if (skip !== 'tema' && f.tema.length && !(p.theme && f.tema.includes(p.theme))) return false;
  if (skip !== 'boyut' && f.boyut.length && !(p.sizeGroup && f.boyut.includes(p.sizeGroup))) return false;
  if (skip !== 'fiyat' && f.fiyat.length) {
    const inRange = PRICE_RANGES.filter((r) => f.fiyat.includes(r.id)).some((r) => p.price >= r.min && p.price < r.max);
    if (!inRange) return false;
  }
  if (f.stok && p.stock <= 0) return false;
  if (f.yeni && p.badge !== 'yeni') return false;
  if (f.coksatan && p.badge !== 'cok-satan') return false;
  return true;
}

export function applyFilters(items: Product[], f: Filters, sort: SortKey, hasQuery: boolean): Product[] {
  const out = items.filter((p) => matches(p, f));
  const inStockFirst = (a: Product, b: Product) => +(b.stock > 0) - +(a.stock > 0);
  switch (sort) {
    case 'yeni':
      return out.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    case 'cok-satan':
      return out.sort((a, b) => a.salesRank - b.salesRank);
    case 'fiyat-artan':
      return out.sort((a, b) => a.price - b.price);
    case 'fiyat-azalan':
      return out.sort((a, b) => b.price - a.price);
    case 'puan':
      return out.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    default:
      // Önerilen: aramada alaka sırası korunur; aksi hâlde stoktakiler önce, popülerlik
      return hasQuery ? out.sort(inStockFirst) : out.sort((a, b) => inStockFirst(a, b) || a.salesRank - b.salesRank);
  }
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  key: FacetKey;
  title: string;
  options: FacetOption[];
}

export function buildFacets(base: Product[], f: Filters, def: ListingDef): FacetGroup[] {
  const countFor = (key: FacetKey, pred: (p: Product) => boolean) =>
    base.filter((p) => matches(p, f, key) && pred(p)).length;

  const subcats = [...new Set(base.map((p) => p.subcategory))].sort((a, b) => a.localeCompare(b, 'tr'));
  const groups: FacetGroup[] = [
    {
      key: 'alt',
      title: 'Kategori',
      options: subcats.map((s) => ({ value: s, label: s, count: countFor('alt', (p) => p.subcategory === s) })),
    },
    {
      key: 'kullanim',
      title: 'Kullanım alanı',
      options: USAGE_ORDER.filter((u) => u !== def.usage).map((u) => ({
        value: u,
        label: USAGE_LABEL[u],
        count: countFor('kullanim', (p) => p.usage.includes(u)),
      })),
    },
    {
      key: 'tema',
      title: 'Tema',
      options: THEMES.map((t) => ({ value: t, label: t, count: countFor('tema', (p) => p.theme === t) })),
    },
    {
      key: 'boyut',
      title: 'Boyut',
      options: (Object.keys(SIZE_LABEL) as SizeGroup[]).map((s) => ({
        value: s,
        label: SIZE_LABEL[s],
        count: countFor('boyut', (p) => p.sizeGroup === s),
      })),
    },
    {
      key: 'fiyat',
      title: 'Fiyat',
      options: PRICE_RANGES.map((r) => ({
        value: r.id,
        label: r.label,
        count: countFor('fiyat', (p) => p.price >= r.min && p.price < r.max),
      })),
    },
  ];
  // Seçili olmayan ve hiç ürünü olmayan seçenekleri gizle; tek seçenekli grupları da göster(me)
  return groups
    .map((g) => ({
      ...g,
      options: g.options.filter((o) => o.count > 0 || (f[g.key] as string[]).includes(o.value)),
    }))
    .filter((g) => g.options.length > 1 || (f[g.key] as string[]).length > 0);
}

export function toggleCount(base: Product[], f: Filters) {
  return {
    stok: base.filter((p) => matches(p, { ...f, stok: true })).length,
    yeni: base.filter((p) => matches(p, { ...f, yeni: true })).length,
    coksatan: base.filter((p) => matches(p, { ...f, coksatan: true })).length,
  };
}

export const FACET_VALUE_LABEL = (key: FacetKey, value: string): string => {
  if (key === 'kullanim') return USAGE_LABEL[value as Usage] ?? value;
  if (key === 'boyut') return SIZE_LABEL[value as SizeGroup]?.split(' (')[0] ?? value;
  if (key === 'fiyat') return PRICE_RANGES.find((r) => r.id === value)?.label ?? value;
  return value;
};
