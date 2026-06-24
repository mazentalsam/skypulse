import { useState } from 'react';
import { useSavedSearches } from '../../context/SavedSearchesContext';
import { getExportUrl } from '../../api/client';
import { formatTemp } from '../../utils/formatters';
import type { SavedSearch } from '../../types/weather';

interface SearchRowProps {
  search: SavedSearch;
  onEdit: (id: number, updates: Record<string, unknown>) => Promise<SavedSearch | null>;
  onDelete: (id: number) => Promise<void>;
}

export default function SavedSearchesPanel() {
  const { searches, editSearch, removeSearch } = useSavedSearches();
  if (!searches.length) return null;

  return (
    <div className="rise" style={{
      border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden',
    }}>
      {/* Header row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr .6fr 1fr auto', gap: 16,
        padding: '10px 18px', borderBottom: '1px solid var(--border)',
        fontSize: 11.5, color: 'var(--muted-2)',
        fontFamily: 'var(--mono)', letterSpacing: '.08em', textTransform: 'uppercase',
      }}>
        <div>City</div><div>Date</div><div>Temp</div><div>Notes</div><div style={{ textAlign: 'right' }}>Actions</div>
      </div>

      {searches.map(s => (
        <SearchRow key={s.id} search={s} onEdit={editSearch} onDelete={removeSearch} />
      ))}
    </div>
  );
}

function SearchRow({ search, onEdit, onDelete }: SearchRowProps) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(search.notes || '');

  const weather = search.weather_data || {};
  const temp = (weather as Record<string, Record<string, number>>).main?.temp;

  const handleSave = () => { onEdit(search.id, { notes }); setEditing(false); };

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.4fr 1fr .6fr 1fr auto', gap: 16,
      alignItems: 'center', padding: '14px 18px',
      borderBottom: '1px solid var(--border)',
      transition: 'background .15s', fontSize: 13.5,
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ fontWeight: 500 }}>{search.city}</div>
      <div style={{ color: 'var(--muted)' }}>{search.created_at?.slice(0, 10)}</div>
      <div style={{ color: 'var(--muted)' }}>{temp != null ? formatTemp(temp) : '—'}</div>
      <div style={{ color: 'var(--muted)' }}>
        {editing ? (
          <input value={notes} onChange={e => setNotes(e.target.value)}
            onBlur={handleSave} onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus style={{
              width: '100%', background: 'transparent',
              border: '1px solid var(--border-strong)', borderRadius: 6,
              padding: '6px 8px', fontSize: 13, outline: 'none',
            }} />
        ) : (
          <span>{search.notes || '—'}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button onClick={() => setEditing(true)} style={btnStyle}>Edit</button>
        <a href={getExportUrl(search.id, 'json')} download style={btnStyle}>Export</a>
        <button onClick={() => onDelete(search.id)} style={btnStyle}>Delete</button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '6px 10px', fontSize: 12.5, borderRadius: 6,
  border: '1px solid var(--border-strong)', background: 'transparent',
  color: 'var(--text)', cursor: 'pointer', textDecoration: 'none',
  display: 'inline-flex', alignItems: 'center',
  transition: 'background .15s',
};
