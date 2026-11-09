import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import ItemCard from '../components/ItemCard';

const CATEGORIES = [
  {
    name: 'Healthcare & Mobility',
    desc: 'Wheelchairs, walkers, crutches, BP monitors',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
        <path d="M12 5v14"></path>
      </svg>
    ),
  },
  {
    name: 'Tools & Hardware',
    desc: 'Drills, ladders, toolkits, measuring tools',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14.7 6.3 3.6 3.6"></path>
        <path d="M18.8 4.2a2.8 2.8 0 0 0-4 0l-9.1 9.1a2 2 0 0 0-.5 1l-1 4.5 4.5-1a2 2 0 0 0 1-.5l9.1-9.1a2.8 2.8 0 0 0 0-4Z"></path>
      </svg>
    ),
  },
  {
    name: 'Electronics',
    desc: 'Projectors, display cords, adapters',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="3" rx="2"></rect>
        <line x1="8" x2="16" y1="21" y2="21"></line>
        <line x1="12" x2="12" y1="17" y2="21"></line>
      </svg>
    ),
  },
  {
    name: 'Travel Gear',
    desc: 'Suitcases, 65L rucksacks, camping gear',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="20" x="4" y="2" rx="2"></rect>
        <path d="M9 22v-4h6v4"></path>
        <path d="M8 2v2"></path>
        <path d="M16 2v2"></path>
      </svg>
    ),
  },
  {
    name: 'Event Equipment',
    desc: 'PA speakers, microphones, presentation kit',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" x2="12" y1="19" y2="22"></line>
      </svg>
    ),
  },
];

export default function Home() {
  const { currentCommunity, navigateTo } = useApp();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      if (!currentCommunity) return;
      try {
        setLoading(true);
        const [itemsData, dashboardData] = await Promise.all([
          api.getItems(),
          api.getDashboard(),
        ]);
        setFeaturedItems(itemsData ? itemsData.slice(0, 6) : []);
        setStats(dashboardData);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, [currentCommunity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigateTo('browse', { keyword: searchKeyword });
  };

  const handleCategoryClick = (catName) => {
    navigateTo('browse', { category: catName });
  };

  return (
    <div>
      {/* Impressive Minimalist Hero Banner */}
      <section className="hero-container">
        <div className="hero-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          Verified Community Lending Platform
        </div>

        <h1 className="hero-title">
          Borrow what you need. <br />
          <span>Share what you have.</span>
        </h1>

        <p className="hero-lead">
          Why purchase expensive tools, crutches, or projectors for one-time use? Access resources directly from verified members in <strong>{currentCommunity ? currentCommunity.name : 'your neighbourhood'}</strong> with scheduled bookings and condition logs.
        </p>

        {/* Quick Search Input */}
        <form onSubmit={handleSearchSubmit} className="hero-search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="hero-search-input"
            placeholder="Search items by name (e.g. drill, wheelchair, projector, suitcase)..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Find Resource
          </button>
        </form>

        {/* Hero Quick Stats */}
        {stats && (
          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="hero-stat-val">{stats.totalItems}</span>
              <span className="hero-stat-label">Resources Available</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-val">{stats.fulfilledRequests}</span>
              <span className="hero-stat-label">Fulfilled Loans</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-val">
                {stats.avoidedExpenditureEstimateInr ? `Rs ${Number(stats.avoidedExpenditureEstimateInr).toLocaleString('en-IN')}` : 'Rs 0'}
              </span>
              <span className="hero-stat-label">Avoided Expenditure (Est.)</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-val">{stats.openDemands}</span>
              <span className="hero-stat-label">Unmet Community Needs</span>
            </div>
          </div>
        )}
      </section>

      {/* Resource Categories Grid */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Browse by Category</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
              Explore available inventory organized by practical use cases
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigateTo('browse')}
          >
            View All Items &rarr;
          </button>
        </div>

        <div className="category-cards-grid">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              className="category-card"
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div className="category-icon-wrapper">
                {cat.icon}
              </div>
              <div className="category-name">{cat.name}</div>
              <div className="category-count">{cat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Resources Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Available Resources in Community</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
              Recently listed resources ready for scheduled borrowing
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigateTo('browse')}
          >
            Explore Directory ({stats ? stats.totalItems : 'All'}) &rarr;
          </button>
        </div>

        {loading ? (
          <div className="state-message">
            <p>Loading community resources...</p>
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="state-message">
            <p>No resources currently listed in this community.</p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: '0.75rem' }}
              onClick={() => navigateTo('create')}
            >
              Be the first to list an item!
            </button>
          </div>
        ) : (
          <div className="ecom-grid">
            {featuredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Community Demand Spotlight Callout */}
      <section style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ maxWidth: '640px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Demand Aggregation Board
          </span>
          <h2 style={{ fontSize: '1.35rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
            Neighbours are requesting items not currently shared
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', margin: 0 }}>
            Members frequently request recovery wheelchairs, soldering stations, or power tools. Check the community wishlist or post what you need.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigateTo('demands')}
          >
            View Needed Items
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigateTo('create')}
          >
            + List an Item to Help
          </button>
        </div>
      </section>
    </div>
  );
}

