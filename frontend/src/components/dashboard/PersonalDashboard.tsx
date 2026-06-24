import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSavedSearches } from '../../context/SavedSearchesContext';

interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
}

export default function PersonalDashboard() {
  const { stats } = useSavedSearches();
  if (!stats || stats.total_searches < 3) return null;

  const tempData: { city: string; temp: number | null }[] = (stats.temp_ranges || []).slice(0, 8).map(t => ({
    city: t.city?.slice(0, 8) || '?', temp: t.temp,
  })).filter(t => t.temp != null);

  const moodPct = stats.avg_mood ? Math.round(stats.avg_mood * 10) : 0;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="grid-responsive">
        <Stat label="Most searched" value={stats.top_city?.city || '—'} sub={`${stats.top_city?.cnt || 0} searches`} />
        <div style={{
          background: 'var(--panel)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 20,
        }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '.05em', textTransform: 'uppercase' }}>Average mood</div>
          <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>
            {stats.avg_mood || '—'} <span style={{ fontSize: 14, color: 'var(--muted)' }}>/ 10</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${moodPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--teal))', borderRadius: 3 }} />
            </div>
          </div>
        </div>
        <Stat label="Total searches" value={stats.total_searches} sub="All time" />
      </div>

      {tempData.length > 0 && (
        <div style={{
          background: 'var(--panel)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 24, marginTop: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Temperature range — saved cities</h3>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>°C</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tempData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="city" tick={{ fill: '#8a8f98', fontSize: 11, fontFamily: 'Geist Mono' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#5a5f68', fontSize: 10, fontFamily: 'Geist Mono' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => v + '°'} />
                <Tooltip contentStyle={{
                  background: 'rgba(15,17,21,.7)', backdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 12,
                }} />
                <Bar dataKey="temp" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: StatProps) {
  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20,
    }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', letterSpacing: '.05em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
