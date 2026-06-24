import { PM_ACCELERATOR_DESCRIPTION } from '../../utils/constants';

export default function Footer() {
  return (
    <footer style={{
      marginTop: 120, padding: '40px 32px 60px', textAlign: 'center',
      borderTop: '1px solid var(--border)', color: 'var(--muted)',
      fontSize: 13, position: 'relative', zIndex: 1,
    }}>
      Built by <span style={{ color: 'var(--accent-2)', fontWeight: 500 }}>Mazen</span> for{' '}
      <span style={{ color: 'var(--accent-2)', fontWeight: 500 }}>PM Accelerator</span>.
      <p style={{
        maxWidth: 520, margin: '12px auto 0', fontSize: 12.5,
        color: 'var(--muted-2)', lineHeight: 1.6,
      }}>
        {PM_ACCELERATOR_DESCRIPTION}
      </p>
    </footer>
  );
}
