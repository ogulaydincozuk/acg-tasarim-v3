import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../../data/types';
import { cx } from '../../lib/format';
import { ProductCard } from './ProductCard';
import s from './ProductGrid.module.css';

/** Desktop 4 · tablet 3 · mobil 2 kolon */
export function ProductGrid({ products, columns = 4, priorityCount = 0 }: { products: Product[]; columns?: 3 | 4; priorityCount?: number }) {
  return (
    <ul className={cx(s.grid, columns === 3 && s.three)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard
            product={p}
            priority={i < priorityCount}
            sizes={columns === 3 ? '(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw' : undefined}
          />
        </li>
      ))}
    </ul>
  );
}

/** Yatay kaydırmalı ürün şeridi (scroll-snap). Masaüstünde ok butonları, mobilde parmakla kaydırma. */
export function ProductRail({ products, label }: { products: Product[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [products]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <div className={s.rail} role="region" aria-label={label}>
      <ul ref={track} className={cx(s.track, 'no-scrollbar')}>
        {products.map((p) => (
          <li key={p.id} className={s.slide}>
            <ProductCard product={p} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 36vw, 62vw" />
          </li>
        ))}
      </ul>
      <div className={s.nav}>
        <button type="button" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Önceki ürünler">
          <ChevronLeft strokeWidth={1.6} />
        </button>
        <button type="button" onClick={() => scroll(1)} disabled={edges.end} aria-label="Sonraki ürünler">
          <ChevronRight strokeWidth={1.6} />
        </button>
      </div>
    </div>
  );
}
