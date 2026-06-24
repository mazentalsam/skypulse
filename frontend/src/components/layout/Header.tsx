import { useEffect, useState } from 'react';
import { useWeather } from '../../context/WeatherContext';

export default function Header() {
  const { clearWeather, weather, searchWeather } = useWeather();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 32px',
      backdropFilter: scrolled ? 'saturate(140%) blur(10px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'saturate(140%) blur(10px)' : 'none',
      background: scrolled ? 'rgba(7,8,9,.6)' : 'transparent',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,.04)' : '1px solid transparent',
      transition: 'all .2s ease',
    }}>
      <button onClick={() => { clearWeather(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
          position: 'relative',
          boxShadow: '0 0 0 1px rgba(255,255,255,.06), 0 6px 20px -8px rgba(59,130,246,.6)',
        }}>
          <div style={{
            position: 'absolute', inset: 5, borderRadius: 3,
            background: 'rgba(255,255,255,.85)', mixBlendMode: 'overlay',
          }} />
        </div>
        <span style={{ fontWeight: 600, letterSpacing: '-0.01em', fontSize: 15, color: 'var(--text)' }}>SkyPulse</span>
      </button>
      <nav style={{ display: 'flex', gap: 4 }}>
        {['Forecast', 'AI Insights', 'Saved'].map(label => {
          const targetId = label.toLowerCase().replace(' ', '-');
          const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            const el = document.getElementById(targetId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else if (!weather) {
              searchWeather('New York');
              setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' }), 1500);
            }
          };
          return (
            <a key={label} href={`#${targetId}`} onClick={handleClick} style={{
              fontSize: 13.5, color: 'var(--muted)', padding: '8px 12px', borderRadius: 6,
              transition: 'color .15s, background .15s', textDecoration: 'none',
            }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'none'; }}
            >
              {label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
