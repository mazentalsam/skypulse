import { useWeather } from '../../context/WeatherContext';
import { formatTemp, formatDay } from '../../utils/formatters';
import { getWeatherIconUrl } from '../../utils/weatherConditions';

function getTempColor(temp) {
  if (temp >= 30) return { bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.15)', accent: '#ef4444' };
  if (temp >= 25) return { bg: 'rgba(249,115,22,.06)', border: 'rgba(249,115,22,.12)', accent: '#f97316' };
  if (temp >= 20) return { bg: 'rgba(245,158,11,.05)', border: 'rgba(245,158,11,.10)', accent: '#f59e0b' };
  if (temp >= 15) return { bg: 'rgba(20,184,166,.05)', border: 'rgba(20,184,166,.10)', accent: '#14b8a6' };
  if (temp >= 5) return { bg: 'rgba(59,130,246,.05)', border: 'rgba(59,130,246,.10)', accent: '#3b82f6' };
  return { bg: 'rgba(139,92,246,.05)', border: 'rgba(139,92,246,.10)', accent: '#8b5cf6' };
}

export default function ForecastRow() {
  const { forecast } = useWeather();
  if (!forecast?.list) return null;

  const dailyMap = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!dailyMap[date]) dailyMap[date] = { items: [], min: Infinity, max: -Infinity };
    dailyMap[date].items.push(item);
    dailyMap[date].min = Math.min(dailyMap[date].min, item.main.temp_min);
    dailyMap[date].max = Math.max(dailyMap[date].max, item.main.temp_max);
  });

  const days = Object.entries(dailyMap).slice(0, 5).map(([date, data]) => {
    const noon = data.items.find(i => { const h = new Date(i.dt * 1000).getHours(); return h >= 11 && h <= 14; })
      || data.items[Math.floor(data.items.length / 2)];
    return { dt: noon.dt, icon: noon.weather[0].icon, min: data.min, max: data.max };
  });

  return (
    <div className="rise stagger-4" style={{
      display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10,
    }}>
      {days.map((day, i) => {
        const c = getTempColor(day.max);
        return (
          <div key={i} style={{
            textAlign: 'center', padding: '18px 12px',
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 'var(--radius)',
            transition: 'all .2s ease', cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${c.border}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{
              fontSize: 11, fontWeight: 600, color: i === 0 ? c.accent : 'var(--muted)',
              fontFamily: 'var(--mono)', letterSpacing: '.05em',
            }}>
              {i === 0 ? 'TODAY' : formatDay(day.dt).toUpperCase()}
            </div>
            <img src={getWeatherIconUrl(day.icon)} alt="" style={{ width: 40, height: 40, margin: '8px 0 6px' }} />
            <div style={{ fontSize: 18, fontWeight: 600, color: c.accent }}>{formatTemp(day.max)}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{formatTemp(day.min)}</div>
          </div>
        );
      })}
    </div>
  );
}
