import { useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { STARTER_SETS } from '../data/products';
import { useShop } from '../context/ShopContext';
import { cx } from '../lib/format';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Img } from '../components/ui/Img';
import { Price } from '../components/product/ProductBits';
import s from './StarterSets.module.css';

/**
 * Sekmeli özellik paneli: solda set seçimi, sağda seçili setin görseli, içeriği ve fiyatı.
 * Klavye: ok tuşları / Home / End sekmeler arasında gezinir (WAI-ARIA tabs).
 */
export function StarterSets() {
  const { addToCart } = useShop();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const set = STARTER_SETS[active];

  const focusTab = (i: number) => {
    const next = (i + STARTER_SETS.length) % STARTER_SETS.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') focusTab(active + 1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') focusTab(active - 1);
    else if (e.key === 'Home') focusTab(0);
    else if (e.key === 'End') focusTab(STARTER_SETS.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <section className="section" aria-labelledby="sets-title">
      <div className="container">
        <SectionHeader id="sets-title" eyebrow="Başlangıç setleri" title="Başlangıç İçin" action={{ label: 'Tüm setler', to: '/kategori/setler' }} />

        <div className={s.panel}>
          <div className={s.tabs} role="tablist" aria-label="Başlangıç setleri" onKeyDown={onKeyDown}>
            {STARTER_SETS.map((it, i) => (
              <button
                key={it.id}
                ref={(el) => void (tabs.current[i] = el)}
                type="button"
                role="tab"
                id={`set-tab-${it.id}`}
                aria-selected={i === active}
                aria-controls="set-panel"
                tabIndex={i === active ? 0 : -1}
                className={cx(s.tab, i === active && s.tabActive)}
                onClick={() => setActive(i)}
              >
                <Img image={it.image} alt="" ratio={1} sizes="56px" maxWidth={160} className={s.tabImg} />
                <span className={s.tabText}>
                  <span className={s.tabName}>{it.name.replace(' Başlangıç Seti', '')}</span>
                  <span className={s.tabMeta}>{it.size}</span>
                </span>
                <ArrowRight className={s.tabArrow} aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className={s.detail} role="tabpanel" id="set-panel" aria-labelledby={`set-tab-${set.id}`} tabIndex={0}>
            <Link to={`/urun/${set.slug}`} className={s.photo} tabIndex={-1} aria-hidden="true">
              <Img key={set.id} image={set.image} alt="" ratio={1} sizes="(min-width: 1024px) 30vw, 100vw" maxWidth={900} className={s.photoImg} />
            </Link>

            <div className={s.info}>
              <span className={s.meta}>
                {set.level} · {set.yields}
              </span>
              <h3 className={s.name}>{set.name}</h3>
              <p className={s.lead}>{set.shortInfo}</p>

              <ul className={s.contents} aria-label="Set içeriği">
                {set.contents?.map((line) => (
                  <li key={line}>
                    <Check aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>

              <div className={s.foot}>
                <Price price={set.price} oldPrice={set.oldPrice} size="lg" />
                <div className={s.actions}>
                  <button type="button" className="btn btn--primary btn--md" onClick={() => addToCart(set.id)}>
                    <ShoppingBag aria-hidden="true" />
                    Sepete ekle
                  </button>
                  <Link to={`/urun/${set.slug}`} className="btn btn--secondary btn--md">
                    İncele
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
