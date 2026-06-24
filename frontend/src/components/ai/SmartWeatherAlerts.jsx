import { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { useWeather } from '../../context/WeatherContext';

const ICONS = { uv: '☀️', rain: '🌧', temperature: '🌡', wind: '💨' };

export default function SmartWeatherAlerts() {
  const { smartAlerts, aiLoading, weather } = useWeather();
  const [dismissed, setDismissed] = useState(new Set());

  if (!weather) return null;

  const hasData = smartAlerts?.length > 0;
  const visible = hasData ? smartAlerts.filter((_, i) => !dismissed.has(i)) : [];

  return (
    <GlassCard accentBorder="var(--amber)" thin>
      <div style={{ fontSize: 11.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        Smart alerts {hasData && <span style={{ color: 'var(--muted)' }}>· {visible.length}</span>}
      </div>
      {aiLoading && !hasData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 32, borderRadius: 6 }} />)}
        </div>
      ) : visible.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {smartAlerts.map((alert, i) => {
            if (dismissed.has(i)) return null;
            // Truncate long alerts to first sentence
            const msg = alert.message.includes('.') ? alert.message.split('.')[0] + '.' : alert.message;
            const icon = ICONS[alert.type] || '⚠';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 6,
                border: '1px solid rgba(245,158,11,.2)',
                background: 'rgba(245,158,11,.04)',
                fontSize: 12, color: '#e5c07b', lineHeight: 1.4,
              }}>
                <span>{icon}</span>
                <span style={{ flex: 1 }}>{msg}</span>
                <span style={{ color: 'var(--muted)', cursor: 'pointer', padding: '0 2px', flexShrink: 0 }}
                  onClick={() => setDismissed(prev => new Set([...prev, i]))}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                >×</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--muted-2)' }}>
          {hasData ? 'All clear.' : 'No advisories — conditions look stable.'}
        </div>
      )}
    </GlassCard>
  );
}
