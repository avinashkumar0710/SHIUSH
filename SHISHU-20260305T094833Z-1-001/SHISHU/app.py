"""
SHIUSH Clinics - Flask Backend
Serves the website and provides admin API endpoints.
Run: python app.py
"""

from flask import Flask, request, jsonify, send_from_directory, send_file, abort
import json
import os
import uuid
from datetime import datetime
from functools import wraps

app = Flask(__name__, static_folder='.', static_url_path='')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'data.json')
APPOINTMENTS_FILE = os.path.join(BASE_DIR, 'appointments.json')
FEEDBACK_FILE = os.path.join(BASE_DIR, 'feedback.json')

# ─── Helpers ───────────────────────────────────────────────────────────────

def read_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('X-Admin-Token', '')
        data = read_json(DATA_FILE)
        if token != data.get('admin_password', ''):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

# ─── Static Files ──────────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/admin/')
@app.route('/admin/index.html')
def admin():
    return send_from_directory(os.path.join(BASE_DIR, 'admin'), 'index.html')

@app.route('/admin/<path:filename>')
def admin_static(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'admin'), filename)

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)

# ─── Public API ────────────────────────────────────────────────────────────

@app.route('/api/content', methods=['GET'])
def get_content():
    data = read_json(DATA_FILE)
    # Don't expose admin password to frontend
    public = {k: v for k, v in data.items() if k != 'admin_password'}
    return jsonify(public)

@app.route('/api/appointment', methods=['POST'])
def submit_appointment():
    body = request.get_json(silent=True) or {}
    required = ['name', 'phone']
    if not all(body.get(f) for f in required):
        return jsonify({'error': 'Name and phone are required'}), 400

    appointments = read_json(APPOINTMENTS_FILE)
    entry = {
        'id': str(uuid.uuid4())[:8],
        'name': body.get('name', '').strip(),
        'phone': body.get('phone', '').strip(),
        'service': body.get('service', ''),
        'date': body.get('date', ''),
        'time': body.get('time', ''),
        'message': body.get('message', ''),
        'status': 'new',
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
    }
    appointments.append(entry)
    write_json(APPOINTMENTS_FILE, appointments)
    return jsonify({'success': True, 'id': entry['id']}), 201

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    body = request.get_json(silent=True) or {}
    if not body.get('name') or not body.get('message'):
        return jsonify({'error': 'Name and message are required'}), 400

    feedbacks = read_json(FEEDBACK_FILE)
    entry = {
        'id': str(uuid.uuid4())[:8],
        'name': body.get('name', '').strip(),
        'message': body.get('message', '').strip(),
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
    }
    feedbacks.append(entry)
    write_json(FEEDBACK_FILE, feedbacks)
    return jsonify({'success': True}), 201

# ─── Admin API ─────────────────────────────────────────────────────────────

@app.route('/api/login', methods=['POST'])
def admin_login():
    body = request.get_json(silent=True) or {}
    data = read_json(DATA_FILE)
    if body.get('password') == data.get('admin_password'):
        return jsonify({'success': True, 'token': data['admin_password']})
    return jsonify({'error': 'Invalid password'}), 401

@app.route('/api/content', methods=['POST'])
@require_admin
def update_content():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({'error': 'No data provided'}), 400

    data = read_json(DATA_FILE)
    # Preserve admin password
    admin_pwd = data.get('admin_password')
    data.update(body)
    data['admin_password'] = admin_pwd
    write_json(DATA_FILE, data)
    return jsonify({'success': True})

@app.route('/api/appointments', methods=['GET'])
@require_admin
def get_appointments():
    appointments = read_json(APPOINTMENTS_FILE)
    return jsonify(sorted(appointments, key=lambda x: x['timestamp'], reverse=True))

@app.route('/api/appointments/<appt_id>', methods=['PATCH'])
@require_admin
def update_appointment(appt_id):
    body = request.get_json(silent=True) or {}
    appointments = read_json(APPOINTMENTS_FILE)
    for appt in appointments:
        if appt['id'] == appt_id:
            appt['status'] = body.get('status', appt['status'])
            break
    write_json(APPOINTMENTS_FILE, appointments)
    return jsonify({'success': True})

@app.route('/api/appointments/<appt_id>', methods=['DELETE'])
@require_admin
def delete_appointment(appt_id):
    appointments = read_json(APPOINTMENTS_FILE)
    appointments = [a for a in appointments if a['id'] != appt_id]
    write_json(APPOINTMENTS_FILE, appointments)
    return jsonify({'success': True})

@app.route('/api/feedbacks', methods=['GET'])
@require_admin
def get_feedbacks():
    feedbacks = read_json(FEEDBACK_FILE)
    return jsonify(sorted(feedbacks, key=lambda x: x['timestamp'], reverse=True))

@app.route('/api/feedbacks/<fb_id>', methods=['DELETE'])
@require_admin
def delete_feedback(fb_id):
    feedbacks = read_json(FEEDBACK_FILE)
    feedbacks = [f for f in feedbacks if f['id'] != fb_id]
    write_json(FEEDBACK_FILE, feedbacks)
    return jsonify({'success': True})

@app.route('/api/change-password', methods=['POST'])
@require_admin
def change_password():
    body = request.get_json(silent=True) or {}
    new_pwd = body.get('new_password', '').strip()
    if len(new_pwd) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    data = read_json(DATA_FILE)
    data['admin_password'] = new_pwd
    write_json(DATA_FILE, data)
    return jsonify({'success': True, 'token': new_pwd})

# ─── Run ───────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("\n🏥 SHIUSH Clinics Server")
    print("   Site:  http://localhost:8765")
    print("   Admin: http://localhost:8765/admin/")
    print("   Press Ctrl+C to stop\n")
    app.run(host='0.0.0.0', port=8765, debug=True, use_reloader=False)
