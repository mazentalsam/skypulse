import { useState } from 'react';
import { Loader } from 'lucide-react';
import { useSavedSearches } from '../../context/SavedSearchesContext';

const CONDITIONS = ['temperature', 'rain', 'wind', 'humidity', 'uv'];
const TYPES = ['greater_than', 'less_than'];

export default function AlertsPanel() {
  const { alerts, saveAlert, removeAlert } = useSavedSearches();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ location: '', condition: 'temperature', threshold_value: '', threshold_type: 'greater_than', latitude: 0, longitude: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location || !form.threshold_value) return;
    setLoading(true); setError(null);
    const { error: err } = await saveAlert({ ...form, threshold_value: parseFloat(form.threshold_value), latitude: 0, longitude: 0 });
    setLoading(false);
    if (err) { setError(typeof err === 'string' ? err : err.join(', ')); return; }
    setForm({ location: '', condition: 'temperature', threshold_value: '', threshold_type: 'greater_than', latitude: 0, longitude: 0 });
    setShowForm(false);
  };

  const inputStyle = {
    background: 'rgba(0,0,0,.2)', border: '1px solid var(--border-strong)',
    borderRadius: 7, padding: '8px 10px', fontSize: 13, outline: 'none', color: 'var(--text)',
  };

  return (
    <div className="rise">
      {alerts.map((a, i) => (
        <div key={a.id} style={{
          position: 'relative', padding: '14px 16px 14px 20px',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
          marginBottom: 8,
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 10, bottom: 10,
            width: 2, borderRadius: 2, background: 'var(--amber)',
          }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              {a.condition} {a.threshold_type.replace('_', ' ')} {a.threshold_value} in {a.location}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
              {a.is_triggered ? '🔴 Triggered' : 'Monitoring'} · checked on weather fetch
            </div>
          </div>
          <button onClick={() => removeAlert(a.id)} style={{
            padding: '6px 10px', fontSize: 12.5, borderRadius: 6,
            border: '1px solid var(--border-strong)', background: 'transparent',
            transition: 'background .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Remove
          </button>
        </div>
      ))}

      <button onClick={() => setShowForm(!showForm)} style={{
        padding: '6px 10px', fontSize: 12.5, borderRadius: 6,
        border: '1px solid var(--border-strong)', background: 'transparent',
        marginTop: alerts.length ? 4 : 0,
        transition: 'background .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        ＋ New alert
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          marginTop: 12, padding: 16,
          border: '1px dashed var(--border-strong)', borderRadius: 'var(--radius)',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8,
        }} className="grid-responsive">
          <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
            placeholder="Location (e.g. Berlin)" style={inputStyle} />
          <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} style={inputStyle}>
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={form.threshold_value} onChange={e => setForm({ ...form, threshold_value: e.target.value })}
            placeholder="Threshold" type="number" style={inputStyle} />
          <button type="submit" disabled={loading} style={{
            padding: '8px 14px', borderRadius: 7, background: '#fff', color: '#0a0a0a',
            fontSize: 13, fontWeight: 500,
          }}>
            {loading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : 'Add'}
          </button>
          {error && <div style={{ gridColumn: '1/-1', color: 'var(--rose)', fontSize: 12 }}>{error}</div>}
        </form>
      )}
    </div>
  );
}
