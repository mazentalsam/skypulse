export default function LoadingSpinner({ skeleton = false }) {
  if (skeleton) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', width: '100%', padding: '0 32px' }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32, marginBottom: 16 }}>
          <div className="skeleton" style={{ width: 160, height: 13, marginBottom: 20 }} />
          <div className="skeleton" style={{ width: 180, height: 80, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ width: 110, height: 32 }} />)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 0 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: '24px 0' }}>
      <div style={{
        width: 20, height: 20,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin .8s linear infinite',
      }} />
      <span style={{ color: 'var(--muted)', fontSize: 13 }}>Loading...</span>
    </div>
  );
}
