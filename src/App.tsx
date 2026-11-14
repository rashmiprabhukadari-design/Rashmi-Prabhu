import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/layout/Header';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { Footer } from './components/layout/Footer';
import { AIStylistWidget } from './components/layout/AIStylistWidget';
import { ToastContainer } from './components/common/ToastContainer';

const HomePage = lazy(() => import('./pages/HomePage'));
const ListingPage = lazy(() => import('./pages/ListingPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const BagPage = lazy(() => import('./pages/BagPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const AccountOverviewPage = lazy(() => import('./pages/account/AccountOverviewPage'));
const AccountOrdersPage = lazy(() => import('./pages/account/AccountOrdersPage'));
const AccountOrderDetailPage = lazy(() => import('./pages/account/AccountOrderDetailPage'));
const AccountAddressesPage = lazy(() => import('./pages/account/AccountAddressesPage'));
const AccountProfilePage = lazy(() => import('./pages/account/AccountProfilePage'));
const AccountRewardsPage = lazy(() => import('./pages/account/AccountRewardsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="sk-container px-4 md:px-10 py-12 space-y-6 animate-pulse">
      <div className="h-64 rounded bg-[#F5F5F6]" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="aspect-[3/4] rounded bg-[#F5F5F6]" />
        <div className="aspect-[3/4] rounded bg-[#F5F5F6]" />
        <div className="aspect-[3/4] rounded bg-[#F5F5F6]" />
        <div className="aspect-[3/4] rounded bg-[#F5F5F6]" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-white text-[#282C3F]">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/bag" element={<BagPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                <Route path="/login" element={<LoginPage />} />

                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AccountOverviewPage />} />
                  <Route path="orders" element={<AccountOrdersPage />} />
                  <Route path="orders/:id" element={<AccountOrderDetailPage />} />
                  <Route path="addresses" element={<AccountAddressesPage />} />
                  <Route path="profile" element={<AccountProfilePage />} />
                  <Route path="rewards" element={<AccountRewardsPage />} />
                </Route>

                <Route path="/admin" element={<AdminPage />} />
                <Route path="/:gender/:category" element={<ListingPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <MobileTabBar />
          <AIStylistWidget />
          <ToastContainer />
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
