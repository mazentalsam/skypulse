import axios, { type Method } from 'axios';
import type {
  ApiResponse,
  CurrentWeatherResponse,
  ForecastData,
  ForecastItem,
  HistoricalData,
  SavedSearch,
  WeatherAlert,
  WeatherData,
  DashboardStats,
  MoodScore,
  OutfitRecommendation,
} from '../types/weather';

const api = axios.create({ baseURL: '/api' });

async function request<T>(method: Method, url: string, data: unknown = null, params: Record<string, unknown> | null = null): Promise<ApiResponse<T>> {
  try {
    const config: Record<string, unknown> = { method, url };
    if (data) config.data = data;
    if (params) config.params = params;
    const resp = await api(config);
    return { data: resp.data as T, error: null, headers: resp.headers as Record<string, string> };
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
    const message = axiosErr.response?.data?.error || axiosErr.message || 'Request failed';
    return { data: null, error: message, headers: null };
  }
}

export const fetchCurrentWeather = (q: string) => request<CurrentWeatherResponse>('get', '/weather/current', null, { q });
export const fetchForecast = (lat: number, lon: number) => request<ForecastData>('get', '/weather/forecast', null, { lat, lon });
export const fetchHourly = (lat: number, lon: number) => request<ForecastItem[]>('get', '/weather/hourly', null, { lat, lon });
export const fetchHistorical = (lat: number, lon: number) => request<HistoricalData>('get', '/weather/historical', null, { lat, lon });

export const fetchAIBriefing = (weatherData: WeatherData, locationName: string, language = 'en') =>
  request<{ briefing: string }>('post', '/ai/briefing', { weather_data: weatherData, location_name: locationName, language });
export const fetchTripAdvice = (destination: string, dates: string, weatherData: WeatherData) =>
  request<Record<string, unknown>>('post', '/ai/trip-advice', { destination, dates, weather_data: weatherData });
export const fetchOutfitRecommendation = (weatherData: WeatherData) =>
  request<OutfitRecommendation>('post', '/ai/outfit', { weather_data: weatherData });
export const fetchSmartAlerts = (forecastData: ForecastData) =>
  request<{ alerts: Array<{ type: string; severity: string; message: string }> }>('post', '/ai/alerts', { forecast_data: forecastData });
export const fetchNaturalSearch = (query: string) =>
  request<{ answer: string; location: unknown; parsed_query: unknown }>('post', '/ai/natural-search', { query });
export const fetchMoodScore = (weatherData: WeatherData) =>
  request<MoodScore>('post', '/ai/mood', { weather_data: weatherData });

export const createSearch = (data: Record<string, unknown>) => request<SavedSearch>('post', '/searches', data);
export const getSavedSearches = () => request<SavedSearch[]>('get', '/searches');
export const updateSearch = (id: number, data: Record<string, unknown>) => request<SavedSearch>('put', `/searches/${id}`, data);
export const deleteSearch = (id: number) => request<{ message: string }>('delete', `/searches/${id}`);

export const createAlert = (data: Record<string, unknown>) => request<WeatherAlert>('post', '/alerts', data);
export const getAlerts = () => request<WeatherAlert[]>('get', '/alerts');
export const updateAlert = (id: number, data: Record<string, unknown>) => request<WeatherAlert>('put', `/alerts/${id}`, data);
export const deleteAlert = (id: number) => request<{ message: string }>('delete', `/alerts/${id}`);

export const fetchYouTubeVideos = (location: string) => request<Record<string, unknown>>('get', '/youtube/videos', null, { location });
export const fetchDashboardStats = () => request<DashboardStats>('get', '/dashboard/stats');
export const fetchHealth = () => request<Record<string, unknown>>('get', '/health');

export const createDateRangeSearch = (location: string, dateFrom: string, dateTo: string) =>
  request<SavedSearch>('post', '/searches/date-range', { location, date_from: dateFrom, date_to: dateTo });
export const fetchComparison = (city1: string, city2: string) => request<Record<string, unknown>>('get', '/weather/compare', null, { city1, city2 });
export const fetchAIComparison = (city1Data: unknown, city2Data: unknown) =>
  request<{ insight: string }>('post', '/ai/compare', { city1: city1Data, city2: city2Data });
export const fetchWeatherDiff = (searchId: number) => request<Record<string, unknown>>('get', `/weather/diff/${searchId}`);
export const fetchPlanWeek = (schedule: unknown, forecastData: unknown, locationName: string) =>
  request<{ plans: unknown[] }>('post', '/ai/plan-week', { schedule, forecast_data: forecastData, location_name: locationName });

export function getExportUrl(id: number, format: string): string {
  return `/api/export/${id}?format=${format}`;
}
export function getExportAllUrl(format: string): string {
  return `/api/export/all?format=${format}`;
}
