import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { DEALS, NEW_ARRIVALS } from '../data/products';
import type { Product } from '../data/types';
import { useShop } from '../context/ShopContext';
import { discountPercent, formatPrice } from '../lib/format';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ProductCard } from '../components/product/ProductCard';
import { Img } from '../components/ui/Img';
import { Price } from '../components/product/ProductBits';
import s from './NewAndDeals.module.css';

/** Büyük vitrin karosu: görsel üstünde ad, fiyat ve sepete ekle. */
function LeadTile({ product: p }: { product: Product }) {
  const { addToCart } = useShop();
  return (
    <article className={s.lead}>
      <Link to={`/urun/${p.slug}`} className={s.leadMedia} aria-label={`${p.name} ürününü incele`}>
        <Img image={p.image} alt="" ratio={4 / 5} sizes="(min-width: 1024px) 36vw, 100vw" maxWidth={1080} className={s.leadImg} />
        <span className={s.leadShade} aria-hidden="true" />
      </Link>
      <div className={s.leadBody}>
        <span className={s.leadChip}>Yeni</span>
        <h3 className={s.leadName}>
          <Link to={`/urun/${p.slug}`}>{p.name}</Link>
        </h3>
        <p className={s.leadInfo}>{p.shortInfo}</p>
        <div className={s.leadFoot}>
          <span className={s.leadPrice}>{formatPrice(p.price)}</span>
          <button type="button" className="btn btn--soft btn--md" onClick={() => addToCart(p.id)} disabled={p.stock <= 0}>
            <ShoppingBag aria-hidden="true" />
            Sepete ekle
          </button>
        </div>
      </div>
    </article>
  );
}

/** Tek satır bento: ilk ürün büyük vitrin karosu, yanında üç ürün kartı. */
export function NewArrivals() {
  const [lead, ...rest] = NEW_ARRIVALS.slice(0, 4);
  return (
    <section className="section" aria-labelledby="new-title">
      <div className="container">
        <SectionHeader id="new-title" eyebrow="Koleksiyona eklendi" title="Yeni Gelenler" action={{ label: 'Tümünü gör', to: '/kategori/yeni-gelenler' }} />
        <div className={s.bento}>
          <LeadTile product={lead} />
          <ul className={s.small}>
            {rest.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} sizes="(min-width: 1024px) 20vw, 62vw" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * Sade kampanya alanı: bağıran etiket yok; solda tek cümle ve tek bağlantı,
 * sağda indirimdeki ürünlerin küçük kartları.
 */
export function Campaign() {
  return (
    <section className="section" aria-labelledby="campaign-title">
      <div className="container">
        <div className={s.panel}>
          <div className={s.copy}>
            <span className="eyebrow">Kampanyalar</span>
            <h2 id="campaign-title" className={s.title}>
              Seçili ürünlerde
              <br />
              özel fiyatlar
            </h2>
            <p className={s.text}>Sezonun sevilen kalıp, hammadde ve setlerinde dönemsel fiyat avantajı.</p>
            <Link to="/kategori/kampanyalar" className="btn btn--primary">
              Keşfet
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <ul className={s.deals}>
            {DEALS.map((p) => (
              <li key={p.id}>
                <Link to={`/urun/${p.slug}`} className={s.deal}>
                  <Img image={p.image} alt="" ratio={1} sizes="(min-width: 1024px) 14vw, 40vw" maxWidth={480} className={s.dealImg} />
                  <span className={s.dealPct}>%{discountPercent(p.price, p.oldPrice)}</span>
                  <span className={s.dealName}>{p.name}</span>
                  <Price price={p.price} oldPrice={p.oldPrice} size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
