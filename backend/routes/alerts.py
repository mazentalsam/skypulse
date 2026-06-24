from flask import Blueprint, request, jsonify
from backend import models
from backend.utils.validators import validate_alert_data

alerts_bp = Blueprint('alerts', __name__)


@alerts_bp.route('/alerts', methods=['POST'])
def create_alert():
    """Create a weather alert threshold.
    ---
    tags:
      - Alerts
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required: [location, latitude, longitude, condition, threshold_value, threshold_type]
          properties:
            location: {type: string}
            latitude: {type: number}
            longitude: {type: number}
            condition: {type: string, enum: [temperature, rain, wind, humidity, uv]}
            threshold_value: {type: number}
            threshold_type: {type: string, enum: [greater_than, less_than]}
    responses:
      201:
        description: Created alert
      400:
        description: Validation error
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    valid, errors = validate_alert_data(data)
    if not valid:
        return jsonify({'error': errors}), 400

    result = models.create_alert(data)
    return jsonify(result), 201


@alerts_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """List all weather alerts.
    ---
    tags:
      - Alerts
    responses:
      200:
        description: Array of alert records
    """
    alerts = models.get_all_alerts()
    return jsonify(alerts)


@alerts_bp.route('/alerts/<int:alert_id>', methods=['PUT'])
def update_alert(alert_id):
    existing = models.get_alert_by_id(alert_id)
    if existing is None:
        return jsonify({'error': 'Alert not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    result = models.update_alert(alert_id, data)
    return jsonify(result)


@alerts_bp.route('/alerts/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    existing = models.get_alert_by_id(alert_id)
    if existing is None:
        return jsonify({'error': 'Alert not found'}), 404

    models.delete_alert(alert_id)
    return jsonify({'message': 'Alert deleted successfully'}), 200
