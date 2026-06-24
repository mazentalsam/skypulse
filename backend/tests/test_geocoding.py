from unittest.mock import patch, MagicMock
import requests as req_lib
from backend.services.geocoding_service import geocode, LocationNotFoundError
import pytest


class TestGeocodingService:
    def test_demo_mode(self):
        with patch('backend.services.geocoding_service.config') as mock_config:
            mock_config.DEMO_MODE = True
            result = geocode('London')
            assert result['city'] == 'London'
            assert 'lat' in result
            assert 'lon' in result

    def test_coordinate_input(self):
        with patch('backend.services.geocoding_service.config') as mock_config:
            mock_config.DEMO_MODE = False
            result = geocode('48.8566, 2.3522')
            assert result['lat'] == 48.8566
            assert result['lon'] == 2.3522

    def test_negative_coordinates(self):
        with patch('backend.services.geocoding_service.config') as mock_config:
            mock_config.DEMO_MODE = False
            result = geocode('-33.8688, 151.2093')
            assert result['lat'] == -33.8688
            assert result['lon'] == 151.2093

    @patch('backend.services.geocoding_service.requests.get')
    def test_city_name_lookup(self, mock_get):
        with patch('backend.services.geocoding_service.config') as mock_config:
            mock_config.DEMO_MODE = False
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = [{
                'lat': '51.5074',
                'lon': '-0.1278',
                'display_name': 'London, England, United Kingdom',
                'address': {
                    'city': 'London',
                    'country_code': 'gb',
                },
            }]
            mock_get.return_value = mock_response

            result = geocode('London')
            assert result['city'] == 'London'
            assert result['country'] == 'GB'
            assert result['lat'] == 51.5074

    @patch('backend.services.geocoding_service.requests.get')
    def test_location_not_found(self, mock_get):
        with patch('backend.services.geocoding_service.config') as mock_config:
            mock_config.DEMO_MODE = False
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = []
            mock_get.return_value = mock_response

            with pytest.raises(LocationNotFoundError):
                geocode('xyznonexistentplace')

    @patch('backend.services.geocoding_service.requests.get')
    def test_api_error(self, mock_get):
        with patch('backend.services.geocoding_service.config') as mock_config:
            mock_config.DEMO_MODE = False
            mock_get.side_effect = req_lib.RequestException('Network error')

            with pytest.raises(LocationNotFoundError):
                geocode('Paris')

    @patch('backend.services.geocoding_service.requests.get')
    def test_town_fallback(self, mock_get):
        with patch('backend.services.geocoding_service.config') as mock_config:
            mock_config.DEMO_MODE = False
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = [{
                'lat': '43.30',
                'lon': '5.37',
                'display_name': 'Marseille, France',
                'address': {
                    'town': 'Marseille',
                    'country_code': 'fr',
                },
            }]
            mock_get.return_value = mock_response

            result = geocode('Marseille')
            assert result['city'] == 'Marseille'
