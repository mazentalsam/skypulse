import { useWeather } from '../../context/WeatherContext';

export default function WeatherMoodScore() {
  const { mood, aiLoading, weather } = useWeather();
  if (!weather) return null;

  const hasData = mood?.score != null;
  const pct = hasData ? mood.score! * 10 : 0;

  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 18,
    }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
        Weather mood
      </div>
      {aiLoading && !hasData ? (
        <div style={{ marginTop: 10 }}>
          <div className="skeleton" style={{ height: 32, width: 60, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 6, width: '100%', borderRadius: 3 }} />
        </div>
      ) : (
        <>
          <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>
            {hasData ? mood.score : '—'} <span style={{ fontSize: 14, color: 'var(--muted)' }}>/ 10</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--teal))', borderRadius: 3, transition: 'width .6s ease' }} />
            </div>
          </div>
          {mood?.explanation && (
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>{mood.explanation}</div>
          )}
        </>
      )}
    </div>
  );
}
