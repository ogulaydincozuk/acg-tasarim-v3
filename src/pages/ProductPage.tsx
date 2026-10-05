import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bell, Check, Heart, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { STORE } from '../data/content';
import { PRODUCTS, PRODUCT_BY_SLUG, getProducts } from '../data/products';
import { CATEGORY_LABEL, USAGE_LABEL } from '../data/taxonomy';
import type { Product } from '../data/types';
import { useShop } from '../context/ShopContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { cx, formatCount, formatPrice } from '../lib/format';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { SectionHeader } from '../components/ui/SectionHeader';
import { QuantityStepper } from '../components/ui/QuantityStepper';
import { Img } from '../components/ui/Img';
import { Gallery } from '../components/product/Gallery';
import { Price, ProductBadge, Stars, StockLabel } from '../components/product/ProductBits';
import { ProductTabs } from '../components/product/ProductTabs';
import { ProductRail } from '../components/product/ProductGrid';
import { NotFoundPage } from './NotFoundPage';
import s from './ProductPage.module.css';

function similarProducts(p: Product) {
  return PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category)
    .map((x) => ({ x, score: x.usage.filter((u) => p.usage.includes(u)).length + (x.theme && x.theme === p.theme ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || a.x.salesRank - b.x.salesRank)
    .slice(0, 8)
    .map((r) => r.x);
}

export function ProductPage() {
  const { slug = '' } = useParams();
  const product = PRODUCT_BY_SLUG.get(slug);
  usePageTitle(product?.name);
  if (!product) return <NotFoundPage />;
  // Ürün değişince yerel durum (adet, sekme) sıfırlansın
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product: p }: { product: Product }) {
  const { addToCart, toggleFavorite, isFavorite, notify } = useShop();
  const [qty, setQty] = useState(1);
  const [tabRequest, setTabRequest] = useState<{ id: string; at: number }>();
  const [showBar, setShowBar] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const fav = isFavorite(p.id);
  const soldOut = p.stock <= 0;

  const complements = useMemo(() => getProducts(p.complements ?? []), [p]);
  const similar = useMemo(() => similarProducts(p), [p]);

  // Ana satın alma alanı yukarıda ekrandan çıkınca mobil yapışkan barı göster.
  // (Scroll dinleyicisi: hızlı kaydırmada/atlamalarda IntersectionObserver eşiği kaçırabiliyor.)
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      setShowBar(el.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const crumbs = [
    { label: 'Ana sayfa', to: '/' },
    { label: CATEGORY_LABEL[p.category], to: `/kategori/${p.category}` },
    { label: p.subcategory, to: `/kategori/${p.category}?alt=${encodeURIComponent(p.subcategory)}` },
    { label: p.name },
  ];

  const openReviews = () => {
    setTabRequest({ id: 'yorumlar', at: Date.now() });
    requestAnimationFrame(() => document.getElementById('detaylar')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const add = () => addToCart(p.id, qty);

  return (
    <>
      <div className={cx('container', s.page)}>
        <Breadcrumbs items={crumbs} />

        <div className={s.top}>
          <Gallery images={p.images} name={p.name} />

          <div className={s.info}>
            <div className={s.badges}>
              <ProductBadge product={p} />
              <span className={s.sub}>{p.subcategory}</span>
            </div>
            <h1 className={s.title}>{p.name}</h1>
            <div className={s.metaRow}>
              <button type="button" className={s.ratingBtn} onClick={openReviews}>
                <Stars value={p.rating} />
                <span className={s.ratingValue}>{p.rating.toFixed(1).replace('.', ',')}</span>
                <span className={s.ratingCount}>({formatCount(p.reviewCount)} değerlendirme)</span>
              </button>
              <span className={s.sku}>Kod: {p.sku}</span>
            </div>

            <div className={s.priceBlock}>
              <Price price={p.price} oldPrice={p.oldPrice} size="lg" />
              <span className={s.vat}>KDV dahil</span>
            </div>

            {/* Üstte ilk cümle; tam açıklama "Açıklama" sekmesinde */}
            <p className={s.desc}>{p.description.split(/(?<=\.)\s/)[0]}</p>

            <dl className={s.facts}>
              <div>
                <dt>{p.category === 'setler' ? 'İçerik' : p.category === 'hammaddeler' ? 'Miktar' : 'Ölçü'}</dt>
                <dd>{p.size}</dd>
              </div>
              {p.specs[0] && (
                <div>
                  <dt>{p.specs[0].label}</dt>
                  <dd>{p.specs[0].value}</dd>
                </div>
              )}
              <div className={s.factWide}>
                <dt>Kullanım</dt>
                <dd>
                  <ul className={s.usageChips}>
                    {p.usage.map((u) => (
                      <li key={u}>
                        <Link to={`/kategori/${u}`}>{USAGE_LABEL[u]}</Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>

            {p.contents && (
              <ul className={s.contents} aria-label="Set içeriği">
                {p.contents.map((c) => (
                  <li key={c}>
                    <Check aria-hidden="true" />
                    {c}
                  </li>
                ))}
              </ul>
            )}

            <StockLabel stock={p.stock} />

            <div className={s.buy} ref={buyRef}>
              {soldOut ? (
                <button type="button" className="btn btn--secondary" onClick={() => notify({ title: 'Stok bildirimi V2’de aktif olacak', product: p })}>
                  <Bell aria-hidden="true" />
                  Gelince haber ver
                </button>
              ) : (
                <>
                  <QuantityStepper value={qty} onChange={setQty} max={p.stock} />
                  <button type="button" className="btn btn--primary" onClick={add}>
                    Sepete ekle
                  </button>
                </>
              )}
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

            <ul className={s.service}>
              <li>
                <Truck strokeWidth={1.5} aria-hidden="true" />
                {STORE.shippingNote}
              </li>
              <li>
                <RotateCcw strokeWidth={1.5} aria-hidden="true" />
                {STORE.returnNote}
              </li>
              <li>
                <ShieldCheck strokeWidth={1.5} aria-hidden="true" />
                Güvenli ödeme · 3D Secure
              </li>
            </ul>
          </div>
        </div>

        <section className={s.details} aria-label="Ürün bilgileri">
          <ProductTabs product={p} request={tabRequest} />
        </section>

        {complements.length > 0 && (
          <section className={s.block} aria-labelledby="complements-title">
            <SectionHeader id="complements-title" eyebrow="Birlikte kullanılır" title="Bu ürünle üretmek için" />
            <ProductRail products={complements} label="Tamamlayıcı ürünler" />
          </section>
        )}

        {similar.length > 0 && (
          <section className={s.block} aria-labelledby="similar-title">
            <SectionHeader id="similar-title" eyebrow="Keşfet" title="Benzer ürünler" action={{ label: `Tüm ${CATEGORY_LABEL[p.category].toLocaleLowerCase('tr')}`, to: `/kategori/${p.category}` }} />
            <ProductRail products={similar} label="Benzer ürünler" />
          </section>
        )}
      </div>

      {/* Mobil yapışkan satın alma barı */}
      <div className={cx(s.bar, showBar && s.barOn)} aria-hidden={!showBar} inert={!showBar}>
        <Img image={p.image} alt="" ratio={1} sizes="44px" maxWidth={320} className={s.barImg} />
        <div className={s.barText}>
          <span className={s.barName}>{p.name}</span>
          <span className="price">{formatPrice(p.price)}</span>
        </div>
        <button type="button" className="btn btn--primary btn--md" onClick={add} disabled={soldOut}>
          {soldOut ? 'Tükendi' : 'Sepete ekle'}
        </button>
      </div>
    </>
  );
}
