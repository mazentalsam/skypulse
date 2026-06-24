import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../App';

vi.mock('../api/client', () => {
  const mockWeatherResponse = {
    data: {
      location: { lat: 48.8566, lon: 2.3522, city: 'Paris', country: 'FR', display_name: 'Paris, France' },
      weather: {
        main: { temp: 22.5, feels_like: 21.8, humidity: 58, temp_min: 19, temp_max: 25, pressure: 1015 },
        weather: [{ id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
        wind: { speed: 4.6, deg: 220 },
        visibility: 10000,
        sys: { sunrise: 1718678400, sunset: 1718735400 },
        timezone: 7200,
      },
      air_quality: { list: [{ main: { aqi: 2 }, components: {} }] },
      uv_index: 5,
      triggered_alerts: [],
    },
    error: null,
    headers: {},
  };

  const emptySuccess = { data: null, error: null, headers: {} };

  return {
    fetchCurrentWeather: vi.fn().mockResolvedValue(mockWeatherResponse),
    fetchForecast: vi.fn().mockResolvedValue({ data: { list: [] }, error: null }),
    fetchHourly: vi.fn().mockResolvedValue(emptySuccess),
    fetchHistorical: vi.fn().mockResolvedValue(emptySuccess),
    fetchAIBriefing: vi.fn().mockResolvedValue(emptySuccess),
    fetchOutfitRecommendation: vi.fn().mockResolvedValue(emptySuccess),
    fetchSmartAlerts: vi.fn().mockResolvedValue(emptySuccess),
    fetchMoodScore: vi.fn().mockResolvedValue(emptySuccess),
    getSavedSearches: vi.fn().mockResolvedValue({ data: [], error: null }),
    getAlerts: vi.fn().mockResolvedValue({ data: [], error: null }),
    fetchDashboardStats: vi.fn().mockResolvedValue({ data: null, error: null }),
    createSearch: vi.fn().mockResolvedValue({ data: { id: 1, city: 'Paris' }, error: null }),
    updateSearch: vi.fn(),
    deleteSearch: vi.fn(),
    createAlert: vi.fn(),
    deleteAlert: vi.fn(),
    fetchYouTubeVideos: vi.fn().mockResolvedValue(emptySuccess),
    fetchHealth: vi.fn().mockResolvedValue(emptySuccess),
    createDateRangeSearch: vi.fn(),
    fetchComparison: vi.fn(),
    fetchAIComparison: vi.fn(),
    fetchWeatherDiff: vi.fn(),
    fetchPlanWeek: vi.fn(),
    fetchNaturalSearch: vi.fn(),
    fetchTripAdvice: vi.fn(),
    getExportUrl: vi.fn((id, fmt) => `/api/export/${id}?format=${fmt}`),
    getExportAllUrl: vi.fn((fmt) => `/api/export/all?format=${fmt}`),
  };
});

describe('Search flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hero search bar on initial load', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/search a city/i)).toBeInTheDocument();
  });

  it('searches for a city and displays weather results', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText(/search a city/i);
    await user.type(input, 'Paris');

    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    const { fetchCurrentWeather } = await import('../api/client');
    expect(fetchCurrentWeather).toHaveBeenCalledWith('Paris');

    await waitFor(() => {
      expect(screen.getByText('22')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/scattered clouds/i)).toBeInTheDocument();
    });
  });

  it('shows quick-search city buttons that trigger search', async () => {
    const user = userEvent.setup();
    render(<App />);

    const parisButton = screen.getByRole('button', { name: 'Paris' });
    await user.click(parisButton);

    const { fetchCurrentWeather } = await import('../api/client');
    expect(fetchCurrentWeather).toHaveBeenCalledWith('Paris');
  });

  it('displays error message when search fails', async () => {
    const { fetchCurrentWeather } = await import('../api/client');
    fetchCurrentWeather.mockResolvedValueOnce({
      data: null,
      error: 'Location not found: xyznonexistent',
      headers: null,
    });

    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText(/search a city/i);
    await user.type(input, 'xyznonexistent');

    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/location not found/i)).toBeInTheDocument();
    });
  });
});
