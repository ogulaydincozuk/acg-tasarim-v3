const tl = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1290 → "1.290,00 TL" */
export const formatPrice = (value: number) => `${tl.format(value)} TL`;

export const discountPercent = (price: number, oldPrice?: number) =>
  oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

export const formatCount = (n: number) => new Intl.NumberFormat('tr-TR').format(n);

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');

/** Türkçe karakter ve büyük/küçük harf duyarsız karşılaştırma anahtarı */
export const normalizeTr = (value: string) =>
  value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function stockState(stock: number): { label: string; tone: 'ok' | 'low' | 'out' } {
  if (stock <= 0) return { label: 'Tükendi', tone: 'out' };
  if (stock <= 10) return { label: `Son ${stock} adet`, tone: 'low' };
  return { label: 'Stokta', tone: 'ok' };
}

/** Sayılar için Türkçe yönelme eki: 20 → "’ye", 25 → "’e", 30 → "’a" */
export function dativeSuffix(n: number): string {
  const units = ['', '’e', '’ye', '’e', '’e', '’e', '’ya', '’ye', '’e', '’a'];
  const tens = ['', '’a', '’ye', '’a', '’a', '’ye', '’a', '’e', '’e', '’a'];
  const v = Math.abs(Math.round(n));
  if (v % 10) return units[v % 10];
  if (v % 100) return tens[(v % 100) / 10];
  return '’e'; // yüz, bin
}
