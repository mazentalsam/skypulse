from unittest.mock import patch, MagicMock
import requests as req_lib
from backend.services.weather_service import (
    get_current_weather, get_forecast, get_air_quality,
    check_alert_triggers, WeatherAPIError,
)
import pytest


class TestWeatherService:
    def test_demo_mode_current(self):
        with patch('backend.services.weather_service.config') as mock_config:
            mock_config.DEMO_MODE = True
            result = get_current_weather(48.86, 2.35)
            assert result['name'] == 'Paris'
            assert 'main' in result

    def test_demo_mode_forecast(self):
        with patch('backend.services.weather_service.config') as mock_config:
            mock_config.DEMO_MODE = True
            result = get_forecast(48.86, 2.35)
            assert 'list' in result
            assert len(result['list']) > 0

    @patch('backend.services.weather_service.requests.get')
    def test_current_weather_success(self, mock_get):
        with patch('backend.services.weather_service.config') as mock_config:
            mock_config.DEMO_MODE = False
            mock_config.OPENWEATHERMAP_API_KEY = 'test-key'
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                'main': {'temp': 20, 'humidity': 60},
                'weather': [{'description': 'clear sky'}],
                'name': 'TestCity',
            }
            mock_get.return_value = mock_response

            result = get_current_weather(48.86, 2.35)
            assert result['main']['temp'] == 20

    @patch('backend.services.weather_service.requests.get')
    def test_current_weather_api_error(self, mock_get):
        with patch('backend.services.weather_service.config') as mock_config:
            mock_config.DEMO_MODE = False
            mock_config.OPENWEATHERMAP_API_KEY = 'test-key'
            mock_get.side_effect = req_lib.RequestException('API Error')

            with pytest.raises(WeatherAPIError):
                get_current_weather(48.86, 2.35)

    @patch('backend.services.weather_service.requests.get')
    def test_air_quality_returns_none_on_error(self, mock_get):
        with patch('backend.services.weather_service.config') as mock_config:
            mock_config.DEMO_MODE = False
            mock_config.OPENWEATHERMAP_API_KEY = 'test-key'
            mock_get.side_effect = req_lib.RequestException('Error')
            result = get_air_quality(48.86, 2.35)
            assert result is None


class TestAlertTriggers:
    def test_temperature_greater_than_triggered(self):
        weather = {'main': {'temp': 35, 'humidity': 60}, 'wind': {'speed': 5}, 'rain': {}}
        alerts = [{'id': 1, 'condition': 'temperature', 'threshold_value': 30, 'threshold_type': 'greater_than'}]
        triggered = check_alert_triggers(weather, alerts)
        assert len(triggered) == 1
        assert triggered[0]['alert_id'] == 1

    def test_temperature_not_triggered(self):
        weather = {'main': {'temp': 25, 'humidity': 60}, 'wind': {'speed': 5}, 'rain': {}}
        alerts = [{'id': 1, 'condition': 'temperature', 'threshold_value': 30, 'threshold_type': 'greater_than'}]
        triggered = check_alert_triggers(weather, alerts)
        assert len(triggered) == 0

    def test_humidity_less_than(self):
        weather = {'main': {'temp': 25, 'humidity': 20}, 'wind': {'speed': 5}, 'rain': {}}
        alerts = [{'id': 2, 'condition': 'humidity', 'threshold_value': 30, 'threshold_type': 'less_than'}]
        triggered = check_alert_triggers(weather, alerts)
        assert len(triggered) == 1

    def test_empty_alerts(self):
        weather = {'main': {'temp': 25}, 'wind': {}, 'rain': {}}
        triggered = check_alert_triggers(weather, [])
        assert len(triggered) == 0

    def test_none_weather(self):
        triggered = check_alert_triggers(None, [{'id': 1}])
        assert len(triggered) == 0

    def test_multiple_alerts(self):
        weather = {'main': {'temp': 35, 'humidity': 20}, 'wind': {'speed': 15}, 'rain': {}}
        alerts = [
            {'id': 1, 'condition': 'temperature', 'threshold_value': 30, 'threshold_type': 'greater_than'},
            {'id': 2, 'condition': 'wind', 'threshold_value': 10, 'threshold_type': 'greater_than'},
            {'id': 3, 'condition': 'humidity', 'threshold_value': 50, 'threshold_type': 'greater_than'},
        ]
        triggered = check_alert_triggers(weather, alerts)
        assert len(triggered) == 2
        triggered_ids = {t['alert_id'] for t in triggered}
        assert triggered_ids == {1, 2}
