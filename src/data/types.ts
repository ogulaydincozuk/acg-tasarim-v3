import type { ImageKey } from './images';

/** Kullanım alanı — filtrelerin, aramanın ve "Ne yapabilirsin?" akışının ortak dili. */
export type Usage = 'mum' | 'kokulu-tas' | 'boyama' | 'dekorasyon';

export type MainCategory = 'kaliplar' | 'hammaddeler' | 'setler';

export type Badge = 'yeni' | 'cok-satan' | 'indirim';

export type SizeGroup = 'kucuk' | 'orta' | 'buyuk';

/** Sezonluk koleksiyon etiketi (kategori sayfası: /kategori/yilbasi) */
export type Season = 'yilbasi';

export interface Spec {
  label: string;
  value: string;
}

/**
 * Ürün veri modeli. 4.000+ ürünlük katalog için önerilen şemaya göre kurgulandı:
 * filtrelenebilir alanlar (usage, theme, sizeGroup, stock, badge) serbest metin
 * yerine sabit değerler taşır; ad şablonu "Model + Ürün tipi (+ Boyut/Adet)".
 */
export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: MainCategory;
  subcategory: string;
  price: number;
  oldPrice?: number;
  image: ImageKey;
  images: ImageKey[];
  badge?: Badge;
  rating: number;
  reviewCount: number;
  stock: number;
  size: string;
  sizeGroup?: SizeGroup;
  usage: Usage[];
  theme?: string;
  /** Sezonluk koleksiyon (ör. Yılbaşı) — kategoriden bağımsız ayrı bir listeleme oluşturur */
  season?: Season;
  tags: string[];
  /** Kartta görünen kısa teknik bilgi */
  shortInfo: string;
  description: string;
  specs: Spec[];
  dimensions: Spec[];
  /** Popülerlik sırası (1 = en çok satan) */
  salesRank: number;
  /** ISO tarih — "Yeni gelenler" sıralaması için */
  addedAt: string;
  /** Tamamlayıcı ürünler (ör. kalıp → wax, esans) */
  complements?: string[];
  /** Yalnızca setler için içerik listesi */
  contents?: string[];
  /** Yalnızca setler için: yaklaşık üretim kapasitesi */
  yields?: string;
  level?: 'Başlangıç' | 'Orta' | 'İleri';
}

export interface CraftCategory {
  usage: Usage;
  name: string;
  hint: string;
  image: ImageKey;
}

export interface UseCase {
  usage: Usage;
  title: string;
  summary: string;
  image: ImageKey;
  duration: string;
  level: string;
  materialIds: string[];
}
