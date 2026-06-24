import { useState, useEffect } from 'react';
import { Loader, Search } from 'lucide-react';
import { createDateRangeSearch } from '../../api/client';
import { useSavedSearches } from '../../context/SavedSearchesContext';
import { formatTemp } from '../../utils/formatters';
import type { SavedSearch } from '../../types/weather';

const CITIES: string[] = [
  'New York', 'London', 'Paris', 'Tokyo', 'Dubai', 'Sydney', 'Toronto',
  'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Berlin', 'Amsterdam',
  'Rome', 'Barcelona', 'Singapore', 'Hong Kong', 'Seoul', 'Mumbai', 'Bangkok',
  'São Paulo', 'Mexico City', 'Cairo', 'Cape Town', 'Vancouver', 'Montreal',
];

export default function DateRangeSearch() {
  const [location, setLocation] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SavedSearch | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const { loadSearches, loadStats } = useSavedSearches();

  useEffect(() => {
    if (location.length < 2 || !focused) { setSuggestions([]); return; }
    const q = location.toLowerCase();
    setSuggestions(CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 5));
  }, [location, focused]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !dateFrom || !dateTo) return;
    setLoading(true); setError(null); setResult(null);

    const { data, error: err } = await createDateRangeSearch(location, dateFrom, dateTo);
    setLoading(false);
    if (err) { setError(err); return; }
    setResult(data);
    loadSearches();
    loadStats();
  };

  const pickCity = (city: string) => { setLocation(city); setSuggestions([]); };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,.2)', border: '1px solid var(--border-strong)',
    borderRadius: 7, padding: '10px 12px', fontSize: 13.5, outline: 'none', color: 'var(--text)',
    transition: 'border-color .15s', width: '100%',
  };

  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 24,
    }}>
      <div style={{ fontSize: 11.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        Create
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
        Search weather by location and date range
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: 8, alignItems: 'start',
      }} className="grid-responsive">
        <div style={{ position: 'relative' }}>
          <label style={{ fontSize: 11, color: 'var(--muted-2)', display: 'block', marginBottom: 4, fontFamily: 'var(--mono)', letterSpacing: '.05em' }}>LOCATION</label>
          <input value={location} onChange={e => setLocation(e.target.value)}
            onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="City, ZIP, coordinates, or landmark" style={inputStyle} />
          {suggestions.length > 0 && focused && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: 'rgba(13,15,18,.95)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-strong)', borderTop: '1px solid var(--border)',
              borderRadius: '0 0 8px 8px', boxShadow: '0 8px 24px rgba(0,0,0,.4)',
            }}>
              {suggestions.map((city, i) => (
                <button key={city} type="button" onMouseDown={() => pickCity(city)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                  padding: '8px 12px', fontSize: 13, textAlign: 'left',
                  background: 'transparent', color: 'var(--muted)',
                  borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background .1s, color .1s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,.08)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
                >
                  <Search size={12} style={{ opacity: 0.4 }} /> {city}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted-2)', display: 'block', marginBottom: 4, fontFamily: 'var(--mono)', letterSpacing: '.05em' }}>FROM</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted-2)', display: 'block', marginBottom: 4, fontFamily: 'var(--mono)', letterSpacing: '.05em' }}>TO</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ paddingTop: 20 }}>
          <button type="submit" disabled={loading || !location || !dateFrom || !dateTo} style={{
            padding: '10px 20px', borderRadius: 7, background: '#fff', color: '#0a0a0a',
            fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap',
            opacity: loading || !location || !dateFrom || !dateTo ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: 6, transition: 'background .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#e6e6e6'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            {loading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            Search & Save
          </button>
        </div>
      </form>

      {error && <div style={{ marginTop: 12, color: 'var(--rose)', fontSize: 13 }}>{error}</div>}

      {result && (
        <div className="rise" style={{
          marginTop: 16, padding: '14px 18px',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div>
            <div style={{ fontWeight: 500 }}>{result.city}, {result.country}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{result.date_from} → {result.date_to}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{formatTemp((result.weather_data as Record<string, Record<string, number>>)?.main?.temp)}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{((result.weather_data as Record<string, unknown>)?.weather as Array<{ description?: string }> | undefined)?.[0]?.description || ''}</div>
          </div>
          <div style={{
            padding: '5px 10px', borderRadius: 6, fontSize: 12,
            background: 'rgba(20,184,166,.06)', border: '1px solid rgba(20,184,166,.15)', color: 'var(--teal)',
          }}>✓ Saved</div>
        </div>
      )}
    </div>
  );
}
