import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { LISTINGS, SEARCH_LISTING } from '../data/taxonomy';
import { POPULAR_SEARCHES } from '../data/content';
import { useShop } from '../context/ShopContext';
import {
  FACET_VALUE_LABEL,
  SORT_OPTIONS,
  activeFilterCount,
  applyFilters,
  baseProducts,
  buildFacets,
  readFilters,
  readSort,
  toggleCount,
  type FacetGroup,
  type FacetKey,
  type Filters,
  type ToggleKey,
} from '../lib/catalog';
import { cx, formatCount } from '../lib/format';
import { usePageTitle } from '../hooks/usePageTitle';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Drawer } from '../components/ui/Drawer';
import { ProductGrid } from '../components/product/ProductGrid';
import { NotFoundPage } from './NotFoundPage';
import s from './ListingPage.module.css';

const PAGE_SIZE = 12;

/* Kısa etiketli gruplar hap çip olarak, uzun etiketliler yuvarlak onay kutusuyla listelenir */
const CHIP_GROUPS: FacetKey[] = ['tema', 'fiyat'];

const TOGGLES: { key: ToggleKey; label: string }[] = [
  { key: 'stok', label: 'Sadece stoktakiler' },
  { key: 'yeni', label: 'Yeni ürünler' },
  { key: 'coksatan', label: 'Çok satanlar' },
];

interface FilterPanelProps {
  facets: FacetGroup[];
  filters: Filters;
  toggles: Record<ToggleKey, number>;
  onFacet: (key: FacetKey, value: string) => void;
  onToggle: (key: ToggleKey) => void;
}

function FilterPanel({ facets, filters, toggles, onFacet, onToggle }: FilterPanelProps) {
  return (
    <div className={s.filters}>
      {facets.map((g) => (
        <details key={g.key} className={s.group} open>
          <summary>
            <span className={s.groupTitle}>{g.title}</span>
            {(filters[g.key] as string[]).length > 0 && <span className={s.groupCount}>{(filters[g.key] as string[]).length}</span>}
            <ChevronDown aria-hidden="true" />
          </summary>
          <ul className={cx(s.options, CHIP_GROUPS.includes(g.key) && s.optionsChips)}>
            {g.options.map((o) => {
              const checked = (filters[g.key] as string[]).includes(o.value);
              return (
                <li key={o.value}>
                  <label className={cx(s.option, o.count === 0 && !checked && s.optionDisabled)}>
                    <input type="checkbox" checked={checked} disabled={o.count === 0 && !checked} onChange={() => onFacet(g.key, o.value)} />
                    <span className={s.box} aria-hidden="true" />
                    <span className={s.optionLabel}>{o.label}</span>
                    <span className={s.optionCount}>{o.count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
      <details className={s.group} open>
        <summary>
          <span className={s.groupTitle}>Durum</span>
          <ChevronDown aria-hidden="true" />
        </summary>
        <ul className={s.options}>
          {TOGGLES.map((t) => (
            <li key={t.key}>
              <label className={cx(s.option, s.switchRow, toggles[t.key] === 0 && !filters[t.key] && s.optionDisabled)}>
                <input
                  type="checkbox"
                  role="switch"
                  checked={filters[t.key]}
                  disabled={toggles[t.key] === 0 && !filters[t.key]}
                  onChange={() => onToggle(t.key)}
                />
                <span className={s.optionLabel}>{t.label}</span>
                <span className={s.optionCount}>{toggles[t.key]}</span>
                <span className={s.switch} aria-hidden="true" />
              </label>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export function ListingPage({ mode }: { mode: 'category' | 'search' }) {
  const { slug = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { pushRecentSearch } = useShop();
  const def = mode === 'search' ? SEARCH_LISTING : LISTINGS[slug];
  const query = mode === 'search' ? (params.get('q') ?? '').trim() : '';
  const [draft, setDraft] = useState(query);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const paramKey = params.toString();
  const filters = useMemo(() => readFilters(new URLSearchParams(paramKey)), [paramKey]);
  const sort = readSort(params);
  const base = useMemo(() => (def ? baseProducts(def, query) : []), [def, query]);
  const results = useMemo(() => applyFilters(base, filters, sort, Boolean(query)), [base, filters, sort, query]);
  const facets = useMemo(() => (def ? buildFacets(base, filters, def) : []), [base, filters, def]);
  const toggles = useMemo(() => toggleCount(base, filters), [base, filters]);
  const activeCount = activeFilterCount(filters);

  useEffect(() => setVisible(PAGE_SIZE), [paramKey, slug]);
  useEffect(() => setDraft(query), [query]);

  const title = mode === 'search' ? (query ? `“${query}” için sonuçlar` : 'Arama') : def?.title;
  usePageTitle(title);

  if (!def) return <NotFoundPage />;

  const update = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    mutate(next);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const toggleFacet = (key: FacetKey, value: string) =>
    update((p) => {
      const current = (filters[key] as string[]).slice();
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (next.length) p.set(key, next.join(','));
      else p.delete(key);
    });

  const toggleFlag = (key: ToggleKey) =>
    update((p) => {
      if (filters[key]) p.delete(key);
      else p.set(key, '1');
    });

  const clearAll = () =>
    update((p) => {
      ['alt', 'kullanim', 'tema', 'boyut', 'fiyat', 'stok', 'yeni', 'coksatan'].forEach((k) => p.delete(k));
    });

  const chips: { label: string; onRemove: () => void }[] = [
    ...(['alt', 'kullanim', 'tema', 'boyut', 'fiyat'] as FacetKey[]).flatMap((key) =>
      (filters[key] as string[]).map((value) => ({ label: FACET_VALUE_LABEL(key, value), onRemove: () => toggleFacet(key, value) })),
    ),
    ...TOGGLES.filter((t) => filters[t.key]).map((t) => ({ label: t.label, onRemove: () => toggleFlag(t.key) })),
  ];

  const crumbs =
    mode === 'search'
      ? [{ label: 'Ana sayfa', to: '/' }, { label: 'Arama' }]
      : [{ label: 'Ana sayfa', to: '/' }, { label: def.title }];

  const panel = <FilterPanel facets={facets} filters={filters} toggles={toggles} onFacet={toggleFacet} onToggle={toggleFlag} />;
  const shown = results.slice(0, visible);

  return (
    <div className={cx('container', s.page)}>
      <Breadcrumbs items={crumbs} />

      <header className={s.head}>
        <div className={s.titleRow}>
          <h1 className={s.title}>{title}</h1>
          <span className={s.total}>{formatCount(results.length)} ürün</span>
        </div>
        {def.description && <p className={s.desc}>{def.description}</p>}

        {mode === 'search' && (
          <form
            role="search"
            className={s.searchForm}
            onSubmit={(e) => {
              e.preventDefault();
              const t = draft.trim();
              if (!t) return;
              pushRecentSearch(t);
              setParams({ q: t });
            }}
          >
            <Search aria-hidden="true" />
            <input type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Kalıp, hammadde veya set ara" aria-label="Aramayı düzenle" />
            <button type="submit" className="btn btn--primary btn--sm">
              Ara
            </button>
          </form>
        )}

        {def.quickLinks && (
          <nav aria-label="Hızlı geçiş" className={s.quick}>
            <ul>
              {def.quickLinks.map((l) => {
                const [path, qs] = l.to.split('?');
                const isActive = qs ? params.toString() === qs : false;
                return (
                  <li key={l.label}>
                    <Link
                      to={{ pathname: path, search: qs ? `?${qs}` : '' }}
                      className={cx(s.quickLink, isActive && s.quickActive)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

      <div className={s.layout}>
        <aside className={s.sidebar} aria-label="Filtreler">
          <div className={s.sidebarHead}>
            <p className={s.sidebarTitle}>
              <span className={s.sidebarIcon} aria-hidden="true">
                <SlidersHorizontal />
              </span>
              Filtrele
            </p>
            {activeCount > 0 && (
              <button type="button" className={s.clear} onClick={clearAll}>
                Temizle
              </button>
            )}
          </div>
          {panel}
        </aside>

        <div className={s.main}>
          <div className={s.toolbar}>
            <button type="button" className={s.filterBtn} onClick={() => setDrawerOpen(true)}>
              <SlidersHorizontal aria-hidden="true" />
              Filtrele
              {activeCount > 0 && <span className={s.filterCount}>{activeCount}</span>}
            </button>
            <p className="visually-hidden" aria-live="polite">
              {formatCount(results.length)} ürün listeleniyor
            </p>
            <label className={s.sort}>
              <span className={s.sortLabel}>Sırala:</span>
              <select value={sort} onChange={(e) => update((p) => (e.target.value === 'onerilen' ? p.delete('sirala') : p.set('sirala', e.target.value)))}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
          </div>

          {chips.length > 0 && (
            <ul className={s.chips} aria-label="Aktif filtreler">
              {chips.map((c) => (
                <li key={c.label}>
                  <button type="button" onClick={c.onRemove} aria-label={`${c.label} filtresini kaldır`}>
                    {c.label}
                    <X aria-hidden="true" />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className={s.chipsClear} onClick={clearAll}>
                  Tümünü temizle
                </button>
              </li>
            </ul>
          )}

          {results.length > 0 ? (
            <>
              <ProductGrid products={shown} columns={4} priorityCount={4} />
              <div className={s.more}>
                <p>
                  {formatCount(results.length)} üründen {formatCount(shown.length)} tanesi gösteriliyor
                </p>
                <div className={s.progress} aria-hidden="true">
                  <span style={{ width: `${(shown.length / results.length) * 100}%` }} />
                </div>
                {visible < results.length && (
                  <button type="button" className="btn btn--secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Daha fazla göster
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className={s.empty}>
              <span className={s.emptyIcon} aria-hidden="true">
                <SearchX strokeWidth={1.6} />
              </span>
              <p className={s.emptyTitle}>{activeCount ? 'Bu filtrelerle eşleşen ürün yok' : 'Sonuç bulunamadı'}</p>
              <p className={s.emptyText}>
                {activeCount ? 'Bazı filtreleri kaldırarak sonuçları genişletebilirsin.' : 'Yazımı kontrol et ya da popüler aramalardan birini dene.'}
              </p>
              {activeCount > 0 ? (
                <button type="button" className="btn btn--primary" onClick={clearAll}>
                  Filtreleri temizle
                </button>
              ) : (
                <ul className={s.suggest}>
                  {POPULAR_SEARCHES.map((t) => (
                    <li key={t}>
                      <Link to={`/arama?q=${encodeURIComponent(t)}`}>{t}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="bottom"
        title="Filtrele"
        footer={
          <div className={s.drawerFoot}>
            <button type="button" className="btn btn--secondary" onClick={clearAll} disabled={!activeCount}>
              Temizle
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setDrawerOpen(false)}>
              {formatCount(results.length)} ürünü göster
            </button>
          </div>
        }
      >
        <div className={s.drawerBody}>{panel}</div>
      </Drawer>
    </div>
  );
}
