import { Star } from 'lucide-react';
import type { Product } from '../../data/types';
import { BADGE_LABEL } from '../../data/taxonomy';
import { cx, discountPercent, formatCount, formatPrice, stockState } from '../../lib/format';
import s from './ProductBits.module.css';

export function Rating({ value, count, size = 'sm' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  return (
    <span className={cx(s.rating, size === 'md' && s.ratingMd)}>
      <Star className={s.star} aria-hidden="true" />
      <span className={s.ratingValue}>{value.toFixed(1).replace('.', ',')}</span>
      {count !== undefined && <span className={s.ratingCount}>({formatCount(count)})</span>}
      <span className="visually-hidden">
        5 üzerinden {value} puan{count !== undefined ? `, ${count} değerlendirme` : ''}
      </span>
    </span>
  );
}

/** Beş yıldızlı gösterim (ürün detay) */
export function Stars({ value }: { value: number }) {
  return (
    <span className={s.stars} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={s.starSlot}>
            <Star className={s.starEmpty} />
            <span className={s.starFill} style={{ width: `${fill * 100}%` }}>
              <Star className={s.star} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function Price({ price, oldPrice, size = 'md' }: { price: number; oldPrice?: number; size?: 'sm' | 'md' | 'lg' }) {
  const pct = discountPercent(price, oldPrice);
  return (
    <span className={cx(s.price, s[`price-${size}`])}>
      <span className="price">
        <span className="visually-hidden">{pct ? 'İndirimli fiyat: ' : 'Fiyat: '}</span>
        {formatPrice(price)}
      </span>
      {pct > 0 && (
        <>
          <s className={cx(s.old, 'price')}>
            <span className="visually-hidden">Önceki fiyat: </span>
            {formatPrice(oldPrice!)}
          </s>
          {size === 'lg' && <span className={s.pct}>%{pct} indirim</span>}
        </>
      )}
    </span>
  );
}

export function ProductBadge({ product }: { product: Product }) {
  if (product.stock <= 0) return <span className={cx(s.badge, s.badgeOut)}>Tükendi</span>;
  if (!product.badge) return null;
  const pct = discountPercent(product.price, product.oldPrice);
  return (
    <span className={cx(s.badge, s[`badge-${product.badge}`])}>
      {product.badge === 'indirim' && pct ? `%${pct} indirim` : BADGE_LABEL[product.badge]}
    </span>
  );
}

export function StockLabel({ stock }: { stock: number }) {
  const st = stockState(stock);
  return (
    <span className={cx(s.stock, s[`stock-${st.tone}`])}>
      <span className={s.dot} aria-hidden="true" />
      {st.label}
    </span>
  );
}
