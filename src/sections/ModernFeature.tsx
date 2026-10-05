import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { CATEGORY_LABEL } from '../data/taxonomy';
import { Img } from '../components/ui/Img';
import s from './ModernFeature.module.css';

/** Rakamlar katalogdan hesaplanır (listeleme sayfalarındaki toplamla aynı); ürün eklendikçe kendiliğinden güncellenir. */
const STATS = (['kaliplar', 'hammaddeler', 'setler'] as const).map((category) => ({
  value: PRODUCTS.filter((p) => p.category === category).length,
  label: CATEGORY_LABEL[category],
  to: `/kategori/${category}`,
}));

/**
 * "Modern Feature": hero ile ürün bölümleri arasında ritmi değiştiren tek bir editoryal blok.
 * Solda görsel, sağda Graphite zeminli metin; Coral yalnızca bağlantı ve hover'da.
 */
export function ModernFeature() {
  return (
    <section className="section" aria-labelledby="feature-title">
      <div className="container">
        <div className={s.panel}>
          <Link to="/kategori/kaliplar" className={s.media} aria-label="Kalıpları incele" tabIndex={-1}>
            <Img
              image="siliconeMoldPink"
              alt="Pembe silikon kalıp"
              ratio={4 / 3}
              sizes="(min-width: 1024px) 36vw, 100vw"
              maxWidth={1080}
              className={s.img}
            />
          </Link>

          <div className={s.copy}>
            <span className={s.eyebrow}>Kalıp Koleksiyonu</span>
            <h2 id="feature-title" className={s.title}>
              Kalıptan hammaddeye,
              <br />
              <span className={s.muted}>tek yerden.</span>
            </h2>
            <p className={s.text}>
              Mum, kokulu taş ve dekorasyon üretimi için kalıplar, hammaddeler ve başlangıç setleri: ihtiyacın olan her şey aynı koleksiyonda.
            </p>

            <ul className={s.stats} aria-label="Koleksiyon özeti">
              {STATS.map((stat) => (
                <li key={stat.label}>
                  <Link to={stat.to} className={s.stat}>
                    <span className={s.value}>{String(stat.value).padStart(2, '0')}</span>
                    <span className={s.label}>{stat.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link to="/kategori/kaliplar" className={s.cta}>
              Kalıpları keşfet
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
