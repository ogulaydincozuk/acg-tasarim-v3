import { STORE } from '../data/content';

/** Sipariş tutarları: kargo ücretsiz eşiğin altında sabit kargo bedeli eklenir (demo). */
export function orderTotals(subtotal: number) {
  const shipping = subtotal <= 0 || subtotal >= STORE.freeShippingThreshold ? 0 : STORE.shippingFee;
  return { subtotal, shipping, total: Math.round((subtotal + shipping) * 100) / 100 };
}

/** ACG-260102-4821 biçiminde demo sipariş numarası */
export function makeOrderNo(existing: string[]): string {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  let no = '';
  do {
    no = `ACG-${stamp}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  } while (existing.includes(no));
  return no;
}

export const onlyDigits = (v: string) => v.replace(/\D/g, '');

export const formatCardNumber = (v: string) =>
  onlyDigits(v)
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

export const formatExpiry = (v: string) => {
  const d = onlyDigits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** MM/YY geçerli ve süresi dolmamış mı */
export function isValidExpiry(v: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}
