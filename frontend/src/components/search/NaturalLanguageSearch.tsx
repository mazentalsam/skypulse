import { useState } from 'react';
import { Loader } from 'lucide-react';
import { fetchNaturalSearch } from '../../api/client';

type HistoryMessage =
  | { type: 'user'; text: string }
  | { type: 'ai'; text: string; location?: string }
  | { type: 'error'; text: string };

export default function NaturalLanguageSearch() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    const q = query.trim();
    setHistory(prev => [...prev, { type: 'user', text: q }]);
    setQuery(''); setLoading(true);
    const { data, error } = await fetchNaturalSearch(q);
    setLoading(false);
    if (error) setHistory(prev => [...prev, { type: 'error', text: error }]);
    else setHistory(prev => [...prev, { type: 'ai', text: (data as { answer: string; location?: { city?: string } }).answer, location: (data as { answer: string; location?: { city?: string } }).location?.city }]);
  };

  return (
    <div className="rise stagger-7" style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 18,
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex', gap: 8, padding: 6,
        border: '1px solid var(--border-strong)', borderRadius: 10,
        background: 'rgba(0,0,0,.2)',
      }}>
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder='Ask anything — "Will it rain in Tokyo Friday?"'
          style={{
            flex: 1, background: 'transparent', border: 0, outline: 'none',
            padding: '10px 12px', fontSize: 14, color: 'var(--text)',
          }} />
        <button type="submit" disabled={loading || !query.trim()} style={{
          padding: '9px 14px', borderRadius: 7, background: '#fff', color: '#0a0a0a',
          fontSize: 13.5, fontWeight: 500, opacity: loading || !query.trim() ? 0.5 : 1,
        }}>
          {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Ask'}
        </button>
      </form>

      {history.length > 0 && (
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map((msg, i) => (
            <div key={i} style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: 10,
              fontSize: 13.5, lineHeight: 1.5,
              ...(msg.type === 'user' ? {
                alignSelf: 'flex-end', background: '#fff', color: '#0a0a0a',
              } : msg.type === 'error' ? {
                alignSelf: 'flex-start', color: 'var(--rose)',
                border: '1px solid var(--border)', background: 'rgba(255,255,255,.02)',
              } : {
                alignSelf: 'flex-start', color: 'var(--muted)',
                border: '1px solid var(--border)', background: 'rgba(255,255,255,.02)',
              }),
            }}>
              {msg.type === 'ai' && msg.text.split('.').length > 1 ? (
                <span dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/(\d+[°%]?\s*(?:km\/h|mm|°C|hPa)?)/g, '<b style="color:var(--text);font-weight:500">$1</b>')
                }} />
              ) : msg.text}
            </div>
          ))}
          {loading && (
            <div style={{
              alignSelf: 'flex-start', padding: '10px 16px',
              border: '1px solid var(--border)', borderRadius: 10, background: 'rgba(255,255,255,.02)',
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(j => <div key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--muted-2)', animation: `pulse 1.2s ease-in-out ${j * .2}s infinite` }} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
