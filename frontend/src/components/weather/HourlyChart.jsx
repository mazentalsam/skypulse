import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useWeather } from '../../context/WeatherContext';
import { formatHour } from '../../utils/formatters';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      padding: '8px 10px', borderRadius: 8, fontSize: 12,
      background: 'rgba(15,17,21,.7)', backdropFilter: 'blur(10px)',
      border: '1px solid var(--border-strong)', color: 'var(--text)',
      boxShadow: '0 8px 24px -10px rgba(0,0,0,.6)',
    }}>
      {d.time} · <b style={{ color: 'var(--accent-2)', fontWeight: 500 }}>{Math.round(d.temp)}°C</b>
    </div>
  );
}

export default function HourlyChart() {
  const { hourly } = useWeather();
  if (!hourly?.length) return null;

  const data = hourly.map(item => ({
    time: formatHour(item.dt),
    temp: Math.round(item.main.temp * 10) / 10,
  }));

  const temps = data.map(d => d.temp);
  const range = `${Math.min(...temps).toFixed(0)}° — ${Math.max(...temps).toFixed(0)}°C`;

  return (
    <div className="rise stagger-5" style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Next 24 hours</h3>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{range}</span>
      </div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,.04)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: '#5a5f68', fontSize: 10, fontFamily: 'Geist Mono' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#5a5f68', fontSize: 10, fontFamily: 'Geist Mono' }} tickLine={false} axisLine={false} tickFormatter={v => v + '°'} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="temp" stroke="#60a5fa" strokeWidth={2} fill="url(#tempG)" dot={false}
              activeDot={{ r: 4, fill: '#fff', stroke: '#60a5fa', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
