import json


class TestSearchesCRUD:
    def test_create_search(self, client, sample_search_data):
        resp = client.post('/api/searches', json=sample_search_data)
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['city'] == 'Paris'
        assert data['id'] is not None

    def test_create_search_missing_city(self, client):
        resp = client.post('/api/searches', json={
            'latitude': 48.86, 'longitude': 2.35,
            'search_query': 'test', 'weather_data': {'temp': 20},
        })
        assert resp.status_code == 400

    def test_create_search_missing_body(self, client):
        resp = client.post('/api/searches', content_type='application/json')
        assert resp.status_code == 400

    def test_read_all_searches(self, client, sample_search_data):
        client.post('/api/searches', json=sample_search_data)
        client.post('/api/searches', json={**sample_search_data, 'city': 'London'})
        resp = client.get('/api/searches')
        assert resp.status_code == 200
        assert len(resp.get_json()) == 2

    def test_read_single_search(self, client, sample_search_data):
        create_resp = client.post('/api/searches', json=sample_search_data)
        search_id = create_resp.get_json()['id']
        resp = client.get(f'/api/searches/{search_id}')
        assert resp.status_code == 200
        assert resp.get_json()['city'] == 'Paris'

    def test_read_not_found(self, client):
        resp = client.get('/api/searches/999')
        assert resp.status_code == 404

    def test_update_search(self, client, sample_search_data):
        create_resp = client.post('/api/searches', json=sample_search_data)
        search_id = create_resp.get_json()['id']
        resp = client.put(f'/api/searches/{search_id}', json={
            'notes': 'Great weather', 'tags': 'travel,europe',
        })
        assert resp.status_code == 200
        assert resp.get_json()['notes'] == 'Great weather'
        assert resp.get_json()['tags'] == 'travel,europe'

    def test_update_not_found(self, client):
        resp = client.put('/api/searches/999', json={'notes': 'test'})
        assert resp.status_code == 404

    def test_delete_search(self, client, sample_search_data):
        create_resp = client.post('/api/searches', json=sample_search_data)
        search_id = create_resp.get_json()['id']
        resp = client.delete(f'/api/searches/{search_id}')
        assert resp.status_code == 200
        resp = client.get(f'/api/searches/{search_id}')
        assert resp.status_code == 404

    def test_delete_not_found(self, client):
        resp = client.delete('/api/searches/999')
        assert resp.status_code == 404


class TestAlertsCRUD:
    def test_create_alert(self, client, sample_alert_data):
        resp = client.post('/api/alerts', json=sample_alert_data)
        assert resp.status_code == 201
        assert resp.get_json()['condition'] == 'temperature'

    def test_create_alert_invalid(self, client):
        resp = client.post('/api/alerts', json={
            'location': 'Paris', 'latitude': 48.86, 'longitude': 2.35,
            'condition': 'invalid_type', 'threshold_value': 30, 'threshold_type': 'greater_than',
        })
        assert resp.status_code == 400

    def test_read_alerts(self, client, sample_alert_data):
        client.post('/api/alerts', json=sample_alert_data)
        resp = client.get('/api/alerts')
        assert resp.status_code == 200
        assert len(resp.get_json()) == 1

    def test_update_alert(self, client, sample_alert_data):
        create_resp = client.post('/api/alerts', json=sample_alert_data)
        alert_id = create_resp.get_json()['id']
        resp = client.put(f'/api/alerts/{alert_id}', json={'threshold_value': 35.0})
        assert resp.status_code == 200

    def test_delete_alert(self, client, sample_alert_data):
        create_resp = client.post('/api/alerts', json=sample_alert_data)
        alert_id = create_resp.get_json()['id']
        resp = client.delete(f'/api/alerts/{alert_id}')
        assert resp.status_code == 200


class TestDashboard:
    def test_dashboard_empty(self, client):
        resp = client.get('/api/dashboard/stats')
        assert resp.status_code == 200
        assert resp.get_json()['total_searches'] == 0

    def test_dashboard_with_data(self, client, sample_search_data):
        client.post('/api/searches', json=sample_search_data)
        client.post('/api/searches', json=sample_search_data)
        resp = client.get('/api/dashboard/stats')
        data = resp.get_json()
        assert data['total_searches'] == 2
        assert data['top_city']['city'] == 'Paris'


class TestHealthEndpoint:
    def test_health(self, client):
        resp = client.get('/api/health')
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['status'] == 'ok'
        assert data['demo_mode'] is True
        assert data['db_connected'] is True
        assert 'version' in data


class TestExport:
    def test_export_json(self, client, sample_search_data):
        create_resp = client.post('/api/searches', json=sample_search_data)
        search_id = create_resp.get_json()['id']
        resp = client.get(f'/api/export/{search_id}?format=json')
        assert resp.status_code == 200
        assert resp.content_type == 'application/json'

    def test_export_csv(self, client, sample_search_data):
        create_resp = client.post('/api/searches', json=sample_search_data)
        search_id = create_resp.get_json()['id']
        resp = client.get(f'/api/export/{search_id}?format=csv')
        assert resp.status_code == 200
        assert 'text/csv' in resp.content_type

    def test_export_markdown(self, client, sample_search_data):
        create_resp = client.post('/api/searches', json=sample_search_data)
        search_id = create_resp.get_json()['id']
        resp = client.get(f'/api/export/{search_id}?format=markdown')
        assert resp.status_code == 200
        assert 'Paris' in resp.data.decode()

    def test_export_pdf(self, client, sample_search_data):
        create_resp = client.post('/api/searches', json=sample_search_data)
        search_id = create_resp.get_json()['id']
        resp = client.get(f'/api/export/{search_id}?format=pdf')
        assert resp.status_code == 200
        assert resp.content_type == 'application/pdf'

    def test_export_not_found(self, client):
        resp = client.get('/api/export/999?format=json')
        assert resp.status_code == 404

    def test_export_xml(self, client, sample_search_data):
        create_resp = client.post('/api/searches', json=sample_search_data)
        search_id = create_resp.get_json()['id']
        resp = client.get(f'/api/export/{search_id}?format=xml')
        assert resp.status_code == 200
        assert 'application/xml' in resp.content_type
        assert b'<WeatherReport' in resp.data

    def test_export_invalid_format(self, client, sample_search_data):
        create_resp = client.post('/api/searches', json=sample_search_data)
        search_id = create_resp.get_json()['id']
        resp = client.get(f'/api/export/{search_id}?format=yaml')
        assert resp.status_code == 400
