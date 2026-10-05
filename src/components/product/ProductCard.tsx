import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, Plus } from 'lucide-react';
import type { Product } from '../../data/types';
import { useShop } from '../../context/ShopContext';
import { cx, stockState } from '../../lib/format';
import { Img } from '../ui/Img';
import { Price, ProductBadge } from './ProductBits';
import s from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  sizes?: string;
  priority?: boolean;
}

/** Yuvarlak beyaz kart: görsel kutusu, altında ad · kısa bilgi · fiyat ve dairesel "sepete ekle". */
export function ProductCard({ product: p, sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw', priority }: ProductCardProps) {
  const { addToCart, toggleFavorite, isFavorite, setQuickView } = useShop();
  const [hovered, setHovered] = useState(false);
  const fav = isFavorite(p.id);
  const href = `/urun/${p.slug}`;
  const stock = stockState(p.stock);
  const soldOut = p.stock <= 0;

  return (
    <article className={cx(s.card, soldOut && s.soldOut)} onMouseEnter={() => setHovered(true)}>
      <div className={s.media}>
        <Link to={href} className={s.mediaLink} tabIndex={-1} aria-hidden="true">
          <Img image={p.image} alt="" ratio={4 / 5} sizes={sizes} priority={priority} className={s.img} maxWidth={860} />
          {hovered && p.images[1] && <Img image={p.images[1]} alt="" ratio={4 / 5} sizes={sizes} className={s.imgAlt} maxWidth={860} />}
        </Link>

        <div className={s.badges}>
          <ProductBadge product={p} />
        </div>

        <button
          type="button"
          className={cx(s.fav, fav && s.favActive)}
          onClick={() => toggleFavorite(p.id)}
          aria-pressed={fav}
          aria-label={fav ? `${p.name} favorilerden çıkar` : `${p.name} favorilere ekle`}
        >
          <Heart strokeWidth={1.6} />
        </button>

        {/* Masaüstü hover: altta ortada "Hızlı bak" hapı */}
        <button type="button" className={s.view} onClick={() => setQuickView(p)} aria-label={`${p.name} hızlı incele`}>
          <Eye strokeWidth={1.6} aria-hidden="true" />
          Hızlı bak
        </button>
      </div>

      <div className={s.body}>
        <h3 className={s.name}>
          <Link to={href}>{p.name}</Link>
        </h3>
        <p className={s.info}>
          {p.shortInfo}
          {stock.tone === 'low' && <span className={s.low}> · {stock.label}</span>}
        </p>
        <div className={s.foot}>
          <Price price={p.price} oldPrice={p.oldPrice} />
          {!soldOut && (
            <button type="button" className={s.add} onClick={() => addToCart(p.id)} aria-label={`${p.name} sepete ekle`}>
              <Plus strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
