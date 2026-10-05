import { PRODUCTS } from '../data/products';
import { CATEGORY_LABEL, USAGE_LABEL, USAGE_ORDER } from '../data/taxonomy';
import type { MainCategory, Product, Usage } from '../data/types';
import { normalizeTr } from './format';

/**
 * İstemci tarafı arama — önizleme için. Aynı arayüz (query → ürün + öneri)
 * V2'de bir arama servisine (Meilisearch / Algolia / Typesense vb.) taşınabilir.
 */

/** Kullanıcının yazdığı terimleri katalog diline genişletir */
const SYNONYMS: Record<string, string[]> = {
  parfum: ['esans'],
  koku: ['esans', 'kokulu'],
  boya: ['pigment', 'boya', 'mika'],
  renk: ['pigment', 'mika'],
  beton: ['jesmonite', 'dekor'],
  jesmonit: ['jesmonite'],
  wax: ['wax', 'mum bazi'],
  balmumu: ['wax'],
  mould: ['kalip'],
  mold: ['kalip'],
  fitil: ['fitil'],
  tas: ['tas', 'kokulu'],
  noel: ['yilbasi'],
  christmas: ['yilbasi'],
  xmas: ['yilbasi'],
  yilbasi: ['yilbasi', 'noel'],
};

interface IndexedProduct {
  product: Product;
  name: string;
  hay: string;
  words: string[];
}

const INDEX: IndexedProduct[] = PRODUCTS.map((product) => {
  const name = normalizeTr(product.name);
  const hay = normalizeTr(
    [
      product.name,
      product.subcategory,
      CATEGORY_LABEL[product.category],
      ...product.usage.map((u) => USAGE_LABEL[u]),
      product.theme ?? '',
      product.season === 'yilbasi' ? 'yilbasi noel yeni yil' : '',
      ...product.tags,
      product.shortInfo,
    ].join(' '),
  );
  return { product, name, hay, words: hay.split(' ') };
});

const expand = (token: string) => [token, ...(SYNONYMS[token] ?? [])];

function scoreProduct(item: IndexedProduct, tokens: string[]): number {
  let score = 0;
  for (const token of tokens) {
    const variants = expand(token);
    let best = 0;
    for (const v of variants) {
      if (item.name.startsWith(v)) best = Math.max(best, 6);
      else if (item.name.split(' ').some((w) => w.startsWith(v))) best = Math.max(best, 4);
      else if (item.words.some((w) => w.startsWith(v))) best = Math.max(best, 2);
      else if (v.length > 3 && item.hay.includes(v)) best = Math.max(best, 1);
    }
    if (best === 0) return 0; // tüm terimler eşleşmeli
    score += best;
  }
  return score;
}

export function searchProducts(query: string): Product[] {
  const tokens = normalizeTr(query).split(' ').filter(Boolean);
  if (!tokens.length) return [];
  return INDEX.map((item) => ({ item, score: scoreProduct(item, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.product.salesRank - b.item.product.salesRank)
    .map((r) => r.item.product);
}

export interface Suggestion {
  label: string;
  to: string;
  count: number;
  kind: 'category' | 'usage';
}

const USAGE_KEYS: { usage: Usage; key: string }[] = USAGE_ORDER.map((u) => ({
  usage: u,
  key: normalizeTr(USAGE_LABEL[u]),
}));

const CATEGORY_KEYS: { category: MainCategory; key: string }[] = (
  Object.keys(CATEGORY_LABEL) as MainCategory[]
).map((c) => ({ category: c, key: normalizeTr(CATEGORY_LABEL[c]) }));

const count = (fn: (p: Product) => boolean) => PRODUCTS.filter(fn).length;

/** "mum" → Mum Kalıpları / Mum Hammaddeleri / Mum Başlangıç Setleri */
export function searchSuggestions(query: string): Suggestion[] {
  const q = normalizeTr(query);
  if (q.length < 2) return [];
  const tokens = q.split(' ');
  const out: Suggestion[] = [];

  const usages = USAGE_KEYS.filter(({ key }) =>
    tokens.some((t) => key.startsWith(t) || key.split(' ').some((w) => w.startsWith(t) && t.length >= 3)),
  );

  for (const { usage } of usages) {
    const label = USAGE_LABEL[usage];
    const variants: [MainCategory, string][] = [
      ['kaliplar', `${label} Kalıpları`],
      ['hammaddeler', `${label} Hammaddeleri`],
      ['setler', `${label} Başlangıç Setleri`],
    ];
    for (const [category, text] of variants) {
      const n = count((p) => p.category === category && p.usage.includes(usage));
      if (n > 0) out.push({ label: text, to: `/kategori/${category}?kullanim=${usage}`, count: n, kind: 'usage' });
    }
  }

  for (const { category, key } of CATEGORY_KEYS) {
    if (tokens.some((t) => key.startsWith(t) || (t.length >= 3 && t.startsWith(key.slice(0, 4))))) {
      out.push({
        label: CATEGORY_LABEL[category],
        to: `/kategori/${category}`,
        count: count((p) => p.category === category),
        kind: 'category',
      });
    }
  }

  if (tokens.some((t) => ['yilbasi', 'noel', 'christmas', 'xmas'].includes(t) || (t.length >= 3 && 'yilbasi'.startsWith(t)))) {
    out.unshift({ label: 'Yılbaşı Koleksiyonu', to: '/kategori/yilbasi', count: count((p) => p.season === 'yilbasi'), kind: 'category' });
  }

  return out.slice(0, 5);
}

/** Eşleşen metni <mark> ile vurgulamak için parçalara ayırır */
export function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const tokens = normalizeTr(query).split(' ').filter(Boolean);
  if (!tokens.length) return [{ text, match: false }];
  const normalizedChars = [...text].map((ch) => normalizeTr(ch) || ' ');
  const flags = new Array(text.length).fill(false);
  const norm = normalizedChars.map((c) => c[0] ?? ' ').join('');
  for (const t of tokens) {
    let i = norm.indexOf(t);
    while (i !== -1) {
      for (let k = i; k < i + t.length; k++) flags[k] = true;
      i = norm.indexOf(t, i + t.length);
    }
  }
  const parts: { text: string; match: boolean }[] = [];
  [...text].forEach((ch, i) => {
    const last = parts[parts.length - 1];
    if (last && last.match === flags[i]) last.text += ch;
    else parts.push({ text: ch, match: flags[i] });
  });
  return parts;
}
