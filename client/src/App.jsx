import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ZenGlanceModal from './components/ZenGlanceModal';
import ProfileModal from './components/ProfileModal';
import AuthModal from './components/AuthModal';

// Pages
import Home from './pages/Home';
import BrowseItems from './pages/BrowseItems';
import ItemDetail from './pages/ItemDetail';
import CreateEditItem from './pages/CreateEditItem';
import RequestsManagement from './pages/RequestsManagement';
import UnmetDemandPage from './pages/UnmetDemandPage';
import BorrowingHistory from './pages/BorrowingHistory';
import DashboardPage from './pages/DashboardPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

function AppContent() {
  const {
    currentTab,
    notification,
    profileModalOpen,
    setProfileModalOpen,
    switchAccountModalOpen,
    setSwitchAccountModalOpen,
  } = useApp();

  return (
    <div className="app-wrapper">
      <Header />

      {/* Global Floating Toast Notification */}
      {notification && (
        <div
          onClick={() => setNotification(null)}
          title="Click to dismiss"
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 9999,
            maxWidth: '440px',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            cursor: 'pointer',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            className={`alert alert-${notification.type === 'error' ? 'danger' : notification.type === 'success' ? 'success' : 'info'}`}
            style={{ margin: 0, padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
          >
            <span style={{ fontSize: '1.05rem' }}>
              {notification.type === 'error' ? '⚠️' : notification.type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{notification.message}</span>
            <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '1.1rem', lineHeight: 1 }}>&times;</span>
          </div>
        </div>
      )}

      <main className="main-content">
        {currentTab === 'home' && <Home />}
        {currentTab === 'browse' && <BrowseItems />}
        {currentTab === 'detail' && <ItemDetail />}
        {currentTab === 'create' && <CreateEditItem />}
        {(currentTab === 'requests' || currentTab === 'loans') && <RequestsManagement />}
        {(currentTab === 'demands' || currentTab === 'unmet') && <UnmetDemandPage />}
        {currentTab === 'history' && <BorrowingHistory />}
        {currentTab === 'dashboard' && <DashboardPage />}
        {currentTab === 'terms' && <TermsPage />}
        {currentTab === 'privacy' && <PrivacyPage />}
      </main>

      <ZenGlanceModal />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <AuthModal isOpen={switchAccountModalOpen} onClose={() => setSwitchAccountModalOpen(false)} />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
