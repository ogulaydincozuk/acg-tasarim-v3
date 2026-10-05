import { FEATURED_IDS, getProducts } from '../data/products';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ProductRail } from '../components/product/ProductGrid';
import { HeroSlider } from '../sections/HeroSlider';
import { CategoryDiscovery } from '../sections/CategoryDiscovery';
import { ModernFeature } from '../sections/ModernFeature';
import { StarterSets } from '../sections/StarterSets';
import { Campaign, NewArrivals } from '../sections/NewAndDeals';
import { usePageTitle } from '../hooks/usePageTitle';

/**
 * Varyasyon 3 ana sayfa akışı (header ve footer Layout'ta):
 * hero → kategoriler → öne çıkan ürünler → modern feature → başlangıç setleri → yeni gelenler → kampanya
 */
export function HomePage() {
  usePageTitle();
  return (
    <>
      <HeroSlider />
      <CategoryDiscovery />

      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <SectionHeader
            id="featured-title"
            eyebrow="Seçki"
            title="Öne Çıkan Ürünler"
            action={{ label: 'Tüm ürünler', to: '/kategori/kaliplar' }}
          />
          <ProductRail products={getProducts(FEATURED_IDS)} label="Öne çıkan ürünler" />
        </div>
      </section>

      <ModernFeature />
      <StarterSets />
      <NewArrivals />
      <Campaign />
    </>
  );
}
