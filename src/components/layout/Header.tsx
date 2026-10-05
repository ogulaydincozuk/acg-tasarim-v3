import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useHeaderDock, useMediaQuery } from '../../hooks/useUi';
import { cx } from '../../lib/format';
import { CategoryRail } from './CategoryRail';
import { Logo } from './Logo';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { UtilityBar } from './UtilityBar';
import s from './Header.module.css';

/** Mega menü iki katmandan birinden açılır: sayfa başındaki tam header veya kaydırınca beliren dock. */
type Host = 'shell' | 'dock';

function MenuButton({
  open,
  controls,
  btnRef,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: {
  open: boolean;
  controls: string;
  btnRef: (el: HTMLButtonElement | null) => void;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  onPointerEnter?: (e: PointerEvent<HTMLButtonElement>) => void;
  onPointerLeave?: () => void;
}) {
  return (
    <button
      type="button"
      ref={btnRef}
      className={s.menuBtn}
      aria-expanded={open}
      aria-controls={controls}
      aria-label="Menü"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <span className={s.burger} aria-hidden="true">
        <i />
        <i />
      </span>
      <span className={s.menuLabel}>Menü</span>
    </button>
  );
}

function CartButton({ compact }: { compact?: boolean }) {
  const { cartCount, setCartOpen } = useShop();
  return (
    <button
      type="button"
      className={cx(s.textLink, s.cart, compact && s.cartCompact)}
      onClick={() => setCartOpen(true)}
      aria-label={`Sepet (${cartCount} ürün)`}
    >
      <ShoppingBag strokeWidth={1.4} aria-hidden="true" />
      <span className={s.cartLabel}>Sepet</span>
      {cartCount > 0 && (
        <span key={cartCount} className={cx(s.chip, s.chipBump)} aria-hidden="true">
          {cartCount}
        </span>
      )}
    </button>
  );
}

/**
 * V3 header — "Editorial / Modern Boutique Commerce".
 *
 *  1. Utility bar   : ince Graphite şerit (marka cümlesi · yardım bağlantıları)
 *  2. Marka satırı  : ortalanmış logo · solda MENÜ · sağda Ara / Favoriler / Sepet
 *  3. Kategori rail : logodan ayrı, ince ve sakin navigasyon şeridi
 *
 * Tam header sayfa akışında kalır ve yapışmaz. İlk ekran geçilince compact "dock"
 * (menü · logo · ara + sepet) belirir; yukarı kaydırınca dock kategori rail'iyle genişler.
 */
export function Header() {
  const { favorites, setSearchOpen } = useShop();
  const { pathname, search } = useLocation();
  const shellRef = useRef<HTMLElement>(null);
  const dock = useHeaderDock(shellRef);
  const desktop = useMediaQuery('(min-width: 1024px)');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaHost, setMegaHost] = useState<Host>('shell');
  const triggers = useRef<Record<Host, HTMLButtonElement | null>>({ shell: null, dock: null });
  const panels = useRef<Record<Host, HTMLDivElement | null>>({ shell: null, dock: null });
  const timer = useRef<number | undefined>(undefined);
  const pinned = useRef(false); // tıklayarak açılan menü, imleç ayrılınca kapanmaz
  const focusPanel = useRef(false);
  const openedAt = useRef(0);

  const closeMega = useCallback(() => {
    window.clearTimeout(timer.current);
    pinned.current = false;
    setMegaOpen(false);
  }, []);

  const openMega = useCallback((host: Host) => {
    window.clearTimeout(timer.current);
    openedAt.current = window.scrollY;
    setMegaHost(host);
    setMegaOpen(true);
  }, []);

  const cancelClose = useCallback(() => window.clearTimeout(timer.current), []);
  const scheduleClose = useCallback(() => {
    window.clearTimeout(timer.current);
    if (pinned.current) return;
    timer.current = window.setTimeout(() => setMegaOpen(false), 220);
  }, []);

  /** İmleç MENÜ'nün üzerine gelince kısa bir gecikmeyle açılır (yalnızca fare). */
  const hoverOpen = (host: Host) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'mouse' || !desktop) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => openMega(host), 90);
  };

  const onMenuClick = (host: Host) => (e: MouseEvent<HTMLButtonElement>) => {
    if (!desktop) {
      setDrawerOpen(true);
      return;
    }
    const sameHostOpen = megaOpen && megaHost === host;
    if (sameHostOpen && (pinned.current || e.detail === 0)) {
      closeMega();
      return;
    }
    if (sameHostOpen) {
      // hover ile açılmıştı: tıklama menüyü sabitler, kapatmaz
      pinned.current = true;
      return;
    }
    pinned.current = true;
    focusPanel.current = e.detail === 0; // klavye ile açıldıysa odak panele geçer
    openMega(host);
  };

  // Rota değişince her şey kapanır
  useEffect(() => {
    closeMega();
    setDrawerOpen(false);
  }, [pathname, search, closeMega]);

  // Masaüstü → mobil geçişinde mega menü kalmasın
  useEffect(() => {
    if (!desktop) closeMega();
  }, [desktop, closeMega]);

  // Menüyü açan katman görünümden çıkarsa kapat
  useEffect(() => {
    if (!megaOpen) return;
    if ((megaHost === 'shell' && dock !== 'hidden') || (megaHost === 'dock' && dock === 'hidden')) closeMega();
  }, [dock, megaOpen, megaHost, closeMega]);

  // Açıkken: Esc kapatır ve odağı tetikleyiciye geri verir; belirgin kaydırma kapatır
  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const inside = panels.current[megaHost]?.contains(document.activeElement);
      closeMega();
      if (inside) triggers.current[megaHost]?.focus({ preventScroll: true });
    };
    const onScroll = () => {
      if (Math.abs(window.scrollY - openedAt.current) > 120) closeMega();
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [megaOpen, megaHost, closeMega]);

  // Klavyeyle açılınca ilk bağlantıya odaklan
  useEffect(() => {
    if (!megaOpen || !focusPanel.current) return;
    focusPanel.current = false;
    // Panel açılırken `inert` ve `visibility` anında kalkar; odak hemen verilebilir.
    panels.current[megaHost]?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  }, [megaOpen, megaHost]);

  // Yapışkan yan paneller (filtre, ürün bilgisi, sipariş özeti) genişlemiş dock'un altına yaslansın
  useEffect(() => {
    document.documentElement.toggleAttribute('data-header-expanded', dock === 'expanded');
    return () => document.documentElement.removeAttribute('data-header-expanded');
  }, [dock]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const menuProps = (host: Host) => ({
    open: desktop ? megaOpen && megaHost === host : drawerOpen,
    controls: desktop ? `mega-${host}` : 'mobile-menu',
    btnRef: (el: HTMLButtonElement | null) => {
      triggers.current[host] = el;
    },
    onClick: onMenuClick(host),
    onPointerEnter: hoverOpen(host),
    onPointerLeave: scheduleClose,
  });

  const megaProps = (host: Host) => ({
    id: `mega-${host}`,
    open: megaOpen && megaHost === host,
    rendered: megaHost === host,
    onPointerEnter: cancelClose,
    onPointerLeave: scheduleClose,
  });

  return (
    <>
      <header ref={shellRef} className={s.shell}>
        <UtilityBar />

        <div className={cx('container', s.brandBar)}>
          <div className={s.left}>
            <MenuButton {...menuProps('shell')} />
          </div>
          <Logo className={s.brandLogo} />
          <div className={s.tools}>
            <button type="button" className={cx(s.search, s.desktopOnly)} onClick={() => setSearchOpen(true)} aria-label="Ara">
              <Search strokeWidth={1.5} aria-hidden="true" />
              <span>Ne arıyorsun?</span>
            </button>
            <Link to="/favoriler" className={cx(s.textLink, s.desktopOnly)} aria-label={`Favoriler (${favorites.length})`}>
              <span className={s.textLinkLabel}>Favoriler</span>
              {favorites.length > 0 && <span className={s.count}>{favorites.length}</span>}
            </Link>
            <CartButton />
          </div>
        </div>

        <MegaMenu ref={(el) => void (panels.current.shell = el)} {...megaProps('shell')} />

        <div className={cx('container', s.mobileSearch)}>
          <button type="button" className={s.mobileSearchBtn} onClick={() => setSearchOpen(true)} aria-label="Ara">
            <Search strokeWidth={1.5} aria-hidden="true" />
            <span>Ne arıyorsun?</span>
          </button>
        </div>

        <div className={s.railRow}>
          <div className="container">
            <div className={s.railWrap}>
              <CategoryRail />
            </div>
          </div>
        </div>
      </header>

      {megaOpen && <div className={s.scrim} onClick={closeMega} aria-hidden="true" />}

      <div className={cx(s.dock, dock !== 'hidden' && s.dockOn, dock === 'expanded' && s.dockWide)} inert={dock === 'hidden'}>
        <div className={cx('container', s.dockBar)}>
          <div className={s.left}>
            <MenuButton {...menuProps('dock')} />
          </div>
          <Logo className={s.dockLogo} />
          <div className={cx(s.tools, s.dockTools)}>
            <button type="button" className={cx(s.textLink, s.dockSearch)} onClick={() => setSearchOpen(true)} aria-label="Ara">
              <Search strokeWidth={1.5} aria-hidden="true" />
              <span className={s.dockSearchLabel}>Ara</span>
            </button>
            <CartButton compact />
          </div>
        </div>

        <MegaMenu ref={(el) => void (panels.current.dock = el)} {...megaProps('dock')} />

        <div className={s.dockRail}>
          <div className={s.dockRailClip}>
            <div className={s.railRow}>
              <div className="container">
                <div className={s.railWrap}>
                  <CategoryRail label="Kategoriler" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
