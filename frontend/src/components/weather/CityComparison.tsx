import { useState } from 'react';
import { Loader } from 'lucide-react';
import { fetchComparison, fetchAIComparison } from '../../api/client';
import { formatTemp } from '../../utils/formatters';
import { getWeatherIconUrl } from '../../utils/weatherConditions';
import type { WeatherData, Location } from '../../types/weather';

interface CityWeatherData {
  location: Location;
  weather: WeatherData;
}

interface ComparisonResult {
  city1: CityWeatherData;
  city2: CityWeatherData;
}

export default function CityComparison() {
  const [city1, setCity1] = useState('');
  const [city2, setCity2] = useState('');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city1.trim() || !city2.trim()) return;
    setLoading(true); setError(null); setInsight('');

    const { data, error: err } = await fetchComparison(city1, city2);
    if (err) { setError(err); setLoading(false); return; }
    const compData = data as unknown as ComparisonResult;
    setResult(compData);
    setLoading(false);

    const { data: aiData } = await fetchAIComparison(
      { location: compData.city1.location, weather: compData.city1.weather },
      { location: compData.city2.location, weather: compData.city2.weather }
    );
    if (aiData?.insight) setInsight(aiData.insight);
  };

  const inputStyle: React.CSSProperties = {
    flex: 1, background: 'rgba(0,0,0,.2)', border: '1px solid var(--border-strong)',
    borderRadius: 7, padding: '10px 12px', fontSize: 14, outline: 'none', color: 'var(--text)',
    minWidth: 140,
  };

  return (
    <div className="rise" style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 24,
    }}>
      <form onSubmit={handleCompare} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={city1} onChange={e => setCity1(e.target.value)} placeholder="City A" style={inputStyle} />
        <span style={{ color: 'var(--muted-2)', fontSize: 13 }}>vs</span>
        <input value={city2} onChange={e => setCity2(e.target.value)} placeholder="City B" style={inputStyle} />
        <button type="submit" disabled={loading} style={{
          padding: '10px 18px', borderRadius: 7, background: '#fff', color: '#0a0a0a',
          fontSize: 13.5, fontWeight: 500, opacity: loading ? 0.6 : 1,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {loading && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
          Compare
        </button>
      </form>

      {error && <div style={{ marginTop: 12, color: 'var(--rose)', fontSize: 13 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="grid-responsive">
            <CityCard data={result.city1} />
            <CityCard data={result.city2} />
          </div>

          {/* Comparison table */}
          <div style={{ marginTop: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', fontSize: 12, color: 'var(--muted-2)', fontFamily: 'var(--mono)', letterSpacing: '.08em', textTransform: 'uppercase', padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
              <div>Metric</div>
              <div style={{ textAlign: 'center' }}>{result.city1.location.city}</div>
              <div style={{ textAlign: 'center' }}>{result.city2.location.city}</div>
            </div>
            {[
              { label: 'Temperature', v1: formatTemp(result.city1.weather.main?.temp), v2: formatTemp(result.city2.weather.main?.temp) },
              { label: 'Humidity', v1: `${result.city1.weather.main?.humidity}%`, v2: `${result.city2.weather.main?.humidity}%` },
              { label: 'Wind', v1: `${result.city1.weather.wind?.speed} m/s`, v2: `${result.city2.weather.wind?.speed} m/s` },
              { label: 'Feels like', v1: formatTemp(result.city1.weather.main?.feels_like), v2: formatTemp(result.city2.weather.main?.feels_like) },
              { label: 'Visibility', v1: result.city1.weather.visibility ? `${(result.city1.weather.visibility/1000).toFixed(0)} km` : '—', v2: result.city2.weather.visibility ? `${(result.city2.weather.visibility/1000).toFixed(0)} km` : '—' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 13, transition: 'background .15s' }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.background = 'transparent'}>
                <div style={{ color: 'var(--muted)' }}>{row.label}</div>
                <div style={{ textAlign: 'center', fontWeight: 500 }}>{row.v1}</div>
                <div style={{ textAlign: 'center', fontWeight: 500 }}>{row.v2}</div>
              </div>
            ))}
          </div>

          {insight && (
            <div style={{
              marginTop: 16, padding: '14px 18px', position: 'relative',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            }}>
              <div style={{ position: 'absolute', left: 0, top: 10, bottom: 10, width: 2, borderRadius: 2, background: 'var(--accent)' }} />
              <div style={{ paddingLeft: 8, fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                {insight}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CityCard({ data }: { data: CityWeatherData }) {
  const w = data.weather;
  const cond = w.weather?.[0] || { icon: '', description: '' };
  return (
    <div style={{ padding: '18px', background: 'rgba(255,255,255,.01)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '.05em' }}>
        {data.location.city?.toUpperCase()}, {data.location.country}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <span style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.03em' }}>{Math.round(w.main?.temp)}°</span>
        <div>
          <img src={getWeatherIconUrl(cond.icon)} alt="" style={{ width: 32, height: 32 }} />
          <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'capitalize' }}>{cond.description}</div>
        </div>
      </div>
    </div>
  );
}
