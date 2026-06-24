import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  onClose?: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onClose?.(); }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
      padding: '10px 16px', borderRadius: 8, fontSize: 13,
      background: 'rgba(15,17,21,.7)', backdropFilter: 'blur(10px)',
      border: '1px solid var(--border-strong)', color: 'var(--text)',
      boxShadow: '0 8px 24px -10px rgba(0,0,0,.6)',
      animation: 'rise .3s ease-out',
    }}>
      {message}
    </div>
  );
}
