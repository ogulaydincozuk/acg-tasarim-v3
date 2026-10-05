import { forwardRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { MEGA_COLUMNS } from '../../data/taxonomy';
import { cx, formatPrice } from '../../lib/format';
import { Img } from '../ui/Img';
import s from './MegaMenu.module.css';

interface MegaMenuProps {
  id: string;
  open: boolean;
  /** İçerik yalnızca son kullanılan header katmanında (tam header / dock) çizilir; çıkış animasyonu bozulmasın diye kapanırken de durur. */
  rendered: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

/**
 * Masaüstü "MENU" paneli: üç sakin kolon + tek vitrin kartı (Çok Satanlar).
 * Başlıklar ilgili listeleme sayfasına, alt bağlantılar hazır filtreli listelere gider.
 */
export const MegaMenu = forwardRef<HTMLDivElement, MegaMenuProps>(function MegaMenu(
  { id, open, rendered, onPointerEnter, onPointerLeave },
  ref,
) {
  const featured = useMemo(() => [...PRODUCTS].filter((p) => p.stock > 0).sort((a, b) => a.salesRank - b.salesRank)[0], []);

  return (
    <div className={s.anchor}>
      <div
        id={id}
        ref={ref}
        className={cx(s.panel, open && s.open)}
        inert={!open}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        {rendered && (
          <div className={cx('container', s.grid)}>
            {MEGA_COLUMNS.map((col) => (
              <section key={col.title} className={s.col} aria-label={col.title}>
                <Link to={col.to} className={s.colTitle}>
                  {col.title}
                </Link>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className={s.link}>
                        {link.label}
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <section className={s.featured} aria-label="Çok satanlar">
              <span className={s.colTitle}>Çok Satanlar</span>
              <Link to={`/urun/${featured.slug}`} className={s.card}>
                <Img image={featured.image} alt="" ratio={4 / 5} sizes="132px" maxWidth={480} className={s.cardImg} />
                <span className={s.cardText}>
                  <span className={s.cardName}>{featured.name}</span>
                  <span className={s.cardMeta}>{featured.subcategory}</span>
                  <span className={cx(s.cardPrice, 'price')}>{formatPrice(featured.price)}</span>
                </span>
              </Link>
              <div className={s.more}>
                <Link to="/kategori/yeni-gelenler" className={s.moreLink}>
                  Yeni gelenler
                  <ArrowRight aria-hidden="true" />
                </Link>
                <Link to="/kategori/kampanyalar" className={s.moreLink}>
                  Kampanyalar
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
});
