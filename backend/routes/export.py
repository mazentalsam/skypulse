from flask import Blueprint, request, jsonify, Response
from backend import models
from backend.services.export_service import export_json, export_csv, export_markdown, export_pdf, export_xml

export_bp = Blueprint('export', __name__)


@export_bp.route('/export/<int:search_id>', methods=['GET'])
def export_record(search_id):
    record = models.get_search_by_id(search_id)
    if record is None:
        return jsonify({'error': 'Search not found'}), 404

    fmt = request.args.get('format', 'json').lower()

    if fmt == 'json':
        return Response(export_json(record), mimetype='application/json',
            headers={'Content-Disposition': f'attachment; filename=weather_{search_id}.json'})
    elif fmt == 'csv':
        return Response(export_csv(record), mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename=weather_{search_id}.csv'})
    elif fmt == 'markdown':
        return Response(export_markdown(record), mimetype='text/markdown',
            headers={'Content-Disposition': f'attachment; filename=weather_{search_id}.md'})
    elif fmt == 'xml':
        return Response(export_xml(record), mimetype='application/xml',
            headers={'Content-Disposition': f'attachment; filename=weather_{search_id}.xml'})
    elif fmt == 'pdf':
        return Response(export_pdf(record), mimetype='application/pdf',
            headers={'Content-Disposition': f'attachment; filename=weather_{search_id}.pdf'})
    else:
        return jsonify({'error': f'Unsupported format: {fmt}. Use json, csv, markdown, xml, or pdf'}), 400


@export_bp.route('/export/all', methods=['GET'])
def export_all():
    records = models.get_all_searches()
    if not records:
        return jsonify({'error': 'No records to export'}), 404

    fmt = request.args.get('format', 'pdf').lower()

    if fmt == 'pdf':
        return Response(export_pdf(records), mimetype='application/pdf',
            headers={'Content-Disposition': 'attachment; filename=weather_report_all.pdf'})
    elif fmt == 'json':
        return Response(export_json(records), mimetype='application/json',
            headers={'Content-Disposition': 'attachment; filename=weather_all.json'})
    elif fmt == 'xml':
        return Response(export_xml(records), mimetype='application/xml',
            headers={'Content-Disposition': 'attachment; filename=weather_all.xml'})
    else:
        return jsonify({'error': f'Unsupported bulk format: {fmt}. Use pdf, json, or xml'}), 400
