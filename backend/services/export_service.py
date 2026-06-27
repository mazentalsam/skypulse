import csv
import io
import json
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom.minidom import parseString
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def export_json(record):
    return json.dumps(record, indent=2, default=str)


def export_xml(record):
    if not isinstance(record, list):
        record = [record]

    root = Element('WeatherReport')
    root.set('generator', 'SkyPulse')
    root.set('author', 'Mazen')

    for r in record:
        search_el = SubElement(root, 'Search')
        for key in ('id', 'city', 'country', 'latitude', 'longitude', 'search_query', 'notes', 'tags', 'mood_score', 'created_at'):
            val = r.get(key)
            if val is not None:
                child = SubElement(search_el, key.replace('_', '-'))
                child.text = str(val)

        weather = r.get('weather_data', {})
        if isinstance(weather, dict) and weather:
            w_el = SubElement(search_el, 'weather')
            main = weather.get('main', {})
            for k, v in main.items():
                child = SubElement(w_el, k.replace('_', '-'))
                child.text = str(v)
            wind = weather.get('wind', {})
            if wind:
                wind_el = SubElement(w_el, 'wind')
                for k, v in wind.items():
                    child = SubElement(wind_el, k)
                    child.text = str(v)
            desc = weather.get('weather', [{}])
            if desc:
                cond_el = SubElement(w_el, 'condition')
                cond_el.text = desc[0].get('description', '')

        if r.get('ai_briefing'):
            briefing_el = SubElement(search_el, 'ai-briefing')
            briefing_el.text = r['ai_briefing']

    raw = tostring(root, encoding='unicode')
    return parseString(raw).toprettyxml(indent='  ')


def export_csv(record):
    output = io.StringIO()
    writer = csv.writer(output)

    flat = {
        'id': record.get('id'),
        'city': record.get('city'),
        'country': record.get('country'),
        'latitude': record.get('latitude'),
        'longitude': record.get('longitude'),
        'search_query': record.get('search_query'),
        'date_from': record.get('date_from'),
        'date_to': record.get('date_to'),
        'notes': record.get('notes'),
        'tags': record.get('tags'),
        'mood_score': record.get('mood_score'),
        'ai_briefing': record.get('ai_briefing'),
        'created_at': record.get('created_at'),
    }

    weather = record.get('weather_data', {})
    if isinstance(weather, dict):
        main = weather.get('main', {})
        flat['temperature'] = main.get('temp')
        flat['feels_like'] = main.get('feels_like')
        flat['humidity'] = main.get('humidity')
        flat['wind_speed'] = weather.get('wind', {}).get('speed')
        flat['description'] = weather.get('weather', [{}])[0].get('description', '')

    writer.writerow(flat.keys())
    writer.writerow(flat.values())
    return output.getvalue()


def export_markdown(record):
    weather = record.get('weather_data', {})
    main = weather.get('main', {}) if isinstance(weather, dict) else {}
    wind = weather.get('wind', {}) if isinstance(weather, dict) else {}
    desc = weather.get('weather', [{}])[0].get('description', '') if isinstance(weather, dict) else ''

    lines = [
        f'# Weather Report: {record.get("city", "Unknown")}',
        '',
        f'**Location**: {record.get("city", "")} {record.get("country", "")}',
        f'**Coordinates**: {record.get("latitude", "")}, {record.get("longitude", "")}',
        f'**Search Query**: {record.get("search_query", "")}',
        f'**Date Range**: {record.get("date_from", "")} to {record.get("date_to", "")}' if record.get('date_from') and record.get('date_to') else f'**Date**: {record.get("created_at", "")}',
        '',
        '## Current Conditions',
        '',
        f'| Metric | Value |',
        f'|--------|-------|',
        f'| Description | {desc} |',
        f'| Temperature | {main.get("temp", "N/A")}°C |',
        f'| Feels Like | {main.get("feels_like", "N/A")}°C |',
        f'| Humidity | {main.get("humidity", "N/A")}% |',
        f'| Wind Speed | {wind.get("speed", "N/A")} m/s |',
        '',
    ]

    if record.get('ai_briefing'):
        lines.extend([
            '## AI Weather Briefing',
            '',
            record['ai_briefing'],
            '',
        ])

    if record.get('notes'):
        lines.extend([
            '## Notes',
            '',
            record['notes'],
            '',
        ])

    if record.get('tags'):
        lines.extend([
            f'**Tags**: {record["tags"]}',
            '',
        ])

    if record.get('mood_score'):
        lines.append(f'**Weather Mood Score**: {record["mood_score"]}/10')

    lines.extend([
        '',
        '---',
        '*Generated by SkyPulse Weather App — Built by Mazen for PM Accelerator*',
    ])

    return '\n'.join(lines)


def _format_date_range(record):
    date_from = record.get('date_from')
    date_to = record.get('date_to')
    if date_from and date_to:
        return f'{date_from} to {date_to}'
    return str(record.get('created_at', ''))[:10]


def export_pdf(records):
    if not isinstance(records, list):
        records = [records]

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch, bottomMargin=0.5 * inch,
                            leftMargin=0.6 * inch, rightMargin=0.6 * inch)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontSize=22, spaceAfter=4, textColor=colors.HexColor('#0f172a'),
    )
    subtitle_style = ParagraphStyle(
        'Subtitle', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#64748b'), spaceAfter=6,
    )
    section_style = ParagraphStyle(
        'Section', parent=styles['Heading2'],
        fontSize=13, spaceBefore=16, spaceAfter=8, textColor=colors.HexColor('#1e293b'),
    )
    detail_style = ParagraphStyle(
        'Detail', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#334155'), leading=14,
    )
    note_style = ParagraphStyle(
        'Note', parent=styles['Normal'],
        fontSize=9, textColor=colors.HexColor('#64748b'), leading=13, leftIndent=8,
        borderPadding=(4, 4, 4, 4),
    )

    story = []
    story.append(Paragraph('SkyPulse Weather Report', title_style))
    story.append(Paragraph('Built by Mazen | PM Accelerator AI Engineer Assessment', subtitle_style))

    divider_data = [[''] ]
    divider = Table(divider_data, colWidths=[6.8 * inch])
    divider.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(divider)

    table_data = [['City', 'Country', 'Temp (°C)', 'Feels Like', 'Humidity', 'Wind', 'Conditions', 'Date Range']]
    for r in records:
        weather = r.get('weather_data', {})
        main = weather.get('main', {}) if isinstance(weather, dict) else {}
        wind = weather.get('wind', {}) if isinstance(weather, dict) else {}
        desc = weather.get('weather', [{}])[0].get('description', '') if isinstance(weather, dict) else ''
        table_data.append([
            r.get('city', ''),
            r.get('country', ''),
            f'{main.get("temp", "N/A")}°' if main.get('temp') is not None else 'N/A',
            f'{main.get("feels_like", "N/A")}°' if main.get('feels_like') is not None else 'N/A',
            f'{main.get("humidity", "N/A")}%' if main.get('humidity') is not None else 'N/A',
            f'{wind.get("speed", "N/A")} m/s' if wind.get('speed') is not None else 'N/A',
            desc.capitalize() if desc else '—',
            _format_date_range(r),
        ])

    if len(table_data) > 1:
        story.append(Paragraph('Overview', section_style))
        col_widths = [0.9 * inch, 0.7 * inch, 0.7 * inch, 0.7 * inch, 0.7 * inch, 0.7 * inch, 1.1 * inch, 1.3 * inch]
        table = Table(table_data, repeatRows=1, colWidths=col_widths)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, 0), 8.5),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (5, -1), 'CENTER'),
            ('FONTSIZE', (0, 1), (-1, -1), 8.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(table)
        story.append(Spacer(1, 16))

    for r in records:
        has_details = r.get('ai_briefing') or r.get('notes') or r.get('mood_score')
        if not has_details:
            continue
        city_label = r.get('city', 'Unknown')
        date_label = _format_date_range(r)
        story.append(Paragraph(f'{city_label} — {date_label}', section_style))

        if r.get('notes'):
            notes_text = r['notes']
            if not notes_text.startswith('Date range search:'):
                story.append(Paragraph(f'<b>Notes:</b> {notes_text}', detail_style))
                story.append(Spacer(1, 4))

        if r.get('mood_score'):
            story.append(Paragraph(f'<b>Weather Mood Score:</b> {r["mood_score"]}/10', detail_style))
            story.append(Spacer(1, 4))

        if r.get('ai_briefing'):
            story.append(Paragraph('<b>AI Weather Briefing:</b>', detail_style))
            story.append(Spacer(1, 2))
            story.append(Paragraph(r['ai_briefing'], note_style))
            story.append(Spacer(1, 8))

    story.append(Spacer(1, 20))
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=8, textColor=colors.HexColor('#94a3b8'), alignment=1,
    )
    story.append(Paragraph('Generated by SkyPulse — Built by Mazen for PM Accelerator', footer_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
