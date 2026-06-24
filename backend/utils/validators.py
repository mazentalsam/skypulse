from datetime import datetime, date


def validate_search_query(query):
    if not query or not isinstance(query, str):
        return False, 'Search query is required'
    query = query.strip()
    if len(query) == 0:
        return False, 'Search query cannot be empty'
    if len(query) > 200:
        return False, 'Search query must be under 200 characters'
    return True, query


def validate_date_range(date_from, date_to):
    if not date_from or not date_to:
        return True, None, None

    try:
        d_from = datetime.strptime(date_from, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return False, 'Invalid start date format. Use YYYY-MM-DD', None

    try:
        d_to = datetime.strptime(date_to, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return False, 'Invalid end date format. Use YYYY-MM-DD', None

    if d_from > d_to:
        return False, 'Start date must be before end date', None

    max_range = 30
    if (d_to - d_from).days > max_range:
        return False, f'Date range cannot exceed {max_range} days', None

    return True, d_from.isoformat(), d_to.isoformat()


def validate_coordinates(lat, lon):
    try:
        lat = float(lat)
        lon = float(lon)
    except (ValueError, TypeError):
        return False, 'Coordinates must be numbers'

    if not (-90 <= lat <= 90):
        return False, 'Latitude must be between -90 and 90'
    if not (-180 <= lon <= 180):
        return False, 'Longitude must be between -180 and 180'

    return True, None


def validate_alert_data(data):
    errors = []
    if not data.get('location'):
        errors.append('Location is required')
    if not data.get('condition'):
        errors.append('Condition type is required')
    valid_conditions = ('temperature', 'rain', 'wind', 'humidity', 'uv')
    if data.get('condition') and data['condition'] not in valid_conditions:
        errors.append(f'Condition must be one of: {", ".join(valid_conditions)}')
    if data.get('threshold_value') is None:
        errors.append('Threshold value is required')
    else:
        try:
            float(data['threshold_value'])
        except (ValueError, TypeError):
            errors.append('Threshold value must be a number')
    valid_types = ('greater_than', 'less_than')
    if data.get('threshold_type') and data['threshold_type'] not in valid_types:
        errors.append(f'Threshold type must be one of: {", ".join(valid_types)}')
    if not data.get('threshold_type'):
        errors.append('Threshold type is required')

    return len(errors) == 0, errors
