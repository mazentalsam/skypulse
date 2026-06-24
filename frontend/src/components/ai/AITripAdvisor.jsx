import { useState } from 'react';
import { Loader } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { fetchTripAdvice, fetchForecast, fetchCurrentWeather } from '../../api/client';

export default function AITripAdvisor() {
  const [destination, setDestination] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination) return;
    setLoading(true); setError(null);
    const weatherRes = await fetchCurrentWeather(destination);
    let forecastData = {};
    if (weatherRes.data?.location) {
      const fRes = await fetchForecast(weatherRes.data.location.lat, weatherRes.data.location.lon);
      if (fRes.data) forecastData = fRes.data;
    }
    const dates = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 'next few days';
    const { data, error: err } = await fetchTripAdvice(destination, dates, { current: weatherRes.data?.weather, forecast: forecastData });
    setLoading(false);
    if (err) { setError(err); return; }
    setAdvice(data);
  };

  const inputStyle = {
    background: 'rgba(0,0,0,.2)', border: '1px solid var(--border-strong)',
    borderRadius: 7, padding: '8px 10px', fontSize: 13, outline: 'none', color: 'var(--text)',
  };

  return (
    <GlassCard className="rise stagger-4" accentBorder="var(--purple)">
      <div style={{
        fontSize: 11.5, color: 'var(--muted-2)',
        fontFamily: 'var(--mono)', letterSpacing: '.08em',
        textTransform: 'uppercase', marginBottom: 10,
      }}>
        Trip Advisor
      </div>
      <button onClick={() => setExpanded(!expanded)} style={{
        fontSize: 14, fontWeight: 500, textAlign: 'left', width: '100%', padding: 0,
      }}>
        Plan your next trip →
      </button>

      {expanded && (
        <div style={{ marginTop: 14 }}>
          <form onSubmit={handleSubmit} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8,
          }} className="grid-responsive">
            <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination" style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = '#2a2f37'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border-strong)'} />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
            <button type="submit" disabled={loading || !destination} style={{
              padding: '8px 14px', borderRadius: 7, background: '#fff', color: '#0a0a0a',
              fontSize: 13, fontWeight: 500, opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {loading && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
              Get advice
            </button>
          </form>
          {error && <div style={{ marginTop: 10, color: 'var(--rose)', fontSize: 13 }}>{error}</div>}
          {advice && (
            <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6 }}>
              {advice.best_days?.length > 0 && <p><b style={{ color: 'var(--text)', fontWeight: 500 }}>Best days:</b> {advice.best_days.join(' ')}</p>}
              {advice.packing_list?.length > 0 && <p style={{ marginTop: 8 }}><b style={{ color: 'var(--text)', fontWeight: 500 }}>Pack:</b> {advice.packing_list.join(' · ')}</p>}
              {advice.activities_to_avoid?.length > 0 && <p style={{ marginTop: 8 }}><b style={{ color: 'var(--text)', fontWeight: 500 }}>Avoid:</b> {advice.activities_to_avoid.join(' ')}</p>}
              {advice.local_tip && <p style={{ marginTop: 8 }}><b style={{ color: 'var(--text)', fontWeight: 500 }}>Local tip:</b> {advice.local_tip}</p>}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
