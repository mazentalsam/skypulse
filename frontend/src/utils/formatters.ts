export function formatTemp(temp: number | null | undefined): string {
  if (temp == null) return 'N/A';
  return `${Math.round(temp)}°C`;
}

export function formatTime(timestamp: number | null | undefined, timezone = 0): string {
  if (!timestamp) return '';
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
}

export function formatDate(timestamp: number | null | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDay(timestamp: number | null | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatHour(timestamp: number | null | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
}

export function formatWindDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function getAQILabel(aqi: number | null | undefined): string {
  const labels: Record<number, string> = { 1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very Poor' };
  return (aqi != null && labels[aqi]) || 'Unknown';
}

export function getAQIColor(aqi: number | null | undefined): string {
  const colors: Record<number, string> = { 1: '#34d399', 2: '#a3e635', 3: '#fbbf24', 4: '#fb923c', 5: '#f87171' };
  return (aqi != null && colors[aqi]) || '#94a3b8';
}
