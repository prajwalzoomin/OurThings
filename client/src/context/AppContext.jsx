import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setApiContext, setApiLocation } from '../api/client';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // No account by default (Guest mode)
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [prefillItem, setPrefillItem] = useState(null);
  const [notification, setNotification] = useState(null);
  const [glanceItem, setGlanceItem] = useState(null);
  const [communityOnly, setCommunityOnly] = useState(false); // Default OFF: whole city visible
  const [searchQuery, setSearchQuery] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [switchAccountModalOpen, setSwitchAccountModalOpen] = useState(false);
  
  // Precise GPS location state
  const [userLocation, setUserLocation] = useState({
    latitude: 12.9345,
    longitude: 77.6912,
    locality: 'Bengaluru (Outer Ring Rd)',
    isGpsAccurate: false,
    loadingLocation: false,
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ourthings_theme') || 'dark';
  });
  const [loading, setLoading] = useState(true);

  const toggleCommunityOnly = () => {
    setCommunityOnly((prev) => {
      const next = !prev;
      setApiContext(currentUser?.id || null, next && currentCommunity ? currentCommunity.id : null);
      notify('info', next ? `Scope filtered to: ${currentCommunity?.name}` : 'Scope expanded to: Entire City (Bengaluru)');
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ourthings_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Request browser location permission & precise GPS coordinates
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      notify('info', 'Geolocation is not supported by your browser.');
      return;
    }
    setUserLocation((prev) => ({ ...prev, loadingLocation: true }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setApiLocation(lat, lng);

        let locName = 'Bengaluru';
        let fullAddr = '';
        try {
          const geo = await api.reverseGeocode(lat, lng);
          if (geo && geo.locality) {
            locName = geo.locality;
            if (geo.city && !locName.toLowerCase().includes(geo.city.toLowerCase())) {
              locName = `${geo.locality}, ${geo.city}`;
            }
          } else if (geo && geo.formattedAddress) {
            locName = geo.formattedAddress.split(',').slice(0, 2).join(',').trim();
          } else {
            locName = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          }
          if (geo && geo.formattedAddress) {
            fullAddr = geo.formattedAddress;
          }
        } catch {
          locName = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }

        setUserLocation({
          latitude: lat,
          longitude: lng,
          locality: locName,
          formattedAddress: fullAddr,
          isGpsAccurate: true,
          loadingLocation: false,
        });
        notify('success', `Precise location detected: ${locName}`);
      },
      (err) => {
        console.warn('Geolocation permission prompt dismissed or denied:', err.message);
        setUserLocation((prev) => ({ ...prev, loadingLocation: false }));
        setApiLocation(12.9345, 77.6912); // Reference center
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Initialize data (default guest mode, no auto-login)
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [usersData, commsData] = await Promise.all([
          api.getUsers(),
          api.getCommunities(),
        ]);

        setUsers(usersData || []);
        setCommunities(commsData || []);
        setCurrentUser(null); // No account by default

        let initialComm = null;
        if (commsData && commsData.length > 0) {
          initialComm = commsData[0];
        }
        setCurrentCommunity(initialComm);
        setApiContext(null, null); // Guest mode, city-wide

        // Request user's precise location on first arrival
        requestUserLocation();
      } catch (err) {
        console.error('Initialization error:', err);
        notify('error', 'Could not connect to backend server. Make sure Spring Boot is running.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr && curr.message === message ? null : curr));
    }, 6000);
  };

  const switchUser = (userId) => {
    const user = users.find((u) => u.id === Number(userId));
    if (user) {
      setCurrentUser(user);
      let comm = communities.find((c) => c.id === user.activeCommunityId);
      if (!comm && communities.length > 0) {
        comm = communities[0];
      }
      setCurrentCommunity(comm);
      setApiContext(user.id, communityOnly && comm ? comm.id : null);
      notify('success', `Signed in as: ${user.name}`);
    }
  };

  const signOut = () => {
    setCurrentUser(null);
    setApiContext(null, null);
    notify('info', 'Signed out. You are now browsing in Guest mode.');
  };

  const requireAuth = (actionCallback) => {
    if (currentUser) {
      actionCallback();
    } else {
      notify('info', 'Please sign in or select an account to perform this action.');
      setSwitchAccountModalOpen(true);
    }
  };

  const switchCommunity = async (communityId) => {
    const comm = communities.find((c) => c.id === Number(communityId));
    if (comm) {
      setCurrentCommunity(comm);
      if (currentUser) {
        try {
          await api.switchCommunity(comm.id);
          setCurrentUser((prev) => ({ ...prev, activeCommunityId: comm.id }));
          setApiContext(currentUser.id, communityOnly ? comm.id : null);
          notify('info', `Active community changed to: ${comm.name}`);
        } catch (err) {
          notify('error', err.message);
        }
      }
    }
  };

  const navigateTo = (tab, extra = {}) => {
    if (extra.itemId) {
      setSelectedItemId(extra.itemId);
    }
    if (extra.prefill) {
      setPrefillItem(extra.prefill);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openGlance = (item) => {
    setGlanceItem(item);
  };

  const closeGlance = () => {
    setGlanceItem(null);
  };

  return (
    <AppContext.Provider
      value={{
        users,
        communities,
        currentUser,
        setCurrentUser,
        signOut,
        requireAuth,
        currentCommunity,
        currentTab,
        selectedItemId,
        prefillItem,
        notification,
        glanceItem,
        theme,
        loading,
        communityOnly,
        toggleCommunityOnly,
        searchQuery,
        setSearchQuery,
        profileModalOpen,
        setProfileModalOpen,
        switchAccountModalOpen,
        setSwitchAccountModalOpen,
        userLocation,
        requestUserLocation,
        notify,
        toggleTheme,
        switchUser,
        switchCommunity,
        navigateTo,
        setSelectedItemId,
        setPrefillItem,
        openGlance,
        closeGlance,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
