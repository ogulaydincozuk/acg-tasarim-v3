import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { CRAFT_CATEGORIES } from '../data/taxonomy';
import { cx } from '../lib/format';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Img } from '../components/ui/Img';
import s from './CategoryDiscovery.module.css';

/** Bento ızgara: büyük "Mum" karosu + üç küçük/orta karo. Her karo görsel üstünde etiket taşır. */
export function CategoryDiscovery() {
  return (
    <section className="section" aria-labelledby="craft-title">
      <div className="container">
        <SectionHeader id="craft-title" eyebrow="Koleksiyon" title="Kategorileri Keşfet" action={{ label: 'Tüm kalıplar', to: '/kategori/kaliplar' }} />
        <ul className={s.bento}>
          {CRAFT_CATEGORIES.map((c, i) => (
            <li key={c.usage} className={cx(s.cell, s[`cell${i}`])}>
              <Link to={`/kategori/${c.usage}`} className={s.tile}>
                <Img
                  image={c.image}
                  alt=""
                  ratio={i === 0 ? 1 : 4 / 3}
                  sizes={i === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 26vw, 50vw'}
                  className={s.img}
                  maxWidth={1080}
                />
                <span className={s.shade} aria-hidden="true" />
                <span className={s.label}>
                  <span className={s.name}>{c.name}</span>
                  <span className={s.hint}>{c.hint}</span>
                </span>
                <span className={s.go} aria-hidden="true">
                  <ArrowUpRight />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
