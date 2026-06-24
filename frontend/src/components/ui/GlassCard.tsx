import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  accentBorder?: string;
  thin?: boolean;
}

export default function GlassCard({ children, className = '', style = {}, onClick, accentBorder, thin = false }: GlassCardProps) {
  const borderLeft: React.CSSProperties = accentBorder
    ? { position: 'relative', paddingLeft: thin ? 22 : 26 }
    : {};

  return (
    <div className={className} style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: thin ? 18 : 24,
      ...borderLeft,
      ...style,
    }} onClick={onClick}>
      {accentBorder && (
        <div style={{
          position: 'absolute', left: 0, top: 14, bottom: 14,
          width: 2, borderRadius: 2, background: accentBorder,
        }} />
      )}
      {children}
    </div>
  );
}
