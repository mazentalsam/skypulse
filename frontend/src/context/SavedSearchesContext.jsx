import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../api/client';

const SavedSearchesContext = createContext(null);

export function SavedSearchesProvider({ children }) {
  const [searches, setSearches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSearches = useCallback(async () => {
    const { data } = await api.getSavedSearches();
    if (data) setSearches(data);
  }, []);

  const loadAlerts = useCallback(async () => {
    const { data } = await api.getAlerts();
    if (data) setAlerts(data);
  }, []);

  const loadStats = useCallback(async () => {
    const { data } = await api.fetchDashboardStats();
    if (data) setStats(data);
  }, []);

  const saveSearch = useCallback(async (searchData) => {
    setLoading(true);
    const { data, error } = await api.createSearch(searchData);
    setLoading(false);
    if (data) {
      setSearches(prev => [data, ...prev]);
      loadStats();
    }
    return { data, error };
  }, [loadStats]);

  const editSearch = useCallback(async (id, updates) => {
    const { data } = await api.updateSearch(id, updates);
    if (data) {
      setSearches(prev => prev.map(s => s.id === id ? data : s));
    }
    return data;
  }, []);

  const removeSearch = useCallback(async (id) => {
    await api.deleteSearch(id);
    setSearches(prev => prev.filter(s => s.id !== id));
    loadStats();
  }, [loadStats]);

  const saveAlert = useCallback(async (alertData) => {
    const { data, error } = await api.createAlert(alertData);
    if (data) setAlerts(prev => [data, ...prev]);
    return { data, error };
  }, []);

  const removeAlert = useCallback(async (id) => {
    await api.deleteAlert(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  useEffect(() => {
    loadSearches();
    loadAlerts();
    loadStats();
  }, [loadSearches, loadAlerts, loadStats]);

  return (
    <SavedSearchesContext.Provider value={{
      searches, alerts, stats, loading,
      saveSearch, editSearch, removeSearch,
      saveAlert, removeAlert,
      loadSearches, loadAlerts, loadStats,
    }}>
      {children}
    </SavedSearchesContext.Provider>
  );
}

export function useSavedSearches() {
  const ctx = useContext(SavedSearchesContext);
  if (!ctx) throw new Error('useSavedSearches must be used within SavedSearchesProvider');
  return ctx;
}
