import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/layout/Layout';
import { Preloader } from './components/ui/Preloader';
import { useAssetPreloader } from './hooks/useAssetPreloader';
import { HERO_IMAGE, ATELIER_IMAGE, FABRIC_IMAGE } from './data/site';
import { PRODUCTS } from './data/products';
import { GALLERY_ITEMS } from './data/gallery';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Story } from './pages/Story';
import { Gallery } from './pages/Gallery';
import { Bespoke } from './pages/Bespoke';
import { Contact } from './pages/Contact';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { TrackOrder } from './pages/TrackOrder';
import { Account } from './pages/Account';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { ResetPassword } from './pages/ResetPassword';
import { NotFound } from './pages/NotFound';
import { AdminGuard } from './admin/AdminGuard';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminOrders } from './admin/pages/AdminOrders';
import { AdminProducts } from './admin/pages/AdminProducts';
import { AdminEnquiries } from './admin/pages/AdminEnquiries';

// Every image the storefront can show on first paint — hero, atelier and
// fabric shots plus every product and gallery photo. Defined once at module
// scope so the list passed to the preloader never changes across renders.
const PRELOAD_IMAGES = Array.from(
  new Set([
  HERO_IMAGE,
  ATELIER_IMAGE,
  FABRIC_IMAGE,
  ...PRODUCTS.flatMap((product) => product.images),
  ...GALLERY_ITEMS.filter((item) => item.type === 'image').map((item) => item.src)]
  )
);

// The splash preloader is a storefront touch — skip it in the admin dashboard.
const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

export function App() {
  const { progress, done } = useAssetPreloader(isAdminRoute ? [] : PRELOAD_IMAGES);
  const [showPreloader, setShowPreloader] = useState(!isAdminRoute);

  useEffect(() => {
    if (!done) return;
    // Keep the overlay mounted through its fade-out transition, then drop it.
    const timeout = window.setTimeout(() => setShowPreloader(false), 700);
    return () => window.clearTimeout(timeout);
  }, [done]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {showPreloader && <Preloader progress={progress} hide={done} />}
              <BrowserRouter>
                <Routes>
                  {/* Admin dashboard — separate shell, no storefront nav/footer/cart */}
                  <Route path="admin/login" element={<AdminLogin />} />
                  <Route
                    path="admin"
                    element={
                    <AdminGuard>
                        <AdminLayout />
                      </AdminGuard>
                    }>
                    
                    <Route index element={<Navigate to="orders" replace />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="enquiries" element={<AdminEnquiries />} />
                    <Route path="*" element={<Navigate to="orders" replace />} />
                  </Route>

                  {/* Storefront */}
                  <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="shop" element={<Shop />} />
                    <Route path="shop/:slug" element={<ProductDetail />} />
                    <Route path="story" element={<Story />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="bespoke" element={<Bespoke />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="order/:reference" element={<OrderSuccess />} />
                    <Route path="track-order" element={<TrackOrder />} />
                    <Route path="account" element={<Account />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="terms-conditions" element={<TermsConditions />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>);

}