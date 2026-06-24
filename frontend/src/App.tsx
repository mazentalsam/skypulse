import { useState } from 'react';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { SavedSearchesProvider, useSavedSearches } from './context/SavedSearchesContext';
import { useWeatherTheme } from './hooks/useWeatherTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import BackgroundGradient from './components/layout/BackgroundGradient';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SearchBar from './components/search/SearchBar';
import CurrentWeatherCard from './components/weather/CurrentWeatherCard';
import ForecastRow from './components/weather/ForecastRow';
import HourlyChart from './components/weather/HourlyChart';
import HistoricalComparison from './components/weather/HistoricalComparison';
import WeatherMoodScore from './components/weather/WeatherMoodScore';
import SevereWeatherBadge from './components/weather/SevereWeatherBadge';
import CityComparison from './components/weather/CityComparison';
import ShareableCard from './components/weather/ShareableCard';
import WeatherDiff from './components/weather/WeatherDiff';
import AIWeatherNarrator from './components/ai/AIWeatherNarrator';
import AIOutfitRecommender from './components/ai/AIOutfitRecommender';
import SmartWeatherAlerts from './components/ai/SmartWeatherAlerts';
import AITripAdvisor from './components/ai/AITripAdvisor';
import PlanMyWeek from './components/ai/PlanMyWeek';
import NaturalLanguageSearch from './components/search/NaturalLanguageSearch';
import WeatherMapPanel from './components/map/WeatherMapPanel';
import SavedSearchesPanel from './components/saved/SavedSearchesPanel';
import DateRangeSearch from './components/saved/DateRangeSearch';
import LiveFeedTicker from './components/saved/LiveFeedTicker';
import AlertsPanel from './components/alerts/AlertsPanel';
import PersonalDashboard from './components/dashboard/PersonalDashboard';
import ActivityHeatmap from './components/dashboard/ActivityHeatmap';
import YouTubePanel from './components/youtube/YouTubePanel';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorMessage from './components/ui/ErrorMessage';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Toast from './components/ui/Toast';
import { getExportUrl, getExportAllUrl } from './api/client';

interface LabelProps {
  children: React.ReactNode;
  id?: string;
}

function Label({ children, id }: LabelProps) {
  return <h2 id={id} style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em', margin: '0 0 14px', fontFamily: 'var(--mono)' }}>{children}</h2>;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

function AppContent() {
  const { weather, location, loading, error, forecast, searchWeather } = useWeather();
  const { saveSearch, searches } = useSavedSearches();
  const [toast, setToast] = useState<ToastState | null>(null);

  useWeatherTheme(weather?.weather?.[0]?.icon);
  useKeyboardShortcuts();

  const handleSave = async () => {
    if (!weather || !location) return;
    const { data, error: err } = await saveSearch({
      city: location.city || 'Unknown', country: location.country || '',
      latitude: location.lat, longitude: location.lon,
      search_query: location.display_name || location.city,
      weather_data: weather, forecast_data: forecast || {},
    });
    if (data) setToast({ message: `Saved ${location.city}`, type: 'success' });
    else setToast({ message: err || 'Failed to save', type: 'error' });
  };

  const hasWeather = weather && location;
  const S = 40;
  const W: React.CSSProperties = { position: 'relative', zIndex: 1, maxWidth: 1320, margin: '0 auto', padding: '0 32px' };

  return (
    <>
      <Header />

      {!hasWeather && !loading && !error && <SearchBar showHero />}
      {(hasWeather || loading || error) && <div style={{ paddingTop: 80 }}><SearchBar /></div>}
      {loading && <div style={{ marginTop: 20 }}><LoadingSpinner skeleton /></div>}
      {error && <div style={{ ...W, paddingTop: 12 }}><ErrorMessage message={error} onRetry={() => searchWeather(location?.display_name || '')} /></div>}

      {hasWeather && (
        <div style={{ paddingBottom: 80 }}>

          {/* ── Current Conditions ── */}
          <div style={{ ...W, marginTop: 28 }}>
            <Label>Current conditions</Label>
            <CurrentWeatherCard />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <HistoricalComparison />
              <SevereWeatherBadge />
              <button onClick={handleSave} style={{ marginLeft: 'auto', padding: '9px 18px', borderRadius: 7, background: '#fff', color: '#0a0a0a', fontSize: 13, fontWeight: 500, transition: 'background .15s' }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#e6e6e6'}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background = '#fff'}
              >↓ Save search</button>
            </div>
          </div>

          {/* ── AI Insights ── */}
          <div id="ai-insights" style={{ ...W, marginTop: S, scrollMarginTop: 80 }}>
            <Label>AI insights</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="grid-responsive">
              <ErrorBoundary fallbackMessage="Unavailable"><AIWeatherNarrator /></ErrorBoundary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <WeatherMoodScore />
                <ErrorBoundary fallbackMessage="Unavailable"><AIOutfitRecommender /></ErrorBoundary>
                <ErrorBoundary fallbackMessage="Unavailable"><SmartWeatherAlerts /></ErrorBoundary>
              </div>
            </div>
          </div>

          {/* ── Forecast ── */}
          <div id="forecast" style={{ ...W, marginTop: S, scrollMarginTop: 80 }}>
            <Label>Forecast</Label>
            <ForecastRow />
            <div style={{ marginTop: 16 }}><HourlyChart /></div>
          </div>

          {/* ── Map (full width) ── */}
          <div style={{ ...W, marginTop: S }}>
            <Label>Map</Label>
            <ErrorBoundary fallbackMessage="Map unavailable"><WeatherMapPanel /></ErrorBoundary>
          </div>

          {/* ── Explore: videos full width ── */}
          <div style={{ ...W, marginTop: S }}>
            <Label>Explore</Label>
            <ErrorBoundary fallbackMessage="Unavailable">
              <div style={{ overflow: 'hidden' }}><YouTubePanel /></div>
            </ErrorBoundary>
          </div>

          {/* ── AI Tools 2x2 ── */}
          <div style={{ ...W, marginTop: S }}>
            <Label>AI tools</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="grid-responsive">
              <ErrorBoundary fallbackMessage="Unavailable"><AITripAdvisor /></ErrorBoundary>
              <ErrorBoundary fallbackMessage="Unavailable"><PlanMyWeek /></ErrorBoundary>
              <NaturalLanguageSearch />
              <CityComparison />
            </div>
          </div>

          {/* ── Share ── */}
          <div style={{ ...W, marginTop: S }}>
            <Label>Share</Label>
            <ShareableCard />
          </div>

          {/* ── Data ── */}
          <div id="saved" style={{ ...W, marginTop: S, scrollMarginTop: 80 }}>
            <Label>Data</Label>
            <DateRangeSearch />
            <div style={{ marginTop: 16 }}><SavedSearchesPanel /></div>
            {searches.length > 0 && <div style={{ marginTop: 12 }}><WeatherDiff /></div>}
          </div>

          {/* ── Alerts + Dashboard ── */}
          <div style={{ ...W, marginTop: S }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="grid-responsive">
              <div><Label>Alerts</Label><AlertsPanel /></div>
              <div><Label>Dashboard</Label><PersonalDashboard /><div style={{ marginTop: 12 }}><ActivityHeatmap /></div></div>
            </div>
          </div>

          {/* ── Export ── */}
          <div style={{ ...W, marginTop: S }}>
            <Label>Export</Label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {searches.length > 0 && ['json', 'csv', 'markdown', 'xml', 'pdf'].map(f => (
                <a key={f} href={getExportUrl(searches[0].id, f)} download style={gBtn}>↓ {f.toUpperCase()}</a>
              ))}
              {searches.length > 1 && <a href={getExportAllUrl('pdf')} download style={gBtn}>↓ All (PDF)</a>}
              {!searches.length && <span style={{ fontSize: 13, color: 'var(--muted-2)' }}>Save a search first.</span>}
            </div>
          </div>

          <p style={{ ...W, marginTop: 16, textAlign: 'center', fontSize: 11, color: 'var(--muted-2)', fontFamily: 'var(--mono)' }}>
            <kbd style={kbd}>/</kbd> search · <kbd style={kbd}>Esc</kbd> clear
          </p>
        </div>
      )}

      {!hasWeather && !loading && (
        <div style={W}>
          <LiveFeedTicker />
          {searches.length > 0 && <div style={{ marginTop: 28 }}><Label>Saved searches</Label><SavedSearchesPanel /></div>}
          <div style={{ marginTop: 28 }}><Label>Alerts</Label><AlertsPanel /></div>
        </div>
      )}

      {hasWeather && <LiveFeedTicker />}
      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

const gBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, color: 'var(--text)', border: '1px solid var(--border-strong)', textDecoration: 'none' };
const kbd: React.CSSProperties = { padding: '2px 6px', border: '1px solid var(--border-strong)', borderRadius: 4, fontSize: 11 };

export default function App() {
  return (
    <WeatherProvider>
      <SavedSearchesProvider>
        <BackgroundGradient />
        <ErrorBoundary><AppContent /></ErrorBoundary>
      </SavedSearchesProvider>
    </WeatherProvider>
  );
}
