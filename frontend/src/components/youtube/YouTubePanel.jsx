import { useState, useEffect } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { fetchYouTubeVideos } from '../../api/client';

export default function YouTubePanel() {
  const { location } = useWeather();
  const [media, setMedia] = useState(null);

  useEffect(() => {
    if (!location?.city) return;
    setMedia(null);
    fetchYouTubeVideos(location.city).then(({ data }) => setMedia(data));
  }, [location?.city]);

  if (!location || !media) return null;
  const isVideo = media.source !== 'unsplash_fallback';
  const items = isVideo ? (media.videos || []) : (media.photos || []);
  if (!items.length) return null;

  return (
    <div className="rise stagger-8" style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>
          {isVideo ? `${location.city} videos` : `${location.city} photos`}
        </span>
        {media.fallback_message && (
          <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>{media.fallback_message}</span>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`,
        gap: 16,
      }}>
        {isVideo ? items.slice(0, 6).map((v, i) => (
          <a key={i} href={`https://www.youtube.com/watch?v=${v.video_id}`} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text)', textDecoration: 'none' }}>
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={v.thumbnail} alt={v.title} style={{
                width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block',
                transition: 'transform .3s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              {/* Play overlay */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,.2)', opacity: 0, transition: 'opacity .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '14px solid #0a0a0a', marginLeft: 3 }} />
                </div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 10, lineHeight: 1.35 }}>{v.title}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 3 }}>{v.channel}</div>
          </a>
        )) : items.map((p, i) => (
          <div key={i}>
            <img src={p.url} alt={p.description} style={{
              width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8,
              border: '1px solid var(--border)',
            }} />
            <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 6 }}>📷 {p.photographer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
