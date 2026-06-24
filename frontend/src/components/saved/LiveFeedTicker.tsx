import { useSavedSearches } from '../../context/SavedSearchesContext';

export default function LiveFeedTicker() {
  const { searches } = useSavedSearches();
  if (searches.length < 2) return null;

  const items = searches.slice(0, 10).map(s => s.city).join('  ·  ');
  const doubled = `${items}  ·  ${items}`;

  return (
    <div style={{
      overflow: 'hidden', padding: '6px 0',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(7,8,9,.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase',
          letterSpacing: '.1em', fontFamily: 'var(--mono)',
          flexShrink: 0, padding: '0 16px',
        }}>
          Recent
        </span>
        <div style={{
          overflow: 'hidden', flex: 1,
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        }}>
          <div style={{
            whiteSpace: 'nowrap', fontSize: 12, color: 'var(--muted-2)',
            animation: 'marquee 25s linear infinite',
          }}>
            {doubled}
          </div>
        </div>
      </div>
    </div>
  );
}
