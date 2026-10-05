import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { PRODUCT_BY_ID } from '../data/products';
import type { Product } from '../data/types';
import { readStorage, writeStorage } from '../lib/storage';

/**
 * Önizleme için istemci tarafı mağaza durumu: sepet, favoriler, son aramalar
 * ve global katmanlar (arama, sepet çekmecesi, hızlı inceleme, bildirim).
 * V2'de sepet/favori sunucuya taşınırken bileşen API'si aynı kalabilir.
 */

export interface CartLine {
  id: string;
  qty: number;
}

export interface Toast {
  id: number;
  title: string;
  product?: Product;
  action?: 'cart' | 'favorites';
}

interface ShopState {
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  addToCart: (id: string, qty?: number) => void;
  /** Birden çok ürünü tek seferde ekler, tek bildirim gösterir */
  addManyToCart: (ids: string[]) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;

  recentSearches: string[];
  pushRecentSearch: (q: string) => void;
  removeRecentSearch: (q: string) => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  quickView: Product | null;
  setQuickView: (p: Product | null) => void;

  toast: Toast | null;
  notify: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: () => void;
  holdToast: () => void;
  releaseToast: () => void;
}

const ShopContext = createContext<ShopState | null>(null);

const KEYS = { cart: 'acg.cart', fav: 'acg.favorites', recent: 'acg.recentSearches' };

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() =>
    readStorage<CartLine[]>(KEYS.cart, []).filter((l) => PRODUCT_BY_ID.has(l.id)),
  );
  const [favorites, setFavorites] = useState<string[]>(() => readStorage<string[]>(KEYS.fav, []));
  const [recentSearches, setRecent] = useState<string[]>(() => readStorage<string[]>(KEYS.recent, []));
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // Sayfa değişince (ör. bildirimdeki "Favoriler" bağlantısı) hızlı görüntüle ve sepet çekmecesi açık kalmasın
  const location = useLocation();
  useEffect(() => {
    setQuickView(null);
    setCartOpen(false);
  }, [location.key]);

  useEffect(() => writeStorage(KEYS.cart, cart), [cart]);
  useEffect(() => writeStorage(KEYS.fav, favorites), [favorites]);
  useEffect(() => writeStorage(KEYS.recent, recentSearches), [recentSearches]);

  const dismissToast = useCallback(() => {
    window.clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const armToast = useCallback((ms: number) => {
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), ms);
  }, []);

  const notify = useCallback(
    (t: Omit<Toast, 'id'>) => {
      setToast({ ...t, id: Date.now() });
      armToast(6000);
    },
    [armToast],
  );

  /** Bildirimin üzerine gelince / dokununca / odaklanınca süre durur; bırakınca kısa bir süre daha açık kalır. */
  const holdToast = useCallback(() => window.clearTimeout(toastTimer.current), []);
  const releaseToast = useCallback(() => armToast(2500), [armToast]);

  /** Stok sınırını gözeterek ekler; kaç farklı ürünün gerçekten eklendiğini döndürür. */
  const addItems = useCallback(
    (items: { id: string; qty: number }[]) => {
      const next = [...cart];
      let addedProducts = 0;
      let limited = false;
      for (const { id, qty } of items) {
        const product = PRODUCT_BY_ID.get(id);
        if (!product || product.stock <= 0) continue;
        const index = next.findIndex((l) => l.id === id);
        const current = index >= 0 ? next[index].qty : 0;
        const target = Math.min(current + qty, product.stock);
        if (target < current + qty) limited = true;
        if (target === current) continue;
        if (index >= 0) next[index] = { ...next[index], qty: target };
        else next.push({ id, qty: target });
        addedProducts += 1;
      }
      if (addedProducts) setCart(next);
      return { addedProducts, limited };
    },
    [cart],
  );

  const addToCart = useCallback(
    (id: string, qty = 1) => {
      const product = PRODUCT_BY_ID.get(id);
      if (!product || product.stock <= 0) return;
      const { addedProducts, limited } = addItems([{ id, qty }]);
      if (!addedProducts) notify({ title: `Stoktaki ${product.stock} adedin tamamı sepetinde`, product, action: 'cart' });
      else notify({ title: limited ? 'Stok sınırı kadar eklendi' : 'Sepete eklendi', product, action: 'cart' });
    },
    [addItems, notify],
  );

  const addManyToCart = useCallback(
    (ids: string[]) => {
      const { addedProducts } = addItems(ids.map((id) => ({ id, qty: 1 })));
      notify({
        title: addedProducts ? `${addedProducts} ürün sepete eklendi` : 'Bu ürünler zaten stok sınırında',
        action: 'cart',
      });
    },
    [addItems, notify],
  );

  const setQty = useCallback((id: string, qty: number) => {
    const max = PRODUCT_BY_ID.get(id)?.stock ?? 99;
    setCart((lines) =>
      qty <= 0 ? lines.filter((l) => l.id !== id) : lines.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, max) } : l)),
    );
  }, []);

  const removeFromCart = useCallback((id: string) => setCart((lines) => lines.filter((l) => l.id !== id)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const has = favorites.includes(id);
      setFavorites((ids) => (has ? ids.filter((x) => x !== id) : [id, ...ids.filter((x) => x !== id)]));
      const product = PRODUCT_BY_ID.get(id);
      if (!has && product) notify({ title: 'Favorilere eklendi', product, action: 'favorites' });
    },
    [favorites, notify],
  );

  const pushRecentSearch = useCallback((q: string) => {
    const term = q.trim();
    if (!term) return;
    setRecent((list) => [term, ...list.filter((x) => x.toLocaleLowerCase('tr') !== term.toLocaleLowerCase('tr'))].slice(0, 6));
  }, []);

  const removeRecentSearch = useCallback((q: string) => setRecent((list) => list.filter((x) => x !== q)), []);

  const value = useMemo<ShopState>(() => {
    const cartCount = cart.reduce((n, l) => n + l.qty, 0);
    const cartTotal = cart.reduce((sum, l) => sum + (PRODUCT_BY_ID.get(l.id)?.price ?? 0) * l.qty, 0);
    return {
      cart,
      cartCount,
      cartTotal,
      addToCart,
      addManyToCart,
      setQty,
      removeFromCart,
      clearCart,
      favorites,
      isFavorite: (id) => favorites.includes(id),
      toggleFavorite,
      recentSearches,
      pushRecentSearch,
      removeRecentSearch,
      searchOpen,
      setSearchOpen,
      cartOpen,
      setCartOpen,
      quickView,
      setQuickView,
      toast,
      notify,
      dismissToast,
      holdToast,
      releaseToast,
    };
  }, [
    cart,
    favorites,
    recentSearches,
    searchOpen,
    cartOpen,
    quickView,
    toast,
    addToCart,
    addManyToCart,
    setQty,
    removeFromCart,
    clearCart,
    toggleFavorite,
    pushRecentSearch,
    removeRecentSearch,
    notify,
    dismissToast,
    holdToast,
    releaseToast,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside <ShopProvider>');
  return ctx;
}
