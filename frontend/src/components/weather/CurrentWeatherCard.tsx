import { useWeather } from '../../context/WeatherContext';
import { formatTemp, formatTime, formatWindDirection, getAQILabel } from '../../utils/formatters';
import { getWeatherIconUrl } from '../../utils/weatherConditions';

export default function CurrentWeatherCard() {
  const { weather, location } = useWeather();
  if (!weather || !location) return null;

  const main = weather.main || {};
  const wind = weather.wind || {};
  const sys = weather.sys || {};
  const condition = weather.weather?.[0] || {};
  const aq = weather.air_quality?.list?.[0];
  const uv = weather.uv_index;

  const metrics: Array<{ label: string; value: string | number }> = [
    { label: 'Humidity', value: `${main.humidity}%` },
    { label: 'Wind', value: `${wind.speed} m/s${wind.deg ? ' ' + formatWindDirection(wind.deg) : ''}` },
    { label: 'UV index', value: uv ?? 'N/A' },
    { label: 'Feels like', value: formatTemp(main.feels_like) },
    { label: 'Visibility', value: weather.visibility ? `${(weather.visibility / 1000).toFixed(0)} km` : 'N/A' },
    { label: 'Pressure', value: `${main.pressure} hPa` },
  ];
  if (aq) metrics.push({ label: 'Air quality', value: getAQILabel(aq.main?.aqi) });

  return (
    <div className="rise stagger-2" style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 0, overflow: 'hidden',
    }}>
      {/* Hero section */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 24,
        alignItems: 'end', padding: 32,
      }}>
        <div>
          <div style={{
            fontSize: 13, color: 'var(--muted)',
            fontFamily: 'var(--mono)', letterSpacing: '.05em',
          }}>
            {location.city?.toUpperCase()}, {location.country} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} LOCAL
          </div>
          <div style={{
            fontSize: 120, lineHeight: .95, letterSpacing: '-0.05em',
            fontWeight: 500, marginTop: 6,
            background: 'linear-gradient(180deg, #fff 0%, #bcbec3 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}>
            {Math.round(main.temp)}<sup style={{
              fontSize: 32, color: 'var(--muted)', verticalAlign: 'top',
              marginLeft: 4, fontWeight: 400,
            }}>°C</sup>
          </div>
        </div>
        <div style={{ textAlign: 'right', color: 'var(--muted)' }}>
          <img src={getWeatherIconUrl(condition.icon, 4)} alt={condition.description}
            style={{ width: 64, height: 64, filter: 'brightness(1.1)' }} />
          <div style={{ fontSize: 14, color: 'var(--text)', marginTop: 8, textTransform: 'capitalize' }}>
            {condition.description}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
            H: {formatTemp(main.temp_max)} · L: {formatTemp(main.temp_min)}
          </div>
          {sys.sunrise && (
            <div style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 6 }}>
              ↑ {formatTime(sys.sunrise, weather.timezone)} · ↓ {formatTime(sys.sunset, weather.timezone)}
            </div>
          )}
        </div>
      </div>

      {/* Metrics row */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8,
        padding: '0 32px 28px',
      }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', border: '1px solid var(--border)',
            borderRadius: 8, fontSize: 13, color: 'var(--muted)',
            background: 'rgba(255,255,255,.015)',
          }}>
            {m.label} <b style={{ color: 'var(--text)', fontWeight: 500 }}>{m.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
