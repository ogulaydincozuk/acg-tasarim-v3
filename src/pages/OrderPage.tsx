import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { cx, formatPrice } from '../lib/format';
import { Img } from '../components/ui/Img';
import { NotFoundPage } from './NotFoundPage';
import s from './Checkout.module.css';

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

/** Demo sipariş onayı / sipariş detayı */
export function OrderPage() {
  const { no = '' } = useParams();
  const { getOrder, user } = useAccount();
  const order = getOrder(no);
  usePageTitle(order ? `Sipariş ${order.no}` : 'Sipariş');
  if (!order) return <NotFoundPage />;

  return (
    <div className={cx('container', s.page)}>
      <div className={s.done}>
        <span className={s.doneIcon}>
          <Check strokeWidth={2.4} aria-hidden="true" />
        </span>
        <span className="demo-badge">Demo sipariş</span>
        <h1 className={s.title}>Siparişin alındı</h1>
        <p className={s.doneNo}>
          Sipariş numaran <strong>{order.no}</strong> · {fmtDate(order.createdAt)}
        </p>
        <p className="demo-note" role="note">
          Bu bir demo siparişidir: ödeme tahsil edilmedi ve ürün gönderilmeyecek. Sitenin ödeme akışını denemen için oluşturuldu.
        </p>
      </div>

      <div className={s.orderGrid}>
        <section className={s.panel} aria-label="Sipariş edilen ürünler">
          <p className={s.panelLabel}>Ürünler</p>
          <ul className={s.lines}>
            {order.lines.map((l) => (
              <li key={l.id} className={s.line}>
                <Link to={`/urun/${l.slug}`} className={s.thumbWrap}>
                  <Img image={l.image} alt="" ratio={1} sizes="64px" maxWidth={320} className={s.thumb} />
                  <span className={s.qty}>{l.qty}</span>
                </Link>
                <Link to={`/urun/${l.slug}`} className={s.lineName}>
                  {l.name}
                </Link>
                <span className="price">{formatPrice(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className={s.totals}>
            <div>
              <dt>Ara toplam</dt>
              <dd className="price">{formatPrice(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Kargo</dt>
              <dd className="price">{order.shipping === 0 ? 'Ücretsiz' : formatPrice(order.shipping)}</dd>
            </div>
            <div className={s.grand}>
              <dt>Toplam</dt>
              <dd className="price">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <div className={s.stack}>
          <section className={s.panel}>
            <p className={s.panelLabel}>Durum</p>
            <span className={s.status}>{order.status}</span>
          </section>
          <section className={s.panel}>
            <p className={s.panelLabel}>Teslimat</p>
            <p>
              {order.contact.name}
              <br />
              {order.address.line}
              <br />
              {order.address.district} / {order.address.city}
            </p>
            {order.address.note && <p>Not: {order.address.note}</p>}
          </section>
          <section className={s.panel}>
            <p className={s.panelLabel}>Ödeme</p>
            {order.payment === 'kart' ? (
              <p>Kredi / banka kartı · •••• {order.cardLast4} (demo)</p>
            ) : (
              <p>
                Havale / EFT (demo)
                <br />
                <code>TR00 0000 0000 0000 0000 0000 00</code>
              </p>
            )}
            <p>Onay e-postası: {order.contact.email}</p>
          </section>
        </div>
      </div>

      <div className={s.actions}>
        <Link to="/kategori/yilbasi" className="btn btn--primary">
          Alışverişe devam et
          <ArrowRight aria-hidden="true" />
        </Link>
        {user && (
          <Link to="/hesap" className="btn btn--secondary">
            Siparişlerim
          </Link>
        )}
      </div>
    </div>
  );
}
