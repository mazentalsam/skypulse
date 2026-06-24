import { useWeather } from '../../context/WeatherContext';

export default function SevereWeatherBadge() {
  const { forecast } = useWeather();
  if (!forecast?.list) return null;
  const maxPop = Math.max(...forecast.list.slice(0, 16).map(i => i.pop || 0));
  if (maxPop < 0.3) return null;
  const confidence = Math.round(maxPop * 100);

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 12px', border: '1px solid var(--border)',
      borderRadius: 8, fontSize: 13, color: 'var(--muted)',
      background: 'rgba(255,255,255,.015)',
    }}>
      🌧 Precipitation confidence: <b style={{ color: 'var(--text)', fontWeight: 500 }}>{confidence}%</b>
    </div>
  );
}
