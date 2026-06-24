import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

async function request(method, url, data = null, params = null) {
  try {
    const config = { method, url };
    if (data) config.data = data;
    if (params) config.params = params;
    const resp = await api(config);
    return { data: resp.data, error: null, headers: resp.headers };
  } catch (err) {
    const message = err.response?.data?.error || err.message || 'Request failed';
    return { data: null, error: message, headers: null };
  }
}

export const fetchCurrentWeather = (q) => request('get', '/weather/current', null, { q });
export const fetchForecast = (lat, lon) => request('get', '/weather/forecast', null, { lat, lon });
export const fetchHourly = (lat, lon) => request('get', '/weather/hourly', null, { lat, lon });
export const fetchHistorical = (lat, lon) => request('get', '/weather/historical', null, { lat, lon });

export const fetchAIBriefing = (weatherData, locationName, language = 'en') =>
  request('post', '/ai/briefing', { weather_data: weatherData, location_name: locationName, language });
export const fetchTripAdvice = (destination, dates, weatherData) =>
  request('post', '/ai/trip-advice', { destination, dates, weather_data: weatherData });
export const fetchOutfitRecommendation = (weatherData) =>
  request('post', '/ai/outfit', { weather_data: weatherData });
export const fetchSmartAlerts = (forecastData) =>
  request('post', '/ai/alerts', { forecast_data: forecastData });
export const fetchNaturalSearch = (query) =>
  request('post', '/ai/natural-search', { query });
export const fetchMoodScore = (weatherData) =>
  request('post', '/ai/mood', { weather_data: weatherData });

export const createSearch = (data) => request('post', '/searches', data);
export const getSavedSearches = () => request('get', '/searches');
export const updateSearch = (id, data) => request('put', `/searches/${id}`, data);
export const deleteSearch = (id) => request('delete', `/searches/${id}`);

export const createAlert = (data) => request('post', '/alerts', data);
export const getAlerts = () => request('get', '/alerts');
export const updateAlert = (id, data) => request('put', `/alerts/${id}`, data);
export const deleteAlert = (id) => request('delete', `/alerts/${id}`);

export const fetchYouTubeVideos = (location) => request('get', '/youtube/videos', null, { location });
export const fetchDashboardStats = () => request('get', '/dashboard/stats');
export const fetchHealth = () => request('get', '/health');

export const createDateRangeSearch = (location, dateFrom, dateTo) =>
  request('post', '/searches/date-range', { location, date_from: dateFrom, date_to: dateTo });
export const fetchComparison = (city1, city2) => request('get', '/weather/compare', null, { city1, city2 });
export const fetchAIComparison = (city1Data, city2Data) =>
  request('post', '/ai/compare', { city1: city1Data, city2: city2Data });
export const fetchWeatherDiff = (searchId) => request('get', `/weather/diff/${searchId}`);
export const fetchPlanWeek = (schedule, forecastData, locationName) =>
  request('post', '/ai/plan-week', { schedule, forecast_data: forecastData, location_name: locationName });

export function getExportUrl(id, format) {
  return `/api/export/${id}?format=${format}`;
}
export function getExportAllUrl(format) {
  return `/api/export/all?format=${format}`;
}
