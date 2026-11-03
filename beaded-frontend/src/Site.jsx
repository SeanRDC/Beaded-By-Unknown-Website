import '@fontsource-variable/jost';
import './styles/site.css';
import './styles/home.css';
import './styles/pages.css';

import { lazy, Suspense, useLayoutEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { BagDrawer } from './components/BagDrawer.jsx';
import { CheckoutBar, CookieBanner, PageLoading, PageTransition, ScrollManager, ShowcaseNotice, Toast } from './components/Chrome.jsx';
import { Footer } from './components/Footer.jsx';
import { FloatingBar, Header } from './components/Header.jsx';
import { LoginDialog } from './components/LoginDialog.jsx';
import { MobileMenu } from './components/MobileMenu.jsx';
import { QuickView } from './components/ProductCard.jsx';
import { SearchOverlay } from './components/SearchOverlay.jsx';
import Home from './pages/Home.jsx';
import { AuthProvider } from './store/auth.jsx';
import { CartProvider } from './store/cart.jsx';
import { ShopProvider } from './store/shop.jsx';
import { UiProvider } from './store/ui.jsx';

const Account = lazy(() => import('./pages/Account.jsx'));
const Builder = lazy(() => import('./pages/Builder.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Confirmed = lazy(() => import('./pages/Confirmed.jsx'));
const Faq = lazy(() => import('./pages/Faq.jsx'));
const Journal = lazy(() => import('./pages/Journal.jsx'));
const JournalPost = lazy(() => import('./pages/JournalPost.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Product = lazy(() => import('./pages/Product.jsx'));
const Shipping = lazy(() => import('./pages/Shipping.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const SizeGuide = lazy(() => import('./pages/SizeGuide.jsx'));
const Story = lazy(() => import('./pages/Story.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));

function Layout() {
  const { pathname } = useLocation();
  const inCheckout = pathname.startsWith('/checkout');

  useLayoutEffect(() => {
    document.documentElement.dataset.surface = 'site';
    return () => delete document.documentElement.dataset.surface;
  }, []);

  return (
    <div className="site">
      <a className="skip" href="#main">Skip to content</a>
      <ScrollManager />
      {inCheckout ? <CheckoutBar /> : <Header />}
      {!inCheckout && <FloatingBar />}
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      {!inCheckout && <Footer key={pathname} />}
      <BagDrawer />
      <MobileMenu />
      <SearchOverlay />
      <LoginDialog />
      <QuickView />
      <Toast />
      <ShowcaseNotice />
      <CookieBanner />
      <PageTransition />
    </div>
  );
}

export default function Site() {
  return (
    <UiProvider>
      <CartProvider>
        <AuthProvider>
          <ShopProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="shop/:slug" element={<Product />} />
                <Route path="custom" element={<Builder />} />
                <Route path="story" element={<Story />} />
                <Route path="journal" element={<Journal />} />
                <Route path="journal/:slug" element={<JournalPost />} />
                <Route path="faq" element={<Faq />} />
                <Route path="size-guide" element={<SizeGuide />} />
                <Route path="shipping" element={<Shipping />} />
                <Route path="terms" element={<Terms />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="account" element={<Account />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="checkout/confirmed" element={<Confirmed />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </ShopProvider>
        </AuthProvider>
      </CartProvider>
    </UiProvider>
  );
}
