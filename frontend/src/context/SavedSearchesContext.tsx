import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import * as api from '../api/client';
import type { SavedSearch, WeatherAlert, DashboardStats } from '../types/weather';

interface SavedSearchesContextValue {
  searches: SavedSearch[];
  alerts: WeatherAlert[];
  stats: DashboardStats | null;
  loading: boolean;
  saveSearch: (data: Record<string, unknown>) => Promise<{ data: SavedSearch | null; error: string | null }>;
  editSearch: (id: number, updates: Record<string, unknown>) => Promise<SavedSearch | null>;
  removeSearch: (id: number) => Promise<void>;
  saveAlert: (data: Record<string, unknown>) => Promise<{ data: WeatherAlert | null; error: string | null }>;
  removeAlert: (id: number) => Promise<void>;
  loadSearches: () => Promise<void>;
  loadAlerts: () => Promise<void>;
  loadStats: () => Promise<void>;
}

const SavedSearchesContext = createContext<SavedSearchesContextValue | null>(null);

export function SavedSearchesProvider({ children }: { children: ReactNode }) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
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

  const saveSearch = useCallback(async (searchData: Record<string, unknown>) => {
    setLoading(true);
    const { data, error } = await api.createSearch(searchData);
    setLoading(false);
    if (data) {
      setSearches(prev => [data, ...prev]);
      loadStats();
    }
    return { data, error };
  }, [loadStats]);

  const editSearch = useCallback(async (id: number, updates: Record<string, unknown>) => {
    const { data } = await api.updateSearch(id, updates);
    if (data) {
      setSearches(prev => prev.map(s => s.id === id ? data : s));
    }
    return data;
  }, []);

  const removeSearch = useCallback(async (id: number) => {
    await api.deleteSearch(id);
    setSearches(prev => prev.filter(s => s.id !== id));
    loadStats();
  }, [loadStats]);

  const saveAlert = useCallback(async (alertData: Record<string, unknown>) => {
    const { data, error } = await api.createAlert(alertData);
    if (data) setAlerts(prev => [data, ...prev]);
    return { data, error };
  }, []);

  const removeAlert = useCallback(async (id: number) => {
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

export function useSavedSearches(): SavedSearchesContextValue {
  const ctx = useContext(SavedSearchesContext);
  if (!ctx) throw new Error('useSavedSearches must be used within SavedSearchesProvider');
  return ctx;
}
