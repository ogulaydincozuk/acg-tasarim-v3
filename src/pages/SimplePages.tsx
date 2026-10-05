import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Compass, Heart, Hourglass } from 'lucide-react';
import { getProducts } from '../data/products';
import { CRAFT_CATEGORIES } from '../data/taxonomy';
import { useShop } from '../context/ShopContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ProductGrid } from '../components/product/ProductGrid';
import s from './SimplePages.module.css';

export function FavoritesPage() {
  const { favorites } = useShop();
  usePageTitle('Favorilerim');
  const products = getProducts(favorites);
  return (
    <div className={`container ${s.page}`}>
      <Breadcrumbs items={[{ label: 'Ana sayfa', to: '/' }, { label: 'Favorilerim' }]} />
      <header className={s.head}>
        <div className={s.titleRow}>
          <h1 className={s.title}>Favorilerim</h1>
          {products.length > 0 && <span className={s.count}>{products.length} ürün</span>}
        </div>
        <p className={s.lead}>{products.length ? 'Kaydettiğin ürünler burada, istediğin zaman geri dönebilirsin.' : 'Beğendiğin ürünleri kalp ikonuyla kaydet, burada bul.'}</p>
      </header>
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <div className={s.empty}>
          <span className={s.icon}>
            <Heart strokeWidth={1.6} aria-hidden="true" />
          </span>
          <p className={s.emptyTitle}>Henüz favori ürünün yok.</p>
          <Link to="/kategori/kaliplar" className="btn btn--primary">
            Kalıpları keşfet
          </Link>
        </div>
      )}
    </div>
  );
}

/*
 * V1 kapsamı dışındaki sayfalar (hesap, sipariş takibi, kurumsal ve yasal metinler)
 * için ortak bilgilendirme sayfası. Ölü bağlantı bırakmamak için kullanılır.
 */
const INFO_TITLES: Record<string, string> = {
  hesap: 'Hesabım',
  'siparis-takibi': 'Sipariş takibi',
  'kargo-teslimat': 'Kargo & teslimat',
  iletisim: 'İletişim',
  'iade-degisim': 'İade & değişim',
  sss: 'Sıkça sorulan sorular',
  hakkimizda: 'Hakkımızda',
  toptan: 'Toptan & atölye satışı',
  'ozel-kalip': 'Özel kalıp üretimi',
  kvkk: 'KVKK aydınlatma metni',
  gizlilik: 'Gizlilik politikası',
  cerez: 'Çerez politikası',
  'mesafeli-satis': 'Mesafeli satış sözleşmesi',
};

export function InfoPage({ slugOverride }: { slugOverride?: string }) {
  const params = useParams();
  const slug = slugOverride ?? params.slug ?? '';
  const title = INFO_TITLES[slug] ?? 'Sayfa';
  usePageTitle(title);
  return (
    <div className={`container ${s.page}`}>
      <Breadcrumbs items={[{ label: 'Ana sayfa', to: '/' }, { label: title }]} />
      <div className={s.info}>
        <span className={s.icon}>
          <Hourglass strokeWidth={1.6} aria-hidden="true" />
        </span>
        <span className="eyebrow">Önizleme</span>
        <h1 className={s.title}>{title}</h1>
        <p className={s.lead}>Bu sayfa, sitenin bir sonraki aşamasında (V2) içerik ve işlevleriyle birlikte hazırlanacak.</p>
        <Link to="/" className="btn btn--primary">
          Ana sayfaya dön
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function NotFoundContent() {
  usePageTitle('Sayfa bulunamadı');
  return (
    <div className={`container ${s.page}`}>
      <div className={s.info}>
        <span className={s.icon}>
          <Compass strokeWidth={1.6} aria-hidden="true" />
        </span>
        <span className="eyebrow">404</span>
        <h1 className={s.title}>Aradığın sayfayı bulamadık</h1>
        <p className={s.lead}>Bağlantı değişmiş olabilir. Üretmek istediğin şeyden başlayalım:</p>
        <ul className={s.links}>
          {CRAFT_CATEGORIES.map((c) => (
            <li key={c.usage}>
              <Link to={`/kategori/${c.usage}`}>{c.name}</Link>
            </li>
          ))}
        </ul>
        <Link to="/" className="btn btn--primary">
          Ana sayfaya dön
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
