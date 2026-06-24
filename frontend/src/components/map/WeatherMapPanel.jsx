import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useWeather } from '../../context/WeatherContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LAYERS = [
  { id: 'precipitation_new', label: 'Rain', color: '#3b82f6' },
  { id: 'temp_new', label: 'Temp', color: '#f59e0b' },
  { id: 'wind_new', label: 'Wind', color: '#14b8a6' },
];

function MapUpdater({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function WeatherMapPanel() {
  const { location, weather } = useWeather();
  const [activeLayer, setActiveLayer] = useState('precipitation_new');

  if (!location) return null;
  const center = [location.lat, location.lon];
  const googleUrl = `https://www.google.com/maps/@${location.lat},${location.lon},12z`;
  const embedUrl = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${location.lat},${location.lon}&zoom=12&maptype=roadmap`;

  return (
    <div className="rise" style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>Interactive map</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {LAYERS.map(l => (
            <button key={l.id} onClick={() => setActiveLayer(l.id)} style={{
              padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6,
              background: activeLayer === l.id ? l.color : 'transparent',
              color: activeLayer === l.id ? '#0a0a0a' : 'var(--muted)',
              border: activeLayer === l.id ? 'none' : '1px solid var(--border)',
              transition: 'all .15s',
            }}>{l.label}</button>
          ))}
        </div>
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={{
          padding: '4px 10px', fontSize: 11, borderRadius: 6,
          border: '1px solid var(--border)', color: 'var(--muted)',
          textDecoration: 'none', transition: 'color .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >Google Maps ↗</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ height: 300 }}>
          <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} zoomControl={true}>
            <MapUpdater center={center} />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OSM' />
            <TileLayer key={activeLayer} url={`https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=9de243494c0b295cca9337e1e96b00e2`} opacity={0.6} />
            <Marker position={center}>
              <Popup>{location.city || 'Location'}<br />{weather?.main ? `${Math.round(weather.main.temp)}°C` : ''}</Popup>
            </Marker>
          </MapContainer>
        </div>
        <div style={{ height: 300, borderLeft: '1px solid var(--border)' }}>
          <iframe title="Google Maps" width="100%" height="100%" frameBorder="0"
            style={{ border: 0 }} src={embedUrl} allowFullScreen />
        </div>
      </div>
    </div>
  );
}
