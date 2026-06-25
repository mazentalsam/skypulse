import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import * as api from '../api/client';
import type { Location, WeatherData, ForecastData, ForecastItem, HistoricalData, MoodScore, OutfitRecommendation, SmartAlert } from '../types/weather';

interface WeatherState {
  location: Location | null;
  weather: WeatherData | null;
  forecast: ForecastData | null;
  hourly: ForecastItem[] | null;
  historical: HistoricalData | null;
  aiBriefing: string | null;
  outfit: OutfitRecommendation | null;
  smartAlerts: SmartAlert[] | null;
  mood: MoodScore | null;
  loading: boolean;
  aiLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_LOADING' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_WEATHER'; payload: Partial<WeatherState> }
  | { type: 'SET_AI_LOADING'; payload: boolean }
  | { type: 'SET_AI'; key: keyof WeatherState; payload: unknown }
  | { type: 'CLEAR' };

interface WeatherContextValue extends WeatherState {
  searchWeather: (query: string) => Promise<void>;
  clearWeather: () => void;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

const initialState: WeatherState = {
  location: null,
  weather: null,
  forecast: null,
  hourly: null,
  historical: null,
  aiBriefing: null,
  outfit: null,
  smartAlerts: null,
  mood: null,
  loading: false,
  aiLoading: false,
  error: null,
};

function reducer(state: WeatherState, action: Action): WeatherState {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: true, error: null };
    case 'SET_ERROR': return { ...state, loading: false, error: action.payload };
    case 'SET_WEATHER': return { ...state, loading: false, ...action.payload };
    case 'SET_AI_LOADING': return { ...state, aiLoading: action.payload };
    case 'SET_AI': return { ...state, [action.key]: action.payload };
    case 'CLEAR': return { ...initialState };
    default: return state;
  }
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const searchWeather = useCallback(async (query: string) => {
    dispatch({ type: 'SET_LOADING' });

    const { data, error } = await api.fetchCurrentWeather(query);
    if (error || !data) {
      dispatch({ type: 'SET_ERROR', payload: error || 'Unknown error' });
      return;
    }

    const { location, weather, air_quality, uv_index, triggered_alerts } = data;

    dispatch({
      type: 'SET_WEATHER',
      payload: { location, weather: { ...weather, air_quality: air_quality ?? undefined, uv_index, triggered_alerts } },
    });

    const lat = location.lat;
    const lon = location.lon;
    const cityName = location.city || query;

    const [forecastRes, hourlyRes, historicalRes] = await Promise.all([
      api.fetchForecast(lat, lon),
      api.fetchHourly(lat, lon),
      api.fetchHistorical(lat, lon),
    ]);

    if (forecastRes.data) dispatch({ type: 'SET_AI', key: 'forecast', payload: forecastRes.data });
    if (hourlyRes.data) dispatch({ type: 'SET_AI', key: 'hourly', payload: hourlyRes.data });
    if (historicalRes.data) dispatch({ type: 'SET_AI', key: 'historical', payload: historicalRes.data });

    dispatch({ type: 'SET_AI_LOADING', payload: true });

    let briefingText = '';
    api.streamAIBriefing(
      weather, cityName, 'en',
      (chunk) => { briefingText += chunk; dispatch({ type: 'SET_AI', key: 'aiBriefing', payload: briefingText }); },
      () => {},
    );

    Promise.all([
      api.fetchOutfitRecommendation(weather),
      api.fetchMoodScore(weather),
      forecastRes.data ? api.fetchSmartAlerts(forecastRes.data) : Promise.resolve({ data: null, error: null, headers: null }),
    ]).then(([outfitRes, moodRes, alertsRes]) => {
      if (outfitRes.data) dispatch({ type: 'SET_AI', key: 'outfit', payload: outfitRes.data });
      if (moodRes.data) dispatch({ type: 'SET_AI', key: 'mood', payload: moodRes.data });
      if (alertsRes.data) dispatch({ type: 'SET_AI', key: 'smartAlerts', payload: alertsRes.data.alerts });
      dispatch({ type: 'SET_AI_LOADING', payload: false });
    }).catch(() => {
      dispatch({ type: 'SET_AI_LOADING', payload: false });
    });
  }, []);

  const clearWeather = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  return (
    <WeatherContext.Provider value={{ ...state, searchWeather, clearWeather }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
}
