import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setApiContext } from '../api/client';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCommunity, setCurrentCommunity] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [prefillItem, setPrefillItem] = useState(null);
  const [notification, setNotification] = useState(null);
  const [glanceItem, setGlanceItem] = useState(null);
  const [communityOnly, setCommunityOnly] = useState(false); // Veg-only style toggle (default OFF: whole city visible!)
  const [searchQuery, setSearchQuery] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [aiKeyModalOpen, setAiKeyModalOpen] = useState(false);
  const [switchAccountModalOpen, setSwitchAccountModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ourthings_theme') || 'dark';
  });
  const [loading, setLoading] = useState(true);

  const toggleCommunityOnly = () => {
    setCommunityOnly((prev) => {
      const next = !prev;
      setApiContext(currentUser?.id, next && currentCommunity ? currentCommunity.id : null);
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

  // Initialize data
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

        const initialUser = usersData && usersData.length > 0 ? usersData[0] : null;
        setCurrentUser(initialUser);

        let initialComm = null;
        if (initialUser && initialUser.activeCommunityId) {
          initialComm = (commsData || []).find((c) => c.id === initialUser.activeCommunityId);
        }
        if (!initialComm && commsData && commsData.length > 0) {
          initialComm = commsData[0];
        }
        setCurrentCommunity(initialComm);

        if (initialUser) {
          setApiContext(initialUser.id, null); // Default city-wide, optional toggle enables community scope
        }
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
      notify('info', `Active user switched to: ${user.name}`);
    }
  };

  const switchCommunity = async (communityId) => {
    const comm = communities.find((c) => c.id === Number(communityId));
    if (comm && currentUser) {
      try {
        await api.switchCommunity(comm.id);
        setCurrentCommunity(comm);
        setCurrentUser((prev) => ({ ...prev, activeCommunityId: comm.id }));
        setApiContext(currentUser.id, comm.id);
        notify('info', `Active community changed to: ${comm.name}`);
      } catch (err) {
        notify('error', err.message);
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
        aiKeyModalOpen,
        setAiKeyModalOpen,
        switchAccountModalOpen,
        setSwitchAccountModalOpen,
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

