import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
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

      {/* Global Toast Notification */}
      {notification && (
        <div style={{ maxWidth: '1160px', margin: '0.75rem auto 0 auto', padding: '0 1rem', width: '100%' }}>
          <div className={`alert alert-${notification.type === 'error' ? 'danger' : notification.type === 'success' ? 'success' : 'info'}`}>
            {notification.message}
          </div>
        </div>
      )}

      {/* Quick Demo Workflow Guidance Banner */}
      <div style={{ backgroundColor: '#fffdf5', borderBottom: '1px solid #ebd99f', padding: '0.45rem 1rem', fontSize: '0.8rem', color: '#785b12' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>Interactive Verification Mode:</strong> You are logged in as <strong>{currentUser ? currentUser.name : ''}</strong> in <strong>{currentCommunity ? currentCommunity.name : ''}</strong>. Use the selectors above to switch between owner and borrower roles to verify end-to-end workflows.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8c6b16' }}>
            All operations persist deterministically to backend database
          </div>
        </div>
      </div>

      <main className="main-content">
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
