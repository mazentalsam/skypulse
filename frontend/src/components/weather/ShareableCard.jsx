import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useWeather } from '../../context/WeatherContext';
import { formatTemp } from '../../utils/formatters';

export default function ShareableCard() {
  const { weather, location, mood } = useWeather();
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  if (!weather || !location) return null;

  const main = weather.main || {};
  const cond = weather.weather?.[0] || {};

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#070809',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `skypulse-${location.city?.toLowerCase() || 'weather'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {}
    setGenerating(false);
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#070809', scale: 2, useCORS: true });
      canvas.toBlob(blob => {
        if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      });
    } catch {}
    setGenerating(false);
  };

  return (
    <div>
      {/* The card to capture */}
      <div ref={cardRef} style={{
        background: '#070809', padding: 32, borderRadius: 12, width: 400,
        border: '1px solid #1a1d22', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 120,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,.12), transparent 70%)',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, color: '#5a5f68', fontFamily: 'monospace', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {location.city}, {location.country} · {new Date().toLocaleDateString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
            <span style={{
              fontSize: 64, fontWeight: 500, letterSpacing: '-0.04em', color: '#ededee',
              lineHeight: 1,
            }}>
              {Math.round(main.temp)}°
            </span>
            <div>
              <div style={{ fontSize: 15, color: '#ededee', textTransform: 'capitalize' }}>{cond.description}</div>
              <div style={{ fontSize: 12, color: '#5a5f68', marginTop: 4 }}>
                H: {formatTemp(main.temp_max)} · L: {formatTemp(main.temp_min)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { l: 'Humidity', v: `${main.humidity}%` },
              { l: 'Wind', v: `${weather.wind?.speed} m/s` },
              { l: 'Feels', v: formatTemp(main.feels_like) },
            ].map((m, i) => (
              <span key={i} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 6,
                border: '1px solid #23272d', color: '#8a8f98',
                background: 'rgba(255,255,255,.015)',
              }}>
                {m.l} <b style={{ color: '#ededee', fontWeight: 500 }}>{m.v}</b>
              </span>
            ))}
            {mood?.score && (
              <span style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 6,
                border: '1px solid #23272d', color: '#8a8f98',
                background: 'rgba(255,255,255,.015)',
              }}>
                Mood <b style={{ color: '#60a5fa', fontWeight: 500 }}>{mood.score}/10</b>
              </span>
            )}
          </div>
          <div style={{ marginTop: 16, fontSize: 10, color: '#3b3f46', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)' }} />
            SkyPulse · skypulse.app
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={handleDownload} disabled={generating} style={{
          padding: '8px 14px', borderRadius: 7, fontSize: 12.5,
          border: '1px solid var(--border-strong)', background: 'transparent',
          transition: 'background .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ↓ Download PNG
        </button>
        <button onClick={handleCopy} disabled={generating} style={{
          padding: '8px 14px', borderRadius: 7, fontSize: 12.5,
          border: '1px solid var(--border-strong)', background: 'transparent',
          transition: 'background .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ⎘ Copy to clipboard
        </button>
      </div>
    </div>
  );
}
