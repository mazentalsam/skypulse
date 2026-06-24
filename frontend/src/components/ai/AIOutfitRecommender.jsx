import GlassCard from '../ui/GlassCard';
import { useWeather } from '../../context/WeatherContext';

export default function AIOutfitRecommender() {
  const { outfit, aiLoading, weather } = useWeather();
  if (!weather) return null;

  const hasData = outfit?.recommendations?.length > 0;

  return (
    <GlassCard accentBorder="var(--teal)" thin>
      <div style={{ fontSize: 11.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        What to wear
      </div>
      {aiLoading && !hasData ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[100, 120, 90].map((w, i) => <div key={i} className="skeleton" style={{ height: 28, width: w, borderRadius: 6 }} />)}
        </div>
      ) : hasData ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {outfit.recommendations.map((rec, i) => (
            <span key={i} style={{
              fontSize: 12, padding: '5px 10px', borderRadius: 6,
              border: '1px solid var(--border-strong)', color: 'var(--text)',
              background: 'rgba(255,255,255,.02)',
            }}>
              {rec.icon} {rec.label}
            </span>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--muted-2)' }}>Outfit suggestions loading...</div>
      )}
    </GlassCard>
  );
}
