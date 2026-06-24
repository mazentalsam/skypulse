import React from 'react';

interface DismissibleChipProps {
  text: string;
  severity?: 'high' | 'moderate' | 'low';
  onDismiss?: () => void;
}

export default function DismissibleChip({ text, severity = 'moderate', onDismiss }: DismissibleChipProps) {
  const isWarn = severity === 'high' || severity === 'moderate';
  return (
    <span style={{
      fontSize: 12, padding: '5px 10px', borderRadius: 6,
      border: isWarn ? '1px solid rgba(245,158,11,.35)' : '1px solid var(--border-strong)',
      color: isWarn ? '#fcd34d' : 'var(--text)',
      background: isWarn ? 'rgba(245,158,11,.06)' : 'rgba(255,255,255,.02)',
      display: 'inline-flex', alignItems: 'center',
    }}>
      {text}
      {onDismiss && (
        <span onClick={onDismiss} style={{
          marginLeft: 6, color: 'var(--muted)', cursor: 'pointer',
          transition: 'color .15s',
        }}
          onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => e.currentTarget.style.color = 'var(--muted)'}
        >×</span>
      )}
    </span>
  );
}
