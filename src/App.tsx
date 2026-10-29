import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomizationModal } from './components/CustomizationModal';
import { AuthModal } from './components/AuthModal';
import { ReceiptModal } from './components/ReceiptModal';
import { NotificationToast } from './components/NotificationToast';

import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OffersPage } from './pages/OffersPage';
import { AdminDashboard } from './pages/AdminDashboard';

function MainContent() {
  const { currentPage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
      <Navbar />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'menu' && <MenuPage />}
        {currentPage === 'cart' && <CartPage />}
        {currentPage === 'checkout' && <CheckoutPage />}
        {currentPage === 'confirmation' && <OrderConfirmationPage />}
        {currentPage === 'tracking' && <OrderTrackingPage />}
        {currentPage === 'my-orders' && <MyOrdersPage />}
        {currentPage === 'offers' && <OffersPage />}
        {currentPage === 'admin' && <AdminDashboard />}
      </main>

      <Footer />

      {/* Global Interactive Modals & Realtime Overlays */}
      <CustomizationModal />
      <AuthModal />
      <ReceiptModal />
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
