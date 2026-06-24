export function formatTemp(temp) {
  if (temp == null) return 'N/A';
  return `${Math.round(temp)}°C`;
}

export function formatTime(timestamp, timezone = 0) {
  if (!timestamp) return '';
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDay(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatHour(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

export function formatWindDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function getAQILabel(aqi) {
  const labels = { 1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very Poor' };
  return labels[aqi] || 'Unknown';
}

export function getAQIColor(aqi) {
  const colors = { 1: '#34d399', 2: '#a3e635', 3: '#fbbf24', 4: '#fb923c', 5: '#f87171' };
  return colors[aqi] || '#94a3b8';
}
