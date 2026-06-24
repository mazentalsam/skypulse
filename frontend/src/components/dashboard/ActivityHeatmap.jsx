import { useSavedSearches } from '../../context/SavedSearchesContext';

export default function ActivityHeatmap() {
  const { searches } = useSavedSearches();
  if (searches.length < 1) return null;

  const dateCounts = {};
  searches.forEach(s => {
    const date = (s.created_at || '').slice(0, 10);
    if (date) dateCounts[date] = (dateCounts[date] || 0) + 1;
  });

  const today = new Date();
  const weeks = 12;
  const cells = [];

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = dateCounts[key] || 0;
    cells.push({ date: key, count, dayOfWeek: d.getDay() });
  }

  const weekColumns = [];
  for (let i = 0; i < cells.length; i += 7) {
    weekColumns.push(cells.slice(i, i + 7));
  }

  function getColor(count) {
    if (count === 0) return '#15181c';
    if (count === 1) return 'rgba(59,130,246,.2)';
    if (count === 2) return 'rgba(59,130,246,.35)';
    if (count <= 4) return 'rgba(59,130,246,.5)';
    return 'rgba(59,130,246,.7)';
  }

  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20,
    }}>
      <div style={{
        fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)',
        letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 14,
      }}>
        Search activity — last {weeks} weeks
      </div>
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto' }}>
        {weekColumns.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((cell, di) => (
              <div key={di} title={`${cell.date}: ${cell.count} search${cell.count !== 1 ? 'es' : ''}`}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: getColor(cell.count),
                  transition: 'background .15s',
                  cursor: 'default',
                }}
                onMouseEnter={e => { if (cell.count) e.currentTarget.style.outline = '1px solid rgba(59,130,246,.4)'; }}
                onMouseLeave={e => e.currentTarget.style.outline = 'none'}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10 }}>
        <span style={{ fontSize: 10, color: 'var(--muted-2)' }}>Less</span>
        {[0, 1, 2, 4, 6].map(n => (
          <div key={n} style={{ width: 10, height: 10, borderRadius: 2, background: getColor(n) }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--muted-2)' }}>More</span>
      </div>
    </div>
  );
}
