export interface WeatherMain {
  temp: number;
  feels_like: number;
  humidity: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface WeatherWind {
  speed: number;
  deg?: number;
  gust?: number;
}

export interface WeatherSys {
  country?: string;
  sunrise?: number;
  sunset?: number;
}

export interface AirQualityItem {
  main: { aqi: number };
  components: Record<string, number>;
}

export interface WeatherData {
  main: WeatherMain;
  weather: WeatherCondition[];
  wind: WeatherWind;
  sys: WeatherSys;
  visibility?: number;
  clouds?: { all: number };
  dt?: number;
  timezone?: number;
  name?: string;
  rain?: Record<string, number>;
  air_quality?: { list: AirQualityItem[] };
  uv_index?: number | null;
  triggered_alerts?: TriggeredAlert[];
}

export interface Location {
  lat: number;
  lon: number;
  display_name: string;
  city: string;
  country: string;
}

export interface ForecastItem {
  dt: number;
  main: WeatherMain;
  weather: WeatherCondition[];
  wind: WeatherWind;
  clouds: { all: number };
  pop: number;
  dt_txt: string;
}

export interface ForecastData {
  list: ForecastItem[];
  city?: {
    name: string;
    country: string;
    coord: { lat: number; lon: number };
  };
}

export interface TriggeredAlert {
  alert_id: number;
  condition: string;
  threshold_value: number;
  threshold_type: string;
  current_value: number;
  message: string;
}

export interface CurrentWeatherResponse {
  location: Location;
  weather: WeatherData;
  air_quality: { list: AirQualityItem[] } | null;
  uv_index: number | null;
  triggered_alerts: TriggeredAlert[];
}

export interface SavedSearch {
  id: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  search_query: string;
  date_from?: string;
  date_to?: string;
  weather_data: WeatherData | Record<string, unknown>;
  forecast_data?: ForecastData | Record<string, unknown>;
  notes: string;
  tags: string;
  mood_score?: number | null;
  ai_briefing?: string;
  created_at: string;
  updated_at: string;
}

export interface WeatherAlert {
  id: number;
  location: string;
  latitude: number;
  longitude: number;
  condition: string;
  threshold_value: number;
  threshold_type: string;
  is_triggered: number;
  last_checked?: string;
  created_at: string;
}

export interface DashboardStats {
  total_searches: number;
  top_city: { city: string; cnt: number } | null;
  avg_mood: number | null;
  temp_ranges: Array<{
    city: string;
    temp: number | null;
    temp_min: number | null;
    temp_max: number | null;
  }>;
  tag_counts: Record<string, number>;
}

export interface HistoricalData {
  avg_temp: number;
  avg_humidity: number | null;
  avg_precipitation: number | null;
}

export interface MoodScore {
  score: number | null;
  explanation: string;
}

export interface OutfitRecommendation {
  recommendations: Array<{
    icon: string;
    label: string;
    description: string;
  }>;
}

export interface SmartAlert {
  type: string;
  severity: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  headers: Record<string, string> | null;
}
