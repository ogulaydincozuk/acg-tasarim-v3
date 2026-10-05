import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, History, Search, TrendingUp, X } from 'lucide-react';
import { POPULAR_SEARCHES } from '../../data/content';
import { getProducts } from '../../data/products';
import { CRAFT_CATEGORIES } from '../../data/taxonomy';
import { useShop } from '../../context/ShopContext';
import { useBodyLock, useDialog } from '../../hooks/useUi';
import { cx, formatPrice } from '../../lib/format';
import { highlightParts, searchProducts, searchSuggestions } from '../../lib/search';
import { Img } from '../ui/Img';
import s from './SearchOverlay.module.css';

const TRENDING_IDS = ['p-202', 'p-005', 'p-101'];

function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((part, i) => (part.match ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>))}
    </>
  );
}

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, recentSearches, pushRecentSearch, removeRecentSearch } = useShop();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(-1);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const close = () => setSearchOpen(false);

  // Bir öneriye tıklanıp sayfa değiştiğinde paneli kapat
  useEffect(() => setSearchOpen(false), [location.key, setSearchOpen]);

  useBodyLock(searchOpen);
  useDialog(panel, searchOpen, close, input);

  useEffect(() => {
    if (!searchOpen) {
      setQuery('');
      setCursor(-1);
    }
  }, [searchOpen]);

  useEffect(() => setCursor(-1), [query]);

  const q = query.trim();
  const products = useMemo(() => (q.length >= 2 ? searchProducts(q) : []), [q]);
  const suggestions = useMemo(() => searchSuggestions(q), [q]);
  const trending = useMemo(() => getProducts(TRENDING_IDS), []);

  /** Ok tuşlarıyla gezilebilen bağlantı listesi (öneriler + ürünler + tümünü gör) */
  const targets = useMemo(() => {
    if (q.length < 2) return [] as string[];
    return [
      ...suggestions.map((sug) => sug.to),
      ...products.slice(0, 6).map((p) => `/urun/${p.slug}`),
      `/arama?q=${encodeURIComponent(q)}`,
    ];
  }, [q, suggestions, products]);

  const go = (to: string, term?: string) => {
    if (term) pushRecentSearch(term);
    close();
    navigate(to);
  };

  const submit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    go(`/arama?q=${encodeURIComponent(t)}`, t);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!targets.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % targets.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c <= 0 ? targets.length - 1 : c - 1));
    } else if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault();
      go(targets[cursor], q);
    }
  };

  const optionProps = (to: string, row: string) => {
    const index = targets.indexOf(to);
    return {
      id: `search-opt-${index}`,
      className: cx(row, index === cursor && s.optionActive),
      onMouseEnter: () => setCursor(index),
    };
  };

  if (!searchOpen) return null;

  const hasQuery = q.length >= 2;
  const noResults = hasQuery && !products.length && !suggestions.length;

  return createPortal(
    <div className={s.root}>
      <div className={s.backdrop} onClick={close} aria-hidden="true" />
      <div ref={panel} className={s.panel} role="dialog" aria-modal="true" aria-label="Site içi arama">
        <div className={cx('container', s.bar)}>
          <form
            role="search"
            className={s.form}
            onSubmit={(e) => {
              e.preventDefault();
              submit(query);
            }}
          >
            <Search className={s.searchIcon} strokeWidth={1.6} aria-hidden="true" />
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ne üretmek istiyorsun? Kalıp, hammadde, set ara…"
              aria-label="Ara"
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-activedescendant={cursor >= 0 ? `search-opt-${cursor}` : undefined}
              autoComplete="off"
              enterKeyHint="search"
            />
            {query && (
              <button type="button" className={s.clear} onClick={() => setQuery('')} aria-label="Aramayı temizle">
                <X />
              </button>
            )}
          </form>
          <button type="button" className={s.cancel} onClick={close}>
            Kapat
          </button>
        </div>

        <div id="search-results" className={cx('container', s.content)}>
          {!hasQuery && (
            <div className={s.idle}>
              <div className={s.col}>
                {recentSearches.length > 0 && (
                  <section className={s.block}>
                    <h3 className={s.heading}>
                      <History aria-hidden="true" /> Son aramalar
                    </h3>
                    <ul className={s.chips}>
                      {recentSearches.map((term) => (
                        <li key={term} className={s.recent}>
                          <button type="button" onClick={() => submit(term)}>
                            {term}
                          </button>
                          <button type="button" className={s.recentRemove} onClick={() => removeRecentSearch(term)} aria-label={`${term} aramasını sil`}>
                            <X />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <section className={s.block}>
                  <h3 className={s.heading}>
                    <TrendingUp aria-hidden="true" /> Popüler aramalar
                  </h3>
                  <ul className={s.chips}>
                    {POPULAR_SEARCHES.map((term) => (
                      <li key={term}>
                        <button type="button" className={s.chip} onClick={() => submit(term)}>
                          {term}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className={s.block}>
                  <h3 className={s.heading}>Kategoriler</h3>
                  <ul className={s.cats}>
                    {CRAFT_CATEGORIES.map((c) => (
                      <li key={c.usage}>
                        <button type="button" className={s.cat} onClick={() => go(`/kategori/${c.usage}`)}>
                          <Img image={c.image} alt="" ratio={1} sizes="40px" maxWidth={320} className={s.catImg} />
                          {c.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
              <section className={cx(s.col, s.block)}>
                <h3 className={s.heading}>Şu an çok aranan</h3>
                <ul className={s.products}>
                  {trending.map((p) => (
                    <li key={p.id}>
                      <button type="button" className={s.product} onClick={() => go(`/urun/${p.slug}`)}>
                        <Img image={p.image} alt="" ratio={1} sizes="64px" maxWidth={320} className={s.productImg} />
                        <span className={s.productText}>
                          <span className={s.productName}>{p.name}</span>
                          <span className={s.productMeta}>{p.subcategory}</span>
                          <span className={cx(s.productPrice, 'price')}>{formatPrice(p.price)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          {hasQuery && !noResults && (
            <div className={cx(s.results, suggestions.length === 0 && s.resultsSingle)}>
              {suggestions.length > 0 && (
                <section className={cx(s.col, s.block)}>
                  <h3 className={s.heading}>Öneriler</h3>
                  <ul className={s.suggestions} role="listbox" aria-label="Kategori önerileri">
                    {suggestions.map((sug) => (
                      <li key={sug.to} role="option" aria-selected={targets.indexOf(sug.to) === cursor}>
                        <Link to={sug.to} {...optionProps(sug.to, s.option)} onClick={() => pushRecentSearch(q)} tabIndex={-1}>
                          <span>
                            <Highlight text={sug.label} query={q} />
                          </span>
                          <span className={s.sugCount}>{sug.count} ürün</span>
                          <ArrowUpRight aria-hidden="true" className={s.sugIcon} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section className={cx(s.col, s.block)}>
                <h3 className={s.heading}>Ürünler {products.length > 0 && <span className={s.headingCount}>({products.length})</span>}</h3>
                {products.length > 0 ? (
                  <ul className={s.products} role="listbox" aria-label="Ürün önerileri">
                    {products.slice(0, 6).map((p) => {
                      const to = `/urun/${p.slug}`;
                      return (
                        <li key={p.id} role="option" aria-selected={targets.indexOf(to) === cursor}>
                          <Link to={to} {...optionProps(to, s.product)} onClick={() => pushRecentSearch(q)} tabIndex={-1}>
                            <Img image={p.image} alt="" ratio={1} sizes="64px" maxWidth={320} className={s.productImg} />
                            <span className={s.productText}>
                              <span className={s.productName}>
                                <Highlight text={p.name} query={q} />
                              </span>
                              <span className={s.productMeta}>
                                {p.subcategory} · {p.stock > 0 ? 'Stokta' : 'Tükendi'}
                              </span>
                              <span className={cx(s.productPrice, 'price')}>{formatPrice(p.price)}</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className={s.muted}>Bu aramayla eşleşen ürün yok; önerilen kategorilere göz at.</p>
                )}
                <Link
                  to={`/arama?q=${encodeURIComponent(q)}`}
                  {...optionProps(`/arama?q=${encodeURIComponent(q)}`, s.all)}
                  onClick={() => pushRecentSearch(q)}
                  tabIndex={-1}
                >
                  “{q}” için tüm sonuçları gör
                  <ArrowRight aria-hidden="true" />
                </Link>
              </section>
            </div>
          )}

          {noResults && (
            <div className={s.empty}>
              <p className={s.emptyTitle}>“{q}” için sonuç bulunamadı</p>
              <p className={s.muted}>Yazımı kontrol et ya da popüler aramalardan birini dene.</p>
              <ul className={s.chips}>
                {POPULAR_SEARCHES.map((term) => (
                  <li key={term}>
                    <button type="button" className={s.chip} onClick={() => setQuery(term)}>
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
