import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Context Provider
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';

// Pages
import Home from './pages/Home';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Gallery from './pages/Gallery';
import ContactUs from './pages/ContactUs';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import Login from './components/Login';
import Checkout from './pages/Checkout'; // Fixed import path here
import Settings from './pages/Settings';

// Admin dashboard (separate /admin section, separate admin_token auth - see admin/context/AdminAuthContext)
import AdminLogin from './admin/pages/AdminLogin';
import RequireAdminAuth from './admin/components/RequireAdminAuth';
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import HeroSectionAdmin from './admin/pages/HeroSectionAdmin';
import CategoriesAdmin from './admin/pages/CategoriesAdmin';
import BrandsAdmin from './admin/pages/BrandsAdmin';
import ProductsAdmin from './admin/pages/ProductsAdmin';
import BannersAdmin from './admin/pages/BannersAdmin';
import GalleryAdmin from './admin/pages/GalleryAdmin';
import ContactMessagesAdmin from './admin/pages/ContactMessagesAdmin';
import OrdersAdmin from './admin/pages/OrdersAdmin';

// Guards routes that require a logged-in customer (matches backend auth:user routes,
// e.g. POST /orders and GET /my-orders both need a valid customer Bearer token)
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // wait for the initial /me check to finish before deciding

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Storefront: everything the customer sees, wrapped in Navbar/Footer. Mounted at "/*".
function StorefrontRoutes() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans bg-white text-black">
      <div>
        {/* Global Navigation Bar (Includes Top Banner) */}
        <Navbar />

        {/* Page Routing */}
        <Routes>
          <Route index element={<Home />} />
          <Route path="categories" element={<Categories />} />
          <Route path="brands" element={<Brands />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="cart" element={<Cart />} />
          <Route
            path="profile"
            element={
              <RequireAuth>
                <Profile onLogout={logout} />
              </RequireAuth>
            }
          />
          <Route path="signup" element={<SignUp />} />
          <Route path="login" element={<Login />} />
          {/* Settings (language switch) is open to guests too - it's a site preference, not account data */}
          <Route path="settings" element={<Settings />} />
          <Route
            path="checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<div className="p-12 text-center text-lg font-bold">404 - Page Not Found</div>} />
        </Routes>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

// Admin dashboard: no storefront Navbar/Footer - has its own sidebar layout (AdminLayout).
// Mounted at "/admin/*". /admin/login is public; everything else requires an admin_token.
function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        element={
          <RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="hero" element={<HeroSectionAdmin />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route path="brands" element={<BrandsAdmin />} />
        <Route path="products" element={<ProductsAdmin />} />
        <Route path="banners" element={<BannersAdmin />} />
        <Route path="gallery" element={<GalleryAdmin />} />
        <Route path="messages" element={<ContactMessagesAdmin />} />
        <Route path="orders" element={<OrdersAdmin />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <AdminAuthProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="/*" element={<StorefrontRoutes />} />
            </Routes>
          </AdminAuthProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;