import { useState } from 'react';
import { Loader } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { fetchPlanWeek } from '../../api/client';

const VERDICT_STYLE = {
  good: { color: '#14b8a6', bg: 'rgba(20,184,166,.06)', border: 'rgba(20,184,166,.2)' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,.06)', border: 'rgba(245,158,11,.2)' },
  bad: { color: '#f43f5e', bg: 'rgba(244,63,94,.06)', border: 'rgba(244,63,94,.2)' },
};

export default function PlanMyWeek() {
  const { forecast, location } = useWeather();
  const [events, setEvents] = useState([{ event: '', day: 'Monday', time: '09:00' }]);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const addEvent = () => setEvents([...events, { event: '', day: 'Monday', time: '09:00' }]);
  const updateEvent = (i, field, val) => {
    const copy = [...events];
    copy[i] = { ...copy[i], [field]: val };
    setEvents(copy);
  };
  const removeEvent = (i) => setEvents(events.filter((_, j) => j !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = events.filter(ev => ev.event.trim());
    if (!valid.length) return;
    setLoading(true);
    const { data } = await fetchPlanWeek(valid, forecast || {}, location?.city || '');
    setLoading(false);
    if (data?.plans) setPlans(data.plans);
  };

  const inputStyle = {
    background: 'rgba(0,0,0,.2)', border: '1px solid var(--border-strong)',
    borderRadius: 7, padding: '8px 10px', fontSize: 13, outline: 'none', color: 'var(--text)',
  };

  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 22, position: 'relative',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 2, borderRadius: 2, background: 'var(--teal)' }} />
      <div style={{ paddingLeft: 4 }}>
        <div style={{
          fontSize: 11.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)',
          letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10,
        }}>
          Plan My Week
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{
          fontSize: 14, fontWeight: 500, padding: 0, textAlign: 'left', width: '100%',
        }}>
          Cross-reference your schedule with the forecast →
        </button>

        {expanded && (
          <form onSubmit={handleSubmit} style={{ marginTop: 14 }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <input value={ev.event} onChange={e => updateEvent(i, 'event', e.target.value)}
                  placeholder="Activity (e.g. Morning run)" style={{ ...inputStyle, flex: '1 1 160px' }} />
                <select value={ev.day} onChange={e => updateEvent(i, 'day', e.target.value)} style={inputStyle}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="time" value={ev.time} onChange={e => updateEvent(i, 'time', e.target.value)} style={inputStyle} />
                {events.length > 1 && (
                  <button type="button" onClick={() => removeEvent(i)} style={{
                    padding: '8px 10px', borderRadius: 7, fontSize: 12,
                    border: '1px solid var(--border-strong)', background: 'transparent',
                  }}>×</button>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button type="button" onClick={addEvent} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12,
                border: '1px solid var(--border-strong)', background: 'transparent',
              }}>＋ Add event</button>
              <button type="submit" disabled={loading} style={{
                padding: '8px 18px', borderRadius: 7, background: '#fff', color: '#0a0a0a',
                fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {loading && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                Analyze
              </button>
            </div>
          </form>
        )}

        {plans && plans.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {plans.map((p, i) => {
              const vs = VERDICT_STYLE[p.verdict] || VERDICT_STYLE.good;
              return (
                <div key={i} className="rise" style={{
                  padding: '12px 14px', borderRadius: 8,
                  background: vs.bg, border: `1px solid ${vs.border}`,
                  animationDelay: `${i * 60}ms`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: vs.color, textTransform: 'uppercase', fontFamily: 'var(--mono)', letterSpacing: '.05em' }}>
                      {p.verdict === 'good' ? '✓' : p.verdict === 'warning' ? '⚠' : '✕'} {p.verdict}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{p.event}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {p.day} {p.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{p.reason}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
