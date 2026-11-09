import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ZenGlanceModal from './components/ZenGlanceModal';

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
  const { currentTab, notification, currentUser, currentCommunity } = useApp();

  return (
    <div className="app-wrapper">
      <Header />

      {/* Global Floating Toast Notification */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 9999,
            maxWidth: '440px',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <div
            className={`alert alert-${notification.type === 'error' ? 'danger' : notification.type === 'success' ? 'success' : 'info'}`}
            style={{ margin: 0, padding: '0.85rem 1.25rem' }}
          >
            <span style={{ fontSize: '1.1rem' }}>
              {notification.type === 'error' ? '⚠️' : notification.type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <span style={{ fontWeight: 500 }}>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Quick Demo Workflow Guidance Subbar */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid var(--color-border)',
          padding: '0.35rem 1.25rem',
          fontSize: '0.785rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-brand)',
              }}
            ></span>
            <span>
              Active Member: <strong>{currentUser ? currentUser.name : ''}</strong> &bull; Community Scope: <strong>{currentCommunity ? currentCommunity.name : ''}</strong>
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Switch accounts above to test owner approvals, handover inspections & returns
          </div>
        </div>
      </div>

      <main className="main-content">
        {currentTab === 'home' && <Home />}
        {currentTab === 'browse' && <BrowseItems />}
        {currentTab === 'detail' && <ItemDetail />}
        {currentTab === 'create' && <CreateEditItem />}
        {currentTab === 'requests' && <RequestsManagement />}
        {currentTab === 'demands' && <UnmetDemandPage />}
        {currentTab === 'history' && <BorrowingHistory />}
        {currentTab === 'dashboard' && <DashboardPage />}
        {currentTab === 'terms' && <TermsPage />}
        {currentTab === 'privacy' && <PrivacyPage />}
      </main>

      <ZenGlanceModal />
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
