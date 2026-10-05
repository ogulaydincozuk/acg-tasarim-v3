import { useEffect } from 'react';
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { AccountProvider } from './context/AccountContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SearchOverlay } from './components/search/SearchOverlay';
import { CartDrawer } from './components/cart/CartDrawer';
import { Toast } from './components/cart/Toast';
import { QuickView } from './components/product/QuickView';
import { HomePage } from './pages/HomePage';
import { ListingPage } from './pages/ListingPage';
import { ProductPage } from './pages/ProductPage';
import { FavoritesPage, InfoPage } from './pages/SimplePages';
import { AccountPage } from './pages/AccountPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderPage } from './pages/OrderPage';
import { NotFoundPage } from './pages/NotFoundPage';

/** Sayfa değişiminde en üste, hash varsa ilgili bölüme kaydır. Filtre/sıralama (search) değişimi sayfayı başa atmaz. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function Layout() {
  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        İçeriğe geç
      </a>
      <Header />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <Outlet />
      </main>
      <Footer />
      <SearchOverlay />
      <CartDrawer />
      <QuickView />
      <Toast />
    </>
  );
}

/*
 * HashRouter: önizleme her statik sunucuda (veya klasörden) yönlendirme ayarı
 * gerektirmeden çalışsın diye. Üretimde SEO için BrowserRouter + sunucu tarafı
 * render (ör. Next.js / Remix) önerilir; route yapısı aynı kalır.
 */
export default function App() {
  return (
    <HashRouter>
      <ShopProvider>
       <AccountProvider>
        <ScrollManager />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="kategori/:slug" element={<ListingPage mode="category" />} />
            <Route path="arama" element={<ListingPage mode="search" />} />
            <Route path="urun/:slug" element={<ProductPage />} />
            <Route path="favoriler" element={<FavoritesPage />} />
            <Route path="hesap" element={<AccountPage />} />
            <Route path="odeme" element={<CheckoutPage />} />
            <Route path="siparis/:no" element={<OrderPage />} />
            <Route path="sayfa/siparis-takibi" element={<Navigate to="/hesap" replace />} />
            <Route path="sayfa/:slug" element={<InfoPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
       </AccountProvider>
      </ShopProvider>
    </HashRouter>
  );
}
