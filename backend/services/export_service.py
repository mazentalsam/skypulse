import csv
import io
import json
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom.minidom import parseString
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable


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


def _round_val(val):
    if val is None:
        return 'N/A'
    try:
        return str(round(float(val)))
    except (ValueError, TypeError):
        return str(val)


def _build_stat_card(label, value, unit=''):
    label_style = ParagraphStyle('StatLabel', fontSize=8, textColor=colors.HexColor('#94a3b8'),
                                  fontName='Helvetica', alignment=TA_CENTER, leading=10)
    value_style = ParagraphStyle('StatValue', fontSize=22, textColor=colors.white,
                                  fontName='Helvetica-Bold', alignment=TA_CENTER, leading=26)
    unit_style = ParagraphStyle('StatUnit', fontSize=8, textColor=colors.HexColor('#64748b'),
                                 fontName='Helvetica', alignment=TA_CENTER, leading=10)
    cell = [[Paragraph(label.upper(), label_style)],
            [Paragraph(str(value), value_style)],
            [Paragraph(unit, unit_style)]]
    t = Table(cell, colWidths=[1.55 * inch], rowHeights=[14, 30, 14])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    return t


def export_pdf(records):
    if not isinstance(records, list):
        records = [records]

    buffer = io.BytesIO()
    page_w = letter[0]
    margin = 0.6 * inch
    content_w = page_w - 2 * margin
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0, bottomMargin=0.4 * inch,
                            leftMargin=margin, rightMargin=margin)
    styles = getSampleStyleSheet()

    story = []

    # ── Dark header banner ──
    header_title = ParagraphStyle('HTitle', fontSize=26, textColor=colors.white,
                                   fontName='Helvetica-Bold', alignment=TA_LEFT, leading=32)
    header_sub = ParagraphStyle('HSub', fontSize=10, textColor=colors.HexColor('#94a3b8'),
                                 fontName='Helvetica', alignment=TA_LEFT, leading=14)
    header_cell = [
        [Paragraph('SkyPulse', header_title)],
        [Paragraph('Weather Report', ParagraphStyle('HTitle2', fontSize=16, textColor=colors.HexColor('#38bdf8'),
                                                      fontName='Helvetica', alignment=TA_LEFT, leading=20))],
        [Spacer(1, 4)],
        [Paragraph('Built by Mazen  |  PM Accelerator AI Engineer Assessment', header_sub)],
    ]
    header = Table(header_cell, colWidths=[content_w])
    header.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0f172a')),
        ('LEFTPADDING', (0, 0), (-1, -1), 24),
        ('RIGHTPADDING', (0, 0), (-1, -1), 24),
        ('TOPPADDING', (0, 0), (0, 0), 28),
        ('BOTTOMPADDING', (-1, -1), (-1, -1), 24),
    ]))
    story.append(header)
    story.append(Spacer(1, 20))

    # ── Per-city sections ──
    for idx, r in enumerate(records):
        weather = r.get('weather_data', {})
        main = weather.get('main', {}) if isinstance(weather, dict) else {}
        wind_data = weather.get('wind', {}) if isinstance(weather, dict) else {}
        desc_list = weather.get('weather', [{}]) if isinstance(weather, dict) else [{}]
        desc = desc_list[0].get('description', '') if desc_list else ''

        city = r.get('city', 'Unknown')
        country = r.get('country', '')
        date_label = _format_date_range(r)

        # City header bar
        city_title = ParagraphStyle('CityTitle', fontSize=18, textColor=colors.HexColor('#0f172a'),
                                     fontName='Helvetica-Bold', leading=22)
        city_meta = ParagraphStyle('CityMeta', fontSize=9, textColor=colors.HexColor('#64748b'),
                                    fontName='Helvetica', leading=12)
        location_label = f'{city}, {country}' if country else city
        city_header = Table(
            [[Paragraph(location_label, city_title), Paragraph(date_label, ParagraphStyle(
                'DateRight', fontSize=9, textColor=colors.HexColor('#64748b'),
                fontName='Helvetica', alignment=2, leading=12))]],
            colWidths=[content_w * 0.6, content_w * 0.4],
        )
        city_header.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(city_header)

        # Accent line
        story.append(HRFlowable(width='100%', thickness=2, color=colors.HexColor('#38bdf8'),
                                 spaceAfter=14, spaceBefore=4))

        # Big temperature + condition
        temp_val = _round_val(main.get('temp'))
        temp_display = f'{temp_val}°C' if temp_val != 'N/A' else 'N/A'
        big_temp = ParagraphStyle('BigTemp', fontSize=48, textColor=colors.HexColor('#0f172a'),
                                   fontName='Helvetica-Bold', alignment=TA_LEFT, leading=52)
        cond_style = ParagraphStyle('Cond', fontSize=14, textColor=colors.HexColor('#64748b'),
                                     fontName='Helvetica', alignment=TA_LEFT, leading=18)
        temp_block = Table(
            [[Paragraph(temp_display, big_temp)],
             [Paragraph(desc.capitalize() if desc else '—', cond_style)]],
            colWidths=[content_w],
        )
        temp_block.setStyle(TableStyle([
            ('BOTTOMPADDING', (0, 0), (0, 0), 2),
            ('TOPPADDING', (0, 1), (0, 1), 0),
        ]))
        story.append(temp_block)
        story.append(Spacer(1, 16))

        # Stat cards row
        feels = _round_val(main.get('feels_like'))
        humidity = _round_val(main.get('humidity'))
        wind_speed = _round_val(wind_data.get('speed'))
        visibility = weather.get('visibility') if isinstance(weather, dict) else None
        vis_val = _round_val(visibility / 1000 if visibility else None)

        cards = [
            _build_stat_card('Feels Like', f'{feels}°', 'Celsius'),
            _build_stat_card('Humidity', f'{humidity}', 'Percent'),
            _build_stat_card('Wind', f'{wind_speed}', 'm/s'),
            _build_stat_card('Visibility', f'{vis_val}', 'km'),
        ]
        card_row = Table([cards], colWidths=[content_w / 4] * 4)
        card_row.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(card_row)
        story.append(Spacer(1, 16))

        # Details table
        detail_rows = [
            ['Metric', 'Value'],
            ['Temperature', f'{temp_val}°C'],
            ['Feels Like', f'{feels}°C'],
            ['Humidity', f'{humidity}%'],
            ['Wind Speed', f'{wind_speed} m/s'],
            ['Visibility', f'{vis_val} km'],
            ['Condition', desc.capitalize() if desc else '—'],
            ['Pressure', f'{_round_val(main.get("pressure"))} hPa'],
        ]
        detail_table = Table(detail_rows, colWidths=[content_w * 0.4, content_w * 0.6])
        detail_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#334155')),
            ('FONTSIZE', (0, 1), (-1, -1), 9.5),
            ('TEXTCOLOR', (0, 1), (0, -1), colors.HexColor('#64748b')),
            ('TEXTCOLOR', (1, 1), (1, -1), colors.HexColor('#0f172a')),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('TOPPADDING', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(detail_table)
        story.append(Spacer(1, 12))

        # Notes / AI briefing
        if r.get('notes'):
            notes_text = r['notes']
            if not notes_text.startswith('Date range search:'):
                note_label = ParagraphStyle('NoteLabel', fontSize=10, textColor=colors.HexColor('#334155'),
                                             fontName='Helvetica-Bold', leading=14)
                note_body = ParagraphStyle('NoteBody', fontSize=9.5, textColor=colors.HexColor('#475569'),
                                            fontName='Helvetica', leading=14, leftIndent=8)
                story.append(Paragraph('Notes', note_label))
                story.append(Spacer(1, 2))
                story.append(Paragraph(notes_text, note_body))
                story.append(Spacer(1, 8))

        if r.get('mood_score'):
            mood_style = ParagraphStyle('Mood', fontSize=10, textColor=colors.HexColor('#334155'),
                                         fontName='Helvetica', leading=14)
            story.append(Paragraph(f'<b>Weather Mood Score:</b>  {r["mood_score"]} / 10', mood_style))
            story.append(Spacer(1, 8))

        if r.get('ai_briefing'):
            ai_label = ParagraphStyle('AILabel', fontSize=11, textColor=colors.HexColor('#0f172a'),
                                       fontName='Helvetica-Bold', leading=14, spaceBefore=4)
            ai_body = ParagraphStyle('AIBody', fontSize=9.5, textColor=colors.HexColor('#475569'),
                                      fontName='Helvetica', leading=14, leftIndent=10, rightIndent=10,
                                      spaceBefore=4, spaceAfter=4)
            story.append(Paragraph('AI Weather Briefing', ai_label))
            # Briefing in a tinted box
            briefing_cell = [[Paragraph(r['ai_briefing'], ai_body)]]
            briefing_box = Table(briefing_cell, colWidths=[content_w - 8])
            briefing_box.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f9ff')),
                ('ROUNDEDCORNERS', [6, 6, 6, 6]),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('LEFTPADDING', (0, 0), (-1, -1), 12),
                ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ]))
            story.append(briefing_box)
            story.append(Spacer(1, 12))

        if idx < len(records) - 1:
            story.append(Spacer(1, 8))
            story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#cbd5e1'),
                                     spaceAfter=16, spaceBefore=8))

    # ── Footer ──
    story.append(Spacer(1, 24))
    footer_style = ParagraphStyle('Footer', fontSize=8, textColor=colors.HexColor('#94a3b8'),
                                   fontName='Helvetica', alignment=TA_CENTER, leading=11)
    story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#e2e8f0'),
                             spaceAfter=8))
    story.append(Paragraph('Generated by SkyPulse  —  Built by Mazen for PM Accelerator', footer_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
