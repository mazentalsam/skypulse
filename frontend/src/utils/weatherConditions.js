const CONDITIONS = {
  '01d': { gradient: ['#0a1628', '#1a2a10', '#0d1a08'], label: 'Clear Sky' },
  '01n': { gradient: ['#050510', '#0a0820', '#08061a'], label: 'Clear Night' },
  '02d': { gradient: ['#081020', '#0a1628', '#101825'], label: 'Few Clouds' },
  '02n': { gradient: ['#060810', '#0a0d1a', '#080a15'], label: 'Few Clouds' },
  '03d': { gradient: ['#0a1020', '#111828', '#0d1525'], label: 'Scattered Clouds' },
  '03n': { gradient: ['#080a14', '#0d1018', '#0a0d15'], label: 'Scattered Clouds' },
  '04d': { gradient: ['#0d1220', '#151d2a', '#111828'], label: 'Overcast' },
  '04n': { gradient: ['#0a0d18', '#101520', '#0d1018'], label: 'Overcast' },
  '09d': { gradient: ['#060d20', '#081528', '#0a1020'], label: 'Shower Rain' },
  '09n': { gradient: ['#050818', '#080d20', '#060a18'], label: 'Shower Rain' },
  '10d': { gradient: ['#060a1e', '#081025', '#0a1220'], label: 'Rain' },
  '10n': { gradient: ['#05081a', '#080c1e', '#060a18'], label: 'Rain' },
  '11d': { gradient: ['#050510', '#0a0818', '#08061a'], label: 'Thunderstorm' },
  '11n': { gradient: ['#030308', '#060510', '#05040d'], label: 'Thunderstorm' },
  '13d': { gradient: ['#101520', '#181e28', '#141a24'], label: 'Snow' },
  '13n': { gradient: ['#0d1018', '#121620', '#101318'], label: 'Snow' },
  '50d': { gradient: ['#0d1018', '#14181e', '#111520'], label: 'Mist' },
  '50n': { gradient: ['#0a0d14', '#101318', '#0d1014'], label: 'Mist' },
};

const DEFAULT = { gradient: ['#060918', '#0a1128', '#0d1530'], label: 'Weather' };

export function getWeatherTheme(iconCode) {
  return CONDITIONS[iconCode] || DEFAULT;
}

export function getWeatherIconUrl(iconCode, size = 2) {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}x.png`;
}
