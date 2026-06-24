import { useWeather } from '../../context/WeatherContext';

export default function HistoricalComparison() {
  const { historical, weather } = useWeather();
  if (!historical || !weather) return null;
  const currentTemp = weather.main?.temp;
  const avgTemp = historical.avg_temp;
  if (currentTemp == null || avgTemp == null) return null;
  const diff = currentTemp - avgTemp;
  const absDiff = Math.abs(diff).toFixed(1);
  let text;
  if (diff > 1) text = `${absDiff}° warmer than usual for this time of year`;
  else if (diff < -1) text = `${absDiff}° cooler than usual for this time of year`;
  else text = 'Right on the historical average';

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 12px', border: '1px solid var(--border)',
      borderRadius: 8, fontSize: 13, color: 'var(--muted)',
      background: 'rgba(255,255,255,.015)',
    }}>
      {diff > 1 ? '↑' : diff < -1 ? '↓' : '·'} {text}
    </div>
  );
}
