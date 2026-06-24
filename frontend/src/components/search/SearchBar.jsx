import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useGeolocation } from '../../hooks/useGeolocation';

const CITIES = [
  'New York', 'London', 'Paris', 'Tokyo', 'Dubai', 'Sydney', 'Toronto',
  'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Seattle', 'Boston',
  'Berlin', 'Amsterdam', 'Rome', 'Barcelona', 'Madrid', 'Lisbon', 'Vienna',
  'Singapore', 'Hong Kong', 'Seoul', 'Mumbai', 'Bangkok', 'Istanbul',
  'São Paulo', 'Mexico City', 'Buenos Aires', 'Cairo', 'Cape Town',
  'Reykjavík', 'Oslo', 'Stockholm', 'Helsinki', 'Copenhagen', 'Zurich',
  'Vancouver', 'Montreal', 'Denver', 'Austin', 'Nashville', 'Portland',
];

const QUICK = [
  { label: 'New York' }, { label: 'Paris' }, { label: 'Tokyo' },
];

export default function SearchBar({ showHero = false }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef(null);
  const { searchWeather, loading } = useWeather();
  const { getPosition, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    const matches = CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 6);
    setSuggestions(matches);
    setSelectedIdx(-1);
  }, [query]);

  const doSearch = (q) => {
    if (q.trim() && !loading) {
      setQuery(q.trim());
      setSuggestions([]);
      searchWeather(q.trim());
      inputRef.current?.blur();
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); doSearch(query); };

  const handleKeyDown = (e) => {
    if (!suggestions.length) { if (e.key === 'Enter') handleSubmit(e); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIdx >= 0) doSearch(suggestions[selectedIdx]);
      else doSearch(query);
    }
    else if (e.key === 'Escape') { setSuggestions([]); }
  };

  const handleGeo = async () => {
    try {
      const pos = await getPosition();
      const q = `${pos.lat.toFixed(4)}, ${pos.lon.toFixed(4)}`;
      setQuery(q); searchWeather(q);
    } catch {}
  };

  const searchBox = (
    <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
      <div style={{
        display: 'flex', gap: 8, padding: 6,
        border: `1px solid ${focused ? '#2a2f37' : 'var(--border-strong)'}`,
        borderRadius: suggestions.length && focused ? '10px 10px 0 0' : 10,
        background: 'rgba(13,15,18,.6)', backdropFilter: 'blur(8px)',
        boxShadow: focused ? '0 0 0 4px rgba(59,130,246,.08)' : 'none',
        transition: 'border-color .15s, box-shadow .15s, border-radius .15s',
      }}>
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => { setFocused(false); setSuggestions([]); }, 150)}
          onKeyDown={handleKeyDown}
          placeholder='Search a city — try "Reykjavík" or "São Paulo"'
          style={{ flex: 1, background: 'transparent', border: 0, outline: 'none', padding: '10px 12px', fontSize: 14.5, color: 'var(--text)' }}
        />
        <button onClick={handleGeo} disabled={geoLoading} type="button" style={{
          display: 'flex', alignItems: 'center', padding: '9px 12px', borderRadius: 7,
          color: 'var(--muted)', border: '1px solid var(--border-strong)', background: 'transparent',
          transition: 'color .15s',
        }}>
          {geoLoading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <MapPin size={14} />}
        </button>
        <button onClick={handleSubmit} disabled={loading || !query.trim()} type="button" style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 7,
          background: '#fff', color: '#0a0a0a', fontSize: 13.5, fontWeight: 500,
          opacity: loading || !query.trim() ? 0.5 : 1,
        }}>
          {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
          Search
        </button>
      </div>

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && focused && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'rgba(13,15,18,.95)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-strong)', borderTop: '1px solid var(--border)',
          borderRadius: '0 0 10px 10px',
          boxShadow: '0 12px 32px rgba(0,0,0,.4)',
        }}>
          {suggestions.map((city, i) => (
            <button key={city}
              onMouseDown={() => doSearch(city)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 16px', fontSize: 14, textAlign: 'left',
                background: i === selectedIdx ? 'rgba(59,130,246,.08)' : 'transparent',
                color: i === selectedIdx ? 'var(--text)' : 'var(--muted)',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background .1s, color .1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,.08)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { if (i !== selectedIdx) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; } }}
            >
              <Search size={13} style={{ opacity: 0.4 }} />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (!showHero) {
    return <div style={{ padding: '0 32px', maxWidth: 1320, margin: '0 auto', width: '100%' }}>{searchBox}</div>;
  }

  return (
    <div style={{ position: 'relative', padding: '160px 32px 80px', textAlign: 'center' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 12px', border: '1px solid var(--border-strong)',
        borderRadius: 999, fontSize: 12.5, color: 'var(--muted)',
        background: 'rgba(255,255,255,.015)',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
        </svg>
        AI-Powered Weather Intelligence
      </span>
      <h1 style={{
        fontSize: 'clamp(40px, 6vw, 68px)', lineHeight: 1.02,
        letterSpacing: '-0.035em', fontWeight: 600,
        margin: '22px auto 18px', maxWidth: 860,
      }}>
        The weather,<br /><span style={{ color: 'var(--muted-2)' }}>worth understanding.</span>
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.55 }}>
        Real-time forecasts paired with language-model insights. Ask anything, save anywhere, export everything.
      </p>
      {searchBox}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
        {QUICK.map(({ label }) => (
          <button key={label} onClick={() => doSearch(label)} style={{
            fontSize: 12.5, color: 'var(--muted)', padding: '6px 12px',
            border: '1px solid var(--border)', borderRadius: 999, background: 'transparent',
            transition: 'color .15s, border-color .15s, background .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'rgba(255,255,255,.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
          >{label}</button>
        ))}
      </div>
    </div>
  );
}
