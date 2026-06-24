import { useState } from 'react';
import { fetchWeatherDiff } from '../../api/client';
import { useSavedSearches } from '../../context/SavedSearchesContext';

export default function WeatherDiff() {
  const { searches } = useSavedSearches();
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedId, setCheckedId] = useState(null);

  if (!searches.length) return null;

  const handleCheck = async (search) => {
    setLoading(true); setCheckedId(search.id);
    const { data } = await fetchWeatherDiff(search.id);
    setLoading(false);
    if (data) setDiff(data);
  };

  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20,
    }}>
      <div style={{
        fontSize: 11.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)',
        letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 14,
      }}>
        What changed since last check
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: diff ? 16 : 0 }}>
        {searches.slice(0, 5).map(s => (
          <button key={s.id} onClick={() => handleCheck(s)}
            disabled={loading}
            style={{
              padding: '6px 12px', fontSize: 12.5, borderRadius: 6,
              border: `1px solid ${checkedId === s.id ? 'var(--accent)' : 'var(--border-strong)'}`,
              background: checkedId === s.id ? 'rgba(59,130,246,.08)' : 'transparent',
              color: checkedId === s.id ? 'var(--accent-2)' : 'var(--muted)',
              transition: 'all .15s',
            }}
          >
            {s.city}
          </button>
        ))}
      </div>

      {diff && diff.changes.length > 0 && (
        <div className="rise" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, color: 'var(--muted-2)', marginBottom: 4 }}>
            Since {diff.saved_at?.slice(0, 10)}:
          </div>
          {diff.changes.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: 13,
            }}>
              <span style={{
                color: c.direction === 'up' ? '#f43f5e' : '#14b8a6',
                fontWeight: 500, fontFamily: 'var(--mono)', minWidth: 50,
              }}>
                {c.direction === 'up' ? '↑' : '↓'} {Math.abs(c.diff)}{c.unit}
              </span>
              <span style={{ color: 'var(--muted)' }}>
                {c.metric}: {c.old}{c.unit} → <b style={{ color: 'var(--text)', fontWeight: 500 }}>{c.new}{c.unit}</b>
              </span>
            </div>
          ))}
        </div>
      )}

      {diff && diff.changes.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>
          No significant changes since your last check.
        </div>
      )}
    </div>
  );
}
