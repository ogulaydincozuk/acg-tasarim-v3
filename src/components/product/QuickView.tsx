import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, X } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { USAGE_LABEL } from '../../data/taxonomy';
import { useBodyLock, useDialog } from '../../hooks/useUi';
import { cx } from '../../lib/format';
import { Img } from '../ui/Img';
import { QuantityStepper } from '../ui/QuantityStepper';
import { Price, ProductBadge, Rating, StockLabel } from './ProductBits';
import s from './QuickView.module.css';

export function QuickView() {
  const { quickView: p, setQuickView, addToCart, toggleFavorite, isFavorite } = useShop();
  const dialog = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const open = Boolean(p);
  const close = () => setQuickView(null);

  useBodyLock(open);
  useDialog(dialog, open, close);
  useEffect(() => {
    setQty(1);
    setActive(0);
  }, [p]);

  if (!p) return null;
  const fav = isFavorite(p.id);

  return createPortal(
    <div className={s.root}>
      <div className={s.backdrop} onClick={close} aria-hidden="true" />
      <div ref={dialog} className={s.dialog} role="dialog" aria-modal="true" aria-labelledby="qv-title">
        <button type="button" className={s.close} onClick={close} aria-label="Kapat">
          <X strokeWidth={1.6} />
        </button>
        <div className={s.media}>
          <Img image={p.images[active]} alt={p.name} ratio={4 / 5} sizes="(min-width: 768px) 420px, 100vw" maxWidth={860} className={s.mainImg} />
          <div className={s.thumbs}>
            {p.images.map((img, i) => (
              <button
                key={img}
                type="button"
                className={cx(s.thumb, i === active && s.thumbActive)}
                onClick={() => setActive(i)}
                aria-label={`Görsel ${i + 1}`}
                aria-pressed={i === active}
              >
                <Img image={img} alt="" ratio={1} sizes="56px" maxWidth={320} />
              </button>
            ))}
          </div>
        </div>
        <div className={s.info}>
          <div className={s.top}>
            <ProductBadge product={p} />
            <span className={s.sub}>{p.subcategory}</span>
          </div>
          <h2 id="qv-title" className={s.title}>
            {p.name}
          </h2>
          <Rating value={p.rating} count={p.reviewCount} size="md" />
          <div className={s.price}>
            <Price price={p.price} oldPrice={p.oldPrice} size="lg" />
          </div>
          <p className={s.desc}>{p.description}</p>
          <dl className={s.specs}>
            <div>
              <dt>Ölçü</dt>
              <dd>{p.size}</dd>
            </div>
            <div>
              <dt>Kullanım</dt>
              <dd>{p.usage.map((u) => USAGE_LABEL[u]).join(' · ')}</dd>
            </div>
          </dl>
          <StockLabel stock={p.stock} />
          <div className={s.buy}>
            <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, p.stock)} />
            <button
              type="button"
              className="btn btn--primary"
              disabled={p.stock <= 0}
              onClick={() => {
                addToCart(p.id, qty);
                close();
              }}
            >
              {p.stock <= 0 ? 'Tükendi' : 'Sepete ekle'}
            </button>
            <button
              type="button"
              className={cx(s.fav, fav && s.favActive)}
              onClick={() => toggleFavorite(p.id)}
              aria-pressed={fav}
              aria-label={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <Heart strokeWidth={1.6} />
            </button>
          </div>
          <Link to={`/urun/${p.slug}`} className="text-link" onClick={close}>
            Ürün detayına git
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
