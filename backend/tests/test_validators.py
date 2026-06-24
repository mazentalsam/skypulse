from backend.utils.validators import (
    validate_search_query, validate_date_range,
    validate_coordinates, validate_alert_data,
)


class TestSearchQueryValidation:
    def test_valid_query(self):
        valid, result = validate_search_query('Paris')
        assert valid is True
        assert result == 'Paris'

    def test_empty_string(self):
        valid, msg = validate_search_query('')
        assert valid is False

    def test_none(self):
        valid, msg = validate_search_query(None)
        assert valid is False

    def test_whitespace_only(self):
        valid, msg = validate_search_query('   ')
        assert valid is False

    def test_too_long(self):
        valid, msg = validate_search_query('x' * 201)
        assert valid is False

    def test_strips_whitespace(self):
        valid, result = validate_search_query('  London  ')
        assert valid is True
        assert result == 'London'


class TestDateRangeValidation:
    def test_valid_range(self):
        valid, d_from, d_to = validate_date_range('2025-06-01', '2025-06-10')
        assert valid is True

    def test_none_dates(self):
        valid, d_from, d_to = validate_date_range(None, None)
        assert valid is True

    def test_invalid_format(self):
        valid, msg, _ = validate_date_range('06/01/2025', '2025-06-10')
        assert valid is False
        assert 'format' in msg.lower()

    def test_start_after_end(self):
        valid, msg, _ = validate_date_range('2025-06-15', '2025-06-10')
        assert valid is False
        assert 'before' in msg.lower()

    def test_range_too_large(self):
        valid, msg, _ = validate_date_range('2025-01-01', '2025-06-01')
        assert valid is False
        assert '30' in msg

    def test_invalid_date_string(self):
        valid, msg, _ = validate_date_range('not-a-date', '2025-06-10')
        assert valid is False


class TestCoordinateValidation:
    def test_valid_coords(self):
        valid, msg = validate_coordinates(48.86, 2.35)
        assert valid is True

    def test_invalid_lat_too_high(self):
        valid, msg = validate_coordinates(91, 2.35)
        assert valid is False

    def test_invalid_lat_too_low(self):
        valid, msg = validate_coordinates(-91, 2.35)
        assert valid is False

    def test_invalid_lon_too_high(self):
        valid, msg = validate_coordinates(48.86, 181)
        assert valid is False

    def test_non_numeric(self):
        valid, msg = validate_coordinates('abc', 2.35)
        assert valid is False

    def test_none_values(self):
        valid, msg = validate_coordinates(None, None)
        assert valid is False

    def test_boundary_values(self):
        valid, _ = validate_coordinates(90, 180)
        assert valid is True
        valid, _ = validate_coordinates(-90, -180)
        assert valid is True


class TestAlertDataValidation:
    def test_valid_alert(self):
        valid, errors = validate_alert_data({
            'location': 'Paris', 'condition': 'temperature',
            'threshold_value': 30, 'threshold_type': 'greater_than',
        })
        assert valid is True

    def test_missing_location(self):
        valid, errors = validate_alert_data({
            'condition': 'rain', 'threshold_value': 70, 'threshold_type': 'greater_than',
        })
        assert valid is False

    def test_invalid_condition(self):
        valid, errors = validate_alert_data({
            'location': 'Paris', 'condition': 'earthquake',
            'threshold_value': 5, 'threshold_type': 'greater_than',
        })
        assert valid is False

    def test_missing_threshold(self):
        valid, errors = validate_alert_data({
            'location': 'Paris', 'condition': 'temperature',
            'threshold_type': 'greater_than',
        })
        assert valid is False

    def test_invalid_threshold_type(self):
        valid, errors = validate_alert_data({
            'location': 'Paris', 'condition': 'temperature',
            'threshold_value': 30, 'threshold_type': 'equals',
        })
        assert valid is False

    def test_non_numeric_threshold(self):
        valid, errors = validate_alert_data({
            'location': 'Paris', 'condition': 'temperature',
            'threshold_value': 'hot', 'threshold_type': 'greater_than',
        })
        assert valid is False
