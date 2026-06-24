import { useEffect } from 'react';

const GLOW_MAP = {
  '01d': 'rgba(245,158,11,.16)',
  '01n': 'rgba(120,130,140,.10)',
  '02d': 'rgba(200,170,80,.12)',
  '02n': 'rgba(120,130,140,.10)',
  '03d': 'rgba(120,130,140,.14)',
  '03n': 'rgba(120,130,140,.10)',
  '04d': 'rgba(120,130,140,.14)',
  '04n': 'rgba(100,110,120,.10)',
  '09d': 'rgba(59,130,246,.22)',
  '09n': 'rgba(59,130,246,.18)',
  '10d': 'rgba(59,130,246,.22)',
  '10n': 'rgba(59,130,246,.18)',
  '11d': 'rgba(168,85,247,.18)',
  '11n': 'rgba(168,85,247,.14)',
  '13d': 'rgba(180,200,220,.14)',
  '13n': 'rgba(150,170,190,.10)',
  '50d': 'rgba(120,130,140,.12)',
  '50n': 'rgba(100,110,120,.08)',
};

export function useWeatherTheme(iconCode) {
  useEffect(() => {
    const el = document.getElementById('ambient-glow');
    if (!el) return;
    const color = GLOW_MAP[iconCode] || 'rgba(59,130,246,.18)';
    el.style.background = `radial-gradient(60% 50% at 50% 28%, ${color} 0%, transparent 65%)`;
  }, [iconCode]);
}
