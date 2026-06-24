interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      fontSize: 13.5, color: 'var(--muted)', background: 'var(--panel)',
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '6px 12px', fontSize: 12.5, borderRadius: 6,
          border: '1px solid var(--border-strong)', background: 'transparent',
        }}>Retry</button>
      )}
    </div>
  );
}
