// ── API URL Map (Flask → PHP) ──────────────────────────────────────────────
const API = {
    content: '/api/content.php',
    login: '/api/login.php',
    saveContent: '/api/save-content.php',
    appointment: '/api/appointment.php',
    feedback: '/api/feedback.php',
    appointments: '/api/appointments.php',
    updateAppointment: '/api/update-appointment.php',
    deleteAppointment: '/api/delete-appointment.php',
    feedbacks: '/api/feedbacks.php',
    deleteFeedback: '/api/delete-feedback.php',
    changePassword: '/api/change-password.php',
};


// ── State ───────────────────────────────────────────────────────────────────
let TOKEN = sessionStorage.getItem('admin_token') || '';
let DATA = {};
let currentPanel = 'dashboard';

const PANEL_META = {
    dashboard: { title: 'Dashboard', sub: 'Overview of your clinic website' },
    clinic: { title: 'Clinic Info', sub: 'Update clinic contact information and fees' },
    doctor: { title: 'Doctor', sub: 'Edit Dr. Nitish Shukla\'s profile' },
    hero: { title: 'Hero Section', sub: 'Manage the homepage hero content' },
    stats: { title: 'Stats Bar', sub: 'Update the statistics displayed on the homepage' },
    about: { title: 'About Section', sub: 'Edit the clinic introduction text' },
    services: { title: 'Services', sub: 'Add, edit, or remove service cards' },
    faq: { title: 'FAQ', sub: 'Manage frequently asked questions' },
    news: { title: 'News & Updates', sub: 'Add or update news and announcements' },
    warrior: { title: 'Our Warrior', sub: 'Edit the patient recovery story' },
    appointments: { title: 'Appointments', sub: 'Manage appointment booking requests' },
    feedback: { title: 'Patient Feedback', sub: 'View feedback submitted by patients' },
    password: { title: 'Change Password', sub: 'Update the admin login password' },
};

// ── Boot ────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    if (TOKEN) checkTokenAndLoad();
    document.getElementById('loginPassword').addEventListener('keydown', e => {
        if (e.key === 'Enter') doLogin();
    });
});

async function checkTokenAndLoad() {
    try {
        const res = await api('GET', API.content);
        DATA = await res.json();
        showApp();
        loadAllData();
    } catch {
        TOKEN = '';
        sessionStorage.removeItem('admin_token');
    }
}

// ── Auth ────────────────────────────────────────────────────────────────────
async function doLogin() {
    const pwd = document.getElementById('loginPassword').value.trim();
    const err = document.getElementById('loginError');
    err.style.display = 'none';
    if (!pwd) return;

    try {
        const res = await fetch(API.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
        });
        if (res.ok) {
            const data = await res.json();
            TOKEN = data.token;
            sessionStorage.setItem('admin_token', TOKEN);
            const res2 = await api('GET', API.content);
            DATA = await res2.json();
            showApp();
            loadAllData();
        } else {
            err.style.display = 'block';
            document.getElementById('loginPassword').value = '';
        }
    } catch {
        err.textContent = '❌ Could not connect to server.';
        err.style.display = 'block';
    }
}

function doLogout() {
    TOKEN = '';
    sessionStorage.removeItem('admin_token');
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginPassword').value = '';
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
}

// ── API Helper — always POST for PHP compatibility ────────────────────────────
function api(method, url, body) {
    const opts = {
        method: method === 'GET' ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': TOKEN }
    };
    if (body) opts.body = JSON.stringify(body);
    return fetch(url, opts);
}

// ── Panel Navigation ────────────────────────────────────────────────────────
function showPanel(name, el) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const panel = document.getElementById('panel-' + name);
    if (panel) panel.classList.add('active');
    if (el) el.classList.add('active');

    currentPanel = name;
    const meta = PANEL_META[name] || {};
    document.getElementById('topbarTitle').textContent = meta.title || name;
    document.getElementById('topbarSub').textContent = meta.sub || '';

    const saveBtn = document.getElementById('saveBtn');
    const noSave = ['dashboard', 'appointments', 'feedback', 'password'];
    saveBtn.style.display = noSave.includes(name) ? 'none' : 'flex';

    // Load live data for inbox panels
    if (name === 'appointments') loadAppointments();
    if (name === 'feedback') loadFeedback();
}

// ── Load All Data ────────────────────────────────────────────────────────────
async function loadAllData() {
    populateClinic();
    populateDoctor();
    populateHero();
    populateStats();
    populateAbout();
    populateServices();
    populateFaq();
    populateNews();
    populateWarrior();
    updateDashboard();
    refreshBadges();
}

// ── Dashboard ────────────────────────────────────────────────────────────────
async function updateDashboard() {
    const [apptRes, fbRes] = await Promise.all([
        api('GET', API.appointments),
        api('GET', API.feedbacks)
    ]);
    const appts = await apptRes.json();
    const fbs = await fbRes.json();

    const newAppts = appts.filter(a => a.status === 'new').length;
    document.getElementById('dashStats').innerHTML = `
    <div class="dash-card teal">
      <div class="dash-card-icon">📅</div>
      <div class="dash-card-label">Total Appointments</div>
      <div class="dash-card-value">${appts.length}</div>
    </div>
    <div class="dash-card red">
      <div class="dash-card-icon">🆕</div>
      <div class="dash-card-label">New Requests</div>
      <div class="dash-card-value">${newAppts}</div>
    </div>
    <div class="dash-card">
      <div class="dash-card-icon">⭐</div>
      <div class="dash-card-label">Feedback Received</div>
      <div class="dash-card-value">${fbs.length}</div>
    </div>
    <div class="dash-card">
      <div class="dash-card-icon">🩺</div>
      <div class="dash-card-label">Services Listed</div>
      <div class="dash-card-value">${(DATA.services || []).length}</div>
    </div>
  `;

    // Update nav badges
    if (newAppts > 0) {
        const b = document.getElementById('apptBadge');
        b.textContent = newAppts; b.style.display = 'inline';
    }
}

async function refreshBadges() {
    try {
        const res = await api('GET', API.appointments);
        const appts = await res.json();
        const count = appts.filter(a => a.status === 'new').length;
        const b = document.getElementById('apptBadge');
        if (count > 0) { b.textContent = count; b.style.display = 'inline'; }
        else b.style.display = 'none';
    } catch { }
}

// ── Populate Forms ────────────────────────────────────────────────────────────
function val(id, v) { const el = document.getElementById(id); if (el) el.value = v ?? ''; }
function getVal(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function getNum(id) { return parseInt(getVal(id)) || 0; }

function populateClinic() {
    const c = DATA.clinic || {};
    val('clinic_name', c.name || '');
    val('clinic_tagline', c.tagline || '');
    val('clinic_phone1', c.phone1 || '');
    val('clinic_phone2', c.phone2 || '');
    val('clinic_email', c.email || '');
    val('clinic_address', c.address || '');
    val('clinic_timings', c.timings || '');
    val('clinic_fee_messaging', c.fee_messaging || 100);
    val('clinic_fee_video', c.fee_video || 300);
}

function populateDoctor() {
    const d = DATA.doctor || {};
    val('doctor_name', d.name || '');
    val('doctor_degree', d.degree || '');
    val('doctor_title', d.title || '');
    val('doctor_bio', d.bio || '');
    val('doctor_badges', (d.badges || []).join('\n'));
}

function populateHero() {
    const h = DATA.hero || {};
    val('hero_badge', h.badge || '');
    val('hero_description', h.description || '');
    val('hero_typewriter', (h.typewriter_phrases || []).join('\n'));
}

function populateStats() {
    const s = DATA.stats || {};
    val('stats_patients', s.patients || 500);
    val('stats_years', s.years || 5);
    val('stats_fee', s.starting_fee || 100);
    val('stats_days', s.days_per_week || 6);
}

function populateAbout() {
    const a = DATA.about || {};
    val('about_title', a.title || '');
    val('about_subtitle', a.subtitle || '');
}

function populateServices() {
    const list = DATA.services || [];
    const el = document.getElementById('services-list');
    el.innerHTML = list.map((s, i) => serviceRow(s, i)).join('');
}

function serviceRow(s, i) {
    return `
  <div class="list-item" id="svc-${i}">
    <div class="list-item-header">
      <div class="list-item-num">Service ${i + 1}</div>
      <button class="delete-item-btn" onclick="removeItem('services', ${i})">✕</button>
    </div>
    <div class="form-grid">
      <div class="form-group"><label>Icon (emoji)</label><input value="${s.icon || ''}" oninput="updateItem('services',${i},'icon',this.value)"></div>
      <div class="form-group"><label>Service Name</label><input value="${s.name || ''}" oninput="updateItem('services',${i},'name',this.value)"></div>
      <div class="form-group full"><label>Description</label><textarea oninput="updateItem('services',${i},'desc',this.value)">${s.desc || ''}</textarea></div>
    </div>
  </div>`;
}

function populateFaq() {
    const list = DATA.faq || [];
    const el = document.getElementById('faq-list');
    el.innerHTML = list.map((f, i) => faqRow(f, i)).join('');
}

function faqRow(f, i) {
    return `
  <div class="list-item">
    <div class="list-item-header">
      <div class="list-item-num">FAQ ${i + 1}</div>
      <button class="delete-item-btn" onclick="removeItem('faq', ${i})">✕</button>
    </div>
    <div class="form-group"><label>Question</label><input value="${esc(f.question || '')}" oninput="updateItem('faq',${i},'question',this.value)"></div>
    <div class="form-group"><label>Answer</label><textarea oninput="updateItem('faq',${i},'answer',this.value)">${esc(f.answer || '')}</textarea></div>
  </div>`;
}

function populateNews() {
    const list = DATA.news || [];
    const el = document.getElementById('news-list');
    el.innerHTML = list.map((n, i) => newsRow(n, i)).join('');
}

function newsRow(n, i) {
    return `
  <div class="list-item">
    <div class="list-item-header">
      <div class="list-item-num">News Card ${i + 1}</div>
      <button class="delete-item-btn" onclick="removeItem('news', ${i})">✕</button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Tag Type</label>
        <select oninput="updateItem('news',${i},'tag',this.value)">
          <option value="urgent" ${n.tag === 'urgent' ? 'selected' : ''}>🔴 Urgent</option>
          <option value="info"   ${n.tag === 'info' ? 'selected' : ''}>🎉 Info</option>
          <option value="update" ${n.tag === 'update' ? 'selected' : ''}>📋 Update</option>
        </select>
      </div>
      <div class="form-group"><label>Tag Label</label><input value="${esc(n.tag_label || '')}" oninput="updateItem('news',${i},'tag_label',this.value)"></div>
      <div class="form-group full"><label>Title</label><input value="${esc(n.title || '')}" oninput="updateItem('news',${i},'title',this.value)"></div>
      <div class="form-group full"><label>Body</label><textarea oninput="updateItem('news',${i},'body',this.value)">${esc(n.body || '')}</textarea></div>
      <div class="form-group full"><label>Meta (date, location info)</label><input value="${esc(n.meta || '')}" oninput="updateItem('news',${i},'meta',this.value)"></div>
    </div>
  </div>`;
}

function populateWarrior() {
    const w = DATA.warrior || {};
    val('warrior_name', w.name || '');
    val('warrior_age', w.age || '');
    val('warrior_condition', w.condition || '');
    val('warrior_story', w.story || '');
    val('warrior_quote', w.quote || '');
}

// ── Dynamic List Helpers ─────────────────────────────────────────────────────
function updateItem(key, idx, field, value) {
    if (!DATA[key]) return;
    DATA[key][idx][field] = value;
}

function removeItem(key, idx) {
    if (!DATA[key]) return;
    DATA[key].splice(idx, 1);
    if (key === 'services') populateServices();
    if (key === 'faq') populateFaq();
    if (key === 'news') populateNews();
}

function addService() {
    DATA.services = DATA.services || [];
    DATA.services.push({ icon: '🏥', name: 'New Service', desc: 'Service description here.' });
    populateServices();
}

function addFaq() {
    DATA.faq = DATA.faq || [];
    DATA.faq.push({ question: 'New Question?', answer: 'Answer here.' });
    populateFaq();
}

function addNews() {
    DATA.news = DATA.news || [];
    DATA.news.push({ tag: 'update', tag_label: '📋 Update', title: 'New Announcement', body: 'Details here.', meta: '' });
    populateNews();
}

// ── Save ─────────────────────────────────────────────────────────────────────
function collectCurrentSection() {
    const p = currentPanel;
    if (p === 'clinic') return {
        clinic: {
            name: getVal('clinic_name'),
            tagline: getVal('clinic_tagline'),
            phone1: getVal('clinic_phone1'),
            phone2: getVal('clinic_phone2'),
            email: getVal('clinic_email'),
            address: getVal('clinic_address'),
            timings: getVal('clinic_timings'),
            fee_messaging: getNum('clinic_fee_messaging'),
            fee_video: getNum('clinic_fee_video'),
        }
    };
    if (p === 'doctor') return {
        doctor: {
            name: getVal('doctor_name'),
            degree: getVal('doctor_degree'),
            title: getVal('doctor_title'),
            bio: getVal('doctor_bio'),
            badges: getVal('doctor_badges').split('\n').map(s => s.trim()).filter(Boolean),
        }
    };
    if (p === 'hero') return {
        hero: {
            badge: getVal('hero_badge'),
            description: getVal('hero_description'),
            typewriter_phrases: getVal('hero_typewriter').split('\n').map(s => s.trim()).filter(Boolean),
        }
    };
    if (p === 'stats') return {
        stats: {
            patients: getNum('stats_patients'),
            years: getNum('stats_years'),
            starting_fee: getNum('stats_fee'),
            days_per_week: getNum('stats_days'),
        }
    };
    if (p === 'about') return {
        about: {
            title: getVal('about_title'),
            subtitle: getVal('about_subtitle'),
        }
    };
    if (p === 'services') return { services: DATA.services };
    if (p === 'faq') return { faq: DATA.faq };
    if (p === 'news') return { news: DATA.news };
    if (p === 'warrior') return {
        warrior: {
            name: getVal('warrior_name'),
            age: getVal('warrior_age'),
            condition: getVal('warrior_condition'),
            story: getVal('warrior_story'),
            quote: getVal('warrior_quote'),
        }
    };
    return null;
}

async function saveCurrentSection() {
    const payload = collectCurrentSection();
    if (!payload) return;

    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Saving...';

    try {
        const res = await api('POST', API.saveContent, payload);
        if (res.ok) {
            Object.assign(DATA, payload);
            toast('✅ Changes saved successfully!', 'success');
        } else {
            toast('❌ Failed to save. Please try again.', 'error');
        }
    } catch {
        toast('❌ Server error. Check your connection.', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = '💾 Save Changes';
}

// ── Password ─────────────────────────────────────────────────────────────────
async function changePassword() {
    const np = document.getElementById('newPassword').value;
    const cp = document.getElementById('confirmPassword').value;
    if (!np || np.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    if (np !== cp) { toast('Passwords do not match', 'error'); return; }

    const res = await api('POST', API.changePassword, { new_password: np });
    if (res.ok) {
        const d = await res.json();
        TOKEN = d.token;
        sessionStorage.setItem('admin_token', TOKEN);
        toast('✅ Password changed successfully!', 'success');
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } else {
        toast('❌ Failed to change password', 'error');
    }
}

// ── Appointments ──────────────────────────────────────────────────────────────
async function loadAppointments() {
    const wrap = document.getElementById('appointments-table-wrap');
    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div>Loading...</div>';
    try {
        const res = await api('GET', API.appointments);
        const appts = await res.json();
        if (!appts.length) {
            wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div>No appointment requests yet.</div>';
            return;
        }
        wrap.innerHTML = `
      <table class="inbox-table">
        <thead><tr>
          <th>ID</th><th>Name</th><th>Phone</th><th>Service</th>
          <th>Date / Time</th><th>Message</th><th>Submitted</th><th>Status</th><th>Action</th>
        </tr></thead>
        <tbody>
          ${appts.map(a => `
          <tr>
            <td><code style="font-size:0.72rem;color:#64748B">#${a.id}</code></td>
            <td><strong>${esc(a.name)}</strong></td>
            <td><a href="tel:${a.phone}">${a.phone}</a></td>
            <td>${esc(a.service || '—')}</td>
            <td>${a.date || '—'}<br><small style="color:#94A3B8">${a.time || ''}</small></td>
            <td style="max-width:160px;font-size:0.82rem;color:#64748B">${esc(a.message || '—')}</td>
            <td style="font-size:0.78rem;color:#94A3B8;white-space:nowrap">${a.timestamp}</td>
            <td>
              <select class="status-select" onchange="updateAppointmentStatus('${a.id}', this.value)">
                <option value="new"       ${a.status === 'new' ? 'selected' : ''}>🆕 New</option>
                <option value="confirmed" ${a.status === 'confirmed' ? 'selected' : ''}>✅ Confirmed</option>
                <option value="done"      ${a.status === 'done' ? 'selected' : ''}>✔ Done</option>
              </select>
            </td>
            <td>
              <button class="action-btn delete" onclick="deleteAppointment('${a.id}')">🗑 Delete</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`;
        refreshBadges();
    } catch {
        wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">❌</div>Failed to load appointments.</div>';
    }
}

async function updateAppointmentStatus(id, status) {
    await api('POST', API.updateAppointment, { id, status });
    toast('Status updated', 'info');
    refreshBadges();
}

async function deleteAppointment(id) {
    if (!confirm('Delete this appointment?')) return;
    await api('POST', API.deleteAppointment, { id });
    toast('Appointment deleted', 'success');
    loadAppointments();
}

// ── Feedback ──────────────────────────────────────────────────────────────────
async function loadFeedback() {
    const wrap = document.getElementById('feedback-table-wrap');
    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div>Loading...</div>';
    try {
        const res = await api('GET', API.feedbacks);
        const fbs = await res.json();
        if (!fbs.length) {
            wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div>No feedback yet.</div>';
            return;
        }
        wrap.innerHTML = `
      <table class="inbox-table">
        <thead><tr><th>ID</th><th>Name</th><th>Message</th><th>Submitted</th><th>Action</th></tr></thead>
        <tbody>
          ${fbs.map(f => `
          <tr>
            <td><code style="font-size:0.72rem;color:#64748B">#${f.id}</code></td>
            <td><strong>${esc(f.name)}</strong></td>
            <td style="max-width:300px">${esc(f.message)}</td>
            <td style="font-size:0.78rem;color:#94A3B8;white-space:nowrap">${f.timestamp}</td>
            <td><button class="action-btn delete" onclick="deleteFeedback('${f.id}')">🗑 Delete</button></td>
          </tr>`).join('')}
        </tbody>
      </table>`;
    } catch {
        wrap.innerHTML = '<div class="empty-state"><div class="empty-icon">❌</div>Failed to load feedback.</div>';
    }
}

async function deleteFeedback(id) {
    if (!confirm('Delete this feedback?')) return;
    await api('POST', API.deleteFeedback, { id });
    toast('Feedback deleted', 'success');
    loadFeedback();
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    t.innerHTML = `<span>${icons[type] || '✅'}</span> ${msg}`;
    c.appendChild(t);
    setTimeout(() => {
        t.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => t.remove(), 300);
    }, 3000);
}

// ── Utils ──────────────────────────────────────────────────────────────────────
function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
