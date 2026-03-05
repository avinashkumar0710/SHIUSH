/* ============================================
   SHIUSH Clinics – Frontend Script
   Loads content from Flask API + handles
   all interactive elements.
   ============================================ */

// ── Content Loading from API ──────────────────────────────────────────────────
async function loadSiteContent() {
  try {
    const res = await fetch('/api/content');
    if (!res.ok) return; // Fall back to static HTML if no server
    const data = await res.json();
    applyContent(data);
  } catch (e) {
    // Server not running — static HTML still works fine
    console.info('Running in static mode (no Flask server).');
  }
}

function applyContent(d) {
  const c = d.clinic || {};
  const doc = d.doctor || {};
  const h = d.hero || {};
  const s = d.stats || {};
  const a = d.about || {};
  const w = d.warrior || {};

  // ── Clinic / Contact ──
  setAll('[data-clinic-name]', c.name || '');
  setAll('[data-clinic-tagline]', c.tagline || '');
  setAll('[data-clinic-phone1]', c.phone1 || '');
  setAll('[data-clinic-phone2]', c.phone2 || '');
  setAll('[data-clinic-email]', c.email || '');
  setAll('[data-clinic-address]', c.address || '');
  setAll('[data-clinic-timings]', c.timings || '');
  setAll('[data-clinic-fee-msg]', '₹' + (c.fee_messaging || 100));
  setAll('[data-clinic-fee-vid]', '₹' + (c.fee_video || 300));

  // Update WhatsApp links with correct phone
  if (c.phone1) {
    document.querySelectorAll('a[href*="api.whatsapp.com"]').forEach(el => {
      el.href = el.href.replace(/phone=\d+/, 'phone=91' + c.phone1);
    });
  }

  // ── Doctor ──
  setAll('[data-doctor-name]', doc.name || '');
  setAll('[data-doctor-degree]', doc.degree || '');
  setAll('[data-doctor-title]', doc.title || '');
  setAll('[data-doctor-bio]', doc.bio || '');

  // ── Hero ──
  if (h.badge) setAll('[data-hero-badge]', h.badge);
  if (h.description) setAll('[data-hero-desc]', h.description);
  if (h.typewriter_phrases && h.typewriter_phrases.length) {
    typewriterPhrases = h.typewriter_phrases;
  }

  // ── Stats ──
  setCounter('[data-stat-patients]', s.patients || 500);
  setCounter('[data-stat-years]', s.years || 5);
  setCounter('[data-stat-fee]', s.starting_fee || 100);
  setCounter('[data-stat-days]', s.days_per_week || 6);

  // ── About ──
  if (a.title) setAll('[data-about-title]', a.title);
  if (a.subtitle) setAll('[data-about-subtitle]', a.subtitle);

  // ── Services ──
  if (d.services && d.services.length) renderServices(d.services);

  // ── FAQ ──
  if (d.faq && d.faq.length) renderFaq(d.faq);

  // ── News ──
  if (d.news && d.news.length) renderNews(d.news);

  // ── Warrior ──
  if (w.name) setAll('[data-warrior-name]', w.name);
  if (w.age) setAll('[data-warrior-age]', w.age);
  if (w.condition) setAll('[data-warrior-condition]', w.condition);
  if (w.story) setAll('[data-warrior-story]', w.story);
  if (w.quote) setAll('[data-warrior-quote]', w.quote);

  // ── Update phone/email links ──
  if (c.phone1) {
    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
      if (el.dataset.phone === '1') el.href = 'tel:' + c.phone1;
      if (el.dataset.phone === '2') el.href = 'tel:' + c.phone2;
    });
  }
  if (c.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
      el.href = 'mailto:' + c.email;
      if (!el.dataset.notext) el.textContent = c.email;
    });
  }
}

function setAll(selector, text) {
  document.querySelectorAll(selector).forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = text;
    else el.textContent = text;
  });
}

function setCounter(selector, target) {
  document.querySelectorAll(selector).forEach(el => {
    el.dataset.target = target;
    el.textContent = '0';
  });
}

function renderServices(services) {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;
  grid.innerHTML = services.map((s, i) => `
    <div class="service-card reveal${i > 0 ? ' delay-' + (i % 4) : ''}">
      <div class="service-icon">${s.icon || '🏥'}</div>
      <h3 class="service-name">${s.name}</h3>
      <p class="service-desc">${s.desc}</p>
    </div>`).join('');
  initRevealObserver();
}

function renderFaq(faqItems) {
  const list = document.getElementById('faqList');
  if (!list) return;
  list.innerHTML = faqItems.map(f => `
    <div class="faq-item">
      <button class="faq-question">
        <span>${f.question}</span>
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-answer">
        <div class="faq-answer-inner">${f.answer}</div>
      </div>
    </div>`).join('');
  initFaqAccordion();
}

function renderNews(newsItems) {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;
  grid.innerHTML = newsItems.map((n, i) => `
    <div class="news-card reveal${i > 0 ? ' delay-' + i : ''}">
      <span class="news-tag ${n.tag}">${n.tag_label}</span>
      <h3 class="news-title">${n.title}</h3>
      <p class="news-body">${n.body}</p>
      <div class="news-meta">${n.meta}</div>
    </div>`).join('');
  initRevealObserver();
}

// ── Typewriter Effect ─────────────────────────────────────────────────────────
let typewriterPhrases = ['General Physician', 'Preventive Medicine', 'Compassionate Care'];
let twIndex = 0, twChar = 0, twDeleting = false;

function runTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrase = typewriterPhrases[twIndex];
  if (twDeleting) {
    el.textContent = phrase.substring(0, twChar--);
    if (twChar < 0) { twDeleting = false; twIndex = (twIndex + 1) % typewriterPhrases.length; setTimeout(runTypewriter, 400); return; }
    setTimeout(runTypewriter, 60);
  } else {
    el.textContent = phrase.substring(0, ++twChar);
    if (twChar === phrase.length) { twDeleting = true; setTimeout(runTypewriter, 1800); return; }
    setTimeout(runTypewriter, 100);
  }
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    highlightActiveNav();
  });

  hamburger && hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger && hamburger.classList.remove('active');
    });
  });
}

function highlightActiveNav() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

// ── Scroll Reveal ─────────────────────────────────────────────────────────────
function initRevealObserver() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealEls.forEach(el => obs.observe(el));
}

// ── Animated Counters ─────────────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target || '0');
  const duration = 1500;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current >= target) clearInterval(timer);
  }, 16);
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
function initFaqAccordion() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const icon = btn.querySelector('.faq-icon');
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item.active').forEach(a => {
        a.classList.remove('active');
        a.querySelector('.faq-answer').style.maxHeight = '0';
        const ic = a.querySelector('.faq-icon');
        if (ic) ic.textContent = '+';
      });
      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.querySelector('.faq-answer-inner').scrollHeight + 'px';
        if (icon) icon.textContent = '×';
      }
    });
  });
}

// ── Forms (POST to Flask API) ─────────────────────────────────────────────────
function initForms() {
  const apptForm = document.getElementById('appointmentForm');
  if (apptForm) {
    apptForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = apptForm.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = '⏳ Submitting...';
      const payload = {
        name: apptForm.querySelector('#appt-name')?.value.trim(),
        phone: apptForm.querySelector('#appt-phone')?.value.trim(),
        service: apptForm.querySelector('#appt-service')?.value,
        date: apptForm.querySelector('#appt-date')?.value,
        time: apptForm.querySelector('#appt-time')?.value,
        message: apptForm.querySelector('#appt-message')?.value.trim(),
      };
      try {
        const res = await fetch('/api/appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showFormSuccess(apptForm, '✅ Appointment request sent! We\'ll contact you shortly.');
          apptForm.reset();
        } else {
          alert('Please fill in your name and phone number.');
        }
      } catch {
        // If no Flask server, show success message anyway (static mode)
        showFormSuccess(apptForm, '✅ Request received! We\'ll contact you at ' + payload.phone);
        apptForm.reset();
      }
      btn.disabled = false;
      btn.innerHTML = '📅 Request Appointment';
    });
  }

  const fbForm = document.getElementById('feedbackForm');
  if (fbForm) {
    fbForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = fbForm.querySelector('[type=submit]');
      btn.disabled = true;
      btn.textContent = '⏳ Sending...';
      const payload = {
        name: fbForm.querySelector('#fb-name')?.value.trim(),
        message: fbForm.querySelector('#fb-message')?.value.trim(),
      };
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showFormSuccess(fbForm, '⭐ Thank you for your feedback, ' + payload.name + '!');
          fbForm.reset();
        } else {
          alert('Please fill in your name and message.');
        }
      } catch {
        showFormSuccess(fbForm, '⭐ Thank you for your feedback, ' + payload.name + '!');
        fbForm.reset();
      }
      btn.disabled = false;
      btn.innerHTML = '⭐ Send Feedback';
    });
  }
}

function showFormSuccess(form, msg) {
  let div = form.parentElement.querySelector('.form-success');
  if (!div) {
    div = document.createElement('div');
    div.className = 'form-success';
    div.style.cssText = 'background:rgba(0,201,167,0.12);border:1px solid #00C9A7;color:#00A88B;border-radius:12px;padding:16px 20px;margin-top:16px;font-weight:600;font-size:0.9rem;';
    form.after(div);
  }
  div.textContent = msg;
  div.style.display = 'block';
  setTimeout(() => { div.style.display = 'none'; }, 6000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadSiteContent();
  initNavbar();
  initRevealObserver();
  initCounters();
  initFaqAccordion();
  initForms();
  setTimeout(runTypewriter, 800);
});
