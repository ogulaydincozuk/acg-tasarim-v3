import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, PartyPopper, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { STORE } from '../../data/content';
import { PRODUCT_BY_ID } from '../../data/products';
import { useShop } from '../../context/ShopContext';
import { formatPrice } from '../../lib/format';
import { Drawer } from '../ui/Drawer';
import { Img } from '../ui/Img';
import { QuantityStepper } from '../ui/QuantityStepper';
import s from './CartDrawer.module.css';

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, cartTotal, cartCount, setQty, removeFromCart } = useShop();
  const navigate = useNavigate();
  const close = () => setCartOpen(false);
  const remaining = Math.max(0, STORE.freeShippingThreshold - cartTotal);
  const progress = Math.min(1, cartTotal / STORE.freeShippingThreshold);

  return (
    <Drawer
      open={cartOpen}
      onClose={close}
      title={
        <>
          Sepetim <span className={s.count}>{cartCount}</span>
        </>
      }
      footer={
        cart.length > 0 && (
          <div className={s.summary}>
            <div className={s.totalRow}>
              <span>Ara toplam</span>
              <strong className="price">{formatPrice(cartTotal)}</strong>
            </div>
            <p className={s.note}>Kargo ödeme adımında hesaplanır. Ödeme şu an demo modunda çalışır.</p>
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => {
                close();
                navigate('/odeme');
              }}
            >
              Ödemeye geç
              <ArrowRight aria-hidden="true" />
            </button>
            <button type="button" className={s.continue} onClick={close}>
              Alışverişe devam et
            </button>
          </div>
        )
      }
    >
      {cart.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIcon}>
            <ShoppingBag strokeWidth={1.6} />
          </span>
          <p className={s.emptyTitle}>Sepetin henüz boş</p>
          <p className={s.emptyText}>Kalıplar, hammaddeler ve başlangıç setleriyle üretmeye başla.</p>
          <Link to="/kategori/kaliplar" className="btn btn--primary" onClick={close}>
            Ürünleri keşfet
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <>
          <div className={s.shipping}>
            <span className={s.shippingIcon} aria-hidden="true">
              {remaining > 0 ? <Truck strokeWidth={1.8} /> : <PartyPopper strokeWidth={1.8} />}
            </span>
            <div className={s.shippingBody}>
              <p>
                {remaining > 0 ? (
                  <>
                    Ücretsiz kargo için <strong className="price">{formatPrice(remaining)}</strong> daha ekle.
                  </>
                ) : (
                  <>Ücretsiz kargo kazandın.</>
                )}
              </p>
              <div className={s.bar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Ücretsiz kargo ilerlemesi">
                <span style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          </div>
          <ul className={s.lines}>
            {cart.map((line) => {
              const p = PRODUCT_BY_ID.get(line.id);
              if (!p) return null;
              return (
                <li key={line.id} className={s.line}>
                  <Link to={`/urun/${p.slug}`} onClick={close} className={s.thumbLink} tabIndex={-1} aria-hidden="true">
                    <Img image={p.image} alt="" ratio={1} sizes="72px" maxWidth={320} className={s.thumb} />
                  </Link>
                  <div className={s.lineBody}>
                    <div className={s.lineTop}>
                      <Link to={`/urun/${p.slug}`} onClick={close} className={s.lineName}>
                        {p.name}
                      </Link>
                      <button type="button" className={s.remove} onClick={() => removeFromCart(p.id)} aria-label={`${p.name} sepetten çıkar`}>
                        <Trash2 strokeWidth={1.8} />
                      </button>
                    </div>
                    <p className={s.lineMeta}>{p.shortInfo}</p>
                    <div className={s.lineBottom}>
                      <QuantityStepper size="sm" value={line.qty} max={p.stock} onChange={(n) => setQty(p.id, n)} label={`${p.name} adet`} />
                      <span className={s.linePrice}>{formatPrice(p.price * line.qty)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Drawer>
  );
}
